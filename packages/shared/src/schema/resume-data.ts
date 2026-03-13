/**
 * 简历数据 Schema
 * 用于智能生成模板时收集用户信息
 */

import { z } from 'zod'

/**
 * 技能熟练度
 */
export const SkillLevelSchema = z.enum(['beginner', 'intermediate', 'advanced', 'expert'])

/**
 * 工作经历项
 */
export const ExperienceItemSchema = z.object({
  /** 公司名称 */
  company: z.string().min(1, '请输入公司名称'),
  /** 职位 */
  position: z.string().min(1, '请输入职位'),
  /** 开始时间 */
  startDate: z.string().min(1, '请输入开始时间'),
  /** 结束时间（留空表示至今） */
  endDate: z.string().optional(),
  /** 工作描述 */
  description: z.string().optional(),
})

/**
 * 教育背景项
 */
export const EducationItemSchema = z.object({
  /** 学校名称 */
  school: z.string().min(1, '请输入学校名称'),
  /** 专业 */
  major: z.string().optional(),
  /** 学位 */
  degree: z.string().optional(),
  /** 开始时间 */
  startDate: z.string().optional(),
  /** 结束时间 */
  endDate: z.string().optional(),
  /** 描述 */
  description: z.string().optional(),
})

/**
 * 技能项
 */
export const SkillItemSchema = z.object({
  /** 技能名称 */
  name: z.string().min(1, '请输入技能名称'),
  /** 熟练度 */
  level: SkillLevelSchema.optional(),
})

/**
 * 自定义部分项
 */
export const CustomSectionSchema = z.object({
  /** 部分标题 */
  title: z.string().min(1, '请输入标题'),
  /** 内容列表 */
  items: z.array(z.string()),
})

/**
 * 完整简历数据 Schema
 */
export const ResumeDataSchema = z.object({
  // 基本信息
  name: z.string().min(1, '请输入姓名'),
  title: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('请输入有效的邮箱地址').optional().or(z.literal('')),
  location: z.string().optional(),
  website: z.string().optional(),
  summary: z.string().optional(),

  // 工作经历
  experience: z.array(ExperienceItemSchema).default([]),

  // 教育背景
  education: z.array(EducationItemSchema).default([]),

  // 技能
  skills: z.array(SkillItemSchema).default([]),

  // 自定义部分
  customSections: z.array(CustomSectionSchema).optional(),
})

/**
 * 基本信息Schema（用于快速模式的最小信息收集）
 */
export const BasicInfoSchema = z.object({
  name: z.string().min(1, '请输入姓名'),
  title: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('请输入有效的邮箱地址').optional().or(z.literal('')),
  location: z.string().optional(),
})

// 导出类型
export type SkillLevel = z.infer<typeof SkillLevelSchema>
export type ExperienceItem = z.infer<typeof ExperienceItemSchema>
export type EducationItem = z.infer<typeof EducationItemSchema>
export type SkillItem = z.infer<typeof SkillItemSchema>
export type CustomSection = z.infer<typeof CustomSectionSchema>
export type ResumeData = z.infer<typeof ResumeDataSchema>
export type BasicInfo = z.infer<typeof BasicInfoSchema>
