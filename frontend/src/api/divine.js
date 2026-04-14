/**
 * 后端 API 调用模块
 */
const API_BASE = '/api'

export async function fetchSkills() {
  const res = await fetch(`${API_BASE}/divine/skills`)
  if (!res.ok) throw new Error('获取技能列表失败')
  return res.json()
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
        onChunk?.(data)
      }
    }
  }
  onDone?.()
}
