/**
 * LangGraph Agent 状态定义
 * 用于 LangGraph 执行循环的状态管理
 */

import { Annotation } from '@langchain/langgraph'
import type { AgentAction } from '@resume-editor/shared'

/**
 * 任务步骤状态
 */
export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'failed'

/**
 * 任务步骤定义
 */
export interface TaskStep {
  /** 步骤 ID */
  id: string
  /** 步骤描述 */
  description: string
  /** 步骤状态 */
  status: StepStatus
  /** 执行结果（可选） */
  result?: string
  /** 错误信息（可选） */
  error?: string
}

/**
 * 任务规划
 */
export interface TaskPlan {
  steps: TaskStep[]
  currentStepIndex: number
}

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 步骤 ID */
  stepId: string
  /** 是否成功 */
  success: boolean
  /** 错误信息 */
  error?: string
  /** 重试次数 */
  retryCount?: number
}

/**
 * 环境变量接口
 */
export interface Env {
  DEEPSEEK_API_KEY?: string
  OPENAI_API_KEY?: string
  ANTHROPIC_API_KEY?: string
  ENVIRONMENT?: string
}

/**
 * Agent 状态注解定义
 * 使用 LangGraph 的 Annotation API 定义状态结构
 */
export const AgentStateAnnotation = Annotation.Root({
  /**
   * 用户原始请求
   */
  userRequest: Annotation<string>,

  /**
   * 任务规划
   */
  taskPlan: Annotation<TaskPlan>,

  /**
   * 已执行的操作列表
   */
  executedActions: Annotation<AgentAction[]>,

  /**
   * 验证结果列表
   */
  validationResults: Annotation<ValidationResult[]>,

  /**
   * 画布上下文（当前画布状态描述）
   */
  canvasContext: Annotation<string>,

  /**
   * 模式：edit | template | assistant
   */
  mode: Annotation<'edit' | 'template' | 'assistant'>,

  /**
   * 是否应该继续执行
   */
  shouldContinue: Annotation<boolean>,

  /**
   * 当前重试次数
   */
  retryCount: Annotation<number>,

  /**
   * 最大重试次数
   */
  maxRetries: Annotation<number>,

  /**
   * 最终响应消息
   */
  finalMessage: Annotation<string>,

  /**
   * 错误信息
   */
  error: Annotation<string | null>,
})

/**
 * Agent 状态类型
 */
export type AgentState = typeof AgentStateAnnotation.State

/**
 * 创建初始状态
 */
export function createInitialState(
  userRequest: string,
  canvasContext: string = '',
  mode: 'edit' | 'template' | 'assistant' = 'edit',
  maxRetries: number = 3
): AgentState {
  return {
    userRequest,
    taskPlan: {
      steps: [],
      currentStepIndex: 0,
    },
    executedActions: [],
    validationResults: [],
    canvasContext,
    mode,
    shouldContinue: true,
    retryCount: 0,
    maxRetries,
    finalMessage: '',
    error: null,
  }
}

/**
 * 获取当前步骤
 */
export function getCurrentStep(state: AgentState): TaskStep | null {
  const { steps, currentStepIndex } = state.taskPlan
  if (currentStepIndex >= steps.length) {
    return null
  }
  return steps[currentStepIndex]
}

/**
 * 检查是否所有步骤都已完成
 */
export function areAllStepsCompleted(state: AgentState): boolean {
  if (state.taskPlan.steps.length === 0) {
    return true
  }
  return state.taskPlan.steps.every((step) => step.status === 'completed')
}

/**
 * 检查是否有失败的步骤
 */
export function hasFailedStep(state: AgentState): boolean {
  return state.taskPlan.steps.some((step) => step.status === 'failed')
}

/**
 * 获取下一步骤索引
 */
export function getNextStepIndex(state: AgentState): number {
  return state.taskPlan.currentStepIndex + 1
}

/**
 * 检查是否还有更多步骤
 */
export function hasMoreSteps(state: AgentState): boolean {
  return state.taskPlan.currentStepIndex < state.taskPlan.steps.length - 1
}
