/**
 * ResumeEditor - 主编辑器组件
 * 整合画布、工具栏和聊天面板
 */

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { LeaferCanvas, LeaferCanvasRef, DotMatrixConfig } from '../canvas/LeaferCanvas'
import { LeaferAgent, LeaferAgentState } from '../agent/LeaferAgent'
import { TemplateManager } from '../agent/managers/TemplateManager'
import { ChatPanel } from './ChatPanel'
import { ElementToolbar, ToolConfig } from './ElementToolbar'
import type {
  ChatMessage,
  ResumeTemplate,
  ResumeElement,
} from '@resume-editor/shared'

/**
 * ResumeEditor 配置
 */
export interface ResumeEditorProps {
  /** 画布宽度（数字或 '100%'） */
  canvasWidth?: number | string
  /** 画布高度（数字或 '100%'） */
  canvasHeight?: number | string
  /** API 端点 */
  apiEndpoint: string
  /** 默认模型 */
  defaultModel?: string
  /** 预加载的模板 */
  templates?: ResumeTemplate[]
  /** 聊天面板宽度 */
  chatWidth?: number
  /** 初始模式 */
  initialMode?: string
  /** 点阵配置 */
  dotMatrix?: DotMatrixConfig
  /** 初始应用的模板 ID（快速应用模式） */
  initialTemplateId?: string
  /** 初始渲染的元素列表（智能生成模式） */
  initialElements?: ResumeElement[]
  /** 是否显示纸张效果 */
  paperEffect?: boolean
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({
  canvasWidth = '100%',
  canvasHeight = '100%',
  apiEndpoint,
  defaultModel = 'deepseek-chat',
  templates = [],
  chatWidth = 320,
  initialMode = 'edit',
  dotMatrix = { enabled: true },
  initialTemplateId,
  initialElements,
  paperEffect = true,
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
  const [isEditorReady, setIsEditorReady] = useState(false)

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

  // 处理元素创建 - 保存历史
  const handleElementCreated = useCallback((_elementId: string) => {
    // 元素创建后保存历史
    agentRef.current?.saveHistory('创建元素')
  }, [])

  // 处理元素更新（拖动、缩放、旋转） - 保存历史
  const handleElementUpdated = useCallback((_elementIds: string[]) => {
    // 元素更新后保存历史
    agentRef.current?.saveHistory('移动/缩放/旋转元素')
  }, [])

  // 处理元素删除 - 保存历史
  const handleElementDeleted = useCallback((_elementIds: string[]) => {
    // 元素删除后保存历史
    agentRef.current?.saveHistory('删除元素')
  }, [])

  // 处理文本编辑结束 - 保存历史
  const handleTextEditEnd = useCallback((_elementId: string) => {
    // 文本编辑结束后保存历史
    agentRef.current?.saveHistory('编辑文本')
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

        // 标记编辑器已准备就绪
        setIsEditorReady(true)
      } catch {
        // 创建 Agent 失败，忽略错误
      }
    },
    [apiEndpoint, defaultModel, templates]
  )

  // 处理初始模板或初始元素（在编辑器准备好之后）
  useEffect(() => {
    // 等待编辑器初始化完成
    if (!isEditorReady || !canvasRef.current) return

    const editor = canvasRef.current.getEditor()
    if (!editor) return

    // 优先使用初始元素（智能生成模式）
    if (initialElements && initialElements.length > 0) {
      const templateManager = new TemplateManager({ editor, templates })
      // 使用 applyElements 以便坐标映射生效
      templateManager.applyElements(initialElements)
      agentRef.current?.saveHistory('应用智能生成模板')
      return
    }

    // 使用初始模板（快速应用模式）
    if (initialTemplateId && templates.length > 0) {
      const templateManager = new TemplateManager({ editor, templates })
      const applied = templateManager.applyTemplate(initialTemplateId)
      if (applied) {
        const template = templates.find((t) => t.id === initialTemplateId)
        agentRef.current?.saveHistory(`应用模板: ${template?.name ?? initialTemplateId}`)
      }
    }
  }, [isEditorReady, initialTemplateId, initialElements, templates])

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

  // 处理撤销
  const handleUndo = useCallback(() => {
    agentRef.current?.undo()
  }, [])

  // 处理重做
  const handleRedo = useCallback(() => {
    agentRef.current?.redo()
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
            canUndo={agentState.canUndo}
            canRedo={agentState.canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            vertical
          />
        </div>

        {/* 画布区域 */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            overflow: 'hidden',
            padding: 0,
          }}
        >
          <LeaferCanvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            backgroundColor="#e8e8e8"
            paperEffect={paperEffect}
            paperEffectConfig={{
              enabled: paperEffect,
              fillColor: '#ffffff',
              shadowColor: 'rgba(0,0,0,0.15)',
              shadowBlur: 12,
              shadowOffsetY: 4,
              padding: 40,
              aspectRatio: 210 / 297,
            }}
            editable
            snap
            dotMatrix={dotMatrix}
            onReady={handleEditorReady}
            onElementCreated={handleElementCreated}
            onElementUpdated={handleElementUpdated}
            onElementDeleted={handleElementDeleted}
            onTextEditEnd={handleTextEditEnd}
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
