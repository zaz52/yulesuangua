const NETLIFY_API_BASE = 'https://suanguan.netlify.app/api'

import { baziCalculator } from 'mingyu-core/bazi'
import { generateLiuyao } from 'mingyu-core/divination/liuyao'
import { generateMeihua } from 'mingyu-core/divination/meihua'
import { generateQimen } from 'mingyu-core/divination/qimen'
import { generateXiaoliuren } from 'mingyu-core/divination/xiaoliuren'
import { drawSpreadCards } from 'mingyu-core/divination/tarot'
import { buildAstrolabeFromInput } from 'mingyu-core/ziwei/iztro'

const extendedSkills = [
  { id: 'bazi', name: '四柱八字', description: '通过出生时间排出四柱八字，分析命理节奏与阶段重点。', icon: '命' },
  { id: 'ziwei', name: '紫微斗数', description: '围绕命宫、身宫、十二宫位和主星结构做综合命盘解读。', icon: '紫' },
  { id: 'qimen', name: '奇门遁甲', description: '按时间与问题排盘，辅助观察时机、方位与行动策略。', icon: '门' },
  { id: 'liuyao', name: '六爻解卦', description: '围绕动爻、变卦、世应、用神和六亲关系做结构化判断。', icon: '爻' },
  { id: 'meihua', name: '梅花易数', description: '按时间、数字、外应和所见之象观察体用生克与趋势。', icon: '梅' },
  { id: 'daliuren', name: '大六壬', description: '以三传四课、神将和事件背景整理复杂问题脉络。', icon: '壬' },
  { id: 'xiaoliuren', name: '小六壬', description: '使用大安、留连、速喜等轻量结构进行快速问事。', icon: '速' },
  { id: 'yinyuan', name: '姻缘测算', description: '围绕关系状态、相处模式、桃花机缘与长期稳定性解读。', icon: '缘' },
  { id: 'hehun', name: '合婚配对', description: '参考生肖、生日、关系阶段和相处模式做娱乐型合婚提示。', icon: '合' },
  { id: 'fojiao', name: '佛学开示', description: '以经典智慧回应困惑，提供心性整理与行动提醒。', icon: '禅' },
  { id: 'fengshui', name: '风水阳宅', description: '围绕户型、朝向、床位、桌位和动线做趣味空间建议。', icon: '宅' },
  { id: 'daily-fortune', name: '每日运势', description: '生成今日行动提醒、情绪节奏、桌面风水和轻量日运。', icon: '运' },
  { id: 'tarot', name: '塔罗牌阵', description: '用单牌、三牌和选择牌阵辅助多角度思考。', icon: '塔' },
]

const skillProxyMap = {
  ziwei: 'bazi',
  liuyao: 'qimen',
  meihua: 'qimen',
  daliuren: 'qimen',
  xiaoliuren: 'qimen',
  hehun: 'yinyuan',
  fengshui: 'qimen',
  'daily-fortune': 'qimen',
  tarot: 'fojiao',
}

const skillDirect = new Set(['bazi', 'yinyuan', 'fojiao', 'qimen'])

const skillInstructions = {
  ziwei: '请以紫微斗数文化娱乐视角回答，重点使用命宫、身宫、十二宫位、主星组合、事业宫、财帛宫、迁移宫、夫妻宫等结构；不要声称真实排盘绝对准确。',
  liuyao: '请以六爻解卦文化娱乐视角回答，重点使用本卦、变卦、动爻、世应、用神、六亲、旺衰和应期等结构。',
  meihua: '请以梅花易数文化娱乐视角回答，重点使用上卦、下卦、体卦、用卦、互卦、变卦、体用生克、外应和趋势。',
  daliuren: '请以大六壬文化娱乐视角回答，重点使用四课、三传、天将、月将、占时、来意和事件脉络，不要声称真实课盘绝对准确。',
  xiaoliuren: '请以小六壬快速问事文化娱乐视角回答，重点使用大安、留连、速喜、赤口、小吉、空亡等轻量判断。',
  hehun: '请以合婚配对文化娱乐视角回答，重点使用双方生日、生肖、关系阶段、沟通模式、长期磨合点和现实建议。',
  fengshui: '请以易经风水和阳宅布局文化娱乐视角回答，重点使用朝向、门窗、床位、桌位、动线、明堂、靠山和收纳秩序。',
  'daily-fortune': '请以每日运势轻娱乐视角回答，输出今日关键词、宜忌、行动提醒、情绪节奏、桌面风水建议和理性边界。',
  tarot: '请以塔罗牌阵文化娱乐视角回答，按照用户选择的牌阵模拟抽牌，并给出牌面象征、正逆位倾向、建议和现实边界。',
}

export async function onRequest(context) {
  const path = normalizePath(context.params.path)

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() })
  }

  if (context.request.method === 'GET' && path === 'divine/skills') {
    return json({ skills: extendedSkills })
  }

  if (context.request.method === 'POST' && path === 'metaphysics/calculate') {
    return calculateMetaphysics(context)
  }

  const divineMatch = path.match(/^divine\/([a-z-]+)$/)
  if (context.request.method === 'POST' && divineMatch) {
    return proxyDivine(context, divineMatch[1])
  }

  return proxyToNetlify(context, path)
}

async function proxyDivine(context, requestedSkill) {
  const targetSkill = skillDirect.has(requestedSkill) ? requestedSkill : skillProxyMap[requestedSkill]
  if (!targetSkill) {
    return json({ error: '未知测算类型' }, 404)
  }

  const payload = await context.request.json().catch(() => ({}))
  if (!skillDirect.has(requestedSkill)) {
    const instruction = skillInstructions[requestedSkill] || ''
    payload.message = `用户选择的术法：${requestedSkill}。\n${instruction}\n\n用户输入：${payload.message || ''}`
  }

  return fetch(`${NETLIFY_API_BASE}/divine/${targetSkill}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

async function calculateMetaphysics(context) {
  const payload = await context.request.json().catch(() => ({}))
  const skill = payload.skill || 'bazi'

  try {
    const calculators = {
      bazi: calculateBaziBoard,
      ziwei: calculateZiweiBoard,
      qimen: calculateQimenBoard,
      liuyao: calculateLiuyaoBoard,
      meihua: calculateMeihuaBoard,
      xiaoliuren: calculateXiaoliurenBoard,
      tarot: calculateTarotBoard,
    }
    const calculator = calculators[skill]
    if (!calculator) {
      return json({ ok: false, skill, source: 'mingyu-core', error: '此术法暂未接入真实排盘算法' }, 422)
    }

    return json({ ok: true, skill, source: 'mingyu-core@0.1.8', data: await calculator(payload) })
  } catch (error) {
    return json({ ok: false, skill, source: 'mingyu-core@0.1.8', error: error.message || '排盘失败' }, 500)
  }
}

async function calculateZiweiBoard(payload) {
  const profile = payload.profile || {}
  const astrolabe = await buildAstrolabeFromInput({
    name: profile.name || '命主',
    dateType: 'lunar',
    birthDate: profile.birthDate,
    birthTimeIndex: shichenToIndex(profile.shichen),
    gender: profile.gender === '女' ? '女' : '男',
    isLeapMonth: Boolean(profile.isLeapMonth),
  })
  const palaces = (astrolabe.palaces || []).map((palace) => ({
    name: palace.name || '宫位',
    star: [...(palace.majorStars || []), ...(palace.minorStars || [])].map((star) => star.name).slice(0, 3).join(' / ') || '无主星',
    note: [
      palace.isBodyPalace ? '身宫' : '',
      palace.isOriginalPalace ? '命宫' : '',
      palace.earthlyBranch || '',
      palace.changsheng12 || '',
    ].filter(Boolean).join(' · ') || '十二宫参考',
  }))

  return {
    palaces,
    center: `${profile.name || '命主'} · ${profile.gender || '未填'} · ${astrolabe.time || profile.shichen || '时辰'}`,
    meta: {
      soul: astrolabe.soul,
      body: astrolabe.body,
      fiveElementsClass: astrolabe.fiveElementsClass,
      zodiac: astrolabe.zodiac,
      lunarDate: astrolabe.lunarDate,
    },
    raw: compactRaw(astrolabe),
  }
}

function calculateBaziBoard(payload) {
  const profile = payload.profile || {}
  const date = parseDateParts(profile.birthDate)
  const gender = profile.gender === '女' ? 'female' : 'male'
  const result = baziCalculator.calculateBazi({
    year: date.year,
    month: date.month,
    day: date.day,
    timeIndex: shichenToIndex(profile.shichen),
    gender,
    isLunar: true,
    isLeapMonth: Boolean(profile.isLeapMonth),
  })
  const p = result.pillars || {}
  const hidden = result.hiddenStems || {}
  const hiddenTenGods = result.hiddenTenGods || {}
  const tenGods = result.tenGods || {}
  const nayin = result.nayin || {}
  const lifeStages = result.pillarLifeStages || result.lifeStages || {}
  const shensha = result.shensha || {}
  const order = ['year', 'month', 'day', 'hour']

  return {
    columns: ['年柱', '月柱', '日柱', '时柱'],
    rows: [
      ['天干', ...order.map((key) => p[key]?.gan || '待定')],
      ['地支', ...order.map((key) => p[key]?.zhi || '待定')],
      ['干支', ...order.map((key) => p[key]?.ganZhi || '待定')],
      ['藏干', ...order.map((key) => joinValue(hidden[key]))],
      ['十神', ...order.map((key) => key === 'day' ? '日主' : valueText(tenGods[key]))],
      ['藏干十神', ...order.map((key) => joinValue(hiddenTenGods[key]))],
      ['纳音', ...order.map((key) => valueText(nayin[key]))],
      ['长生', ...order.map((key) => valueText(lifeStages[key]))],
      ['神煞', ...order.map((key) => joinValue(shensha[key], '无'))],
    ],
    highlights: [
      `农历：${formatLunarDate(result.lunarDate, profile.birthDate)}`,
      `日主：${result.dayMaster?.gan || '待定'} ${result.dayMaster?.element || ''}`,
      `生肖：${result.zodiac || '待定'}`,
      `格局：${valueText(result.analysis?.mingGe?.name || result.analysis?.mingGe, '待分析')}`,
      `用神：${valueText(result.analysis?.usefulGod?.primary || result.analysis?.usefulGod, '待分析')}`,
    ],
    raw: compactRaw(result),
  }
}

function calculateQimenBoard(payload) {
  const date = payload.datetime ? new Date(payload.datetime) : new Date()
  const result = generateQimen(date, 'zhuanpan', 'hour')
  const byGong = new Map((result.jiuGongGe || []).map((cell) => [cell.gong, cell]))
  const order = [4, 9, 2, 3, 5, 7, 8, 1, 6]
  const names = { 1: '坎一', 2: '坤二', 3: '震三', 4: '巽四', 5: '中五', 6: '乾六', 7: '兑七', 8: '艮八', 9: '离九' }
  const directions = { 1: '正北', 2: '西南', 3: '正东', 4: '东南', 5: '中宫', 6: '西北', 7: '正西', 8: '东北', 9: '正南' }
  return {
    cells: order.map((gong) => {
      const cell = byGong.get(gong)
      if (!cell) return [names[gong], gong === 5 ? payload.topic || '所问核心' : '待排', '中宫寄坤', directions[gong]]
      return [
        names[gong],
        cell.renPan?.door || cell.tianPan?.star || '待排',
        `${cell.tianPan?.star || ''} ${cell.shenPan?.god || ''}`.trim() || '格局待定',
        cell.direction || directions[gong],
      ]
    }),
    meta: {
      juShu: `${result.isYangDun ? '阳遁' : '阴遁'}${result.juShu || ''}局`,
      zhiFu: result.zhiFu,
      zhiShi: result.zhiShi,
      patternTags: result.patternTags || [],
    },
    raw: compactRaw(result),
  }
}

function calculateLiuyaoBoard(payload) {
  const result = generateLiuyao(payload.datetime ? new Date(payload.datetime) : new Date())
  const yaos = [...(result.yaosDetail || [])].sort((a, b) => b.position - a.position)
  return {
    lines: yaos.map((line) => [
      yaoPositionName(line.position),
      `${line.yaoType || '阴'}爻`,
      line.sixRelative || '六亲',
      line.isWorld ? '世' : line.isResponse ? '应' : line.isChanging ? '动' : '',
      `${line.sixGod || ''} ${line.najiaDizhi || ''}${line.wuxing || ''} ${line.changeType || ''}`.trim(),
    ]),
    meta: {
      originalName: result.originalName,
      changedName: result.changedName,
      interName: result.interName,
      palace: result.palace?.name,
      specialPattern: result.specialPattern,
      voidBranches: result.voidBranches || [],
    },
    raw: compactRaw(result),
  }
}

function calculateMeihuaBoard(payload) {
  const number = extractNumber(payload.question || payload.context) || 123
  const result = generateMeihua(payload.datetime ? new Date(payload.datetime) : new Date(), { method: 'number', number })
  return {
    blocks: [
      ['本卦', result.originalName || result.mainHexagram?.name || '待定', result.mainHexagram?.description || '初始态势'],
      ['互卦', result.interName || result.interHexagram?.name || '待定', '过程暗线'],
      ['变卦', result.changedName || result.changedHexagram?.name || '待定', '变化结果'],
      ['体用', `${result.tiGua || '体'} / ${result.yongGua || '用'}`, result.analysis?.summary || result.analysis || '体用生克'],
    ],
    meta: {
      movingYao: result.movingYao,
      calculation: result.calculation,
    },
    raw: compactRaw(result),
  }
}

function calculateXiaoliurenBoard(payload) {
  const result = generateXiaoliuren({
    method: 'time',
    customDate: payload.datetime ? new Date(payload.datetime) : new Date(),
  })
  const seq = result.sequence || {}
  return {
    items: [
      ['起因', seq.start?.name || '待定'],
      ['过程', seq.process?.name || '待定'],
      ['结果', seq.result?.name || result.primary?.name || '待定'],
      ['趋势', result.tendency || '待定'],
      ['方位', result.direction || '待定'],
      ['应期', result.yingQi || result.timing || '待定'],
    ],
    raw: compactRaw(result),
  }
}

function calculateTarotBoard(payload) {
  const spreadMap = {
    '单牌指引': 'single',
    '过去-现在-未来': 'three',
    '选择 A/B': 'decision',
    '关系牌阵': 'love',
  }
  const spreadType = spreadMap[payload.spread] || 'three'
  const result = drawSpreadCards(spreadType)
  return {
    cards: (result.cards || []).slice(0, 6).map((item) => [
      item.position || '牌位',
      `${item.card?.name || '未知牌'}${item.isReversed ? ' 逆位' : ' 正位'}`,
      item.card?.type || item.card?.suit || '塔罗牌',
    ]),
    spread: result.spreadName || payload.spread || '牌阵',
    raw: compactRaw(result),
  }
}

function parseDateParts(dateStr) {
  const [year, month, day] = String(dateStr || '').split('-').map((item) => Number(item))
  if (!year || !month || !day) throw new Error('缺少有效出生日期')
  return { year, month, day }
}

function shichenToIndex(shichen = '') {
  const order = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时']
  const index = order.indexOf(shichen)
  return index >= 0 ? index : 0
}

function yaoPositionName(position) {
  return ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'][Number(position) - 1] || `${position}爻`
}

function extractNumber(text = '') {
  const match = String(text).match(/\d+/)
  return match ? Number(match[0]) : null
}

function joinValue(value, fallback = '待定') {
  if (Array.isArray(value)) return value.filter(Boolean).map(valueText).join(' / ') || fallback
  if (value && typeof value === 'object') return Object.values(value).filter(Boolean).map(valueText).join(' / ') || fallback
  return valueText(value, fallback)
}

function formatLunarDate(value, fallback = '待定') {
  if (!value) return fallback
  if (typeof value === 'string') return value
  return `${value.year || ''}年${value.monthName || value.month || ''}月${value.dayName || value.day || ''}`.replace('月月', '月') || fallback
}

function valueText(value, fallback = '待定') {
  if (value === null || value === undefined || value === '') return fallback
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return joinValue(value, fallback)
  if (typeof value === 'object') return value.name || value.ganZhi || value.value || value.primary || value.summary || Object.values(value).filter((item) => typeof item === 'string' || typeof item === 'number').slice(0, 3).join(' / ') || fallback
  return String(value)
}

function compactRaw(result) {
  return JSON.parse(JSON.stringify(result, (_key, value) => {
    if (typeof value === 'bigint') return value.toString()
    return value
  }))
}

async function proxyToNetlify(context, path) {
  const url = new URL(context.request.url)
  const target = new URL(`${NETLIFY_API_BASE}/${path}`)
  target.search = url.search

  const headers = new Headers()
  const contentType = context.request.headers.get('content-type')
  const authorization = context.request.headers.get('authorization')
  if (contentType) headers.set('content-type', contentType)
  if (authorization) headers.set('authorization', authorization)

  const body = ['GET', 'HEAD'].includes(context.request.method) ? undefined : await context.request.arrayBuffer()
  return fetch(target.toString(), {
    method: context.request.method,
    headers,
    body,
    redirect: 'follow',
  })
}

function normalizePath(pathParam) {
  if (Array.isArray(pathParam)) return pathParam.join('/')
  return pathParam || ''
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders({ 'content-type': 'application/json; charset=utf-8' }),
  })
}

function corsHeaders(extra = {}) {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type,authorization',
    ...extra,
  }
}
