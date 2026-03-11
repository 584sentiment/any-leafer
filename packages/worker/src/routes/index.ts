/**
 * API 路由
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { handleChatRequest, type AgentServiceRequest } from '../do/AgentService'

// 创建 Hono 应用
const app = new Hono()

// CORS 配置
app.use(
  '/*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  })
)

// 健康检查
app.get('/', (c) => {
  return c.json({ status: 'ok', version: '0.1.0' })
})

// 聊天接口
app.post('/chat', async (c) => {
  try {
    const body = await c.req.json<AgentServiceRequest>()

    if (!body.messages || !Array.isArray(body.messages)) {
      return c.json({ error: 'Invalid messages' }, 400)
    }

    const stream = await handleChatRequest({
      messages: body.messages,
      model: body.model || 'claude-sonnet-4.5',
      context: body.context,
      mode: body.mode,
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat error:', error)
    return c.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      500
    )
  }
})

// 获取可用模型列表
app.get('/models', (c) => {
  return c.json({
    models: [
      { id: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5', provider: 'anthropic' },
      { id: 'claude-opus-4.5', name: 'Claude Opus 4.5', provider: 'anthropic' },
      { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'google' },
    ],
  })
})

// 获取模板列表
app.get('/templates', (c) => {
  // TODO: 从数据库或 KV 存储获取模板
  return c.json({
    templates: [],
  })
})

export default app
