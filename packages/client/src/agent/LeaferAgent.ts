/**
 * LeaferAgent - 核心 AI 代理类
 * 整合所有管理器，提供统一的 AI 交互接口
 */

import type { LeaferEditor } from '../canvas/LeaferEditor'
import type {
  AgentAction,
  AgentMode,
  AIModelType,
  CanvasState,
  ChatMessage,
  ResumeElement,
  ResumeTemplate,
  ResumeData,
  Streaming,
  ExportOptions,
} from '@resume-editor/shared'
import { createStreaming } from '@resume-editor/shared'

import {
  AgentActionManager,
  AgentChatManager,
  AgentContextManager,
  AgentRequestManager,
  CanvasHistoryManager,
  ExportManager,
  TemplateManager,
  type ActionResult,
  type StreamCallbacks,
} from './managers'

/**
 * 任务步骤状态
 */
interface TaskStepState {
  id: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
}

/**
 * LeaferAgent 配置
 */
export interface LeaferAgentConfig {
  /** 编辑器实例 */
  editor: LeaferEditor
  /** API 端点 */
  apiEndpoint: string
  /** 默认模型 */
  defaultModel?: AIModelType
  /** 最大历史记录数 */
  maxHistorySize?: number
  /** 预加载的模板 */
  templates?: ResumeTemplate[]
}

/**
 * LeaferAgent 状态
 */
export interface LeaferAgentState {
  mode: AgentMode
  model: AIModelType
  isProcessing: boolean
  canUndo: boolean
  canRedo: boolean
}

/**
 * LeaferAgent 事件回调
 */
export interface LeaferAgentCallbacks {
  /** 状态变化回调 */
  onStateChange?: (state: LeaferAgentState) => void
  /** Action 执行回调 */
  onAction?: (action: AgentAction, result: ActionResult) => void
  /** 消息更新回调 */
  onMessage?: (message: ChatMessage) => void
  /** 错误回调 */
  onError?: (error: Error) => void
}

/**
 * LeaferAgent - AI 代理核心类
 *
 * 负责协调各个管理器，处理用户与 AI 的交互
 */
export class LeaferAgent {
  // 管理器实例
  public readonly actions: AgentActionManager
  public readonly chat: AgentChatManager
  public readonly context: AgentContextManager
  public readonly history: CanvasHistoryManager
  public readonly templates: TemplateManager
  public readonly export: ExportManager
  public readonly requests: AgentRequestManager

  // 配置和状态
  private editor: LeaferEditor
  private mode: AgentMode = 'edit'
  private model: AIModelType
  private callbacks: LeaferAgentCallbacks = {}

  // 任务步骤验证
  private pendingTaskSteps: Map<string, TaskStepState> = new Map()

  constructor(config: LeaferAgentConfig) {
    this.editor = config.editor
    this.model = config.defaultModel ?? 'claude-sonnet-4.5'

    // 初始化管理器
    this.history = new CanvasHistoryManager({
      maxSize: config.maxHistorySize ?? 50,
    })

    this.chat = new AgentChatManager()

    this.context = new AgentContextManager({
      editor: config.editor,
    })

    this.actions = new AgentActionManager({
      editor: config.editor,
      onBeforeAction: (action) => this.handleBeforeAction(action),
      onAfterAction: (action, result) => this.handleAfterAction(action, result),
      onError: (action, error) => this.handleError(error),
    })

    this.templates = new TemplateManager({
      editor: config.editor,
      templates: config.templates,
      apiEndpoint: config.apiEndpoint,
    })

    this.export = new ExportManager({
      editor: config.editor,
    })

    this.requests = new AgentRequestManager({
      apiEndpoint: config.apiEndpoint,
      defaultModel: this.model,
    })

    // 保存初始状态到历史
    this.saveHistory('初始状态')
  }

  // ============ 公共方法 ============

  /**
   * 设置回调
   */
  setCallbacks(callbacks: LeaferAgentCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  /**
   * 获取当前状态
   */
  getState(): LeaferAgentState {
    return {
      mode: this.mode,
      model: this.model,
      isProcessing: this.requests.isRequesting(),
      canUndo: this.history.canUndo(),
      canRedo: this.history.canRedo(),
    }
  }

  /**
   * 设置工作模式
   */
  setMode(mode: AgentMode): void {
    this.mode = mode
    this.notifyStateChange()
  }

  /**
   * 获取当前模式
   */
  getMode(): AgentMode {
    return this.mode
  }

  /**
   * 设置 AI 模型
   */
  setModel(model: AIModelType): void {
    this.model = model
    this.requests.setDefaultModel(model)
    this.notifyStateChange()
  }

  /**
   * 获取当前模型
   */
  getModel(): AIModelType {
    return this.model
  }

  /**
   * 发送消息给 AI
   */
  async sendMessage(content: string): Promise<void> {
    // 添加用户消息
    const userMessage = this.chat.addUserMessage(content)
    this.callbacks.onMessage?.(userMessage)

    // 构建请求
    const context = this.buildContext()
    const messages = this.chat.getMessagesForAPI()

    // 设置处理状态
    this.notifyStateChange()

    // 发送请求
    const callbacks: StreamCallbacks = {
      onStart: () => {
        // 添加助手消息占位
        this.chat.addAssistantMessage('')
      },
      onAction: (streaming) => {
        this.handleStreamingAction(streaming)
      },
      onComplete: (actions) => {
        this.handleComplete(actions)
      },
      onError: (error) => {
        this.handleError(error)
      },
    }

    try {
      await this.requests.sendChatRequest(
        {
          messages,
          model: this.model,
          context,
        },
        callbacks
      )
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error(String(error)))
    }

    this.notifyStateChange()
  }

  /**
   * 取消当前请求
   */
  cancelRequest(): void {
    this.requests.cancelRequest()
    this.notifyStateChange()
  }

  /**
   * 撤销
   */
  undo(): boolean {
    const snapshot = this.history.undo()
    if (snapshot) {
      this.editor.restoreFromSnapshot(snapshot)
      this.notifyStateChange()
      return true
    }
    return false
  }

  /**
   * 重做
   */
  redo(): boolean {
    const snapshot = this.history.redo()
    if (snapshot) {
      this.editor.restoreFromSnapshot(snapshot)
      this.notifyStateChange()
      return true
    }
    return false
  }

  /**
   * 保存历史记录
   */
  saveHistory(description: string): void {
    const snapshot = this.editor.getSnapshot()
    this.history.push(snapshot, description)
    this.notifyStateChange()
  }

  /**
   * 应用模板
   */
  applyTemplate(templateId: string): boolean {
    const success = this.templates.applyTemplate(templateId)
    if (success) {
      this.saveHistory(`应用模板: ${templateId}`)
    }
    return success
  }

  /**
   * 智能生成模板
   */
  async generateSmartTemplate(
    templateId: string,
    resumeData: ResumeData
  ): Promise<boolean> {
    try {
      const elements = await this.templates.generateSmartTemplate(templateId, resumeData)
      this.templates.applyElements(elements)
      this.saveHistory(`智能生成模板: ${templateId}`)
      return true
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error(String(error)))
      return false
    }
  }

  /**
   * 从当前画布创建模板
   */
  createTemplate(
    name: string,
    category: ResumeTemplate['category'],
    description?: string
  ): ResumeTemplate {
    return this.templates.createTemplateFromCanvas(name, category, description)
  }

  /**
   * 清空画布
   */
  clearCanvas(): void {
    this.editor.clearCanvas()
    this.saveHistory('清空画布')
  }

  /**
   * 获取画布状态
   */
  getCanvasState(): CanvasState {
    return this.context.getCanvasState()
  }

  /**
   * 导出画布
   */
  async exportCanvas(options: ExportOptions): Promise<Blob> {
    return this.export.exportImage(options as any)
  }

  /**
   * 重置代理状态
   */
  reset(): void {
    this.chat.clear()
    this.history.clear()
    this.editor.clearCanvas()
    this.mode = 'edit'
    this.pendingTaskSteps.clear()
    this.notifyStateChange()
  }

  // ============ 私有方法 ============

  /**
   * 构建上下文信息
   */
  private buildContext(): string {
    const contextParts: string[] = []

    // 添加画布状态
    contextParts.push(this.context.generateContextDescription())

    // 根据模式添加额外上下文
    if (this.mode === 'template') {
      contextParts.push('\n当前模式: 模板生成模式')
      contextParts.push('你可以生成完整的简历模板。')
    } else if (this.mode === 'assistant') {
      contextParts.push('\n当前模式: 助手模式')
      contextParts.push('你可以帮助用户优化简历内容和布局。')
    }

    return contextParts.join('\n')
  }

  /**
   * 处理流式 Action
   */
  private handleStreamingAction(streaming: Streaming<AgentAction>): void {
    const action = streaming.data

    // 处理任务规划
    if (action._type === 'task-plan') {
      const steps = action.steps.map((step) => ({
        id: step.id,
        description: step.description,
        status: 'pending' as const,
      }))
      this.chat.setLastMessageTaskSteps(steps)
      // 初始化待验证步骤
      this.pendingTaskSteps = new Map(steps.map(s => [s.id, { ...s, status: 'pending' as const }]))
      const lastMessage = this.chat.getLastMessage()
      if (lastMessage) {
        this.callbacks.onMessage?.(lastMessage)
      }
      return
    }

    // 处理任务进度更新
    if (action._type === 'task-progress') {
      this.chat.updateTaskStepStatus(action.stepId, action.status)
      // 更新待验证步骤状态
      if (this.pendingTaskSteps.has(action.stepId)) {
        this.pendingTaskSteps.set(action.stepId, {
          ...this.pendingTaskSteps.get(action.stepId)!,
          status: action.status,
        })
        // 检查是否所有步骤都完成
        this.checkAllStepsCompleted()
      }
      const lastMessage = this.chat.getLastMessage()
      if (lastMessage) {
        this.callbacks.onMessage?.(lastMessage)
      }
      return
    }

    // 执行完成的 Action
    if (streaming.isComplete) {
      this.actions.executeAction(streaming.data)
    }
  }

  /**
   * 检查是否所有步骤都完成
   */
  private checkAllStepsCompleted(): { completed: boolean; warnings: string[] } {
    if (!this.pendingTaskSteps || this.pendingTaskSteps.size === 0) {
      return { completed: true, warnings: [] }
    }

    const warnings: string[] = []

    // 检查是否有失败的步骤
    const failedSteps = Array.from(this.pendingTaskSteps.values()).filter((s) => s.status === 'failed')
    if (failedSteps.length > 0) {
      warnings.push(`有 ${failedSteps.length} 个步骤执行失败`)
    }

    // 检查是否有未完成的步骤
    const incompleteSteps = Array.from(this.pendingTaskSteps.values()).filter(
      (s) => s.status === 'pending' || s.status === 'in_progress'
    )
    if (incompleteSteps.length > 0) {
      warnings.push(`有 ${incompleteSteps.length} 个步骤未完成`)
    }

    return {
      completed: warnings.length === 0,
      warnings,
    }
  }

  /**
   * 处理完成
   */
  private handleComplete(actions: AgentAction[]): void {
    // 更新助手消息
    const messages = actions
      .filter((a) => a._type === 'message')
      .map((a) => (a as any).message)
      .join('\n')

    if (messages) {
      this.chat.updateLastMessage(messages)
      const lastMessage = this.chat.getLastMessage()
      if (lastMessage) {
        this.callbacks.onMessage?.(lastMessage)
      }
    }

    // 保存历史记录
    if (actions.some((a) => this.isCanvasModifyingAction(a))) {
      this.saveHistory('AI 编辑')
    }

    // 清空待验证步骤
    this.pendingTaskSteps.clear()
  }

  /**
   * 处理 Action 执行前
   */
  private handleBeforeAction(action: AgentAction): void {
    // 可以在这里添加日志或其他处理
  }

  /**
   * 处理 Action 执行后
   */
  private handleAfterAction(action: AgentAction, result: ActionResult): void {
    this.callbacks.onAction?.(action, result)
  }

  /**
   * 处理错误
   */
  private handleError(error: Error): void {
    this.callbacks.onError?.(error)
  }

  /**
   * 通知状态变化
   */
  private notifyStateChange(): void {
    this.callbacks.onStateChange?.(this.getState())
  }

  /**
   * 判断 Action 是否修改画布
   */
  private isCanvasModifyingAction(action: AgentAction): boolean {
    const modifyingTypes = [
      'create-element',
      'update-element',
      'delete-element',
      'move-element',
      'resize-element',
      'edit-text',
      'set-style',
      'align-elements',
      'distribute-elements',
      'clear-canvas',
    ]
    return modifyingTypes.includes(action._type)
  }
}
