/**
 * CanvasHistoryManager - 画布历史记录管理器
 * 管理撤销/重做功能
 */

import type { ResumeElement, HistoryEntry } from '@resume-editor/shared'

export interface HistoryManagerConfig {
  /** 最大历史记录数量 */
  maxSize: number
}

export class CanvasHistoryManager {
  private history: HistoryEntry[] = []
  private currentIndex: number = -1
  private config: HistoryManagerConfig

  constructor(config: Partial<HistoryManagerConfig> = {}) {
    this.config = {
      maxSize: 50,
      ...config,
    }
  }

  /**
   * 推送新的历史记录
   */
  push(snapshot: ResumeElement[], description: string): void {
    // 截断当前位置之后的历史
    this.history = this.history.slice(0, this.currentIndex + 1)

    // 添加新记录
    this.history.push({
      timestamp: Date.now(),
      description,
      snapshot: [...snapshot],
    })

    // 限制大小
    if (this.history.length > this.config.maxSize) {
      this.history.shift()
    } else {
      this.currentIndex++
    }
  }

  /**
   * 撤销
   * @returns 撤销后的快照，如果无法撤销则返回 null
   */
  undo(): ResumeElement[] | null {
    if (!this.canUndo()) return null

    this.currentIndex--
    return this.getCurrentSnapshot()
  }

  /**
   * 重做
   * @returns 重做后的快照，如果无法重做则返回 null
   */
  redo(): ResumeElement[] | null {
    if (!this.canRedo()) return null

    this.currentIndex++
    return this.getCurrentSnapshot()
  }

  /**
   * 是否可以撤销
   */
  canUndo(): boolean {
    return this.currentIndex > 0
  }

  /**
   * 是否可以重做
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }

  /**
   * 获取当前快照
   */
  getCurrentSnapshot(): ResumeElement[] | null {
    if (this.currentIndex < 0 || this.currentIndex >= this.history.length) {
      return null
    }
    return [...this.history[this.currentIndex].snapshot]
  }

  /**
   * 获取历史记录数量
   */
  getLength(): number {
    return this.history.length
  }

  /**
   * 获取当前位置
   */
  getCurrentIndex(): number {
    return this.currentIndex
  }

  /**
   * 清空历史记录
   */
  clear(): void {
    this.history = []
    this.currentIndex = -1
  }

  /**
   * 获取历史记录列表（用于显示）
   */
  getHistoryList(): HistoryEntry[] {
    return [...this.history]
  }
}
