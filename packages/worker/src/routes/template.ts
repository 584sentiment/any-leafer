/**
 * 模板生成 API
 * 根据用户信息和模板配置智能生成简历元素
 */

import { Hono } from 'hono'
import type { ResumeData, ResumeElement, SmartTemplateConfig, TemplateCategory } from '@resume-editor/shared'

export const templateRouter = new Hono()

/**
 * 模板生成请求
 */
interface GenerateTemplateRequest {
  templateId: string
  templateConfig: {
    category: TemplateCategory
    smartConfig?: SmartTemplateConfig
    canvasSize: { width: number; height: number }
  }
  resumeData: ResumeData
}

/**
 * 根据模板风格和用户信息生成简历元素
 */
function generateResumeElements(
  templateConfig: GenerateTemplateRequest['templateConfig'],
  resumeData: ResumeData
): ResumeElement[] {
  const { category, smartConfig, canvasSize } = templateConfig
  const elements: ResumeElement[] = []

  // 获取配色方案
  const colors = smartConfig?.colorScheme || {
    primary: '#2c3e50',
    secondary: '#7f8c8d',
    background: '#ffffff',
    text: '#333333',
  }

  // 获取字体配置
  const fonts = {
    headingFont: smartConfig?.typography?.headingFont || 'Arial',
    bodyFont: smartConfig?.typography?.bodyFont || 'Arial',
  }

  const padding = 50
  let currentY = padding

  // 根据不同分类生成不同布局
  switch (category) {
    case 'classic':
      return generateClassicLayout(resumeData, canvasSize, colors, fonts)
    case 'modern':
      return generateModernLayout(resumeData, canvasSize, colors, fonts)
    case 'minimal':
      return generateMinimalLayout(resumeData, canvasSize, colors, fonts)
    case 'creative':
      return generateCreativeLayout(resumeData, canvasSize, colors, fonts)
    default:
      return generateClassicLayout(resumeData, canvasSize, colors, fonts)
  }
}

/**
 * 经典布局 - 居中对齐，传统风格
 */
function generateClassicLayout(
  data: ResumeData,
  canvasSize: { width: number; height: number },
  colors: { primary: string; secondary: string; text: string },
  fonts: { headingFont: string; bodyFont: string }
): ResumeElement[] {
  const elements: ResumeElement[] = []
  const padding = 50
  const contentWidth = canvasSize.width - padding * 2
  let y = padding

  // 姓名
  elements.push({
    id: 'name',
    type: 'heading',
    x: padding,
    y,
    width: contentWidth,
    height: 50,
    content: data.name,
    fontSize: 32,
    fontFamily: fonts.headingFont,
    fontWeight: 'bold',
    fontStyle: 'normal',
    fill: colors.primary,
    textAlign: 'center',
  })
  y += 55

  // 职位
  if (data.title) {
    elements.push({
      id: 'title',
      type: 'text',
      x: padding,
      y,
      width: contentWidth,
      height: 25,
      content: data.title,
      fontSize: 16,
      fontFamily: fonts.bodyFont,
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: colors.secondary,
      textAlign: 'center',
    })
    y += 30
  }

  // 联系信息
  const contactParts = [data.phone, data.email, data.location].filter(Boolean)
  if (contactParts.length > 0) {
    elements.push({
      id: 'contact',
      type: 'text',
      x: padding,
      y,
      width: contentWidth,
      height: 25,
      content: contactParts.join(' | '),
      fontSize: 13,
      fontFamily: fonts.bodyFont,
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: colors.secondary,
      textAlign: 'center',
    })
    y += 35
  }

  // 分隔线
  elements.push({
    id: 'divider-1',
    type: 'divider',
    x: padding,
    y,
    width: contentWidth,
    height: 1,
    stroke: '#cccccc',
    strokeWidth: 1,
  })
  y += 20

  // 个人简介
  if (data.summary) {
    elements.push({
      id: 'summary-title',
      type: 'heading',
      x: padding,
      y,
      width: contentWidth,
      height: 25,
      content: '个人简介',
      fontSize: 18,
      fontFamily: fonts.headingFont,
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: colors.primary,
      textAlign: 'left',
    })
    y += 30

    elements.push({
      id: 'summary-content',
      type: 'text',
      x: padding,
      y,
      width: contentWidth,
      height: 60,
      content: data.summary,
      fontSize: 13,
      fontFamily: fonts.bodyFont,
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: colors.text,
      textAlign: 'left',
      lineHeight: 1.6,
    })
    y += 80
  }

  // 工作经历
  if (data.experience.length > 0) {
    elements.push({
      id: 'work-title',
      type: 'heading',
      x: padding,
      y,
      width: contentWidth,
      height: 25,
      content: '工作经历',
      fontSize: 18,
      fontFamily: fonts.headingFont,
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: colors.primary,
      textAlign: 'left',
    })
    y += 30

    data.experience.forEach((exp, index) => {
      const expText = `${exp.position} | ${exp.company} | ${exp.startDate}${exp.endDate ? ' - ' + exp.endDate : ' - 至今'}`
      elements.push({
        id: `work-${index}-header`,
        type: 'text',
        x: padding,
        y,
        width: contentWidth,
        height: 20,
        content: expText,
        fontSize: 14,
        fontFamily: fonts.bodyFont,
        fontWeight: 'bold',
        fontStyle: 'normal',
        fill: colors.text,
        textAlign: 'left',
      })
      y += 22

      if (exp.description) {
        elements.push({
          id: `work-${index}-desc`,
          type: 'text',
          x: padding,
          y,
          width: contentWidth,
          height: 50,
          content: exp.description,
          fontSize: 13,
          fontFamily: fonts.bodyFont,
          fontWeight: 'normal',
          fontStyle: 'normal',
          fill: colors.text,
          textAlign: 'left',
          lineHeight: 1.5,
        })
        y += 60
      }
    })
  }

  // 教育背景
  if (data.education.length > 0) {
    y += 10
    elements.push({
      id: 'edu-title',
      type: 'heading',
      x: padding,
      y,
      width: contentWidth,
      height: 25,
      content: '教育背景',
      fontSize: 18,
      fontFamily: fonts.headingFont,
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: colors.primary,
      textAlign: 'left',
    })
    y += 30

    data.education.forEach((edu, index) => {
      const eduText = `${edu.school}${edu.major ? ' | ' + edu.major : ''}${edu.degree ? ' | ' + edu.degree : ''}`
      elements.push({
        id: `edu-${index}`,
        type: 'text',
        x: padding,
        y,
        width: contentWidth,
        height: 20,
        content: eduText,
        fontSize: 14,
        fontFamily: fonts.bodyFont,
        fontWeight: 'normal',
        fontStyle: 'normal',
        fill: colors.text,
        textAlign: 'left',
      })
      y += 25
    })
  }

  // 技能
  if (data.skills.length > 0) {
    y += 10
    elements.push({
      id: 'skills-title',
      type: 'heading',
      x: padding,
      y,
      width: contentWidth,
      height: 25,
      content: '专业技能',
      fontSize: 18,
      fontFamily: fonts.headingFont,
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: colors.primary,
      textAlign: 'left',
    })
    y += 30

    const skillsText = data.skills.map((s) => s.name).join(' | ')
    elements.push({
      id: 'skills-content',
      type: 'text',
      x: padding,
      y,
      width: contentWidth,
      height: 25,
      content: skillsText,
      fontSize: 13,
      fontFamily: fonts.bodyFont,
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: colors.text,
      textAlign: 'left',
    })
  }

  return elements
}

/**
 * 现代布局 - 左侧边栏
 */
function generateModernLayout(
  data: ResumeData,
  canvasSize: { width: number; height: number },
  colors: { primary: string; secondary: string; text: string },
  fonts: { headingFont: string; bodyFont: string }
): ResumeElement[] {
  const elements: ResumeElement[] = []
  const sidebarWidth = 250
  const mainPadding = 280
  const mainWidth = canvasSize.width - mainPadding - 50

  // 左侧背景
  elements.push({
    id: 'sidebar-bg',
    type: 'rect',
    x: 0,
    y: 0,
    width: sidebarWidth,
    height: canvasSize.height,
    fill: colors.primary,
  })

  // 左侧 - 姓名
  elements.push({
    id: 'name',
    type: 'heading',
    x: 20,
    y: 40,
    width: sidebarWidth - 40,
    height: 50,
    content: data.name,
    fontSize: 28,
    fontFamily: fonts.headingFont,
    fontWeight: 'bold',
    fontStyle: 'normal',
    fill: '#ffffff',
    textAlign: 'left',
  })

  // 左侧 - 职位
  if (data.title) {
    elements.push({
      id: 'title',
      type: 'text',
      x: 20,
      y: 95,
      width: sidebarWidth - 40,
      height: 25,
      content: data.title,
      fontSize: 14,
      fontFamily: fonts.bodyFont,
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: '#bdc3c7',
      textAlign: 'left',
    })
  }

  // 左侧 - 联系方式
  let leftY = 160
  elements.push({
    id: 'contact-title',
    type: 'heading',
    x: 20,
    y: leftY,
    width: sidebarWidth - 40,
    height: 25,
    content: '联系方式',
    fontSize: 14,
    fontFamily: fonts.headingFont,
    fontWeight: 'bold',
    fontStyle: 'normal',
    fill: '#ffffff',
    textAlign: 'left',
  })
  leftY += 30

  const contactLines: string[] = []
  if (data.email) contactLines.push(`📧 ${data.email}`)
  if (data.phone) contactLines.push(`📱 ${data.phone}`)
  if (data.location) contactLines.push(`📍 ${data.location}`)

  if (contactLines.length > 0) {
    elements.push({
      id: 'contact-info',
      type: 'text',
      x: 20,
      y: leftY,
      width: sidebarWidth - 40,
      height: 80,
      content: contactLines.join('\n'),
      fontSize: 12,
      fontFamily: fonts.bodyFont,
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: '#bdc3c7',
      textAlign: 'left',
      lineHeight: 1.8,
    })
    leftY += 100
  }

  // 左侧 - 技能
  if (data.skills.length > 0) {
    elements.push({
      id: 'skills-title',
      type: 'heading',
      x: 20,
      y: leftY,
      width: sidebarWidth - 40,
      height: 25,
      content: '专业技能',
      fontSize: 14,
      fontFamily: fonts.headingFont,
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: '#ffffff',
      textAlign: 'left',
    })
    leftY += 30

    elements.push({
      id: 'skills-content',
      type: 'text',
      x: 20,
      y: leftY,
      width: sidebarWidth - 40,
      height: 100,
      content: data.skills.map((s) => s.name).join('\n'),
      fontSize: 12,
      fontFamily: fonts.bodyFont,
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: '#bdc3c7',
      textAlign: 'left',
      lineHeight: 1.8,
    })
  }

  // 右侧主内容
  let rightY = 50

  // 个人简介
  if (data.summary) {
    elements.push({
      id: 'summary-title',
      type: 'heading',
      x: mainPadding,
      y: rightY,
      width: mainWidth,
      height: 25,
      content: '关于我',
      fontSize: 18,
      fontFamily: fonts.headingFont,
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: colors.primary,
      textAlign: 'left',
    })
    rightY += 30

    elements.push({
      id: 'summary-content',
      type: 'text',
      x: mainPadding,
      y: rightY,
      width: mainWidth,
      height: 60,
      content: data.summary,
      fontSize: 13,
      fontFamily: fonts.bodyFont,
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: colors.text,
      textAlign: 'left',
      lineHeight: 1.6,
    })
    rightY += 80
  }

  // 工作经历
  if (data.experience.length > 0) {
    elements.push({
      id: 'work-title',
      type: 'heading',
      x: mainPadding,
      y: rightY,
      width: mainWidth,
      height: 25,
      content: '工作经历',
      fontSize: 18,
      fontFamily: fonts.headingFont,
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: colors.primary,
      textAlign: 'left',
    })
    rightY += 30

    data.experience.forEach((exp, index) => {
      elements.push({
        id: `work-${index}-header`,
        type: 'text',
        x: mainPadding,
        y: rightY,
        width: mainWidth,
        height: 20,
        content: `${exp.position} | ${exp.company}`,
        fontSize: 14,
        fontFamily: fonts.bodyFont,
        fontWeight: 'bold',
        fontStyle: 'normal',
        fill: colors.text,
        textAlign: 'left',
      })
      rightY += 22

      elements.push({
        id: `work-${index}-date`,
        type: 'text',
        x: mainPadding,
        y: rightY,
        width: mainWidth,
        height: 18,
        content: `${exp.startDate}${exp.endDate ? ' - ' + exp.endDate : ' - 至今'}`,
        fontSize: 12,
        fontFamily: fonts.bodyFont,
        fontWeight: 'normal',
        fontStyle: 'italic',
        fill: colors.secondary,
        textAlign: 'left',
      })
      rightY += 22

      if (exp.description) {
        elements.push({
          id: `work-${index}-desc`,
          type: 'text',
          x: mainPadding,
          y: rightY,
          width: mainWidth,
          height: 50,
          content: exp.description,
          fontSize: 13,
          fontFamily: fonts.bodyFont,
          fontWeight: 'normal',
          fontStyle: 'normal',
          fill: colors.text,
          textAlign: 'left',
          lineHeight: 1.5,
        })
        rightY += 60
      }
    })
  }

  // 教育背景
  if (data.education.length > 0) {
    rightY += 10
    elements.push({
      id: 'edu-title',
      type: 'heading',
      x: mainPadding,
      y: rightY,
      width: mainWidth,
      height: 25,
      content: '教育背景',
      fontSize: 18,
      fontFamily: fonts.headingFont,
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: colors.primary,
      textAlign: 'left',
    })
    rightY += 30

    data.education.forEach((edu, index) => {
      elements.push({
        id: `edu-${index}`,
        type: 'text',
        x: mainPadding,
        y: rightY,
        width: mainWidth,
        height: 20,
        content: `${edu.school}${edu.major ? ' | ' + edu.major : ''}${edu.degree ? ' | ' + edu.degree : ''}`,
        fontSize: 13,
        fontFamily: fonts.bodyFont,
        fontWeight: 'normal',
        fontStyle: 'normal',
        fill: colors.text,
        textAlign: 'left',
      })
      rightY += 25
    })
  }

  return elements
}

/**
 * 简约布局 - 大量留白
 */
function generateMinimalLayout(
  data: ResumeData,
  canvasSize: { width: number; height: number },
  colors: { primary: string; secondary: string; text: string },
  fonts: { headingFont: string; bodyFont: string }
): ResumeElement[] {
  const elements: ResumeElement[] = []
  const padding = 80
  const contentWidth = canvasSize.width - padding * 2
  let y = padding

  // 姓名
  elements.push({
    id: 'name',
    type: 'heading',
    x: padding,
    y,
    width: contentWidth,
    height: 50,
    content: data.name,
    fontSize: 28,
    fontFamily: 'Georgia',
    fontWeight: 'normal',
    fontStyle: 'normal',
    fill: colors.primary,
    textAlign: 'left',
  })
  y += 55

  // 职位
  if (data.title) {
    elements.push({
      id: 'title',
      type: 'text',
      x: padding,
      y,
      width: contentWidth,
      height: 25,
      content: data.title,
      fontSize: 16,
      fontFamily: 'Georgia',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: colors.secondary,
      textAlign: 'left',
    })
    y += 35
  }

  // 分隔线
  elements.push({
    id: 'divider',
    type: 'divider',
    x: padding,
    y,
    width: 100,
    height: 1,
    stroke: colors.primary,
    strokeWidth: 2,
  })
  y += 20

  // 联系信息
  const contactParts = [data.email, data.phone, data.location].filter(Boolean)
  if (contactParts.length > 0) {
    elements.push({
      id: 'contact',
      type: 'text',
      x: padding,
      y,
      width: contentWidth,
      height: 20,
      content: contactParts.join(' | '),
      fontSize: 12,
      fontFamily: 'Georgia',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: colors.secondary,
      textAlign: 'left',
    })
    y += 40
  }

  // 个人简介
  if (data.summary) {
    elements.push({
      id: 'summary-title',
      type: 'heading',
      x: padding,
      y,
      width: contentWidth,
      height: 25,
      content: '关于我',
      fontSize: 14,
      fontFamily: 'Georgia',
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: colors.primary,
      textAlign: 'left',
    })
    y += 30

    elements.push({
      id: 'summary-content',
      type: 'text',
      x: padding,
      y,
      width: contentWidth,
      height: 60,
      content: data.summary,
      fontSize: 13,
      fontFamily: 'Georgia',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: colors.text,
      textAlign: 'left',
      lineHeight: 1.8,
    })
    y += 90
  }

  // 工作经历
  if (data.experience.length > 0) {
    elements.push({
      id: 'work-title',
      type: 'heading',
      x: padding,
      y,
      width: contentWidth,
      height: 25,
      content: '工作经历',
      fontSize: 14,
      fontFamily: 'Georgia',
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: colors.primary,
      textAlign: 'left',
    })
    y += 30

    data.experience.forEach((exp, index) => {
      elements.push({
        id: `work-${index}`,
        type: 'text',
        x: padding,
        y,
        width: contentWidth,
        height: 50,
        content: `${exp.position} | ${exp.company} | ${exp.startDate}${exp.endDate ? ' - ' + exp.endDate : ' - 至今'}\n${exp.description || ''}`,
        fontSize: 13,
        fontFamily: 'Georgia',
        fontWeight: 'normal',
        fontStyle: 'normal',
        fill: colors.text,
        textAlign: 'left',
        lineHeight: 1.7,
      })
      y += 70
    })
  }

  // 教育背景
  if (data.education.length > 0) {
    elements.push({
      id: 'edu-title',
      type: 'heading',
      x: padding,
      y,
      width: contentWidth,
      height: 25,
      content: '教育背景',
      fontSize: 14,
      fontFamily: 'Georgia',
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: colors.primary,
      textAlign: 'left',
    })
    y += 30

    data.education.forEach((edu, index) => {
      elements.push({
        id: `edu-${index}`,
        type: 'text',
        x: padding,
        y,
        width: contentWidth,
        height: 25,
        content: `${edu.school}${edu.major ? ' | ' + edu.major : ''}`,
        fontSize: 13,
        fontFamily: 'Georgia',
        fontWeight: 'normal',
        fontStyle: 'normal',
        fill: colors.text,
        textAlign: 'left',
      })
      y += 30
    })
  }

  // 技能
  if (data.skills.length > 0) {
    y += 10
    elements.push({
      id: 'skills-title',
      type: 'heading',
      x: padding,
      y,
      width: contentWidth,
      height: 25,
      content: '专业技能',
      fontSize: 14,
      fontFamily: 'Georgia',
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: colors.primary,
      textAlign: 'left',
    })
    y += 30

    elements.push({
      id: 'skills-content',
      type: 'text',
      x: padding,
      y,
      width: contentWidth,
      height: 25,
      content: data.skills.map((s) => s.name).join(' / '),
      fontSize: 13,
      fontFamily: 'Georgia',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: colors.text,
      textAlign: 'left',
    })
  }

  return elements
}

/**
 * 创意布局 - 彩色顶部
 */
function generateCreativeLayout(
  data: ResumeData,
  canvasSize: { width: number; height: number },
  colors: { primary: string; secondary: string; text: string; accent?: string },
  fonts: { headingFont: string; bodyFont: string }
): ResumeElement[] {
  const elements: ResumeElement[] = []
  const headerHeight = 180
  const padding = 50
  const contentWidth = canvasSize.width - padding * 2

  // 顶部彩色背景
  elements.push({
    id: 'header-bg',
    type: 'rect',
    x: 0,
    y: 0,
    width: canvasSize.width,
    height: headerHeight,
    fill: colors.primary,
  })

  // 姓名
  elements.push({
    id: 'name',
    type: 'heading',
    x: padding,
    y: 40,
    width: contentWidth,
    height: 50,
    content: data.name,
    fontSize: 42,
    fontFamily: fonts.headingFont,
    fontWeight: 'bold',
    fontStyle: 'normal',
    fill: '#ffffff',
    textAlign: 'left',
  })

  // 职位
  if (data.title) {
    elements.push({
      id: 'title',
      type: 'text',
      x: padding,
      y: 95,
      width: contentWidth,
      height: 30,
      content: data.title,
      fontSize: 18,
      fontFamily: fonts.bodyFont,
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: colors.accent || '#dfe6e9',
      textAlign: 'left',
    })
  }

  // 联系信息
  const contactParts = [data.email, data.phone, data.location].filter(Boolean)
  if (contactParts.length > 0) {
    elements.push({
      id: 'contact',
      type: 'text',
      x: padding,
      y: 130,
      width: contentWidth,
      height: 25,
      content: contactParts.join(' | '),
      fontSize: 13,
      fontFamily: fonts.bodyFont,
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: colors.secondary,
      textAlign: 'left',
    })
  }

  let y = headerHeight + 30

  // 个人简介
  if (data.summary) {
    elements.push({
      id: 'summary-title',
      type: 'heading',
      x: padding,
      y,
      width: contentWidth,
      height: 25,
      content: '关于我',
      fontSize: 20,
      fontFamily: fonts.headingFont,
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: colors.primary,
      textAlign: 'left',
    })
    y += 35

    elements.push({
      id: 'summary-content',
      type: 'text',
      x: padding,
      y,
      width: contentWidth,
      height: 60,
      content: data.summary,
      fontSize: 14,
      fontFamily: fonts.bodyFont,
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: colors.text,
      textAlign: 'left',
      lineHeight: 1.7,
    })
    y += 90
  }

  // 工作经历
  if (data.experience.length > 0) {
    elements.push({
      id: 'work-title',
      type: 'heading',
      x: padding,
      y,
      width: contentWidth,
      height: 25,
      content: '工作经历',
      fontSize: 20,
      fontFamily: fonts.headingFont,
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: colors.primary,
      textAlign: 'left',
    })
    y += 35

    data.experience.forEach((exp, index) => {
      elements.push({
        id: `work-${index}-header`,
        type: 'text',
        x: padding,
        y,
        width: contentWidth,
        height: 20,
        content: `${exp.position} | ${exp.company} | ${exp.startDate}${exp.endDate ? ' - ' + exp.endDate : ' - 至今'}`,
        fontSize: 14,
        fontFamily: fonts.bodyFont,
        fontWeight: 'bold',
        fontStyle: 'normal',
        fill: colors.text,
        textAlign: 'left',
      })
      y += 25

      if (exp.description) {
        elements.push({
          id: `work-${index}-desc`,
          type: 'text',
          x: padding,
          y,
          width: contentWidth,
          height: 40,
          content: exp.description,
          fontSize: 13,
          fontFamily: fonts.bodyFont,
          fontWeight: 'normal',
          fontStyle: 'normal',
          fill: colors.text,
          textAlign: 'left',
          lineHeight: 1.6,
        })
        y += 55
      }
    })
  }

  // 教育背景
  if (data.education.length > 0) {
    y += 10
    elements.push({
      id: 'edu-title',
      type: 'heading',
      x: padding,
      y,
      width: contentWidth,
      height: 25,
      content: '教育背景',
      fontSize: 20,
      fontFamily: fonts.headingFont,
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: colors.primary,
      textAlign: 'left',
    })
    y += 35

    data.education.forEach((edu, index) => {
      elements.push({
        id: `edu-${index}`,
        type: 'text',
        x: padding,
        y,
        width: contentWidth,
        height: 25,
        content: `${edu.school}${edu.major ? ' | ' + edu.major : ''}${edu.degree ? ' | ' + edu.degree : ''}`,
        fontSize: 14,
        fontFamily: fonts.bodyFont,
        fontWeight: 'normal',
        fontStyle: 'normal',
        fill: colors.text,
        textAlign: 'left',
      })
      y += 30
    })
  }

  // 技能
  if (data.skills.length > 0) {
    y += 10
    elements.push({
      id: 'skills-title',
      type: 'heading',
      x: padding,
      y,
      width: contentWidth,
      height: 25,
      content: '专业技能',
      fontSize: 20,
      fontFamily: fonts.headingFont,
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: colors.primary,
      textAlign: 'left',
    })
    y += 35

    elements.push({
      id: 'skills-content',
      type: 'text',
      x: padding,
      y,
      width: contentWidth,
      height: 25,
      content: data.skills.map((s) => s.name).join(' / '),
      fontSize: 14,
      fontFamily: fonts.bodyFont,
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: colors.text,
      textAlign: 'left',
    })
  }

  return elements
}

/**
 * POST /api/template/generate
 * 根据模板和用户信息生成简历元素
 */
templateRouter.post('/generate', async (c) => {
  try {
    const body = await c.req.json<GenerateTemplateRequest>()

    // 验证必要字段
    if (!body.templateConfig || !body.resumeData) {
      return c.json({ error: '缺少必要参数' }, 400)
    }

    if (!body.resumeData.name) {
      return c.json({ error: '请输入姓名' }, 400)
    }

    // 生成元素
    const elements = generateResumeElements(body.templateConfig, body.resumeData)

    return c.json({
      success: true,
      elements,
      meta: {
        templateId: body.templateId,
        category: body.templateConfig.category,
        generatedAt: Date.now(),
      },
    })
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : '生成失败' },
      500
    )
  }
})
