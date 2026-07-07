import {
  DEFAULT_REQUEST_TIMEOUT_MS,
  STREAM_OPEN_TIMEOUT_MS,
  UserFacingError,
  createTimeoutSignal,
  normalizeUserError,
} from '../domain/runtimeGuards'

export const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

const BACKEND_STATUS_TTL_MS = 30_000
const BACKEND_CHECK_TIMEOUT_MS = 5_000

let backendAvailable = null
let backendCheckedAt = 0
let backendCheckPromise = null
let clientId = null

async function fetchWithUserError(url, options = {}, fallback) {
  try {
    return await fetch(url, options)
  } catch (error) {
    throw normalizeUserError(error, fallback)
  }
}

function createCancellableTimeout(timeoutMs) {
  const controller = new AbortController()
  const timer = globalThis.setTimeout(() => controller.abort(), timeoutMs)
  return {
    signal: controller.signal,
    clear: () => globalThis.clearTimeout(timer),
  }
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
      signal: createTimeoutSignal(BACKEND_CHECK_TIMEOUT_MS),
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

export async function getJson(path, { requireBackend = true, timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS } = {}) {
  const available = await ensureBackendAvailable()
  if (requireBackend && !available) {
    throw new UserFacingError('后端服务暂时不可用，请稍后重试。', { code: 'backend_unavailable' })
  }
  if (!available) return { ok: false, code: 'backend_unavailable' }

  const res = await fetchWithUserError(
    `${API_BASE}${path}`,
    {
      cache: 'no-store',
      signal: createTimeoutSignal(timeoutMs),
    },
    '请求暂时无法完成，请稍后重试。',
  )
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new UserFacingError(data.error || data.code || `请求失败：${res.status}`, {
      code: data.code || `http_${res.status}`,
    })
  }
  return data
}

export async function postJson(path, payload, { tolerateCodes = [], timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS } = {}) {
  const available = await ensureBackendAvailable()
  if (!available) return { ok: false, code: 'backend_unavailable', record: payload }

  const res = await fetchWithUserError(
    `${API_BASE}${path}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: createTimeoutSignal(timeoutMs),
    },
    '请求暂时无法完成，请稍后重试。',
  )
  const data = await res.json().catch(() => ({}))
  if (!res.ok && !tolerateCodes.includes(data.code)) {
    throw new UserFacingError(data.error || data.code || `请求失败：${res.status}`, {
      code: data.code || `http_${res.status}`,
    })
  }
  return data
}

export async function readEventStream(
  path,
  payload,
  onChunk,
  onDone,
  { timeoutMs = STREAM_OPEN_TIMEOUT_MS } = {},
) {
  const available = await ensureBackendAvailable()
  if (!available) {
    throw new UserFacingError('后端服务暂时不可用，无法生成 AI 解读。', {
      code: 'backend_unavailable',
    })
  }

  const openTimeout = createCancellableTimeout(timeoutMs)
  let res
  try {
    res = await fetchWithUserError(
      `${API_BASE}${path}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: openTimeout.signal,
      },
      'AI 解读连接超时，请稍后重试。',
    )
  } finally {
    openTimeout.clear()
  }
  if (!res.ok) throw new UserFacingError(`请求失败：${res.status}`, { code: `http_${res.status}` })
  if (!res.body?.getReader) throw new UserFacingError('当前浏览器不支持流式解读。', { code: 'stream_unsupported' })

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
