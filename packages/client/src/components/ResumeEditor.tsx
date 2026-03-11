/**
 * ResumeEditor - 主编辑器组件
 * 整合画布、工具栏和聊天面板
 */

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { LeaferCanvas, LeaferCanvasRef, DotMatrixConfig } from '../canvas/LeaferCanvas'
import { LeaferAgent, LeaferAgentState } from '../agent/LeaferAgent'
import { ChatPanel } from './ChatPanel'
import { Toolbar } from './Toolbar'
import { ElementToolbar, ToolConfig } from './ElementToolbar'
import type {
  AgentMode,
  AIModelType,
  ChatMessage,
  ResumeTemplate,
  ResumeElement,
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
  /** 点阵配置 */
  dotMatrix?: DotMatrixConfig
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
  defaultModel = 'deepseek-chat',
  templates = [],
  chatWidth = 320,
  initialMode = 'edit',
  dotMatrix = { enabled: true },
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
  const [activeTool, setActiveTool] = useState('select')
  const [zoom, setZoom] = useState(100)

  // 处理元素工具选择
  const handleToolSelect = useCallback((tool: ToolConfig) => {
    setActiveTool(tool.id)

    // 处理平移模式
    if (canvasRef.current) {
      if (tool.type === 'pan') {
        canvasRef.current.setPanMode(true)
      } else {
        // 其他工具退出平移模式
        canvasRef.current.setPanMode(false)
      }
    }
  }, [])

  // 处理创建元素
  const handleCreateElement = useCallback((element: ResumeElement) => {
    if (canvasRef.current) {
      canvasRef.current.createElement(element)
    }
  }, [])

  // 处理图片上传
  const handleImageUpload = useCallback((file: File) => {
    if (!canvasRef.current) return

    // 读取图片并创建元素
    const reader = new FileReader()
    reader.onload = (e) => {
      const src = e.target?.result as string
      const imageElement: ResumeElement = {
        id: `image-${Date.now()}`,
        type: 'image',
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
        width: 150,
        height: 150,
        src,
      }
      canvasRef.current?.createElement(imageElement)
    }
    reader.readAsDataURL(file)
  }, [])

  // 处理缩放
  const handleZoomIn = useCallback(() => {
    if (canvasRef.current) {
      canvasRef.current.zoomIn(0.1)
      const newZoom = canvasRef.current.getZoom() * 100
      setZoom(newZoom)
    }
  }, [])

  const handleZoomOut = useCallback(() => {
    if (canvasRef.current) {
      canvasRef.current.zoomOut(0.1)
      const newZoom = canvasRef.current.getZoom() * 100
      setZoom(newZoom)
    }
  }, [])

  // 同步缩放状态
  useEffect(() => {
    const syncZoom = () => {
      if (canvasRef.current) {
        const currentZoom = canvasRef.current.getZoom() * 100
        if (Math.abs(currentZoom - zoom) > 1) {
          setZoom(currentZoom)
        }
      }
    }
    const interval = setInterval(syncZoom, 500)
    return () => clearInterval(interval)
  }, [zoom])

  // 处理编辑器初始化完成
  const handleEditorReady = useCallback(
    (editor: any) => {
      try {
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
      } catch {
        // 创建 Agent 失败，忽略错误
      }
    },
    [apiEndpoint, defaultModel, templates]
  )

  // 处理发送消息
  const handleSendMessage = useCallback((content: string) => {
    if (!agentRef.current) {
      return
    }
    agentRef.current.sendMessage(content).catch(() => {
      // 错误已在 onError 回调中处理
    })
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
        {/* 左侧元素工具栏 */}
        <div
          style={{
            width: 52,
            padding: '8px 4px',
            borderRight: '1px solid #e0e0e0',
            backgroundColor: '#fafafa',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <ElementToolbar
            activeTool={activeTool}
            onToolSelect={handleToolSelect}
            onCreateElement={handleCreateElement}
            onImageUpload={handleImageUpload}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            zoom={zoom}
            vertical
          />
        </div>

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
            dotMatrix={dotMatrix}
            onReady={handleEditorReady}
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
