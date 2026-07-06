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

  if (context.request.method === 'GET' && path === 'health') {
    return json({
      ok: true,
      service: 'yulesuangua-api',
      runtime: 'cloudflare-pages-functions',
      database: Boolean(context.env?.DB),
      timestamp: new Date().toISOString(),
    })
  }

  if (context.request.method === 'GET' && path === 'divine/skills') {
    return json({ skills: extendedSkills })
  }

  if (context.request.method === 'POST' && path === 'metaphysics/calculate') {
    return calculateMetaphysics(context)
  }

  if (context.request.method === 'POST' && path === 'consultations') {
    return createConsultation(context)
  }

  if (context.request.method === 'GET' && path === 'consultations') {
    return listConsultations(context)
  }

  const consultationMatch = path.match(/^consultations\/([a-zA-Z0-9_-]+)$/)
  if (context.request.method === 'GET' && consultationMatch) {
    return getConsultation(context, consultationMatch[1])
  }

  const divineMatch = path.match(/^divine\/([a-z-]+)$/)
  if (context.request.method === 'POST' && divineMatch) {
    return proxyDivine(context, divineMatch[1])
  }

  return json({ ok: false, error: '接口不存在' }, 404)
}

async function proxyDivine(context, requestedSkill) {
  const targetSkill = skillDirect.has(requestedSkill) ? requestedSkill : skillProxyMap[requestedSkill]
  if (!targetSkill) {
    return json({ ok: false, error: '未知测算类型' }, 404)
  }

  const payload = await context.request.json().catch(() => ({}))
  const enrichedPayload = { ...payload, requestedSkill, targetSkill }
  if (!skillDirect.has(requestedSkill)) {
    const instruction = skillInstructions[requestedSkill] || ''
    enrichedPayload.message = `用户选择的术法：${requestedSkill}。\n${instruction}\n\n用户输入：${payload.message || ''}`
  }

  return streamReading(requestedSkill, enrichedPayload, context.env || {})
}

async function streamReading(skill, payload, env) {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const text = await generateReading(skill, payload, env)
        for (const chunk of chunkText(text, 42)) {
          controller.enqueue(encoder.encode(`data: ${chunk.replace(/\n/g, '\\n')}\n\n`))
          await sleep(18)
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } catch (error) {
        const message = `暂时无法完成解读：${error.message || '服务异常'}`
        controller.enqueue(encoder.encode(`data: ${message}\n\n`))
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: corsHeaders({
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
    }),
  })
}

async function generateReading(skill, payload, env) {
  const message = String(payload.message || payload.question || '').trim()
  const board = payload.board || payload.chart || null
  const profile = payload.profile || {}
  const relation = payload.relation || {}
  const event = payload.eventForm || payload.event || {}
  const skillName = getSkillName(skill)
  const contextLines = [
    profile.name && `称呼：${profile.name}`,
    profile.birthDate && `农历生日：${profile.birthDate}`,
    profile.shichen && `时辰：${profile.shichen}`,
    relation.status && `关系状态：${relation.status}`,
    event.datetime && `起课时间：${event.datetime}`,
    event.topic && `事件类型：${event.topic}`,
  ].filter(Boolean)

  if (env.OPENAI_API_KEY || env.NVIDIA_API_KEY || env.NVCF_API_KEY) {
    const modelText = await callOpenAICompatibleModel({ skillName, message, board, contextLines }, env).catch(() => '')
    if (modelText) return modelText
  }

  const focus = inferFocus(message)
  const boardSummary = summarizeBoard(board)
  return [
    `【${skillName}】盘面已成。本次解读以文化娱乐和行动复盘为边界，不作为医疗、法律、投资等现实决策依据。`,
    contextLines.length ? `【基础信息】${contextLines.join('；')}` : '【基础信息】本次以当前填写内容和起课时间生成判断框架。',
    `【盘面摘要】${boardSummary}`,
    `【问题重心】${focus}`,
    `【趋势判断】当前更适合先收束信息、确认关键变量，再推进下一步。若盘面中出现变动、空亡或冲克类信号，应降低一次性投入，改为小步验证。`,
    `【行动建议】1. 把问题拆成可验证的一个动作；2. 先做低成本试探；3. 记录对方反馈或外部结果；4. 24 到 72 小时后再复盘是否加码。`,
    `【风险提醒】若涉及金钱、合同、健康、婚姻承诺，请以现实证据和专业意见为准，问卦结果只用于整理思路。`,
  ].join('\n')
}

async function callOpenAICompatibleModel(input, env) {
  const apiKey = env.OPENAI_API_KEY || env.NVIDIA_API_KEY || env.NVCF_API_KEY
  const baseUrl = env.OPENAI_BASE_URL || env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1'
  const model = env.OPENAI_MODEL || env.NVIDIA_MODEL || 'nvidia/llama-3.1-nemotron-ultra-253b-v1'
  if (!apiKey) return ''

  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      top_p: 0.95,
      max_tokens: 1400,
      messages: [
        {
          role: 'system',
          content: '你是一个中文玄学文化娱乐应用的解读助手。必须直接输出完整解读，不要输出“示例”、不要只输出框架、不要停在标题。输出 5 到 7 段，包含盘面摘要、问题重心、趋势判断、行动建议、风险提醒。语气克制、可执行，不做绝对预测，不提供医疗法律投资结论。',
        },
        {
          role: 'user',
          content: JSON.stringify(input),
        },
      ],
    }),
  })
  if (!res.ok) return ''
  const data = await res.json().catch(() => ({}))
  return data.choices?.[0]?.message?.content || ''
}

async function createConsultation(context) {
  const payload = await context.request.json().catch(() => ({}))
  const now = new Date().toISOString()
  const id = payload.id || crypto.randomUUID()
  const record = {
    id,
    clientId: sanitizeClientId(payload.clientId),
    skill: String(payload.skill || 'unknown').slice(0, 48),
    title: String(payload.title || payload.question || '未命名问事').slice(0, 160),
    question: String(payload.question || '').slice(0, 4000),
    payload: payload.payload || {},
    board: payload.board || null,
    reading: String(payload.reading || '').slice(0, 12000),
    createdAt: now,
    updatedAt: now,
  }

  if (!context.env?.DB) {
    return json({ ok: false, code: 'persistence_unavailable', record }, 503)
  }

  await context.env.DB.prepare(`
    INSERT INTO consultations (
      id, client_id, skill, title, question, payload_json, board_json, reading, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    record.id,
    record.clientId,
    record.skill,
    record.title,
    record.question,
    JSON.stringify(record.payload),
    JSON.stringify(record.board),
    record.reading,
    record.createdAt,
    record.updatedAt,
  ).run()

  return json({ ok: true, record }, 201)
}

async function listConsultations(context) {
  const url = new URL(context.request.url)
  const clientId = sanitizeClientId(url.searchParams.get('clientId'))
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 20), 1), 50)
  if (!context.env?.DB) {
    return json({ ok: false, code: 'persistence_unavailable', records: [] }, 503)
  }
  if (!clientId) {
    return json({ ok: false, error: '缺少 clientId' }, 400)
  }

  const result = await context.env.DB.prepare(`
    SELECT id, client_id, skill, title, question, reading, created_at, updated_at
    FROM consultations
    WHERE client_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).bind(clientId, limit).all()

  return json({ ok: true, records: (result.results || []).map(rowToConsultationSummary) })
}

async function getConsultation(context, id) {
  if (!context.env?.DB) {
    return json({ ok: false, code: 'persistence_unavailable' }, 503)
  }
  const row = await context.env.DB.prepare(`
    SELECT *
    FROM consultations
    WHERE id = ?
    LIMIT 1
  `).bind(id).first()
  if (!row) return json({ ok: false, error: '记录不存在' }, 404)
  return json({ ok: true, record: rowToConsultation(row) })
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
    center: {
      time: payload.datetime || result.timestamp || date.toISOString(),
      topic: payload.topic || payload.question || '所问之事',
      place: payload.place || '方位待定',
    },
    cells: order.map((gong) => {
      const cell = byGong.get(gong)
      if (!cell) {
        return [names[gong], gong === 5 ? payload.topic || '所问核心' : '待排', '中宫寄坤', '值符', '戊', '戊', directions[gong]]
      }
      return [
        cell.name || names[gong],
        cell.renPan?.door || '待排',
        cell.tianPan?.star || '格局待定',
        cell.shenPan?.god || '神盘待定',
        cell.tianPan?.stem || '—',
        cell.diPan?.stem || '—',
        cell.direction || directions[gong],
      ]
    }),
    meta: {
      solar: payload.datetime || result.timestamp || date.toISOString(),
      lunar: formatQimenLunar(result),
      juShu: `${result.isYangDun ? '阳遁' : '阴遁'}${result.juShu || ''}局`,
      zhiFu: result.zhiFu ? `${result.zhiFu}星` : '待定',
      zhiShi: result.zhiShi || '待定',
      xunShou: result.ganzhi?.hour || result.ganzhi?.day || '待定',
      horse: result.horseStar || '待定',
      empty: Array.isArray(result.voidBranches) ? result.voidBranches.join('') : '待定',
      patternTags: result.patternTags || [],
    },
    raw: compactRaw(result),
  }
}

function formatQimenLunar(result) {
  const ganzhi = result.ganzhi || {}
  return [ganzhi.year, ganzhi.month, ganzhi.day, ganzhi.hour].filter(Boolean).join(' ') || '按起课时间换算'
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
  const originalName = result.originalName || result.mainHexagram?.name || '本卦待定'
  const mutualName = result.interName || result.interHexagram?.name || '互卦待定'
  const changedName = result.changedName || result.changedHexagram?.name || '变卦待定'
  const body = result.tiGua || result.bodyGua || '体卦'
  const use = result.yongGua || result.useGua || '用卦'
  const analysisText = formatAnalysis(result.analysis, '体用生克')
  return {
    meta: {
      solar: payload.datetime ? String(payload.datetime).replace('T', ' ') : '当前起卦',
      lunar: result.lunar || '由算法按起课时间换算',
      topic: payload.topic || '所问之事',
      place: payload.place || '方位未定',
      method: '数字 / 时间 / 外应起卦',
      movingYao: result.movingYao,
      calculation: result.calculation,
    },
    original: {
      label: '本卦',
      name: originalName,
      note: result.mainHexagram?.description || '初始态势',
    },
    mutual: {
      label: '互卦',
      name: mutualName,
      note: result.interHexagram?.description || '过程暗线',
    },
    changed: {
      label: '变卦',
      name: changedName,
      note: result.changedHexagram?.description || '变化结果',
    },
    relation: {
      body,
      use,
      text: analysisText,
      movingLine: result.movingYao ? `${result.movingYao}爻动` : '动爻待定',
    },
    clues: [
      { label: '起课线索', value: payload.question || payload.context || `数字 ${number}` },
      { label: '事件类型', value: payload.topic || '未选择' },
      { label: '地点方位', value: payload.place || '未填写' },
      { label: '计算依据', value: result.calculation || `取数 ${number}` },
    ],
    raw: compactRaw(result),
  }
}

function formatAnalysis(value, fallback = '待分析') {
  if (!value) return fallback
  if (typeof value === 'string') return value
  if (typeof value.summary === 'string') return value.summary
  if (typeof value.text === 'string') return value.text
  if (typeof value.description === 'string') return value.description
  return Object.entries(value)
    .filter(([, item]) => item !== null && item !== undefined && typeof item !== 'object')
    .map(([key, item]) => `${key}: ${item}`)
    .join('；') || fallback
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

function getSkillName(skill) {
  return extendedSkills.find((item) => item.id === skill)?.name || skill || '问事'
}

function inferFocus(message) {
  const text = String(message || '')
  if (/感情|关系|婚|复合|对象|对方/.test(text)) return '关系互动、信任建立和长期稳定性。'
  if (/工作|事业|项目|合作|跳槽|面试/.test(text)) return '事业推进、合作节奏和资源匹配。'
  if (/钱|财|投资|交易|合同|生意/.test(text)) return '财务风险、交易边界和现金流安全。'
  if (/健康|身体|焦虑|睡眠/.test(text)) return '身心状态、休息节律和现实检查。'
  return '当前问题的时机、阻力、可行动作和复盘节点。'
}

function summarizeBoard(board) {
  if (!board) return '已根据当前输入生成基础盘面；建议结合表盘中的高亮信息和变动位置观察。'
  if (board.title || board.badge || board.source) {
    return [board.title, board.badge, board.source].filter(Boolean).join(' / ')
  }
  if (board.data?.meta) {
    return Object.entries(board.data.meta).slice(0, 5).map(([key, value]) => `${key}: ${valueText(value)}`).join('；')
  }
  return '盘面数据已生成，重点观察本卦/变卦、宫位、动爻或中心关系。'
}

function chunkText(text, size = 48) {
  const chunks = []
  const source = String(text || '')
  for (let index = 0; index < source.length; index += size) {
    chunks.push(source.slice(index, index + size))
  }
  return chunks.length ? chunks : ['']
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function sanitizeClientId(value) {
  return String(value || 'anonymous').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80) || 'anonymous'
}

function rowToConsultationSummary(row) {
  return {
    id: row.id,
    clientId: row.client_id,
    skill: row.skill,
    title: row.title,
    question: row.question,
    reading: row.reading,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function rowToConsultation(row) {
  return {
    ...rowToConsultationSummary(row),
    payload: parseJsonField(row.payload_json, {}),
    board: parseJsonField(row.board_json, null),
  }
}

function parseJsonField(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
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
