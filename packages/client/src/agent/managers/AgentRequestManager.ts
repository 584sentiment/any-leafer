/**
 * AgentRequestManager - AI 请求管理器
 * 管理与 AI 服务的通信
 */

import type { AgentAction, AIModelType, Streaming } from '@resume-editor/shared'
import { createStreaming, AgentActionSchema } from '@resume-editor/shared'

export interface RequestManagerConfig {
  /** API 端点 */
  apiEndpoint: string
  /** 默认模型 */
  defaultModel: AIModelType
  /** 请求超时时间（毫秒） */
  timeout?: number
}

export interface ChatRequest {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  model?: AIModelType
  context?: string
}

export interface StreamCallbacks {
  onStart?: () => void
  onAction?: (action: Streaming<AgentAction>) => void
  onComplete?: (actions: AgentAction[]) => void
  onError?: (error: Error) => void
}

export class AgentRequestManager {
  private apiEndpoint: string
  private defaultModel: AIModelType
  private timeout: number
  private abortController: AbortController | null = null

  constructor(config: RequestManagerConfig) {
    this.apiEndpoint = config.apiEndpoint
    this.defaultModel = config.defaultModel
    this.timeout = config.timeout ?? 60000
  }

  /**
   * 发送聊天请求（流式响应）
   */
  async sendChatRequest(request: ChatRequest, callbacks: StreamCallbacks): Promise<void> {
    this.abortController = new AbortController()

    const url = `${this.apiEndpoint}/chat`

    try {
      callbacks.onStart?.()

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: request.messages,
          model: request.model || this.defaultModel,
          context: request.context,
        }),
        signal: this.abortController.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      const actions: AgentAction[] = []
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // 解析流式数据
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)

              // 处理 Action
              if (parsed.action) {
                const streaming = createStreaming(
                  parsed.action,
                  parsed.isComplete ?? false
                )
                callbacks.onAction?.(streaming)

                if (streaming.isComplete) {
                  actions.push(streaming.data)
                }
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }

      callbacks.onComplete?.(actions)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // 请求被取消
        return
      }
      callbacks.onError?.(error instanceof Error ? error : new Error(String(error)))
    } finally {
      this.abortController = null
    }
  }

  /**
   * 取消当前请求
   */
  cancelRequest(): void {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
  }

  /**
   * 检查是否有正在进行的请求
   */
  isRequesting(): boolean {
    return this.abortController !== null
  }

  /**
   * 设置 API 端点
   */
  setApiEndpoint(endpoint: string): void {
    this.apiEndpoint = endpoint
  }

  /**
   * 设置默认模型
   */
  setDefaultModel(model: AIModelType): void {
    this.defaultModel = model
  }
}
