/**
 * LangGraph Agent 执行器
 * 定义执行图和节点实现
 */

import { ChatOpenAI } from '@langchain/openai'
import { ChatAnthropic } from '@langchain/anthropic'
import { StateGraph, END, START } from '@langchain/langgraph'
import { SystemMessage, HumanMessage } from '@langchain/core/messages'
import type { AIModelType, AgentAction } from '@resume-editor/shared'
import { AgentActionSchema } from '@resume-editor/shared'
import {
  AgentStateAnnotation,
  type AgentState,
  createInitialState,
  getCurrentStep,
  areAllStepsCompleted,
  hasMoreSteps,
} from './schemas/agentState'
import { getCanvasTools } from './tools/canvasTools'
import { buildAgentSystemPrompt, getPlanningPrompt, getStepExecutionPrompt } from './prompts/agentPrompt'
import { createValidator } from './ActionValidator'

import type { Env } from './schemas/agentState'

/**
 * 模型配置
 */
const MODEL_CONFIG: Record<AIModelType, { provider: string; modelId: string }> = {
  'deepseek-chat': { provider: 'openai', modelId: 'deepseek-chat' },
  'deepseek-reasoner': { provider: 'openai', modelId: 'deepseek-reasoner' },
  'gpt-4o': { provider: 'openai', modelId: 'gpt-4o' },
  'gpt-4o-mini': { provider: 'openai', modelId: 'gpt-4o-mini' },
  'claude-sonnet-4.5': { provider: 'anthropic', modelId: 'claude-sonnet-4-5-20250514' },
  'claude-opus-4.5': { provider: 'anthropic', modelId: 'claude-opus-4-5-20250514' },
  'gemini-2.0-flash': { provider: 'openai', modelId: 'gemini-2.0-flash' },
  'gemini-2.0-pro': { provider: 'openai', modelId: 'gemini-2.0-pro-exp-02-05' },
}

/**
 * 获取 LLM 实例
 */
function getLLM(modelType: AIModelType, env?: Env) {
  const config = MODEL_CONFIG[modelType]
  if (!config) {
    throw new Error(`Unknown model: ${modelType}`)
  }

  if (config.provider === 'openai') {
    const baseURL =
      modelType.startsWith('deepseek') || modelType.startsWith('gemini')
        ? modelType.startsWith('deepseek')
          ? 'https://api.deepseek.com'
          : 'https://generativelanguage.googleapis.com/v1beta'
        : undefined

    const apiKey = env?.OPENAI_API_KEY || env?.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error(`API key not found for model: ${modelType}`)
    }

    return new ChatOpenAI({
      modelName: config.modelId,
      temperature: 0.7,
      openAIApiKey: apiKey,
      configuration: baseURL ? { baseURL } : undefined,
    })
  }

  if (config.provider === 'anthropic') {
    const apiKey = env?.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error(`API key not found for model: ${modelType}`)
    }

    return new ChatAnthropic({
      modelName: config.modelId,
      temperature: 0.7,
      anthropicApiKey: apiKey,
    })
  }

  throw new Error(`Unsupported provider: ${config.provider}`)
}

/**
 * 从 AI 响应中提取 Actions
 */
function extractActionsFromText(text: string): AgentAction[] {
  const actions: AgentAction[] = []
  const jsonRegex = /\{[\s\S]*?"_type"[\s\S]*?\}/g
  let match

  while ((match = jsonRegex.exec(text)) !== null) {
    try {
      const jsonStr = extractCompleteJson(match[0], 0)
      if (jsonStr) {
        const parsed = JSON.parse(jsonStr)
        if (parsed._type) {
          const validated = AgentActionSchema.safeParse(parsed)
          if (validated.success) {
            actions.push(validated.data)
          }
        }
      }
    } catch {
      // 忽略解析错误
    }
  }

  return actions
}

/**
 * 从指定位置提取完整的 JSON 对象
 */
function extractCompleteJson(str: string, start: number = 0): string | null {
  let depth = 0
  let inString = false
  let escapeNext = false
  let jsonStart = -1

  for (let i = start; i < str.length; i++) {
    const char = str[i]
    if (escapeNext) {
      escapeNext = false
      continue
    }
    if (char === '\\') {
      escapeNext = true
      continue
    }
    if (char === '"') {
      inString = !inString
      continue
    }
    if (!inString) {
      if (char === '{') {
        if (depth === 0) jsonStart = i
        depth++
      } else if (char === '}') {
        depth--
        if (depth === 0 && jsonStart !== -1) {
          return str.slice(jsonStart, i + 1)
        }
      }
    }
  }
  return null
}

/**
 * 从响应中解析步骤
 */
function parseStepsFromResponse(response: string): Array<{ id: string; description: string }> {
  const steps: Array<{ id: string; description: string }> = []
  const lines = response.split('\n')
  let stepIndex = 1
  for (const line of lines) {
    const trimmed = line.trim()
    const match = trimmed.match(/^(?:\d+\.|[-*]|step\s*\d+[:：]?)\s*(.+)$/i)
    if (match) {
      steps.push({
        id: `step-${stepIndex}`,
        description: match[1].trim(),
      })
      stepIndex++
    }
  }
  if (steps.length === 0) {
    steps.push({
      id: 'step-1',
      description: '执行用户请求',
    })
  }
  return steps
}

/**
 * 执行器配置
 */
export interface ExecutorConfig {
  model: AIModelType
  env?: Env
  maxRetries?: number
}

/**
 * 创建 Agent 执行图
 */
export function createAgentGraph(config: ExecutorConfig) {
  const llm = getLLM(config.model, config.env)
  const validator = createValidator({ maxRetries: config.maxRetries || 3 })
  const tools = getCanvasTools()

  // 规划节点
  const planNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    // 如果已有任务规划，跳过规划
    if (state.taskPlan.steps.length > 0) {
      return {}
    }

    const planningPrompt = getPlanningPrompt(state.userRequest, state.canvasContext)
    const systemPrompt = buildAgentSystemPrompt(state.mode)
    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(planningPrompt),
    ]

    const response = await llm.invoke(messages)
    const responseText = response.content.toString()

    // 解析步骤
    const steps = parseStepsFromResponse(responseText)

    // 创建 task-plan Action
    const taskPlanAction: AgentAction = {
      _type: 'task-plan',
      intent: '规划任务步骤',
      steps: steps.map((s) => ({ id: s.id, description: s.description })),
    }

    return {
      taskPlan: {
        steps: steps.map((s) => ({ ...s, status: 'pending' as const })),
        currentStepIndex: 0,
      },
      executedActions: [...state.executedActions, taskPlanAction],
    }
  }

  // 执行节点
  const executeNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const currentStep = getCurrentStep(state)
    if (!currentStep) {
      return { shouldContinue: false }
    }

    // 获取已执行操作的描述
    const previousActionDescs = state.executedActions
      .filter((a) => !['task-plan', 'task-progress'].includes(a._type))
      .map((a) => JSON.stringify(a))

    // 构建执行提示词
    const executionPrompt = getStepExecutionPrompt(
      currentStep.description,
      state.canvasContext,
      previousActionDescs
    )
    const systemPrompt = buildAgentSystemPrompt(state.mode)

    // 更新步骤状态为进行中
    const updatedSteps = [...state.taskPlan.steps]
    updatedSteps[state.taskPlan.currentStepIndex] = {
      ...currentStep,
      status: 'in_progress',
    }

    // 创建进度 Action
    const progressAction: AgentAction = {
      _type: 'task-progress',
      stepId: currentStep.id,
      status: 'in_progress',
    }

    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(executionPrompt),
    ]

    // 添加历史对话
    if (state.executedActions.length > 0) {
      const historyText = state.executedActions
        .filter((a) => !['task-plan', 'task-progress'].includes(a._type))
        .map((a) => `已执行: ${JSON.stringify(a)}`)
        .join('\n')
      if (historyText) {
        messages.push(new HumanMessage(`历史操作:\n${historyText}`))
      }
    }

    // 调用 LLM
    const response = await llm.invoke(messages)
    const responseText = typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content)

    // 提取 Actions
    let actions: AgentAction[] = []

    // 从工具调用中提取
    if (response.tool_calls && response.tool_calls.length > 0) {
      for (const toolCall of response.tool_calls) {
        try {
          const args = toolCall.args as Record<string, unknown>
          if (args && typeof args === 'object') {
            // 工具调用的参数可能包含 action
            const actionStr = JSON.stringify(args)
            const extractedActions = extractActionsFromText(actionStr)
            actions.push(...extractedActions)
          }
        } catch {
          // 忽略解析错误
        }
      }
    }

    // 从文本中提取 Actions
    const textActions = extractActionsFromText(responseText)
    actions = [...actions, ...textActions]

    // 去重
    const uniqueActions = actions.filter(
      (action, index, self) =>
        index === self.findIndex((a) => JSON.stringify(a) === JSON.stringify(action))
    )

    // 更新步骤状态为完成
    updatedSteps[state.taskPlan.currentStepIndex] = {
      ...updatedSteps[state.taskPlan.currentStepIndex],
      status: 'completed',
    }

    // 创建完成进度 Action
    const completedProgressAction: AgentAction = {
      _type: 'task-progress',
      stepId: currentStep.id,
      status: 'completed',
    }

    return {
      taskPlan: {
        ...state.taskPlan,
        steps: updatedSteps,
      },
      executedActions: [...state.executedActions, progressAction, ...uniqueActions, completedProgressAction],
    }
  }

  // 推进节点 - 移动到下一步
  const advanceNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const nextIndex = state.taskPlan.currentStepIndex + 1

    // 检查是否还有更多步骤
    if (nextIndex >= state.taskPlan.steps.length) {
      return { shouldContinue: false }
    }

    return {
      taskPlan: {
        ...state.taskPlan,
        currentStepIndex: nextIndex,
      },
      retryCount: 0, // 重置重试计数
    }
  }

  // 创建状态图
  const workflow = new StateGraph(AgentStateAnnotation)
    // 添加节点
    .addNode('plan', planNode)
    .addNode('execute', executeNode)
    .addNode('advance', advanceNode)
    // 设置入口
    .addEdge(START, 'plan')
    // 规划后执行
    .addEdge('plan', 'execute')
    // 执行后判断
    .addConditionalEdges('execute', (state: AgentState) => {
      // 检查是否所有步骤都完成
      if (areAllStepsCompleted(state)) {
        return END
      }
      // 如果还有更多步骤，推进到下一步
      if (hasMoreSteps(state)) {
        return 'advance'
      }
      return END
    })
    // 推进后继续执行
    .addEdge('advance', 'execute')

  return workflow.compile()
}

/**
 * 执行 Agent 并流式返回结果
 */
export async function* executeAgentStream(
  userRequest: string,
  canvasContext: string,
  mode: 'edit' | 'template' | 'assistant',
  config: ExecutorConfig
): AsyncGenerator<{ action?: AgentAction; done: boolean; message?: string; error?: string }> {
  const graph = createAgentGraph(config)
  const initialState = createInitialState(userRequest, canvasContext, mode, config.maxRetries)

  try {
    // 执行图
    const result = await graph.invoke(initialState)

    // 流式返回所有执行的 Actions
    for (const action of result.executedActions) {
      yield { action, done: false }
    }

    // 返回最终消息
    yield {
      action: {
        _type: 'message',
        intent: '任务完成',
        message: result.finalMessage || '任务执行完成',
      },
      done: true,
      message: result.finalMessage,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    yield {
      done: true,
      error: errorMessage,
    }
  }
}

/**
 * 执行 Agent 并返回完整结果
 */
export async function executeAgent(
  userRequest: string,
  canvasContext: string,
  mode: 'edit' | 'template' | 'assistant',
  config: ExecutorConfig
): Promise<{
  actions: AgentAction[]
  message: string
  error?: string
}> {
  const actions: AgentAction[] = []
  let message = ''
  let error: string | undefined

  for await (const result of executeAgentStream(userRequest, canvasContext, mode, config)) {
    if (result.action) {
      actions.push(result.action)
    }
    if (result.message) {
      message = result.message
    }
    if (result.error) {
      error = result.error
    }
  }

  return { actions, message, error }
}
