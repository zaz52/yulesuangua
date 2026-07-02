const DEFAULT_MODEL = 'meta/llama-3.1-8b-instruct'

const skills = [
  { id: 'bazi', name: '四柱八字', description: '通过出生时间排出四柱八字，分析命理节奏与阶段重点。', icon: '乾' },
  { id: 'yinyuan', name: '姻缘测算', description: '围绕关系状态、相处模式、桃花机缘与长期稳定性解读。', icon: '缘' },
  { id: 'fojiao', name: '佛学开示', description: '以经典智慧回应困惑，提供心性整理与行动提醒。', icon: '慧' },
  { id: 'qimen', name: '奇门遁甲', description: '按时间与问题排盘，辅助观察时机、方位与行动策略。', icon: '门' },
]

const prompts = {
  bazi: '你是谨慎的四柱八字传统文化解读助手。请基于用户提供的出生信息和问题，输出结构化分析：基本信息复述、性格与节奏、当前关注点、未来建议、理性提醒。不要声称绝对预测，不提供医疗、法律、财务等专业结论。',
  yinyuan: '你是温和的姻缘关系解读助手。请基于关系状态、双方信息和关注点，输出结构化分析：关系现状、相处模式、可能阻碍、可执行建议、理性提醒。不要制造依赖，不鼓励骚扰、控制或极端行为。',
  fojiao: '你是佛学文化视角的开示助手。请以慈悲、清明、可执行的方式回应困惑，输出：当下困惑、心念观察、经典义理方向、日常练习建议、理性提醒。不要冒充高僧，不做医疗或心理诊断。',
  qimen: '你是奇门遁甲传统文化解读助手。请基于时间、地点、事情类型和所问之事，输出：问题复述、时机观察、行动取舍、风险提醒、理性建议。不要声称绝对预测，不替代现实专业判断。',
}

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers }
  }

  const path = getApiPath(event.path)

  try {
    if (event.httpMethod === 'GET' && path === '/health') {
      return json({ status: 'ok', llm_mode: process.env.LLM_API_KEY ? 'external' : 'unavailable', runtime: 'netlify-functions' })
    }

    if (event.httpMethod === 'GET' && path === '/divine/skills') {
      return json({ skills })
    }

    if (event.httpMethod === 'GET' && path === '/divine/lunar') {
      const date = new URL(event.rawUrl).searchParams.get('date') || ''
      return json(lunarFallback(date))
    }

    const match = path.match(/^\/divine\/([a-z]+)$/)
    if (event.httpMethod === 'POST' && match) {
      const skill = match[1]
      if (!prompts[skill]) return json({ error: '未知测算类型' }, 404)

      const payload = JSON.parse(event.body || '{}')
      const answer = await callModel(skill, payload.message || '')
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache',
        },
        body: `data: ${answer.replace(/\n/g, '\\n')}\n\ndata: [DONE]\n\n`,
      }
    }

    return json({ error: '接口不存在', path }, 404)
  } catch (error) {
    return json({ error: error.message || '服务暂时不可用' }, 500)
  }
}

function getApiPath(path) {
  return path
    .replace(/^\/\.netlify\/functions\/api/, '')
    .replace(/^\/api/, '') || '/'
}

function json(data, statusCode = 200) {
  return {
    statusCode,
    headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(data),
  }
}

function lunarFallback(date) {
  const year = Number((date || '').slice(0, 4))
  const zodiac = ['猴', '鸡', '狗', '猪', '鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊']
  return {
    solar: date,
    lunar_full: date ? `农历换算待后端排盘服务校准（阳历 ${date}）` : '未提供日期',
    ganzhi_year: '',
    ganzhi_month: '',
    ganzhi_day: '',
    shengxiao: Number.isFinite(year) ? zodiac[year % 12] : '',
    is_leap: false,
  }
}

async function callModel(skill, message) {
  const apiKey = process.env.LLM_API_KEY
  if (!apiKey) {
    return '当前后端函数已上线，但还没有配置 LLM_API_KEY，暂时无法调用 AI 模型。请在 Netlify 环境变量中配置后重新部署。'
  }

  const baseUrl = (process.env.LLM_BASE_URL || 'https://integrate.api.nvidia.com/v1').replace(/\/$/, '')
  const model = process.env.LLM_MODEL || DEFAULT_MODEL
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: prompts[skill] },
        { role: 'user', content: message },
      ],
      temperature: 0.75,
      max_tokens: 1400,
      stream: false,
    }),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`模型调用失败：${response.status} ${detail.slice(0, 200)}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || '模型没有返回内容，请稍后重试。'
}
