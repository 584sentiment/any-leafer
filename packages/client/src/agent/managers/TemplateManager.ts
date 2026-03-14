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
   * 将模板元素坐标（相对于模板 canvasSize 的 0,0 原点）映射到纸张的画布绝对坐标。
   *
   * 模板坐标系：以模板 canvasSize（如 794×1123）为参考，从 (0,0) 开始，
   * 对应纸张左上角（不含 padding）。
   *
   * 转换步骤：
   *   1. 按比例缩放：scaleX = paperBounds.width / templateWidth
   *   2. 平移：加上 paperBounds.x / paperBounds.y 偏移（纸张左上角的画布坐标）
   *
   * 如果未启用纸张效果（paperBounds 为 null），返回原元素不变。
   */
  private adjustElementToPaperBounds(element: ResumeElement, templateCanvasSize?: { width: number; height: number }): ResumeElement {
    const paperBounds = this.editor.getPaperBounds()
    if (paperBounds === null) {
      return element
    }

    // 模板参考尺寸：优先使用传入的 canvasSize，否则默认 A4 @ 96dpi
    const templateWidth = templateCanvasSize?.width ?? 794
    const templateHeight = templateCanvasSize?.height ?? 1123

    // 按纸张尺寸缩放（保持比例）
    const scaleX = paperBounds.width / templateWidth
    const scaleY = paperBounds.height / templateHeight

    return {
      ...element,
      x: paperBounds.x + element.x * scaleX,
      y: paperBounds.y + element.y * scaleY,
      width: element.width * scaleX,
      height: element.height * scaleY,
    }
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
      const adjustedElement = this.adjustElementToPaperBounds(element, template.canvasSize)
      this.editor.createElement(adjustedElement, { id: adjustedElement.id })
    })

    return true
  }

  /**
   * 应用元素列表到画布
   * @param elements 元素列表
   * @param templateCanvasSize 模板参考画布尺寸，用于坐标映射
   */
  applyElements(elements: ResumeElement[], templateCanvasSize?: { width: number; height: number }): void {
    // 清空当前画布
    this.editor.clearCanvas()

    // 创建所有元素
    elements.forEach((element) => {
      const adjustedElement = this.adjustElementToPaperBounds(element, templateCanvasSize)
      this.editor.createElement(adjustedElement, { id: adjustedElement.id })
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
