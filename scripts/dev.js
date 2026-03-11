/**
 * 开发服务器启动脚本
 * 自动清理占用端口的进程后启动服务
 */

import { spawn, exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const PORT_MAP = {
  worker: 8787,
  demo: 3001,
}

/**
 * 查找占用指定端口的进程 PID
 */
async function findProcessByPort(port) {
  try {
    const isWindows = process.platform === 'win32'

    if (isWindows) {
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`)
      const lines = stdout.trim().split('\n').filter(Boolean)

      const pids = new Set()
      for (const line of lines) {
        const match = line.match(/\s+(\d+)\s*$/)
        if (match && match[1] !== '0') {
          pids.add(match[1])
        }
      }
      return Array.from(pids)
    } else {
      const { stdout } = await execAsync(`lsof -ti:${port}`)
      return stdout.trim().split('\n').filter(Boolean)
    }
  } catch {
    // 没有找到占用端口的进程
    return []
  }
}

/**
 * 终止进程
 */
async function killProcess(pid) {
  try {
    const isWindows = process.platform === 'win32'
    const cmd = isWindows ? `taskkill /F /PID ${pid}` : `kill -9 ${pid}`
    await execAsync(cmd)
  } catch {
    // 忽略终止失败
  }
}

/**
 * 清理占用端口的进程
 */
async function cleanupPort(port) {
  const pids = await findProcessByPort(port)
  if (pids.length > 0) {
    for (const pid of pids) {
      await killProcess(pid)
    }
    // 等待端口释放
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
}

/**
 * 启动服务
 */
function startService(name, command, cwd) {
  const isWindows = process.platform === 'win32'
  const shell = isWindows ? true : '/bin/bash'

  const child = spawn(command, [], {
    cwd,
    shell,
    stdio: 'inherit',
  })

  return child
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2)
  const services = args.length > 0 ? args : ['worker', 'demo']

  const children = []

  for (const name of services) {
    if (!PORT_MAP[name]) {
      process.exit(1)
    }

    const port = PORT_MAP[name]
    await cleanupPort(port)
  }

  // 启动 worker
  if (services.includes('worker')) {
    const child = startService('Worker 后端', 'pnpm dev', 'packages/worker')
    children.push(child)
  }

  // 等待 worker 启动
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // 启动 demo
  if (services.includes('demo')) {
    const child = startService('Demo 前端', 'pnpm dev', 'apps/demo')
    children.push(child)
  }

  // 处理退出信号
  process.on('SIGINT', () => {
    children.forEach((child) => {
      try {
        child.kill('SIGINT')
      } catch {
        // ignore
      }
    })
    process.exit(0)
  })
}

main().catch(() => {
  process.exit(1)
})
