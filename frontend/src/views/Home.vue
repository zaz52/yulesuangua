<template>
  <main class="home-page">
    <div class="ambient-glow" aria-hidden="true">
      <span v-for="dot in glowDots" :key="dot.left" :style="dot"></span>
    </div>

    <header class="temple-nav app-shell">
      <a class="brand" href="#top" aria-label="乾坤之道首页">
        <span class="brand-seal" aria-hidden="true">乾</span>
        <span>
          <strong>乾坤之道</strong>
          <em>AI 东方术数工具台</em>
        </span>
      </a>
      <nav class="nav-links" aria-label="主导航">
        <a href="#services">术法</a>
        <a href="#daily">今日</a>
        <a href="#ritual">祈福</a>
        <a href="#notice">说明</a>
      </nav>
      <button class="ds-button gold nav-action" type="button" @click="goDivine('bazi')">开始问卦</button>
    </header>

    <section id="top" class="hero app-shell">
      <div class="hero-copy">
        <div class="status-row">
          <span>{{ lunarText }}</span>
          <span>今日香火 {{ incenseCount }} 炷</span>
          <span>在线推演 {{ onlineCount }} 次</span>
        </div>
        <span class="section-kicker">Retro Oracle Interface</span>
        <h1>问事有盘，解卦有据</h1>
        <p class="hero-subtitle">
          参考寺院式沉浸体验，保留你的八字、姻缘、佛学、奇门 AI 推演能力，并补充黄历、灵签、祈福、上香等轻量功能入口。
        </p>
        <div class="hero-actions">
          <button class="ds-button primary" type="button" @click="goDivine('qimen')">起一局奇门</button>
          <button class="ds-button" type="button" @click="drawLot">抽一支今日签</button>
          <a class="ds-button ghost" href="#services">查看九宫</a>
        </div>
      </div>

      <div class="oracle-stage ds-card">
        <div class="moon-disc">
          <span>乾</span>
          <i></i>
        </div>
        <div class="stage-panel">
          <span>今日签</span>
          <strong>{{ currentLot.level }}</strong>
          <p>{{ currentLot.text }}</p>
        </div>
        <div class="incense-lines" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </section>

    <section id="services" class="app-shell service-section">
      <div class="section-head">
        <div>
          <span class="section-kicker">Nine Gates</span>
          <h2 class="section-title">九宫功能入口</h2>
          <p class="section-copy">核心四项连接 AI 后端，其余模块作为首页工具和引导入口，先让用户知道能做什么、需要填什么。</p>
        </div>
        <div v-if="!backendOk" class="offline ds-card">
          <strong>后端未连接</strong>
          <span>页面可正常预览；真实 AI 推演需要 API 可用。</span>
        </div>
      </div>

      <div class="service-grid">
        <article
          v-for="tool in tools"
          :key="tool.id"
          class="service-card ds-card"
          :class="[`tone-${tool.tone}`, { active: selectedTool.id === tool.id }]"
          @click="openTool(tool)"
        >
          <div class="service-top">
            <span class="service-icon" aria-hidden="true">{{ tool.icon }}</span>
            <span class="ds-badge" :class="tool.badgeTone">{{ tool.badge }}</span>
          </div>
          <h3>{{ tool.name }}</h3>
          <p>{{ tool.description }}</p>
          <button class="ds-button ghost" type="button">{{ tool.action }}</button>
        </article>
      </div>
    </section>

    <section id="daily" class="app-shell dashboard-section">
      <div class="daily-card ds-card">
        <span class="section-kicker">Daily Almanac</span>
        <h2>今日黄历</h2>
        <div class="almanac-grid">
          <div>
            <span>宜</span>
            <strong>{{ daily.good }}</strong>
          </div>
          <div>
            <span>忌</span>
            <strong>{{ daily.avoid }}</strong>
          </div>
          <div>
            <span>吉时</span>
            <strong>{{ daily.time }}</strong>
          </div>
        </div>
      </div>

      <div class="tool-detail ds-card">
        <span class="section-kicker">Selected Gate</span>
        <h2>{{ selectedTool.name }}</h2>
        <p>{{ selectedTool.detail }}</p>
        <div class="detail-actions">
          <button class="ds-button primary" type="button" @click="runSelectedTool">{{ selectedTool.primary }}</button>
          <button class="ds-button ghost" type="button" @click="drawLot">换一支签</button>
        </div>
      </div>
    </section>

    <section id="ritual" class="app-shell ritual-section">
      <div class="ritual-copy">
        <span class="section-kicker">Wish & Incense</span>
        <h2 class="section-title">一念安放，三炷清香</h2>
        <p class="section-copy">这部分借鉴参考站的“在线上香”和“心愿寄托”，但保持为轻量交互，不承诺现实结果。</p>
      </div>
      <div class="ritual-grid">
        <article class="wish-card ds-card">
          <label for="wish">写下今日心愿</label>
          <textarea id="wish" v-model.trim="wish" placeholder="例如：愿家人平安，愿自己心定后再做决定"></textarea>
          <button class="ds-button gold" type="button" @click="saveWish">寄放心愿</button>
          <span v-if="wishSaved">已记录在当前浏览器中</span>
        </article>
        <article class="incense-card ds-card">
          <div class="incense-burner" aria-hidden="true">
            <i></i>
            <i></i>
            <i></i>
          </div>
          <h3>在线上香</h3>
          <p>点一次增加三炷香火，用作仪式感和每日打卡。</p>
          <button class="ds-button primary" type="button" @click="offerIncense">敬上三炷香</button>
        </article>
      </div>
    </section>

    <section id="notice" class="app-shell trust-section">
      <article class="trust-card ds-card">
        <span class="section-kicker">Boundary</span>
        <h2>使用边界</h2>
        <p>所有测算、灵签、黄历和祈福内容仅供传统文化娱乐与自我观察参考，不构成医疗、法律、财务、婚恋等现实决策建议。</p>
      </article>
      <article class="trust-card ds-card">
        <span class="section-kicker">Privacy</span>
        <h2>隐私说明</h2>
        <p>心愿仅保存在当前浏览器本地。AI 问卦时，服务端只处理当次请求；后续如增加账号或记录功能，需要单独提示用户。</p>
      </article>
    </section>

    <nav class="mobile-tabs" aria-label="移动端快捷导航">
      <a href="#top">首页</a>
      <a href="#services">术法</a>
      <a href="#daily">今日</a>
      <a href="#ritual">祈福</a>
    </nav>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchSkills, isBackendAvailable } from '../api/divine'

const router = useRouter()
const backendOk = ref(true)
const apiSkills = ref([])
const selectedTool = ref({
  id: 'bazi',
  name: '四柱八字',
  detail: '出生信息排四柱，看性格节奏、事业财运与阶段重点。',
  primary: '进入八字',
})
const wish = ref('')
const wishSaved = ref(false)
const incenseCount = ref(108)
const lotIndex = ref(0)

const lots = [
  { level: '上吉', text: '所问之事宜先定心，再顺势推进。' },
  { level: '中吉', text: '先补信息，后看时机，不宜仓促定论。' },
  { level: '小吉', text: '今日适合整理旧事，少做情绪化决定。' },
]

const currentLot = computed(() => lots[lotIndex.value % lots.length])
const onlineCount = computed(() => 2600 + incenseCount.value * 3)
const lunarText = computed(() => new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date()))

const daily = {
  good: '问卦、复盘、整理计划',
  avoid: '冲动承诺、借贷担保',
  time: '辰时、午时、酉时',
}

const fallbackSkills = [
  { id: 'bazi', name: '四柱八字', shortName: '八字', description: '出生信息排四柱，看性格节奏、事业财运与阶段重点。', icon: '命', badge: '真排盘', tone: 'blue' },
  { id: 'yinyuan', name: '姻缘测算', shortName: '姻缘', description: '梳理关系状态、相处模式、桃花机缘与未来趋势。', icon: '缘', badge: '关系', tone: 'red' },
  { id: 'fojiao', name: '佛学开示', shortName: '开示', description: '用温和开示整理焦虑、执着、人际和行动方向。', icon: '慧', badge: '心性', tone: 'gold' },
  { id: 'qimen', name: '奇门遁甲', shortName: '奇门', description: '围绕具体问题观察时机、方位、风险和行动策略。', icon: '门', badge: '九宫', tone: 'green' },
]

const extraTools = [
  { id: 'huangli', name: '今日黄历', icon: '历', badge: '每日', badgeTone: 'gold', tone: 'gold', description: '查看今日宜忌、吉时和行动提醒。', action: '查看今日', primary: '查看黄历', detail: '适合做首页轻量提醒，帮助用户先判断今天是否适合提问、复盘或推进具体事情。' },
  { id: 'lingqian', name: '关签灵感', icon: '签', badge: '抽签', badgeTone: 'red', tone: 'red', description: '先抽一支今日签，再带着问题进入 AI 解读。', action: '抽一签', primary: '抽一支签', detail: '灵签模块用于生成简短启发，不替代正式 AI 问卦。用户可以把签文带入八字、姻缘或奇门继续追问。' },
  { id: 'jiemeng', name: '梦境解析', icon: '梦', badge: '新增', badgeTone: 'green', tone: 'green', description: '把梦境整理成象意、情绪和现实提醒。', action: '记录梦境', primary: '去佛学请益', detail: '目前先引导到佛学开示，用梦境中的情绪和困惑做一次心性整理。后续可独立做解梦表单。' },
  { id: 'qiming', name: '宝宝起名', icon: '名', badge: '规划', badgeTone: 'gold', tone: 'blue', description: '结合八字喜忌、音韵笔画和典故风格。', action: '先看八字', primary: '进入八字', detail: '起名需要更严谨的八字信息和偏好输入，现阶段先把用户导向八字资料补全。' },
  { id: 'xianghuo', name: '在线上香', icon: '香', badge: '祈福', badgeTone: 'red', tone: 'gold', description: '三炷香火，寄放心愿，形成每日仪式。', action: '去祈福', primary: '敬上三炷香', detail: '本地仪式模块，只记录当前浏览器里的心愿和香火数，不上传个人愿望。' },
]

const tools = computed(() => {
  const core = apiSkills.value.length
    ? apiSkills.value.map((skill) => {
        const fallback = fallbackSkills.find((item) => item.id === skill.id)
        return {
          ...fallback,
          ...skill,
          shortName: fallback?.shortName || skill.name,
          icon: fallback?.icon || skill.icon || '卦',
          badge: fallback?.badge || 'AI',
          badgeTone: 'green',
          action: `进入${fallback?.shortName || skill.name}`,
          primary: `进入${fallback?.shortName || skill.name}`,
          detail: fallback?.description || skill.description,
        }
      })
    : fallbackSkills.map((skill) => ({
        ...skill,
        badgeTone: 'green',
        action: `进入${skill.shortName}`,
        primary: `进入${skill.shortName}`,
        detail: skill.description,
      }))
  return [...core, ...extraTools]
})

const glowDots = [
  { left: '12%', top: '22%', animationDelay: '0s' },
  { left: '31%', top: '66%', animationDelay: '1.1s' },
  { left: '56%', top: '36%', animationDelay: '2.2s' },
  { left: '78%', top: '70%', animationDelay: '0.7s' },
  { left: '88%', top: '24%', animationDelay: '1.7s' },
]

onMounted(async () => {
  wish.value = localStorage.getItem('qk_wish') || ''
  incenseCount.value = Number(localStorage.getItem('qk_incense') || 108)
  try {
    const data = await fetchSkills()
    apiSkills.value = data.skills || []
    backendOk.value = isBackendAvailable() !== false
  } catch {
    backendOk.value = false
    apiSkills.value = []
  }
  selectedTool.value = tools.value[0]
})

function goDivine(skillId) {
  router.push(`/divine/${skillId}`)
}

function openTool(tool) {
  selectedTool.value = tool
  if (['bazi', 'yinyuan', 'fojiao', 'qimen'].includes(tool.id)) return
  if (tool.id === 'lingqian') drawLot()
}

function runSelectedTool() {
  const id = selectedTool.value?.id
  if (['bazi', 'yinyuan', 'fojiao', 'qimen'].includes(id)) goDivine(id)
  else if (id === 'huangli') document.querySelector('#daily')?.scrollIntoView({ behavior: 'smooth' })
  else if (id === 'lingqian') drawLot()
  else if (id === 'jiemeng') goDivine('fojiao')
  else if (id === 'qiming') goDivine('bazi')
  else offerIncense()
}

function drawLot() {
  lotIndex.value += 1
  selectedTool.value = extraTools.find((tool) => tool.id === 'lingqian') || selectedTool.value
}

function offerIncense() {
  incenseCount.value += 3
  localStorage.setItem('qk_incense', String(incenseCount.value))
  selectedTool.value = extraTools.find((tool) => tool.id === 'xianghuo') || selectedTool.value
}

function saveWish() {
  localStorage.setItem('qk_wish', wish.value)
  wishSaved.value = true
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  padding: 18px 0 86px;
  color: #f8edd2;
}

.home-page::before {
  position: fixed;
  inset: 0;
  z-index: -3;
  content: "";
  background:
    radial-gradient(ellipse at 50% 10%, rgba(199, 143, 48, 0.24), transparent 34%),
    radial-gradient(ellipse at 20% 76%, rgba(44, 110, 92, 0.2), transparent 30%),
    linear-gradient(180deg, #1a1410 0%, #2a1712 44%, #120d0a 100%);
}

.home-page::after {
  position: fixed;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  content: "";
  background:
    linear-gradient(135deg, transparent 0 42%, rgba(212, 175, 55, 0.08) 43% 44%, transparent 45%),
    radial-gradient(circle at 50% 50%, transparent 0 52%, rgba(0, 0, 0, 0.42) 86%);
  opacity: 0.9;
}

.ambient-glow span {
  position: fixed;
  z-index: -1;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(238, 196, 88, 0.64);
  box-shadow: 0 0 22px rgba(238, 196, 88, 0.6);
  animation: rise 5s ease-in-out infinite;
}

.temple-nav {
  position: sticky;
  top: 12px;
  z-index: 30;
  display: flex;
  min-height: 66px;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 10px 14px;
  border: 1px solid rgba(212, 175, 55, 0.24);
  border-radius: var(--radius-md);
  background: rgba(25, 17, 12, 0.78);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(18px);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.brand-seal {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 1px solid rgba(212, 175, 55, 0.42);
  border-radius: 50%;
  color: #f4d37a;
  background: rgba(212, 175, 55, 0.1);
  font-family: var(--font-display);
  font-size: 24px;
}

.brand strong,
.brand em {
  display: block;
  line-height: 1.25;
}

.brand strong {
  font-family: var(--font-display);
  font-size: 23px;
  font-weight: 400;
}

.brand em {
  color: rgba(248, 237, 210, 0.62);
  font-size: 12px;
  font-style: normal;
}

.nav-links {
  display: flex;
  gap: 24px;
  color: rgba(248, 237, 210, 0.68);
  font-size: 14px;
}

.nav-links a:hover {
  color: #f4d37a;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(360px, 0.92fr);
  gap: 34px;
  align-items: center;
  min-height: calc(100vh - 102px);
  padding: 54px 0 40px;
}

.status-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
}

.status-row span {
  padding: 5px 10px;
  border: 1px solid rgba(212, 175, 55, 0.22);
  border-radius: 999px;
  color: rgba(248, 237, 210, 0.76);
  background: rgba(255, 250, 242, 0.06);
  font-size: 12px;
}

.hero-copy h1 {
  max-width: 760px;
  margin: 16px 0 0;
  font-family: var(--font-display);
  font-size: clamp(48px, 8vw, 106px);
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0;
}

.hero-subtitle {
  max-width: 690px;
  margin: 22px 0 0;
  color: rgba(248, 237, 210, 0.72);
  font-size: clamp(16px, 1.6vw, 20px);
}

.hero-actions,
.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

.oracle-stage {
  display: grid;
  min-height: 500px;
  place-items: center;
  border-color: rgba(212, 175, 55, 0.28);
  background:
    linear-gradient(180deg, rgba(68, 39, 22, 0.8), rgba(24, 16, 12, 0.9)),
    radial-gradient(circle at 50% 38%, rgba(212, 175, 55, 0.22), transparent 34%);
}

.moon-disc {
  position: relative;
  display: grid;
  width: 230px;
  height: 230px;
  place-items: center;
  border: 1px solid rgba(244, 211, 122, 0.36);
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(244, 211, 122, 0.32), rgba(244, 211, 122, 0.05) 58%, transparent 60%),
    conic-gradient(from 0deg, transparent 0 18deg, rgba(244, 211, 122, 0.26) 19deg 20deg, transparent 21deg 360deg);
  box-shadow: 0 0 80px rgba(212, 175, 55, 0.18);
}

.moon-disc span {
  font-family: var(--font-display);
  font-size: 82px;
  color: #f7d987;
}

.moon-disc i {
  position: absolute;
  inset: 28px;
  border: 1px dashed rgba(244, 211, 122, 0.3);
  border-radius: 50%;
  animation: rotate-slow 28s linear infinite;
}

.stage-panel {
  position: absolute;
  right: 24px;
  bottom: 24px;
  width: 190px;
  padding: 16px;
  border: 1px solid rgba(212, 175, 55, 0.26);
  border-radius: var(--radius-sm);
  background: rgba(22, 14, 10, 0.72);
}

.stage-panel span,
.stage-panel p {
  margin: 0;
  color: rgba(248, 237, 210, 0.68);
  font-size: 13px;
}

.stage-panel strong {
  display: block;
  margin: 5px 0;
  color: #f4d37a;
  font-size: 34px;
}

.incense-lines {
  position: absolute;
  bottom: 26px;
  left: 32px;
  display: flex;
  gap: 10px;
}

.incense-lines span {
  width: 4px;
  height: 86px;
  border-radius: 999px;
  background: linear-gradient(#f4d37a, #b2362d 70%, transparent);
  box-shadow: 0 -14px 24px rgba(244, 211, 122, 0.28);
}

.section-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 22px;
  margin-bottom: 24px;
}

.section-copy {
  color: rgba(248, 237, 210, 0.66);
}

.service-section,
.dashboard-section,
.ritual-section,
.trust-section {
  padding: 64px 0 0;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.service-card,
.daily-card,
.tool-detail,
.wish-card,
.incense-card,
.trust-card,
.offline {
  z-index: 1;
  border-color: rgba(212, 175, 55, 0.18);
  background: rgba(33, 22, 15, 0.76);
}

.service-card > *,
.daily-card > *,
.tool-detail > *,
.wish-card > *,
.incense-card > *,
.trust-card > *,
.offline > * {
  position: relative;
  z-index: 1;
}

.service-card {
  display: grid;
  min-height: 230px;
  align-content: start;
  gap: 12px;
  padding: 18px;
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
}

.service-card:hover,
.service-card.active {
  transform: translateY(-3px);
  border-color: rgba(244, 211, 122, 0.5);
  background: rgba(50, 31, 20, 0.88);
}

.service-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.service-icon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border: 1px solid rgba(244, 211, 122, 0.28);
  border-radius: 50%;
  color: #f4d37a;
  font-family: var(--font-display);
  font-size: 24px;
}

.service-card h3,
.daily-card h2,
.tool-detail h2,
.trust-card h2 {
  margin: 4px 0 0;
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 400;
}

.service-card p,
.tool-detail p,
.trust-card p,
.incense-card p,
.offline span {
  margin: 0;
  color: rgba(248, 237, 210, 0.66);
  font-size: 14px;
}

.dashboard-section,
.ritual-grid,
.trust-section {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 16px;
}

.daily-card,
.tool-detail,
.wish-card,
.incense-card,
.trust-card {
  padding: 22px;
}

.almanac-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 18px;
}

.almanac-grid div {
  min-height: 108px;
  padding: 14px;
  border: 1px solid rgba(244, 211, 122, 0.18);
  border-radius: var(--radius-xs);
  background: rgba(255, 250, 242, 0.06);
}

.almanac-grid span {
  display: block;
  color: #f4d37a;
  font-size: 13px;
}

.almanac-grid strong {
  display: block;
  margin-top: 8px;
  line-height: 1.5;
}

.ritual-section {
  display: grid;
  grid-template-columns: 0.82fr 1.18fr;
  gap: 24px;
  align-items: start;
}

.wish-card {
  display: grid;
  gap: 12px;
}

.wish-card label {
  color: #f4d37a;
  font-weight: 700;
}

.wish-card textarea {
  min-height: 148px;
  padding: 12px;
  border: 1px solid rgba(244, 211, 122, 0.2);
  border-radius: var(--radius-xs);
  color: #f8edd2;
  background: rgba(0, 0, 0, 0.18);
  resize: vertical;
}

.wish-card span {
  color: rgba(248, 237, 210, 0.62);
  font-size: 13px;
}

.incense-card {
  display: grid;
  place-items: center;
  text-align: center;
}

.incense-burner {
  display: flex;
  gap: 12px;
  height: 126px;
  align-items: end;
}

.incense-burner i {
  width: 5px;
  height: 100px;
  border-radius: 999px;
  background: linear-gradient(#f4d37a, #c83a2e 78%, #312015);
  box-shadow: 0 -20px 26px rgba(244, 211, 122, 0.24);
}

.mobile-tabs {
  position: fixed;
  right: 12px;
  bottom: 12px;
  left: 12px;
  z-index: 40;
  display: none;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  padding: 7px;
  border: 1px solid rgba(244, 211, 122, 0.22);
  border-radius: 18px;
  background: rgba(20, 13, 9, 0.88);
  backdrop-filter: blur(16px);
}

.mobile-tabs a {
  padding: 8px;
  border-radius: 12px;
  color: rgba(248, 237, 210, 0.7);
  text-align: center;
  font-size: 13px;
}

.mobile-tabs a:hover {
  color: #f4d37a;
  background: rgba(244, 211, 122, 0.08);
}

.tone-red .service-icon {
  color: #ffb0a4;
}

.tone-green .service-icon {
  color: #8ce0c3;
}

.tone-blue .service-icon {
  color: #a8d3ff;
}

@keyframes rotate-slow {
  to {
    transform: rotate(360deg);
  }
}

@keyframes rise {
  0%,
  100% {
    opacity: 0.35;
    transform: translateY(0);
  }
  50% {
    opacity: 0.9;
    transform: translateY(-22px);
  }
}

@media (max-width: 980px) {
  .hero,
  .dashboard-section,
  .ritual-section,
  .trust-section {
    grid-template-columns: 1fr;
  }

  .service-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .home-page {
    padding-bottom: 96px;
  }

  .temple-nav {
    top: 8px;
  }

  .nav-links,
  .nav-action,
  .brand em {
    display: none;
  }

  .hero {
    min-height: auto;
    padding-top: 38px;
  }

  .oracle-stage {
    min-height: 390px;
  }

  .moon-disc {
    width: 188px;
    height: 188px;
  }

  .stage-panel {
    right: 14px;
    bottom: 14px;
    width: 168px;
  }

  .service-grid,
  .almanac-grid,
  .ritual-grid {
    grid-template-columns: 1fr;
  }

  .section-head {
    display: grid;
  }

  .mobile-tabs {
    display: grid;
  }
}
</style>
