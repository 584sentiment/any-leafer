/**
 * 编辑器状态管理
 * 使用 Zustand 进行轻量级状态管理
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type {
  ResumeElement,
  CanvasState,
  ChatMessage,
  AgentMode,
  AIModelType,
  HistoryEntry,
} from '@resume-editor/shared'

/**
 * 编辑器状态
 */
interface EditorState {
  // 画布状态
  elements: ResumeElement[]
  selection: string[]
  viewport: {
    x: number
    y: number
    zoom: number
    width: number
    height: number
  }

  // 历史记录
  history: HistoryEntry[]
  historyIndex: number
  maxHistorySize: number

  // Agent 状态
  mode: AgentMode
  chatHistory: ChatMessage[]
  isProcessing: boolean
  model: AIModelType

  // UI 状态
  sidebarOpen: boolean
  chatOpen: boolean

  // Actions
  setElements: (elements: ResumeElement[]) => void
  addElement: (element: ResumeElement) => void
  updateElement: (id: string, updates: Partial<ResumeElement>) => void
  deleteElements: (ids: string[]) => void
  clearCanvas: () => void

  setSelection: (selection: string[]) => void
  setViewport: (viewport: Partial<EditorState['viewport']>) => void

  pushHistory: (description: string) => void
  undo: () => ResumeElement[] | null
  redo: () => ResumeElement[] | null

  setMode: (mode: AgentMode) => void
  addChatMessage: (message: ChatMessage) => void
  clearChatHistory: () => void
  setProcessing: (isProcessing: boolean) => void
  setModel: (model: AIModelType) => void

  toggleSidebar: () => void
  toggleChat: () => void

  getCanvasState: () => CanvasState
}

/**
 * 创建编辑器状态 store
 */
export const useEditorStore = create<EditorState>()(
  subscribeWithSelector((set, get) => ({
    // 初始状态
    elements: [],
    selection: [],
    viewport: { x: 0, y: 0, zoom: 1, width: 800, height: 600 },

    history: [],
    historyIndex: -1,
    maxHistorySize: 50,

    mode: 'edit',
    chatHistory: [],
    isProcessing: false,
    model: 'claude-sonnet-4.5',

    sidebarOpen: true,
    chatOpen: true,

    // 元素操作
    setElements: (elements) => {
      set({ elements })
    },

    addElement: (element) => {
      set((state) => ({
        elements: [...state.elements, element],
      }))
    },

    updateElement: (id, updates) => {
      set((state) => ({
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, ...updates } : el
        ),
      }))
    },

    deleteElements: (ids) => {
      const idSet = new Set(ids)
      set((state) => ({
        elements: state.elements.filter((el) => !idSet.has(el.id)),
        selection: state.selection.filter((id) => !idSet.has(id)),
      }))
    },

    clearCanvas: () => {
      set({ elements: [], selection: [] })
    },

    // 选择操作
    setSelection: (selection) => {
      set({ selection })
    },

    setViewport: (viewport) => {
      set((state) => ({
        viewport: { ...state.viewport, ...viewport },
      }))
    },

    // 历史记录
    pushHistory: (description) => {
      const state = get()
      const snapshot = [...state.elements]

      // 截断历史记录
      const newHistory = state.history.slice(0, state.historyIndex + 1)
      newHistory.push({
        timestamp: Date.now(),
        description,
        snapshot,
      })

      // 限制历史记录大小
      if (newHistory.length > state.maxHistorySize) {
        newHistory.shift()
      }

      set({
        history: newHistory,
        historyIndex: newHistory.length - 1,
      })
    },

    undo: () => {
      const state = get()
      if (state.historyIndex <= 0) return null

      const newIndex = state.historyIndex - 1
      const entry = state.history[newIndex]
      if (!entry) return null

      set({
        historyIndex: newIndex,
        elements: [...entry.snapshot],
      })

      return entry.snapshot
    },

    redo: () => {
      const state = get()
      if (state.historyIndex >= state.history.length - 1) return null

      const newIndex = state.historyIndex + 1
      const entry = state.history[newIndex]
      if (!entry) return null

      set({
        historyIndex: newIndex,
        elements: [...entry.snapshot],
      })

      return entry.snapshot
    },

    // Agent 操作
    setMode: (mode) => {
      set({ mode })
    },

    addChatMessage: (message) => {
      set((state) => ({
        chatHistory: [...state.chatHistory, message],
      }))
    },

    clearChatHistory: () => {
      set({ chatHistory: [] })
    },

    setProcessing: (isProcessing) => {
      set({ isProcessing })
    },

    setModel: (model) => {
      set({ model })
    },

    // UI 操作
    toggleSidebar: () => {
      set((state) => ({ sidebarOpen: !state.sidebarOpen }))
    },

    toggleChat: () => {
      set((state) => ({ chatOpen: !state.chatOpen }))
    },

    // 获取画布状态
    getCanvasState: () => {
      const state = get()
      return {
        elements: state.elements,
        viewport: state.viewport,
        selection: state.selection,
        paper: null, // store 中不存储纸张信息，需要从 editor 获取
      }
    },
  }))
)

/**
 * 选择器 hooks
 */
export const useElements = () => useEditorStore((state) => state.elements)
export const useSelection = () => useEditorStore((state) => state.selection)
export const useViewport = () => useEditorStore((state) => state.viewport)
export const useHistory = () => useEditorStore((state) => state.history)
export const useHistoryIndex = () =>
  useEditorStore((state) => state.historyIndex)
export const useMode = () => useEditorStore((state) => state.mode)
export const useChatHistory = () =>
  useEditorStore((state) => state.chatHistory)
export const useIsProcessing = () =>
  useEditorStore((state) => state.isProcessing)
export const useModel = () => useEditorStore((state) => state.model)
