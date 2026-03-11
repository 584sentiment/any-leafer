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

    let description = `画布状态:\n`
    description += `- 画布尺寸: ${state.viewport.width}x${state.viewport.height}\n`
    description += `- 元素总数: ${state.elements.length}\n`
    description += `- 选中元素: ${selectedElements.length}个\n`

    if (selectedElements.length > 0) {
      description += `\n选中的元素:\n`
      selectedElements.forEach((el, index) => {
        description += `${index + 1}. ${el.type} (ID: ${el.id})\n`
        if (el.type === 'text' || el.type === 'heading') {
          const textEl = el as any
          description += `   内容: "${textEl.content.substring(0, 50)}${textEl.content.length > 50 ? '...' : ''}"\n`
        }
      })
    }

    // 元素类型统计
    const typeCount: Record<string, number> = {}
    state.elements.forEach((el) => {
      typeCount[el.type] = (typeCount[el.type] || 0) + 1
    })

    if (Object.keys(typeCount).length > 0) {
      description += `\n元素类型分布:\n`
      Object.entries(typeCount).forEach(([type, count]) => {
        description += `- ${type}: ${count}个\n`
      })
    }

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
