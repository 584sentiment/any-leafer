/**
 * TemplateSelector - 模板选择组件
 * 支持快速应用和智能生成两种模式
 */

import React, { useState } from 'react'
import type { ResumeTemplate, TemplateApplyMode, TemplateCategory } from '@resume-editor/shared'

/**
 * 模板分类信息
 */
const CATEGORY_INFO: Record<TemplateCategory, { name: string; color: string }> = {
  classic: { name: '经典', color: '#3498db' },
  modern: { name: '现代', color: '#9b59b6' },
  minimal: { name: '简约', color: '#1abc9c' },
  creative: { name: '创意', color: '#e74c3c' },
}

export interface TemplateSelectorProps {
  /** 可用模板列表 */
  templates: ResumeTemplate[]
  /** 当前选中的模板 */
  selectedTemplate?: ResumeTemplate
  /** 当前选中的应用模式 */
  applyMode?: TemplateApplyMode
  /** 模板选择回调 */
  onTemplateSelect: (template: ResumeTemplate) => void
  /** 应用模式变更回调 */
  onApplyModeChange: (mode: TemplateApplyMode) => void
  /** 确认回调 */
  onConfirm: (template: ResumeTemplate, mode: TemplateApplyMode) => void
  /** 取消回调 */
  onCancel?: () => void
  /** 是否正在加载 */
  loading?: boolean
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  selectedTemplate,
  applyMode = 'quick',
  onTemplateSelect,
  onApplyModeChange,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<TemplateCategory | 'all'>('all')

  // 过滤模板
  const filteredTemplates =
    filterCategory === 'all'
      ? templates
      : templates.filter((t) => t.category === filterCategory)

  // 获取模板缩略图或生成占位
  const getThumbnail = (template: ResumeTemplate): string => {
    if (template.thumbnail) {
      return template.thumbnail
    }
    // 根据分类返回不同颜色的占位图
    const colors: Record<TemplateCategory, string> = {
      classic: '#3498db',
      modern: '#9b59b6',
      minimal: '#1abc9c',
      creative: '#e74c3c',
    }
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="260" viewBox="0 0 200 260">
        <rect fill="${colors[template.category]}" width="200" height="260" rx="8"/>
        <text x="100" y="130" text-anchor="middle" fill="white" font-size="16" font-family="Arial">
          ${template.name}
        </text>
        <text x="100" y="155" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="12" font-family="Arial">
          ${CATEGORY_INFO[template.category].name}
        </text>
      </svg>
    `)}`
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 标题 */}
      <div
        style={{
          padding: '24px 32px 16px',
          borderBottom: '1px solid #e9ecef',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 600,
            color: '#212529',
          }}
        >
          选择简历模板
        </h1>
        <p
          style={{
            margin: '8px 0 0',
            fontSize: 14,
            color: '#6c757d',
          }}
        >
          选择一个模板开始创建你的专业简历
        </p>
      </div>

      {/* 分类过滤 */}
      <div
        style={{
          padding: '16px 32px',
          display: 'flex',
          gap: 8,
        }}
      >
        <button
          onClick={() => setFilterCategory('all')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: 20,
            backgroundColor: filterCategory === 'all' ? '#212529' : '#e9ecef',
            color: filterCategory === 'all' ? '#fff' : '#495057',
            cursor: 'pointer',
            fontSize: 13,
            transition: 'all 0.2s',
          }}
        >
          全部
        </button>
        {(Object.keys(CATEGORY_INFO) as TemplateCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: 20,
              backgroundColor: filterCategory === cat ? CATEGORY_INFO[cat].color : '#e9ecef',
              color: filterCategory === cat ? '#fff' : '#495057',
              cursor: 'pointer',
              fontSize: 13,
              transition: 'all 0.2s',
            }}
          >
            {CATEGORY_INFO[cat].name}
          </button>
        ))}
      </div>

      {/* 模板网格 */}
      <div
        style={{
          flex: 1,
          padding: '0 32px',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 20,
            paddingBottom: 24,
          }}
        >
          {filteredTemplates.map((template) => {
            const isSelected = selectedTemplate?.id === template.id
            const isHovered = hoveredTemplate === template.id

            return (
              <div
                key={template.id}
                data-testid="preview-card"
                onClick={() => onTemplateSelect(template)}
                onMouseEnter={() => setHoveredTemplate(template.id)}
                onMouseLeave={() => setHoveredTemplate(null)}
                style={{
                  cursor: 'pointer',
                  aspectRatio: '200 / 260',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 12,
                  border: isSelected
                    ? '3px solid #3498db'
                    : isHovered
                      ? '3px solid #bdc3c7'
                      : '3px solid transparent',
                  boxShadow: isHovered || isSelected
                    ? '0 4px 12px rgba(0,0,0,0.15)'
                    : '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'all 0.2s',
                  backgroundColor: '#fff',
                }}
              >
                {/* 缩略图层 - 绝对定位铺满整个卡片 */}
                <div
                  data-testid="thumbnail-layer"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url("${getThumbnail(template)}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />

                {/* OverlayPanel - 悬停时从底部滑入 */}
                <div
                  data-testid="overlay-panel"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    transform: isHovered ? 'translateY(0)' : 'translateY(100%)',
                    transition: 'transform 0.25s ease',
                    background: 'rgba(0,0,0,0.65)',
                    padding: '12px 14px',
                  }}
                >
                  {/* 模板名称 */}
                  <div
                    style={{
                      fontWeight: 600,
                      color: '#fff',
                      fontSize: 14,
                    }}
                  >
                    {template.name}
                  </div>
                  {/* 分类标签 */}
                  <div
                    data-testid="category-tag"
                    style={{
                      marginTop: 4,
                      display: 'inline-block',
                      backgroundColor: CATEGORY_INFO[template.category].color + '33',
                      color: CATEGORY_INFO[template.category].color,
                      fontSize: 11,
                      padding: '2px 8px',
                      borderRadius: 10,
                    }}
                  >
                    {CATEGORY_INFO[template.category].name}
                  </div>
                </div>

                {/* SelectionBadge - 选中时显示 */}
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: '#3498db',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 底部操作栏 */}
      <div
        style={{
          padding: '12px 24px',
          borderTop: '1px solid #e9ecef',
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        {/* 应用模式选择 */}
        <div
          style={{
            display: 'flex',
            gap: 16,
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
            }}
          >
            <input
              type="radio"
              name="applyMode"
              checked={applyMode === 'quick'}
              onChange={() => onApplyModeChange('quick')}
              style={{ width: 16, height: 16 }}
            />
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#212529' }}>
                快速应用
              </div>
              <div style={{ fontSize: 12, color: '#6c757d' }}>
                直接使用预置布局
              </div>
            </div>
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
            }}
          >
            <input
              type="radio"
              name="applyMode"
              checked={applyMode === 'smart'}
              onChange={() => onApplyModeChange('smart')}
              style={{ width: 16, height: 16 }}
            />
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#212529' }}>
                智能生成
              </div>
              <div style={{ fontSize: 12, color: '#6c757d' }}>
                AI 根据您的信息定制
              </div>
            </div>
          </label>
        </div>

        {/* 按钮 */}
        <div style={{ display: 'flex', gap: 12 }}>
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={loading}
              style={{
                padding: '10px 24px',
                border: '1px solid #dee2e6',
                borderRadius: 8,
                backgroundColor: '#fff',
                color: '#495057',
                fontSize: 14,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              取消
            </button>
          )}
          <button
            onClick={() => selectedTemplate && onConfirm(selectedTemplate, applyMode)}
            disabled={!selectedTemplate || loading}
            style={{
              padding: '10px 32px',
              border: 'none',
              borderRadius: 8,
              backgroundColor: selectedTemplate ? '#3498db' : '#bdc3c7',
              color: '#fff',
              fontSize: 14,
              fontWeight: 500,
              cursor: selectedTemplate && !loading ? 'pointer' : 'not-allowed',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? '处理中...' : applyMode === 'quick' ? '应用模板' : '下一步'}
          </button>
        </div>
      </div>
    </div>
  )
}
