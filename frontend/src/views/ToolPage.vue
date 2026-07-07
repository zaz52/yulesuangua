<template>
  <main class="tool-page mystic-app">
    <header class="mystic-topbar">
      <a class="brand" href="/" aria-label="乾坤之道首页">
        <span class="brand-seal">卦</span>
        <span><strong>乾坤之道</strong><em>功能中心</em></span>
      </a>
      <nav class="nav-links" aria-label="主导航">
        <a href="/">首页</a>
        <a href="/divine/bazi">AI问卦</a>
        <a href="/tools/qiming">功能中心</a>
        <a href="/">说明</a>
      </nav>
      <div class="mystic-actions">
        <span class="ds-badge green">隐私保护</span>
        <button class="ds-button primary" type="button" @click="router.push('/zhouyi')">开始问卦</button>
      </div>
    </header>

    <section class="tool-shell mystic-layout">
      <aside class="tool-side left-rail">
        <button class="rail-link" type="button" @click="router.push('/')"><i>⌂</i><span>首页</span></button>
        <span class="rail-section-title">辅助工具</span>
        <div class="side-links">
          <button v-for="item in tools" :key="item.id" type="button" class="rail-link" :class="{ active: item.id === toolId }" @click="router.push(`/tools/${item.id}`)">
            <i>{{ item.icon }}</i><span>{{ item.name }}</span>
          </button>
        </div>
      </aside>

      <section class="tool-main main-workspace">
        <article class="tool-hero hero-workspace">
          <div>
            <span class="section-kicker">{{ tool.kicker }}</span>
            <h1>{{ tool.name }}</h1>
            <p>{{ tool.description }}</p>
          </div>
          <button class="ds-button ghost" type="button" @click="router.push(`/divine/${tool.related}`)">AI 深问</button>
        </article>
        <div class="work-tabs"><span class="active">基础信息</span><span>{{ toolId === 'qiming' ? '起名结果' : '推演结果' }}</span></div>
        <p class="tool-privacy-note">隐私保护：工具页输入内容只用于当前页面生成结果，不写入本地浏览器或远端数据库。</p>

        <article v-if="toolId === 'huangli'" class="work-card oracle-card">
          <PanelHead kicker="Daily Almanac" title="今日宜忌" :badge="today" />
          <div class="huangli-actions">
            <label class="ds-field">
              <span>择日日期</span>
              <input v-model="huangliDate" type="date" @change="loadHuangli(true)" />
            </label>
            <button class="ds-button primary" type="button" :disabled="huangliLoading" @click="loadHuangli(true)">
              {{ huangliLoading ? '正在推演...' : '重新推演' }}
            </button>
          </div>
          <div v-if="huangliLoading" class="name-state" role="status" aria-live="polite">正在换算农历、干支、节气和今日宜忌...</div>
          <div v-if="huangliError" class="name-state error" role="alert">{{ huangliError }}</div>
          <AlmanacBoard :data="huangliData" :source="huangliSource" />
        </article>

        <article v-else-if="toolId === 'lingqian'" class="work-card oracle-card lingqian-ritual">
          <PanelHead kicker="Spiritual Lot" title="灵签占问" :badge="lot.level" />
          <div class="lingqian-hero">
            <div>
              <button class="ds-button primary" type="button" @click="drawLot">抽取灵签</button>
              <span>今日可抽取 3 次</span>
            </div>
          </div>
          <div class="lingqian-result">
            <div class="lot-stick"><span>{{ lot.title.replace('：', '\n') }}</span></div>
            <section>
              <h3>{{ lot.title }}</h3>
              <strong>签文</strong>
              <p>{{ lot.text }}</p>
              <div class="lot-tags"><span>事业</span><span>财运</span><span>感情</span><span>健康</span></div>
            </section>
          </div>
        </article>

        <article v-else-if="toolId === 'jiemeng'" class="work-card oracle-card dream-ritual">
          <PanelHead kicker="Dream Reading" title="梦境解析" badge="本页解析" />
          <p>请尽可能详细地描述您的梦境，包括场景、人物、事件、情绪感受等细节。</p>
          <label class="ds-field wide dream-textarea"><span>梦境内容</span><textarea v-model.trim="dreamForm.dream" placeholder="请输入您的梦境内容..."></textarea></label>
          <div class="dream-prompts">
            <button v-for="prompt in dreamPrompts" :key="prompt" type="button" @click="appendDreamPrompt(prompt)">{{ prompt }}</button>
          </div>
          <button class="ds-button primary dream-action" type="button" @click="analyzeDream">开始解析</button>
          <ResultBlock title="梦象提示" :copy="dreamResult" />
        </article>

        <article v-else-if="toolId === 'qiming'" class="work-card oracle-card qiming-ritual">
          <PanelHead kicker="Naming" title="美称生成" badge="候选名册" />
          <div class="form-grid qiming-form">
            <label class="ds-field"><span>姓氏</span><input v-model.trim="nameForm.familyName" placeholder="例如：林" /></label>
            <label class="ds-field"><span>性别</span><select v-model="nameForm.gender"><option>男</option><option>女</option><option>不限</option></select></label>
            <label class="ds-field"><span>农历生日</span><input v-model.trim="nameForm.birth" placeholder="例如：2024-04-16" /></label>
            <label class="ds-field"><span>出生时辰</span><select v-model="nameForm.shichen"><option v-for="item in shichenOptions" :key="item">{{ item }}</option></select></label>
            <label class="ds-field wide"><span>偏好</span><input v-model.trim="nameForm.style" placeholder="例如：清雅、自然、有诗意、不要生僻字" /></label>
          </div>
          <button class="ds-button primary" type="button" :disabled="nameLoading || !canGenerateNames" @click="generateNames">
            {{ nameLoading ? '正在生成...' : '生成名册' }}
          </button>
          <p v-if="!canGenerateNames" class="form-helper">请先填写姓氏和农历生日，生日格式如 2024-04-16。</p>
          <NameBoard
            :names="nameCandidates"
            :summary="nameResult"
            :loading="nameLoading"
            :error="nameError"
            :analysis="nameAnalysis"
            :source="nameSource"
          />
        </article>

        <article v-else class="work-card oracle-card">
          <PanelHead kicker="Wish & Incense" title="祈福上香" :badge="`香火 ${incenseCount} 点`" />
          <div class="form-grid">
            <label class="ds-field"><span>祈福对象</span><select v-model="wishForm.target"><option>自己</option><option>家人</option><option>朋友</option><option>众生</option></select></label>
            <label class="ds-field wide"><span>心愿</span><textarea v-model.trim="wishForm.text" placeholder="写下今天想安放的一句话"></textarea></label>
          </div>
          <button class="ds-button primary" type="button" @click="offerIncense">敬上三炷香</button>
          <ResultBlock title="心愿回响" :copy="wishResult" />
        </article>
      </section>

      <aside class="right-rail">
        <article class="right-rail-card">
          <div class="card-title-row"><h3>今日指引</h3><span class="ds-badge">查看详情</span></div>
          <div class="mini-item"><strong>宜</strong><span>祭祀 祈福 求嗣 出行 修造 纳采 订盟</span></div>
          <div class="mini-item"><strong>忌</strong><span>动土 破土 安葬 冠笄 造桥</span></div>
          <p>名者，命也。名正则言顺，命善则运通。</p>
        </article>
        <article class="right-rail-card">
          <h3>推荐功能</h3>
          <div class="quick-icons">
            <button type="button" @click="router.push('/tools/qiming')"><b>名</b>姓名分析</button>
            <button type="button" @click="router.push('/divine/bazi')"><b>命</b>八字精批</button>
            <button type="button" @click="router.push('/divine/hehun')"><b>合</b>合婚配对</button>
            <button type="button" @click="router.push('/tools/xianghuo')"><b>香</b>祈福上香</button>
          </div>
        </article>
      </aside>
    </section>
  </main>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { calculateChart } from '../api/divine'

const ResultBlock = defineComponent({
  props: { title: String, copy: String },
  setup(props) {
    return () => h('section', { class: 'result-block' }, [h('strong', props.title), h('p', props.copy)])
  },
})

const PanelHead = defineComponent({
  props: { kicker: String, title: String, badge: String },
  setup(props) {
    return () => h('div', { class: 'panel-head' }, [h('div', [h('span', { class: 'section-kicker' }, props.kicker), h('h2', props.title)]), h('span', { class: 'ds-badge gold' }, props.badge)])
  },
})

const AlmanacBoard = defineComponent({
  props: { data: Object, source: String },
  setup(props) {
    const list = (key) => Array.isArray(props.data?.[key]) ? props.data[key].join('、') : props.data?.[key] || '待推演'
    return () => h('section', { class: 'almanac-board' }, [
      h('div', { class: 'almanac-hero-card' }, [
        h('span', props.data?.weekday || '今日'),
        h('strong', props.data?.theme || '先稳后动'),
        h('em', props.source ? `来源：${props.source}` : '本页规则预览'),
      ]),
      h('div', { class: 'almanac-meta' }, [
        h('div', [h('span', '公历'), h('strong', props.data?.date || '今日')]),
        h('div', [h('span', '农历'), h('strong', props.data?.lunar || '待换算')]),
        h('div', [h('span', '干支'), h('strong', [props.data?.ganzhi?.year, props.data?.ganzhi?.month, props.data?.ganzhi?.day].filter(Boolean).join(' / ') || '待定')]),
        h('div', [h('span', '节气'), h('strong', `${props.data?.jieqi?.current || '待定'} → ${props.data?.jieqi?.next || '待定'}`)]),
      ]),
      h('div', { class: 'almanac-grid' }, [
        h('div', [h('span', '宜'), h('strong', list('yi'))]),
        h('div', [h('span', '忌'), h('strong', list('ji'))]),
        h('div', [h('span', '吉时'), h('strong', (props.data?.luckyHours || []).map((item) => `${item.name} ${item.range}`).join('、') || '待定')]),
        h('div', [h('span', '方位'), h('strong', props.data?.directions ? `${props.data.directions.lucky}利推进，${props.data.directions.calm}利收束` : '待定')]),
      ]),
      h('div', { class: 'almanac-advice' }, [
        h('strong', '今日提醒'),
        h('p', props.data?.reminder || '黄历仅作传统文化参考，不作为现实决策依据。'),
        h('strong', '桌面建议'),
        h('p', props.data?.desk || '保持桌面清爽，先清理正前方杂物。'),
      ]),
    ])
  },
})

const NameBoard = defineComponent({
  props: {
    names: Array,
    summary: String,
    loading: Boolean,
    error: String,
    analysis: Object,
    source: String,
  },
  setup(props) {
    const renderSummary = () => {
      if (!props.analysis) return null
      const items = [
        ['日主', props.analysis.dayMaster],
        ['补益', props.analysis.elementFocus],
        ['用神', props.analysis.usefulGod],
        ['农历', props.analysis.lunarDate],
      ].filter((item) => item[1])
      return h('div', { class: 'name-analysis', 'aria-label': '八字五行依据' }, items.map(([label, value]) => h('div', [
        h('span', label),
        h('strong', value),
      ])))
    }

    const renderPillars = () => {
      const plate = props.analysis?.plate
      if (!plate?.columns?.length) return null
      const rows = [
        ['天干', plate.gan],
        ['地支', plate.zhi],
        ['干支', plate.ganzhi],
        ['十神', plate.tenGods],
        ['纳音', plate.nayin],
      ]
      return h('section', { class: 'naming-plate', 'aria-label': '四柱起名排盘' }, [
        h('div', { class: 'plate-title' }, [
          h('span', '生辰排盘'),
          h('strong', plate.title || '四柱命名盘'),
        ]),
        h('div', { class: 'pillar-table', role: 'table', 'aria-label': '四柱命名盘表' }, [
          h('div', { class: 'pillar-table-row head', role: 'row' }, [
            h('span', { role: 'columnheader' }, '四柱'),
            ...plate.columns.map((column) => h('strong', { role: 'columnheader' }, column)),
          ]),
          ...rows.map(([label, values]) => h('div', { class: ['pillar-table-row', label === '干支' ? 'ganzhi' : ''], role: 'row' }, [
            h('span', { role: 'rowheader' }, label),
            ...plate.columns.map((_, index) => h('strong', { role: 'cell' }, values?.[index] || '待定')),
          ])),
        ]),
      ])
    }

    const renderElements = () => {
      const elements = props.analysis?.elements || []
      if (!elements.length) return null
      const max = Math.max(...elements.map((item) => item.score), 1)
      return h('section', { class: 'element-plate', 'aria-label': '五行补益盘' }, [
        h('div', { class: 'plate-title' }, [
          h('span', '五行补益'),
          h('strong', props.analysis?.elementFocus || '待定'),
        ]),
        h('div', { class: 'element-bars' }, elements.map((item) => h('div', { class: ['element-row', item.focus ? 'focus' : ''] }, [
          h('span', item.name),
          h('i', { style: { '--value': `${Math.max(8, Math.round((item.score / max) * 100))}%` } }),
          h('strong', `${item.score}`),
        ]))),
        h('div', { class: 'naming-rules' }, [
          h('div', [h('span', '宜补'), h('strong', props.analysis?.elementFocus || '待定')]),
          h('div', [h('span', '避用'), h('strong', props.analysis?.avoidFocus || '避免过偏')]),
          h('div', [h('span', '原则'), h('strong', '先平衡五行，再看读音字义')]),
        ]),
      ])
    }

    return () => h('section', { class: 'name-board' }, [
      h('div', { class: 'name-board-head' }, [
        h('div', [h('span', '起名命盘'), h('strong', props.summary)]),
        h('em', props.source ? `排盘来源：${props.source}` : '填写后生成命名排盘'),
      ]),
      props.loading ? h('div', { class: 'name-state', role: 'status', 'aria-live': 'polite' }, '正在排八字并推演五行补益...') : null,
      props.error ? h('div', { class: 'name-state error', role: 'alert' }, props.error) : null,
      renderSummary(),
      renderPillars(),
      renderElements(),
      !props.loading && !(props.names || []).length ? h('div', { class: 'name-state empty' }, '填写信息后生成候选名册。') : null,
      h('div', { class: 'name-grid' }, (props.names || []).map((item) => h('article', { class: 'name-card' }, [
        h('div', { class: 'name-main' }, [h('strong', item.full), h('span', item.pinyin)]),
        h('p', item.meaning),
        h('div', { class: 'name-tags' }, item.tags.map((tag) => h('span', tag))),
        h('dl', [
          h('div', [h('dt', '补益'), h('dd', item.element)]),
          h('div', [h('dt', '气质'), h('dd', item.style)]),
          item.reason ? h('div', [h('dt', '依据'), h('dd', item.reason)]) : null,
          item.avoid ? h('div', [h('dt', '避用'), h('dd', item.avoid)]) : null,
        ]),
      ]))),
    ])
  },
})

const route = useRoute()
const router = useRouter()
const toolId = computed(() => route.params.tool || 'huangli')

const tools = [
  { id: 'huangli', icon: '历', name: '今日黄历', kicker: 'Almanac', related: 'qimen', description: '查看今日宜忌、吉时、方位与行动提醒。' },
  { id: 'lingqian', icon: '签', name: '灵签占问', kicker: 'Lot', related: 'fojiao', description: '填写所问之事，抽取签文并获得一段解释。' },
  { id: 'jiemeng', icon: '梦', name: '梦境解析', kicker: 'Dream', related: 'fojiao', description: '输入梦境、醒来情绪与现实背景，仅在当前页面整理梦象提示。' },
  { id: 'qiming', icon: '名', name: '宝宝起名', kicker: 'Naming', related: 'bazi', description: '填写姓氏、生日与偏好，生成命名方向和名字候选。' },
  { id: 'xianghuo', icon: '香', name: '祈福上香', kicker: 'Wish', related: 'fojiao', description: '写下心愿并获得本页回响，不在本地或远端保存个人愿望。' },
]

const tool = computed(() => tools.find((item) => item.id === toolId.value) || tools[0])
const today = computed(() => new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date()))
const huangliDate = ref(todayDateString())
const huangliLoading = ref(false)
const huangliError = ref('')
const huangliSource = ref('规则预览')
const huangliData = ref(buildFallbackHuangli())
const question = ref('')
const lotIndex = ref(0)
const lots = [
  { level: '上吉', title: '第一签：云开见月', text: '事情已有转机，但要先把问题说清楚。宜主动沟通，忌反复试探。' },
  { level: '中吉', title: '第十七签：静水照心', text: '当前更适合观察和整理，不宜急着定结论。把补充信息带入 AI 深问会更准确。' },
  { level: '小吉', title: '第三十二签：风入竹林', text: '外界变化较多，先守住边界，再看时机推进。' },
]
const lot = computed(() => lots[lotIndex.value % lots.length])
const dreamForm = ref({ dream: '', mood: '平静', context: '' })
const dreamPrompts = [
  '梦中的主要场景是什么？',
  '出现了哪些人物或动物？',
  '发生了什么事情？',
  '您的情绪感受如何？',
  '梦中有哪些特别的物品或符号？',
  '梦醒时的第一感受？',
]
const dreamResult = ref('填写梦境后点击解析，会从象意、情绪和现实提醒三个角度生成提示。')
const shichenOptions = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时']
const nameForm = ref({ familyName: '', gender: '不限', birth: '', shichen: '辰时', style: '' })
const nameResult = ref('填写姓氏、农历生日和偏好后生成候选名册。')
const nameCandidates = ref(buildNameCandidates('林', '清雅、自然'))
const nameLoading = ref(false)
const nameError = ref('')
const nameSource = ref('规则示例')
const nameAnalysis = ref({
  dayMaster: '待排盘',
  elementFocus: '填写后生成',
  usefulGod: '待分析',
  lunarDate: '农历生日',
  avoidFocus: '待分析',
  plate: buildFallbackNamePlate(),
  elements: buildFallbackElements('木火'),
})
const canGenerateNames = computed(() => Boolean(nameForm.value.familyName.trim() && isValidBirthDate(nameForm.value.birth)))
const wishForm = ref({ target: '自己', text: '' })
const wishResult = ref('写下心愿后，点击上香会在当前页面显示，不会保存到本地浏览器。')
const incenseCount = ref(108)

onMounted(() => {
  if (toolId.value === 'liuyao') router.replace('/zhouyi')
  if (toolId.value === 'huangli') loadHuangli()
})

watch(toolId, (next) => {
  if (next === 'liuyao') router.replace('/zhouyi')
  if (next === 'huangli') loadHuangli()
})

function drawLot() {
  lotIndex.value += 1
}

function analyzeDream() {
  const mood = dreamForm.value.mood
  const context = dreamForm.value.context || '未填写现实背景'
  dreamResult.value = `梦境可先看三层：一是画面象意，二是醒来时的${mood}情绪，三是它和现实背景“${context}”的关系。建议把梦中最强烈的画面写成一句问题，再进入佛学开示继续深问。`
}

function appendDreamPrompt(prompt) {
  const current = dreamForm.value.dream.trim()
  dreamForm.value.dream = current ? `${current}\n${prompt}` : prompt
}

async function loadHuangli(force = false) {
  if (huangliLoading.value) return
  if (!force && huangliSource.value !== '规则预览') return
  huangliLoading.value = true
  huangliError.value = ''

  try {
    const result = await calculateChart('daily-fortune', { date: huangliDate.value })
    huangliData.value = result.data
    huangliSource.value = result.source || '黄历规则'
  } catch (error) {
    huangliData.value = buildFallbackHuangli(huangliDate.value)
    huangliSource.value = '本页规则兜底'
    huangliError.value = `黄历接口暂时不可用，已使用本页规则兜底。原因：${error.message || '网络异常'}`
  } finally {
    huangliLoading.value = false
  }
}

function buildFallbackHuangli(date = huangliDate?.value || todayDateString()) {
  const seed = stableNumber(date)
  const yi = rotateLocal(['问卦复盘', '整理计划', '拜访长辈', '学习进修', '清理桌面', '小步沟通'], seed).slice(0, 4)
  const ji = rotateLocal(['冲动承诺', '借贷担保', '情绪争执', '临时改约', '熬夜硬撑', '高风险投资'], seed + 2).slice(0, 4)
  const hours = rotateLocal([
    { name: '辰时', range: '07:00-09:00' },
    { name: '午时', range: '11:00-13:00' },
    { name: '酉时', range: '17:00-19:00' },
    { name: '亥时', range: '21:00-23:00' },
  ], seed).slice(0, 3)
  return {
    date,
    weekday: new Intl.DateTimeFormat('zh-CN', { weekday: 'long' }).format(new Date(`${date}T12:00:00`)),
    lunar: '待接口换算',
    ganzhi: { year: '待定', month: '待定', day: '待定' },
    jieqi: { current: '待定', next: '待定' },
    theme: ['先稳后动', '整理复盘', '谨慎沟通', '小步推进'][seed % 4],
    yi,
    ji,
    luckyHours: hours,
    directions: { lucky: '东南', calm: '西北', wealth: '正东' },
    desk: '今日宜先清空桌面正前方杂物，保留必要纸笔，减少干扰。',
    reminder: '适合先把问题写清楚，再进入周易起卦或奇门页面深问。黄历仅作传统文化参考，不作为现实决策依据。',
  }
}

function stableNumber(text) {
  return String(text).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

function todayDateString() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function rotateLocal(items, seed) {
  const offset = ((seed % items.length) + items.length) % items.length
  return [...items.slice(offset), ...items.slice(0, offset)]
}

async function generateNames() {
  if (!canGenerateNames.value || nameLoading.value) return
  const family = nameForm.value.familyName.trim()
  const style = nameForm.value.style.trim() || '清雅、自然、易读'
  nameLoading.value = true
  nameError.value = ''

  try {
    const chart = await calculateChart('bazi', {
      profile: {
        name: `${family}氏宝宝`,
        gender: nameForm.value.gender,
        birthDate: nameForm.value.birth,
        shichen: nameForm.value.shichen,
        isLeapMonth: false,
      },
    })
    const analysis = buildNameAnalysis(chart?.data, style)
    nameAnalysis.value = analysis
    nameSource.value = chart?.source || '八字排盘'
    nameCandidates.value = buildNameCandidates(family, style, analysis)
    nameResult.value = `${family}姓 · ${nameForm.value.gender} · 农历 ${nameForm.value.birth} ${nameForm.value.shichen} · ${analysis.elementFocus}`
  } catch (error) {
    const fallbackAnalysis = buildFallbackNameAnalysis(style)
    nameAnalysis.value = fallbackAnalysis
    nameSource.value = '本页规则兜底'
    nameCandidates.value = buildNameCandidates(family, style, fallbackAnalysis)
    nameResult.value = `${family}姓 · ${nameForm.value.gender} · 农历 ${nameForm.value.birth} ${nameForm.value.shichen} · 兜底生成`
    nameError.value = `八字排盘暂时不可用，已用本页规则生成候选。原因：${error.message || '网络异常'}`
  } finally {
    nameLoading.value = false
  }
}

function buildNameCandidates(family, style, analysis = buildFallbackNameAnalysis(style)) {
  const focus = analysis.elementFocus || '木火'
  const pool = [
    ...pickNamePool(focus),
    ['知宁', 'zhi ning', '知止而后有定，宁静而致远。', '木火', '清雅', ['静气', '书卷', '平衡']],
    ['景初', 'jing chu', '景行维贤，初心得守。', '木火', '明朗', ['开阔', '朝气', '有光']],
    ['予安', 'yu an', '予人安定，也自守安宁。', '土金', '温和', ['安定', '易读', '亲和']],
    ['云舒', 'yun shu', '云卷云舒，行止从容。', '水木', '自然', ['松弛', '灵动', '诗意']],
    ['沐辰', 'mu chen', '如沐清光，辰星有序。', '水土', '清新', ['朝气', '清润', '稳重']],
    ['若衡', 'ruo heng', '若水含章，衡心守正。', '木土', '端正', ['克制', '雅致', '格局']],
  ]
  const used = new Set()
  return pool.map(([name, pinyin, meaning, element, fallbackStyle, tags]) => ({
    full: `${family}${name}`,
    pinyin,
    meaning,
    element,
    style: style || fallbackStyle,
    tags: [...new Set([...(tags || []), ...focus.split('').filter((char) => '金木水火土'.includes(char)).map((char) => `${char}意`)])].slice(0, 4),
    reason: analysis.usefulGod ? `参考${analysis.usefulGod}与${analysis.dayMaster || '日主'}。` : `参考${focus}补益方向。`,
    avoid: buildAvoidNote(focus),
  })).filter((item) => {
    if (used.has(item.full)) return false
    used.add(item.full)
    return true
  }).slice(0, 6)
}

function isValidBirthDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || '').trim())
}

function buildNameAnalysis(board, style) {
  const highlights = Array.isArray(board?.highlights) ? board.highlights : []
  const rows = Array.isArray(board?.rows) ? board.rows : []
  const dayMaster = findHighlight(highlights, '日主') || findRowValue(rows, '天干', 3) || '待分析'
  const usefulGod = findHighlight(highlights, '用神') || '以八字平衡为先'
  const lunarDate = findHighlight(highlights, '农历') || '农历生日已接入'
  const elementFocus = inferElementFocus(`${dayMaster} ${usefulGod} ${style} ${flattenRows(rows)}`)
  const avoidFocus = inferAvoidFocus(board, elementFocus)
  return {
    dayMaster,
    usefulGod,
    lunarDate,
    elementFocus,
    avoidFocus,
    plate: buildNamePlate(board),
    elements: buildElementPlate(board, elementFocus),
  }
}

function buildFallbackNameAnalysis(style) {
  const elementFocus = inferElementFocus(style || '清雅自然')
  return {
    dayMaster: '未取得排盘',
    usefulGod: '以字义、读音、五行均衡为先',
    lunarDate: nameForm.value.birth || '未填写',
    elementFocus,
    avoidFocus: buildAvoidFocus(elementFocus),
    plate: buildFallbackNamePlate(),
    elements: buildFallbackElements(elementFocus),
  }
}

function buildNamePlate(board = {}) {
  const rows = Array.isArray(board?.rows) ? board.rows : []
  const columns = Array.isArray(board?.columns) ? board.columns : ['年柱', '月柱', '日柱', '时柱']
  const plate = {
    title: '四柱命名盘',
    columns,
    gan: rowValues(rows, '天干'),
    zhi: rowValues(rows, '地支'),
    ganzhi: rowValues(rows, '干支'),
    tenGods: rowValues(rows, '十神'),
    nayin: rowValues(rows, '纳音'),
  }
  if (plate.ganzhi.some(Boolean)) return plate
  return buildFallbackNamePlate()
}

function buildFallbackNamePlate() {
  return {
    title: '四柱命名盘',
    columns: ['年柱', '月柱', '日柱', '时柱'],
    gan: ['待', '待', '待', '待'],
    zhi: ['排', '排', '排', '排'],
    ganzhi: ['待定', '待定', '待定', '待定'],
    tenGods: ['待定', '待定', '日主', '待定'],
    nayin: ['待定', '待定', '待定', '待定'],
  }
}

function rowValues(rows, label) {
  const row = rows.find((item) => item?.[0] === label)
  return row ? row.slice(1, 5).map((item) => item || '待定') : []
}

function buildElementPlate(board, focus) {
  const scores = board?.raw?.wuxingStrength?.scores || {}
  const names = ['木', '火', '土', '金', '水']
  const hasScore = names.some((name) => Number.isFinite(Number(scores[name])))
  if (!hasScore) return buildFallbackElements(focus)
  return names.map((name) => ({
    name,
    score: Number(scores[name]) || 0,
    focus: String(focus || '').includes(name),
  }))
}

function buildFallbackElements(focus) {
  const base = { 木: 42, 火: 36, 土: 30, 金: 28, 水: 24 }
  return Object.entries(base).map(([name, score]) => ({
    name,
    score: String(focus || '').includes(name) ? score + 18 : score,
    focus: String(focus || '').includes(name),
  }))
}

function inferAvoidFocus(board, focus) {
  const avoid = board?.raw?.analysis?.usefulGod?.primaryAvoid || board?.raw?.analysis?.usefulGod?.avoid
  if (avoid) return valueTextLocal(avoid)
  return buildAvoidFocus(focus)
}

function buildAvoidFocus(focus) {
  const missing = ['金', '木', '水', '火', '土'].filter((element) => !String(focus || '').includes(element)).slice(0, 2)
  return missing.length ? `少偏${missing.join('、')}` : '避生僻与谐音'
}

function valueTextLocal(value) {
  if (Array.isArray(value)) return value.join('、')
  if (value && typeof value === 'object') return Object.values(value).filter(Boolean).join('、')
  return String(value || '')
}

function findHighlight(highlights, label) {
  const item = highlights.find((text) => String(text).startsWith(`${label}：`))
  return item ? String(item).split('：').slice(1).join('：').trim() : ''
}

function findRowValue(rows, label, index) {
  const row = rows.find((item) => item?.[0] === label)
  return row?.[index] || ''
}

function flattenRows(rows) {
  return rows.flat().filter(Boolean).join(' ')
}

function inferElementFocus(text) {
  const source = String(text || '')
  const scores = {
    木: /木|清|森|林|竹|春|生|舒|若/.test(source) ? 2 : 0,
    火: /火|明|景|阳|暖|光|朗|辰/.test(source) ? 2 : 0,
    土: /土|安|宁|稳|辰|衡|坤/.test(source) ? 2 : 0,
    金: /金|白|玉|钧|铭|秋|清/.test(source) ? 2 : 0,
    水: /水|云|沐|涵|润|雨|溪|宁/.test(source) ? 2 : 0,
  }
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([element]) => element)
    .join('') || '木火'
}

function pickNamePool(focus) {
  const bank = {
    木: [
      ['芷宁', 'zhi ning', '芷草清芬，宁定自守。', '木土', '清雅', ['草木', '安定', '书卷']],
      ['栩然', 'xu ran', '栩栩有生气，自然舒展。', '木火', '自然', ['灵动', '朝气', '开阔']],
    ],
    火: [
      ['昀初', 'yun chu', '日光初起，心性明净。', '火木', '明朗', ['有光', '朝气', '易读']],
      ['知晏', 'zhi yan', '知止知进，晏然从容。', '火土', '温润', ['克制', '稳定', '文雅']],
    ],
    土: [
      ['安予', 'an yu', '安于本心，予人温厚。', '土土', '温和', ['安定', '亲和', '厚重']],
      ['辰允', 'chen yun', '辰序有常，允执其中。', '土金', '端正', ['稳重', '守信', '格局']],
    ],
    金: [
      ['铭知', 'ming zhi', '铭记初心，知行相应。', '金火', '端正', ['清正', '自律', '书卷']],
      ['钧宁', 'jun ning', '钧衡有度，宁静致远。', '金土', '稳重', ['格局', '平衡', '有度']],
    ],
    水: [
      ['沐言', 'mu yan', '如沐清泉，言有分寸。', '水木', '清新', ['清润', '表达', '自然']],
      ['涵初', 'han chu', '涵养初心，清澈有度。', '水木', '温润', ['涵养', '诗意', '柔和']],
    ],
  }
  return focus.split('').flatMap((element) => bank[element] || [])
}

function buildAvoidNote(focus) {
  const missing = ['金', '木', '水', '火', '土'].filter((element) => !focus.includes(element)).slice(0, 2)
  return missing.length ? `少用过度偏${missing.join('、')}的字形，先看整体读音。` : '避免生僻字、重名率过高和谐音歧义。'
}

function offerIncense() {
  incenseCount.value += 3
  wishResult.value = `已为${wishForm.value.target}敬上三炷香。心愿仅在当前页面显示，不会保存到本地浏览器：${wishForm.value.text || '愿心安定，所行有度。'}`
}
</script>

<style scoped>
.tool-page {
  padding-bottom: 28px;
}

.title-center {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-center strong,
.title-center em {
  display: block;
  line-height: 1.25;
}

.title-center strong {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 400;
}

.title-center em {
  color: rgba(245, 234, 212, 0.58);
  font-size: 12px;
  font-style: normal;
}

.round-mark.small {
  width: 34px;
  height: 34px;
  font-size: 18px;
}

.tool-shell {
  align-items: start;
}

.tool-hero {
  display: flex;
  min-height: 240px;
  align-items: flex-end;
  justify-content: space-between;
  gap: 22px;
  background:
    linear-gradient(90deg, rgba(13, 9, 7, 0.86), rgba(13, 9, 7, 0.24)),
    radial-gradient(circle at 80% 34%, rgba(215, 179, 95, 0.2), transparent 34%),
    linear-gradient(145deg, rgba(255, 247, 231, 0.08), transparent);
}

.tool-hero h1 {
  margin: 12px 0 0;
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: clamp(48px, 7vw, 76px);
  font-weight: 400;
  line-height: 1;
}

.tool-hero p {
  max-width: 720px;
  color: var(--paper-dim);
}

.work-card {
  padding: 22px;
}

.work-card > * {
  position: relative;
  z-index: 1;
}

.tool-side h1,
.work-card h2 {
  margin: 12px 0 0;
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 400;
  line-height: 1.1;
}

.tool-side p,
.result-block p {
  color: var(--paper-dim);
}

.side-links {
  display: grid;
  gap: 8px;
  margin-top: 0;
}

.side-links button {
  width: 100%;
}

.side-links button.active,
.side-links button:hover {
  color: var(--gold-bright);
}

.tool-main {
  display: grid;
  gap: 16px;
}

.tool-privacy-note {
  margin: -4px 0 0;
  color: rgba(245, 234, 212, 0.64);
  font-size: 13px;
  line-height: 1.7;
}

.form-helper {
  margin: -6px 0 0;
  color: rgba(245, 234, 212, 0.62);
  font-size: 13px;
}

.ds-button:disabled {
  cursor: not-allowed;
  opacity: 0.52;
}

.work-card {
  display: grid;
  gap: 18px;
}

.huangli-actions {
  display: grid;
  grid-template-columns: minmax(180px, 260px) auto;
  gap: 12px;
  align-items: end;
}

.almanac-board {
  display: grid;
  gap: 14px;
}

.almanac-hero-card {
  display: grid;
  gap: 8px;
  min-height: 150px;
  align-content: center;
  padding: 22px;
  border: 1px solid rgba(215, 179, 95, 0.18);
  border-radius: var(--radius-sm);
  background:
    radial-gradient(circle at 84% 22%, rgba(215, 179, 95, 0.18), transparent 34%),
    linear-gradient(135deg, rgba(119, 27, 27, 0.18), rgba(0, 0, 0, 0.1));
}

.almanac-hero-card span,
.almanac-hero-card em {
  color: rgba(245, 234, 212, 0.62);
  font-size: 13px;
  font-style: normal;
}

.almanac-hero-card strong {
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: clamp(38px, 6vw, 62px);
  font-weight: 400;
  line-height: 1;
}

.almanac-meta {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.almanac-meta div {
  padding: 12px;
  border: 1px solid rgba(215, 179, 95, 0.14);
  border-radius: var(--radius-xs);
  background: rgba(255, 247, 231, 0.04);
}

.almanac-meta span {
  display: block;
  color: var(--seal);
  font-size: 12px;
  font-weight: 700;
}

.almanac-meta strong {
  display: block;
  margin-top: 5px;
  color: var(--paper);
  line-height: 1.5;
}

.lingqian-hero {
  min-height: 210px;
  display: grid;
  align-items: center;
  padding: 26px;
  border: 1px solid rgba(215, 179, 95, 0.14);
  border-radius: var(--radius-xs);
  background:
    linear-gradient(90deg, rgba(13, 9, 7, 0.72), rgba(13, 9, 7, 0.12)),
    radial-gradient(circle at 76% 42%, rgba(215, 179, 95, 0.2), transparent 32%);
}

.lingqian-hero div {
  display: grid;
  width: min(320px, 100%);
  gap: 12px;
  text-align: center;
}

.lingqian-hero span {
  color: var(--paper-dim);
}

.lingqian-result {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 24px;
  align-items: center;
  padding: 18px;
  border: 1px solid rgba(215, 179, 95, 0.16);
  border-radius: var(--radius-xs);
  background: rgba(0, 0, 0, 0.14);
}

.lot-stick {
  display: grid;
  min-height: 270px;
  place-items: center;
  border: 1px solid rgba(215, 179, 95, 0.22);
  border-radius: var(--radius-xs);
  background: radial-gradient(circle, rgba(215, 179, 95, 0.14), rgba(13, 9, 7, 0.62));
}

.lot-stick span {
  color: var(--ink);
  writing-mode: vertical-rl;
  white-space: pre-line;
  font-family: var(--font-display);
  font-size: 24px;
}

.lingqian-result h3 {
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 400;
}

.lingqian-result strong,
.dream-ritual p {
  color: var(--paper-dim);
}

.lot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.lot-tags span,
.dream-prompts button {
  padding: 6px 12px;
  border: 1px solid rgba(215, 179, 95, 0.18);
  border-radius: 999px;
  color: var(--paper-dim);
  background: rgba(255, 247, 231, 0.04);
}

.dream-ritual {
  position: relative;
  overflow: hidden;
  min-height: 560px;
}

.dream-textarea textarea {
  min-height: 190px;
}

.dream-prompts {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.dream-action {
  width: min(280px, 100%);
  justify-self: center;
}

.qiming-ritual {
  padding: 30px;
}

.qiming-form {
  grid-template-columns: 160px 160px 240px minmax(260px, 1fr);
  align-items: end;
}

.qiming-form .wide {
  grid-column: auto;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.form-grid,
.almanac-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.wide {
  grid-column: 1 / -1;
}

.almanac-grid div,
.result-block {
  padding: 14px;
  border: 1px solid rgba(215, 179, 95, 0.18);
  border-radius: var(--radius-xs);
  background: rgba(255, 247, 231, 0.05);
}

.almanac-grid span,
.result-block strong {
  color: var(--gold-bright);
  font-weight: 700;
}

.almanac-grid strong {
  display: block;
  margin-top: 6px;
}

.result-block p {
  margin: 8px 0 0;
}

.almanac-advice {
  display: grid;
  gap: 8px;
  padding: 16px;
  border: 1px solid rgba(215, 179, 95, 0.16);
  border-radius: var(--radius-xs);
  background: rgba(0, 0, 0, 0.14);
}

.almanac-advice strong {
  color: var(--gold-bright);
}

.almanac-advice p {
  margin: 0 0 8px;
  color: var(--paper-dim);
  line-height: 1.7;
}

.name-board {
  display: grid;
  gap: 14px;
  padding: 16px;
  border: 1px solid rgba(215, 179, 95, 0.2);
  border-radius: var(--radius-sm);
  background:
    radial-gradient(circle at 12% 0%, rgba(215, 179, 95, 0.12), transparent 30%),
    rgba(13, 9, 7, 0.28);
}

.name-board-head {
  display: flex;
  justify-content: space-between;
  gap: 14px;
}

.name-board-head span,
.name-board-head strong {
  display: block;
}

.name-board-head span {
  color: var(--seal);
  font-weight: 700;
  font-size: 12px;
}

.name-board-head strong {
  margin-top: 4px;
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 400;
}

.name-board-head em {
  color: rgba(245, 234, 212, 0.54);
  font-size: 12px;
  font-style: normal;
  text-align: right;
}

.name-state,
.name-analysis {
  padding: 12px 14px;
  border: 1px solid rgba(215, 179, 95, 0.16);
  border-radius: var(--radius-xs);
  color: var(--paper-dim);
  background: rgba(255, 247, 231, 0.04);
}

.name-state.error {
  border-color: rgba(180, 54, 45, 0.42);
  color: #f1b2a8;
  background: rgba(180, 54, 45, 0.1);
}

.name-state.empty {
  border-style: dashed;
}

.name-analysis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.name-analysis div {
  display: grid;
  gap: 4px;
}

.name-analysis span {
  color: var(--seal);
  font-size: 12px;
  font-weight: 700;
}

.name-analysis strong {
  color: var(--paper);
  font-weight: 600;
  line-height: 1.5;
}

.naming-plate,
.element-plate {
  display: grid;
  gap: 14px;
  padding: 16px;
  border: 1px solid rgba(215, 179, 95, 0.18);
  border-radius: var(--radius-sm);
  background:
    linear-gradient(180deg, rgba(255, 247, 231, 0.05), rgba(0, 0, 0, 0.1)),
    rgba(0, 0, 0, 0.16);
}

.plate-title {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.plate-title span {
  color: var(--seal);
  font-size: 12px;
  font-weight: 700;
}

.plate-title strong {
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 400;
}

.pillar-table {
  display: grid;
  overflow: hidden;
  border: 1px solid rgba(215, 179, 95, 0.18);
  border-radius: var(--radius-xs);
  background:
    radial-gradient(circle at 50% 0%, rgba(215, 179, 95, 0.1), transparent 34%),
    rgba(13, 9, 7, 0.34);
}

.pillar-table-row {
  display: grid;
  grid-template-columns: 72px repeat(4, minmax(0, 1fr));
  min-height: 48px;
  border-top: 1px solid rgba(215, 179, 95, 0.12);
}

.pillar-table-row:first-child {
  border-top: 0;
}

.pillar-table-row > span,
.pillar-table-row > strong {
  display: grid;
  min-width: 0;
  place-items: center;
  padding: 10px 8px;
  border-left: 1px solid rgba(215, 179, 95, 0.12);
  color: var(--paper);
  text-align: center;
  overflow-wrap: anywhere;
}

.pillar-table-row > span:first-child {
  border-left: 0;
  color: var(--seal);
  font-size: 12px;
  font-weight: 700;
}

.pillar-table-row.head {
  min-height: 52px;
  background: rgba(215, 179, 95, 0.08);
}

.pillar-table-row.head strong {
  color: var(--seal);
  font-weight: 700;
}

.pillar-table-row.ganzhi strong {
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 400;
}

.naming-rules div {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 8px;
  align-items: baseline;
  padding: 7px 8px;
  border: 1px solid rgba(215, 179, 95, 0.1);
  border-radius: var(--radius-xs);
  background: rgba(255, 247, 231, 0.035);
}

.naming-rules span {
  color: var(--seal);
  font-size: 12px;
  font-weight: 700;
}

.naming-rules strong {
  min-width: 0;
  color: var(--paper);
  overflow-wrap: anywhere;
}

.element-plate {
  grid-template-columns: minmax(0, 1.15fr) minmax(220px, 0.85fr);
}

.element-plate .plate-title {
  grid-column: 1 / -1;
}

.element-bars {
  display: grid;
  gap: 10px;
}

.element-row {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) 42px;
  gap: 10px;
  align-items: center;
}

.element-row span {
  color: var(--paper);
  font-weight: 700;
}

.element-row i {
  position: relative;
  height: 10px;
  overflow: hidden;
  border: 1px solid rgba(215, 179, 95, 0.12);
  border-radius: 999px;
  background: rgba(255, 247, 231, 0.05);
}

.element-row i::after {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: var(--value);
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(140, 35, 30, 0.86), rgba(215, 179, 95, 0.9));
}

.element-row.focus i::after {
  background: linear-gradient(90deg, rgba(215, 179, 95, 0.95), rgba(242, 214, 138, 0.95));
}

.element-row strong {
  color: var(--paper-dim);
  font-size: 12px;
  text-align: right;
}

.naming-rules {
  display: grid;
  gap: 8px;
}

.name-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.name-card {
  display: grid;
  gap: 10px;
  min-height: 260px;
  padding: 14px;
  border: 1px solid rgba(215, 179, 95, 0.16);
  border-radius: var(--radius-xs);
  background:
    radial-gradient(circle at 12% 10%, rgba(215, 179, 95, 0.12), transparent 32%),
    linear-gradient(145deg, rgba(255, 247, 231, 0.07), transparent),
    rgba(0, 0, 0, 0.16);
}

.name-main {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 10px;
}

.name-main strong {
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 38px;
  font-weight: 400;
}

.name-main span {
  color: rgba(245, 234, 212, 0.52);
  font-size: 12px;
}

.name-card p {
  margin: 0;
  color: var(--paper);
  line-height: 1.7;
}

.name-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.name-tags span {
  padding: 3px 8px;
  border: 1px solid rgba(215, 179, 95, 0.18);
  border-radius: 999px;
  color: var(--paper-dim);
  font-size: 12px;
}

.name-card dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin: 0;
}

.name-card dl div {
  padding: 8px;
  border: 1px solid rgba(215, 179, 95, 0.12);
  border-radius: var(--radius-xs);
  background: rgba(255, 247, 231, 0.04);
}

.name-card dt {
  color: var(--seal);
  font-size: 12px;
  font-weight: 700;
}

.name-card dd {
  margin: 3px 0 0;
  color: var(--paper);
  overflow-wrap: anywhere;
}

:deep(.name-board-head) {
  display: flex;
  justify-content: space-between;
  gap: 14px;
}

:deep(.name-board-head span),
:deep(.name-board-head strong) {
  display: block;
}

:deep(.name-board-head span),
:deep(.name-analysis span),
:deep(.plate-title span),
:deep(.pillar-table-row > span:first-child),
:deep(.naming-rules span),
:deep(.name-card dt) {
  color: var(--seal);
  font-size: 12px;
  font-weight: 700;
}

:deep(.name-board-head strong) {
  margin-top: 4px;
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 400;
}

:deep(.name-board-head em) {
  color: rgba(245, 234, 212, 0.54);
  font-size: 12px;
  font-style: normal;
  text-align: right;
}

:deep(.name-state),
:deep(.name-analysis),
:deep(.naming-plate),
:deep(.element-plate) {
  border: 1px solid rgba(215, 179, 95, 0.18);
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.16);
}

:deep(.name-state),
:deep(.name-analysis) {
  padding: 12px 14px;
  color: var(--paper-dim);
}

:deep(.name-state.error) {
  border-color: rgba(180, 54, 45, 0.42);
  color: #f1b2a8;
  background: rgba(180, 54, 45, 0.1);
}

:deep(.name-analysis) {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

:deep(.name-analysis div) {
  display: grid;
  gap: 4px;
}

:deep(.name-analysis strong) {
  color: var(--paper);
  font-weight: 600;
  line-height: 1.5;
}

:deep(.naming-plate),
:deep(.element-plate) {
  display: grid;
  gap: 14px;
  padding: 16px;
  background:
    linear-gradient(180deg, rgba(255, 247, 231, 0.05), rgba(0, 0, 0, 0.1)),
    rgba(0, 0, 0, 0.16);
}

:deep(.plate-title) {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

:deep(.plate-title strong) {
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 400;
}

:deep(.pillar-table) {
  display: grid;
  overflow: hidden;
  border: 1px solid rgba(215, 179, 95, 0.24);
  border-radius: var(--radius-xs);
  background: rgba(13, 9, 7, 0.42);
}

:deep(.pillar-table-row) {
  display: grid;
  grid-template-columns: 72px repeat(4, minmax(0, 1fr));
  min-height: 48px;
  border-top: 1px solid rgba(215, 179, 95, 0.18);
}

:deep(.pillar-table-row:first-child) {
  border-top: 0;
}

:deep(.pillar-table-row > span),
:deep(.pillar-table-row > strong) {
  display: grid;
  min-width: 0;
  place-items: center;
  padding: 10px 8px;
  border-left: 1px solid rgba(215, 179, 95, 0.16);
  color: var(--paper);
  text-align: center;
  overflow-wrap: anywhere;
}

:deep(.pillar-table-row > span:first-child) {
  border-left: 0;
}

:deep(.pillar-table-row.head) {
  min-height: 52px;
  background: rgba(215, 179, 95, 0.1);
}

:deep(.pillar-table-row.head strong) {
  color: var(--seal);
  font-weight: 700;
}

:deep(.pillar-table-row.ganzhi strong) {
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 400;
}

:deep(.element-plate) {
  grid-template-columns: minmax(0, 1.15fr) minmax(220px, 0.85fr);
}

:deep(.element-plate .plate-title) {
  grid-column: 1 / -1;
}

:deep(.element-bars),
:deep(.naming-rules) {
  display: grid;
  gap: 10px;
}

:deep(.element-row) {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) 42px;
  gap: 10px;
  align-items: center;
}

:deep(.element-row span) {
  color: var(--paper);
  font-weight: 700;
}

:deep(.element-row i) {
  position: relative;
  height: 10px;
  overflow: hidden;
  border: 1px solid rgba(215, 179, 95, 0.12);
  border-radius: 999px;
  background: rgba(255, 247, 231, 0.05);
}

:deep(.element-row i::after) {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: var(--value);
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(140, 35, 30, 0.86), rgba(215, 179, 95, 0.9));
}

:deep(.element-row.focus i::after) {
  background: linear-gradient(90deg, rgba(215, 179, 95, 0.95), rgba(242, 214, 138, 0.95));
}

:deep(.element-row strong) {
  color: var(--paper-dim);
  font-size: 12px;
  text-align: right;
}

:deep(.naming-rules div) {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 8px;
  align-items: baseline;
  padding: 7px 8px;
  border: 1px solid rgba(215, 179, 95, 0.1);
  border-radius: var(--radius-xs);
  background: rgba(255, 247, 231, 0.035);
}

:deep(.naming-rules strong) {
  color: var(--paper);
}

:deep(.name-grid) {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

:deep(.name-card) {
  display: grid;
  gap: 10px;
  min-height: 260px;
  padding: 14px;
  border: 1px solid rgba(215, 179, 95, 0.16);
  border-radius: var(--radius-xs);
  background:
    radial-gradient(circle at 12% 10%, rgba(215, 179, 95, 0.12), transparent 32%),
    linear-gradient(145deg, rgba(255, 247, 231, 0.07), transparent),
    rgba(0, 0, 0, 0.16);
}

:deep(.name-main) {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 10px;
}

:deep(.name-main strong) {
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 38px;
  font-weight: 400;
}

:deep(.name-main span) {
  color: rgba(245, 234, 212, 0.52);
  font-size: 12px;
}

:deep(.name-card p) {
  margin: 0;
  color: var(--paper);
  line-height: 1.7;
}

:deep(.name-tags) {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

:deep(.name-tags span) {
  padding: 3px 8px;
  border: 1px solid rgba(215, 179, 95, 0.18);
  border-radius: 999px;
  color: var(--paper-dim);
  font-size: 12px;
}

:deep(.name-card dl) {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin: 0;
}

:deep(.name-card dl div) {
  padding: 8px;
  border: 1px solid rgba(215, 179, 95, 0.12);
  border-radius: var(--radius-xs);
  background: rgba(255, 247, 231, 0.04);
}

:deep(.name-card dd) {
  margin: 3px 0 0;
  color: var(--paper);
  overflow-wrap: anywhere;
}

@media (max-width: 900px) {
  .tool-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .page-nav > .ds-button.gold,
  .title-center div {
    display: none;
  }

  .form-grid,
  .almanac-grid,
  .almanac-meta,
  .huangli-actions,
  .name-grid,
  .name-analysis,
  .element-plate,
  .panel-head {
    grid-template-columns: 1fr;
    display: grid;
  }

  .pillar-table-row {
    grid-template-columns: 52px repeat(4, minmax(54px, 1fr));
  }

  .pillar-table {
    overflow-x: auto;
  }

  :deep(.name-board-head),
  :deep(.plate-title) {
    display: grid;
    text-align: left;
  }

  :deep(.name-board-head em) {
    text-align: left;
  }

  :deep(.name-analysis),
  :deep(.element-plate),
  :deep(.name-grid) {
    grid-template-columns: 1fr;
  }

  :deep(.pillar-table) {
    overflow-x: auto;
  }

  :deep(.pillar-table-row) {
    grid-template-columns: 52px repeat(4, minmax(54px, 1fr));
  }

  :deep(.name-card dl) {
    grid-template-columns: 1fr;
  }

  .name-board-head {
    display: grid;
  }

  .name-board-head em {
    text-align: left;
  }

  .lingqian-result,
  .qiming-form {
    grid-template-columns: 1fr;
  }

  .lot-stick {
    min-height: 190px;
  }

  .qiming-form .wide {
    grid-column: 1 / -1;
  }
}
</style>
