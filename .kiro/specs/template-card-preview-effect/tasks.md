# Implementation Plan: Template Card Preview Effect

## Overview

对 `TemplateSelector.tsx` 中的 PreviewCard 进行改造：将固定高度替换为 `aspect-ratio: 200/260`，缩略图以 `cover` 铺满，悬停时底部滑出 OverlayPanel，保留所有现有交互行为。改动范围仅限单文件。

## Tasks

- [x] 1. 改造 PreviewCard 外层容器结构
  - 将卡片容器的 `height: 180` 替换为 `aspectRatio: '200 / 260'`
  - 添加 `position: 'relative'`，确保子层绝对定位基准正确
  - 保留 `overflow: 'hidden'`、`borderRadius`、`border`、`boxShadow`、`transition` 等现有样式
  - 添加 `data-testid="preview-card"` 属性
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. 改造缩略图层为绝对定位 cover 背景
  - 在卡片容器内添加 `position: 'absolute', inset: 0` 的内容包裹层
  - 将缩略图 div 改为绝对定位铺满（`position: 'absolute', inset: 0`），保留 `backgroundImage`、`backgroundSize: 'cover'`、`backgroundPosition: 'center'`
  - 移除原有固定 `height: 180`
  - _Requirements: 2.1, 2.2_

  - [ ]* 2.1 为缩略图层编写单元测试
    - 验证卡片容器具有 `aspectRatio: '200 / 260'` 样式
    - 验证缩略图层具有 `backgroundSize: 'cover'` 样式
    - 验证默认状态下无文字覆盖层可见
    - _Requirements: 1.1, 2.1, 2.2_

- [x] 3. 实现 OverlayPanel 悬停滑入/滑出动画
  - 在缩略图层下方添加 OverlayPanel div，`position: 'absolute', bottom: 0, left: 0, right: 0`
  - 根据 `isHovered` 状态切换 `transform: isHovered ? 'translateY(0)' : 'translateY(100%)'`
  - 设置 `transition: 'transform 0.25s ease'`（≤300ms）
  - 设置背景色 `rgba(0,0,0,0.65)`，内边距 `12px 14px`
  - 添加 `data-testid="overlay-panel"` 属性
  - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.6_

  - [ ]* 3.1 写属性测试 Property 2：悬停状态决定 OverlayPanel 可见性（往返）
    - **Property 2: 悬停状态决定 OverlayPanel 可见性（往返）**
    - **Validates: Requirements 3.1, 3.2**

- [x] 4. 实现 OverlayPanel 内容：模板名称与分类标签
  - 在 OverlayPanel 内添加模板名称元素（`fontWeight: 600`，白色文字）
  - 添加分类标签元素（`data-testid="category-tag"`），背景色使用 `CATEGORY_INFO[category].color + '33'`，文字色使用对应分类色
  - 将原有卡片底部信息区（`padding: '12px 14px'` 的 div）移除，信息改由 OverlayPanel 承载
  - _Requirements: 3.3, 3.4_

  - [ ]* 4.1 写属性测试 Property 3：OverlayPanel 包含模板名称与分类标签
    - **Property 3: OverlayPanel 包含模板名称与分类标签**
    - **Validates: Requirements 3.3**

- [x] 5. 将 SelectionBadge 迁移至新结构内
  - 将选中勾选图标（`isSelected` 条件渲染）移入绝对定位内容层，保持 `position: 'absolute', top: 8, right: 8`
  - 确保 SelectionBadge 层级高于 OverlayPanel（`zIndex` 或 DOM 顺序靠后）
  - _Requirements: 2.3_

  - [ ]* 5.1 写属性测试 Property 5：选中模板显示蓝色高亮边框
    - **Property 5: 选中模板显示蓝色高亮边框**
    - **Validates: Requirements 4.2**

- [x] 6. Checkpoint — 确保核心结构正确
  - 确保所有测试通过，如有疑问请向用户确认。

- [x] 7. 验证现有交互行为完整保留
  - 确认 `onClick` → `onTemplateSelect` 回调未被移除
  - 确认 `onMouseEnter` / `onMouseLeave` 正确更新 `hoveredTemplate` 状态
  - 确认分类过滤逻辑（`filterCategory` state）未受影响
  - 确认底部操作栏（应用模式、确认/取消按钮）代码无变动
  - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 7.1 写属性测试 Property 4：点击任意卡片触发正确回调
    - **Property 4: 点击任意卡片触发正确回调**
    - **Validates: Requirements 4.1**

  - [ ]* 7.2 写属性测试 Property 6：分类过滤返回正确子集
    - **Property 6: 分类过滤返回正确子集**
    - **Validates: Requirements 4.3**

- [x] 8. 编写单元测试文件
  - 创建 `packages/client/src/__tests__/template-card-preview-effect.test.tsx`
  - 测试：卡片 `aspectRatio` 为 `'200 / 260'`
  - 测试：缩略图层 `backgroundSize` 为 `'cover'`
  - 测试：默认状态 OverlayPanel `transform` 为 `'translateY(100%)'`
  - 测试：悬停状态 OverlayPanel `transform` 为 `'translateY(0)'`
  - 测试：OverlayPanel 背景色为 `'rgba(0,0,0,0.65)'`
  - 测试：CSS transition 包含 `'0.25s'`
  - 测试：选中状态下勾选图标存在于 DOM
  - _Requirements: 1.1, 2.1, 3.1, 3.2, 3.4, 3.5, 4.2_

- [x] 9. 编写属性测试文件
  - 创建 `packages/client/src/__tests__/template-card-preview-effect.property.test.tsx`
  - 实现 `arbitraryTemplate()` 生成器（覆盖所有 TemplateCategory，name/id 随机字符串）
  - 实现 Property 1：卡片固定宽高比 200:260（`numRuns: 100`）
  - 实现 Property 2：悬停状态决定 OverlayPanel 可见性往返（`numRuns: 100`）
  - 实现 Property 3：OverlayPanel 包含模板名称与分类标签（`numRuns: 100`）
  - 实现 Property 4：点击任意卡片触发正确回调（`numRuns: 100`）
  - 实现 Property 5：选中模板显示蓝色高亮边框（`numRuns: 100`）
  - 实现 Property 6：分类过滤返回正确子集（`numRuns: 100`）
  - 每个属性测试注释标注 `Feature: template-card-preview-effect, Property N`
  - _Requirements: 1.1, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3_

- [x] 10. Final Checkpoint — 确保所有测试通过
  - 确保所有测试通过，如有疑问请向用户确认。

## Notes

- 标注 `*` 的子任务为可选项，可跳过以加快 MVP 进度
- 每个任务均引用具体需求条款以保证可追溯性
- 属性测试使用 fast-check（已在 devDependencies 中），`numRuns: 100`
- 改动范围仅限 `packages/client/src/components/TemplateSelector.tsx` 及新增测试文件
