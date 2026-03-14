# 模板纸张边界修复设计文档

## Overview

当前在使用模板生成简历时（快速生成和智能生成），生成的元素没有按照纸张大小计算宽度和位置，导致元素超出纸张边界。本修复将在模板应用和元素创建流程中添加边界检查和自动调整逻辑，确保所有生成的元素都在纸张内容区域（contentBounds）内，同时保持模板的视觉风格和布局结构不变。

## Glossary

- **Bug_Condition (C)**: 模板生成的元素超出纸张内容区域（contentBounds）的条件
- **Property (P)**: 所有模板生成的元素都应在纸张内容区域内的期望行为
- **Preservation**: 模板的视觉风格、布局结构、用户手动操作行为必须保持不变
- **contentBounds**: 纸张的内容区域，由纸张位置、尺寸和内边距（padding）计算得出，是元素应该放置的有效区域
- **paperEffect**: 纸张效果配置，包含纸张的启用状态、尺寸、位置和内边距信息
- **TemplateManager.applyTemplate()**: 快速应用模板的方法，位于 `packages/client/src/agent/managers/TemplateManager.ts`
- **TemplateManager.applyElements()**: 应用元素列表到画布的方法，用于智能生成后应用元素
- **LeaferEditor.createElement()**: 创建元素的底层方法，位于 `packages/client/src/canvas/LeaferEditor.ts`
- **LeaferEditor.getPaperContentBounds()**: 获取纸张内容区域的方法

## Bug Details

### Bug Condition

当使用快速生成或智能生成模板功能时，系统直接应用模板中定义的元素坐标和尺寸，而不检查这些坐标是否在纸张内容区域内。模板定义中的坐标（如 `x: 50, y: 40`）可能是基于画布左上角的绝对坐标，但当启用纸张效果后，纸张本身有位置偏移和内边距，导致元素超出纸张边界。

**Formal Specification:**
```
FUNCTION isBugCondition(element, paperContentBounds)
  INPUT: element of type ResumeElement, paperContentBounds of type {x, y, width, height} | null
  OUTPUT: boolean
  
  IF paperContentBounds IS NULL THEN
    RETURN false  // 没有启用纸张效果，不存在边界问题
  END IF
  
  RETURN (element.x < paperContentBounds.x) OR
         (element.y < paperContentBounds.y) OR
         (element.x + element.width > paperContentBounds.x + paperContentBounds.width) OR
         (element.y + element.height > paperContentBounds.y + paperContentBounds.height)
END FUNCTION
```

### Examples

- **经典模板 (classic-1)**: 姓名标题元素定义为 `x: 50, y: 40`，但纸张内容区域起始于 `x: 100, y: 80`（假设纸张位置 + padding），导致元素超出左边界和上边界
- **简约模板 (minimal-1)**: 工作经历内容元素宽度为 640，但纸张内容区域宽度只有 600，导致元素超出右边界
- **创意模板 (creative-1)**: 顶部彩色背景元素 `x: 0, width: 800` 完全超出纸张边界
- **双栏模板 (minimal-2)**: 右栏元素 `x: 430` 可能超出纸张内容区域的右边界

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- 模板元素本身就在纸张内容区域内时，保持元素的原始位置和尺寸不变
- 用户手动创建或移动元素时，允许用户自由操作元素（可选择性地提供边界警告）
- 没有启用纸张效果时，按照原有逻辑处理元素位置和尺寸
- 应用模板时，保持模板的视觉风格和布局结构（相对位置关系、字体、颜色等）

**Scope:**
所有不涉及模板生成（快速生成和智能生成）的操作应完全不受影响。这包括：
- 用户通过 AI 对话手动创建单个元素
- 用户手动拖动、缩放元素
- 在没有启用纸张效果的画布上的所有操作
- 模板的视觉设计和样式定义

## Hypothesized Root Cause

基于代码分析，最可能的问题原因是：

1. **模板坐标系统不匹配**: 模板定义中的坐标（如 `packages/templates/src/classic.ts`）使用的是画布绝对坐标，假设从 (0, 0) 开始，但实际纸张内容区域有偏移（paperX + padding, paperY + padding）

2. **缺少边界检查逻辑**: `TemplateManager.applyTemplate()` 和 `TemplateManager.applyElements()` 方法直接调用 `editor.createElement(element, { id: element.id })`，没有在创建前检查和调整元素坐标

3. **元素尺寸未缩放**: 模板元素的宽度可能超过纸张内容区域的宽度，需要按比例缩放元素尺寸以适应纸张

4. **背景元素处理不当**: 某些模板（如 creative-1）包含全画布背景元素（`x: 0, width: 800`），这些元素应该被调整为纸张内容区域的尺寸

## Correctness Properties

Property 1: Bug Condition - 模板元素边界约束

_For any_ 模板元素在启用纸张效果时被应用到画布，修复后的系统 SHALL 确保该元素的位置和尺寸在纸张内容区域（contentBounds）内，即 `element.x >= contentBounds.x AND element.y >= contentBounds.y AND element.x + element.width <= contentBounds.x + contentBounds.width AND element.y + element.height <= contentBounds.y + contentBounds.height`。

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

Property 2: Preservation - 非模板生成操作行为

_For any_ 不涉及模板生成的操作（用户手动创建元素、手动移动元素、没有启用纸张效果的操作），修复后的系统 SHALL 产生与原系统完全相同的行为，保持用户的自由操作能力和原有的元素处理逻辑。

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

## Fix Implementation

### Changes Required

假设我们的根因分析是正确的：

**File**: `packages/client/src/agent/managers/TemplateManager.ts`

**Function**: `applyTemplate()` 和 `applyElements()`

**Specific Changes**:
1. **添加边界调整辅助方法**: 创建 `adjustElementToPaperBounds()` 私有方法，接收元素和纸张内容区域，返回调整后的元素
   - 检查纸张效果是否启用（通过 `editor.getPaperContentBounds()`）
   - 如果未启用，直接返回原元素
   - 如果启用，计算元素是否超出边界
   - 调整元素的 x, y, width, height 以适应纸张内容区域
   - 保持元素的相对位置关系（通过计算缩放比例）

2. **修改 applyTemplate() 方法**: 在调用 `editor.createElement()` 前，先调用 `adjustElementToPaperBounds()` 调整元素

3. **修改 applyElements() 方法**: 在调用 `editor.createElement()` 前，先调用 `adjustElementToPaperBounds()` 调整元素

4. **处理特殊元素**: 对于背景元素（如 `id: 'sidebar-bg'`, `id: 'header-bg'`），需要特殊处理，将其尺寸调整为纸张内容区域的尺寸

5. **保持布局结构**: 计算所有元素的边界框（bounding box），按比例缩放所有元素，保持相对位置关系

### 边界调整算法

```
FUNCTION adjustElementToPaperBounds(element, contentBounds)
  INPUT: element of type ResumeElement, contentBounds of type {x, y, width, height} | null
  OUTPUT: adjusted element of type ResumeElement
  
  IF contentBounds IS NULL THEN
    RETURN element  // 没有纸张效果，不调整
  END IF
  
  // 计算元素的边界框
  elementRight := element.x + element.width
  elementBottom := element.y + element.height
  contentRight := contentBounds.x + contentBounds.width
  contentBottom := contentBounds.y + contentBounds.height
  
  // 调整位置：确保元素在内容区域内
  adjustedX := MAX(element.x, contentBounds.x)
  adjustedY := MAX(element.y, contentBounds.y)
  
  // 调整尺寸：确保元素不超出右边界和下边界
  adjustedWidth := MIN(element.width, contentRight - adjustedX)
  adjustedHeight := MIN(element.height, contentBottom - adjustedY)
  
  RETURN {
    ...element,
    x: adjustedX,
    y: adjustedY,
    width: adjustedWidth,
    height: adjustedHeight
  }
END FUNCTION
```

## Testing Strategy

### Validation Approach

测试策略分为两个阶段：首先在未修复的代码上运行探索性测试，观察元素超出边界的具体情况；然后在修复后的代码上运行修复检查和保留检查，验证修复的正确性和完整性。

### Exploratory Bug Condition Checking

**Goal**: 在实施修复前，在未修复的代码上运行测试，观察元素超出纸张边界的具体情况，确认根因分析的正确性。

**Test Plan**: 编写测试用例，在启用纸张效果的画布上应用各种模板，检查生成的元素是否超出纸张内容区域。在未修复的代码上运行这些测试，预期会失败并显示具体的超出边界情况。

**Test Cases**:
1. **经典模板边界测试**: 应用 classic-1 模板，检查姓名标题和联系信息是否超出纸张左边界和上边界（预期在未修复代码上失败）
2. **简约模板宽度测试**: 应用 minimal-1 模板，检查工作经历内容是否超出纸张右边界（预期在未修复代码上失败）
3. **创意模板背景测试**: 应用 creative-1 模板，检查顶部彩色背景是否超出纸张边界（预期在未修复代码上失败）
4. **双栏模板右栏测试**: 应用 minimal-2 模板，检查右栏元素是否超出纸张右边界（预期在未修复代码上失败）

**Expected Counterexamples**:
- 元素的 x 坐标小于 contentBounds.x
- 元素的 y 坐标小于 contentBounds.y
- 元素的 x + width 大于 contentBounds.x + contentBounds.width
- 元素的 y + height 大于 contentBounds.y + contentBounds.height
- 可能的原因：模板坐标系统不匹配、缺少边界检查、元素尺寸未缩放

### Fix Checking

**Goal**: 验证对于所有启用纸张效果时应用模板的情况，修复后的系统确保所有元素都在纸张内容区域内。

**Pseudocode:**
```
FOR ALL template IN [classic-1, minimal-1, minimal-2, creative-1, creative-2] DO
  // 启用纸张效果
  editor.init({ paperEffect: { enabled: true } })
  contentBounds := editor.getPaperContentBounds()
  
  // 应用模板
  templateManager.applyTemplate(template.id)
  elements := editor.getAllElements()
  
  // 检查所有元素（排除纸张背景元素）
  FOR ALL element IN elements WHERE element.id != '__paper_background__' DO
    ASSERT element.x >= contentBounds.x
    ASSERT element.y >= contentBounds.y
    ASSERT element.x + element.width <= contentBounds.x + contentBounds.width
    ASSERT element.y + element.height <= contentBounds.y + contentBounds.height
  END FOR
END FOR
```

### Preservation Checking

**Goal**: 验证对于所有不涉及模板生成的操作，修复后的系统产生与原系统完全相同的行为。

**Pseudocode:**
```
// 测试 1: 没有启用纸张效果时，应用模板的行为不变
FOR ALL template IN [classic-1, minimal-1] DO
  editor_original.init({ paperEffect: { enabled: false } })
  editor_fixed.init({ paperEffect: { enabled: false } })
  
  templateManager_original.applyTemplate(template.id)
  templateManager_fixed.applyTemplate(template.id)
  
  elements_original := editor_original.getAllElements()
  elements_fixed := editor_fixed.getAllElements()
  
  ASSERT elements_original == elements_fixed
END FOR

// 测试 2: 用户手动创建元素的行为不变
editor_original.init({ paperEffect: { enabled: true } })
editor_fixed.init({ paperEffect: { enabled: true } })

element := { type: 'text', x: 50, y: 50, width: 200, height: 30, content: 'Test' }
editor_original.createElement(element)
editor_fixed.createElement(element)

ASSERT editor_original.getAllElements() == editor_fixed.getAllElements()
```

**Testing Approach**: 属性测试（Property-Based Testing）推荐用于保留检查，因为：
- 可以自动生成大量测试用例，覆盖各种边界情况
- 可以捕获手动单元测试可能遗漏的边缘情况
- 提供强有力的保证，确保所有非模板生成操作的行为不变

**Test Plan**: 首先在未修复的代码上观察没有启用纸张效果时的行为和用户手动操作的行为，然后编写属性测试捕获这些行为，确保修复后行为一致。

**Test Cases**:
1. **无纸张效果保留测试**: 在没有启用纸张效果的画布上应用模板，验证元素位置和尺寸与未修复代码完全一致
2. **手动创建元素保留测试**: 用户通过 AI 对话或直接调用 `createElement()` 创建元素，验证元素不受边界调整影响
3. **手动移动元素保留测试**: 用户手动拖动元素，验证元素可以自由移动，不受边界限制
4. **模板视觉风格保留测试**: 应用模板后，验证元素的相对位置关系、字体、颜色等视觉属性保持不变

### Unit Tests

- 测试 `adjustElementToPaperBounds()` 方法的各种边界情况（元素在边界内、超出左边界、超出右边界、超出上边界、超出下边界、完全超出边界）
- 测试没有启用纸张效果时，`adjustElementToPaperBounds()` 返回原元素
- 测试 `applyTemplate()` 方法在启用和未启用纸张效果时的行为
- 测试 `applyElements()` 方法在启用和未启用纸张效果时的行为

### Property-Based Tests

- 生成随机模板元素（随机位置、尺寸），验证调整后的元素都在纸张内容区域内
- 生成随机纸张内容区域配置，验证边界调整算法的正确性
- 生成随机用户操作序列（创建、移动、缩放元素），验证非模板生成操作的行为保持不变

### Integration Tests

- 测试完整的模板应用流程：初始化编辑器 → 启用纸张效果 → 应用模板 → 验证所有元素在边界内
- 测试智能生成流程：调用后端 API 生成元素 → 应用元素列表 → 验证所有元素在边界内
- 测试混合场景：应用模板 → 用户手动添加元素 → 验证模板元素在边界内，手动元素不受限制
- 测试视觉回归：应用模板前后截图对比，验证布局结构和视觉风格保持一致
