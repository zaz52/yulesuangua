const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

let backendAvailable = null

async function checkBackend() {
  if (backendAvailable !== null) return backendAvailable
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(5000) })
    const contentType = res.headers.get('content-type') || ''
    backendAvailable = res.ok && contentType.includes('application/json')
  } catch {
    backendAvailable = false
  }
  return backendAvailable
}

export async function fetchSkills() {
  const available = await checkBackend()
  if (!available) {
    return {
      skills: [
        { id: 'bazi', name: '四柱八字', description: '通过出生时间排出四柱，分析阶段重点与五行节奏。', icon: '命' },
        { id: 'yinyuan', name: '姻缘测算', description: '围绕关系状态、相处模式、桃花机缘与长期稳定性解读。', icon: '缘' },
        { id: 'fojiao', name: '佛学开示', description: '以经典智慧回应困惑，提供心性整理与行动提醒。', icon: '禅' },
        { id: 'qimen', name: '奇门遁甲', description: '按时间与问题排盘，辅助观察时机、方位与行动策略。', icon: '门' },
      ],
    }
  }

  const res = await fetch(`${API_BASE}/divine/skills`)
  if (!res.ok) throw new Error('获取术法列表失败')
  return res.json()
}

export function isBackendAvailable() {
  return backendAvailable
}

export async function solarToLunar(dateStr) {
  const available = await checkBackend()
  if (!available) throw new Error('后端服务未连接')

  const res = await fetch(`${API_BASE}/divine/lunar?date=${dateStr}`)
  if (!res.ok) throw new Error('日期转换失败')
  return res.json()
}

export async function divineStream(skill, message, history = [], extra = {}, onChunk, onDone) {
  const available = await checkBackend()
  if (!available) {
    onChunk?.('当前生产站点还没有连接后端 API，暂时无法进行真实 AI 推演。\n\n你仍然可以浏览界面与填写表单；后端部署完成后，这里会直接返回流式测算结果。')
    onDone?.()
    return
  }

  const res = await fetch(`${API_BASE}/divine/${skill}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, ...extra }),
  })

  if (!res.ok) throw new Error(`请求失败：${res.status}`)

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
        if (data === '[DONE]') {
          onDone?.()
          return
        }
        onChunk?.(data.replace(/\\n/g, '\n'))
      }
    }
  }

  onDone?.()
}
