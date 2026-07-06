export const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

const BACKEND_STATUS_TTL_MS = 30_000
const BACKEND_CHECK_TIMEOUT_MS = 5_000

let backendAvailable = null
let backendCheckedAt = 0
let backendCheckPromise = null
let clientId = null

function timeoutSignal(timeoutMs) {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(timeoutMs)
  }
  const controller = new AbortController()
  globalThis.setTimeout(() => controller.abort(), timeoutMs)
  return controller.signal
}

export async function checkBackend({ force = false } = {}) {
  const now = Date.now()
  const cacheFresh = backendAvailable !== null && now - backendCheckedAt < BACKEND_STATUS_TTL_MS
  if (!force && cacheFresh) return backendAvailable
  if (!force && backendCheckPromise) return backendCheckPromise

  backendCheckPromise = runBackendCheck()
  try {
    return await backendCheckPromise
  } finally {
    backendCheckPromise = null
  }
}

async function runBackendCheck() {
  try {
    const res = await fetch(`${API_BASE}/health`, {
      cache: 'no-store',
      signal: timeoutSignal(BACKEND_CHECK_TIMEOUT_MS),
    })
    const contentType = res.headers.get('content-type') || ''
    backendAvailable = res.ok && contentType.includes('application/json')
  } catch {
    backendAvailable = false
  }
  backendCheckedAt = Date.now()
  return backendAvailable
}

export function isBackendAvailable() {
  return backendAvailable
}

export function resetBackendStatus() {
  backendAvailable = null
  backendCheckedAt = 0
  backendCheckPromise = null
}

async function ensureBackendAvailable() {
  if (await checkBackend({ force: backendAvailable === false })) return true
  return checkBackend({ force: true })
}

export function getClientId() {
  if (!clientId) {
    clientId = `web_${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(16).slice(2)}`}`
  }
  return clientId
}

export async function getJson(path, { requireBackend = true } = {}) {
  const available = await ensureBackendAvailable()
  if (requireBackend && !available) throw new Error('后端服务未连接')
  if (!available) return { ok: false }

  const res = await fetch(`${API_BASE}${path}`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || data.code || `请求失败：${res.status}`)
  return data
}

export async function postJson(path, payload, { tolerateCodes = [] } = {}) {
  const available = await ensureBackendAvailable()
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
  const available = await ensureBackendAvailable()
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
