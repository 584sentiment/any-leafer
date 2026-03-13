/**
 * Agent 执行验证器
 * 验证每个步骤是否被正确执行
 */

import type { AgentAction } from '@resume-editor/shared'
import type { AgentState, TaskStep, ValidationResult } from './schemas/agentState'

/**
 * 验证器配置
 */
export interface ValidatorConfig {
  /** 最大重试次数 */
  maxRetries: number
  /** 是否启用严格模式（每个步骤必须有对应的 Action） */
  strictMode: boolean
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: ValidatorConfig = {
  maxRetries: 3,
  strictMode: true,
}

/**
 * Agent 执行验证器
 */
export class ActionValidator {
  private config: ValidatorConfig

  constructor(config: Partial<ValidatorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * 验证单个步骤是否完成
   * 检查该步骤是否有对应的操作被执行
   */
  validateStepCompletion(state: AgentState, stepId: string): ValidationResult {
    const step = state.taskPlan.steps.find((s) => s.id === stepId)
    if (!step) {
      return {
        stepId,
        success: false,
        error: `未找到步骤: ${stepId}`,
      }
    }

    // 检查该步骤是否有对应的操作被执行
    // 通过检查 executedActions 中是否有与该步骤相关的操作
    const stepActions = this.getActionsForStep(state.executedActions, step)

    if (stepActions.length === 0 && this.config.strictMode) {
      return {
        stepId,
        success: false,
        error: `步骤 "${step.description}" 没有对应的执行操作`,
        retryCount: state.retryCount,
      }
    }

    return {
      stepId,
      success: true,
    }
  }

  /**
   * 验证所有步骤是否完成
   */
  validateAllStepsCompleted(state: AgentState): {
    completed: boolean
    failedSteps: ValidationResult[]
  } {
    const failedSteps: ValidationResult[] = []

    for (const step of state.taskPlan.steps) {
      if (step.status !== 'completed') {
        failedSteps.push({
          stepId: step.id,
          success: false,
          error: `步骤 "${step.description}" 未完成，当前状态: ${step.status}`,
        })
      }
    }

    return {
      completed: failedSteps.length === 0,
      failedSteps,
    }
  }

  /**
   * 检查是否可以重试
   */
  canRetry(state: AgentState): boolean {
    return state.retryCount < this.config.maxRetries
  }

  /**
   * 获取步骤相关的 Actions
   * 根据步骤描述匹配可能相关的操作
   */
  private getActionsForStep(actions: AgentAction[], step: TaskStep): AgentAction[] {
    // 创建类操作 - 检查步骤描述中的关键词
    const createActionTypes = ['create-element']
    const updateActionTypes = ['update-element', 'edit-text', 'set-style', 'move-element']
    const deleteActionTypes = ['delete-element']

    const stepDesc = step.description.toLowerCase()

    // 根据步骤描述判断应该有哪些类型的操作
    if (stepDesc.includes('创建') || stepDesc.includes('添加') || stepDesc.includes('生成')) {
      return actions.filter((a) => createActionTypes.includes(a._type))
    }

    if (stepDesc.includes('修改') || stepDesc.includes('更新') || stepDesc.includes('编辑')) {
      return actions.filter((a) => updateActionTypes.includes(a._type))
    }

    if (stepDesc.includes('删除') || stepDesc.includes('移除')) {
      return actions.filter((a) => deleteActionTypes.includes(a._type))
    }

    // 默认返回所有画布操作
    return actions.filter(
      (a) =>
        !['task-plan', 'task-progress', 'message', 'think'].includes(a._type)
    )
  }

  /**
   * 验证 Action 格式
   */
  validateActionFormat(action: unknown): { valid: boolean; action?: AgentAction; error?: string } {
    if (!action || typeof action !== 'object') {
      return { valid: false, error: 'Action 必须是对象' }
    }

    const actionObj = action as Record<string, unknown>

    if (!actionObj._type) {
      return { valid: false, error: 'Action 必须包含 _type 字段' }
    }

    // 基本格式验证通过
    return { valid: true, action: actionObj as AgentAction }
  }

  /**
   * 验证任务规划完整性
   */
  validateTaskPlan(state: AgentState): {
    valid: boolean
    issues: string[]
  } {
    const issues: string[] = []

    // 检查是否有任务规划
    if (state.taskPlan.steps.length === 0) {
      // 没有任务规划不一定是问题，可能是简单任务
      return { valid: true, issues: [] }
    }

    // 检查每个步骤是否都有对应的进度更新
    const progressStepIds = state.executedActions
      .filter((a) => a._type === 'task-progress')
      .map((a) => (a as { stepId: string }).stepId)

    for (const step of state.taskPlan.steps) {
      if (!progressStepIds.includes(step.id)) {
        issues.push(`步骤 "${step.id}" 没有进度更新`)
      }
    }

    // 检查是否有未完成的步骤
    const incompleteSteps = state.taskPlan.steps.filter((s) => s.status !== 'completed')
    if (incompleteSteps.length > 0) {
      issues.push(
        `有 ${incompleteSteps.length} 个步骤未完成: ${incompleteSteps.map((s) => s.id).join(', ')}`
      )
    }

    return {
      valid: issues.length === 0,
      issues,
    }
  }

  /**
   * 生成验证报告
   */
  generateValidationReport(state: AgentState): {
    totalSteps: number
    completedSteps: number
    failedSteps: number
    pendingSteps: number
    inProgressSteps: number
    actionsExecuted: number
    issues: string[]
  } {
    const steps = state.taskPlan.steps
    const issues: string[] = []

    // 统计各状态步骤数量
    const completedSteps = steps.filter((s) => s.status === 'completed').length
    const failedSteps = steps.filter((s) => s.status === 'failed').length
    const pendingSteps = steps.filter((s) => s.status === 'pending').length
    const inProgressSteps = steps.filter((s) => s.status === 'in_progress').length

    // 检查问题
    if (failedSteps > 0) {
      issues.push(`有 ${failedSteps} 个步骤执行失败`)
    }

    if (inProgressSteps > 0) {
      issues.push(`有 ${inProgressSteps} 个步骤仍在执行中`)
    }

    // 检查 Action 数量
    const canvasActions = state.executedActions.filter(
      (a) => !['task-plan', 'task-progress', 'message', 'think'].includes(a._type)
    )

    if (steps.length > 0 && canvasActions.length === 0) {
      issues.push('没有执行任何画布操作')
    }

    return {
      totalSteps: steps.length,
      completedSteps,
      failedSteps,
      pendingSteps,
      inProgressSteps,
      actionsExecuted: state.executedActions.length,
      issues,
    }
  }
}

/**
 * 创建默认验证器实例
 */
export function createValidator(config?: Partial<ValidatorConfig>): ActionValidator {
  return new ActionValidator(config)
}
