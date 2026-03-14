# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - 模板元素超出纸张边界
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: For deterministic bugs, scope the property to the concrete failing case(s) to ensure reproducibility
  - Test that when applying templates (classic-1, minimal-1, creative-1, minimal-2) with paper effect enabled, elements exceed paper content bounds
  - The test assertions should match the Expected Behavior Properties from design: all elements must satisfy `element.x >= contentBounds.x AND element.y >= contentBounds.y AND element.x + element.width <= contentBounds.x + contentBounds.width AND element.y + element.height <= contentBounds.y + contentBounds.height`
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause (e.g., "classic-1 name-title element x=50 < contentBounds.x=100", "minimal-1 work-content width exceeds contentBounds.width")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - 非模板生成操作行为保持不变
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs:
    - When paper effect is disabled, observe element positions after applying templates
    - When user manually creates elements, observe that elements are created at specified positions without adjustment
    - When user manually moves elements, observe that elements can be moved freely
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements:
    - Test 1: Without paper effect, applying templates produces same element positions as unfixed code
    - Test 2: Manual element creation (via createElement) is not affected by boundary adjustment
    - Test 3: Template visual style (relative positions, fonts, colors) is preserved
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3. Fix for 模板元素超出纸张边界

  - [x] 3.1 Implement the fix in TemplateManager
    - Add private method `adjustElementToPaperBounds(element: ResumeElement): ResumeElement` to TemplateManager class
    - Method should call `editor.getPaperContentBounds()` to get paper content area
    - If contentBounds is null (paper effect disabled), return element unchanged
    - If contentBounds exists, adjust element position and size to fit within bounds:
      - `adjustedX = Math.max(element.x, contentBounds.x)`
      - `adjustedY = Math.max(element.y, contentBounds.y)`
      - `adjustedWidth = Math.min(element.width, contentBounds.x + contentBounds.width - adjustedX)`
      - `adjustedHeight = Math.min(element.height, contentBounds.y + contentBounds.height - adjustedY)`
    - Return adjusted element with new x, y, width, height
    - _Bug_Condition: isBugCondition(element, paperContentBounds) where element exceeds contentBounds_
    - _Expected_Behavior: All template elements satisfy boundary constraints from design_
    - _Preservation: Non-template operations unchanged, visual style preserved_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4_

  - [x] 3.2 Modify applyTemplate() method
    - In `applyTemplate()` method, before calling `editor.createElement(element, { id: element.id })`, call `adjustElementToPaperBounds(element)` to get adjusted element
    - Pass adjusted element to `editor.createElement()`
    - Ensure all elements in template.elements array are adjusted
    - _Requirements: 2.1, 2.3, 2.4_

  - [x] 3.3 Modify applyElements() method
    - In `applyElements()` method, before calling `editor.createElement(element, { id: element.id })`, call `adjustElementToPaperBounds(element)` to get adjusted element
    - Pass adjusted element to `editor.createElement()`
    - Ensure all elements in the elements array are adjusted
    - _Requirements: 2.2, 2.3, 2.4_

  - [x] 3.4 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - 模板元素在纸张边界内
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: Expected Behavior Properties from design (2.1, 2.2, 2.3, 2.4)_

  - [x] 3.5 Verify preservation tests still pass
    - **Property 2: Preservation** - 非模板生成操作行为保持不变
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: Preservation Requirements from design (3.1, 3.2, 3.3, 3.4)_

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
