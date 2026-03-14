/**
 * LeaferCanvas - React 组件封装
 */

import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react'
import { LeaferEditor, LeaferEditorConfig, DotMatrixConfig, PaperEffectConfig } from './LeaferEditor'
import type { ResumeElement, CanvasState, ExportOptions } from '@resume-editor/shared'

// 重新导出配置类型以便外部使用
export type { DotMatrixConfig, PaperEffectConfig }

/**
 * LeaferCanvas 组件属性
 */
export interface LeaferCanvasProps {
  /** 画布宽度（数字或 '100%'） */
  width?: number | string
  /** 画布高度（数字或 '100%'） */
  height?: number | string
  /** 背景色（桌面背景色，启用纸张效果时） */
  backgroundColor?: string
  /** 是否启用纸张效果 */
  paperEffect?: boolean
  /** 纸张效果详细配置 */
  paperEffectConfig?: Partial<PaperEffectConfig>
  /** 是否启用编辑器 */
  editable?: boolean
  /** 是否启用吸附 */
  snap?: boolean
  /** 点阵配置 */
  dotMatrix?: DotMatrixConfig
  /** 初始元素 */
  initialElements?: ResumeElement[]
  /** 元素变化回调 */
  onElementsChange?: (elements: ResumeElement[]) => void
  /** 选择变化回调 */
  onSelectionChange?: (selection: string[]) => void
  /** 编辑器初始化完成回调 */
  onReady?: (editor: LeaferEditor) => void
  /** 元素创建回调 */
  onElementCreated?: (elementId: string) => void
  /** 元素更新回调（拖动、缩放、旋转结束） */
  onElementUpdated?: (elementIds: string[]) => void
  /** 元素删除回调 */
  onElementDeleted?: (elementIds: string[]) => void
  /** 文本编辑结束回调 */
  onTextEditEnd?: (elementId: string) => void
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
}

/**
 * LeaferCanvas 组件 ref 方法
 */
export interface LeaferCanvasRef {
  /** 获取编辑器实例 */
  getEditor: () => LeaferEditor | null
  /** 创建元素 */
  createElement: (element: ResumeElement) => void
  /** 更新元素 */
  updateElement: (id: string, updates: Partial<ResumeElement>) => boolean
  /** 删除元素 */
  deleteElement: (id: string) => boolean
  /** 获取画布状态 */
  getCanvasState: () => CanvasState
  /** 清空画布 */
  clearCanvas: () => void
  /** 导出 */
  export: (options: ExportOptions) => Promise<Blob>
  /** 撤销 */
  undo: () => void
  /** 重做 */
  redo: () => void
  /** 获取缩放比例 */
  getZoom: () => number
  /** 设置缩放比例 */
  setZoom: (zoom: number) => void
  /** 放大 */
  zoomIn: (step?: number) => void
  /** 缩小 */
  zoomOut: (step?: number) => void
  /** 重置缩放 */
  resetZoom: () => void
  /** 设置平移模式 */
  setPanMode: (enabled: boolean) => void
  /** 是否处于平移模式 */
  isPanMode: () => boolean
}

/**
 * LeaferCanvas 组件
 */
export const LeaferCanvas = forwardRef<LeaferCanvasRef, LeaferCanvasProps>(
  (props, ref) => {
    const {
      width = '100%',
      height = '100%',
      backgroundColor = '#e8e8e8',
      paperEffect = false,
      paperEffectConfig,
      editable = true,
      snap = true,
      dotMatrix,
      initialElements = [],
      onElementsChange,
      onSelectionChange,
      onReady,
      onElementCreated,
      onElementUpdated,
      onElementDeleted,
      onTextEditEnd,
      className,
      style,
    } = props

    const containerRef = useRef<HTMLDivElement>(null)
    const editorRef = useRef<LeaferEditor | null>(null)
    const onReadyRef = useRef(onReady)
    const onElementCreatedRef = useRef(onElementCreated)
    const onElementUpdatedRef = useRef(onElementUpdated)
    const onElementDeletedRef = useRef(onElementDeleted)
    const onTextEditEndRef = useRef(onTextEditEnd)

    // 保持回调最新
    useEffect(() => {
      onReadyRef.current = onReady
    }, [onReady])

    useEffect(() => {
      onElementCreatedRef.current = onElementCreated
    }, [onElementCreated])

    useEffect(() => {
      onElementUpdatedRef.current = onElementUpdated
    }, [onElementUpdated])

    useEffect(() => {
      onElementDeletedRef.current = onElementDeleted
    }, [onElementDeleted])

    useEffect(() => {
      onTextEditEndRef.current = onTextEditEnd
    }, [onTextEditEnd])

    // 初始化编辑器
    useEffect(() => {
      if (!containerRef.current) {
        return
      }

      // 计算初始尺寸
      const container = containerRef.current
      const initialWidth = typeof width === 'number' ? width : container.clientWidth
      const initialHeight = typeof height === 'number' ? height : container.clientHeight

      const config: LeaferEditorConfig = {
        container: containerRef.current,
        width: initialWidth,
        height: initialHeight,
        backgroundColor,
        editable,
        snap,
        dotMatrix,
        paperEffect: paperEffect
          ? {
              enabled: true,
              fillColor: '#ffffff',
              shadowColor: 'rgba(0,0,0,0.15)',
              shadowBlur: 12,
              shadowOffsetY: 4,
              padding: 40,
              aspectRatio: 210 / 297,
              ...paperEffectConfig,
            }
          : undefined,
        onElementCreated: (elementId: string) => {
          onElementCreatedRef.current?.(elementId)
        },
        onElementUpdated: (elementIds: string[]) => {
          onElementUpdatedRef.current?.(elementIds)
        },
        onElementDeleted: (elementIds: string[]) => {
          onElementDeletedRef.current?.(elementIds)
        },
        onTextEditEnd: (elementId: string) => {
          onTextEditEndRef.current?.(elementId)
        },
      }

      const editor = new LeaferEditor(config)
      editor.init().then(() => {
        editorRef.current = editor

        // 加载初始元素
        initialElements.forEach((el) => {
          editor.createElement(el, { id: el.id })
        })

        // 通知编辑器已准备就绪
        onReadyRef.current?.(editor)
      }).catch(() => {
        // 编辑器初始化失败，忽略错误
      })

      return () => {
        editor.destroy()
        editorRef.current = null
      }
    }, [])

    // 暴露方法给 ref
    useImperativeHandle(ref, () => ({
      getEditor: () => editorRef.current,
      createElement: (element: ResumeElement) => {
        editorRef.current?.createElement(element, { id: element.id })
      },
      updateElement: (id: string, updates: Partial<ResumeElement>) => {
        return editorRef.current?.updateElement(id, updates) ?? false
      },
      deleteElement: (id: string) => {
        return editorRef.current?.deleteElement(id) ?? false
      },
      getCanvasState: () => {
        const container = containerRef.current
        return (
          editorRef.current?.getCanvasState() ?? {
            elements: [],
            viewport: {
              x: 0,
              y: 0,
              zoom: 1,
              width: container?.clientWidth ?? 800,
              height: container?.clientHeight ?? 600,
            },
            selection: [],
            paper: null,
          }
        )
      },
      clearCanvas: () => {
        editorRef.current?.clearCanvas()
      },
      export: (options: ExportOptions) => {
        return editorRef.current?.export(options) ?? Promise.reject()
      },
      undo: () => {
        // TODO: 实现撤销
      },
      redo: () => {
        // TODO: 实现重做
      },
      getZoom: () => {
        return editorRef.current?.getZoom() ?? 1
      },
      setZoom: (zoom: number) => {
        editorRef.current?.setZoom(zoom)
      },
      zoomIn: (step?: number) => {
        editorRef.current?.zoomIn(step)
      },
      zoomOut: (step?: number) => {
        editorRef.current?.zoomOut(step)
      },
      resetZoom: () => {
        editorRef.current?.resetZoom()
      },
      setPanMode: (enabled: boolean) => {
        editorRef.current?.setPanMode(enabled)
      },
      isPanMode: () => {
        return editorRef.current?.isPanMode() ?? false
      },
    }))

    // 处理尺寸变化（响应式）
    useEffect(() => {
      const container = containerRef.current
      const editor = editorRef.current
      if (!container || !editor) return

      const leafer = editor.getLeafer()
      if (!leafer) return

      // 如果是响应式尺寸，使用 ResizeObserver 监听
      if (typeof width === 'string' || typeof height === 'string') {
        const resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const { width: containerWidth, height: containerHeight } = entry.contentRect
            if (leafer) {
              leafer.width = containerWidth
              leafer.height = containerHeight
            }
          }
        })

        resizeObserver.observe(container)

        return () => {
          resizeObserver.disconnect()
        }
      } else {
        // 固定尺寸
        leafer.width = width
        leafer.height = height
      }
    }, [width, height])

    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          width,
          height,
          overflow: 'hidden',
          backgroundColor: paperEffect ? backgroundColor : '#ffffff',
          ...style,
        }}
      />
    )
  }
)

LeaferCanvas.displayName = 'LeaferCanvas'
