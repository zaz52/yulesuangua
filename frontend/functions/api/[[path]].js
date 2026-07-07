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

const skillRubrics = {
  bazi: {
    dimensions: ['四柱结构', '日主与五行', '十神关系', '阶段节奏', '行动建议'],
    terms: ['年柱', '月柱', '日柱', '时柱', '天干', '地支', '藏干', '十神', '五行', '纳音', '长生'],
    fallback: '围绕四柱、日主、五行偏枯、十神关系和阶段节奏来解读，不要只给性格判断。',
  },
  ziwei: {
    dimensions: ['命身宫', '十二宫重点', '主星组合', '事业财帛迁移', '关系与行动'],
    terms: ['命宫', '身宫', '十二宫', '主星', '辅星', '事业宫', '财帛宫', '迁移宫', '夫妻宫'],
    fallback: '围绕命身宫、十二宫位和主星组合来解读，避免泛泛谈运势。',
  },
  qimen: {
    dimensions: ['九宫格局', '值符值使', '门星神组合', '方位时机', '行动策略'],
    terms: ['九宫', '值符', '值使', '门', '星', '神', '天盘干', '地盘干', '空亡', '马星'],
    fallback: '围绕九宫、值符值使、门星神和方位时机解读，不要脱离盘面。',
  },
  liuyao: {
    dimensions: ['本卦变卦', '世应关系', '动爻', '六亲用神', '应期与风险'],
    terms: ['本卦', '变卦', '动爻', '世爻', '应爻', '六亲', '用神', '六神', '空亡'],
    fallback: '围绕本卦、变卦、动爻、世应和六亲用神来解读。',
  },
  meihua: {
    dimensions: ['本卦', '互卦', '变卦', '体用生克', '外应线索'],
    terms: ['本卦', '互卦', '变卦', '体卦', '用卦', '动爻', '体用生克', '外应'],
    fallback: '围绕本互变卦、体用生克和外应线索来解读。',
  },
  daliuren: {
    dimensions: ['四课', '三传', '神将', '占时', '事件脉络'],
    terms: ['四课', '三传', '初传', '中传', '末传', '天将', '月将', '占时'],
    fallback: '围绕三传四课、神将和事件脉络来解读。',
  },
  xiaoliuren: {
    dimensions: ['六宫落点', '起因过程结果', '速断倾向', '应期', '行动边界'],
    terms: ['大安', '留连', '速喜', '赤口', '小吉', '空亡', '起因', '过程', '结果'],
    fallback: '围绕小六壬六宫和起因、过程、结果做快速判断。',
  },
  fengshui: {
    dimensions: ['朝向', '门窗动线', '床桌位置', '明堂靠山', '调整建议'],
    terms: ['朝向', '门窗', '动线', '床位', '桌位', '明堂', '靠山', '九宫'],
    fallback: '围绕朝向、门窗、动线、床桌位置和九宫方位给出空间调整建议。',
  },
  tarot: {
    dimensions: ['牌阵位置', '牌面象征', '正逆位倾向', '选择提醒', '现实行动'],
    terms: ['牌阵', '牌位', '正位', '逆位', '过去', '现在', '未来', '选择'],
    fallback: '围绕牌阵位置、牌面象征和现实选择建议解读。',
  },
}

const resultSchemas = {
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
  const readingChart = payload.readingChart || null
  const board = payload.board || readingChart?.board || payload.chart || null
  const profile = payload.profile || {}
  const relation = payload.relation || {}
  const event = payload.eventForm || payload.event || {}
  const mind = payload.mind || {}
  const space = payload.space || {}
  const tarot = payload.tarot || {}
  const skillName = getSkillName(skill)
  const rubric = skillRubrics[skill] || {
    dimensions: ['问题重心', '盘面摘要', '趋势判断', '行动建议', '风险提醒'],
    terms: [],
    fallback: '围绕用户问题和盘面摘要做结构化解读。',
  }
  const contextLines = [
    profile.name && `称呼：${profile.name}`,
    profile.gender && `性别：${profile.gender}`,
    profile.birthDate && `农历生日：${profile.birthDate}`,
    profile.shichen && `时辰：${profile.shichen}`,
    profile.place && `出生地：${profile.place}`,
    relation.status && `关系状态：${relation.status}`,
    relation.partner && `对方信息：${relation.partner}`,
    relation.focus && `关注点：${relation.focus}`,
    event.datetime && `起课时间：${event.datetime}`,
    event.topic && `事件类型：${event.topic}`,
    payload.datetime && `排盘时间：${payload.datetime}`,
    payload.place && `地点/方位：${payload.place}`,
    payload.topic && `主题：${payload.topic}`,
    mind.topic && `困惑类型：${mind.topic}`,
    mind.mood && `当前心境：${mind.mood}`,
    space.kind && `空间类型：${space.kind}`,
    space.direction && `空间朝向：${space.direction}`,
    space.layout && `布局描述：${space.layout}`,
    tarot.spread && `塔罗牌阵：${tarot.spread}`,
    tarot.topic && `塔罗主题：${tarot.topic}`,
  ].filter(Boolean)
  const boardSummary = summarizeBoard(board)
  const boardFacts = [
    ...extractReadingChartFacts(readingChart),
    ...extractBoardFacts(board),
  ].slice(0, 24)
  const resultSchema = Array.isArray(readingChart?.sections) && readingChart.sections.length
    ? readingChart.sections
    : resultSchemas[skill] || resultSchemas.default

  if (env.OPENAI_API_KEY || env.NVIDIA_API_KEY || env.NVCF_API_KEY) {
    const modelText = await callOpenAICompatibleModel({
      skill,
      skillName,
      message,
      contextLines,
      boardSummary,
      boardFacts,
      rubric,
      resultSchema,
    }, env).catch(() => '')
    if (modelText) return normalizeReadingOutput(skill, modelText)
  }

  const focus = inferFocus(message)
  const rubricText = `${rubric.fallback} 重点维度：${rubric.dimensions.join('、')}。`
  const fallbackBodies = {
    四柱总览: `${contextLines.join('；') || '本次以当前填写内容生成四柱判断框架。'} ${boardSummary}`,
    日主五行: boardFacts.length ? boardFacts.slice(0, 4).join('；') : rubricText,
    十神关系: '先看月令与日主，再看十神在现实里的资源、压力、表达和关系互动，不宜只按单一标签下结论。',
    阶段节奏: '当前更适合先确认关键变量，再小步推进；若盘面有冲克或失衡信号，应先修正节奏。',
    九宫总览: boardSummary,
    值符值使: boardFacts.length ? boardFacts.slice(0, 5).join('；') : rubricText,
    门星神格局: '门主行动入口，星主状态倾向，神主外部助力与变数，三者需要合看。',
    方位时机: '先取盘面中稳定、可执行、阻力较低的方向和时间窗口，避免一次性重押。',
    本卦变卦: boardSummary,
    世应用神: boardFacts.length ? boardFacts.slice(0, 6).join('；') : rubricText,
    动爻变化: '动爻代表当前问题的变化点，应优先观察它牵动的六亲、世应和变卦方向。',
    本互变卦: boardSummary,
    体用生克: boardFacts.length ? boardFacts.slice(0, 6).join('；') : rubricText,
    动爻外应: '把时间、数字、外应和用户问题合看，重点看体用之间是相生、相克还是互耗。',
    关键矛盾: focus,
    趋势判断: `${rubricText} 当前宜先收束信息、确认关键变量，再推进下一步。`,
    行动建议: '把问题拆成一个可验证动作；先做低成本试探；记录反馈；24 到 72 小时后复盘是否加码。',
    行动策略: '先选低风险路径推进，保留回撤余地；若外部反馈不清晰，先等一个明确回信或可验证信号。',
    风险提醒: '若涉及金钱、合同、健康、婚姻承诺，请以现实证据和专业意见为准，问卦结果只用于整理思路。',
  }
  return resultSchema.map((title) => `【${title}】${fallbackBodies[title] || fallbackBodies.趋势判断}`).join('\n')
}

function extractReadingChartFacts(readingChart) {
  if (!readingChart || typeof readingChart !== 'object') return []
  const facts = []
  if (readingChart.version) facts.push(`chart-version：${readingChart.version}`)
  if (readingChart.meta?.skillName) facts.push(`术法：${readingChart.meta.skillName}`)
  if (readingChart.meta?.source) facts.push(`排盘来源：${readingChart.meta.source}`)
  if (readingChart.meta?.question) facts.push(`所问：${readingChart.meta.question}`)
  if (Array.isArray(readingChart.facts)) {
    for (const item of readingChart.facts.slice(0, 18)) {
      if (item?.label && item?.value) facts.push(`${item.label}：${item.value}`)
    }
  }
  return facts
}

function normalizeReadingOutput(skill, text) {
  const clean = String(text || '').replace(/\r/g, '').trim()
  if (!clean) return ''
  const schema = resultSchemas[skill] || resultSchemas.default
  const marked = [...clean.matchAll(/【([^】]{1,16})】([\s\S]*?)(?=【[^】]{1,16}】|$)/g)]
    .map((match) => ({ title: match[1].trim(), body: match[2].trim() }))
    .filter((item) => item.title && item.body)
  const hasRequiredShape = marked.length >= Math.min(4, schema.length)
    && marked.some((item) => /建议|策略|调整|当行/.test(item.title))
    && marked.some((item) => /风险|提醒|边界/.test(item.title))
  if (hasRequiredShape) return marked.map((item) => `【${item.title}】${item.body}`).join('\n')

  const paragraphs = clean
    .replace(/^data:\s*/gm, '')
    .split(/\n{2,}|\\n\\n/)
    .map((item) => item.replace(/\\n/g, '').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
  const usable = paragraphs.length ? paragraphs : [clean.replace(/\s+/g, ' ')]
  return schema.map((title, index) => {
    const body = usable[index] || usable[usable.length - 1] || '请结合盘面继续观察。'
    return `【${title}】${body}`
  }).join('\n')
}

async function callOpenAICompatibleModel(input, env) {
  const apiKey = env.OPENAI_API_KEY || env.NVIDIA_API_KEY || env.NVCF_API_KEY
  const baseUrl = env.OPENAI_BASE_URL || env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1'
  const model = env.OPENAI_MODEL || env.NVIDIA_MODEL || 'qwen/qwen3.5-122b-a10b'
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
          content: [
            '你是一个中文玄学文化娱乐应用的解读助手。',
            '必须直接输出完整解读，不要输出“示例”、不要只输出框架、不要停在标题。',
            '必须严格围绕用户选择的术法、盘面要点和指定术语展开，不要把不同术法混在一起。',
            '必须按用户 JSON 中 resultSchema 给出的栏目名和顺序输出，每一段格式必须是：`【栏目名】正文`。',
            '不得新增无关栏目，不得省略“行动建议/行动策略”和“风险提醒”类栏目。',
            '每个栏目正文 60 到 140 个中文字符，必须包含具体判断或行动含义，不要空泛套话。',
            '语气克制、可执行，不做绝对预测，不提供医疗法律投资结论。',
          ].join('\n'),
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
  if (!row) return json({ ok: false, code: 'not_found', error: '记录不存在', record: null })
  return json({ ok: true, record: rowToConsultation(row) })
}

async function calculateMetaphysics(context) {
  const payload = await context.request.json().catch(() => ({}))
  const skill = payload.skill || 'bazi'

  try {
    const calculators = {
      bazi: { fn: calculateBaziBoard, source: 'mingyu-core@0.1.8' },
      ziwei: { fn: calculateZiweiBoard, source: 'mingyu-core@0.1.8' },
      qimen: { fn: calculateQimenBoard, source: 'mingyu-core@0.1.8' },
      liuyao: { fn: calculateLiuyaoBoard, source: 'mingyu-core@0.1.8' },
      meihua: { fn: calculateMeihuaBoard, source: 'mingyu-core@0.1.8' },
      daliuren: { fn: calculateDaliurenBoard, source: 'rules-mvp@2026-07' },
      xiaoliuren: { fn: calculateXiaoliurenBoard, source: 'mingyu-core@0.1.8' },
      yinyuan: { fn: calculateYinyuanBoard, source: 'rules-mvp@2026-07' },
      hehun: { fn: calculateHehunBoard, source: 'rules-mvp@2026-07' },
      fojiao: { fn: calculateFojiaoBoard, source: 'rules-mvp@2026-07' },
      fengshui: { fn: calculateFengshuiBoard, source: 'rules-mvp@2026-07' },
      'daily-fortune': { fn: calculateDailyFortuneBoard, source: 'rules-mvp+mingyu-core@2026-07' },
      tarot: { fn: calculateTarotBoard, source: 'mingyu-core@0.1.8' },
    }
    const calculator = calculators[skill]
    if (!calculator) {
      return json({ ok: false, skill, source: 'unavailable', error: '此术法暂未接入排盘算法' }, 422)
    }

    return json({ ok: true, skill, source: calculator.source, data: await calculator.fn(payload) })
  } catch (error) {
    return json({ ok: false, skill, source: 'metaphysics-calculator', error: error.message || '排盘失败' }, 500)
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

function calculateDaliurenBoard(payload) {
  const date = payload.datetime ? new Date(payload.datetime) : new Date()
  const topic = payload.topic || payload.question || '所问之事'
  const ganZhi = buildGanzhiSnapshot(date)
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  const gods = rotateBy(['贵人', '腾蛇', '朱雀', '六合', '勾陈', '青龙', '天空', '白虎', '太常', '玄武', '太阴', '天后'], date.getHours())
  const monthGeneral = branches[(date.getMonth() + 1) % 12]
  const hourBranch = shichenBranch(date.getHours())
  const dayStem = ganZhi.day.slice(0, 1) || '甲'
  const dayBranch = ganZhi.day.slice(1, 2) || '子'
  const dayIndex = branches.indexOf(dayBranch)
  const hourIndex = branches.indexOf(hourBranch)
  const useIndex = (dayIndex + hourIndex + topic.length) % 12
  const passBranches = [0, 4, 8].map((offset) => branches[(useIndex + offset) % 12])
  const passGods = passBranches.map((branch) => gods[branches.indexOf(branch)])
  const heavenlyPlate = branches.map((branch, index) => ({
    branch,
    god: gods[index],
    sky: branches[(index + branches.indexOf(monthGeneral) + 12) % 12],
    note: index === useIndex ? '发用' : index === hourIndex ? '占时' : index === dayIndex ? '日支' : '',
  }))
  const fourLessons = [
    { label: '一课', stem: dayStem, branch: branches[(dayIndex + 1) % 12], god: gods[(dayIndex + 1) % 12], role: '日干上神' },
    { label: '二课', stem: dayStem, branch: branches[(dayIndex + 5) % 12], god: gods[(dayIndex + 5) % 12], role: '日干阴神' },
    { label: '三课', stem: dayBranch, branch: branches[(dayIndex + 7) % 12], god: gods[(dayIndex + 7) % 12], role: '日支上神' },
    { label: '四课', stem: dayBranch, branch: branches[(dayIndex + 11) % 12], god: gods[(dayIndex + 11) % 12], role: '日支阴神' },
  ]
  const threePasses = ['初传', '中传', '末传'].map((label, index) => ({
    label,
    branch: passBranches[index],
    god: passGods[index],
    relation: relationByOffset((branches.indexOf(passBranches[index]) - dayIndex + 12) % 12),
  }))
  const lessonType = inferDaliurenLessonType(useIndex, dayIndex, hourIndex)

  return {
    branches,
    gods,
    heavenlyPlate,
    fourLessons,
    threePasses,
    passes: threePasses.map((item) => `${item.branch}${item.god}`),
    center: {
      time: payload.datetime ? String(payload.datetime).replace('T', ' ') : date.toISOString().slice(0, 16).replace('T', ' '),
      day: ganZhi.day,
      hour: ganZhi.hour,
      monthGeneral,
      topic,
      xun: `${dayStem}${dayBranch}`,
      zhiFu: threePasses[0].god,
      zhiShi: hourBranch,
      lessonType,
    },
    items: [
      ['四课', fourLessons.map((item) => `${item.label}${item.branch}`).join(' / ')],
      ['三传', threePasses.map((item) => `${item.label}${item.branch}${item.god}`).join(' -> ')],
      ['课体', lessonType],
      ['判断', topic],
    ],
  }
}

function calculateFojiaoBoard(payload) {
  const mind = payload.mind || {}
  const topic = mind.topic || payload.topic || '当下困惑'
  const mood = mind.mood || '心绪待定'
  const context = mind.context || payload.context || payload.question || '背景待补充'
  const seed = stableTextSeed([topic, mood, context].join('|'))
  const practicePool = ['先止语三息', '写下事实与想象', '今日只做一件善小事', '把边界说清楚', '先睡眠后决策', '少作评判，多看因缘']
  const linePool = ['诸行无常，先看变化', '因缘和合，不急定论', '照见当下，少被念头牵走', '慈悲不是纵容，清明也需边界']
  return {
    items: [
      ['当下心境', mood],
      ['困惑类型', topic],
      ['执着所在', inferAttachment(context)],
      ['观照句', linePool[seed % linePool.length]],
      ['今日功课', practicePool[(seed + 3) % practicePool.length]],
      ['现实边界', '重要健康、法律、财务事项仍以专业意见为准'],
    ],
    meta: {
      topic,
      mood,
      context,
      source: '佛学文化娱乐规则盘',
    },
  }
}

function inferAttachment(text = '') {
  if (/感情|关系|对方|复合|联系/.test(text)) return '对回应与确定性的执着'
  if (/工作|事业|项目|合作|钱|财/.test(text)) return '对结果、得失和控制感的执着'
  if (/家人|父母|孩子|家庭/.test(text)) return '对责任、牵挂和边界的混杂'
  if (/焦虑|内耗|睡|累|压力/.test(text)) return '对念头反复与身心疲惫的执着'
  return '先分清事实、情绪与推测'
}

function calculateFengshuiBoard(payload) {
  const space = payload.space || {}
  const kind = space.kind || payload.kind || '住宅'
  const direction = space.direction || payload.direction || '不确定'
  const layout = String(space.layout || payload.layout || payload.question || '')
  const palaceBase = [
    ['东南', '巽宫', '文昌 / 远行', '木', '学习、证照、远方机会'],
    ['正南', '离宫', '名声 / 光照', '火', '曝光、表达、情绪温度'],
    ['西南', '坤宫', '关系 / 稳定', '土', '伴侣、合作、承载力'],
    ['正东', '震宫', '生发 / 入口', '木', '行动、成长、主动性'],
    ['中宫', '宅心', `${kind} · ${direction}`, '土', '全宅气口与杂物压力'],
    ['正西', '兑宫', '口舌 / 收敛', '金', '沟通、子女、精细事务'],
    ['东北', '艮宫', '止息 / 储物', '土', '沉淀、学习、阻滞点'],
    ['正北', '坎宫', '事业 / 流动', '水', '事业、睡眠、流动性'],
    ['西北', '乾宫', '主位 / 贵人', '金', '负责人、权威、外部助力'],
  ]
  const found = detectFengshuiFeatures(layout)
  const cells = palaceBase.map(([directionName, palace, theme, element, meaning]) => {
    const hits = found.filter((feature) => feature.direction === directionName || (feature.direction === '全局' && ['杂物', '梁'].includes(feature.label)))
    const score = scoreFengshuiCell(directionName, hits, layout, direction)
    return {
      direction: directionName,
      palace,
      theme,
      element,
      meaning,
      score,
      level: score >= 2 ? '宜用' : score <= -2 ? '需调' : '平衡',
      features: hits.map((item) => item.label),
      advice: fengshuiAdvice(directionName, score, hits),
    }
  })
  return {
    kind,
    direction,
    layout,
    cells,
    summary: {
      auspicious: cells.filter((cell) => cell.score >= 2).map((cell) => cell.direction),
      caution: cells.filter((cell) => cell.score <= -2).map((cell) => cell.direction),
      detected: found.map((item) => item.label),
    },
    adjustments: buildFengshuiAdjustments(cells, found, kind),
  }
}

function buildGanzhiSnapshot(date) {
  const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  const daySeed = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000) + 40
  const hourSeed = daySeed * 12 + Math.floor((date.getHours() + 1) / 2)
  const gz = (seed) => `${stems[((seed % 10) + 10) % 10]}${branches[((seed % 12) + 12) % 12]}`
  return {
    year: gz(date.getFullYear() - 4),
    month: gz((date.getFullYear() - 2000) * 12 + date.getMonth()),
    day: gz(daySeed),
    hour: gz(hourSeed),
  }
}

function shichenBranch(hour) {
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  return branches[Math.floor(((hour + 1) % 24) / 2)]
}

function rotateBy(items, seed) {
  const offset = ((seed % items.length) + items.length) % items.length
  return [...items.slice(offset), ...items.slice(0, offset)]
}

function relationByOffset(offset) {
  if ([0, 1].includes(offset)) return '比助'
  if ([2, 3].includes(offset)) return '生发'
  if ([4, 5].includes(offset)) return '泄耗'
  if ([6, 7].includes(offset)) return '冲动'
  if ([8, 9].includes(offset)) return '制约'
  return '回收'
}

function inferDaliurenLessonType(useIndex, dayIndex, hourIndex) {
  const diff = (useIndex - dayIndex + 12) % 12
  if (useIndex === hourIndex) return '伏吟课'
  if (diff === 6) return '反吟课'
  if ([2, 5, 8, 11].includes(diff)) return '涉害课'
  if ([1, 4, 7, 10].includes(diff)) return '遥克课'
  return '比用课'
}

function detectFengshuiFeatures(layout) {
  const directionMap = [
    ['东南', /东南|巽/], ['正南', /正南|南|离/], ['西南', /西南|坤/],
    ['正东', /正东|东|震/], ['中宫', /中宫|中央|中心/], ['正西', /正西|西|兑/],
    ['东北', /东北|艮/], ['正北', /正北|北|坎/], ['西北', /西北|乾/],
  ]
  const objectMap = [
    ['门', /门|入口|大门/], ['窗', /窗|阳台/], ['床', /床|卧室/], ['桌', /桌|书桌|办公桌|工位/],
    ['灶', /灶|厨房|炉/], ['水', /水|卫生间|厕所|鱼缸/], ['杂物', /杂物|堆|乱|堵/], ['梁', /梁|压顶/],
  ]
  const found = []
  const segments = String(layout || '').split(/[，,。；;\n]/).map((item) => item.trim()).filter(Boolean)
  for (const [label, objectRegex] of objectMap) {
    const matchedSegments = segments.filter((segment) => objectRegex.test(segment))
    if (!matchedSegments.length && objectRegex.test(layout)) matchedSegments.push(layout)
    for (const segment of matchedSegments) {
      const direction = directionMap.find(([, regex]) => regex.test(segment))?.[0] || '全局'
      found.push({ label, direction })
    }
  }
  return found
}

function scoreFengshuiCell(directionName, hits, layout, houseDirection) {
  let score = directionName === '中宫' ? 0 : 1
  if (houseDirection.includes(directionName.replace('正', ''))) score += 1
  for (const hit of hits) {
    if (hit.direction === '全局' && !['杂物', '梁'].includes(hit.label)) continue
    if (['门', '窗', '桌'].includes(hit.label)) score += 1
    if (['床'].includes(hit.label) && ['正北', '西北', '西南'].includes(directionName)) score += 1
    if (['水'].includes(hit.label) && ['正南', '中宫'].includes(directionName)) score -= 2
    if (['灶'].includes(hit.label) && ['正北', '西北'].includes(directionName)) score -= 1
    if (['杂物', '梁'].includes(hit.label)) score -= 2
  }
  if (/背后是走道|背后无靠|门冲|对门|镜子对床/.test(layout) && ['中宫', '正东', '正北'].includes(directionName)) score -= 1
  return Math.max(-3, Math.min(3, score))
}

function fengshuiAdvice(directionName, score, hits) {
  if (score <= -2) return `${directionName}先做减法：清理遮挡、减少冲射，必要时调整床桌朝向或增加稳定靠背。`
  if (score >= 2) return `${directionName}可作为近期可用位：保持明亮整洁，适合放置常用工作或学习物。`
  if (hits.length) return `${directionName}保持平衡即可，重点是通风、动线顺畅和物品不过度堆叠。`
  return `${directionName}暂无明显冲突，维持干净、明亮、可通行。`
}

function buildFengshuiAdjustments(cells, found, kind) {
  const caution = cells.filter((cell) => cell.score <= -2).slice(0, 3)
  const good = cells.filter((cell) => cell.score >= 2).slice(0, 2)
  return [
    caution.length ? `优先处理：${caution.map((cell) => cell.direction).join('、')}，先清杂物、避冲射、补靠背。` : '当前没有明显重压宫位，先保持入口和中宫清爽。',
    good.length ? `可用方位：${good.map((cell) => cell.direction).join('、')}，适合作为${kind}的工作、学习或会客重点。` : '暂未形成明显优势方位，建议先补光、通风和收纳。',
    found.some((item) => item.label === '床') ? '床位重点看靠背、避门冲和避镜照，先稳睡眠再谈旺运。' : '若要进一步细排，请补充床、门、窗、桌、灶、卫生间所在方位。',
  ]
}

function calculateYinyuanBoard(payload) {
  const relation = payload.relation || {}
  const status = relation.status || payload.status || '关系状态待定'
  const focus = relation.focus || payload.focus || '关注点待定'
  const name = relation.name || '你'
  const partner = relation.partner || '对方信息待补充'
  const birthday = relation.birthday || ''
  const seed = stableTextSeed([name, partner, birthday, status, focus, payload.question].join('|'))
  const dimensions = [
    buildRelationDimension('缘分牵引', seed + 11, '彼此吸引与主动靠近程度'),
    buildRelationDimension('沟通流动', seed + 23, '表达、回应和误会修复效率'),
    buildRelationDimension('稳定承诺', seed + 37, '长期投入、现实责任与节奏稳定性'),
    buildRelationDimension('时机成熟', seed + 41, '当前阶段是否适合推进或确认关系'),
    buildRelationDimension('边界清晰', seed + 53, '需求、距离和底线是否清楚'),
  ]
  const score = Math.round(dimensions.reduce((sum, item) => sum + item.score, 0) / dimensions.length)
  const phase = score >= 78 ? '可进' : score >= 62 ? '观望推进' : score >= 46 ? '先稳沟通' : '宜缓'
  return {
    mode: 'yinyuan',
    title: '姻缘关系盘',
    score,
    phase,
    people: [
      { label: '自己', value: name, note: birthday || '生日未填' },
      { label: '对方', value: partner, note: status },
    ],
    dimensions,
    timeline: [
      { label: '当下', value: status, tone: 'current' },
      { label: '关注', value: focus, tone: 'focus' },
      { label: '建议', value: relationAdvice(score, focus), tone: 'advice' },
    ],
    frictions: relationFrictions(dimensions),
    items: [
      ['关系阶段', status],
      ['关注点', focus],
      ['对方线索', partner],
      ['建议方向', relationAdvice(score, focus)],
    ],
  }
}

function calculateHehunBoard(payload) {
  const relation = payload.relation || {}
  const mine = relation.name || '甲方'
  const myBirthday = relation.birthday || '生日未填'
  const partner = relation.partner || '乙方信息待补充'
  const status = relation.status || '关系状态待定'
  const focus = relation.focus || '长期相处'
  const seed = stableTextSeed([mine, myBirthday, partner, status, focus, payload.question].join('|'))
  const dimensions = [
    buildRelationDimension('五行互补', seed + 7, '双方气质和资源是否互补'),
    buildRelationDimension('生肖节奏', seed + 13, '生日生肖线索带来的相处节奏'),
    buildRelationDimension('沟通模式', seed + 29, '争执、表达和修复方式'),
    buildRelationDimension('现实协作', seed + 43, '金钱、家庭、规划与责任分配'),
    buildRelationDimension('长期稳定', seed + 61, '承诺、耐心和共同成长空间'),
  ]
  const score = Math.round(dimensions.reduce((sum, item) => sum + item.score, 0) / dimensions.length)
  const phase = score >= 80 ? '合盘较顺' : score >= 65 ? '可磨合' : score >= 50 ? '需沟通' : '宜谨慎'
  return {
    mode: 'hehun',
    title: '合婚配对盘',
    score,
    phase,
    people: [
      { label: '甲方', value: mine, note: myBirthday },
      { label: '乙方', value: partner, note: status },
    ],
    dimensions,
    timeline: [
      { label: '合盘重点', value: focus, tone: 'focus' },
      { label: '磨合核心', value: relationFrictions(dimensions)[0] || '先看沟通节奏', tone: 'current' },
      { label: '长期建议', value: relationAdvice(score, focus), tone: 'advice' },
    ],
    frictions: relationFrictions(dimensions),
    items: [
      ['你的信息', `${mine} / ${myBirthday}`],
      ['对方信息', partner],
      ['合盘重点', `${score}分 · ${phase}`],
      ['长期磨合', relationAdvice(score, focus)],
    ],
  }
}

function stableTextSeed(text) {
  return [...String(text || '')].reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 3), 0)
}

function buildRelationDimension(label, seed, note) {
  const score = 42 + (seed % 49)
  return {
    label,
    score,
    level: score >= 78 ? '强' : score >= 62 ? '中上' : score >= 48 ? '中' : '弱',
    note,
  }
}

function relationAdvice(score, focus) {
  if (score >= 78) return `围绕“${focus}”可以主动推进，但仍要把承诺、时间和边界说清楚。`
  if (score >= 62) return `围绕“${focus}”适合小步确认，多看对方持续行动，不急着一次定论。`
  if (score >= 46) return `围绕“${focus}”先修复沟通节奏，减少试探和情绪化表达。`
  return `围绕“${focus}”宜放慢，先看现实反馈和基本尊重是否稳定。`
}

function relationFrictions(dimensions) {
  return dimensions
    .filter((item) => item.score < 62)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((item) => `${item.label}偏弱：${item.note}`)
}

function calculateDailyFortuneBoard(payload) {
  const date = payload.date ? new Date(`${payload.date}T12:00:00+08:00`) : todayInShanghai()
  if (Number.isNaN(date.getTime())) throw new Error('缺少有效日期')

  const seed = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000)
  const ganzhi = buildGanzhiSnapshot(date)
  const bazi = baziCalculator.calculateBazi({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    timeIndex: shichenToIndex(payload.shichen || '午时'),
    gender: 'male',
    isLunar: false,
    isLeapMonth: false,
  })
  const lunarText = formatLunarDate(bazi.lunarDate, '农历待定')
  const jieqi = nearestSolarTerm(date)
  const themePool = ['先稳后动', '整理复盘', '谨慎沟通', '小步推进', '留白养神', '定边界', '清理杂务', '借势开局']
  const directionPool = ['东南', '正东', '正南', '西南', '西北', '正北', '东北', '正西']
  const colorPool = ['青绿', '朱红', '米白', '暗金', '墨黑', '湖蓝', '松石', '暖棕']
  const theme = themePool[seed % themePool.length]
  const direction = directionPool[(seed + date.getDay()) % directionPool.length]
  const color = colorPool[(seed + date.getMonth()) % colorPool.length]
  const auspicious = rotateBy([
    '整理计划',
    '问卦复盘',
    '拜访沟通',
    '学习进修',
    '修整空间',
    '签订小约',
    '纳采备忘',
    '出行准备',
  ], seed).slice(0, 4)
  const avoid = rotateBy([
    '冲动承诺',
    '借贷担保',
    '情绪争执',
    '仓促搬动',
    '高风险投资',
    '熬夜硬撑',
    '口舌辩胜',
    '临时改约',
  ], seed + 3).slice(0, 4)
  const luckyHours = buildLuckyHours(seed, ganzhi.day)

  return {
    date: date.toISOString().slice(0, 10),
    weekday: new Intl.DateTimeFormat('zh-CN', { weekday: 'long', timeZone: 'Asia/Shanghai' }).format(date),
    lunar: lunarText,
    ganzhi,
    jieqi,
    theme,
    yi: auspicious,
    ji: avoid,
    luckyHours,
    directions: {
      lucky: direction,
      calm: directionPool[(seed + 4) % directionPool.length],
      wealth: directionPool[(seed + 2) % directionPool.length],
    },
    color,
    desk: `今日宜清空桌面${direction}侧，保留一件${color}或木质小物，减少杂物压迫。`,
    reminder: `今日主题为“${theme}”。黄历结果用于传统文化娱乐参考，现实决策仍以事实、合同、医生或专业人士意见为准。`,
    items: [
      ['今日主题', theme],
      ['宜', auspicious.join('、')],
      ['忌', avoid.join('、')],
      ['吉时', luckyHours.map((item) => item.name).join('、')],
      ['方位', `${direction}利推进，${directionPool[(seed + 4) % directionPool.length]}利收束`],
    ],
  }
}

function todayInShanghai() {
  const parts = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date()).reduce((acc, item) => {
    acc[item.type] = item.value
    return acc
  }, {})
  return new Date(`${parts.year}-${parts.month}-${parts.day}T12:00:00+08:00`)
}

function nearestSolarTerm(date) {
  const terms = [
    ['小寒', 1, 5], ['大寒', 1, 20], ['立春', 2, 4], ['雨水', 2, 19],
    ['惊蛰', 3, 5], ['春分', 3, 20], ['清明', 4, 4], ['谷雨', 4, 20],
    ['立夏', 5, 5], ['小满', 5, 21], ['芒种', 6, 5], ['夏至', 6, 21],
    ['小暑', 7, 7], ['大暑', 7, 22], ['立秋', 8, 7], ['处暑', 8, 23],
    ['白露', 9, 7], ['秋分', 9, 23], ['寒露', 10, 8], ['霜降', 10, 23],
    ['立冬', 11, 7], ['小雪', 11, 22], ['大雪', 12, 7], ['冬至', 12, 22],
  ]
  const current = terms
    .map(([name, month, day]) => ({ name, date: new Date(date.getFullYear(), month - 1, day) }))
    .filter((item) => item.date <= date)
    .pop() || { name: '冬至', date: new Date(date.getFullYear() - 1, 11, 22) }
  const next = terms
    .map(([name, month, day]) => ({ name, date: new Date(date.getFullYear(), month - 1, day) }))
    .find((item) => item.date > date) || { name: '小寒', date: new Date(date.getFullYear() + 1, 0, 5) }
  return {
    current: current.name,
    next: next.name,
    daysToNext: Math.max(0, Math.ceil((next.date - date) / 86400000)),
  }
}

function buildLuckyHours(seed, dayGanzhi) {
  const hours = [
    ['子时', '23:00-01:00'], ['丑时', '01:00-03:00'], ['寅时', '03:00-05:00'], ['卯时', '05:00-07:00'],
    ['辰时', '07:00-09:00'], ['巳时', '09:00-11:00'], ['午时', '11:00-13:00'], ['未时', '13:00-15:00'],
    ['申时', '15:00-17:00'], ['酉时', '17:00-19:00'], ['戌时', '19:00-21:00'], ['亥时', '21:00-23:00'],
  ]
  return rotateBy(hours, seed + String(dayGanzhi || '').charCodeAt(0)).slice(0, 3).map(([name, range]) => ({ name, range }))
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

function extractBoardFacts(board) {
  if (!board) return []
  const facts = []
  const data = board.data || board
  if (board.title) facts.push(`盘面：${board.title}`)
  if (board.source) facts.push(`来源：${board.source}`)

  collectNamedFacts(facts, data.meta, '元信息')
  collectNamedFacts(facts, data.center, '中心')

  if (Array.isArray(data.rows)) {
    for (const row of data.rows.slice(0, 8)) {
      if (Array.isArray(row)) facts.push(row.map(valueText).join('：'))
    }
  }
  if (Array.isArray(data.cells)) {
    for (const cell of data.cells.slice(0, 9)) {
      facts.push(Array.isArray(cell) ? cell.map(valueText).join('/') : valueText(cell))
    }
  }
  if (Array.isArray(data.lines)) {
    for (const line of data.lines.slice(0, 6)) {
      facts.push(Array.isArray(line) ? line.map(valueText).join('/') : valueText(line))
    }
  }
  if (Array.isArray(data.palaces)) {
    for (const palace of data.palaces.slice(0, 6)) {
      facts.push(typeof palace === 'object'
        ? [palace.name, palace.star, palace.note].filter(Boolean).map(valueText).join('/')
        : valueText(palace))
    }
  }
  for (const key of ['original', 'mutual', 'changed', 'relation']) {
    if (data[key]) facts.push(`${key}：${valueText(data[key])}`)
  }
  if (Array.isArray(data.cards)) {
    for (const card of data.cards.slice(0, 6)) {
      facts.push(Array.isArray(card) ? card.map(valueText).join('/') : valueText(card))
    }
  }

  return [...new Set(facts.filter(Boolean).map((item) => String(item).slice(0, 180)))].slice(0, 16)
}

function collectNamedFacts(facts, value, prefix) {
  if (!value || typeof value !== 'object') return
  for (const [key, item] of Object.entries(value).slice(0, 8)) {
    const text = valueText(item, '')
    if (text) facts.push(`${prefix}${key}：${text}`)
  }
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
