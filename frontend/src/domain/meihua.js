const TRIGRAMS = [
  { name: '乾', nature: '天', element: '金', symbol: '☰', image: '刚健' },
  { name: '兑', nature: '泽', element: '金', symbol: '☱', image: '悦动' },
  { name: '离', nature: '火', element: '火', symbol: '☲', image: '明辨' },
  { name: '震', nature: '雷', element: '木', symbol: '☳', image: '发动' },
  { name: '巽', nature: '风', element: '木', symbol: '☴', image: '入微' },
  { name: '坎', nature: '水', element: '水', symbol: '☵', image: '险中求通' },
  { name: '艮', nature: '山', element: '土', symbol: '☶', image: '止而后定' },
  { name: '坤', nature: '地', element: '土', symbol: '☷', image: '承载' },
]

const ELEMENT_RELATION = {
  金: { 木: '体克用', 火: '用克体', 土: '用生体', 水: '体生用', 金: '体用比和' },
  木: { 土: '体克用', 金: '用克体', 水: '用生体', 火: '体生用', 木: '体用比和' },
  水: { 火: '体克用', 土: '用克体', 金: '用生体', 木: '体生用', 水: '体用比和' },
  火: { 金: '体克用', 水: '用克体', 木: '用生体', 土: '体生用', 火: '体用比和' },
  土: { 水: '体克用', 木: '用克体', 火: '用生体', 金: '体生用', 土: '体用比和' },
}

const HEXAGRAM_NAMES = [
  ['乾为天', '天泽履', '天火同人', '天雷无妄', '天风姤', '天水讼', '天山遁', '天地否'],
  ['泽天夬', '兑为泽', '泽火革', '泽雷随', '泽风大过', '泽水困', '泽山咸', '泽地萃'],
  ['火天大有', '火泽睽', '离为火', '火雷噬嗑', '火风鼎', '火水未济', '火山旅', '火地晋'],
  ['雷天大壮', '雷泽归妹', '雷火丰', '震为雷', '雷风恒', '雷水解', '雷山小过', '雷地豫'],
  ['风天小畜', '风泽中孚', '风火家人', '风雷益', '巽为风', '风水涣', '风山渐', '风地观'],
  ['水天需', '水泽节', '水火既济', '水雷屯', '水风井', '坎为水', '水山蹇', '水地比'],
  ['山天大畜', '山泽损', '山火贲', '山雷颐', '山风蛊', '山水蒙', '艮为山', '山地剥'],
  ['地天泰', '地泽临', '地火明夷', '地雷复', '地风升', '地水师', '地山谦', '坤为地'],
]

export function buildMeihuaBoard({ datetime, topic, place, question } = {}, source = {}) {
  const seed = stableSeed([datetime, topic, place, question].filter(Boolean).join('|') || 'meihua')
  const upper = pickTrigram(seed)
  const lower = pickTrigram(seed >> 3)
  const mutualUpper = pickTrigram(seed >> 6)
  const mutualLower = pickTrigram(seed >> 9)
  const movingLine = (seed % 6) + 1
  const changedUpper = movingLine > 3 ? pickTrigram((seed + movingLine + 2) >> 2) : upper
  const changedLower = movingLine <= 3 ? pickTrigram((seed + movingLine + 5) >> 2) : lower
  const body = movingLine > 3 ? lower : upper
  const use = movingLine > 3 ? upper : lower
  const relation = ELEMENT_RELATION[body.element]?.[use.element] || '体用待辨'

  return normalizeMeihuaBoard({
    meta: {
      solar: datetime ? datetime.replace('T', ' ') : '当前起卦',
      lunar: source.meta?.lunar || '按所选时间换算农历、节气与时辰',
      topic: topic || '所问之事',
      place: place || '方位未定',
      method: source.meta?.method || '时间 / 数字 / 外应起卦',
    },
    original: makeHexagram(upper, lower, source.original),
    mutual: makeHexagram(mutualUpper, mutualLower, source.mutual),
    changed: makeHexagram(changedUpper, changedLower, source.changed),
    relation: {
      body: source.relation?.body || `${body.name}${body.nature}`,
      use: source.relation?.use || `${use.name}${use.nature}`,
      bodyElement: source.relation?.bodyElement || body.element,
      useElement: source.relation?.useElement || use.element,
      text: source.relation?.text || relation,
      movingLine: source.relation?.movingLine || `${movingLine}爻动`,
    },
    clues: [
      { label: '起课线索', value: question || '等待输入外应、数字或问题' },
      { label: '事件类型', value: topic || '未选择' },
      { label: '取象方向', value: `${upper.image} / ${lower.image}` },
      { label: '变化重点', value: movingLine > 3 ? '外部条件先变' : '内部基础先动' },
    ],
  })
}

export function normalizeMeihuaBoard(input = {}) {
  const fallback = buildStaticFallback()
  return {
    meta: { ...fallback.meta, ...(input.meta || {}) },
    original: normalizeHexagram(input.original, fallback.original),
    mutual: normalizeHexagram(input.mutual, fallback.mutual),
    changed: normalizeHexagram(input.changed, fallback.changed),
    relation: normalizeRelation(input.relation, fallback.relation),
    clues: Array.isArray(input.clues) && input.clues.length ? input.clues : fallback.clues,
  }
}

function buildStaticFallback() {
  const upper = TRIGRAMS[0]
  const lower = TRIGRAMS[0]
  return {
    meta: {
      solar: '当前起卦',
      lunar: '按所选时间换算农历、节气与时辰',
      topic: '所问之事',
      place: '方位未定',
      method: '时间 / 数字 / 外应起卦',
    },
    original: makeHexagram(upper, lower),
    mutual: makeHexagram(TRIGRAMS[5], TRIGRAMS[1]),
    changed: makeHexagram(TRIGRAMS[0], TRIGRAMS[4]),
    relation: {
      body: '乾天',
      use: '巽风',
      bodyElement: '金',
      useElement: '木',
      text: '体克用',
      movingLine: '五爻动',
    },
    clues: [
      { label: '起课线索', value: '等待输入外应、数字或问题' },
      { label: '事件类型', value: '未选择' },
      { label: '取象方向', value: '刚健 / 入微' },
      { label: '变化重点', value: '先蓄势，再行动' },
    ],
  }
}

function normalizeHexagram(value, fallback) {
  if (Array.isArray(value)) {
    const upper = findTrigram(value[1]) || fallback.upper
    const lower = findTrigram(value[2]) || fallback.lower
    return {
      label: value[0] || fallback.label,
      name: value[3] || hexagramName(upper, lower),
      upper,
      lower,
      note: value[4] || fallback.note,
    }
  }

  const upper = findTrigram(value?.upper?.name || value?.upper || value?.top) || fallback.upper
  const lower = findTrigram(value?.lower?.name || value?.lower || value?.bottom) || fallback.lower
  return {
    label: value?.label || fallback.label,
    name: value?.name || value?.hexagram || hexagramName(upper, lower),
    upper,
    lower,
    note: value?.note || value?.meaning || fallback.note,
  }
}

function normalizeRelation(value = {}, fallback) {
  const relation = { ...fallback, ...(value || {}) }
  return {
    ...relation,
    text: coerceText(relation.text, fallback.text),
    body: coerceText(relation.body, fallback.body),
    use: coerceText(relation.use, fallback.use),
    movingLine: coerceText(relation.movingLine, fallback.movingLine),
  }
}

function coerceText(value, fallback = '') {
  if (value === null || value === undefined || value === '') return fallback
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (typeof value.summary === 'string') return value.summary
  if (typeof value.name === 'string') return value.name
  if (typeof value.text === 'string') return value.text
  return fallback
}

function makeHexagram(upper, lower, override = {}) {
  return {
    label: override.label || '本卦',
    name: override.name || hexagramName(upper, lower),
    upper,
    lower,
    note: override.note || `${upper.nature}上${lower.nature}下，${upper.image}而${lower.image}`,
  }
}

function hexagramName(upper, lower) {
  const upperIndex = TRIGRAMS.findIndex((item) => item.name === upper.name)
  const lowerIndex = TRIGRAMS.findIndex((item) => item.name === lower.name)
  return HEXAGRAM_NAMES[Math.max(upperIndex, 0)]?.[Math.max(lowerIndex, 0)] || `${upper.nature}${lower.nature}之卦`
}

function pickTrigram(seed) {
  return TRIGRAMS[Math.abs(seed) % TRIGRAMS.length]
}

function findTrigram(value) {
  if (!value) return null
  const text = String(value)
  return TRIGRAMS.find((item) => text.includes(item.name) || text.includes(item.nature)) || null
}

function stableSeed(text) {
  let hash = 2166136261
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}
