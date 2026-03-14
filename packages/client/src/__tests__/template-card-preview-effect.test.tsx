/**
 * Unit tests for template card preview effect
 * Tests visual and interaction behavior of PreviewCard in TemplateSelector
 */

import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TemplateSelector } from '../components/TemplateSelector'
import type { ResumeTemplate, TemplateApplyMode } from '@resume-editor/shared'

// Helper: create a minimal valid ResumeTemplate
function makeTemplate(overrides: Partial<ResumeTemplate> = {}): ResumeTemplate {
  return {
    id: 'tpl-1',
    name: 'Classic Resume',
    category: 'classic',
    canvasSize: { width: 800, height: 1040 },
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  }
}

// Default required props for TemplateSelector
const defaultProps = {
  onTemplateSelect: vi.fn(),
  onApplyModeChange: vi.fn(),
  onConfirm: vi.fn(),
}

describe('Template Card Preview Effect', () => {
  it('1. 卡片容器 aspectRatio 为 "200 / 260"', () => {
    const template = makeTemplate()
    const { getByTestId } = render(
      <TemplateSelector templates={[template]} {...defaultProps} />
    )
    const card = getByTestId('preview-card')
    expect(card.style.aspectRatio).toBe('200 / 260')
  })

  it('2. 缩略图层 backgroundSize 为 "cover"', () => {
    const template = makeTemplate()
    const { getByTestId } = render(
      <TemplateSelector templates={[template]} {...defaultProps} />
    )
    const thumbnail = getByTestId('thumbnail-layer')
    expect(thumbnail.style.backgroundSize).toBe('cover')
  })

  it('3. 默认状态（非悬停）OverlayPanel transform 为 "translateY(100%)"', () => {
    const template = makeTemplate()
    const { getByTestId } = render(
      <TemplateSelector templates={[template]} {...defaultProps} />
    )
    const overlay = getByTestId('overlay-panel')
    expect(overlay.style.transform).toBe('translateY(100%)')
  })

  it('4. 悬停状态 OverlayPanel transform 为 "translateY(0)"', () => {
    const template = makeTemplate()
    const { getByTestId } = render(
      <TemplateSelector templates={[template]} {...defaultProps} />
    )
    const card = getByTestId('preview-card')
    fireEvent.mouseEnter(card)
    const overlay = getByTestId('overlay-panel')
    expect(overlay.style.transform).toBe('translateY(0)')
  })

  it('5. OverlayPanel 背景色包含 "rgba(0,0,0,0.65)"', () => {
    const template = makeTemplate()
    const { getByTestId } = render(
      <TemplateSelector templates={[template]} {...defaultProps} />
    )
    const overlay = getByTestId('overlay-panel')
    // Browser normalizes rgba(0,0,0,0.65) → rgba(0, 0, 0, 0.65)
    expect(overlay.style.background).toMatch(/rgba\(0,?\s*0,?\s*0,?\s*0\.65\)/)
  })

  it('6. CSS transition 包含 "0.25s"', () => {
    const template = makeTemplate()
    const { getByTestId } = render(
      <TemplateSelector templates={[template]} {...defaultProps} />
    )
    const overlay = getByTestId('overlay-panel')
    expect(overlay.style.transition).toContain('0.25s')
  })

  it('7. 选中状态下勾选图标（SVG polyline）存在于 DOM', () => {
    const template = makeTemplate()
    const { container } = render(
      <TemplateSelector
        templates={[template]}
        selectedTemplate={template}
        {...defaultProps}
      />
    )
    const polyline = container.querySelector('polyline')
    expect(polyline).not.toBeNull()
  })
})
