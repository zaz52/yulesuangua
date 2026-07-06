const FALLBACK_CELLS = [
  ['巽四宫', '杜门', '天辅星', '九天', '乙', '丙', '东南'],
  ['离九宫', '景门', '天英星', '值符', '辛', '辛', '正南'],
  ['坤二宫', '死门', '天芮星', '腾蛇', '己', '己', '西南'],
  ['震三宫', '伤门', '天冲星', '太阴', '癸', '癸', '正东'],
  ['中五宫', '中宫', '所问之事', '值符', '戊', '戊', '中宫'],
  ['兑七宫', '惊门', '天柱星', '六合', '丁', '丁', '正西'],
  ['艮八宫', '生门', '天任星', '九地', '丙', '丙', '东北'],
  ['坎一宫', '休门', '天蓬星', '白虎', '庚', '庚', '正北'],
  ['乾六宫', '开门', '天心星', '玄武', '壬', '壬', '西北'],
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
      lunar: '甲辰年 四月十四 巳时',
      juShu: '阳遁三局',
      zhiFu: '天辅星',
      zhiShi: '开门',
      xunShou: '甲子戊',
      horse: '寅',
      empty: '戌亥',
    },
    cells: FALLBACK_CELLS.map((cell) => [...cell]),
  }
}

export function normalizeQimenBoard(input = {}) {
  const fallback = buildQimenFallbackBoard()
  const center = { ...fallback.center, ...(input.center || {}) }
  const meta = { ...fallback.meta, ...(input.meta || {}) }
  const rawCells = Array.isArray(input.cells) && input.cells.length ? input.cells : fallback.cells
  const cells = rawCells.slice(0, 9).map((cell, index) => normalizeQimenCell(cell, fallback.cells[index], index))

  return {
    center,
    meta,
    cells: cells.length === 9 ? cells : fallback.cells.map((cell, index) => normalizeQimenCell(cell, cell, index)),
  }
}

function normalizeQimenCell(cell, fallback, index) {
  if (Array.isArray(cell)) {
    return {
      key: cell[0]?.includes('中') ? 'center' : String(index),
      palace: cell[0] || fallback[0],
      gate: cell[1] || fallback[1],
      star: cell[2] || fallback[2],
      god: cell[3] || fallback[3],
      heavenStem: cell[4] || fallback[4],
      earthStem: cell[5] || fallback[5],
      direction: cell[6] || fallback[6],
      hidden: cell[7] || '',
    }
  }

  const palace = cell?.palace || cell?.gong || cell?.name || cell?.label || fallback[0]
  return {
    key: String(palace).includes('中') ? 'center' : String(index),
    palace,
    gate: cell?.gate || cell?.door || cell?.men || fallback[1],
    star: cell?.star || cell?.xing || cell?.nineStar || fallback[2],
    god: cell?.god || cell?.deity || cell?.shen || fallback[3],
    heavenStem: cell?.heavenStem || cell?.tianPan || cell?.stem || cell?.gan || fallback[4],
    earthStem: cell?.earthStem || cell?.diPan || cell?.branch || fallback[5],
    direction: cell?.direction || cell?.position || fallback[6],
    hidden: cell?.hidden || cell?.note || '',
  }
}
