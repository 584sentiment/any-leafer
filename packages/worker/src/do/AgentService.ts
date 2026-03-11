/**
 * AI Agent 服务
 * 处理聊天请求并返回 Action 流
 */

import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import type { AIModelType, AgentAction } from '@resume-editor/shared'
import { AgentActionSchema, ACTION_TYPES } from '@resume-editor/shared'
import { buildSystemPrompt } from '../prompt/systemPrompt'

/**
 * 环境变量类型
 */
export interface Env {
  DEEPSEEK_API_KEY?: string
  OPENAI_API_KEY?: string
  ANTHROPIC_API_KEY?: string
  ENVIRONMENT: string
}

/**
 * 模型配置
 */
const MODEL_CONFIG: Record<AIModelType, { provider: string; modelId: string }> = {
  'deepseek-chat': { provider: 'deepseek', modelId: 'deepseek-chat' },
  'deepseek-reasoner': { provider: 'deepseek', modelId: 'deepseek-reasoner' },
  'gpt-4o': { provider: 'openai', modelId: 'gpt-4o' },
  'gpt-4o-mini': { provider: 'openai', modelId: 'gpt-4o-mini' },
  'claude-sonnet-4.5': { provider: 'anthropic', modelId: 'claude-sonnet-4-5-20250514' },
  'claude-opus-4.5': { provider: 'anthropic', modelId: 'claude-opus-4-5-20250514' },
  'gemini-2.0-flash': { provider: 'google', modelId: 'gemini-2.0-flash' },
  'gemini-2.0-pro': { provider: 'google', modelId: 'gemini-2.0-pro-exp-02-05' },
}

/**
 * 获取模型实例
 */
function getModel(modelType: AIModelType, env?: Env) {
  const config = MODEL_CONFIG[modelType]
  if (!config) {
    throw new Error(`Unknown model: ${modelType}`)
  }

  switch (config.provider) {
    case 'deepseek': {
      const deepseek = createOpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: env?.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY,
      })
      return deepseek(config.modelId)
    }
    case 'openai': {
      const openai = createOpenAI({
        apiKey: env?.OPENAI_API_KEY || process.env.OPENAI_API_KEY,
      })
      return openai(config.modelId)
    }
    default:
      throw new Error(`Unsupported provider: ${config.provider}. Currently only DeepSeek and OpenAI are supported.`)
  }
}

/**
 * Agent 服务请求
 */
export interface AgentServiceRequest {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  model: AIModelType
  context?: string
  mode?: 'edit' | 'template' | 'assistant'
}

/**
 * 处理聊天请求
 */
export async function handleChatRequest(request: AgentServiceRequest, env?: Env): Promise<ReadableStream> {
  const { messages, model, context, mode = 'edit' } = request

  // 获取模型
  const aiModel = getModel(model, env)

  // 构建系统提示词
  const systemPrompt = buildSystemPrompt(mode)

  // 添加上下文
  const contextMessage = context
    ? [{ role: 'system' as const, content: `当前画布状态:\n${context}` }]
    : []

  // 构建消息
  const fullMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...contextMessage,
    ...messages,
  ]

  // 流式响应
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = streamText({
          model: aiModel,
          messages: fullMessages,
          temperature: 0.7,
          maxTokens: 4096,
        })

        let buffer = ''

        for await (const chunk of result.textStream) {
          buffer += chunk

          // 尝试解析 JSON Action
          const actions = extractActionsFromBuffer(buffer)

          for (const action of actions) {
            const data = JSON.stringify({
              action,
              isComplete: true,
            })
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          }

          // 清理已处理的 buffer
          buffer = cleanProcessedBuffer(buffer)
        }

        // 发送完成信号
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`)
        )
        controller.close()
      }
    },
  })

  return stream
}

/**
 * 从 buffer 中提取完整的 Action
 * 支持嵌套的 JSON 对象
 */
function extractActionsFromBuffer(buffer: string): AgentAction[] {
  const actions: AgentAction[] = []

  // 查找所有可能的 JSON 对象起始位置
  let startIndex = 0
  while (startIndex < buffer.length) {
    // 查找包含 "_type" 的对象起始位置
    const objectStart = buffer.indexOf('{', startIndex)
    if (objectStart === -1) break

    // 尝试从该位置提取完整的 JSON 对象
    const jsonStr = extractCompleteJson(buffer, objectStart)
    if (jsonStr) {
      try {
        const parsed = JSON.parse(jsonStr)
        // 检查是否包含 _type 字段
        if (parsed._type) {
          const validated = AgentActionSchema.safeParse(parsed)
          if (validated.success) {
            actions.push(validated.data)
          }
        }
        startIndex = objectStart + jsonStr.length
      } catch {
        startIndex = objectStart + 1
      }
    } else {
      startIndex = objectStart + 1
    }
  }

  return actions
}

/**
 * 从指定位置提取完整的 JSON 对象
 */
function extractCompleteJson(str: string, start: number): string | null {
  if (str[start] !== '{') return null

  let depth = 0
  let inString = false
  let escapeNext = false

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
        depth++
      } else if (char === '}') {
        depth--
        if (depth === 0) {
          return str.slice(start, i + 1)
        }
      }
    }
  }

  return null
}

/**
 * 清理已处理的 buffer
 */
function cleanProcessedBuffer(buffer: string): string {
  // 移除已解析的完整 JSON 对象
  let result = buffer
  let startIndex = 0

  while (startIndex < result.length) {
    const objectStart = result.indexOf('{', startIndex)
    if (objectStart === -1) break

    const jsonStr = extractCompleteJson(result, objectStart)
    if (jsonStr) {
      try {
        const parsed = JSON.parse(jsonStr)
        if (parsed._type) {
          result = result.slice(0, objectStart) + result.slice(objectStart + jsonStr.length)
          continue
        }
      } catch {
        // 忽略解析错误
      }
    }
    startIndex = objectStart + 1
  }

  return result
}
