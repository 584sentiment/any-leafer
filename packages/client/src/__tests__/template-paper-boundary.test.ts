/**
 * Template Paper Boundary Fix Tests
 *
 * Validates that template elements are correctly mapped into the paper content area
 * using coordinate translation + scaling (not clamping).
 *
 * Bug condition: elements were placed at raw template coordinates (e.g. x=50, y=40)
 * which are relative to the template canvas origin, not the paper content bounds.
 *
 * Fix: translate + scale template coordinates so they land inside contentBounds.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  classicTemplate,
  minimalTemplate,
  minimalTwoColumnTemplate,
  creativeColorfulTemplate,
} from '@resume-editor/templates'
import { LeaferEditor } from '../canvas/LeaferEditor'
import { TemplateManager } from '../agent/managers/TemplateManager'
import type { ResumeElement, TextElement } from '@resume-editor/shared'

/** Mirror of LeaferEditor.setupPaperEffect calculation */
function calculateContentBounds(
  canvasWidth: number,
  canvasHeight: number,
  padding = 40,
  margin = 20,
  aspectRatio = 210 / 297
) {
  const availableWidth = canvasWidth - margin * 2
  const availableHeight = canvasHeight - margin * 2
  let paperWidth: number, paperHeight: number
  if (availableWidth / availableHeight > aspectRatio) {
    paperHeight = availableHeight
    paperWidth = paperHeight * aspectRatio
  } else {
    paperWidth = availableWidth
    paperHeight = paperWidth / aspectRatio
  }
  const paperX = (canvasWidth - paperWidth) / 2
  const paperY = (canvasHeight - paperHeight) / 2
  return {
    x: paperX + padding,
    y: paperY + padding,
    width: paperWidth - padding * 2,
    height: paperHeight - padding * 2,
  }
}

/** Expected mapped position for a template element */
function expectedMappedElement(
  el: ResumeElement,
  contentBounds: { x: number; y: number; width: number; height: number },
  templateCanvasSize: { width: number; height: number }
) {
  const scaleX = contentBounds.width / templateCanvasSize.width
  const scaleY = contentBounds.height / templateCanvasSize.height
  return {
    x: contentBounds.x + el.x * scaleX,
    y: contentBounds.y + el.y * scaleY,
    width: el.width * scaleX,
    height: el.height * scaleY,
  }
}

describe('Bug Condition: Template elements mapped into paper content bounds', () => {
  const canvasWidth = 800
  const canvasHeight = 1200

  let container: HTMLDivElement
  let editor: LeaferEditor
  let templateManager: TemplateManager

  beforeEach(async () => {
    container = document.createElement('div')
    container.style.width = `${canvasWidth}px`
    container.style.height = `${canvasHeight}px`
    document.body.appendChild(container)

    editor = new LeaferEditor({
      container,
      width: canvasWidth,
      height: canvasHeight,
      paperEffect: { enabled: false },
    })
    await editor.init()

    // Simulate paper effect by injecting content bounds
    editor.setPaperContentBounds(calculateContentBounds(canvasWidth, canvasHeight))

    templateManager = new TemplateManager({
      editor,
      templates: [classicTemplate, minimalTemplate, minimalTwoColumnTemplate, creativeColorfulTemplate],
    })
  })

  afterEach(() => {
    editor?.destroy()
    container?.parentNode?.removeChild(container)
  })

  const templates = [
    { name: 'classic-1', template: classicTemplate },
    { name: 'minimal-1', template: minimalTemplate },
    { name: 'minimal-2', template: minimalTwoColumnTemplate },
    { name: 'creative-1', template: creativeColorfulTemplate },
  ]

  templates.forEach(({ name, template }) => {
    it(`${name}: elements are translated+scaled into paper content bounds`, () => {
      const contentBounds = editor.getPaperContentBounds()!
      const canvasSize = template.canvasSize ?? { width: 794, height: 1123 }

      templateManager.applyTemplate(template.id)
      const canvasElements = editor.getSnapshot()

      const templateElements = template.elements ?? []
      expect(canvasElements.length).toBe(templateElements.length)

      templateElements.forEach((templateEl) => {
        const canvasEl = canvasElements.find((el) => el.id === templateEl.id)
        expect(canvasEl, `Element ${templateEl.id} should exist`).toBeDefined()
        if (!canvasEl) return

        const expected = expectedMappedElement(templateEl, contentBounds, canvasSize)

        expect(canvasEl.x).toBeCloseTo(expected.x, 5)
        expect(canvasEl.y).toBeCloseTo(expected.y, 5)
        expect(canvasEl.width).toBeCloseTo(expected.width, 5)
        expect(canvasEl.height).toBeCloseTo(expected.height, 5)

        // All elements must also be within bounds (sanity check)
        expect(canvasEl.x).toBeGreaterThanOrEqual(contentBounds.x - 0.001)
        expect(canvasEl.y).toBeGreaterThanOrEqual(contentBounds.y - 0.001)
        expect(canvasEl.x + canvasEl.width).toBeLessThanOrEqual(
          contentBounds.x + contentBounds.width + 0.001
        )
        expect(canvasEl.y + canvasEl.height).toBeLessThanOrEqual(
          contentBounds.y + contentBounds.height + 0.001
        )
      })
    })
  })
})

/**
 * Preservation Property Tests
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4
 */
describe('Preservation Property Tests: Non-Template Operations Unchanged', () => {
  let container: HTMLDivElement
  let editor: LeaferEditor
  let templateManager: TemplateManager

  beforeEach(async () => {
    container = document.createElement('div')
    container.style.width = '800px'
    container.style.height = '1200px'
    document.body.appendChild(container)
  })

  afterEach(() => {
    editor?.destroy()
    container?.parentNode?.removeChild(container)
  })

  it('should preserve element positions when paper effect is disabled (Req 3.3)', async () => {
    editor = new LeaferEditor({
      container,
      width: 800,
      height: 1200,
      paperEffect: { enabled: false },
    })
    await editor.init()

    templateManager = new TemplateManager({
      editor,
      templates: [classicTemplate],
    })

    templateManager.applyTemplate(classicTemplate.id)
    const elements = editor.getSnapshot()

    const templateElements = classicTemplate.elements ?? []
    templateElements.forEach((templateEl: ResumeElement) => {
      const canvasEl = elements.find((el) => el.id === templateEl.id)
      expect(canvasEl, `Element ${templateEl.id} should exist`).toBeDefined()
      if (!canvasEl) return
      expect(canvasEl.x).toBe(templateEl.x)
      expect(canvasEl.y).toBe(templateEl.y)
      expect(canvasEl.width).toBe(templateEl.width)
      expect(canvasEl.height).toBe(templateEl.height)
    })
  })

  it('should allow manual element creation at any position (Req 3.2)', async () => {
    editor = new LeaferEditor({
      container,
      width: 800,
      height: 1200,
      paperEffect: { enabled: false },
    })
    await editor.init()

    expect(editor.getPaperContentBounds()).toBeNull()

    const testPositions = [
      { x: 10, y: 10 },
      { x: 0, y: 0 },
      { x: 50, y: 50 },
      { x: 400, y: 600 },
    ]

    for (const pos of testPositions) {
      const elementId = `manual-element-${pos.x}-${pos.y}`
      const manualElement: TextElement = {
        id: elementId,
        type: 'text',
        x: pos.x,
        y: pos.y,
        width: 200,
        height: 30,
        content: 'Manual Test Element',
        fontSize: 16,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'left',
        fill: '#000000',
      }

      editor.createElement(manualElement, { id: elementId })

      const createdElement = editor.getSnapshot().find((el) => el.id === elementId)
      expect(createdElement, `Element at (${pos.x}, ${pos.y}) should exist`).toBeDefined()
      expect(createdElement?.x).toBe(pos.x)
      expect(createdElement?.y).toBe(pos.y)
      expect(createdElement?.width).toBe(200)
      expect(createdElement?.height).toBe(30)
    }
  })

  it('should preserve template visual style (fonts, colors) (Req 3.4)', async () => {
    editor = new LeaferEditor({
      container,
      width: 800,
      height: 1200,
      paperEffect: { enabled: false },
    })
    await editor.init()

    templateManager = new TemplateManager({ editor, templates: [minimalTemplate] })
    templateManager.applyTemplate(minimalTemplate.id)
    const elements = editor.getSnapshot()

    const templateElements = minimalTemplate.elements ?? []
    templateElements.forEach((templateEl: ResumeElement) => {
      const canvasEl = elements.find((el) => el.id === templateEl.id)
      expect(canvasEl, `Element ${templateEl.id} should exist`).toBeDefined()
      if (!canvasEl) return

      if (canvasEl.type === 'text' || canvasEl.type === 'heading') {
        const tEl = templateEl as any
        const cEl = canvasEl as any
        if (tEl.fontSize) expect(cEl.fontSize).toBe(tEl.fontSize)
        if (tEl.fontFamily) expect(cEl.fontFamily).toBe(tEl.fontFamily)
        if (tEl.fill) expect(cEl.fill).toBe(tEl.fill)
      }
    })

    // Relative positions preserved (no paper effect = no scaling)
    if (elements.length >= 2) {
      const templateDeltaX = templateElements[1].x - templateElements[0].x
      const templateDeltaY = templateElements[1].y - templateElements[0].y
      expect(elements[1].x - elements[0].x).toBe(templateDeltaX)
      expect(elements[1].y - elements[0].y).toBe(templateDeltaY)
    }
  })

  it('should not modify manually created elements (Req 3.1)', async () => {
    editor = new LeaferEditor({
      container,
      width: 800,
      height: 1200,
      paperEffect: { enabled: false },
    })
    await editor.init()

    const testElements = [
      { id: 'element-1', x: 100, y: 150, width: 200, height: 30 },
      { id: 'element-2', x: 200, y: 300, width: 400, height: 50 },
    ]

    for (const testEl of testElements) {
      const element: TextElement = {
        ...testEl,
        type: 'text',
        content: 'Test',
        fontSize: 16,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'left',
        fill: '#000000',
      }
      editor.createElement(element, { id: element.id })

      const created = editor.getSnapshot().find((el) => el.id === element.id)
      expect(created?.x).toBe(testEl.x)
      expect(created?.y).toBe(testEl.y)
      expect(created?.width).toBe(testEl.width)
      expect(created?.height).toBe(testEl.height)
    }
  })
})
