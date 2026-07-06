const RECENT_RECORDS_KEY = 'qk_recent_records'
const MAX_RECENT_RECORDS = 8

export function formatRecordTime(value = new Date()) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value instanceof Date ? value : new Date(value))
}

export function loadLocalRecentRecords(limit = MAX_RECENT_RECORDS) {
  try {
    return JSON.parse(localStorage.getItem(RECENT_RECORDS_KEY) || '[]').slice(0, limit)
  } catch {
    return []
  }
}

export function saveLocalRecentRecord(record, limit = MAX_RECENT_RECORDS) {
  const normalized = {
    title: record.title || '未命名问事',
    path: record.path || '/',
    time: record.time || formatRecordTime(),
    id: record.id,
    skill: record.skill,
  }
  const next = [normalized, ...loadLocalRecentRecords(limit)].slice(0, limit)
  localStorage.setItem(RECENT_RECORDS_KEY, JSON.stringify(next))
  return next
}

export function remoteConsultationToRecentRecord(item) {
  return {
    id: item.id,
    title: item.title,
    path: `/share/${item.id}`,
    skill: item.skill,
    time: item.createdAt ? formatRecordTime(item.createdAt) : '',
  }
}
