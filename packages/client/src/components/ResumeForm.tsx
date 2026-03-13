/**
 * ResumeForm - 简历信息表单组件
 * 用于智能生成模式收集用户信息
 */

import React, { useState } from 'react'
import type {
  ResumeData,
  ExperienceItem,
  EducationItem,
  SkillItem,
  SkillLevel,
} from '@resume-editor/shared'

/**
 * 技能等级选项
 */
const SKILL_LEVELS: { value: SkillLevel; label: string }[] = [
  { value: 'beginner', label: '入门' },
  { value: 'intermediate', label: '熟练' },
  { value: 'advanced', label: '精通' },
  { value: 'expert', label: '专家' },
]

/**
 * 默认表单数据
 */
const defaultResumeData: ResumeData = {
  name: '',
  title: '',
  phone: '',
  email: '',
  location: '',
  website: '',
  summary: '',
  experience: [],
  education: [],
  skills: [],
  customSections: [],
}

export interface ResumeFormProps {
  /** 初始数据 */
  initialData?: Partial<ResumeData>
  /** 提交回调 */
  onSubmit: (data: ResumeData) => void
  /** 返回回调 */
  onBack?: () => void
  /** 取消回调 */
  onCancel?: () => void
  /** 是否正在加载 */
  loading?: boolean
}

export const ResumeForm: React.FC<ResumeFormProps> = ({
  initialData,
  onSubmit,
  onBack,
  onCancel,
  loading = false,
}) => {
  const [data, setData] = useState<ResumeData>({
    ...defaultResumeData,
    ...initialData,
  })
  const [activeSection, setActiveSection] = useState<'basic' | 'experience' | 'education' | 'skills'>('basic')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 更新基本信息
  const updateBasicInfo = (field: keyof ResumeData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }))
    // 清除错误
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  // 添加工作经历
  const addExperience = () => {
    const newItem: ExperienceItem = {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
    }
    setData((prev) => ({
      ...prev,
      experience: [...prev.experience, newItem],
    }))
  }

  // 更新工作经历
  const updateExperience = (index: number, field: keyof ExperienceItem, value: string) => {
    setData((prev) => {
      const experience = [...prev.experience]
      experience[index] = { ...experience[index], [field]: value }
      return { ...prev, experience }
    })
  }

  // 删除工作经历
  const removeExperience = (index: number) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }))
  }

  // 添加教育背景
  const addEducation = () => {
    const newItem: EducationItem = {
      school: '',
      major: '',
      degree: '',
      startDate: '',
      endDate: '',
      description: '',
    }
    setData((prev) => ({
      ...prev,
      education: [...prev.education, newItem],
    }))
  }

  // 更新教育背景
  const updateEducation = (index: number, field: keyof EducationItem, value: string) => {
    setData((prev) => {
      const education = [...prev.education]
      education[index] = { ...education[index], [field]: value }
      return { ...prev, education }
    })
  }

  // 删除教育背景
  const removeEducation = (index: number) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }))
  }

  // 添加技能
  const addSkill = () => {
    const newItem: SkillItem = {
      name: '',
      level: 'intermediate',
    }
    setData((prev) => ({
      ...prev,
      skills: [...prev.skills, newItem],
    }))
  }

  // 更新技能
  const updateSkill = (index: number, field: keyof SkillItem, value: string) => {
    setData((prev) => {
      const skills = [...prev.skills]
      skills[index] = { ...skills[index], [field]: value }
      return { ...prev, skills }
    })
  }

  // 删除技能
  const removeSkill = (index: number) => {
    setData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }))
  }

  // 验证表单
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!data.name.trim()) {
      newErrors.name = '请输入姓名'
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = '请输入有效的邮箱地址'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 提交表单
  const handleSubmit = () => {
    if (validate()) {
      onSubmit(data)
    }
  }

  // 输入框样式
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #dee2e6',
    borderRadius: 6,
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  // 错误输入框样式
  const errorInputStyle: React.CSSProperties = {
    ...inputStyle,
    borderColor: '#e74c3c',
  }

  // 标签样式
  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: 6,
    fontSize: 13,
    fontWeight: 500,
    color: '#495057',
  }

  // 表单组样式
  const formGroupStyle: React.CSSProperties = {
    marginBottom: 16,
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 标题 */}
      <div
        style={{
          padding: '24px 32px 16px',
          borderBottom: '1px solid #e9ecef',
          backgroundColor: '#fff',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 600,
            color: '#212529',
          }}
        >
          填写简历信息
        </h1>
        <p
          style={{
            margin: '8px 0 0',
            fontSize: 14,
            color: '#6c757d',
          }}
        >
          AI 将根据您的信息生成个性化的简历
        </p>
      </div>

      {/* 分段导航 */}
      <div
        style={{
          padding: '16px 32px',
          backgroundColor: '#fff',
          borderBottom: '1px solid #e9ecef',
          display: 'flex',
          gap: 8,
        }}
      >
        {[
          { key: 'basic', label: '基本信息', icon: '👤' },
          { key: 'experience', label: '工作经历', icon: '💼' },
          { key: 'education', label: '教育背景', icon: '🎓' },
          { key: 'skills', label: '技能特长', icon: '⚡' },
        ].map((section) => (
          <button
            key={section.key}
            onClick={() => setActiveSection(section.key as typeof activeSection)}
            style={{
              padding: '10px 16px',
              border: 'none',
              borderRadius: 8,
              backgroundColor: activeSection === section.key ? '#3498db' : '#e9ecef',
              color: activeSection === section.key ? '#fff' : '#495057',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
          >
            <span style={{ marginRight: 6 }}>{section.icon}</span>
            {section.label}
          </button>
        ))}
      </div>

      {/* 表单内容 */}
      <div
        style={{
          flex: 1,
          padding: '24px 32px',
          overflow: 'auto',
        }}
      >
        {/* 基本信息 */}
        {activeSection === 'basic' && (
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 24,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 16,
              }}
            >
              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  姓名 <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => updateBasicInfo('name', e.target.value)}
                  placeholder="请输入您的姓名"
                  style={errors.name ? errorInputStyle : inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#3498db')}
                  onBlur={(e) => (e.target.style.borderColor = errors.name ? '#e74c3c' : '#dee2e6')}
                />
                {errors.name && (
                  <div style={{ color: '#e74c3c', fontSize: 12, marginTop: 4 }}>
                    {errors.name}
                  </div>
                )}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>职位/头衔</label>
                <input
                  type="text"
                  value={data.title || ''}
                  onChange={(e) => updateBasicInfo('title', e.target.value)}
                  placeholder="例如：高级前端工程师"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#3498db')}
                  onBlur={(e) => (e.target.style.borderColor = '#dee2e6')}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>电话</label>
                <input
                  type="tel"
                  value={data.phone || ''}
                  onChange={(e) => updateBasicInfo('phone', e.target.value)}
                  placeholder="例如：138-0000-0000"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#3498db')}
                  onBlur={(e) => (e.target.style.borderColor = '#dee2e6')}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>邮箱</label>
                <input
                  type="email"
                  value={data.email || ''}
                  onChange={(e) => updateBasicInfo('email', e.target.value)}
                  placeholder="example@email.com"
                  style={errors.email ? errorInputStyle : inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#3498db')}
                  onBlur={(e) => (e.target.style.borderColor = errors.email ? '#e74c3c' : '#dee2e6')}
                />
                {errors.email && (
                  <div style={{ color: '#e74c3c', fontSize: 12, marginTop: 4 }}>
                    {errors.email}
                  </div>
                )}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>所在城市</label>
                <input
                  type="text"
                  value={data.location || ''}
                  onChange={(e) => updateBasicInfo('location', e.target.value)}
                  placeholder="例如：北京市"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#3498db')}
                  onBlur={(e) => (e.target.style.borderColor = '#dee2e6')}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>个人网站</label>
                <input
                  type="url"
                  value={data.website || ''}
                  onChange={(e) => updateBasicInfo('website', e.target.value)}
                  placeholder="https://your-website.com"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#3498db')}
                  onBlur={(e) => (e.target.style.borderColor = '#dee2e6')}
                />
              </div>
            </div>

            <div style={{ ...formGroupStyle, marginTop: 8 }}>
              <label style={labelStyle}>个人简介</label>
              <textarea
                value={data.summary || ''}
                onChange={(e) => updateBasicInfo('summary', e.target.value)}
                placeholder="简要介绍您的背景、经验和职业目标..."
                rows={4}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                  minHeight: 100,
                }}
                onFocus={(e) => (e.target.style.borderColor = '#3498db')}
                onBlur={(e) => (e.target.style.borderColor = '#dee2e6')}
              />
            </div>
          </div>
        )}

        {/* 工作经历 */}
        {activeSection === 'experience' && (
          <div>
            {data.experience.length === 0 ? (
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 12,
                  padding: 48,
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>💼</div>
                <div style={{ fontSize: 16, color: '#495057', marginBottom: 8 }}>
                  暂无工作经历
                </div>
                <div style={{ fontSize: 14, color: '#6c757d', marginBottom: 24 }}>
                  添加您的工作经历，让简历更加完整
                </div>
                <button
                  onClick={addExperience}
                  style={{
                    padding: '10px 24px',
                    border: 'none',
                    borderRadius: 8,
                    backgroundColor: '#3498db',
                    color: '#fff',
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  + 添加工作经历
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {data.experience.map((exp, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: 12,
                      padding: 20,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 16,
                      }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#212529' }}>
                        工作经历 {index + 1}
                      </span>
                      <button
                        onClick={() => removeExperience(index)}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #e74c3c',
                          borderRadius: 4,
                          backgroundColor: '#fff',
                          color: '#e74c3c',
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        删除
                      </button>
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 12,
                      }}
                    >
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>公司名称</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateExperience(index, 'company', e.target.value)}
                          placeholder="公司名称"
                          style={inputStyle}
                          onFocus={(e) => (e.target.style.borderColor = '#3498db')}
                          onBlur={(e) => (e.target.style.borderColor = '#dee2e6')}
                        />
                      </div>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>职位</label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => updateExperience(index, 'position', e.target.value)}
                          placeholder="职位名称"
                          style={inputStyle}
                          onFocus={(e) => (e.target.style.borderColor = '#3498db')}
                          onBlur={(e) => (e.target.style.borderColor = '#dee2e6')}
                        />
                      </div>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>开始时间</label>
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                          placeholder="例如：2020.03"
                          style={inputStyle}
                          onFocus={(e) => (e.target.style.borderColor = '#3498db')}
                          onBlur={(e) => (e.target.style.borderColor = '#dee2e6')}
                        />
                      </div>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>结束时间</label>
                        <input
                          type="text"
                          value={exp.endDate || ''}
                          onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                          placeholder="至今 或 具体时间"
                          style={inputStyle}
                          onFocus={(e) => (e.target.style.borderColor = '#3498db')}
                          onBlur={(e) => (e.target.style.borderColor = '#dee2e6')}
                        />
                      </div>
                    </div>
                    <div style={formGroupStyle}>
                      <label style={labelStyle}>工作描述</label>
                      <textarea
                        value={exp.description || ''}
                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                        placeholder="描述您的主要职责和成就..."
                        rows={3}
                        style={{
                          ...inputStyle,
                          resize: 'vertical',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#3498db')}
                        onBlur={(e) => (e.target.style.borderColor = '#dee2e6')}
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={addExperience}
                  style={{
                    padding: '12px 24px',
                    border: '2px dashed #dee2e6',
                    borderRadius: 12,
                    backgroundColor: '#fff',
                    color: '#6c757d',
                    fontSize: 14,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#3498db'
                    e.currentTarget.style.color = '#3498db'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#dee2e6'
                    e.currentTarget.style.color = '#6c757d'
                  }}
                >
                  + 添加更多工作经历
                </button>
              </div>
            )}
          </div>
        )}

        {/* 教育背景 */}
        {activeSection === 'education' && (
          <div>
            {data.education.length === 0 ? (
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 12,
                  padding: 48,
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
                <div style={{ fontSize: 16, color: '#495057', marginBottom: 8 }}>
                  暂无教育背景
                </div>
                <div style={{ fontSize: 14, color: '#6c757d', marginBottom: 24 }}>
                  添加您的教育经历
                </div>
                <button
                  onClick={addEducation}
                  style={{
                    padding: '10px 24px',
                    border: 'none',
                    borderRadius: 8,
                    backgroundColor: '#3498db',
                    color: '#fff',
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  + 添加教育背景
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {data.education.map((edu, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: 12,
                      padding: 20,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 16,
                      }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#212529' }}>
                        教育背景 {index + 1}
                      </span>
                      <button
                        onClick={() => removeEducation(index)}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #e74c3c',
                          borderRadius: 4,
                          backgroundColor: '#fff',
                          color: '#e74c3c',
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        删除
                      </button>
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 12,
                      }}
                    >
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>学校名称</label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => updateEducation(index, 'school', e.target.value)}
                          placeholder="学校名称"
                          style={inputStyle}
                          onFocus={(e) => (e.target.style.borderColor = '#3498db')}
                          onBlur={(e) => (e.target.style.borderColor = '#dee2e6')}
                        />
                      </div>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>专业</label>
                        <input
                          type="text"
                          value={edu.major || ''}
                          onChange={(e) => updateEducation(index, 'major', e.target.value)}
                          placeholder="专业名称"
                          style={inputStyle}
                          onFocus={(e) => (e.target.style.borderColor = '#3498db')}
                          onBlur={(e) => (e.target.style.borderColor = '#dee2e6')}
                        />
                      </div>
                      <div style={formGroupStyle}>
                        <label style={labelStyle}>学位</label>
                        <input
                          type="text"
                          value={edu.degree || ''}
                          onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          placeholder="例如：学士、硕士"
                          style={inputStyle}
                          onFocus={(e) => (e.target.style.borderColor = '#3498db')}
                          onBlur={(e) => (e.target.style.borderColor = '#dee2e6')}
                        />
                      </div>
                      <div style={{ ...formGroupStyle, display: 'flex', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <label style={labelStyle}>开始时间</label>
                          <input
                            type="text"
                            value={edu.startDate || ''}
                            onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                            placeholder="2016.09"
                            style={inputStyle}
                            onFocus={(e) => (e.target.style.borderColor = '#3498db')}
                            onBlur={(e) => (e.target.style.borderColor = '#dee2e6')}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={labelStyle}>结束时间</label>
                          <input
                            type="text"
                            value={edu.endDate || ''}
                            onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                            placeholder="2020.06"
                            style={inputStyle}
                            onFocus={(e) => (e.target.style.borderColor = '#3498db')}
                            onBlur={(e) => (e.target.style.borderColor = '#dee2e6')}
                          />
                        </div>
                      </div>
                    </div>
                    <div style={formGroupStyle}>
                      <label style={labelStyle}>描述（可选）</label>
                      <textarea
                        value={edu.description || ''}
                        onChange={(e) => updateEducation(index, 'description', e.target.value)}
                        placeholder="GPA、主修课程、荣誉奖项等..."
                        rows={2}
                        style={{
                          ...inputStyle,
                          resize: 'vertical',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#3498db')}
                        onBlur={(e) => (e.target.style.borderColor = '#dee2e6')}
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={addEducation}
                  style={{
                    padding: '12px 24px',
                    border: '2px dashed #dee2e6',
                    borderRadius: 12,
                    backgroundColor: '#fff',
                    color: '#6c757d',
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  + 添加更多教育背景
                </button>
              </div>
            )}
          </div>
        )}

        {/* 技能特长 */}
        {activeSection === 'skills' && (
          <div>
            {data.skills.length === 0 ? (
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 12,
                  padding: 48,
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
                <div style={{ fontSize: 16, color: '#495057', marginBottom: 8 }}>
                  暂无技能
                </div>
                <div style={{ fontSize: 14, color: '#6c757d', marginBottom: 24 }}>
                  添加您的专业技能和特长
                </div>
                <button
                  onClick={addSkill}
                  style={{
                    padding: '10px 24px',
                    border: 'none',
                    borderRadius: 8,
                    backgroundColor: '#3498db',
                    color: '#fff',
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  + 添加技能
                </button>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 12,
                    padding: 20,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: 12,
                    }}
                  >
                    {data.skills.map((skill, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '8px 12px',
                          backgroundColor: '#f8f9fa',
                          borderRadius: 8,
                        }}
                      >
                        <input
                          type="text"
                          value={skill.name}
                          onChange={(e) => updateSkill(index, 'name', e.target.value)}
                          placeholder="技能名称"
                          style={{
                            flex: 1,
                            padding: '8px 10px',
                            border: '1px solid #dee2e6',
                            borderRadius: 4,
                            fontSize: 13,
                          }}
                        />
                        <select
                          value={skill.level || 'intermediate'}
                          onChange={(e) => updateSkill(index, 'level', e.target.value)}
                          style={{
                            padding: '8px 10px',
                            border: '1px solid #dee2e6',
                            borderRadius: 4,
                            fontSize: 13,
                            backgroundColor: '#fff',
                          }}
                        >
                          {SKILL_LEVELS.map((level) => (
                            <option key={level.value} value={level.value}>
                              {level.label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => removeSkill(index)}
                          style={{
                            padding: '6px 8px',
                            border: 'none',
                            borderRadius: 4,
                            backgroundColor: 'transparent',
                            color: '#e74c3c',
                            cursor: 'pointer',
                            fontSize: 16,
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={addSkill}
                  style={{
                    marginTop: 16,
                    padding: '12px 24px',
                    border: '2px dashed #dee2e6',
                    borderRadius: 12,
                    backgroundColor: '#fff',
                    color: '#6c757d',
                    fontSize: 14,
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  + 添加更多技能
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 底部操作栏 */}
      <div
        style={{
          padding: '20px 32px',
          borderTop: '1px solid #e9ecef',
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          {onBack && (
            <button
              onClick={onBack}
              disabled={loading}
              style={{
                padding: '10px 24px',
                border: '1px solid #dee2e6',
                borderRadius: 8,
                backgroundColor: '#fff',
                color: '#495057',
                fontSize: 14,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              ← 返回选择模板
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={loading}
              style={{
                padding: '10px 24px',
                border: '1px solid #dee2e6',
                borderRadius: 8,
                backgroundColor: '#fff',
                color: '#495057',
                fontSize: 14,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              取消
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading || !data.name.trim()}
            style={{
              padding: '10px 32px',
              border: 'none',
              borderRadius: 8,
              backgroundColor: data.name.trim() ? '#3498db' : '#bdc3c7',
              color: '#fff',
              fontSize: 14,
              fontWeight: 500,
              cursor: data.name.trim() && !loading ? 'pointer' : 'not-allowed',
              opacity: loading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {loading && (
              <span
                style={{
                  width: 14,
                  height: 14,
                  border: '2px solid #fff',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
            )}
            {loading ? '生成中...' : '生成简历'}
          </button>
        </div>
      </div>

      {/* 加载动画样式 */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}
