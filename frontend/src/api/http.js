export const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

let backendAvailable = null
let clientId = null

export async function checkBackend() {
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

export function isBackendAvailable() {
  return backendAvailable
}

export function getClientId() {
  if (!clientId) {
    clientId = `web_${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(16).slice(2)}`}`
  }
  return clientId
}

export async function getJson(path, { requireBackend = true } = {}) {
  const available = await checkBackend()
  if (requireBackend && !available) throw new Error('后端服务未连接')
  if (!available) return { ok: false }

  const res = await fetch(`${API_BASE}${path}`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || data.code || `请求失败：${res.status}`)
  return data
}

export async function postJson(path, payload, { tolerateCodes = [] } = {}) {
  const available = await checkBackend()
  if (!available) return { ok: false, code: 'backend_unavailable', record: payload }

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok && !tolerateCodes.includes(data.code)) {
    throw new Error(data.error || data.code || `请求失败：${res.status}`)
  }
  return data
}

export async function readEventStream(path, payload, onChunk, onDone) {
  const available = await checkBackend()
  if (!available) {
    onChunk?.('当前生产站点还没有连接后端 API，暂时无法进行真实 AI 推演。\n\n你仍然可以浏览界面与填写表单；后端部署完成后，这里会直接返回流式测算结果。')
    onDone?.()
    return
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
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
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6)
      if (data === '[DONE]') {
        onDone?.()
        return
      }
      onChunk?.(data.replace(/\\n/g, '\n'))
    }
  }

  onDone?.()
}
