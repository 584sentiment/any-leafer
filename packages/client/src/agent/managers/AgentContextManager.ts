/**
 * AgentContextManager - Agent 上下文管理器
 * 管理当前上下文信息，供 AI 使用
 */

import type { LeaferEditor } from '../../canvas/LeaferEditor'
import type { CanvasState, ResumeElement } from '@resume-editor/shared'

export interface ContextManagerConfig {
  editor: LeaferEditor
}

export class AgentContextManager {
  private editor: LeaferEditor

  constructor(config: ContextManagerConfig) {
    this.editor = config.editor
  }

  /**
   * 获取当前画布状态
   */
  getCanvasState(): CanvasState {
    return this.editor.getCanvasState()
  }

  /**
   * 获取选中的元素
   */
  getSelectedElements(): ResumeElement[] {
    const state = this.getCanvasState()
    const selectionIds = new Set(state.selection)
    return state.elements.filter((el) => selectionIds.has(el.id))
  }

  /**
   * 获取选中元素的 ID 列表
   */
  getSelectedElementIds(): string[] {
    return this.editor.getSelectedElementIds()
  }

  /**
   * 获取元素数量
   */
  getElementCount(): number {
    return this.editor.getAllElements().length
  }

  /**
   * 获取画布尺寸
   */
  getCanvasSize(): { width: number; height: number } {
    const state = this.getCanvasState()
    return {
      width: state.viewport.width,
      height: state.viewport.height,
    }
  }

  /**
   * 生成上下文描述（供 AI 使用）
   */
  generateContextDescription(): string {
    const state = this.getCanvasState()
    const selectedElements = this.getSelectedElements()

    let description = `## 画布状态\n`
    description += `- 画布尺寸: ${state.viewport.width}x${state.viewport.height}\n`
    description += `- 元素总数: ${state.elements.length}\n`
    description += `- 选中元素: ${selectedElements.length}个\n`

    // 添加纸张信息描述
    if (state.paper) {
      const { bounds, contentBounds } = state.paper
      description += `\n## 纸张信息\n`
      description += `- 纸张位置: (${Math.round(bounds.x)}, ${Math.round(bounds.y)})\n`
      description += `- 纸张尺寸: ${Math.round(bounds.width)} x ${Math.round(bounds.height)}\n`
      description += `- 内容区域起始: (${Math.round(contentBounds.x)}, ${Math.round(contentBounds.y)})\n`
      description += `- 内容区域尺寸: ${Math.round(contentBounds.width)} x ${Math.round(contentBounds.height)}\n`
      description += `\n**重要**: 创建元素时，坐标应相对于画布左上角（绝对坐标）。元素应放置在内容区域内，即 x >= ${Math.round(contentBounds.x)}, y >= ${Math.round(contentBounds.y)}, x + width <= ${Math.round(contentBounds.x + contentBounds.width)}, y + height <= ${Math.round(contentBounds.y + contentBounds.height)}\n`
    }

    // 列出所有元素的详细信息（关键：让 AI 知道每个元素的 ID 和属性）
    if (state.elements.length > 0) {
      description += `\n## 画布上的所有元素\n`
      description += `以下是当前画布上所有元素的详细信息，你可以使用 elementId 来操作它们：\n\n`

      state.elements.forEach((el, index) => {
        description += `### 元素 ${index + 1} (ID: "${el.id}")\n`
        description += `- 类型: ${el.type}\n`
        description += `- 位置: (${el.x}, ${el.y})\n`
        description += `- 尺寸: ${el.width}x${el.height}\n`

        // 文本元素的额外信息
        if (el.type === 'text' || el.type === 'heading') {
          const textEl = el as any
          description += `- 内容: "${textEl.content}"\n`
          if (textEl.fontSize) description += `- 字体大小: ${textEl.fontSize}\n`
          if (textEl.fill) description += `- 颜色: ${textEl.fill}\n`
          if (textEl.textAlign) description += `- 对齐: ${textEl.textAlign}\n`
        }

        // 形状元素的额外信息
        if (el.type === 'rect' || el.type === 'ellipse') {
          const shapeEl = el as any
          if (shapeEl.fill) description += `- 填充色: ${shapeEl.fill}\n`
          if (shapeEl.stroke) description += `- 描边色: ${shapeEl.stroke}\n`
        }

        // 通用属性
        if (el.opacity !== undefined && el.opacity !== 1) {
          description += `- 透明度: ${el.opacity}\n`
        }
        if (el.rotation) {
          description += `- 旋转: ${el.rotation}弧度\n`
        }

        description += `\n`
      })
    }

    // 选中的元素（如果有）
    if (selectedElements.length > 0) {
      description += `## 当前选中的元素\n`
      selectedElements.forEach((el, index) => {
        description += `${index + 1}. ${el.type} (ID: "${el.id}")\n`
        if (el.type === 'text' || el.type === 'heading') {
          const textEl = el as any
          description += `   内容: "${textEl.content.substring(0, 50)}${textEl.content.length > 50 ? '...' : ''}"\n`
        }
      })
      description += `\n`
    }

    // 添加操作提示
    description += `## 操作提示\n`
    description += `- 要修改元素，使用 update-element 或 edit-text，并提供正确的 elementId\n`
    description += `- 要移动元素，使用 move-element，deltaX 和 deltaY 是相对偏移量\n`
    description += `- 要删除元素，使用 delete-element，elementIds 是 ID 数组\n`

    return description
  }

  /**
   * 获取元素详情
   */
  getElementDetails(elementId: string): ResumeElement | null {
    const state = this.getCanvasState()
    return state.elements.find((el) => el.id === elementId) || null
  }

  /**
   * 查找元素（按标签或内容）
   */
  findElements(query: string): ResumeElement[] {
    const state = this.getCanvasState()
    const lowerQuery = query.toLowerCase()

    return state.elements.filter((el) => {
      // 检查标签
      if (el.tag?.toLowerCase().includes(lowerQuery)) return true

      // 检查文本内容
      if (el.type === 'text' || el.type === 'heading') {
        const textEl = el as any
        if (textEl.content?.toLowerCase().includes(lowerQuery)) return true
      }

      return false
    })
  }
}
