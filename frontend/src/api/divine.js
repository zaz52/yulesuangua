import {
  checkBackend,
  getClientId,
  getJson,
  isBackendAvailable,
  postJson,
  readEventStream,
} from './http'

const FALLBACK_SKILLS = [
  { id: 'bazi', name: '四柱八字', description: '通过出生时间排出四柱，分析阶段重点与五行节奏。', icon: '命' },
  { id: 'yinyuan', name: '姻缘测算', description: '围绕关系状态、相处模式、桃花机缘与长期稳定性解读。', icon: '缘' },
  { id: 'fojiao', name: '佛学开示', description: '以经典智慧回应困惑，提供心性整理与行动提醒。', icon: '禅' },
  { id: 'qimen', name: '奇门遁甲', description: '按时间与问题排盘，辅助观察时机、方位与行动策略。', icon: '门' },
]

export { getClientId, isBackendAvailable }

export async function fetchSkills() {
  const available = await checkBackend()
  if (!available) return { skills: FALLBACK_SKILLS }
  return getJson('/divine/skills')
}

export async function solarToLunar(dateStr) {
  return getJson(`/divine/lunar?date=${encodeURIComponent(dateStr)}`)
}

export async function calculateChart(skill, payload = {}) {
  const data = await postJson('/metaphysics/calculate', { skill, ...payload })
  if (data.ok === false) throw new Error(data.error || '排盘失败')
  return data
}

export async function createConsultationRecord(payload = {}) {
  return postJson(
    '/consultations',
    { ...payload, clientId: payload.clientId || getClientId() },
    { tolerateCodes: ['persistence_unavailable'] },
  )
}

export async function getConsultationRecord(id) {
  return getJson(`/consultations/${encodeURIComponent(id)}`)
}

export async function divineStream(skill, message, history = [], extra = {}, onChunk, onDone) {
  return readEventStream(`/divine/${skill}`, { message, history, ...extra }, onChunk, onDone)
}
