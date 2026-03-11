/**
 * ResumeEditor - 主编辑器组件
 * 整合画布、工具栏和聊天面板
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { LeaferCanvas, LeaferCanvasRef } from '../canvas/LeaferCanvas'
import { LeaferAgent, LeaferAgentState } from '../agent/LeaferAgent'
import { ChatPanel } from './ChatPanel'
import { Toolbar } from './Toolbar'
import type {
  AgentMode,
  AIModelType,
  ChatMessage,
  ResumeTemplate,
} from '@resume-editor/shared'

/**
 * ResumeEditor 配置
 */
export interface ResumeEditorProps {
  /** 画布宽度 */
  canvasWidth?: number
  /** 画布高度 */
  canvasHeight?: number
  /** API 端点 */
  apiEndpoint: string
  /** 默认模型 */
  defaultModel?: AIModelType
  /** 预加载的模板 */
  templates?: ResumeTemplate[]
  /** 聊天面板宽度 */
  chatWidth?: number
  /** 初始模式 */
  initialMode?: AgentMode
  /** 保存回调 */
  onSave?: (elements: any[]) => void
  /** 导出回调 */
  onExport?: (blob: Blob, format: string) => void
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({
  canvasWidth = 800,
  canvasHeight = 600,
  apiEndpoint,
  defaultModel = 'claude-sonnet-4.5',
  templates = [],
  chatWidth = 320,
  initialMode = 'edit',
  onSave,
  onExport,
  className,
  style,
}) => {
  const canvasRef = useRef<LeaferCanvasRef>(null)
  const agentRef = useRef<LeaferAgent | null>(null)

  const [agentState, setAgentState] = useState<LeaferAgentState>({
    mode: initialMode,
    model: defaultModel,
    isProcessing: false,
    canUndo: false,
    canRedo: false,
  })

  const [messages, setMessages] = useState<ChatMessage[]>([])

  // 初始化 Agent
  useEffect(() => {
    const editor = canvasRef.current?.getEditor()
    if (!editor) return

    const agent = new LeaferAgent({
      editor,
      apiEndpoint,
      defaultModel,
      templates,
    })

    agent.setCallbacks({
      onStateChange: (state) => {
        setAgentState(state)
      },
      onMessage: (message) => {
        setMessages((prev) => {
          // 更新或添加消息
          const index = prev.findIndex((m) => m.id === message.id)
          if (index >= 0) {
            const updated = [...prev]
            updated[index] = message
            return updated
          }
          return [...prev, message]
        })
      },
      onError: (error) => {
        console.error('Agent error:', error)
        // 添加错误消息
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: `发生错误: ${error.message}`,
            timestamp: Date.now(),
          },
        ])
      },
    })

    agentRef.current = agent

    return () => {
      // 清理
    }
  }, [apiEndpoint, defaultModel, templates])

  // 处理发送消息
  const handleSendMessage = useCallback((content: string) => {
    agentRef.current?.sendMessage(content)
  }, [])

  // 处理取消请求
  const handleCancel = useCallback(() => {
    agentRef.current?.cancelRequest()
  }, [])

  // 处理模式变化
  const handleModeChange = useCallback((mode: AgentMode) => {
    agentRef.current?.setMode(mode)
  }, [])

  // 处理模型变化
  const handleModelChange = useCallback((model: AIModelType) => {
    agentRef.current?.setModel(model)
  }, [])

  // 处理撤销
  const handleUndo = useCallback(() => {
    agentRef.current?.undo()
  }, [])

  // 处理重做
  const handleRedo = useCallback(() => {
    agentRef.current?.redo()
  }, [])

  // 处理导出
  const handleExport = useCallback(
    async (format: 'png' | 'jpg' | 'pdf') => {
      const blob = await agentRef.current?.exportCanvas({
        format,
        quality: 0.95,
      })
      if (blob && onExport) {
        onExport(blob, format)
      } else if (blob) {
        // 默认下载
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `resume.${format === 'pdf' ? 'pdf' : format}`
        a.click()
        URL.revokeObjectURL(url)
      }
    },
    [onExport]
  )

  // 处理清空
  const handleClear = useCallback(() => {
    if (window.confirm('确定要清空画布吗？')) {
      agentRef.current?.clearCanvas()
    }
  }, [])

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#f5f5f5',
        ...style,
      }}
    >
      {/* 工具栏 */}
      <Toolbar
        mode={agentState.mode}
        model={agentState.model}
        canUndo={agentState.canUndo}
        canRedo={agentState.canRedo}
        isProcessing={agentState.isProcessing}
        onModeChange={handleModeChange}
        onModelChange={handleModelChange}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onExport={handleExport}
        onClear={handleClear}
      />

      {/* 主内容区 */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {/* 画布区域 */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            overflow: 'auto',
          }}
        >
          <LeaferCanvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            backgroundColor="#ffffff"
            editable
            snap
          />
        </div>

        {/* 聊天面板 */}
        <div
          style={{
            width: chatWidth,
            borderLeft: '1px solid #e0e0e0',
          }}
        >
          <ChatPanel
            messages={messages}
            isProcessing={agentState.isProcessing}
            onSendMessage={handleSendMessage}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  )
}
