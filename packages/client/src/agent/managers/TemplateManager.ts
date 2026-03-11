/**
 * TemplateManager - 模板管理器
 * 管理简历模板的加载、保存和应用
 */

import type { LeaferEditor } from '../../canvas/LeaferEditor'
import type { ResumeTemplate, ResumeElement } from '@resume-editor/shared'
import { v4 as uuidv4 } from 'uuid'

export interface TemplateManagerConfig {
  editor: LeaferEditor
  templates?: ResumeTemplate[]
}

export class TemplateManager {
  private editor: LeaferEditor
  private templates: Map<string, ResumeTemplate> = new Map()

  constructor(config: TemplateManagerConfig) {
    this.editor = config.editor

    // 注册初始模板
    config.templates?.forEach((template) => {
      this.templates.set(template.id, template)
    })
  }

  /**
   * 注册模板
   */
  registerTemplate(template: ResumeTemplate): void {
    this.templates.set(template.id, template)
  }

  /**
   * 获取模板
   */
  getTemplate(templateId: string): ResumeTemplate | undefined {
    return this.templates.get(templateId)
  }

  /**
   * 获取所有模板
   */
  getAllTemplates(): ResumeTemplate[] {
    return Array.from(this.templates.values())
  }

  /**
   * 按分类获取模板
   */
  getTemplatesByCategory(category: ResumeTemplate['category']): ResumeTemplate[] {
    return this.getAllTemplates().filter((t) => t.category === category)
  }

  /**
   * 应用模板到画布
   */
  applyTemplate(templateId: string): boolean {
    const template = this.templates.get(templateId)
    if (!template) return false

    // 清空当前画布
    this.editor.clearCanvas()

    // 创建模板中的所有元素
    template.elements.forEach((element) => {
      this.editor.createElement(element, { id: element.id })
    })

    return true
  }

  /**
   * 从当前画布创建模板
   */
  createTemplateFromCanvas(
    name: string,
    category: ResumeTemplate['category'],
    description?: string
  ): ResumeTemplate {
    const state = this.editor.getCanvasState()

    const template: ResumeTemplate = {
      id: uuidv4(),
      name,
      description,
      category,
      elements: state.elements,
      canvasSize: {
        width: state.viewport.width,
        height: state.viewport.height,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    this.templates.set(template.id, template)
    return template
  }

  /**
   * 删除模板
   */
  deleteTemplate(templateId: string): boolean {
    return this.templates.delete(templateId)
  }

  /**
   * 更新模板
   */
  updateTemplate(
    templateId: string,
    updates: Partial<Omit<ResumeTemplate, 'id' | 'createdAt'>>
  ): ResumeTemplate | null {
    const template = this.templates.get(templateId)
    if (!template) return null

    const updated = {
      ...template,
      ...updates,
      updatedAt: Date.now(),
    }

    this.templates.set(templateId, updated)
    return updated
  }

  /**
   * 导出模板为 JSON
   */
  exportTemplate(templateId: string): string | null {
    const template = this.templates.get(templateId)
    if (!template) return null

    return JSON.stringify(template, null, 2)
  }

  /**
   * 从 JSON 导入模板
   */
  importTemplate(json: string): ResumeTemplate | null {
    try {
      const template = JSON.parse(json) as ResumeTemplate

      // 验证必要字段
      if (!template.id || !template.name || !template.category || !Array.isArray(template.elements)) {
        return null
      }

      // 生成新 ID 避免冲突
      template.id = uuidv4()
      template.createdAt = Date.now()
      template.updatedAt = Date.now()

      this.templates.set(template.id, template)
      return template
    } catch {
      return null
    }
  }
}
