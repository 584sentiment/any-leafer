/**
 * 创意风格简历模板
 */

import type { ResumeTemplate, ResumeElement } from '@resume-editor/shared'

/**
 * 生成 SVG 缩略图的辅助函数
 * 包含 A4 纸张效果：浅灰背景 + 白色纸张 + 阴影
 */
const createSvgThumbnail = (content: string): string => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="260" viewBox="0 0 200 260">
      <defs>
        <filter id="paperShadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000" flood-opacity="0.12"/>
        </filter>
      </defs>
      <!-- 桌面背景 -->
      <rect fill="#e8e8e8" width="200" height="260"/>
      <!-- A4 纸张 -->
      <g filter="url(#paperShadow)">
        <rect fill="#fafafa" x="10" y="8" width="180" height="244" rx="2"/>
      </g>
      <!-- 内容区域 -->
      <g transform="translate(10, 8)">
        ${content}
      </g>
    </svg>
  `
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/**
 * 创意简历模板 - 彩色侧边栏
 */
export const creativeColorfulTemplate: ResumeTemplate = {
  id: 'creative-1',
  name: '彩色创意',
  description: '大胆配色，适合创意行业求职',
  category: 'creative',
  // A4 标准尺寸 @ 96dpi
  canvasSize: { width: 794, height: 1123 },
  thumbnail: createSvgThumbnail(`
    <!-- 顶部紫色区域 -->
    <rect fill="#6c5ce7" x="0" y="0" width="180" height="38" rx="2 2 0 0"/>

    <!-- 姓名和职位 -->
    <rect fill="#ffffff" x="10" y="8" width="70" height="10" rx="2" opacity="0.9"/>
    <rect fill="#dfe6e9" x="8" y="22" width="80" height="5" rx="1" opacity="0.7"/>

    <!-- 联系信息 -->
    <rect fill="#a29bfe" x="5" y="45" width="160" height="4" rx="1" opacity="0.6"/>

    <!-- 关于我区块 -->
    <rect fill="#6c5ce7" x="5" y="60" width="35" height="5" rx="1"/>
    <rect fill="#555" x="5" y="70" width="160" height="3" rx="1"/>
    <rect fill="#888" x="5" y="77" width="145" height="2" rx="1"/>
    <rect fill="#888" x="5" y="84" width="150" height="2" rx="1"/>

    <!-- 工作经历区块 -->
    <rect fill="#6c5ce7" x="5" y="100" width="45" height="5" rx="1"/>
    <rect fill="#555" x="5" y="110" width="160" height="3" rx="1"/>
    <rect fill="#888" x="5" y="117" width="140" height="2" rx="1"/>
    <rect fill="#888" x="5" y="124" width="155" height="2" rx="1"/>
    <rect fill="#888" x="5" y="131" width="135" height="2" rx="1"/>

    <!-- 技能区块 -->
    <rect fill="#6c5ce7" x="5" y="150" width="45" height="5" rx="1"/>
    <rect fill="#555" x="5" y="160" width="160" height="3" rx="1"/>
    <rect fill="#888" x="5" y="167" width="135" height="2" rx="1"/>
    <rect fill="#888" x="5" y="174" width="155" height="2" rx="1"/>

    <!-- 技能标签 -->
    <rect fill="#6c5ce7" x="5" y="188" width="38" height="9" rx="2" opacity="0.2"/>
    <rect fill="#6c5ce7" x="48" y="188" width="42" height="9" rx="2" opacity="0.2"/>
    <rect fill="#6c5ce7" x="95" y="188" width="35" height="9" rx="2" opacity="0.2"/>

    <!-- 分类标签 -->
    <rect fill="#e74c3c" x="5" y="195" width="30" height="12" rx="2" opacity="0.15"/>
    <text x="20" y="204" font-size="7" fill="#e74c3c" text-anchor="middle" font-family="Arial">创意</text>
  `),
  createdAt: Date.now(),
  updatedAt: Date.now(),
  elements: [
    // 顶部彩色背景
    {
      id: 'header-bg',
      type: 'rect',
      x: 0,
      y: 0,
      width: 794,
      height: 180,
      fill: '#6c5ce7',
    },
    // 姓名标题
    {
      id: 'name-title',
      type: 'heading',
      x: 50,
      y: 50,
      width: 700,
      height: 60,
      content: '孙七',
      fontSize: 42,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: '#ffffff',
      textAlign: 'left',
    },
    // 职位
    {
      id: 'position',
      type: 'text',
      x: 50,
      y: 110,
      width: 700,
      height: 30,
      content: '创意总监 | 品牌设计师',
      fontSize: 18,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: '#dfe6e9',
      textAlign: 'left',
    },
    // 联系信息
    {
      id: 'contact-info',
      type: 'text',
      x: 50,
      y: 145,
      width: 700,
      height: 25,
      content: 'sunqi@design.com | +86 136-0000-0000 | 广州市',
      fontSize: 13,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: '#a29bfe',
      textAlign: 'left',
    },
    // 个人简介标题
    {
      id: 'summary-title',
      type: 'heading',
      x: 50,
      y: 210,
      width: 700,
      height: 30,
      content: '关于我',
      fontSize: 20,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: '#6c5ce7',
      textAlign: 'left',
    },
    // 个人简介内容
    {
      id: 'summary-content',
      type: 'text',
      x: 50,
      y: 250,
      width: 700,
      height: 80,
      content: '热爱创意设计，拥有8年品牌设计经验。擅长将品牌理念转化为视觉语言，为多家知名企业打造过成功的品牌形象。追求设计的极致与创新的突破。',
      fontSize: 14,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: '#2d3436',
      textAlign: 'left',
      lineHeight: 1.7,
    },
    // 工作经历标题
    {
      id: 'work-title',
      type: 'heading',
      x: 50,
      y: 360,
      width: 700,
      height: 30,
      content: '工作经历',
      fontSize: 20,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: '#6c5ce7',
      textAlign: 'left',
    },
    // 工作经历内容
    {
      id: 'work-content',
      type: 'text',
      x: 50,
      y: 400,
      width: 700,
      height: 180,
      content: `创意总监 | 蓝色光标 | 2020.03 - 至今
领导创意团队完成多个知名品牌的全案设计，年度服务客户超过20家.

高级设计师 | 奥美广告 | 2016.06 - 2020.02
参与多个4A项目，作品获得国内外设计奖项.`,
      fontSize: 14,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: '#2d3436',
      textAlign: 'left',
      lineHeight: 1.7,
    },
    // 技能标题
    {
      id: 'skills-title',
      type: 'heading',
      x: 50,
      y: 610,
      width: 700,
      height: 30,
      content: '专业技能',
      fontSize: 20,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: '#6c5ce7',
      textAlign: 'left',
    },
    // 技能内容
    {
      id: 'skills-content',
      type: 'text',
      x: 50,
      y: 650,
      width: 700,
      height: 100,
      content: '品牌策略 / 视觉设计 / UI设计 / 动态设计 / 团队管理 / 客户沟通\n熟练使用: Photoshop, Illustrator, After Effects, Figma, Sketch',
      fontSize: 14,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: '#2d3436',
      textAlign: 'left',
      lineHeight: 1.7,
    },
  ] as ResumeElement[],
  smartConfig: {
    stylePrompt: '大胆的紫色配色，顶部大面积彩色背景，适合创意行业，展现个性和创新精神',
    layoutHints: [
      { section: 'header', position: 'top', style: '大背景彩色头部' },
      { section: 'experience', position: 'left', style: '详细列表' },
      { section: 'skills', position: 'left', style: '分类展示' },
    ],
    colorScheme: {
      primary: '#6c5ce7',
      secondary: '#a29bfe',
      background: '#ffffff',
      text: '#2d3436',
      accent: '#dfe6e9',
    },
    typography: {
      headingFont: 'Arial',
      bodyFont: 'Arial',
      headingSizes: { min: 20, max: 42 },
      bodySizes: { min: 13, max: 18 },
    },
  },
}

/**
 * 创意简历模板2 - 渐变风格
 */
export const creativeGradientTemplate: ResumeTemplate = {
  id: 'creative-2',
  name: '渐变风格',
  description: '现代渐变配色，科技感十足',
  category: 'creative',
  // A4 标准尺寸 @ 96dpi
  canvasSize: { width: 794, height: 1123 },
  thumbnail: createSvgThumbnail(`
    <!-- 左侧渐变侧边栏 -->
    <defs>
      <linearGradient id="blueGreen" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#0984e3"/>
        <stop offset="100%" style="stop-color:#00b894"/>
      </linearGradient>
    </defs>
    <rect fill="url(#blueGreen)" x="0" y="0" width="55" height="228" rx="2 0 0 2"/>

    <!-- 头像占位 -->
    <circle fill="#74b9ff" cx="27" cy="25" r="16"/>
    <circle fill="#ffffff" cx="27" cy="22" r="5" opacity="0.8"/>
    <ellipse fill="#ffffff" cx="27" cy="34" rx="8" ry="5" opacity="0.6"/>

    <!-- 姓名和职位 -->
    <rect fill="#ffffff" x="8" y="48" width="35" height="8" rx="2" opacity="0.9"/>
    <rect fill="#dfe6e9" x="5" y="60" width="42" height="4" rx="1" opacity="0.7"/>

    <!-- 侧边栏联系信息 -->
    <rect fill="#ffffff" x="5" y="75" width="40" height="3" rx="1" opacity="0.5"/>
    <rect fill="#ffffff" x="5" y="82" width="35" height="2" rx="1" opacity="0.3"/>
    <rect fill="#ffffff" x="5" y="88" width="38" height="2" rx="1" opacity="0.3"/>
    <rect fill="#ffffff" x="5" y="94" width="32" height="2" rx="1" opacity="0.3"/>

    <!-- 侧边栏技能 -->
    <rect fill="#ffffff" x="5" y="110" width="35" height="3" rx="1" opacity="0.5"/>
    <rect fill="#ffffff" x="5" y="118" width="40" height="2" rx="1" opacity="0.3"/>
    <rect fill="#ffffff" x="5" y="124" width="38" height="2" rx="1" opacity="0.3"/>
    <rect fill="#ffffff" x="5" y="130" width="32" height="2" rx="1" opacity="0.3"/>

    <!-- 右侧主内容区 -->
    <rect fill="#0984e3" x="62" y="8" width="40" height="5" rx="1"/>
    <rect fill="#555" x="62" y="18" width="100" height="3" rx="1"/>
    <rect fill="#888" x="62" y="25" width="90" height="2" rx="1"/>
    <rect fill="#888" x="62" y="31" width="95" height="2" rx="1"/>

    <rect fill="#0984e3" x="62" y="45" width="40" height="5" rx="1"/>
    <rect fill="#555" x="62" y="55" width="100" height="3" rx="1"/>
    <rect fill="#888" x="62" y="62" width="85" height="2" rx="1"/>
    <rect fill="#888" x="62" y="68" width="95" height="2" rx="1"/>
    <rect fill="#888" x="62" y="74" width="80" height="2" rx="1"/>

    <rect fill="#00b894" x="62" y="92" width="40" height="5" rx="1"/>
    <rect fill="#555" x="62" y="102" width="100" height="3" rx="1"/>
    <rect fill="#888" x="62" y="108" width="90" height="2" rx="1"/>
    <rect fill="#888" x="62" y="114" width="95" height="2" rx="1"/>

    <!-- 分类标签 -->
    <rect fill="#e74c3c" x="62" y="195" width="30" height="12" rx="2" opacity="0.15"/>
    <text x="77" y="204" font-size="7" fill="#e74c3c" text-anchor="middle" font-family="Arial">创意</text>
  `),
  createdAt: Date.now(),
  updatedAt: Date.now(),
  elements: [
    // 左侧渐变背景（撑满整个纸张高度）
    {
      id: 'sidebar-bg-1',
      type: 'rect',
      x: 0,
      y: 0,
      width: 280,
      height: 562,
      fill: '#0984e3',
    },
    {
      id: 'sidebar-bg-2',
      type: 'rect',
      x: 0,
      y: 562,
      width: 280,
      height: 561,
      fill: '#00b894',
    },
    // 头像占位
    {
      id: 'avatar-placeholder',
      type: 'ellipse',
      x: 90,
      y: 50,
      width: 100,
      height: 100,
      fill: '#74b9ff',
    },
    // 姓名标题
    {
      id: 'name-title',
      type: 'heading',
      x: 30,
      y: 170,
      width: 220,
      height: 40,
      content: '周八',
      fontSize: 28,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: '#ffffff',
      textAlign: 'left',
    },
    // 职位
    {
      id: 'position',
      type: 'text',
      x: 30,
      y: 215,
      width: 220,
      height: 25,
      content: '数据科学家',
      fontSize: 14,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: '#dfe6e9',
      textAlign: 'left',
    },
    // 左侧联系信息标题
    {
      id: 'contact-title',
      type: 'heading',
      x: 30,
      y: 280,
      width: 220,
      height: 25,
      content: '联系方式',
      fontSize: 14,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: '#ffffff',
      textAlign: 'left',
    },
    // 左侧联系信息
    {
      id: 'contact-info',
      type: 'text',
      x: 30,
      y: 310,
      width: 220,
      height: 100,
      content: `zhouba@email.com
+86 135-0000-0000
成都市高新区
github.com/zhouba`,
      fontSize: 12,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: '#dfe6e9',
      textAlign: 'left',
      lineHeight: 1.8,
    },
    // 左侧技能标题
    {
      id: 'skills-title',
      type: 'heading',
      x: 30,
      y: 430,
      width: 220,
      height: 25,
      content: '技术栈',
      fontSize: 14,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: '#ffffff',
      textAlign: 'left',
    },
    // 左侧技能
    {
      id: 'skills-content',
      type: 'text',
      x: 30,
      y: 460,
      width: 220,
      height: 100,
      content: `Python, R, SQL
TensorFlow, PyTorch
Spark, Hadoop
Tableau, Power BI`,
      fontSize: 12,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: '#dfe6e9',
      textAlign: 'left',
      lineHeight: 1.8,
    },
    // 右侧 - 个人简介标题
    {
      id: 'summary-title',
      type: 'heading',
      x: 310,
      y: 50,
      width: 440,
      height: 30,
      content: '个人简介',
      fontSize: 18,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: '#0984e3',
      textAlign: 'left',
    },
    // 右侧 - 个人简介内容
    {
      id: 'summary-content',
      type: 'text',
      x: 310,
      y: 85,
      width: 440,
      height: 80,
      content: '数据科学家，专注于机器学习和大数据分析。在多个行业领域有丰富的数据挖掘和建模经验，善于从数据中发现商业价值.',
      fontSize: 13,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: '#2d3436',
      textAlign: 'left',
      lineHeight: 1.7,
    },
    // 右侧 - 工作经历标题
    {
      id: 'work-title',
      type: 'heading',
      x: 310,
      y: 190,
      width: 440,
      height: 30,
      content: '工作经历',
      fontSize: 18,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: '#0984e3',
      textAlign: 'left',
    },
    // 右侧 - 工作经历内容
    {
      id: 'work-content',
      type: 'text',
      x: 310,
      y: 225,
      width: 440,
      height: 180,
      content: `高级数据科学家 | 字节跳动 | 2021.06 - 至今
负责推荐算法优化和用户行为分析，提升核心业务指标.

数据分析师 | 腾讯 | 2018.07 - 2021.05
参与社交产品数据分析，建立用户增长模型.`,
      fontSize: 13,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: '#2d3436',
      textAlign: 'left',
      lineHeight: 1.7,
    },
    // 右侧 - 教育背景标题
    {
      id: 'edu-title',
      type: 'heading',
      x: 310,
      y: 440,
      width: 440,
      height: 30,
      content: '教育背景',
      fontSize: 18,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: '#00b894',
      textAlign: 'left',
    },
    // 右侧 - 教育背景内容
    {
      id: 'edu-content',
      type: 'text',
      x: 310,
      y: 475,
      width: 440,
      height: 80,
      content: `统计学 硕士 | 中国科学技术大学 | 2015.09 - 2018.06
数学 学士 | 四川大学 | 2011.09 - 2015.06`,
      fontSize: 13,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: '#2d3436',
      textAlign: 'left',
      lineHeight: 1.7,
    },
  ] as ResumeElement[],
  smartConfig: {
    stylePrompt: '现代渐变风格，左侧蓝绿渐变背景放置个人信息和技能，右侧放置详细经历，科技感强',
    layoutHints: [
      { section: 'header', position: 'left', style: '侧边栏头像+姓名' },
      { section: 'experience', position: 'right', style: '详细列表' },
      { section: 'education', position: 'right', style: '简洁列表' },
      { section: 'skills', position: 'left', style: '侧边栏列表' },
    ],
    colorScheme: {
      primary: '#0984e3',
      secondary: '#00b894',
      background: '#ffffff',
      text: '#2d3436',
      accent: '#74b9ff',
    },
    typography: {
      headingFont: 'Arial',
      bodyFont: 'Arial',
      headingSizes: { min: 14, max: 28 },
      bodySizes: { min: 12, max: 18 },
    },
  },
}
