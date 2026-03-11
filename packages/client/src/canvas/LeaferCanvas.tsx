/**
 * LeaferCanvas - React 组件封装
 */

import React, {
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react'
import { LeaferEditor, LeaferEditorConfig } from './LeaferEditor'
import type { ResumeElement, CanvasState, ExportOptions } from '@resume-editor/shared'

/**
 * LeaferCanvas 组件属性
 */
export interface LeaferCanvasProps {
  /** 画布宽度 */
  width?: number
  /** 画布高度 */
  height?: number
  /** 背景色 */
  backgroundColor?: string
  /** 是否启用编辑器 */
  editable?: boolean
  /** 是否启用吸附 */
  snap?: boolean
  /** 初始元素 */
  initialElements?: ResumeElement[]
  /** 元素变化回调 */
  onElementsChange?: (elements: ResumeElement[]) => void
  /** 选择变化回调 */
  onSelectionChange?: (selection: string[]) => void
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
}

/**
 * LeaferCanvas 组件
 */
export const LeaferCanvas = forwardRef<LeaferCanvasRef, LeaferCanvasProps>(
  (props, ref) => {
    const {
      width = 800,
      height = 600,
      backgroundColor = '#ffffff',
      editable = true,
      snap = true,
      initialElements = [],
      onElementsChange,
      onSelectionChange,
      className,
      style,
    } = props

    const containerRef = useRef<HTMLDivElement>(null)
    const editorRef = useRef<LeaferEditor | null>(null)

    // 初始化编辑器
    useEffect(() => {
      if (!containerRef.current) return

      const config: LeaferEditorConfig = {
        container: containerRef.current,
        width,
        height,
        backgroundColor,
        editable,
        snap,
      }

      const editor = new LeaferEditor(config)
      editor.init().then(() => {
        editorRef.current = editor

        // 加载初始元素
        initialElements.forEach((el) => {
          editor.createElement(el, { id: el.id })
        })
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
        return (
          editorRef.current?.getCanvasState() ?? {
            elements: [],
            viewport: { x: 0, y: 0, zoom: 1, width, height },
            selection: [],
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
    }))

    // 处理尺寸变化
    useEffect(() => {
      const editor = editorRef.current
      if (!editor) return

      const leafer = editor.getLeafer()
      if (leafer) {
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
          border: '1px solid #e0e0e0',
          borderRadius: 4,
          ...style,
        }}
      />
    )
  }
)

LeaferCanvas.displayName = 'LeaferCanvas'
