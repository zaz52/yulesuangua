const DEFAULT_BAZI_COLUMNS = ['年柱', '月柱', '日柱', '时柱']
const DEFAULT_ZIWEI_PALACES = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '仆役', '官禄', '田宅', '福德', '父母']
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

export function normalizeBaziBoard(data = {}) {
  const rows = Array.isArray(data.rows) && data.rows.length ? data.rows : [
    ['天干', '年干', '月干', '日主', '时干'],
    ['地支', '年支', '月支', '日支', '时支'],
    ['藏干', '主气', '司令', '根气', '余气'],
    ['十神', '早年', '环境', '本人', '后续'],
    ['五行', '木火土金水', '旺衰', '日主', '补偏'],
    ['合冲刑害', '年支', '月日', '日时', '全局'],
  ]
  const columns = Array.isArray(data.columns) && data.columns.length ? data.columns : DEFAULT_BAZI_COLUMNS
  const fallbackPillars = columns.map((label, index) => ({
    key: ['year', 'month', 'day', 'hour'][index] || `pillar-${index}`,
    label,
    gan: rows.find((row) => row[0] === '天干')?.[index + 1] || '',
    zhi: rows.find((row) => row[0] === '地支')?.[index + 1] || '',
    ganZhi: rows.find((row) => row[0] === '干支')?.[index + 1] || '',
    tenGod: rows.find((row) => row[0] === '十神')?.[index + 1] || '',
    hiddenStems: splitValue(rows.find((row) => row[0] === '藏干')?.[index + 1]),
    hiddenTenGods: splitValue(rows.find((row) => row[0] === '藏干十神')?.[index + 1]),
    nayin: rows.find((row) => row[0] === '纳音')?.[index + 1] || '',
    lifeStage: rows.find((row) => row[0] === '长生')?.[index + 1] || '',
    shensha: splitValue(rows.find((row) => row[0] === '神煞')?.[index + 1]),
  }))
  return {
    columns,
    rows,
    pillars: Array.isArray(data.pillars) && data.pillars.length ? data.pillars : fallbackPillars,
    meta: {
      lunar: data.meta?.lunar || '',
      zodiac: data.meta?.zodiac || '',
      dayMaster: data.meta?.dayMaster || '',
      strength: data.meta?.strength || '',
      pattern: data.meta?.pattern || '',
      useful: data.meta?.useful || '',
      avoid: data.meta?.avoid || '',
      kongWang: data.meta?.kongWang || '',
      monthCommander: data.meta?.monthCommander || '',
    },
    elements: Array.isArray(data.elements) && data.elements.length ? data.elements : ['木', '火', '土', '金', '水'].map((name) => ({ name, value: 0, ratio: 20, state: '待定' })),
    advice: Array.isArray(data.advice) ? data.advice : [],
    highlights: Array.isArray(data.highlights) && data.highlights.length ? data.highlights : ['日主旺衰', '月令格局', '合冲刑害'],
  }
}

function splitValue(value) {
  if (Array.isArray(value)) return value
  return String(value || '').split(/[/、,，\s]+/).filter(Boolean)
}

export function normalizeZiweiBoard(data = {}) {
  const palaces = Array.isArray(data.palaces) && data.palaces.length ? data.palaces : DEFAULT_ZIWEI_PALACES.map((name, index) => ({
    name,
    branch: BRANCHES[index],
    star: ['紫微', '天机', '太阳', '武曲', '天同', '廉贞', '天府', '太阴', '贪狼', '巨门', '天相', '天梁'][index],
    minor: '辅曜待定',
    note: index === 0 ? '命宫' : '排盘参考',
    age: `${4 + index * 10}-${13 + index * 10}`,
  }))

  return {
    palaces: palaces.slice(0, 12).map((palace, index) => Array.isArray(palace) ? {
      name: palace[0] || DEFAULT_ZIWEI_PALACES[index],
      star: palace[1] || '主星待定',
      note: palace[2] || '排盘参考',
      branch: BRANCHES[index],
      minor: '辅曜待定',
      transforms: [],
      decadal: '',
      ages: '',
      changsheng12: '',
      heavenlyStem: '',
      isBodyPalace: false,
      isOriginalPalace: index === 0,
      age: '',
    } : {
      name: palace.name || palace.label || DEFAULT_ZIWEI_PALACES[index],
      branch: palace.branch || palace.earthlyBranch || BRANCHES[index],
      heavenlyStem: palace.heavenlyStem || '',
      star: palace.star || palace.mainStar || palace.majorStars?.[0]?.name || '主星待定',
      minor: palace.minor || palace.minorStar || palace.stars?.[0]?.name || '辅曜待定',
      adjective: palace.adjective || '',
      transforms: Array.isArray(palace.transforms) ? palace.transforms : [],
      decadal: palace.decadal || palace.age || palace.range || '',
      ages: palace.ages || '',
      changsheng12: palace.changsheng12 || '',
      boshi12: palace.boshi12 || '',
      jiangqian12: palace.jiangqian12 || '',
      suiqian12: palace.suiqian12 || '',
      isBodyPalace: Boolean(palace.isBodyPalace || String(palace.note || '').includes('身宫')),
      isOriginalPalace: Boolean(palace.isOriginalPalace || String(palace.note || '').includes('命宫')),
      note: palace.note || palace.description || '排盘参考',
      age: palace.age || palace.range || '',
    }),
    center: data.center || '命主信息待填',
    meta: {
      soul: data.meta?.soul || '命宫未定',
      body: data.meta?.body || '身宫待定',
      fiveElementsClass: data.meta?.fiveElementsClass || '五行局待定',
      zodiac: data.meta?.zodiac || '',
      lunarDate: data.meta?.lunarDate || '',
    },
  }
}

export function normalizeLiuyaoBoard(data = {}) {
  const fallbackLines = [
    { position: '上爻', yaoType: '阴爻', sixRelative: '父母', role: '应', sixGod: '青龙', najia: '戌土', wuxing: '土', change: '', note: '收束与外部' },
    { position: '五爻', yaoType: '阳爻', sixRelative: '官鬼', role: '', sixGod: '朱雀', najia: '申金', wuxing: '金', change: '', note: '主事压力' },
    { position: '四爻', yaoType: '阴爻', sixRelative: '妻财', role: '动', sixGod: '勾陈', najia: '午火', wuxing: '火', change: '变爻', note: '资源变化' },
    { position: '三爻', yaoType: '阳爻', sixRelative: '兄弟', role: '', sixGod: '腾蛇', najia: '辰土', wuxing: '土', change: '', note: '竞争与阻力' },
    { position: '二爻', yaoType: '阴爻', sixRelative: '子孙', role: '世', sixGod: '白虎', najia: '寅木', wuxing: '木', change: '', note: '自身落点' },
    { position: '初爻', yaoType: '阳爻', sixRelative: '父母', role: '', sixGod: '玄武', najia: '子水', wuxing: '水', change: '', note: '事情起因' },
  ]
  return {
    meta: {
      originalName: data.meta?.originalName || '本卦待定',
      changedName: data.meta?.changedName || '',
      interName: data.meta?.interName || '',
      palace: data.meta?.palace || '世应用神',
      specialPattern: data.meta?.specialPattern || '以世应、用神、动爻为判断核心',
      voidBranches: Array.isArray(data.meta?.voidBranches) ? data.meta.voidBranches.join('') : data.meta?.voidBranches || '',
      usefulGod: data.meta?.usefulGod || '用神待定',
    },
    lines: normalizeRows(data.lines, fallbackLines).slice(0, 6).map((line, index) => normalizeLiuyaoLine(line, fallbackLines[index])),
  }
}

function normalizeLiuyaoLine(line, fallback) {
  if (Array.isArray(line)) {
    return {
      position: line[0] || fallback.position,
      yaoType: line[1] || fallback.yaoType,
      sixRelative: line[2] || fallback.sixRelative,
      role: line[3] || '',
      note: line[4] || fallback.note,
      sixGod: line[5] || fallback.sixGod,
      najia: line[6] || fallback.najia,
      wuxing: line[7] || fallback.wuxing,
      change: line[8] || '',
      flags: line[3] ? [line[3]] : [],
    }
  }
  const flags = [
    line.role,
    line.isWorld ? '世' : '',
    line.isResponse ? '应' : '',
    line.isChanging ? '动' : '',
    line.isVoid ? '空亡' : '',
    line.isDayBreak ? '日破' : '',
    line.isMonthBreak ? '月破' : '',
  ].filter(Boolean)
  return {
    position: line.position || fallback.position,
    yaoType: line.yaoType || fallback.yaoType,
    sixRelative: line.sixRelative || fallback.sixRelative,
    sixGod: line.sixGod || fallback.sixGod,
    najia: line.najia || line.najiaDizhi || fallback.najia,
    wuxing: line.wuxing || fallback.wuxing,
    role: flags.includes('世') ? '世' : flags.includes('应') ? '应' : flags.includes('动') ? '动' : '',
    change: line.change || line.changeType || fallback.change || '',
    changedYao: line.changedYao || null,
    note: line.note || line.seasonState || fallback.note,
    flags: [...new Set(flags)],
  }
}

export function normalizeDaliurenBoard(data = {}) {
  const items = normalizeRows(data.items, [
    ['四课', '日干 / 日支 / 课体 / 发用'],
    ['三传', '初传 -> 中传 -> 末传'],
    ['神将', '贵人、六合、勾陈、天空'],
    ['判断', '复杂事件'],
  ])
  return {
    branches: data.branches || BRANCHES,
    gods: data.gods || ['贵人', '腾蛇', '朱雀', '六合', '勾陈', '青龙', '天空', '白虎', '太常', '玄武', '太阴', '天后'],
    heavenlyPlate: Array.isArray(data.heavenlyPlate) && data.heavenlyPlate.length ? data.heavenlyPlate : (data.branches || BRANCHES).map((branch, index) => ({
      branch,
      sky: (data.branches || BRANCHES)[index],
      god: (data.gods || ['贵人', '腾蛇', '朱雀', '六合', '勾陈', '青龙', '天空', '白虎', '太常', '玄武', '太阴', '天后'])[index],
      note: '',
      relation: '',
    })),
    fourLessons: Array.isArray(data.fourLessons) && data.fourLessons.length ? data.fourLessons : [
      { label: '一课', stem: '日干', branch: '上神', god: '贵人', role: '日干上神' },
      { label: '二课', stem: '日干', branch: '阴神', god: '六合', role: '日干阴神' },
      { label: '三课', stem: '日支', branch: '上神', god: '青龙', role: '日支上神' },
      { label: '四课', stem: '日支', branch: '阴神', god: '白虎', role: '日支阴神' },
    ],
    threePasses: Array.isArray(data.threePasses) && data.threePasses.length ? data.threePasses : String(items[1]?.[1] || '初传 -> 中传 -> 末传').split('->').map((item, index) => ({
      label: ['初传', '中传', '末传'][index] || '传',
      branch: item.trim(),
      god: ['贵人', '六合', '青龙'][index] || '神将',
      relation: ['发端', '过程', '归结'][index] || '判断',
    })),
    passes: data.passes || String(items[1]?.[1] || '初传 -> 中传 -> 末传').split('->').map((item) => item.trim()),
    meta: {
      time: data.meta?.time || data.center?.time || '占时',
      topic: data.meta?.topic || data.center?.topic || items[3]?.[1] || '复杂事件',
      day: data.meta?.day || data.center?.day || '日辰',
      hour: data.meta?.hour || data.center?.hour || '占时',
      monthGeneral: data.meta?.monthGeneral || data.center?.monthGeneral || '月将',
      dayStem: data.meta?.dayStem || '',
      dayBranch: data.meta?.dayBranch || '',
      hourBranch: data.meta?.hourBranch || '',
      lessonType: data.meta?.lessonType || data.center?.lessonType || '课体待定',
      useBranch: data.meta?.useBranch || '',
      useGod: data.meta?.useGod || '',
    },
    center: data.center || { time: data.meta?.time || '占时', day: data.meta?.day || '日辰', hour: data.meta?.hour || '占时', monthGeneral: data.meta?.monthGeneral || '月将', xun: '甲戌', zhiFu: data.meta?.useGod || '贵人', zhiShi: data.meta?.hourBranch || '子', lessonType: data.meta?.lessonType || '课体待定', topic: data.meta?.topic || items[3]?.[1] },
    items,
  }
}

export function normalizeXiaoliurenBoard(data = {}) {
  const fallbackItems = normalizeRows(data.items, [
    ['大安', '稳定可守'],
    ['留连', '拖延反复'],
    ['速喜', '消息临近'],
    ['赤口', '口舌谨慎'],
    ['小吉', '小成可进'],
    ['空亡', '暂缓复核'],
  ]).slice(0, 6)
  const fallbackPalaces = ['大安', '留连', '速喜', '赤口', '小吉', '空亡'].map((name, index) => ({
    name,
    index,
    element: ['木', '土', '火', '金', '水', '土'][index],
    fortune: ['吉', '平', '吉', '凶', '吉', '凶'][index],
    tendency: fallbackItems[index]?.[1] || '待定',
    advice: fallbackItems[index]?.[1] || '待定',
    direction: ['东', '中', '南', '西', '北', '中'][index],
    shenSha: ['青龙', '勾陈', '朱雀', '白虎', '玄武', '天空'][index],
    isPrimary: index === 0,
    isInSequence: index < 3,
  }))
  return {
    meta: {
      method: data.meta?.method || '时间起课',
      time: data.meta?.time || '',
      lunar: data.meta?.lunar || '',
      hour: data.meta?.hour || '',
      primary: data.meta?.primary || fallbackPalaces.find((item) => item.isPrimary)?.name || '待定',
      tendency: data.meta?.tendency || '',
      fortune: data.meta?.fortune || '',
      direction: data.meta?.direction || '',
      timing: data.meta?.timing || '',
      shenSha: data.meta?.shenSha || '',
      bodyPart: data.meta?.bodyPart || '',
      relation: data.meta?.relation || '',
      questionHint: data.meta?.questionHint || '',
    },
    palaces: Array.isArray(data.palaces) && data.palaces.length ? data.palaces : fallbackPalaces,
    stages: Array.isArray(data.stages) && data.stages.length ? data.stages : [
      { label: '起因', name: fallbackItems[0]?.[1] || '待定', state: '', tendency: '' },
      { label: '过程', name: fallbackItems[1]?.[1] || '待定', state: '', tendency: '' },
      { label: '结果', name: fallbackItems[2]?.[1] || '待定', state: '', tendency: '' },
    ],
    items: fallbackItems,
  }
}

export function normalizeFengshuiBoard(data = {}) {
  const fallbackCells = [
    ['东南', '文昌', '书桌 / 学习'], ['正南', '名声', '光线 / 火气'], ['西南', '坤位', '关系 / 稳定'],
    ['正东', '生发', '入口动线'], ['中宫', '宅心', '方位待定'], ['正西', '收敛', '金属 / 口舌'],
    ['东北', '止息', '储物 / 静区'], ['正北', '事业', '水气 / 流动'], ['西北', '乾位', '贵人 / 主位'],
  ]
  const cells = normalizeRows(data.cells, fallbackCells).slice(0, 9).map((cell) => Array.isArray(cell) ? {
    direction: cell[0],
    palace: cell[1],
    theme: cell[2],
    element: '',
    meaning: cell[2],
    score: 0,
    level: cell[0] === '中宫' ? '宅心' : '平衡',
    features: [],
    featureDetails: [],
    risks: [],
    opportunities: [],
    priority: cell[0] === '中宫' ? '保持清爽' : '保持平衡',
    advice: '保持整洁、通风和动线顺畅。',
  } : {
    direction: cell.direction || cell.name || '方位',
    palace: cell.palace || cell.label || '宫位',
    theme: cell.theme || cell.value || '布局',
    element: cell.element || '',
    meaning: cell.meaning || cell.note || '',
    score: Number.isFinite(cell.score) ? cell.score : 0,
    level: cell.level || '平衡',
    features: Array.isArray(cell.features) ? cell.features : [],
    featureDetails: Array.isArray(cell.featureDetails) ? cell.featureDetails : [],
    risks: Array.isArray(cell.risks) ? cell.risks : [],
    opportunities: Array.isArray(cell.opportunities) ? cell.opportunities : [],
    priority: cell.priority || (cell.level === '需调' ? '优先调整' : cell.level === '宜用' ? '可重点使用' : '保持清爽'),
    advice: cell.advice || '保持整洁、通风和动线顺畅。',
  })
  return {
    kind: data.kind || '住宅',
    direction: data.direction || '不确定',
    layout: data.layout || '',
    cells,
    summary: data.summary || { auspicious: [], caution: [], detected: [], risks: [], opportunities: [] },
    adjustments: Array.isArray(data.adjustments) && data.adjustments.length ? data.adjustments : ['保持入口、中宫和主要动线清爽。'],
  }
}

export function normalizeTarotBoard(data = {}) {
  const fallbackCards = [
    { position: '??', name: '???', orientation: '??', type: '????', suit: '??', element: '?', keywords: ['??', '??', '??'], meaning: '????????????????', advice: '??????????????' },
    { position: '??', name: '??', orientation: '??', type: '????', suit: '', element: '?', keywords: ['??', '??', '??'], meaning: '???????????????', advice: '???????????????' },
    { position: '??', name: '???', orientation: '??', type: '????', suit: '??', element: '?', keywords: ['??', '??', '??'], meaning: '????????????', advice: '????????????' },
  ]
  const cards = normalizeRows(data.cards, fallbackCards).map((card, index) => normalizeTarotCard(card, index))
  return {
    spread: data.spread || '???',
    spreadType: data.spreadType || inferTarotSpreadType(cards),
    topic: data.topic || '',
    context: data.context || '',
    cards,
    layout: data.layout || { kind: inferTarotSpreadType(cards), columns: Math.min(Math.max(cards.length, 1), 3), positions: cards.map((card) => ({ id: card.id, position: card.position })) },
    summary: data.summary || buildTarotSummary(cards),
  }
}

function normalizeRows(value, fallback) {
  return Array.isArray(value) && value.length ? value : fallback
}

function normalizeTarotCard(card, index) {
  if (Array.isArray(card)) {
    const nameText = String(card[1] || '未知牌')
    const isReversed = /逆位/.test(nameText)
    const name = nameText.replace(/\s*(正位|逆位)\s*/g, '').trim() || '未知牌'
    const suit = inferTarotSuit(name)
    return {
      id: `${index + 1}-${card[0] || '牌位'}-${name}`,
      index: index + 1,
      position: card[0] || `牌位${index + 1}`,
      name,
      orientation: isReversed ? '逆位' : '正位',
      isReversed,
      type: card[2] || (suit ? '小阿卡纳' : '大阿卡纳'),
      suit,
      element: inferTarotElement(suit, name),
      keywords: tarotKeywords(name, suit, isReversed),
      meaning: card[3] || card[2] || `${name}落在${card[0] || '该牌位'}，提示需要结合现实背景观察。`,
      advice: card[4] || '把牌面提示转化为一个可验证的小动作。',
    }
  }
  const suit = card.suit || inferTarotSuit(card.name)
  const isReversed = Boolean(card.isReversed || card.orientation === '逆位')
  return {
    id: card.id || `${index + 1}-${card.position || '牌位'}-${card.name || '未知牌'}`,
    index: card.index || index + 1,
    position: card.position || `牌位${index + 1}`,
    name: card.name || '未知牌',
    orientation: card.orientation || (isReversed ? '逆位' : '正位'),
    isReversed,
    type: card.type || (suit ? '小阿卡纳' : '大阿卡纳'),
    suit,
    number: card.number ?? '',
    element: card.element || inferTarotElement(suit, card.name),
    keywords: Array.isArray(card.keywords) && card.keywords.length ? card.keywords : tarotKeywords(card.name, suit, isReversed),
    meaning: card.meaning || `${card.name || '该牌'}落在${card.position || '该牌位'}，提示需要结合现实背景观察。`,
    advice: card.advice || '把牌面提示转化为一个可验证的小动作。',
  }
}

function inferTarotSpreadType(cards) {
  const positions = cards.map((card) => card.position).join(' ')
  if (/选择A|选择B/.test(positions)) return 'decision'
  if (/对方|关系/.test(positions)) return 'love'
  if (cards.length === 1) return 'single'
  return 'three'
}

function buildTarotSummary(cards) {
  const reversedCount = cards.filter((card) => card.isReversed).length
  const suitCounts = cards.reduce((acc, card) => {
    const key = card.suit || card.type || '??'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  return {
    dominantSuit: Object.entries(suitCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '综合',
    reversedCount,
    cardCount: cards.length,
    tendency: reversedCount >= Math.ceil(cards.length / 2) ? '先复盘再行动' : '可小步推进',
    focus: '按牌位顺序观察当前问题的节奏、阻力和可行动作。',
  }
}

function inferTarotSuit(name = '') {
  if (name.includes('权杖')) return '权杖'
  if (name.includes('圣杯')) return '圣杯'
  if (name.includes('宝剑')) return '宝剑'
  if (name.includes('钱币') || name.includes('星币')) return '星币'
  return ''
}

function inferTarotElement(suit, name = '') {
  const map = { 权杖: '火', 圣杯: '水', 宝剑: '风', 钱币: '土', 星币: '土' }
  if (map[suit]) return map[suit]
  if (/太阳|力量|皇帝|魔术师/.test(name)) return '火'
  if (/女祭司|月亮|星星|节制/.test(name)) return '水'
  if (/正义|审判|命运之轮|愚者/.test(name)) return '风'
  if (/女皇|教皇|隐士|世界/.test(name)) return '土'
  return '灵性'
}

function tarotKeywords(name = '', suit = '', isReversed = false) {
  const base = {
    权杖: ['行动', '热情', '推进'],
    圣杯: ['情绪', '关系', '感受'],
    宝剑: ['判断', '沟通', '边界'],
    钱币: ['资源', '现实', '稳定'],
    星币: ['资源', '现实', '稳定'],
  }[suit] || ['转折', '觉察', '选择']
  return [...base, isReversed ? '复盘' : '顺势'].slice(0, 4)
}
