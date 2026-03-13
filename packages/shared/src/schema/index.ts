/**
 * AI Agent Action Schema 定义
 * 使用 Zod 进行运行时类型验证
 */

import { z } from 'zod'

// ============ 扩展 Zod 添加 meta 支持 ============

declare module 'zod' {
  interface ZodType {
    _meta?: SchemaMeta
  }
}

interface SchemaMeta {
  title: string
  description: string
  systemPromptCategory?: string
}

/**
 * 为 Schema 添加元数据
 */
export function withMeta<T extends z.ZodType>(
  schema: T,
  meta: SchemaMeta
): T {
  schema._meta = meta
  return schema
}

// ============ 基础 Schema ============

/** 元素类型 Schema */
export const ElementTypeSchema = z.enum([
  'text',
  'heading',
  'rect',
  'ellipse',
  'line',
  'image',
  'divider',
  'group',
])

/** 位置 Schema */
export const PositionSchema = z.object({
  x: z.number().describe('X 坐标'),
  y: z.number().describe('Y 坐标'),
})

/** 尺寸 Schema */
export const SizeSchema = z.object({
  width: z.number().positive().describe('宽度'),
  height: z.number().positive().describe('高度'),
})

/** 颜色 Schema（支持 hex、rgb、rgba） */
export const ColorSchema = z
  .string()
  .describe('颜色值，支持 hex (#ffffff)、rgb、rgba 格式')

/** 文本对齐 Schema */
export const TextAlignSchema = z.enum(['left', 'center', 'right'])

/** 字体样式 Schema */
export const FontStyleSchema = z.enum(['normal', 'italic'])

/** 字重 Schema */
export const FontWeightSchema = z.enum([
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

// ============ 元素 Schema ============

/** 基础元素属性 Schema */
export const BaseElementSchema = z.object({
  id: z.string().optional().describe('元素 ID，创建时可选'),
  type: ElementTypeSchema,
  x: z.number().describe('X 坐标'),
  y: z.number().describe('Y 坐标'),
  width: z.number().positive().describe('宽度'),
  height: z.number().positive().describe('高度'),
  rotation: z.number().optional().describe('旋转角度（弧度）'),
  opacity: z.number().min(0).max(1).optional().describe('透明度'),
  visible: z.boolean().optional().describe('是否可见'),
  locked: z.boolean().optional().describe('是否锁定'),
  tag: z.string().optional().describe('元素标签'),
})

/** 文本元素 Schema */
export const TextElementSchema = BaseElementSchema.extend({
  type: z.literal('text'),
  content: z.string().describe('文本内容'),
  fontSize: z.number().positive().describe('字体大小'),
  fontFamily: z.string().describe('字体'),
  fontWeight: FontWeightSchema.describe('字重'),
  fontStyle: FontStyleSchema.optional().describe('字体样式'),
  fill: ColorSchema.describe('文本颜色'),
  textAlign: TextAlignSchema.optional().describe('文本对齐'),
  lineHeight: z.number().positive().optional().describe('行高'),
  textDecoration: z.enum(['none', 'underline', 'line-through']).optional(),
})

/** 标题元素 Schema */
export const HeadingElementSchema = TextElementSchema.extend({
  type: z.literal('heading'),
})

/** 矩形元素 Schema */
export const RectElementSchema = BaseElementSchema.extend({
  type: z.literal('rect'),
  fill: ColorSchema.describe('填充色'),
  stroke: ColorSchema.optional().describe('描边色'),
  strokeWidth: z.number().nonnegative().optional().describe('描边宽度'),
  cornerRadius: z.union([z.number(), z.array(z.number())]).optional(),
})

/** 椭圆元素 Schema */
export const EllipseElementSchema = BaseElementSchema.extend({
  type: z.literal('ellipse'),
  fill: ColorSchema.describe('填充色'),
  stroke: ColorSchema.optional().describe('描边色'),
  strokeWidth: z.number().nonnegative().optional().describe('描边宽度'),
})

/** 线条元素 Schema */
export const LineElementSchema = BaseElementSchema.extend({
  type: z.literal('line'),
  startPoint: PositionSchema.describe('起点'),
  endPoint: PositionSchema.describe('终点'),
  stroke: ColorSchema.describe('线条颜色'),
  strokeWidth: z.number().positive().describe('线条宽度'),
  strokeDasharray: z.array(z.number()).optional().describe('虚线样式'),
})

/** 图片元素 Schema */
export const ImageElementSchema = BaseElementSchema.extend({
  type: z.literal('image'),
  src: z.string().describe('图片 URL'),
  fit: z.enum(['fill', 'contain', 'cover']).optional().describe('填充方式'),
})

/** 分隔线元素 Schema */
export const DividerElementSchema = BaseElementSchema.extend({
  type: z.literal('divider'),
  stroke: ColorSchema.describe('线条颜色'),
  strokeWidth: z.number().positive().describe('线条宽度'),
  strokeDasharray: z.array(z.number()).optional(),
})

/** 分组元素 Schema */
export const GroupElementSchema = BaseElementSchema.extend({
  type: z.literal('group'),
  children: z.array(z.string()).describe('子元素 ID 列表'),
})

/** 元素联合 Schema */
export const ElementSchema = z.discriminatedUnion('type', [
  TextElementSchema,
  HeadingElementSchema,
  RectElementSchema,
  EllipseElementSchema,
  LineElementSchema,
  ImageElementSchema,
  DividerElementSchema,
  GroupElementSchema,
])

// ============ Action Schema ============

/** 创建元素 Action */
export const CreateElementActionSchema = withMeta(
  z.object({
    _type: z.literal('create-element'),
    intent: z.string().describe('操作意图说明'),
    element: ElementSchema.describe('要创建的元素'),
  }),
  {
    title: 'Create Element',
    description: '创建新的画布元素（文本、形状、图片等）',
  }
)

/** 更新元素 Action */
export const UpdateElementActionSchema = withMeta(
  z.object({
    _type: z.literal('update-element'),
    intent: z.string().describe('操作意图说明'),
    elementId: z.string().describe('要更新的元素 ID'),
    updates: z.record(z.unknown()).describe('要更新的属性'),
  }),
  {
    title: 'Update Element',
    description: '更新现有元素的属性（位置、大小、颜色、文本等）',
  }
)

/** 删除元素 Action */
export const DeleteElementActionSchema = withMeta(
  z.object({
    _type: z.literal('delete-element'),
    intent: z.string().describe('操作意图说明'),
    elementIds: z.array(z.string()).describe('要删除的元素 ID 列表'),
  }),
  {
    title: 'Delete Element',
    description: '删除一个或多个画布元素',
  }
)

/** 移动元素 Action */
export const MoveElementActionSchema = withMeta(
  z.object({
    _type: z.literal('move-element'),
    intent: z.string().describe('操作意图说明'),
    elementIds: z.array(z.string()).describe('要移动的元素 ID 列表'),
    deltaX: z.number().describe('X 方向偏移量'),
    deltaY: z.number().describe('Y 方向偏移量'),
  }),
  {
    title: 'Move Element',
    description: '移动元素位置',
  }
)

/** 调整大小 Action */
export const ResizeElementActionSchema = withMeta(
  z.object({
    _type: z.literal('resize-element'),
    intent: z.string().describe('操作意图说明'),
    elementId: z.string().describe('要调整的元素 ID'),
    width: z.number().positive().optional().describe('新宽度'),
    height: z.number().positive().optional().describe('新高度'),
  }),
  {
    title: 'Resize Element',
    description: '调整元素大小',
  }
)

/** 编辑文本 Action */
export const EditTextActionSchema = withMeta(
  z.object({
    _type: z.literal('edit-text'),
    intent: z.string().describe('操作意图说明'),
    elementId: z.string().describe('文本元素 ID'),
    content: z.string().optional().describe('新文本内容'),
    fontSize: z.number().positive().optional().describe('字体大小'),
    fontWeight: FontWeightSchema.optional().describe('字重'),
    fontStyle: FontStyleSchema.optional().describe('字体样式'),
    fill: ColorSchema.optional().describe('文本颜色'),
    textAlign: TextAlignSchema.optional().describe('对齐方式'),
  }),
  {
    title: 'Edit Text',
    description: '编辑文本内容和样式',
  }
)

/** 设置样式 Action */
export const SetStyleActionSchema = withMeta(
  z.object({
    _type: z.literal('set-style'),
    intent: z.string().describe('操作意图说明'),
    elementIds: z.array(z.string()).describe('元素 ID 列表'),
    fill: ColorSchema.optional().describe('填充色'),
    stroke: ColorSchema.optional().describe('描边色'),
    strokeWidth: z.number().nonnegative().optional().describe('描边宽度'),
    opacity: z.number().min(0).max(1).optional().describe('透明度'),
  }),
  {
    title: 'Set Style',
    description: '批量设置元素样式',
  }
)

/** 对齐元素 Action */
export const AlignElementsActionSchema = withMeta(
  z.object({
    _type: z.literal('align-elements'),
    intent: z.string().describe('操作意图说明'),
    elementIds: z.array(z.string()).describe('要对齐的元素 ID 列表'),
    alignment: z.enum(['left', 'center', 'right', 'top', 'middle', 'bottom']),
  }),
  {
    title: 'Align Elements',
    description: '对齐多个元素',
  }
)

/** 分发元素 Action */
export const DistributeElementsActionSchema = withMeta(
  z.object({
    _type: z.literal('distribute-elements'),
    intent: z.string().describe('操作意图说明'),
    elementIds: z.array(z.string()).describe('要分发的元素 ID 列表'),
    direction: z.enum(['horizontal', 'vertical']),
  }),
  {
    title: 'Distribute Elements',
    description: '均匀分布多个元素',
  }
)

/** 应用模板 Action */
export const ApplyTemplateActionSchema = withMeta(
  z.object({
    _type: z.literal('apply-template'),
    intent: z.string().describe('操作意图说明'),
    templateId: z.string().describe('模板 ID'),
  }),
  {
    title: 'Apply Template',
    description: '应用简历模板到画布',
  }
)

/** 生成模板 Action */
export const GenerateTemplateActionSchema = withMeta(
  z.object({
    _type: z.literal('generate-template'),
    intent: z.string().describe('操作意图说明'),
    description: z.string().describe('模板描述'),
    category: z.enum(['classic', 'modern', 'minimal', 'creative']).optional(),
  }),
  {
    title: 'Generate Template',
    description: 'AI 生成简历模板',
  }
)

/** 消息 Action */
export const MessageActionSchema = withMeta(
  z.object({
    _type: z.literal('message'),
    intent: z.string().describe('操作意图说明'),
    message: z.string().describe('消息内容'),
  }),
  {
    title: 'Message',
    description: '向用户发送消息',
  }
)

/** 思考 Action */
export const ThinkActionSchema = withMeta(
  z.object({
    _type: z.literal('think'),
    thought: z.string().describe('思考内容'),
  }),
  {
    title: 'Think',
    description: 'AI 内部思考（不显示给用户）',
    systemPromptCategory: 'thinking',
  }
)

/** 清空画布 Action */
export const ClearCanvasActionSchema = withMeta(
  z.object({
    _type: z.literal('clear-canvas'),
    intent: z.string().describe('操作意图说明'),
  }),
  {
    title: 'Clear Canvas',
    description: '清空画布上的所有元素',
  }
)

/** 撤销 Action */
export const UndoActionSchema = withMeta(
  z.object({
    _type: z.literal('undo'),
    intent: z.string().describe('操作意图说明'),
    steps: z.number().int().positive().optional().describe('撤销步数'),
  }),
  {
    title: 'Undo',
    description: '撤销最近的操作',
  }
)

/** 重做 Action */
export const RedoActionSchema = withMeta(
  z.object({
    _type: z.literal('redo'),
    intent: z.string().describe('操作意图说明'),
    steps: z.number().int().positive().optional().describe('重做步数'),
  }),
  {
    title: 'Redo',
    description: '重做已撤销的操作',
  }
)

/** 任务规划 Action */
export const TaskPlanActionSchema = withMeta(
  z.object({
    _type: z.literal('task-plan'),
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
  {
    title: 'Task Plan',
    description: '规划任务步骤',
  }
)

/** 任务进度更新 Action */
export const TaskProgressActionSchema = withMeta(
  z.object({
    _type: z.literal('task-progress'),
    stepId: z.string().describe('步骤 ID'),
    status: z.enum(['pending', 'in_progress', 'completed', 'failed']).describe('步骤状态'),
  }),
  {
    title: 'Task Progress',
    description: '更新任务步骤进度',
  }
)

// ============ Action 联合 Schema ============

/** 所有 Action 类型的联合 */
export const AgentActionSchema = z.discriminatedUnion('_type', [
  CreateElementActionSchema,
  UpdateElementActionSchema,
  DeleteElementActionSchema,
  MoveElementActionSchema,
  ResizeElementActionSchema,
  EditTextActionSchema,
  SetStyleActionSchema,
  AlignElementsActionSchema,
  DistributeElementsActionSchema,
  ApplyTemplateActionSchema,
  GenerateTemplateActionSchema,
  MessageActionSchema,
  ThinkActionSchema,
  ClearCanvasActionSchema,
  UndoActionSchema,
  RedoActionSchema,
  TaskPlanActionSchema,
  TaskProgressActionSchema,
])

/** Action 类型 */
export type AgentAction = z.infer<typeof AgentActionSchema>

/** Action 类型映射 */
export type ActionTypeMap = {
  'create-element': z.infer<typeof CreateElementActionSchema>
  'update-element': z.infer<typeof UpdateElementActionSchema>
  'delete-element': z.infer<typeof DeleteElementActionSchema>
  'move-element': z.infer<typeof MoveElementActionSchema>
  'resize-element': z.infer<typeof ResizeElementActionSchema>
  'edit-text': z.infer<typeof EditTextActionSchema>
  'set-style': z.infer<typeof SetStyleActionSchema>
  'align-elements': z.infer<typeof AlignElementsActionSchema>
  'distribute-elements': z.infer<typeof DistributeElementsActionSchema>
  'apply-template': z.infer<typeof ApplyTemplateActionSchema>
  'generate-template': z.infer<typeof GenerateTemplateActionSchema>
  message: z.infer<typeof MessageActionSchema>
  think: z.infer<typeof ThinkActionSchema>
  'clear-canvas': z.infer<typeof ClearCanvasActionSchema>
  undo: z.infer<typeof UndoActionSchema>
  redo: z.infer<typeof RedoActionSchema>
}

/** 获取所有 Action 类型名称 */
export const ACTION_TYPES = [
  'create-element',
  'update-element',
  'delete-element',
  'move-element',
  'resize-element',
  'edit-text',
  'set-style',
  'align-elements',
  'distribute-elements',
  'apply-template',
  'generate-template',
  'message',
  'think',
  'clear-canvas',
  'undo',
  'redo',
] as const

export type ActionTypeName = (typeof ACTION_TYPES)[number]

// ============ Schema 注册表 ============

/**
 * Schema 注册表，用于根据 Action 类型获取对应的 Schema
 */
export const ActionSchemaRegistry: Record<
  ActionTypeName,
  z.ZodType<any, any, any>
> = {
  'create-element': CreateElementActionSchema,
  'update-element': UpdateElementActionSchema,
  'delete-element': DeleteElementActionSchema,
  'move-element': MoveElementActionSchema,
  'resize-element': ResizeElementActionSchema,
  'edit-text': EditTextActionSchema,
  'set-style': SetStyleActionSchema,
  'align-elements': AlignElementsActionSchema,
  'distribute-elements': DistributeElementsActionSchema,
  'apply-template': ApplyTemplateActionSchema,
  'generate-template': GenerateTemplateActionSchema,
  message: MessageActionSchema,
  think: ThinkActionSchema,
  'clear-canvas': ClearCanvasActionSchema,
  undo: UndoActionSchema,
  redo: RedoActionSchema,
}

/**
 * 获取 Action 的元数据
 */
export function getActionMeta(actionType: ActionTypeName): SchemaMeta | undefined {
  const schema = ActionSchemaRegistry[actionType]
  return schema?._meta
}

// 导出简历数据 Schema
export {
  ResumeDataSchema,
  BasicInfoSchema,
  ExperienceItemSchema,
  EducationItemSchema,
  SkillItemSchema,
  SkillLevelSchema,
  CustomSectionSchema,
  type ResumeData,
  type BasicInfo,
  type ExperienceItem,
  type EducationItem,
  type SkillItem,
  type SkillLevel,
  type CustomSection,
} from './resume-data'
