/**
 * Property-Based Tests for template card preview effect
 * Uses fast-check to verify universal properties across all valid inputs
 */

import React from 'react'
import { render, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { TemplateSelector } from '../components/TemplateSelector'
import type { ResumeTemplate, TemplateCategory } from '@resume-editor/shared'

afterEach(() => {
  cleanup()
})

// ---- Arbitrary generators ----

const CATEGORIES: TemplateCategory[] = ['classic', 'modern', 'minimal', 'creative']

let _idCounter = 0
function arbitraryTemplate() {
  return fc.record({
    id: fc.string({ minLength: 1, maxLength: 20 }).map((s) => `tpl-${s}-${_idCounter++}`),
    name: fc.string({ minLength: 1, maxLength: 40 }),
    category: fc.constantFrom(...CATEGORIES),
    canvasSize: fc.constant({ width: 800, height: 1040 }),
    createdAt: fc.constant(0),
    updatedAt: fc.constant(0),
  }) as fc.Arbitrary<ResumeTemplate>
}

// Default no-op props
const noop = () => {}

// ---- Property Tests ----

describe('Template Card Preview Effect - Property Tests', () => {
  // Feature: template-card-preview-effect, Property 1: 卡片固定宽高比 200:260
  it('Property 1: 任意模板的 PreviewCard aspectRatio 均为 "200 / 260"', () => {
    fc.assert(
      fc.property(arbitraryTemplate(), (template) => {
        const { getAllByTestId } = render(
          <TemplateSelector
            templates={[template]}
            onTemplateSelect={noop}
            onApplyModeChange={noop}
            onConfirm={noop}
          />
        )
        const cards = getAllByTestId('preview-card')
        const result = cards.every((card) => card.style.aspectRatio === '200 / 260')
        cleanup()
        return result
      }),
      { numRuns: 100 }
    )
  })

  // Feature: template-card-preview-effect, Property 2: 悬停状态决定 OverlayPanel 可见性（往返）
  it('Property 2: hover=true → translateY(0)，hover=false → translateY(100%)', () => {
    fc.assert(
      fc.property(arbitraryTemplate(), fc.boolean(), (template, startHovered) => {
        const { getByTestId } = render(
          <TemplateSelector
            templates={[template]}
            onTemplateSelect={noop}
            onApplyModeChange={noop}
            onConfirm={noop}
          />
        )
        const card = getByTestId('preview-card')

        // Apply initial hover state
        if (startHovered) {
          fireEvent.mouseEnter(card)
        } else {
          fireEvent.mouseLeave(card)
        }

        const overlay = getByTestId('overlay-panel')
        const expectedTransform = startHovered ? 'translateY(0)' : 'translateY(100%)'
        const afterFirst = overlay.style.transform === expectedTransform

        // Toggle hover state (round-trip)
        if (startHovered) {
          fireEvent.mouseLeave(card)
        } else {
          fireEvent.mouseEnter(card)
        }
        const toggledTransform = startHovered ? 'translateY(100%)' : 'translateY(0)'
        const afterToggle = overlay.style.transform === toggledTransform

        // Toggle back to original
        if (startHovered) {
          fireEvent.mouseEnter(card)
        } else {
          fireEvent.mouseLeave(card)
        }
        const afterRoundTrip = overlay.style.transform === expectedTransform

        cleanup()
        return afterFirst && afterToggle && afterRoundTrip
      }),
      { numRuns: 100 }
    )
  })

  // Feature: template-card-preview-effect, Property 3: OverlayPanel 包含模板名称与分类标签
  it('Property 3: 悬停时 OverlayPanel 包含模板名称且存在 category-tag 元素', () => {
    fc.assert(
      fc.property(arbitraryTemplate(), (template) => {
        const { getByTestId } = render(
          <TemplateSelector
            templates={[template]}
            onTemplateSelect={noop}
            onApplyModeChange={noop}
            onConfirm={noop}
          />
        )
        const card = getByTestId('preview-card')
        fireEvent.mouseEnter(card)

        const overlay = getByTestId('overlay-panel')
        const hasName = overlay.textContent?.includes(template.name) ?? false
        const hasCategoryTag = overlay.querySelector('[data-testid="category-tag"]') !== null

        cleanup()
        return hasName && hasCategoryTag
      }),
      { numRuns: 100 }
    )
  })

  // Feature: template-card-preview-effect, Property 4: 点击任意卡片触发正确回调
  it('Property 4: 点击任意卡片调用 onTemplateSelect 恰好一次，参数为对应模板', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryTemplate(), { minLength: 1, maxLength: 5 }),
        fc.nat({ max: 4 }),
        (templates, rawIdx) => {
          const idx = rawIdx % templates.length
          const targetTemplate = templates[idx]
          const onSelect = vi.fn()

          const { getAllByTestId } = render(
            <TemplateSelector
              templates={templates}
              onTemplateSelect={onSelect}
              onApplyModeChange={noop}
              onConfirm={noop}
            />
          )

          const cards = getAllByTestId('preview-card')
          fireEvent.click(cards[idx])

          const calledOnce = onSelect.mock.calls.length === 1
          const calledWithCorrectTemplate =
            calledOnce && onSelect.mock.calls[0][0].id === targetTemplate.id

          cleanup()
          return calledOnce && calledWithCorrectTemplate
        }
      ),
      { numRuns: 100 }
    )
  })

  // Feature: template-card-preview-effect, Property 5: 选中模板显示蓝色高亮边框
  it('Property 5: 选中卡片 border 为 "3px solid #3498db"，其他卡片不是', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryTemplate(), { minLength: 1, maxLength: 5 }),
        fc.nat({ max: 4 }),
        (templates, rawIdx) => {
          const idx = rawIdx % templates.length
          const selectedTemplate = templates[idx]

          const { getAllByTestId } = render(
            <TemplateSelector
              templates={templates}
              selectedTemplate={selectedTemplate}
              onTemplateSelect={noop}
              onApplyModeChange={noop}
              onConfirm={noop}
            />
          )

          const cards = getAllByTestId('preview-card')
          const result = cards.every((card, i) => {
            const isSelected = templates[i].id === selectedTemplate.id
            if (isSelected) {
              return card.style.border === '3px solid #3498db' || card.style.border === '3px solid rgb(52, 152, 219)'
            } else {
              return card.style.border !== '3px solid #3498db' && card.style.border !== '3px solid rgb(52, 152, 219)'
            }
          })

          cleanup()
          return result
        }
      ),
      { numRuns: 100 }
    )
  })

  // Feature: template-card-preview-effect, Property 6: 分类过滤返回正确子集
  it('Property 6: 分类过滤后显示的卡片数量等于匹配的模板数量', () => {
    type FilterCategory = 'all' | TemplateCategory
    const filterCategories: FilterCategory[] = ['all', 'classic', 'modern', 'minimal', 'creative']

    const labelMap: Record<FilterCategory, string> = {
      all: '全部',
      classic: '经典',
      modern: '现代',
      minimal: '简约',
      creative: '创意',
    }

    fc.assert(
      fc.property(
        fc.array(arbitraryTemplate(), { minLength: 0, maxLength: 10 }),
        fc.constantFrom(...filterCategories),
        (templates, filterCategory) => {
          const { queryAllByTestId, container } = render(
            <TemplateSelector
              templates={templates}
              onTemplateSelect={noop}
              onApplyModeChange={noop}
              onConfirm={noop}
            />
          )

          // Find filter buttons scoped to this render's container
          const buttons = container.querySelectorAll('button')
          const targetLabel = labelMap[filterCategory]
          const filterBtn = Array.from(buttons).find((btn) => btn.textContent === targetLabel)
          if (filterBtn) {
            fireEvent.click(filterBtn)
          }

          const cards = queryAllByTestId('preview-card')
          const expectedCount =
            filterCategory === 'all'
              ? templates.length
              : templates.filter((t) => t.category === filterCategory).length

          cleanup()
          return cards.length === expectedCount
        }
      ),
      { numRuns: 100 }
    )
  })
})
