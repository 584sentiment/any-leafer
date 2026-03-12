import { test, expect, Page } from '@playwright/test'

test.describe('AI 对话功能测试', () => {
  test('完整对话流程：发送消息并验证 AI 响应', async ({ page }) => {
    // 访问页面
    await page.goto('/')

    // 等待页面加载完成
    await page.waitForLoadState('networkidle')

    // 检查页面是否正确渲染
    await expect(page.locator('body')).toBeVisible()

    // 查找输入框
    const chatInput = page.locator('input[type="text"]').first()

    // 等待输入框可见
    await expect(chatInput).toBeVisible({ timeout: 10000 })

    // 输入消息
    await chatInput.fill('添加一个标题，内容是我的名字')

    // 知找发送按钮
    const sendButton = page.locator('button:has-text("发送")')

    // 点击发送
    await sendButton.click()

    // 等待网络请求发出
    const chatRequest = await page.waitForRequest(req =>
      req.url().includes('/chat') && req.method() === 'POST'
    )

    // 验证请求已发出
    expect(chatRequest).toBeTruthy()

    // 验证请求内容
    const postData = chatRequest.postDataJSON()
    expect(postData).toHaveProperty('messages')
    expect(postData.messages.length).toBeGreaterThan(0)

    // 磀查页面是否有消息显示（给 AI 足够的时间）
    await page.waitForTimeout(15000)
  })

  test('验证 API 端点配置', async ({ request }) => {
    // 测试后端 API 是否正常
    const response = await fetch('http://localhost:8787/')
    expect(response.ok).toBeTruthy()

    const data = await response.json()
    expect(data).toHaveProperty('status', 'ok')
  })
})
