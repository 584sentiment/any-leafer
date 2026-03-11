/**
 * ElementToolbar 使用示例
 * 展示如何使用和扩展元素工具栏
 */

import React, { useState } from 'react'
import {
  ElementToolbar,
  createToolConfig,
  createToolGroup,
  ToolConfig,
  ToolGroupConfig,
} from './ElementToolbar'
import { Star, Heart, Bookmark, type LucideIcon } from 'lucide-react'
import type { ResumeElement } from '@resume-editor/shared'

/**
 * 示例 1: 基础使用
 */
export const BasicExample: React.FC = () => {
  const [activeTool, setActiveTool] = useState('select')
  const [zoom, setZoom] = useState(100)

  const handleToolSelect = (tool: ToolConfig) => {
    setActiveTool(tool.id)
    console.log('选中工具:', tool.label)
  }

  const handleCreateElement = (element: ResumeElement) => {
    console.log('创建元素:', element)
    // 这里调用 LeaferEditor.createElement(element)
  }

  return (
    <ElementToolbar
      activeTool={activeTool}
      onToolSelect={handleToolSelect}
      onCreateElement={handleCreateElement}
      onZoomIn={() => setZoom((z) => Math.min(z + 10, 200))}
      onZoomOut={() => setZoom((z) => Math.max(z - 10, 25))}
      zoom={zoom}
    />
  )
}

/**
 * 示例 2: 添加自定义工具（追加到默认工具后面）
 */
export const WithCustomToolsExample: React.FC = () => {
  const [activeTool, setActiveTool] = useState('select')

  // 定义自定义工具分组
  const customToolGroups: ToolGroupConfig[] = [
    createToolGroup({
      id: 'custom',
      label: '自定义元素',
      tools: [
        createToolConfig({
          id: 'star',
          type: 'custom',
          label: '星形',
          icon: Star,
          shortcut: 'S',
          defaultProps: {
            type: 'rect',
            x: 100,
            y: 100,
            width: 50,
            height: 50,
            fill: '#ffd700',
          } as ResumeElement,
        }),
        createToolConfig({
          id: 'heart',
          type: 'custom',
          label: '爱心',
          icon: Heart,
          shortcut: 'E',
          defaultProps: {
            type: 'ellipse',
            x: 100,
            y: 100,
            width: 60,
            height: 60,
            fill: '#ff6b6b',
          } as ResumeElement,
        }),
        createToolConfig({
          id: 'bookmark',
          type: 'custom',
          label: '书签',
          icon: Bookmark,
          shortcut: 'B',
          defaultProps: {
            type: 'rect',
            x: 100,
            y: 100,
            width: 30,
            height: 80,
            fill: '#4ecdc4',
          } as ResumeElement,
        }),
      ],
    }),
  ]

  return (
    <ElementToolbar
      activeTool={activeTool}
      onToolSelect={(tool) => setActiveTool(tool.id)}
      extraToolGroups={customToolGroups}
    />
  )
}

/**
 * 示例 3: 完全自定义工具栏（覆盖默认工具）
 */
export const FullyCustomExample: React.FC = () => {
  const [activeTool, setActiveTool] = useState('text')

  // 完全自定义工具分组
  const customToolGroups: ToolGroupConfig[] = [
    createToolGroup({
      id: 'text-only',
      label: '仅文本',
      tools: [
        createToolConfig({
          id: 'text',
          type: 'text',
          label: '文本',
          icon: Star as LucideIcon, // 这里可以用任何图标
          shortcut: 'T',
          defaultProps: {
            type: 'text',
            x: 50,
            y: 50,
            width: 200,
            height: 30,
            content: '自定义文本',
            fontSize: 18,
            fill: '#333333',
          } as ResumeElement,
        }),
      ],
    }),
  ]

  return (
    <ElementToolbar
      activeTool={activeTool}
      onToolSelect={(tool) => setActiveTool(tool.id)}
      toolGroups={customToolGroups}
    />
  )
}

/**
 * 示例 4: 垂直方向工具栏
 */
export const VerticalExample: React.FC = () => {
  const [activeTool, setActiveTool] = useState('select')

  return (
    <div style={{ height: 400, display: 'flex' }}>
      <ElementToolbar
        activeTool={activeTool}
        onToolSelect={(tool) => setActiveTool(tool.id)}
        vertical
      />
      <div style={{ flex: 1, padding: 16 }}>
        画布区域
      </div>
    </div>
  )
}

export default BasicExample
