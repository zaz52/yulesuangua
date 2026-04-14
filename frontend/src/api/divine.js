/**
 * 后端 API 调用模块
 */
const API_BASE = '/api'

// 检测后端是否可用
let backendAvailable = null

async function checkBackend() {
  if (backendAvailable !== null) return backendAvailable
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(5000) })
    backendAvailable = res.ok
  } catch {
    backendAvailable = false
  }
  return backendAvailable
}

export async function fetchSkills() {
  const available = await checkBackend()
  if (!available) {
    // 后端不可用，返回默认技能列表
    return { skills: [
      { id: 'bazi', name: '四柱八字', description: '通过出生时间排出四柱八字，分析命理运势', icon: '☰' },
      { id: 'yinyuan', name: '姻缘测算', description: '八字合婚、生肖配对、紫微夫妻宫、签诗占卜', icon: '💝' },
      { id: 'fojiao', name: '佛学开示', description: '高僧大德智慧开示，佛经典籍解读', icon: '☸' },
      { id: 'qimen', name: '奇门遁甲', description: '时家奇门排盘、解盘、择时、方位判断', icon: '☯' },
    ] }
  }
  const res = await fetch(`${API_BASE}/divine/skills`)
  if (!res.ok) throw new Error('获取技能列表失败')
  return res.json()
}

export function isBackendAvailable() {
  return backendAvailable
}

/**
 * 阳历转阴历
 */
export async function solarToLunar(dateStr) {
  const res = await fetch(`${API_BASE}/divine/lunar?date=${dateStr}`)
  if (!res.ok) throw new Error('日期转换失败')
  return res.json()
}

/**
 * 流式调用算卦接口
 */
export async function divineStream(skill, message, history = [], extra = {}, onChunk, onDone) {
  const available = await checkBackend()
  if (!available) {
    onChunk?.('后端服务未启动，无法进行算卦推演。\n\n本项目需要 Python FastAPI 后端运行才能使用 AI 算卦功能。\n\n部署方式请参考 GitHub 仓库中的 README.md。')
    onDone?.()
    return
  }

  const body = { message, history, ...extra }

  const res = await fetch(`${API_BASE}/divine/${skill}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error(`请求失败: ${res.status}`)

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') { onDone?.(); return }
        // 反转义后端转义的换行符
        onChunk?.(data.replace(/\\n/g, '\n'))
      }
    }
  }
  onDone?.()
}
