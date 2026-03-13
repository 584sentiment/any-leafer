/**
 * @resume-editor/templates
 * 预置简历模板
 */

// 从各模板文件导入
export { classicTemplate, modernTemplate, templateCategories } from './classic'
export { creativeColorfulTemplate, creativeGradientTemplate } from './creative'
export { minimalTemplate, minimalTwoColumnTemplate } from './minimal'

// 导入类型和模板
import type { ResumeTemplate } from '@resume-editor/shared'
import { classicTemplate, modernTemplate } from './classic'
import { creativeColorfulTemplate, creativeGradientTemplate } from './creative'
import { minimalTemplate, minimalTwoColumnTemplate } from './minimal'

/**
 * 所有模板列表
 */
export const allTemplates: ResumeTemplate[] = [
  classicTemplate,
  modernTemplate,
  minimalTemplate,
  minimalTwoColumnTemplate,
  creativeColorfulTemplate,
  creativeGradientTemplate,
]
