/**
 * LeaferEditor - LeaferJS 画布编辑器核心类
 * 负责画布初始化、元素管理、编辑器功能
 */

import { Leafer, Rect, Text, Ellipse, Line, Image, Group, UI } from 'leafer-ui'
import '@leafer-in/editor'
import '@leafer-in/view'
import '@leafer-in/export'

import type {
  ResumeElement,
  TextElement,
  RectElement,
  EllipseElement,
  LineElement,
  ImageElement,
  GroupElement,
  CanvasState,
  ViewportState,
  ExportOptions,
} from '@resume-editor/shared'
import { v4 as uuidv4 } from 'uuid'

/**
 * LeaferEditor 配置
 */
export interface LeaferEditorConfig {
  /** 容器元素 */
  container: HTMLElement | string
  /** 画布宽度 */
  width: number
  /** 画布高度 */
  height: number
  /** 背景色 */
  backgroundColor?: string
  /** 是否启用编辑器 */
  editable?: boolean
  /** 是否启用吸附 */
  snap?: boolean
  /** 吸附阈值 */
  snapThreshold?: number
}

/**
 * 元素创建选项
 */
export interface CreateElementOptions {
  /** 不生成新 ID，使用指定的 ID */
  id?: string
}

/**
 * LeaferJS 画布编辑器
 */
export class LeaferEditor {
  private leafer: Leafer | null = null
  private config: LeaferEditorConfig
  private elementsMap: Map<string, UI> = new Map()
  private container: HTMLElement

  constructor(config: LeaferEditorConfig) {
    this.config = {
      editable: true,
      snap: true,
      snapThreshold: 5,
      backgroundColor: '#ffffff',
      ...config,
    }
    this.container =
      typeof config.container === 'string'
        ? document.querySelector(config.container)!
        : config.container
  }

  /**
   * 初始化编辑器
   */
  async init(): Promise<void> {
    this.leafer = new Leafer({
      view: this.container,
      width: this.config.width,
      height: this.config.height,
      fill: this.config.backgroundColor,
    })

    // 配置编辑器
    if (this.config.editable) {
      this.setupEditor()
    }

    // 配置吸附
    if (this.config.snap) {
      this.setupSnap()
    }
  }

  /**
   * 配置编辑器功能
   */
  private setupEditor(): void {
    if (!this.leafer) return

    // LeaferJS Editor 插件会自动添加选择、变换等功能
    // 这里可以配置编辑器选项
  }

  /**
   * 配置吸附功能
   */
  private setupSnap(): void {
    // 吸附功能配置
    // Leafer-in/editor 提供了吸附支持
  }

  /**
   * 获取 Leafer 实例
   */
  getLeafer(): Leafer | null {
    return this.leafer
  }

  /**
   * 创建元素
   */
  createElement(
    element: ResumeElement,
    options?: CreateElementOptions
  ): UI | null {
    if (!this.leafer) return null

    const id = options?.id || element.id || uuidv4()
    let leaferElement: UI | null = null

    switch (element.type) {
      case 'text':
      case 'heading':
        leaferElement = this.createTextElement(element as TextElement, id)
        break
      case 'rect':
        leaferElement = this.createRectElement(element as RectElement, id)
        break
      case 'ellipse':
        leaferElement = this.createEllipseElement(element as EllipseElement, id)
        break
      case 'line':
        leaferElement = this.createLineElement(element as LineElement, id)
        break
      case 'image':
        leaferElement = this.createImageElement(element as ImageElement, id)
        break
      case 'group':
        leaferElement = this.createGroupElement(element as GroupElement, id)
        break
      case 'divider':
        leaferElement = this.createDividerElement(element, id)
        break
    }

    if (leaferElement) {
      leaferElement.id = id
      this.leafer.add(leaferElement)
      this.elementsMap.set(id, leaferElement)
    }

    return leaferElement
  }

  /**
   * 创建文本元素
   */
  private createTextElement(element: TextElement, id: string): Text {
    return new Text({
      id,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      text: element.content,
      fontSize: element.fontSize,
      fontFamily: element.fontFamily,
      fontWeight: element.fontWeight as any,
      fontStyle: element.fontStyle,
      fill: element.fill,
      textAlign: element.textAlign,
      rotation: element.rotation,
      opacity: element.opacity,
      visible: element.visible ?? true,
      editable: true,
      zIndex: 0,
    })
  }

  /**
   * 创建矩形元素
   */
  private createRectElement(element: RectElement, id: string): Rect {
    return new Rect({
      id,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      fill: element.fill,
      stroke: element.stroke,
      strokeWidth: element.strokeWidth,
      cornerRadius: element.cornerRadius,
      rotation: element.rotation,
      opacity: element.opacity,
      visible: element.visible ?? true,
    })
  }

  /**
   * 创建椭圆元素
   */
  private createEllipseElement(element: EllipseElement, id: string): Ellipse {
    return new Ellipse({
      id,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      fill: element.fill,
      stroke: element.stroke,
      strokeWidth: element.strokeWidth,
      rotation: element.rotation,
      opacity: element.opacity,
      visible: element.visible ?? true,
    })
  }

  /**
   * 创建线条元素
   */
  private createLineElement(element: LineElement, id: string): Line {
    return new Line({
      id,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      stroke: element.stroke,
      strokeWidth: element.strokeWidth,
      rotation: element.rotation,
      opacity: element.opacity,
      visible: element.visible ?? true,
    })
  }

  /**
   * 创建图片元素
   */
  private createImageElement(element: ImageElement, id: string): Image {
    return new Image({
      id,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      url: element.src,
      rotation: element.rotation,
      opacity: element.opacity,
      visible: element.visible ?? true,
    })
  }

  /**
   * 创建分组元素
   */
  private createGroupElement(element: GroupElement, id: string): Group {
    return new Group({
      id,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      rotation: element.rotation,
      opacity: element.opacity,
      visible: element.visible ?? true,
    })
  }

  /**
   * 创建分隔线元素
   */
  private createDividerElement(element: ResumeElement, id: string): Line {
    const divider = element as any
    return new Line({
      id,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      stroke: divider.stroke || '#000000',
      strokeWidth: divider.strokeWidth || 1,
      rotation: element.rotation,
      opacity: element.opacity,
      visible: element.visible ?? true,
    })
  }

  /**
   * 更新元素
   */
  updateElement(elementId: string, updates: Partial<ResumeElement>): boolean {
    const element = this.elementsMap.get(elementId)
    if (!element) return false

    // 应用更新
    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'type' || key === 'id') return // 不允许更新 type 和 id

      // 映射属性名
      const propertyName = this.mapPropertyName(key)
      ;(element as any)[propertyName] = value
    })

    return true
  }

  /**
   * 映射属性名（ResumeElement -> Leafer Element）
   */
  private mapPropertyName(key: string): string {
    const mapping: Record<string, string> = {
      content: 'text',
      src: 'url',
    }
    return mapping[key] || key
  }

  /**
   * 删除元素
   */
  deleteElement(elementId: string): boolean {
    const element = this.elementsMap.get(elementId)
    if (!element) return false

    element.remove()
    this.elementsMap.delete(elementId)
    return true
  }

  /**
   * 批量删除元素
   */
  deleteElements(elementIds: string[]): number {
    let deleted = 0
    elementIds.forEach((id) => {
      if (this.deleteElement(id)) deleted++
    })
    return deleted
  }

  /**
   * 获取元素
   */
  getElement(elementId: string): UI | undefined {
    return this.elementsMap.get(elementId)
  }

  /**
   * 获取所有元素
   */
  getAllElements(): UI[] {
    return Array.from(this.elementsMap.values())
  }

  /**
   * 获取画布状态（供 AI 使用）
   */
  getCanvasState(): CanvasState {
    const elements = this.getAllElements().map((el) =>
      this.convertToResumeElement(el)
    )

    const viewport: ViewportState = {
      x: 0,
      y: 0,
      zoom: 1,
      width: this.config.width,
      height: this.config.height,
    }

    // 获取选中的元素
    const selection = this.getSelectedElementIds()

    return {
      elements,
      viewport,
      selection,
    }
  }

  /**
   * 将 Leafer 元素转换为 ResumeElement
   */
  private convertToResumeElement(el: UI): ResumeElement {
    const base = {
      id: el.id || '',
      x: el.x || 0,
      y: el.y || 0,
      width: el.width || 100,
      height: el.height || 100,
      rotation: el.rotation,
      opacity: el.opacity,
      visible: el.visible,
    }

    if (el instanceof Text) {
      return {
        ...base,
        type: 'text',
        content: el.text || '',
        fontSize: el.fontSize || 16,
        fontFamily: el.fontFamily || 'Arial',
        fontWeight: el.fontWeight || 'normal',
        fontStyle: el.fontStyle || 'normal',
        fill: (el.fill as string) || '#000000',
        textAlign: el.textAlign || 'left',
      } as TextElement
    }

    if (el instanceof Rect) {
      return {
        ...base,
        type: 'rect',
        fill: (el.fill as string) || '#ffffff',
        stroke: el.stroke as string,
        strokeWidth: el.strokeWidth,
        cornerRadius: el.cornerRadius,
      } as RectElement
    }

    if (el instanceof Ellipse) {
      return {
        ...base,
        type: 'ellipse',
        fill: (el.fill as string) || '#ffffff',
        stroke: el.stroke as string,
        strokeWidth: el.strokeWidth,
      } as EllipseElement
    }

    if (el instanceof Line) {
      return {
        ...base,
        type: 'line',
        stroke: (el.stroke as string) || '#000000',
        strokeWidth: el.strokeWidth || 1,
        startPoint: { x: 0, y: 0 },
        endPoint: { x: el.width || 100, y: 0 },
      } as LineElement
    }

    if (el instanceof Image) {
      return {
        ...base,
        type: 'image',
        src: el.url || '',
      } as ImageElement
    }

    if (el instanceof Group) {
      return {
        ...base,
        type: 'group',
        children: [], // 需要额外处理
      } as GroupElement
    }

    // 默认返回矩形
    return {
      ...base,
      type: 'rect',
      fill: '#ffffff',
    } as RectElement
  }

  /**
   * 获取选中的元素 ID
   */
  getSelectedElementIds(): string[] {
    if (!this.leafer) return []

    // LeaferJS Editor 的选择状态
    // 这里需要根据实际的 Editor API 来实现
    return []
  }

  /**
   * 选中元素
   */
  selectElements(elementIds: string[]): void {
    // 实现选择逻辑
  }

  /**
   * 清空选择
   */
  clearSelection(): void {
    // 实现清空选择逻辑
  }

  /**
   * 清空画布
   */
  clearCanvas(): void {
    if (!this.leafer) return

    this.elementsMap.forEach((el) => el.remove())
    this.elementsMap.clear()
  }

  /**
   * 导出画布
   */
  async export(options: ExportOptions): Promise<Blob> {
    if (!this.leafer) {
      throw new Error('Editor not initialized')
    }

    const { format, quality = 1, scale = 1, backgroundColor } = options

    // 使用 Leafer 的导出功能
    const result = await this.leafer.export(format === 'pdf' ? 'jpg' : format, {
      quality,
      pixelRatio: scale,
      blob: true,
      fill: backgroundColor,
    })

    if (format === 'pdf') {
      // PDF 导出需要使用 jsPDF
      // 这里返回 jpg，由调用方处理 PDF 生成
      return result.data as Blob
    }

    return result.data as Blob
  }

  /**
   * 获取画布快照
   */
  getSnapshot(): ResumeElement[] {
    return this.getAllElements().map((el) => this.convertToResumeElement(el))
  }

  /**
   * 从快照恢复
   */
  restoreFromSnapshot(elements: ResumeElement[]): void {
    this.clearCanvas()
    elements.forEach((el) => this.createElement(el, { id: el.id }))
  }

  /**
   * 设置视口
   */
  setViewport(viewport: Partial<ViewportState>): void {
    if (!this.leafer) return

    if (viewport.zoom !== undefined) {
      this.leafer.zoom = viewport.zoom
    }
    if (viewport.x !== undefined || viewport.y !== undefined) {
      this.leafer.x = viewport.x ?? this.leafer.x
      this.leafer.y = viewport.y ?? this.leafer.y
    }
  }

  /**
   * 销毁编辑器
   */
  destroy(): void {
    if (this.leafer) {
      this.leafer.destroy()
      this.leafer = null
    }
    this.elementsMap.clear()
  }
}
