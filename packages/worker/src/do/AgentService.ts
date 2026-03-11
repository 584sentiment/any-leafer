/**
 * AI Agent 服务
 * 处理聊天请求并返回 Action 流
 */

import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'
import type { AIModelType, AgentAction } from '@resume-editor/shared'
import { AgentActionSchema, ACTION_TYPES } from '@resume-editor/shared'
import { buildSystemPrompt } from '../prompt/systemPrompt'

/**
 * 模型配置
 */
const MODEL_CONFIG: Record<AIModelType, { provider: string; modelId: string }> = {
  'claude-sonnet-4.5': { provider: 'anthropic', modelId: 'claude-sonnet-4-5-20250514' },
  'claude-opus-4.5': { provider: 'anthropic', modelId: 'claude-opus-4-5-20250514' },
  'gpt-4o': { provider: 'openai', modelId: 'gpt-4o' },
  'gpt-4o-mini': { provider: 'openai', modelId: 'gpt-4o-mini' },
  'gemini-2.0-flash': { provider: 'google', modelId: 'gemini-2.0-flash' },
  'gemini-2.0-pro': { provider: 'google', modelId: 'gemini-2.0-pro-exp-02-05' },
}

/**
 * 获取模型实例
 */
function getModel(modelType: AIModelType) {
  const config = MODEL_CONFIG[modelType]
  if (!config) {
    throw new Error(`Unknown model: ${modelType}`)
  }

  switch (config.provider) {
    case 'anthropic':
      return anthropic(config.modelId)
    case 'openai':
      return openai(config.modelId)
    case 'google':
      return google(config.modelId)
    default:
      throw new Error(`Unknown provider: ${config.provider}`)
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
export async function handleChatRequest(request: AgentServiceRequest): Promise<ReadableStream> {
  const { messages, model, context, mode = 'edit' } = request

  // 获取模型
  const aiModel = getModel(model)

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
 */
function extractActionsFromBuffer(buffer: string): AgentAction[] {
  const actions: AgentAction[] = []
  const jsonPattern = /\{[^{}]*"_type"\s*:\s*"[^"]+\"[^{}]*\}/g
  let match

  while ((match = jsonPattern.exec(buffer)) !== null) {
    try {
      const parsed = JSON.parse(match[0])
      const validated = AgentActionSchema.safeParse(parsed)
      if (validated.success) {
        actions.push(validated.data)
      }
    } catch {
      // 忽略解析错误
    }
  }

  return actions
}

/**
 * 清理已处理的 buffer
 */
function cleanProcessedBuffer(buffer: string): string {
  // 移除已解析的 JSON 对象
  return buffer.replace(/\{[^{}]*"_type"\s*:\s*"[^"]+\"[^{}]*\}/g, '')
}
