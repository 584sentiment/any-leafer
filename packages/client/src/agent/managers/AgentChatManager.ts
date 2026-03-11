/**
 * AgentChatManager - 聊天历史管理器
 * 管理与 AI 的对话历史
 */

import { v4 as uuidv4 } from 'uuid'
import type { ChatMessage, ChatRole } from '@resume-editor/shared'

export interface ChatManagerConfig {
  /** 最大消息数量 */
  maxMessages: number
}

export class AgentChatManager {
  private messages: ChatMessage[] = []
  private config: ChatManagerConfig

  constructor(config: Partial<ChatManagerConfig> = {}) {
    this.config = {
      maxMessages: 100,
      ...config,
    }
  }

  /**
   * 添加用户消息
   */
  addUserMessage(content: string): ChatMessage {
    return this.addMessage('user', content)
  }

  /**
   * 添加助手消息
   */
  addAssistantMessage(content: string, actions?: string[]): ChatMessage {
    return this.addMessage('assistant', content, actions)
  }

  /**
   * 添加系统消息
   */
  addSystemMessage(content: string): ChatMessage {
    return this.addMessage('system', content)
  }

  /**
   * 添加消息
   */
  private addMessage(
    role: ChatRole,
    content: string,
    actions?: string[]
  ): ChatMessage {
    const message: ChatMessage = {
      id: uuidv4(),
      role,
      content,
      timestamp: Date.now(),
      actions,
    }

    this.messages.push(message)

    // 限制消息数量
    if (this.messages.length > this.config.maxMessages) {
      this.messages = this.messages.slice(-this.config.maxMessages)
    }

    return message
  }

  /**
   * 获取所有消息
   */
  getMessages(): ChatMessage[] {
    return [...this.messages]
  }

  /**
   * 获取最近 N 条消息
   */
  getRecentMessages(count: number): ChatMessage[] {
    return this.messages.slice(-count)
  }

  /**
   * 获取用于 API 的消息格式
   */
  getMessagesForAPI(): Array<{ role: ChatRole; content: string }> {
    return this.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))
  }

  /**
   * 清空消息历史
   */
  clear(): void {
    this.messages = []
  }

  /**
   * 获取消息数量
   */
  getLength(): number {
    return this.messages.length
  }

  /**
   * 获取最后一条消息
   */
  getLastMessage(): ChatMessage | null {
    return this.messages[this.messages.length - 1] || null
  }

  /**
   * 更新最后一条消息
   */
  updateLastMessage(content: string): ChatMessage | null {
    const lastMessage = this.messages[this.messages.length - 1]
    if (lastMessage) {
      lastMessage.content = content
      lastMessage.timestamp = Date.now() // 更新时间戳
      return lastMessage
    }
    return null
  }
}
