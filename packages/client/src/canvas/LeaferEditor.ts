/**
 * LeaferEditor - LeaferJS 画布编辑器核心类
 * 负责画布初始化、元素管理、编辑器功能
 */

import { App, Rect, Text, Ellipse, Line, Image, Group, UI, Leafer } from 'leafer-ui'
import '@leafer-in/editor'
import '@leafer-in/resize'
import '@leafer-in/view'
import '@leafer-in/export'
import '@leafer-in/viewport'
import '@leafer-in/text-editor'
import { DotMatrix } from 'leafer-x-dotwuxian'

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
 * 点阵配置
 */
export interface DotMatrixConfig {
  /** 是否启用点阵 */
  enabled?: boolean
  /** 点/线颜色 */
  dotColor?: string
  /** 网格间距 */
  gridGap?: number
  /** 网格类型 */
  gridType?: 'dots' | 'lines'
  /** 最大点/线宽 */
  maxSize?: number
  /** 最小点/线宽 */
  minSize?: number
}

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
  /** 点阵配置 */
  dotMatrix?: DotMatrixConfig
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
  private app: App | null = null
  private config: LeaferEditorConfig
  private elementsMap: Map<string, UI> = new Map()
  private container: HTMLElement
  private dotMatrix: DotMatrix | null = null

  // 平移模式相关
  private isPanModeEnabled: boolean = false
  private isPanning: boolean = false
  private panStartX: number = 0
  private panStartY: number = 0
  private panStartCanvasX: number = 0
  private panStartCanvasY: number = 0
  private boundHandlePanMouseDown: (e: MouseEvent) => void
  private boundHandlePanMouseMove: (e: MouseEvent) => void
  private boundHandlePanMouseUp: (e: MouseEvent) => void

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

    // 绑定平移事件处理函数
    this.boundHandlePanMouseDown = this.handlePanMouseDown.bind(this)
    this.boundHandlePanMouseMove = this.handlePanMouseMove.bind(this)
    this.boundHandlePanMouseUp = this.handlePanMouseUp.bind(this)
  }

  /**
   * 初始化编辑器
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // 使用 App 替代 Leafer，以支持编辑器功能
        // type: 'design' 启用视口功能（缩放/平移），支持无限点阵插件
        const app = new App({
          view: this.container,
          type: 'design',
          tree: {},
          sky: {},
          editor: this.config.editable ? {} : undefined,
        })
        this.app = app

        // 设置尺寸（背景色通过 CSS 设置，避免遮挡点阵）
        if (app.tree) {
          app.tree.width = this.config.width
          app.tree.height = this.config.height
          // 背景色设置为透明，让点阵可见
          // 实际背景色通过容器 CSS 设置
        }

        // 配置吸附
        if (this.config.snap) {
          this.setupSnap()
        }

        // 配置点阵
        if (this.config.dotMatrix?.enabled !== false) {
          this.setupDotMatrix()
        }

        // 等待 tree 层准备好
        if (app.tree) {
          app.tree.waitViewReady(() => resolve())
        } else {
          reject(new Error('App tree layer not created'))
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 配置吸附功能
   */
  private setupSnap(): void {
    // 吸附功能配置
    // Leafer-in/editor 提供了吸附支持
  }

  /**
   * 配置点阵背景
   */
  private setupDotMatrix(): void {
    if (!this.app) return

    const dotConfig = this.config.dotMatrix || {}
    this.dotMatrix = new DotMatrix(this.app, {
      dotColor: dotConfig.dotColor || '#D2D4D7',
      gridGap: dotConfig.gridGap ?? 45,
      gridType: dotConfig.gridType || 'dots',
      maxSize: dotConfig.maxSize ?? 10,
      minSize: dotConfig.minSize ?? 0.1,
    })
    this.dotMatrix.enableDotMatrix(true)
  }

  /**
   * 设置点阵显示状态
   */
  setDotMatrixEnabled(enabled: boolean): void {
    this.dotMatrix?.enableDotMatrix(enabled)
  }

  /**
   * 获取点阵显示状态
   */
  isDotMatrixEnabled(): boolean {
    return this.dotMatrix !== null
  }

  /**
   * 更新点阵配置
   */
  updateDotMatrix(config: Partial<DotMatrixConfig>): void {
    if (this.dotMatrix) {
      this.dotMatrix.destroy()
    }
    this.config.dotMatrix = {
      ...this.config.dotMatrix,
      ...config,
    }
    this.setupDotMatrix()
  }

  /**
   * 获取 App 实例
   */
  getApp(): App | null {
    return this.app
  }

  /**
   * 获取 Leafer 实例（兼容旧接口）
   */
  getLeafer(): Leafer | null {
    return this.app?.tree ?? null
  }

  /**
   * 创建元素
   */
  createElement(
    element: ResumeElement,
    options?: CreateElementOptions
  ): UI | null {
    if (!this.app?.tree) {
      return null
    }

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
      this.app.tree.add(leaferElement)
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
      fontSize: element.fontSize || 16,
      fontFamily: element.fontFamily || 'Arial',
      fontWeight: element.fontWeight as any,
      fontStyle: element.fontStyle,
      fill: element.fill || '#000000',
      textAlign: element.textAlign,
      rotation: element.rotation,
      opacity: element.opacity,
      visible: element.visible ?? true,
      editable: true,
      moveable: true,
      resizable: true,
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
      fill: element.fill || '#32cd79',
      stroke: element.stroke,
      strokeWidth: element.strokeWidth,
      cornerRadius: element.cornerRadius,
      rotation: element.rotation,
      opacity: element.opacity,
      visible: element.visible ?? true,
      editable: true,
      moveable: true,
      resizable: true,
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
      fill: element.fill || '#32cd79',
      stroke: element.stroke,
      strokeWidth: element.strokeWidth,
      rotation: element.rotation,
      opacity: element.opacity,
      visible: element.visible ?? true,
      editable: true,
      moveable: true,
      resizable: true,
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
      editable: true,
      moveable: true,
      resizable: true,
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
      editable: true,
      moveable: true,
      resizable: true,
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
      editable: true,
      moveable: true,
      resizable: true,
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
      editable: true,
      moveable: true,
      resizable: true,
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
        ; (element as any)[propertyName] = value
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
    if (!this.app?.editor) return []

    // 使用 LeaferJS Editor 的选择状态
    const selectedList = this.app.editor.list
    return selectedList.map((el: UI) => el.id as string)
  }

  /**
   * 选中元素
   */
  selectElements(elementIds: string[]): void {
    if (!this.app?.editor) return

    const elements = elementIds
      .map((id) => this.elementsMap.get(id))
      .filter((el): el is UI => el !== undefined)

    if (elements.length > 0) {
      this.app.editor.select(elements)
    }
  }

  /**
   * 清空选择
   */
  clearSelection(): void {
    if (!this.app?.editor) return
    this.app.editor.select()
  }

  /**
   * 清空画布
   */
  clearCanvas(): void {
    if (!this.app?.tree) return

    this.elementsMap.forEach((el) => el.remove())
    this.elementsMap.clear()
  }

  /**
   * 导出画布
   */
  async export(options: ExportOptions): Promise<Blob> {
    if (!this.app?.tree) {
      throw new Error('Editor not initialized')
    }

    const { format, quality = 1, scale = 1, backgroundColor } = options

    // 使用 Leafer 的导出功能
    const result = await this.app.tree.export(format === 'pdf' ? 'jpg' : format, {
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
    if (!this.app?.tree) return

    if (viewport.zoom !== undefined) {
      this.app.tree.zoom = viewport.zoom
    }
    if (viewport.x !== undefined || viewport.y !== undefined) {
      this.app.tree.x = viewport.x ?? this.app.tree.x
      this.app.tree.y = viewport.y ?? this.app.tree.y
    }
  }

  /**
   * 获取当前缩放比例
   */
  getZoom(): number {
    if (!this.app?.tree) return 1
    return this.app.tree.scaleX || 1
  }

  /**
   * 设置缩放比例
   */
  setZoom(zoom: number): void {
    if (!this.app?.tree) return
    this.app.tree.scaleX = zoom
    this.app.tree.scaleY = zoom
  }

  /**
   * 放大
   */
  zoomIn(step: number = 0.1): void {
    const currentZoom = this.getZoom()
    this.setZoom(Math.min(currentZoom + step, 2))
  }

  /**
   * 缩小
   */
  zoomOut(step: number = 0.1): void {
    const currentZoom = this.getZoom()
    this.setZoom(Math.max(currentZoom - step, 0.25))
  }

  /**
   * 重置缩放
   */
  resetZoom(): void {
    this.setZoom(1)
  }

  /**
   * 设置平移模式
   * 当启用平移模式时，禁用元素选择，允许拖动画布
   */
  setPanMode(enabled: boolean): void {
    if (!this.app) return

    this.isPanModeEnabled = enabled

    if (enabled) {
      // 清空选择
      this.clearSelection()
      // 禁用编辑器的选择功能
      if (this.app.editor) {
        this.app.editor.disabled = true
        // 禁用选择器（包括框选功能）
        const editorConfig = this.app.editor.config as any
        if (editorConfig) {
          editorConfig.selector = false
        }
      }
      // 在捕获阶段添加事件监听，以便在 LeaferJS 处理之前拦截事件
      this.container.addEventListener('mousedown', this.boundHandlePanMouseDown, true)
      // 设置鼠标样式为抓手
      this.container.style.cursor = 'grab'
    } else {
      // 恢复编辑器功能
      if (this.app.editor) {
        this.app.editor.disabled = false
        // 恢复选择器
        const editorConfig = this.app.editor.config as any
        if (editorConfig) {
          editorConfig.selector = true
        }
      }
      // 移除平移事件监听
      this.removePanListeners()
      // 恢复默认鼠标样式
      this.container.style.cursor = 'default'
    }
  }

  /**
   * 移除平移事件监听
   */
  private removePanListeners(): void {
    this.container.removeEventListener('mousedown', this.boundHandlePanMouseDown, true)
    document.removeEventListener('mousemove', this.boundHandlePanMouseMove)
    document.removeEventListener('mouseup', this.boundHandlePanMouseUp)
    this.isPanning = false
  }

  /**
   * 处理平移模式下的鼠标按下
   */
  private handlePanMouseDown(e: MouseEvent): void {
    if (!this.isPanModeEnabled || !this.app?.tree) return

    // 只响应左键
    if (e.button !== 0) return

    // 阻止事件传递到 LeaferJS，防止框选
    e.stopPropagation()
    e.preventDefault()

    this.isPanning = true
    this.panStartX = e.clientX
    this.panStartY = e.clientY
    this.panStartCanvasX = this.app.tree.x || 0
    this.panStartCanvasY = this.app.tree.y || 0

    // 添加移动和抬起事件监听
    document.addEventListener('mousemove', this.boundHandlePanMouseMove)
    document.addEventListener('mouseup', this.boundHandlePanMouseUp)

    // 设置鼠标样式为抓取中
    this.container.style.cursor = 'grabbing'
  }

  /**
   * 处理平移模式下的鼠标移动
   */
  private handlePanMouseMove(e: MouseEvent): void {
    if (!this.isPanning || !this.app?.tree) return

    const deltaX = e.clientX - this.panStartX
    const deltaY = e.clientY - this.panStartY

    // 更新画布位置
    this.app.tree.x = this.panStartCanvasX + deltaX
    this.app.tree.y = this.panStartCanvasY + deltaY
  }

  /**
   * 处理平移模式下的鼠标抬起
   */
  private handlePanMouseUp(_e: MouseEvent): void {
    this.isPanning = false

    // 移除移动和抬起事件监听
    document.removeEventListener('mousemove', this.boundHandlePanMouseMove)
    document.removeEventListener('mouseup', this.boundHandlePanMouseUp)

    // 恢复鼠标样式为抓手
    if (this.isPanModeEnabled) {
      this.container.style.cursor = 'grab'
    }
  }

  /**
   * 获取编辑器是否处于平移模式
   */
  isPanMode(): boolean {
    return this.isPanModeEnabled
  }

  /**
   * 销毁编辑器
   */
  destroy(): void {
    // 移除平移事件监听
    this.removePanListeners()
    this.container.removeEventListener('mousedown', this.boundHandlePanMouseDown, true)

    if (this.dotMatrix) {
      this.dotMatrix.destroy()
      this.dotMatrix = null
    }
    if (this.app) {
      this.app.destroy()
      this.app = null
    }
    this.elementsMap.clear()
  }
}
