const DEFAULT_BAZI_COLUMNS = ['年柱', '月柱', '日柱', '时柱']
const DEFAULT_ZIWEI_PALACES = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '仆役', '官禄', '田宅', '福德', '父母']
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

export function normalizeBaziBoard(data = {}) {
  return {
    columns: Array.isArray(data.columns) && data.columns.length ? data.columns : DEFAULT_BAZI_COLUMNS,
    rows: Array.isArray(data.rows) && data.rows.length ? data.rows : [
      ['天干', '年干', '月干', '日主', '时干'],
      ['地支', '年支', '月支', '日支', '时支'],
      ['藏干', '主气', '司令', '根气', '余气'],
      ['十神', '早年', '环境', '本人', '后续'],
      ['五行', '木火土金水', '旺衰', '日主', '补偏'],
      ['合冲刑害', '年支', '月日', '日时', '全局'],
    ],
    highlights: Array.isArray(data.highlights) && data.highlights.length ? data.highlights : ['日主旺衰', '月令格局', '合冲刑害'],
  }
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
      age: '',
    } : {
      name: palace.name || palace.label || DEFAULT_ZIWEI_PALACES[index],
      branch: palace.branch || palace.earthlyBranch || BRANCHES[index],
      star: palace.star || palace.mainStar || palace.majorStars?.[0]?.name || '主星待定',
      minor: palace.minor || palace.minorStar || palace.stars?.[0]?.name || '辅曜待定',
      note: palace.note || palace.description || '排盘参考',
      age: palace.age || palace.range || '',
    }),
    center: data.center || '命主信息待填',
    meta: {
      soul: data.meta?.soul || '命宫未定',
      body: data.meta?.body || '身宫待定',
      fiveElementsClass: data.meta?.fiveElementsClass || '五行局待定',
    },
  }
}

export function normalizeLiuyaoBoard(data = {}) {
  return {
    meta: {
      originalName: data.meta?.originalName || '本卦待定',
      changedName: data.meta?.changedName || '',
      interName: data.meta?.interName || '',
      palace: data.meta?.palace || '世应用神',
      specialPattern: data.meta?.specialPattern || '以世应、用神、动爻为判断核心',
    },
    lines: normalizeRows(data.lines, [
      ['上爻', '阴爻', '父母', '应', '收束与外部'],
      ['五爻', '阳爻', '官鬼', '', '主事压力'],
      ['四爻', '阴爻', '妻财', '动', '资源变化'],
      ['三爻', '阳爻', '兄弟', '', '竞争与阻力'],
      ['二爻', '阴爻', '子孙', '世', '自身落点'],
      ['初爻', '阳爻', '父母', '', '事情起因'],
    ]).slice(0, 6),
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
    heavenlyPlate: Array.isArray(data.heavenlyPlate) && data.heavenlyPlate.length ? data.heavenlyPlate : [],
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
    center: data.center || { time: '占时', day: '日辰', hour: '占时', monthGeneral: '月将', xun: '甲戌', zhiFu: '贵人', zhiShi: '子', lessonType: '课体待定' },
    items,
  }
}

export function normalizeXiaoliurenBoard(data = {}) {
  return {
    items: normalizeRows(data.items, [
      ['大安', '稳定可守'],
      ['留连', '拖延反复'],
      ['速喜', '消息临近'],
      ['赤口', '口舌谨慎'],
      ['小吉', '小成可进'],
      ['空亡', '暂缓复核'],
    ]).slice(0, 6),
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
    advice: cell.advice || '保持整洁、通风和动线顺畅。',
  })
  return {
    kind: data.kind || '住宅',
    direction: data.direction || '不确定',
    layout: data.layout || '',
    cells,
    summary: data.summary || { auspicious: [], caution: [], detected: [] },
    adjustments: Array.isArray(data.adjustments) && data.adjustments.length ? data.adjustments : ['保持入口、中宫和主要动线清爽。'],
  }
}

export function normalizeTarotBoard(data = {}) {
  return {
    spread: data.spread || '三牌阵',
    cards: normalizeRows(data.cards, [
      ['过去', '权杖二', '选择已经出现'],
      ['现在', '节制', '需要重新配比资源'],
      ['建议', '星币八', '把注意力放回可执行步骤'],
    ]),
  }
}

function normalizeRows(value, fallback) {
  return Array.isArray(value) && value.length ? value : fallback
}
