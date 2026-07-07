const FALLBACK_CELLS = [
  { palace: '巽四宫', direction: '东南', element: '木', gate: '杜门', star: '天辅', god: '九天', heavenStem: '乙', earthStem: '己', hidden: '文书', marks: [] },
  { palace: '离九宫', direction: '正南', element: '火', gate: '景门', star: '天英', god: '值符', heavenStem: '丙', earthStem: '丙', hidden: '名声', marks: ['值符'] },
  { palace: '坤二宫', direction: '西南', element: '土', gate: '死门', star: '天芮', god: '螣蛇', heavenStem: '己', earthStem: '辛', hidden: '阻滞', marks: [] },
  { palace: '震三宫', direction: '正东', element: '木', gate: '伤门', star: '天冲', god: '太阴', heavenStem: '癸', earthStem: '乙', hidden: '行动', marks: [] },
  { palace: '中五宫', direction: '中宫', element: '土', gate: '中宫', star: '所问核心', god: '值符', heavenStem: '戊', earthStem: '戊', hidden: '寄坤', marks: ['核心'] },
  { palace: '兑七宫', direction: '正西', element: '金', gate: '惊门', star: '天柱', god: '六合', heavenStem: '丁', earthStem: '庚', hidden: '口舌', marks: [] },
  { palace: '艮八宫', direction: '东北', element: '土', gate: '生门', star: '天任', god: '九地', heavenStem: '壬', earthStem: '癸', hidden: '蓄势', marks: [] },
  { palace: '坎一宫', direction: '正北', element: '水', gate: '休门', star: '天蓬', god: '白虎', heavenStem: '庚', earthStem: '壬', hidden: '潜藏', marks: [] },
  { palace: '乾六宫', direction: '西北', element: '金', gate: '开门', star: '天心', god: '玄武', heavenStem: '辛', earthStem: '丁', hidden: '机会', marks: ['值使'] },
]

export function buildQimenFallbackBoard({ datetime, topic, place, today } = {}) {
  return {
    center: {
      time: datetime ? datetime.replace('T', ' ') : '当前起局',
      topic: topic || '所问之事',
      place: place || '方位待定',
    },
    meta: {
      solar: datetime ? datetime.replace('T', ' ') : today || '当前时间',
      lunar: '按起课时间换算',
      juShu: '阳遁三局',
      zhiFu: '天英',
      zhiShi: '开门',
      xunShou: '甲子戊',
      horse: '寅',
      empty: '戌亥',
      patternTags: [],
    },
    cells: FALLBACK_CELLS.map((cell) => ({ ...cell })),
  }
}

export function normalizeQimenBoard(input = {}) {
  const fallback = buildQimenFallbackBoard()
  const center = { ...fallback.center, ...(input.center || {}) }
  const meta = { ...fallback.meta, ...(input.meta || {}) }
  const rawCells = Array.isArray(input.cells) && input.cells.length ? input.cells : fallback.cells
  const cells = rawCells.slice(0, 9).map((cell, index) => normalizeQimenCell(cell, fallback.cells[index], index, meta))

  return {
    center,
    meta,
    cells: cells.length === 9 ? cells : fallback.cells.map((cell, index) => normalizeQimenCell(cell, cell, index, meta)),
  }
}

function normalizeQimenCell(cell, fallback, index, meta) {
  if (Array.isArray(cell)) {
    return normalizeQimenCell({
      palace: cell[0],
      gate: cell[1],
      star: cell[2],
      god: cell[3],
      heavenStem: cell[4],
      earthStem: cell[5],
      direction: cell[6],
      hidden: cell[7],
    }, fallback, index, meta)
  }

  const palace = cell?.palace || cell?.gong || cell?.name || cell?.label || fallback.palace
  const gate = cell?.gate || cell?.door || cell?.men || fallback.gate
  const star = cell?.star || cell?.xing || cell?.nineStar || fallback.star
  const god = cell?.god || cell?.deity || cell?.shen || fallback.god
  const heavenStem = valueText(cell?.heavenStem || cell?.tianPanStem || cell?.tianPan?.stem || cell?.stem || cell?.gan || fallback.heavenStem)
  const earthStem = valueText(cell?.earthStem || cell?.diPanStem || cell?.diPan?.stem || cell?.branch || fallback.earthStem)
  const direction = cell?.direction || cell?.position || fallback.direction
  const marks = normalizeMarks(cell, { gate, star, god, palace, direction }, meta)

  return {
    key: String(palace).includes('中') ? 'center' : String(index),
    palace,
    direction,
    element: cell?.element || fallback.element || '',
    gate,
    star,
    god,
    heavenStem,
    earthStem,
    hidden: cell?.hidden || cell?.note || fallback.hidden || '',
    void: Boolean(cell?.void || cell?.isVoid || marks.includes('空亡')),
    horse: Boolean(cell?.horse || cell?.isHorse || marks.includes('马星')),
    zhiFu: Boolean(cell?.zhiFu || marks.includes('值符')),
    zhiShi: Boolean(cell?.zhiShi || marks.includes('值使')),
    marks,
  }
}

function normalizeMarks(cell = {}, values = {}, meta = {}) {
  const source = Array.isArray(cell.marks) ? [...cell.marks] : []
  if (values.star && meta.zhiFu && String(meta.zhiFu).includes(values.star.replace('星', ''))) source.push('值符')
  if (values.gate && meta.zhiShi && String(meta.zhiShi).includes(values.gate.replace('门', ''))) source.push('值使')
  if (meta.empty && [values.palace, values.direction, cell.earthStem, cell.heavenStem].some((item) => item && String(meta.empty).includes(String(item).slice(0, 1)))) source.push('空亡')
  if (meta.horse && [values.palace, values.direction, cell.earthStem, cell.heavenStem].some((item) => item && String(item).includes(meta.horse))) source.push('马星')
  if (cell.hidden) source.push(cell.hidden)
  return [...new Set(source.filter(Boolean))].slice(0, 4)
}

function valueText(value, fallback = '—') {
  if (value === null || value === undefined || value === '') return fallback
  if (typeof value === 'object') return value.stem || value.name || value.value || fallback
  return String(value)
}
