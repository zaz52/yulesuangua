export const readingSectionSchemas = {
  bazi: ['四柱总览', '日主五行', '十神关系', '阶段节奏', '关键矛盾', '行动建议', '风险提醒'],
  ziwei: ['命身总览', '十二宫重点', '主星结构', '事业财帛', '关系迁移', '行动建议', '风险提醒'],
  qimen: ['九宫总览', '值符值使', '门星神格局', '方位时机', '关键矛盾', '行动策略', '风险提醒'],
  liuyao: ['本卦变卦', '世应用神', '动爻变化', '六亲关系', '应期倾向', '行动建议', '风险提醒'],
  meihua: ['本互变卦', '体用生克', '动爻外应', '趋势判断', '关键矛盾', '行动建议', '风险提醒'],
  daliuren: ['四课三传', '神将月将', '来意脉络', '事件走势', '关键矛盾', '行动建议', '风险提醒'],
  xiaoliuren: ['六宫落点', '起因过程结果', '速断倾向', '应事时间', '行动建议', '风险提醒'],
  yinyuan: ['关系现状', '缘分结构', '沟通阻力', '推进时机', '行动建议', '风险提醒'],
  hehun: ['双方结构', '合盘重点', '磨合风险', '长期相处', '行动建议', '风险提醒'],
  fojiao: ['当下心境', '执着所在', '观照方向', '当行之事', '风险提醒'],
  fengshui: ['空间总览', '门窗动线', '床桌主位', '九宫方位', '调整建议', '风险提醒'],
  'daily-fortune': ['今日主题', '宜行事项', '忌避事项', '情绪节奏', '行动建议', '风险提醒'],
  tarot: ['牌阵总览', '牌面象征', '当前位置', '选择提醒', '行动建议', '风险提醒'],
  default: ['盘面摘要', '关键结构', '问题重心', '趋势判断', '行动建议', '风险提醒'],
}

export const readingSectionAliases = {
  bazi: { 盘面摘要: '四柱总览', 盘面要点: '日主五行', 趋势判断: '阶段节奏' },
  ziwei: { 盘面摘要: '命身总览', 关键结构: '主星结构', 趋势判断: '事业财帛' },
  qimen: { 盘面摘要: '九宫总览', 盘面要点: '值符值使', 趋势判断: '方位时机', 行动建议: '行动策略' },
  liuyao: { 盘面摘要: '本卦变卦', 盘面要点: '世应用神', 趋势判断: '应期倾向' },
  meihua: { 盘面摘要: '本互变卦', 盘面要点: '体用生克' },
  default: { 盘面摘要: '盘面摘要', 关键结构: '关键结构', 趋势判断: '趋势判断' },
}

const EMPTY_BODY = '当前栏目缺少稳定解读，请结合上方盘面继续观察，并以现实信息复核后再行动。'

export function getReadingSchema(skill) {
  return readingSectionSchemas[skill] || readingSectionSchemas.default
}

export function parseReadingSections(text = '') {
  const source = String(text || '').replace(/\r/g, '').trim()
  if (!source) return []

  const marked = [...source.matchAll(/[【\[]([^】\]\n]{1,24})[】\]]([\s\S]*?)(?=[【\[]([^】\]\n]{1,24})[】\]]|$)/g)]
    .map((match) => ({
      title: match[1].trim(),
      body: normalizeBody(match[2]),
    }))
    .filter((item) => item.title && item.body)
  if (marked.length) return marked

  return source
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const colon = line.match(/^([^：:]{2,24})[：:]\s*(.+)$/)
      if (colon) return { title: colon[1].trim(), body: normalizeBody(colon[2]) }
      return { title: '解读要点', body: normalizeBody(line) }
    })
}

export function normalizeReadingSections(textOrSections, skill, options = {}) {
  const schema = getReadingSchema(skill)
  const aliases = { ...(readingSectionAliases.default || {}), ...(readingSectionAliases[skill] || {}) }
  const sections = Array.isArray(textOrSections) ? textOrSections : parseReadingSections(textOrSections)
  const mapped = new Map()
  const usableBodies = []

  for (const section of sections) {
    const title = aliases[section.title] || section.title
    const body = normalizeBody(section.body)
    if (!body) continue
    usableBodies.push(body)
    if (schema.includes(title) && !mapped.has(title)) {
      mapped.set(title, { title, body, kind: sectionKind(title) })
    }
  }

  const fallbackBody = usableBodies[0] || options.fallbackBody || EMPTY_BODY
  return schema.map((title, index) => ({
    title,
    body: mapped.get(title)?.body || usableBodies[index] || fallbackBody,
    kind: sectionKind(title),
    generated: !mapped.has(title),
  }))
}

export function normalizeReadingText(skill, text, options = {}) {
  return normalizeReadingSections(text, skill, options)
    .map((section) => `【${section.title}】${section.body}`)
    .join('\n')
}

export function hasCompleteReadingShape(text, skill) {
  const schema = getReadingSchema(skill)
  const titles = parseReadingSections(text).map((item) => item.title)
  return schema.every((title) => titles.includes(title))
}

export function sectionKind(title = '') {
  if (/建议|策略|调整|当行/.test(title)) return '行动'
  if (/风险|提醒|边界|忌避/.test(title)) return '边界'
  if (/总览|结构|格局|卦|宫|盘|五行|十神|体用|牌面/.test(title)) return '盘面'
  if (/趋势|时机|应期|节奏|关系|矛盾|阻力|走势|选择/.test(title)) return '判断'
  return '要点'
}

function normalizeBody(value = '') {
  return String(value || '')
    .replace(/\\n/g, ' ')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
