const NETLIFY_API_BASE = 'https://suanguan.netlify.app/api'

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

  if (context.request.method === 'GET' && path === 'divine/skills') {
    return json({ skills: extendedSkills })
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
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
    },
  })
}
