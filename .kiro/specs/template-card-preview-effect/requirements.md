# Requirements Document

## Introduction

本功能改进 TemplateSelector 组件中的模板预览卡片效果。当前卡片使用固定高度（180px）展示缩略图，信息区域始终可见。改进后，卡片宽高比与缩略图保持一致，缩略图默认占满整个卡片区域，鼠标悬停时从底部向上滑出包含模板名称等信息的描述层，提升视觉一致性与交互体验。

## Glossary

- **TemplateSelector**: 模板选择组件，位于 `packages/client/src/components/TemplateSelector.tsx`
- **PreviewCard**: TemplateSelector 中每个模板对应的预览卡片元素
- **Thumbnail**: 模板缩略图，为 SVG data URL 格式，当前尺寸为 200×260（宽高比约 10:13）
- **OverlayPanel**: 鼠标悬停时从卡片底部向上滑出的信息描述层，包含模板名称、分类标签等
- **AspectRatio**: 宽高比，由缩略图的原始宽度与高度决定

## Requirements

### Requirement 1: 卡片宽高比与缩略图一致

**User Story:** 作为用户，我希望预览卡片的宽高比与模板缩略图的原始宽高比保持一致，以便看到无变形的完整缩略图预览。

#### Acceptance Criteria

1. THE PreviewCard SHALL 根据 Thumbnail 的原始宽高比（width / height）计算并设置自身高度，使卡片宽高比与缩略图宽高比相同。
2. WHEN Thumbnail 的宽高比信息不可用时，THE PreviewCard SHALL 使用默认宽高比 10:13（即 200:260）作为回退值。
3. THE PreviewCard SHALL 在容器宽度变化时保持宽高比不变（响应式适配）。

### Requirement 2: 缩略图默认占满卡片区域

**User Story:** 作为用户，我希望默认状态下缩略图铺满整个卡片，以便获得最大化的视觉预览效果。

#### Acceptance Criteria

1. THE PreviewCard SHALL 将 Thumbnail 以 `background-size: cover` 方式铺满整个卡片区域。
2. THE PreviewCard SHALL 在默认（非悬停）状态下不显示任何文字信息覆盖层，使缩略图完整可见。
3. WHEN 模板已被选中时，THE PreviewCard SHALL 在卡片右上角显示选中标记（勾选图标），不遮挡缩略图主体内容。

### Requirement 3: 鼠标悬停时底部滑出描述层

**User Story:** 作为用户，我希望将鼠标移入卡片时能看到模板的名称和分类信息，以便在不离开当前页面的情况下了解模板详情。

#### Acceptance Criteria

1. WHEN 鼠标进入 PreviewCard 区域时，THE OverlayPanel SHALL 从卡片底部向上滑入并完全可见，动画时长不超过 300ms。
2. WHEN 鼠标离开 PreviewCard 区域时，THE OverlayPanel SHALL 向下滑出至卡片底部以外并不可见，动画时长不超过 300ms。
3. THE OverlayPanel SHALL 包含模板名称（font-weight: 600）和分类标签（带分类对应颜色）。
4. THE OverlayPanel SHALL 使用半透明深色背景（如 `rgba(0,0,0,0.65)`），确保文字在各类缩略图背景下均清晰可读。
5. THE OverlayPanel SHALL 通过 CSS `overflow: hidden` 与 `transform: translateY` 实现滑动动画，不使用 JavaScript 定时器控制动画帧。
6. WHILE OverlayPanel 处于滑入状态时，THE PreviewCard SHALL 保持缩略图完整显示，OverlayPanel 叠加在缩略图上方而非将缩略图向上推移。

### Requirement 4: 保持现有交互行为

**User Story:** 作为用户，我希望改进后的卡片仍然支持点击选中、选中高亮边框等原有交互，以便操作习惯不被打断。

#### Acceptance Criteria

1. WHEN 用户点击 PreviewCard 时，THE TemplateSelector SHALL 触发 `onTemplateSelect` 回调，行为与改进前一致。
2. WHEN 模板被选中时，THE PreviewCard SHALL 显示蓝色高亮边框（`3px solid #3498db`），与改进前一致。
3. THE TemplateSelector SHALL 保留分类过滤、应用模式选择、确认/取消等所有现有功能，不受本次改动影响。
