export const DEFAULT_REQUEST_TIMEOUT_MS = 15_000
export const STREAM_OPEN_TIMEOUT_MS = 20_000

export const privacyRuntimeCopy =
  '隐私保护：本次输入只用于当前页面推演，不会写入本地浏览器记录或远端数据库。'

export class UserFacingError extends Error {
  constructor(message, { code = 'runtime_error', cause = null } = {}) {
    super(message)
    this.name = 'UserFacingError'
    this.code = code
    this.cause = cause
  }
}

export function isAbortError(error) {
  return error?.name === 'AbortError' || error?.code === 'ABORT_ERR'
}

export function normalizeUserError(error, fallback = '暂时无法完成请求，请稍后重试。') {
  if (error instanceof UserFacingError) return error
  if (isAbortError(error)) {
    return new UserFacingError('请求等待时间过长，请检查网络后重试。', {
      code: 'timeout',
      cause: error,
    })
  }
  const raw = String(error?.message || '').trim()
  if (/timeout|timed out|aborted/i.test(raw)) {
    return new UserFacingError('请求等待时间过长，请检查网络后重试。', {
      code: 'timeout',
      cause: error,
    })
  }
  if (/Failed to fetch|NetworkError|Load failed/i.test(raw)) {
    return new UserFacingError('网络连接不稳定，暂时无法连接服务。', {
      code: 'network_error',
      cause: error,
    })
  }
  return new UserFacingError(raw || fallback, {
    code: error?.code || 'runtime_error',
    cause: error,
  })
}

export function createTimeoutSignal(timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS) {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(timeoutMs)
  }
  const controller = new AbortController()
  globalThis.setTimeout(() => controller.abort(), timeoutMs)
  return controller.signal
}

export function buildReadingFallback(skillName = '本术法', reason = '') {
  const cause = reason ? `当前文字解读未能稳定返回：${reason}` : '当前文字解读未能稳定返回。'
  return [
    `盘面已先生成，可先依据上方盘面继续观察。${cause}`,
    `${skillName} 的详细 AI 解读可点击“重新推演”再次生成。`,
    privacyRuntimeCopy,
  ].join(' ')
}
