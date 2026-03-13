/**
 * 简历编辑器核心类型定义
 */

// ============ 流式类型 ============

/**
 * 流式数据包装器，支持渐进式响应
 */
export interface Streaming<T> {
  /** 实际数据 */
  data: T
  /** 是否流式传输完成 */
  isComplete: boolean
  /** 时间戳 */
  timestamp: number
}

/**
 * 创建流式数据
 */
export function createStreaming<T>(data: T, isComplete: boolean = false): Streaming<T> {
  return {
    data,
    isComplete,
    timestamp: Date.now(),
  }
}

// ============ 画布元素类型 ============

/**
 * 简历元素类型
 */
export type ResumeElementType =
  | 'text'
  | 'heading'
  | 'rect'
  | 'ellipse'
  | 'line'
  | 'image'
  | 'divider'
  | 'group'

/**
 * 基础元素属性
 */
export interface BaseElementProps {
  /** 元素 ID */
  id: string
  /** 元素类型 */
  type: ResumeElementType
  /** X 坐标 */
  x: number
  /** Y 坐标 */
  y: number
  /** 宽度 */
  width: number
  /** 高度 */
  height: number
  /** 旋转角度（弧度） */
  rotation?: number
  /** 透明度 0-1 */
  opacity?: number
  /** 是否可见 */
  visible?: boolean
  /** 是否锁定 */
  locked?: boolean
  /** 标签/名称 */
  tag?: string
}

/**
 * 文本元素
 */
export interface TextElement extends BaseElementProps {
  type: 'text' | 'heading'
  /** 文本内容 */
  content: string
  /** 字体大小 */
  fontSize: number
  /** 字体 */
  fontFamily: string
  /** 字重 */
  fontWeight: string
  /** 字体样式 */
  fontStyle: 'normal' | 'italic'
  /** 文本颜色 */
  fill: string
  /** 文本对齐 */
  textAlign: 'left' | 'center' | 'right'
  /** 行高 */
  lineHeight?: number
  /** 装饰线 */
  textDecoration?: 'none' | 'underline' | 'line-through'
}

/**
 * 矩形元素
 */
export interface RectElement extends BaseElementProps {
  type: 'rect'
  /** 填充色 */
  fill: string
  /** 描边色 */
  stroke?: string
  /** 描边宽度 */
  strokeWidth?: number
  /** 圆角 */
  cornerRadius?: number | number[]
}

/**
 * 椭圆元素
 */
export interface EllipseElement extends BaseElementProps {
  type: 'ellipse'
  /** 填充色 */
  fill: string
  /** 描边色 */
  stroke?: string
  /** 描边宽度 */
  strokeWidth?: number
}

/**
 * 线条元素
 */
export interface LineElement extends BaseElementProps {
  type: 'line'
  /** 起点坐标 */
  startPoint: { x: number; y: number }
  /** 终点坐标 */
  endPoint: { x: number; y: number }
  /** 描边色 */
  stroke: string
  /** 描边宽度 */
  strokeWidth: number
  /** 线条样式 */
  strokeDasharray?: number[]
}

/**
 * 图片元素
 */
export interface ImageElement extends BaseElementProps {
  type: 'image'
  /** 图片 URL */
  src: string
  /** 图片填充方式 */
  fit?: 'fill' | 'contain' | 'cover'
}

/**
 * 分隔线元素
 */
export interface DividerElement extends BaseElementProps {
  type: 'divider'
  /** 线条颜色 */
  stroke: string
  /** 线条宽度 */
  strokeWidth: number
  /** 线条样式 */
  strokeDasharray?: number[]
}

/**
 * 分组元素
 */
export interface GroupElement extends BaseElementProps {
  type: 'group'
  /** 子元素 ID 列表 */
  children: string[]
}

/**
 * 简历元素联合类型
 */
export type ResumeElement =
  | TextElement
  | RectElement
  | EllipseElement
  | LineElement
  | ImageElement
  | DividerElement
  | GroupElement

// ============ 画布状态 ============

/**
 * 视口状态
 */
export interface ViewportState {
  /** X 偏移 */
  x: number
  /** Y 偏移 */
  y: number
  /** 缩放比例 */
  zoom: number
  /** 视口宽度 */
  width: number
  /** 视口高度 */
  height: number
}

/**
 * 画布状态（供 AI 上下文使用）
 */
export interface CanvasState {
  /** 所有元素 */
  elements: ResumeElement[]
  /** 视口状态 */
  viewport: ViewportState
  /** 选中的元素 ID */
  selection: string[]
}

// ============ 模板类型 ============

/**
 * 模板分类
 */
export type TemplateCategory = 'classic' | 'modern' | 'minimal' | 'creative'

/**
 * 模板应用模式
 */
export type TemplateApplyMode = 'quick' | 'smart'

/**
 * 布局提示
 */
export interface LayoutHint {
  /** 区域类型 */
  section: 'header' | 'experience' | 'education' | 'skills' | 'custom'
  /** 位置 */
  position: 'top' | 'left' | 'right' | 'bottom'
  /** 样式描述 */
  style?: string
}

/**
 * 配色方案
 */
export interface ColorScheme {
  /** 主色 */
  primary: string
  /** 辅助色 */
  secondary: string
  /** 背景色 */
  background: string
  /** 文本色 */
  text: string
  /** 强调色 */
  accent?: string
}

/**
 * 字体配置
 */
export interface TypographyConfig {
  /** 标题字体 */
  headingFont?: string
  /** 正文字体 */
  bodyFont?: string
  /** 标题字号范围 */
  headingSizes?: { min: number; max: number }
  /** 正文字号范围 */
  bodySizes?: { min: number; max: number }
}

/**
 * 智能模板配置
 */
export interface SmartTemplateConfig {
  /** 风格描述 */
  stylePrompt: string
  /** 布局提示 */
  layoutHints: LayoutHint[]
  /** 配色方案 */
  colorScheme?: ColorScheme
  /** 字体配置 */
  typography?: TypographyConfig
}

/**
 * 简历模板
 */
export interface ResumeTemplate {
  /** 模板 ID */
  id: string
  /** 模板名称 */
  name: string
  /** 模板描述 */
  description?: string
  /** 分类 */
  category: TemplateCategory
  /** 缩略图 URL */
  thumbnail?: string
  /** 元素列表 */
  elements?: ResumeElement[]
  /** 画布尺寸 */
  canvasSize: { width: number; height: number }
  /** 创建时间 */
  createdAt: number
  /** 更新时间 */
  updatedAt: number
  /** 智能模板配置 */
  smartConfig?: SmartTemplateConfig
}

// ============ AI 相关类型 ============

/**
 * AI 模型类型
 */
export type AIModelType =
  | 'deepseek-chat'
  | 'deepseek-reasoner'
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'claude-sonnet-4.5'
  | 'claude-opus-4.5'
  | 'gemini-2.0-flash'
  | 'gemini-2.0-pro'

/**
 * 聊天消息角色
 */
export type ChatRole = 'user' | 'assistant' | 'system'

/**
 * 任务步骤状态
 */
export type TaskStepStatus = 'pending' | 'in_progress' | 'completed' | 'failed'

/**
 * 任务步骤
 */
export interface TaskStep {
  /** 步骤 ID */
  id: string
  /** 步骤描述 */
  description: string
  /** 步骤状态 */
  status: TaskStepStatus
  /** 关联的 Action ID */
  actionId?: string
}

/**
 * 聊天消息
 */
export interface ChatMessage {
  /** 消息 ID */
  id: string
  /** 角色 */
  role: ChatRole
  /** 内容 */
  content: string
  /** 时间戳 */
  timestamp: number
  /** 关联的 Action */
  actions?: string[]
  /** 任务步骤列表 */
  taskSteps?: TaskStep[]
}

/**
 * 代理工作模式
 */
export type AgentMode = 'edit' | 'template' | 'assistant'

/**
 * 代理状态
 */
export interface AgentState {
  /** 当前模式 */
  mode: AgentMode
  /** 聊天历史 */
  chatHistory: ChatMessage[]
  /** 是否正在处理 */
  isProcessing: boolean
  /** 当前模型 */
  model: AIModelType
}

// ============ 导出类型 ============

/**
 * 导出格式
 */
export type ExportFormat = 'png' | 'jpg' | 'pdf'

/**
 * 导出选项
 */
export interface ExportOptions {
  /** 格式 */
  format: ExportFormat
  /** 质量 (0-1，用于 jpg) */
  quality?: number
  /** 缩放比例 */
  scale?: number
  /** 背景色 */
  backgroundColor?: string
}

// ============ 历史记录类型 ============

/**
 * 历史记录条目
 */
export interface HistoryEntry {
  /** 时间戳 */
  timestamp: number
  /** 操作描述 */
  description: string
  /** 画布快照 */
  snapshot: ResumeElement[]
}
