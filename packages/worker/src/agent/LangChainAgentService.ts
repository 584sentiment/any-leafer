/**
 * LangChain Agent 服务
 * 整合 LangChain 和 LangGraph，提供可靠的 Agent 执行循环
 */

import type { AIModelType, AgentAction } from '@resume-editor/shared'
import { executeAgentStream, executeAgent, type Env, type ExecutorConfig } from './AgentExecutor'
import { ActionValidator, createValidator } from './ActionValidator'

/**
 * LangChain Agent 服务配置
 */
export interface LangChainAgentConfig {
  /** AI 模型类型 */
  model: AIModelType
  /** 环境变量 */
  env?: Env
  /** 最大重试次数 */
  maxRetries?: number
  /** 是否启用验证 */
  enableValidation?: boolean
}

/**
 * Agent 服务请求
 */
export interface LangChainAgentRequest {
  /** 用户消息 */
  message: string
  /** 画布上下文 */
  canvasContext?: string
  /** 模式 */
  mode?: 'edit' | 'template' | 'assistant'
  /** 对话历史 */
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
}

/**
 * 流式响应事件
 */
export interface StreamEvent {
  /** 事件类型 */
  type: 'action' | 'progress' | 'message' | 'error' | 'done'
  /** Action 数据 */
  action?: AgentAction
  /** 进度信息 */
  progress?: {
    stepId: string
    status: string
    description?: string
  }
  /** 消息内容 */
  message?: string
  /** 错误信息 */
  error?: string
  /** 验证报告 */
  validationReport?: {
    totalSteps: number
    completedSteps: number
    failedSteps: number
    issues: string[]
  }
}

/**
 * LangChain Agent 服务
 * 提供基于 LangGraph 的可靠 Agent 执行
 */
export class LangChainAgentService {
  private config: LangChainAgentConfig
  private validator: ActionValidator

  constructor(config: LangChainAgentConfig) {
    this.config = {
      maxRetries: 3,
      enableValidation: true,
      ...config,
    }
    this.validator = createValidator({ maxRetries: this.config.maxRetries })
  }

  /**
   * 处理聊天请求（流式响应）
   */
  async handleChatStream(request: LangChainAgentRequest): Promise<ReadableStream> {
    const { message, canvasContext = '', mode = 'edit' } = request

    const encoder = new TextEncoder()

    return new ReadableStream({
      start: async (controller) => {
        try {
          const executorConfig: ExecutorConfig = {
            model: this.config.model,
            env: this.config.env,
            maxRetries: this.config.maxRetries,
          }

          // 执行 Agent 并流式返回结果
          for await (const result of executeAgentStream(
            message,
            canvasContext,
            mode,
            executorConfig
          )) {
            const event: StreamEvent = result.done
              ? { type: 'done', message: result.message, error: result.error }
              : { type: 'action', action: result.action }

            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
          }

          controller.close()
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          const event: StreamEvent = {
            type: 'error',
            error: errorMessage,
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
          controller.close()
        }
      },
    })
  }

  /**
   * 处理聊天请求（完整响应）
   */
  async handleChat(request: LangChainAgentRequest): Promise<{
    actions: AgentAction[]
    message: string
    error?: string
    validationReport?: {
      totalSteps: number
      completedSteps: number
      failedSteps: number
      issues: string[]
    }
  }> {
    const { message, canvasContext = '', mode = 'edit' } = request

    const executorConfig: ExecutorConfig = {
      model: this.config.model,
      env: this.config.env,
      maxRetries: this.config.maxRetries,
    }

    // 执行 Agent
    const result = await executeAgent(message, canvasContext, mode, executorConfig)

    // 生成验证报告
    let validationReport
    if (this.config.enableValidation && result.actions.length > 0) {
      // 从 actions 中提取 task-plan
      const taskPlanAction = result.actions.find((a) => a._type === 'task-plan')

      if (taskPlanAction && 'steps' in taskPlanAction) {
        // 构建简单的状态用于验证
        const mockState = {
          taskPlan: {
            steps: (taskPlanAction.steps as Array<{ id: string; description: string }>).map((s) => ({
              ...s,
              status: 'completed' as const,
            })),
            currentStepIndex: 0,
          },
          executedActions: result.actions,
          validationResults: [],
          userRequest: message,
          canvasContext,
          mode,
          shouldContinue: false,
          retryCount: 0,
          maxRetries: this.config.maxRetries || 3,
          finalMessage: result.message,
          error: null,
        }

        const report = this.validator.generateValidationReport(mockState)
        validationReport = {
          totalSteps: report.totalSteps,
          completedSteps: report.completedSteps,
          failedSteps: report.failedSteps,
          issues: report.issues,
        }
      }
    }

    return {
      actions: result.actions,
      message: result.message,
      error: result.error,
      validationReport,
    }
  }

  /**
   * 验证任务完成度
   */
  validateTaskCompletion(actions: AgentAction[]): {
    completed: boolean
    issues: string[]
  } {
    const taskPlanAction = actions.find((a) => a._type === 'task-plan')

    if (!taskPlanAction || !('steps' in taskPlanAction)) {
      return { completed: true, issues: [] }
    }

    const steps = taskPlanAction.steps as Array<{ id: string; description: string }>
    const progressActions = actions.filter((a) => a._type === 'task-progress')
    const completedStepIds = progressActions
      .filter((a) => 'status' in a && a.status === 'completed')
      .map((a) => (a as { stepId: string }).stepId)

    const issues: string[] = []
    for (const step of steps) {
      if (!completedStepIds.includes(step.id)) {
        issues.push(`步骤 "${step.description}" 未标记为完成`)
      }
    }

    return {
      completed: issues.length === 0,
      issues,
    }
  }
}

/**
 * 创建 LangChain Agent 服务实例
 */
export function createLangChainAgentService(config: LangChainAgentConfig): LangChainAgentService {
  return new LangChainAgentService(config)
}

/**
 * 快捷方法：处理聊天请求并返回流式响应
 */
export async function handleLangChainChatRequest(
  request: LangChainAgentRequest & { model: AIModelType },
  env?: Env
): Promise<ReadableStream> {
  const service = createLangChainAgentService({
    model: request.model,
    env,
    maxRetries: 3,
    enableValidation: true,
  })

  return service.handleChatStream(request)
}
