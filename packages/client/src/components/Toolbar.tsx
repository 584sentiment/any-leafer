/**
 * Toolbar - 工具栏组件
 */

import React from 'react'
import type { AgentMode, AIModelType } from '@resume-editor/shared'

export interface ToolbarProps {
  /** 当前模式 */
  mode: AgentMode
  /** 当前模型 */
  model: AIModelType
  /** 是否可以撤销 */
  canUndo: boolean
  /** 是否可以重做 */
  canRedo: boolean
  /** 是否正在处理 */
  isProcessing: boolean
  /** 模式变化回调 */
  onModeChange: (mode: AgentMode) => void
  /** 模型变化回调 */
  onModelChange: (model: AIModelType) => void
  /** 撤销回调 */
  onUndo: () => void
  /** 重做回调 */
  onRedo: () => void
  /** 导出回调 */
  onExport: (format: 'png' | 'jpg' | 'pdf') => void
  /** 清空画布回调 */
  onClear: () => void
  /** 自定义类名 */
  className?: string
}

const MODES: { value: AgentMode; label: string }[] = [
  { value: 'edit', label: '编辑模式' },
  { value: 'template', label: '模板模式' },
  { value: 'assistant', label: '助手模式' },
]

const MODELS: { value: AIModelType; label: string }[] = [
  { value: 'claude-sonnet-4.5', label: 'Claude Sonnet 4.5' },
  { value: 'claude-opus-4.5', label: 'Claude Opus 4.5' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
]

export const Toolbar: React.FC<ToolbarProps> = ({
  mode,
  model,
  canUndo,
  canRedo,
  isProcessing,
  onModeChange,
  onModelChange,
  onUndo,
  onRedo,
  onExport,
  onClear,
  className,
}) => {
  const buttonStyle: React.CSSProperties = {
    padding: '6px 12px',
    border: '1px solid #d9d9d9',
    borderRadius: 4,
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  }

  const disabledButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    opacity: 0.5,
    cursor: 'not-allowed',
  }

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 16px',
        backgroundColor: '#fafafa',
        borderBottom: '1px solid #e0e0e0',
        ...(!className ? {} : undefined),
      }}
    >
      {/* 模式选择 */}
      <select
        value={mode}
        onChange={(e) => onModeChange(e.target.value as AgentMode)}
        style={{
          padding: '6px 8px',
          border: '1px solid #d9d9d9',
          borderRadius: 4,
          fontSize: 13,
        }}
      >
        {MODES.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>

      {/* 分隔线 */}
      <div style={{ width: 1, height: 24, backgroundColor: '#e0e0e0' }} />

      {/* 模型选择 */}
      <select
        value={model}
        onChange={(e) => onModelChange(e.target.value as AIModelType)}
        style={{
          padding: '6px 8px',
          border: '1px solid #d9d9d9',
          borderRadius: 4,
          fontSize: 13,
        }}
      >
        {MODELS.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>

      {/* 分隔线 */}
      <div style={{ width: 1, height: 24, backgroundColor: '#e0e0e0' }} />

      {/* 撤销/重做 */}
      <button
        style={canUndo ? buttonStyle : disabledButtonStyle}
        onClick={onUndo}
        disabled={!canUndo}
        title="撤销 (Ctrl+Z)"
      >
        ↶ 撤销
      </button>
      <button
        style={canRedo ? buttonStyle : disabledButtonStyle}
        onClick={onRedo}
        disabled={!canRedo}
        title="重做 (Ctrl+Y)"
      >
        ↷ 重做
      </button>

      {/* 分隔线 */}
      <div style={{ width: 1, height: 24, backgroundColor: '#e0e0e0' }} />

      {/* 导出 */}
      <button
        style={buttonStyle}
        onClick={() => onExport('png')}
        title="导出为 PNG"
      >
        📷 PNG
      </button>
      <button
        style={buttonStyle}
        onClick={() => onExport('jpg')}
        title="导出为 JPG"
      >
        🖼️ JPG
      </button>
      <button
        style={buttonStyle}
        onClick={() => onExport('pdf')}
        title="导出为 PDF"
      >
        📄 PDF
      </button>

      {/* 分隔线 */}
      <div style={{ width: 1, height: 24, backgroundColor: '#e0e0e0' }} />

      {/* 清空 */}
      <button
        style={{
          ...buttonStyle,
          color: '#ff4d4f',
        }}
        onClick={onClear}
        title="清空画布"
      >
        🗑️ 清空
      </button>

      {/* 处理状态指示器 */}
      {isProcessing && (
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#1890ff',
          }}
        >
          <span className="animate-spin">⏳</span>
          <span>处理中...</span>
        </div>
      )}
    </div>
  )
}
