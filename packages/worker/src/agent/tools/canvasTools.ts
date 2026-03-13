/**
 * LangChain 画布操作工具定义
 * 将现有的 AgentAction Schema 转换为 LangChain Tool
 */

import { tool } from '@langchain/core/tools'
import { z } from 'zod'

// ============ 基础 Schema ============

const ElementTypeSchema = z.enum([
  'text',
  'heading',
  'rect',
  'ellipse',
  'line',
  'image',
  'divider',
  'group',
])

const TextAlignSchema = z.enum(['left', 'center', 'right'])

const FontWeightSchema = z.enum([
  'normal',
  'bold',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
])

// ============ 工具定义 ============

/**
 * 创建元素工具
 */
export const createElementTool = tool(
  async (input) => {
    const action = {
      _type: 'create-element' as const,
      intent: input.intent,
      element: input.element,
    }
    return JSON.stringify(action)
  },
  {
    name: 'create_element',
    description:
      '在画布上创建新元素。支持文本(text)、标题(heading)、矩形(rect)、椭圆(ellipse)、分隔线(divider)、图片(image)等类型。',
    schema: z.object({
      intent: z.string().describe('操作意图说明'),
      element: z.object({
        type: ElementTypeSchema,
        x: z.number().describe('X 坐标'),
        y: z.number().describe('Y 坐标'),
        width: z.number().positive().describe('宽度'),
        height: z.number().positive().describe('高度'),
        // 文本元素属性
        content: z.string().optional().describe('文本内容（text/heading 必需）'),
        fontSize: z.number().positive().optional().describe('字体大小'),
        fontFamily: z.string().optional().describe('字体'),
        fontWeight: FontWeightSchema.optional().describe('字重'),
        fill: z.string().optional().describe('填充色或文本颜色'),
        textAlign: TextAlignSchema.optional().describe('文本对齐'),
        // 形状元素属性
        stroke: z.string().optional().describe('描边色'),
        strokeWidth: z.number().positive().optional().describe('描边宽度'),
        cornerRadius: z.number().optional().describe('圆角半径（rect）'),
        // 图片属性
        src: z.string().optional().describe('图片 URL（image 必需）'),
      }),
    }),
  }
)

/**
 * 更新元素工具
 */
export const updateElementTool = tool(
  async (input) => {
    const action = {
      _type: 'update-element' as const,
      intent: input.intent,
      elementId: input.elementId,
      updates: input.updates,
    }
    return JSON.stringify(action)
  },
  {
    name: 'update_element',
    description: '更新画布上已有元素的属性。需要提供正确的元素 ID。',
    schema: z.object({
      intent: z.string().describe('操作意图说明'),
      elementId: z.string().describe('要更新的元素 ID'),
      updates: z.record(z.unknown()).describe('要更新的属性'),
    }),
  }
)

/**
 * 删除元素工具
 */
export const deleteElementTool = tool(
  async (input) => {
    const action = {
      _type: 'delete-element' as const,
      intent: input.intent,
      elementIds: input.elementIds,
    }
    return JSON.stringify(action)
  },
  {
    name: 'delete_element',
    description: '删除画布上的一个或多个元素。',
    schema: z.object({
      intent: z.string().describe('操作意图说明'),
      elementIds: z.array(z.string()).describe('要删除的元素 ID 列表'),
    }),
  }
)

/**
 * 移动元素工具
 */
export const moveElementTool = tool(
  async (input) => {
    const action = {
      _type: 'move-element' as const,
      intent: input.intent,
      elementIds: input.elementIds,
      deltaX: input.deltaX,
      deltaY: input.deltaY,
    }
    return JSON.stringify(action)
  },
  {
    name: 'move_element',
    description: '移动元素位置。deltaX 和 deltaY 是相对偏移量。',
    schema: z.object({
      intent: z.string().describe('操作意图说明'),
      elementIds: z.array(z.string()).describe('要移动的元素 ID 列表'),
      deltaX: z.number().describe('X 方向偏移量'),
      deltaY: z.number().describe('Y 方向偏移量'),
    }),
  }
)

/**
 * 调整大小工具
 */
export const resizeElementTool = tool(
  async (input) => {
    const action = {
      _type: 'resize-element' as const,
      intent: input.intent,
      elementId: input.elementId,
      width: input.width,
      height: input.height,
    }
    return JSON.stringify(action)
  },
  {
    name: 'resize_element',
    description: '调整元素大小。',
    schema: z.object({
      intent: z.string().describe('操作意图说明'),
      elementId: z.string().describe('要调整的元素 ID'),
      width: z.number().positive().optional().describe('新宽度'),
      height: z.number().positive().optional().describe('新高度'),
    }),
  }
)

/**
 * 编辑文本工具
 */
export const editTextTool = tool(
  async (input) => {
    const action = {
      _type: 'edit-text' as const,
      intent: input.intent,
      elementId: input.elementId,
      content: input.content,
      fontSize: input.fontSize,
      fontWeight: input.fontWeight,
      fill: input.fill,
      textAlign: input.textAlign,
    }
    return JSON.stringify(action)
  },
  {
    name: 'edit_text',
    description: '编辑文本元素的内容和样式。',
    schema: z.object({
      intent: z.string().describe('操作意图说明'),
      elementId: z.string().describe('文本元素 ID'),
      content: z.string().optional().describe('新文本内容'),
      fontSize: z.number().positive().optional().describe('字体大小'),
      fontWeight: FontWeightSchema.optional().describe('字重'),
      fill: z.string().optional().describe('文本颜色'),
      textAlign: TextAlignSchema.optional().describe('对齐方式'),
    }),
  }
)

/**
 * 设置样式工具
 */
export const setStyleTool = tool(
  async (input) => {
    const action = {
      _type: 'set-style' as const,
      intent: input.intent,
      elementIds: input.elementIds,
      fill: input.fill,
      stroke: input.stroke,
      strokeWidth: input.strokeWidth,
      opacity: input.opacity,
    }
    return JSON.stringify(action)
  },
  {
    name: 'set_style',
    description: '批量设置元素的样式属性。',
    schema: z.object({
      intent: z.string().describe('操作意图说明'),
      elementIds: z.array(z.string()).describe('元素 ID 列表'),
      fill: z.string().optional().describe('填充色'),
      stroke: z.string().optional().describe('描边色'),
      strokeWidth: z.number().nonnegative().optional().describe('描边宽度'),
      opacity: z.number().min(0).max(1).optional().describe('透明度'),
    }),
  }
)

/**
 * 对齐元素工具
 */
export const alignElementsTool = tool(
  async (input) => {
    const action = {
      _type: 'align-elements' as const,
      intent: input.intent,
      elementIds: input.elementIds,
      alignment: input.alignment,
    }
    return JSON.stringify(action)
  },
  {
    name: 'align_elements',
    description: '对齐多个元素。',
    schema: z.object({
      intent: z.string().describe('操作意图说明'),
      elementIds: z.array(z.string()).describe('要对齐的元素 ID 列表'),
      alignment: z
        .enum(['left', 'center', 'right', 'top', 'middle', 'bottom'])
        .describe('对齐方式'),
    }),
  }
)

/**
 * 分发元素工具
 */
export const distributeElementsTool = tool(
  async (input) => {
    const action = {
      _type: 'distribute-elements' as const,
      intent: input.intent,
      elementIds: input.elementIds,
      direction: input.direction,
    }
    return JSON.stringify(action)
  },
  {
    name: 'distribute_elements',
    description: '在水平或垂直方向上均匀分布多个元素。',
    schema: z.object({
      intent: z.string().describe('操作意图说明'),
      elementIds: z.array(z.string()).describe('要分发的元素 ID 列表'),
      direction: z.enum(['horizontal', 'vertical']).describe('分布方向'),
    }),
  }
)

/**
 * 发送消息工具
 */
export const sendMessageTool = tool(
  async (input) => {
    const action = {
      _type: 'message' as const,
      intent: input.intent,
      message: input.message,
    }
    return JSON.stringify(action)
  },
  {
    name: 'send_message',
    description: '向用户发送消息，用于告知操作结果或提供建议。',
    schema: z.object({
      intent: z.string().describe('操作意图说明'),
      message: z.string().describe('消息内容'),
    }),
  }
)

/**
 * 清空画布工具
 */
export const clearCanvasTool = tool(
  async (input) => {
    const action = {
      _type: 'clear-canvas' as const,
      intent: input.intent,
    }
    return JSON.stringify(action)
  },
  {
    name: 'clear_canvas',
    description: '清空画布上的所有元素。',
    schema: z.object({
      intent: z.string().describe('操作意图说明'),
    }),
  }
)

/**
 * 任务规划工具
 */
export const taskPlanTool = tool(
  async (input) => {
    const action = {
      _type: 'task-plan' as const,
      intent: input.intent,
      steps: input.steps,
    }
    return JSON.stringify(action)
  },
  {
    name: 'task_plan',
    description: '规划任务步骤，用于复杂任务的分解。',
    schema: z.object({
      intent: z.string().describe('操作意图说明'),
      steps: z
        .array(
          z.object({
            id: z.string().describe('步骤 ID'),
            description: z.string().describe('步骤描述'),
          })
        )
        .describe('任务步骤列表'),
    }),
  }
)

/**
 * 任务进度工具
 */
export const taskProgressTool = tool(
  async (input) => {
    const action = {
      _type: 'task-progress' as const,
      stepId: input.stepId,
      status: input.status,
    }
    return JSON.stringify(action)
  },
  {
    name: 'task_progress',
    description: '更新任务步骤的执行状态。',
    schema: z.object({
      stepId: z.string().describe('步骤 ID'),
      status: z
        .enum(['pending', 'in_progress', 'completed', 'failed'])
        .describe('步骤状态'),
    }),
  }
)

/**
 * 获取所有画布操作工具
 */
export function getCanvasTools() {
  return [
    createElementTool,
    updateElementTool,
    deleteElementTool,
    moveElementTool,
    resizeElementTool,
    editTextTool,
    setStyleTool,
    alignElementsTool,
    distributeElementsTool,
    sendMessageTool,
    clearCanvasTool,
    taskPlanTool,
    taskProgressTool,
  ]
}

/**
 * 获取画布创建和编辑相关工具（不含 task-plan/task-progress）
 */
export function getCanvasEditTools() {
  return [
    createElementTool,
    updateElementTool,
    deleteElementTool,
    moveElementTool,
    resizeElementTool,
    editTextTool,
    setStyleTool,
    alignElementsTool,
    distributeElementsTool,
    clearCanvasTool,
  ]
}
