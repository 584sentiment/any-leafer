/**
 * ChatPanel - AI 聊天面板组件
 */

import React, { useState, useRef, useEffect } from 'react'
import type { ChatMessage, TaskStep, TaskStepStatus } from '@resume-editor/shared'
import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react'

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

/**
 * 获取步骤状态图标
 */
const getStatusIcon = (status: TaskStepStatus) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 size={14} color="#52c41a" />
    case 'in_progress':
      return <Loader2 size={14} color="#1890ff" className="animate-spin" />
    case 'failed':
      return <XCircle size={14} color="#ff4d4f" />
    default:
      return <Circle size={14} color="#d9d9d9" />
  }
}

/**
 * 任务步骤列表组件
 */
const TaskStepsView: React.FC<{ steps: TaskStep[] }> = ({ steps }) => {
  if (!steps || steps.length === 0) return null

  const completedCount = steps.filter((s) => s.status === 'completed').length
  const totalCount = steps.length

  return (
    <div
      style={{
        marginTop: 8,
        padding: 8,
        backgroundColor: '#fafafa',
        borderRadius: 6,
        border: '1px solid #e8e8e8',
      }}
    >
      {/* 进度标题 */}
      <div
        style={{
          fontSize: 12,
          color: '#666',
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Loader2 size={12} className="animate-spin" />
        <span>
          任务进度: {completedCount}/{totalCount}
        </span>
      </div>

      {/* 步骤列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {steps.map((step, index) => (
          <div
            key={step.id || index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 0',
              opacity: step.status === 'pending' ? 0.6 : 1,
            }}
          >
            {getStatusIcon(step.status)}
            <span
              style={{
                fontSize: 12,
                color: step.status === 'completed' ? '#52c41a' : '#333',
                textDecoration: step.status === 'completed' ? 'line-through' : 'none',
              }}
            >
              {step.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
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
                  maxWidth: '90%',
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

                {/* 任务步骤展示 */}
                {message.taskSteps && message.taskSteps.length > 0 && (
                  <TaskStepsView steps={message.taskSteps} />
                )}

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
