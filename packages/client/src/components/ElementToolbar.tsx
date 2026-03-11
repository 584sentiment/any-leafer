/**
 * ElementToolbar - 元素工具栏组件
 * 用于快速向画布添加 rect、text、line 等元素
 */

import React, { useState, useRef } from 'react'
import {
  Square,
  Type,
  Minus,
  Circle,
  Image,
  Layers,
  SeparatorHorizontal,
  MousePointer2,
  Hand,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from 'lucide-react'
import type { ResumeElement } from '@resume-editor/shared'

/**
 * 工具类型
 */
export type ToolType =
  | 'select'
  | 'pan'
  | 'rect'
  | 'text'
  | 'line'
  | 'ellipse'
  | 'image'
  | 'group'
  | 'divider'
  | 'custom'

/**
 * 工具配置接口
 */
export interface ToolConfig {
  /** 工具唯一标识 */
  id: string
  /** 工具类型 */
  type: ToolType
  /** 显示名称 */
  label: string
  /** 图标组件 */
  icon: LucideIcon
  /** 快捷键 */
  shortcut?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 工具分组 */
  group?: string
  /** 创建元素时的默认属性 */
  defaultProps?: Partial<ResumeElement>
  /** 自定义渲染 */
  render?: () => React.ReactNode
}

/**
 * 工具分组配置
 */
export interface ToolGroupConfig {
  /** 分组标识 */
  id: string
  /** 分组名称 */
  label?: string
  /** 分组内工具 */
  tools: ToolConfig[]
}

/**
 * ElementToolbar 组件属性
 */
export interface ElementToolbarProps {
  /** 当前选中的工具 */
  activeTool?: string
  /** 工具选择回调 */
  onToolSelect?: (tool: ToolConfig) => void
  /** 创建元素回调 */
  onCreateElement?: (element: ResumeElement) => void
  /** 图片上传回调 */
  onImageUpload?: (file: File) => void
  /** 缩放回调 */
  onZoomIn?: () => void
  /** 缩放回调 */
  onZoomOut?: () => void
  /** 当前缩放比例 */
  zoom?: number
  /** 自定义工具分组（覆盖默认） */
  toolGroups?: ToolGroupConfig[]
  /** 额外的自定义工具分组（追加到默认后面） */
  extraToolGroups?: ToolGroupConfig[]
  /** 自定义类名 */
  className?: string
  /** 垂直方向 */
  vertical?: boolean
}

/**
 * 默认元素创建位置生成器
 */
const generateDefaultPosition = () => ({
  x: 100 + Math.random() * 200,
  y: 100 + Math.random() * 200,
})

/**
 * 默认工具配置
 */
const DEFAULT_TOOL_GROUPS: ToolGroupConfig[] = [
  {
    id: 'basic',
    label: '基础工具',
    tools: [
      {
        id: 'select',
        type: 'select',
        label: '选择',
        icon: MousePointer2,
        shortcut: 'V',
      },
      {
        id: 'pan',
        type: 'pan',
        label: '平移',
        icon: Hand,
        shortcut: 'H',
      },
    ],
  },
  {
    id: 'shapes',
    label: '形状',
    tools: [
      {
        id: 'rect',
        type: 'rect',
        label: '矩形',
        icon: Square,
        shortcut: 'R',
        defaultProps: {
          type: 'rect',
          ...generateDefaultPosition(),
          width: 100,
          height: 100,
          fill: '#32cd79',
        } as ResumeElement,
      },
      {
        id: 'ellipse',
        type: 'ellipse',
        label: '椭圆',
        icon: Circle,
        shortcut: 'O',
        defaultProps: {
          type: 'ellipse',
          ...generateDefaultPosition(),
          width: 100,
          height: 100,
          fill: '#5b8ff9',
        } as ResumeElement,
      },
    ],
  },
  {
    id: 'content',
    label: '内容',
    tools: [
      {
        id: 'text',
        type: 'text',
        label: '文本',
        icon: Type,
        shortcut: 'T',
        defaultProps: {
          type: 'text',
          ...generateDefaultPosition(),
          width: 200,
          height: 40,
          content: '双击编辑文本',
          fontSize: 16,
          fill: '#333333',
        } as ResumeElement,
      },
      {
        id: 'image',
        type: 'image',
        label: '图片',
        icon: Image,
        shortcut: 'I',
        // 图片工具没有 defaultProps，需要用户上传
      },
    ],
  },
  {
    id: 'lines',
    label: '线条',
    tools: [
      {
        id: 'line',
        type: 'line',
        label: '线条',
        icon: Minus,
        shortcut: 'L',
        defaultProps: {
          type: 'line',
          ...generateDefaultPosition(),
          width: 100,
          height: 0,
          stroke: '#333333',
          strokeWidth: 2,
        } as ResumeElement,
      },
      {
        id: 'divider',
        type: 'divider',
        label: '分隔线',
        icon: SeparatorHorizontal,
        shortcut: 'D',
        defaultProps: {
          type: 'divider',
          ...generateDefaultPosition(),
          width: 200,
          height: 0,
          stroke: '#e0e0e0',
          strokeWidth: 1,
        } as ResumeElement,
      },
    ],
  },
  {
    id: 'advanced',
    label: '高级',
    tools: [
      {
        id: 'group',
        type: 'group',
        label: '分组',
        icon: Layers,
        shortcut: 'G',
        defaultProps: {
          type: 'group',
          ...generateDefaultPosition(),
          width: 200,
          height: 200,
        } as ResumeElement,
      },
    ],
  },
]

/**
 * 工具按钮组件
 */
interface ToolButtonProps {
  tool: ToolConfig
  isActive: boolean
  onClick: () => void
  onImageClick?: () => void
}

const ToolButton: React.FC<ToolButtonProps> = ({ tool, isActive, onClick, onImageClick }) => {
  const Icon = tool.icon
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    if (tool.type === 'image' && onImageClick) {
      // 图片工具：触发文件选择
      fileInputRef.current?.click()
    } else {
      onClick()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onImageClick) {
      onImageClick()
      // 通过自定义事件传递文件
      const event = new CustomEvent('imageSelected', { detail: file })
      window.dispatchEvent(event)
    }
    // 清空 input 以便重复选择同一文件
    e.target.value = ''
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={tool.disabled}
        title={tool.shortcut ? `${tool.label} (${tool.shortcut})` : tool.label}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          border: 'none',
          borderRadius: 6,
          backgroundColor: isActive ? '#e6f4ff' : 'transparent',
          color: isActive ? '#1890ff' : '#666666',
          cursor: tool.disabled ? 'not-allowed' : 'pointer',
          opacity: tool.disabled ? 0.5 : 1,
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          if (!tool.disabled && !isActive) {
            e.currentTarget.style.backgroundColor = '#f5f5f5'
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'transparent'
          }
        }}
      >
        <Icon size={18} strokeWidth={1.5} />
      </button>
      {/* 隐藏的文件输入框用于图片上传 */}
      {tool.type === 'image' && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      )}
    </>
  )
}

/**
 * 元素工具栏组件
 */
export const ElementToolbar: React.FC<ElementToolbarProps> = ({
  activeTool = 'select',
  onToolSelect,
  onCreateElement,
  onImageUpload,
  onZoomIn,
  onZoomOut,
  zoom = 100,
  toolGroups,
  extraToolGroups,
  className,
  vertical = false,
}) => {
  const [internalActiveTool, setInternalActiveTool] = useState(activeTool)

  // 合并工具分组
  const finalToolGroups: ToolGroupConfig[] = [
    ...(toolGroups || DEFAULT_TOOL_GROUPS),
    ...(extraToolGroups || []),
  ]

  // 当前激活的工具
  const currentActiveTool = activeTool || internalActiveTool

  // 处理工具点击
  const handleToolClick = (tool: ToolConfig) => {
    setInternalActiveTool(tool.id)
    onToolSelect?.(tool)

    // 如果是创建元素类型的工具（非图片），触发创建回调
    if (tool.type !== 'image' && tool.defaultProps && onCreateElement) {
      // 生成新的位置避免重叠
      const element: ResumeElement = {
        ...tool.defaultProps,
        ...generateDefaultPosition(),
      } as ResumeElement
      onCreateElement(element)
    }
  }

  // 处理图片选择
  const handleImageSelect = () => {
    setInternalActiveTool('image')
    onToolSelect?.({
      id: 'image',
      type: 'image',
      label: '图片',
      icon: Image,
    })
  }

  // 监听图片选择事件
  React.useEffect(() => {
    const handleImageSelected = (e: CustomEvent<File>) => {
      if (onImageUpload) {
        onImageUpload(e.detail)
      }
    }

    window.addEventListener('imageSelected', handleImageSelected as EventListener)
    return () => {
      window.removeEventListener('imageSelected', handleImageSelected as EventListener)
    }
  }, [onImageUpload])

  // 工具栏容器样式
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: vertical ? 'column' : 'row',
    alignItems: vertical ? 'flex-start' : 'center',
    gap: vertical ? 4 : 8,
    padding: vertical ? '8px 4px' : '8px 12px',
    backgroundColor: '#ffffff',
    border: vertical ? '1px solid #e0e0e0' : '1px solid #e0e0e0',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    ...(className ? {} : undefined),
  }

  // 分隔线样式
  const separatorStyle: React.CSSProperties = vertical
    ? { width: '100%', height: 1, backgroundColor: '#e0e0e0', margin: '4px 0' }
    : { width: 1, height: 24, backgroundColor: '#e0e0e0', margin: '0 4px' }

  return (
    <div className={className} style={containerStyle}>
      {finalToolGroups.map((group, groupIndex) => (
        <React.Fragment key={group.id}>
          {/* 工具分组 */}
          <div
            style={{
              display: 'flex',
              flexDirection: vertical ? 'column' : 'row',
              alignItems: 'center',
              gap: 2,
            }}
          >
            {group.tools.map((tool) => (
              <ToolButton
                key={tool.id}
                tool={tool}
                isActive={currentActiveTool === tool.id}
                onClick={() => handleToolClick(tool)}
                onImageClick={tool.type === 'image' ? handleImageSelect : undefined}
              />
            ))}
          </div>

          {/* 分组分隔线 */}
          {groupIndex < finalToolGroups.length - 1 && (
            <div style={separatorStyle} />
          )}
        </React.Fragment>
      ))}

      {/* 缩放控制 */}
      {(onZoomIn || onZoomOut) && (
        <>
          <div style={separatorStyle} />
          <div
            style={{
              display: 'flex',
              flexDirection: vertical ? 'column' : 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <button
              onClick={onZoomOut}
              title="缩小"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                border: 'none',
                borderRadius: 4,
                backgroundColor: 'transparent',
                color: '#666666',
                cursor: 'pointer',
              }}
            >
              <ZoomOut size={16} />
            </button>
            <span
              style={{
                fontSize: 12,
                color: '#666666',
                minWidth: 40,
                textAlign: 'center',
              }}
            >
              {Math.round(zoom)}%
            </span>
            <button
              onClick={onZoomIn}
              title="放大"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                border: 'none',
                borderRadius: 4,
                backgroundColor: 'transparent',
                color: '#666666',
                cursor: 'pointer',
              }}
            >
              <ZoomIn size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

/**
 * 创建自定义工具配置的辅助函数
 */
export const createToolConfig = (
  config: Omit<ToolConfig, 'icon'> & { icon: LucideIcon }
): ToolConfig => config

/**
 * 创建工具分组的辅助函数
 */
export const createToolGroup = (config: ToolGroupConfig): ToolGroupConfig => config

export default ElementToolbar
