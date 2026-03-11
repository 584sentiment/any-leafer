/**
 * ChatPanel - AI 聊天面板组件
 */

import React, { useState, useRef, useEffect } from 'react'
import type { ChatMessage } from '@resume-editor/shared'

export interface ChatPanelProps {
  /** 聊天历史 */
  messages: ChatMessage[]
  /** 是否正在处理 */
  isProcessing: boolean
  /** 发送消息回调 */
  onSendMessage: (content: string) => void
  /** 取消请求回调 */
  onCancel?: () => void
  /** 自定义类名 */
  className?: string
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  isProcessing,
  onSendMessage,
  onCancel,
  className,
}) => {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 处理发送
  const handleSend = () => {
    if (input.trim() && !isProcessing) {
      onSendMessage(input.trim())
      setInput('')
    }
  }

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 8,
        border: '1px solid #e0e0e0',
        ...(!className ? {} : undefined),
      }}
    >
      {/* 消息列表 */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: 16,
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              color: '#999',
              padding: 32,
            }}
          >
            <p>开始与 AI 对话来编辑你的简历</p>
            <p style={{ fontSize: 12, marginTop: 8 }}>
              试试说："添加一个标题，内容是我的名字"
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              style={{
                marginBottom: 12,
                display: 'flex',
                justifyContent:
                  message.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '80%',
                  padding: '8px 12px',
                  borderRadius: 12,
                  backgroundColor:
                    message.role === 'user' ? '#1890ff' : '#f0f0f0',
                  color: message.role === 'user' ? '#fff' : '#333',
                }}
              >
                <div style={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    opacity: 0.7,
                    marginTop: 4,
                  }}
                >
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div
        style={{
          padding: 12,
          borderTop: '1px solid #e0e0e0',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 8,
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            disabled={isProcessing}
            data-testid="chat-input"
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #d9d9d9',
              borderRadius: 6,
              fontSize: 14,
              outline: 'none',
            }}
          />
          {isProcessing ? (
            <button
              onClick={onCancel}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ff4d4f',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              取消
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              style={{
                padding: '8px 16px',
                backgroundColor: input.trim() ? '#1890ff' : '#d9d9d9',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: input.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              发送
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
