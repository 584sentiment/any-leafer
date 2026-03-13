/**
 * TemplateManager - 模板管理器
 * 管理简历模板的加载、保存和应用
 */

import type { LeaferEditor } from '../../canvas/LeaferEditor'
import type { ResumeTemplate, ResumeElement, ResumeData } from '@resume-editor/shared'
import { v4 as uuidv4 } from 'uuid'

export interface TemplateManagerConfig {
  editor: LeaferEditor
  templates?: ResumeTemplate[]
  /** API 端点，用于智能生成 */
  apiEndpoint?: string
}

export class TemplateManager {
  private editor: LeaferEditor
  private templates: Map<string, ResumeTemplate> = new Map()
  private apiEndpoint?: string

  constructor(config: TemplateManagerConfig) {
    this.editor = config.editor
    this.apiEndpoint = config.apiEndpoint

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
   * 应用模板到画布（快速应用模式）
   */
  applyTemplate(templateId: string): boolean {
    const template = this.templates.get(templateId)
    if (!template) return false

    // 清空当前画布
    this.editor.clearCanvas()

    // 创建模板中的所有元素
    const elements = template.elements || []
    elements.forEach((element) => {
      this.editor.createElement(element, { id: element.id })
    })

    return true
  }

  /**
   * 应用元素列表到画布
   */
  applyElements(elements: ResumeElement[]): void {
    // 清空当前画布
    this.editor.clearCanvas()

    // 创建所有元素
    elements.forEach((element) => {
      this.editor.createElement(element, { id: element.id })
    })
  }

  /**
   * 智能生成简历（调用后端 API）
   */
  async generateSmartTemplate(
    templateId: string,
    resumeData: ResumeData
  ): Promise<ResumeElement[]> {
    const template = this.templates.get(templateId)
    if (!template) {
      throw new Error('模板不存在')
    }

    if (!this.apiEndpoint) {
      throw new Error('未配置 API 端点')
    }

    try {
      const response = await fetch(`${this.apiEndpoint}/api/template/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId,
          templateConfig: {
            category: template.category,
            smartConfig: template.smartConfig,
            canvasSize: template.canvasSize,
          },
          resumeData,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: '生成失败' }))
        throw new Error(error.message || '生成失败')
      }

      const result = await response.json()
      return result.elements as ResumeElement[]
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('网络请求失败')
    }
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
      const hasElements = Array.isArray(template.elements) && template.elements.length > 0
      const hasSmartConfig = template.smartConfig !== undefined

      if (!template.id || !template.name || !template.category || (!hasElements && !hasSmartConfig)) {
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
