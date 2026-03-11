/**
 * AgentActionManager - AI Action 执行管理器
 * 管理和执行 AI 返回的各种操作
 */

import type { LeaferEditor } from '../../canvas/LeaferEditor'
import type {
  AgentAction,
  ResumeElement,
  Streaming,
} from '@resume-editor/shared'
import { createStreaming, AgentActionSchema } from '@resume-editor/shared'
import { ZodError } from 'zod'

export interface ActionManagerConfig {
  /** 编辑器实例 */
  editor: LeaferEditor
  /** Action 执行前回调 */
  onBeforeAction?: (action: AgentAction) => void
  /** Action 执行后回调 */
  onAfterAction?: (action: AgentAction, result: ActionResult) => void
  /** Action 错误回调 */
  onError?: (action: AgentAction, error: Error) => void
}

export interface ActionResult {
  success: boolean
  message?: string
  data?: unknown
}

export class AgentActionManager {
  private editor: LeaferEditor
  private onBeforeAction?: (action: AgentAction) => void
  private onAfterAction?: (action: AgentAction, result: ActionResult) => void
  private onError?: (action: AgentAction, error: Error) => void

  constructor(config: ActionManagerConfig) {
    this.editor = config.editor
    this.onBeforeAction = config.onBeforeAction
    this.onAfterAction = config.onAfterAction
    this.onError = config.onError
  }

  /**
   * 执行 Action
   */
  async executeAction(action: AgentAction): Promise<ActionResult> {
    try {
      // 前置回调
      this.onBeforeAction?.(action)

      let result: ActionResult

      switch (action._type) {
        case 'create-element':
          result = this.executeCreateElement(action)
          break
        case 'update-element':
          result = this.executeUpdateElement(action)
          break
        case 'delete-element':
          result = this.executeDeleteElement(action)
          break
        case 'move-element':
          result = this.executeMoveElement(action)
          break
        case 'resize-element':
          result = this.executeResizeElement(action)
          break
        case 'edit-text':
          result = this.executeEditText(action)
          break
        case 'set-style':
          result = this.executeSetStyle(action)
          break
        case 'align-elements':
          result = this.executeAlignElements(action)
          break
        case 'distribute-elements':
          result = this.executeDistributeElements(action)
          break
        case 'clear-canvas':
          result = this.executeClearCanvas(action)
          break
        case 'message':
          result = this.executeMessage(action)
          break
        case 'think':
          result = this.executeThink(action)
          break
        case 'undo':
          result = this.executeUndo(action)
          break
        case 'redo':
          result = this.executeRedo(action)
          break
        case 'apply-template':
        case 'generate-template':
          // 这些需要额外的模板管理器
          result = { success: false, message: 'Template actions require TemplateManager' }
          break
        default:
          result = { success: false, message: `Unknown action type: ${(action as any)._type}` }
      }

      // 后置回调
      this.onAfterAction?.(action, result)

      return result
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      this.onError?.(action, err)
      return { success: false, message: err.message }
    }
  }

  /**
   * 批量执行 Actions
   */
  async executeActions(actions: AgentAction[]): Promise<ActionResult[]> {
    const results: ActionResult[] = []
    for (const action of actions) {
      const result = await this.executeAction(action)
      results.push(result)
    }
    return results
  }

  /**
   * 验证 Action
   */
  validateAction(action: unknown): { valid: boolean; action?: AgentAction; error?: string } {
    try {
      const validated = AgentActionSchema.parse(action)
      return { valid: true, action: validated }
    } catch (error) {
      if (error instanceof ZodError) {
        return { valid: false, error: error.message }
      }
      return { valid: false, error: 'Unknown validation error' }
    }
  }

  // ============ Action 执行实现 ============

  private executeCreateElement(action: Extract<AgentAction, { _type: 'create-element' }>): ActionResult {
    const element = action.element as ResumeElement
    const leaferElement = this.editor.createElement(element, { id: element.id })

    if (leaferElement) {
      return {
        success: true,
        message: `Created ${element.type} element`,
        data: { elementId: leaferElement.id },
      }
    }

    return { success: false, message: 'Failed to create element' }
  }

  private executeUpdateElement(action: Extract<AgentAction, { _type: 'update-element' }>): ActionResult {
    const success = this.editor.updateElement(action.elementId, action.updates as Partial<ResumeElement>)

    return {
      success,
      message: success ? `Updated element ${action.elementId}` : `Failed to update element ${action.elementId}`,
    }
  }

  private executeDeleteElement(action: Extract<AgentAction, { _type: 'delete-element' }>): ActionResult {
    const deletedCount = this.editor.deleteElements(action.elementIds)

    return {
      success: deletedCount > 0,
      message: `Deleted ${deletedCount} element(s)`,
      data: { deletedCount },
    }
  }

  private executeMoveElement(action: Extract<AgentAction, { _type: 'move-element' }>): ActionResult {
    let movedCount = 0

    action.elementIds.forEach((id) => {
      const element = this.editor.getElement(id)
      if (element) {
        const currentX = element.x || 0
        const currentY = element.y || 0
        const success = this.editor.updateElement(id, {
          x: currentX + action.deltaX,
          y: currentY + action.deltaY,
        } as Partial<ResumeElement>)
        if (success) movedCount++
      }
    })

    return {
      success: movedCount > 0,
      message: `Moved ${movedCount} element(s)`,
    }
  }

  private executeResizeElement(action: Extract<AgentAction, { _type: 'resize-element' }>): ActionResult {
    const updates: Partial<ResumeElement> = {}
    if (action.width !== undefined) updates.width = action.width
    if (action.height !== undefined) updates.height = action.height

    const success = this.editor.updateElement(action.elementId, updates)

    return {
      success,
      message: success ? `Resized element ${action.elementId}` : `Failed to resize element ${action.elementId}`,
    }
  }

  private executeEditText(action: Extract<AgentAction, { _type: 'edit-text' }>): ActionResult {
    const updates: Partial<ResumeElement> = {}
    if (action.content !== undefined) updates.content = action.content
    if (action.fontSize !== undefined) updates.fontSize = action.fontSize
    if (action.fontWeight !== undefined) updates.fontWeight = action.fontWeight
    if (action.fontStyle !== undefined) updates.fontStyle = action.fontStyle
    if (action.fill !== undefined) updates.fill = action.fill
    if (action.textAlign !== undefined) updates.textAlign = action.textAlign

    const success = this.editor.updateElement(action.elementId, updates)

    return {
      success,
      message: success ? `Edited text element ${action.elementId}` : `Failed to edit text element ${action.elementId}`,
    }
  }

  private executeSetStyle(action: Extract<AgentAction, { _type: 'set-style' }>): ActionResult {
    const updates: Partial<ResumeElement> = {}
    if (action.fill !== undefined) updates.fill = action.fill
    if (action.stroke !== undefined) updates.stroke = action.stroke
    if (action.strokeWidth !== undefined) updates.strokeWidth = action.strokeWidth
    if (action.opacity !== undefined) updates.opacity = action.opacity

    let updatedCount = 0
    action.elementIds.forEach((id) => {
      const success = this.editor.updateElement(id, updates)
      if (success) updatedCount++
    })

    return {
      success: updatedCount > 0,
      message: `Updated style for ${updatedCount} element(s)`,
    }
  }

  private executeAlignElements(action: Extract<AgentAction, { _type: 'align-elements' }>): ActionResult {
    // 获取所有要对其的元素
    const elements = action.elementIds
      .map((id) => this.editor.getElement(id))
      .filter((el) => el !== undefined)

    if (elements.length < 2) {
      return { success: false, message: 'Need at least 2 elements to align' }
    }

    // 计算边界
    const bounds = elements.map((el) => ({
      x: el?.x || 0,
      y: el?.y || 0,
      width: el?.width || 0,
      height: el?.height || 0,
      centerX: (el?.x || 0) + (el?.width || 0) / 2,
      centerY: (el?.y || 0) + (el?.height || 0) / 2,
    }))

    const minLeft = Math.min(...bounds.map((b) => b.x))
    const maxRight = Math.max(...bounds.map((b) => b.x + b.width))
    const minTop = Math.min(...bounds.map((b) => b.y))
    const maxBottom = Math.max(...bounds.map((b) => b.y + b.height))
    const centerX = (minLeft + maxRight) / 2
    const centerY = (minTop + maxBottom) / 2

    // 根据对齐方式更新位置
    elements.forEach((el, index) => {
      if (!el) return
      const bound = bounds[index]
      let newX = el.x
      let newY = el.y

      switch (action.alignment) {
        case 'left':
          newX = minLeft
          break
        case 'center':
          newX = centerX - bound.width / 2
          break
        case 'right':
          newX = maxRight - bound.width
          break
        case 'top':
          newY = minTop
          break
        case 'middle':
          newY = centerY - bound.height / 2
          break
        case 'bottom':
          newY = maxBottom - bound.height
          break
      }

      this.editor.updateElement(el.id as string, { x: newX, y: newY } as Partial<ResumeElement>)
    })

    return { success: true, message: `Aligned ${elements.length} elements` }
  }

  private executeDistributeElements(action: Extract<AgentAction, { _type: 'distribute-elements' }>): ActionResult {
    const elements = action.elementIds
      .map((id) => this.editor.getElement(id))
      .filter((el) => el !== undefined)

    if (elements.length < 3) {
      return { success: false, message: 'Need at least 3 elements to distribute' }
    }

    // 获取元素边界并排序
    const elementsWithBounds = elements.map((el, index) => ({
      element: el,
      id: action.elementIds[index],
      x: el?.x || 0,
      y: el?.y || 0,
      width: el?.width || 0,
      height: el?.height || 0,
    }))

    if (action.direction === 'horizontal') {
      elementsWithBounds.sort((a, b) => a.x - b.x)
      const first = elementsWithBounds[0]
      const last = elementsWithBounds[elementsWithBounds.length - 1]
      const totalWidth = last.x + last.width - first.x
      const elementsWidth = elementsWithBounds.reduce((sum, e) => sum + e.width, 0)
      const gap = (totalWidth - elementsWidth) / (elementsWithBounds.length - 1)

      let currentX = first.x
      elementsWithBounds.forEach((e) => {
        this.editor.updateElement(e.id, { x: currentX } as Partial<ResumeElement>)
        currentX += e.width + gap
      })
    } else {
      elementsWithBounds.sort((a, b) => a.y - b.y)
      const first = elementsWithBounds[0]
      const last = elementsWithBounds[elementsWithBounds.length - 1]
      const totalHeight = last.y + last.height - first.y
      const elementsHeight = elementsWithBounds.reduce((sum, e) => sum + e.height, 0)
      const gap = (totalHeight - elementsHeight) / (elementsWithBounds.length - 1)

      let currentY = first.y
      elementsWithBounds.forEach((e) => {
        this.editor.updateElement(e.id, { y: currentY } as Partial<ResumeElement>)
        currentY += e.height + gap
      })
    }

    return { success: true, message: `Distributed ${elements.length} elements` }
  }

  private executeClearCanvas(action: Extract<AgentAction, { _type: 'clear-canvas' }>): ActionResult {
    this.editor.clearCanvas()
    return { success: true, message: 'Canvas cleared' }
  }

  private executeMessage(action: Extract<AgentAction, { _type: 'message' }>): ActionResult {
    // 消息类型不需要执行画布操作，由 UI 层处理显示
    return {
      success: true,
      message: action.message,
      data: { type: 'message', content: action.message },
    }
  }

  private executeThink(action: Extract<AgentAction, { _type: 'think' }>): ActionResult {
    // 思考类型是内部使用，不需要执行任何操作
    return {
      success: true,
      data: { type: 'think', thought: action.thought },
    }
  }

  private executeUndo(action: Extract<AgentAction, { _type: 'undo' }>): ActionResult {
    // 撤销需要通过历史管理器处理
    return {
      success: true,
      message: 'Undo requested',
      data: { type: 'undo', steps: action.steps },
    }
  }

  private executeRedo(action: Extract<AgentAction, { _type: 'redo' }>): ActionResult {
    // 重做需要通过历史管理器处理
    return {
      success: true,
      message: 'Redo requested',
      data: { type: 'redo', steps: action.steps },
    }
  }
}
