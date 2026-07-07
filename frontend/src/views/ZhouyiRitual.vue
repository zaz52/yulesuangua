<template>
  <main class="zhouyi-page ritual-page">
    <div class="ritual-bg" aria-hidden="true">
      <div class="lantern left"></div>
      <div class="lantern right"></div>
      <div class="smoke a"></div>
      <div class="smoke b"></div>
      <i v-for="n in 28" :key="n" class="dust" :style="{ '--i': n }"></i>
    </div>

    <header class="ritual-nav">
      <button class="ds-button ghost" type="button" @click="goHome">返回首页</button>
      <div>
        <span>周易起卦</span>
        <strong>{{ stepTitle }}</strong>
      </div>
      <button class="ds-button ghost" type="button" @click="resetRitual">重新起卦</button>
    </header>

    <section class="ritual-dashboard">
      <aside class="left-rail ritual-left">
        <button class="rail-link" type="button" @click="goHome"><i>⌂</i><span>首页</span></button>
        <span class="rail-section-title">起卦流程</span>
        <button v-for="item in ritualSteps" :key="item.id" type="button" class="rail-link" :class="{ active: step === item.id }">
          <i>{{ item.icon }}</i><span>{{ item.name }}</span>
        </button>
        <button class="rail-link rail-record" type="button" @click="resetRitual"><i>重</i><span>重新起卦</span></button>
      </aside>

      <section class="stage">
      <article v-if="step === 'intro'" class="stage-card intro-card">
        <BaguaPlate />
        <span class="section-kicker">观象取意，推演吉凶</span>
        <h1>周易起卦</h1>
        <p>请静心三息，默念所问之事</p>
        <div class="breath-ring">
          <strong>{{ breathWords[breathIndex] }}</strong>
          <em>{{ Math.min(breathIndex + 1, 3) }} / 3</em>
        </div>
        <button v-if="introReady" class="ds-button gold seal-button" type="button" @click="step = 'question'">开始仪式</button>
        <small v-else>呼吸随圆，心念渐定</small>
      </article>

      <article v-else-if="step === 'question'" class="stage-card question-card">
        <span class="section-kicker">Question</span>
        <h2>默念所问之事</h2>
        <p>可在心中默念，也可写下你想占问的问题</p>
        <label class="ink-field">
          <textarea v-model.trim="question" placeholder="例如：这次选择是否顺利？"></textarea>
        </label>
        <small>心诚则灵，意定则显</small>
        <button class="ds-button gold seal-button" type="button" @click="step = 'prepare'">开始起卦</button>
      </article>

      <article v-else-if="step === 'prepare'" class="stage-card desk-card">
        <BaguaPlate />
        <div class="desk-object book">古籍</div>
        <div class="desk-object bamboo">竹简</div>
        <div class="desk-object brush"></div>
        <div class="desk-object burner"><i></i><i></i><i></i></div>
        <div class="coin-row idle"><span>乾</span><span>坤</span><span>易</span></div>
        <h2>心念既定，开始起卦</h2>
        <button class="ds-button gold seal-button" type="button" @click="beginCasting">投掷铜钱</button>
      </article>

      <article v-else-if="step === 'casting'" class="stage-card builder-card">
        <span class="section-kicker">{{ castingLabel }}</span>
        <div class="coin-row toss" :key="coinRound">
          <span>乾</span><span>坤</span><span>易</span>
        </div>
        <HexagramLines :lines="lines" />
        <p>六爻自下而上生成。水墨先散，金线后定。</p>
      </article>

      <article v-else-if="step === 'reveal'" class="stage-card reveal-card">
        <BaguaPlate still />
        <HexagramLines :lines="lines" />
        <h2>卦象已成</h2>
        <p>天地方位既定，吉凶之意可观</p>
        <button class="ds-button gold seal-button" type="button" @click="step = 'result'">展开解卦</button>
      </article>

      <article v-else class="result-scroll">
        <section class="scroll-left">
          <span class="section-kicker">本卦</span>
          <h2>{{ zhouyiResult.original.name }}</h2>
          <HexagramLines :lines="lines" />
          <p>所问：{{ zhouyiResult.question }}</p>
          <strong>变卦：{{ zhouyiResult.changed.name }}</strong>
          <div class="hexagram-meta">
            <span>{{ zhouyiResult.original.image }}</span>
            <span v-if="zhouyiResult.movingLines.length">动爻：{{ zhouyiResult.movingLines.join('、') }} 爻</span>
            <span v-else>无动爻</span>
          </div>
        </section>
        <section class="scroll-right">
          <div class="tag-row"><span v-for="tag in zhouyiResult.tags" :key="tag">{{ tag }}</span></div>
          <h2>{{ zhouyiResult.original.guaci }}</h2>
          <div class="reading-block"><strong>象辞</strong><p>{{ zhouyiResult.original.xiang }}</p></div>
          <div class="reading-block"><strong>爻辞</strong><p>{{ activeYaoci }}</p></div>
          <div class="reading-block"><strong>变卦</strong><p>{{ zhouyiResult.changed.name }}：{{ zhouyiResult.changed.guaci }}</p></div>
          <div class="reading-block"><strong>白话解析</strong><p>{{ zhouyiResult.plainText }}</p></div>
          <div class="reading-block"><strong>行动建议</strong><p>{{ zhouyiResult.action }}</p></div>
          <details class="yaoci-list">
            <summary>查看六爻爻辞</summary>
            <ol>
              <li v-for="(item, index) in zhouyiResult.original.yaoci" :key="item" :class="{ active: zhouyiResult.movingLines.includes(index + 1) }">{{ item }}</li>
            </ol>
          </details>
          <p class="ritual-privacy-note">隐私保护：本次起卦问题和结果只保留在当前页面，不会自动保存到本地或远端。</p>
          <div class="action-row">
            <button class="ds-button primary" type="button" @click="resetRitual">重新起卦</button>
            <button class="ds-button ghost" type="button" @click="goHome">返回首页</button>
          </div>
        </section>
      </article>
      </section>

      <aside class="right-rail ritual-right">
        <article class="right-rail-card">
          <div class="card-title-row"><h3>仪式进度</h3><span class="ds-badge gold">{{ stepTitle }}</span></div>
          <div class="ritual-progress">
            <span v-for="item in ritualSteps" :key="item.id" :class="{ active: step === item.id, done: stepOrder.indexOf(step) > stepOrder.indexOf(item.id) }">{{ item.name }}</span>
          </div>
        </article>
        <article class="right-rail-card">
          <h3>今日指引</h3>
          <div class="mini-item"><strong>起卦前</strong><span>先写清楚所问，不要一次问多个方向。</span></div>
          <div class="mini-item"><strong>得卦后</strong><span>先看本卦，再看动爻与变卦，不急着定吉凶。</span></div>
        </article>
        <article class="right-rail-card quote-card">
          <p>观象取意，推演吉凶；心念既定，卦象自明。</p>
          <p class="ritual-privacy-note">隐私保护：起卦过程不会自动保存问题或结果。</p>
        </article>
      </aside>
    </section>
  </main>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { buildZhouyiReading } from '../domain/zhouyi'

const router = useRouter()
const step = ref('intro')
const breathIndex = ref(0)
const introReady = ref(false)
const question = ref('')
const lines = ref([])
const coinRound = ref(0)
const breathWords = ['静心', '凝神', '起意']
const castingWords = ['初爻已定', '二爻已成', '三爻既显', '四爻渐明', '五爻将成', '上爻既就，卦象已成']
const ritualSteps = [
  { id: 'intro', icon: '静', name: '静心引导' },
  { id: 'question', icon: '问', name: '默念所问' },
  { id: 'prepare', icon: '备', name: '起卦准备' },
  { id: 'casting', icon: '投', name: '铜钱投掷' },
  { id: 'reveal', icon: '定', name: '卦象定格' },
  { id: 'result', icon: '卷', name: '卷轴解卦' },
]
const stepOrder = ritualSteps.map((item) => item.id)

const stepTitle = computed(() => ({
  intro: '静心引导',
  question: '默念所问',
  prepare: '起卦准备',
  casting: '铜钱投掷',
  reveal: '卦象定格',
  result: '卷轴解卦',
}[step.value]))

const castingLabel = computed(() => castingWords[Math.max(0, lines.value.length - 1)] || '心念既定，铜钱将起')
const zhouyiResult = computed(() => buildZhouyiReading(lines.value, question.value))
const activeYaoci = computed(() => {
  const index = zhouyiResult.value.activeLine ? zhouyiResult.value.activeLine - 1 : 0
  return zhouyiResult.value.original.yaoci[index] || zhouyiResult.value.original.yaoci[0]
})

let breathTimer
onMounted(() => {
  breathTimer = window.setInterval(() => {
    if (step.value !== 'intro' || introReady.value) return
    if (breathIndex.value < 2) breathIndex.value += 1
    else introReady.value = true
  }, 3600)
})

onUnmounted(() => window.clearInterval(breathTimer))

function goHome() {
  router.push('/')
}

function resetRitual() {
  step.value = 'intro'
  breathIndex.value = 0
  introReady.value = false
  question.value = ''
  lines.value = []
  coinRound.value = 0
}

async function beginCasting() {
  step.value = 'casting'
  lines.value = []
  for (let i = 0; i < 6; i += 1) {
    coinRound.value += 1
    await sleep(1200)
    lines.value.push(makeLine(i))
    await sleep(720)
  }
  await sleep(850)
  step.value = 'reveal'
}

function makeLine(index) {
  const options = [
    { type: 'yin', changing: false, name: '少阴' },
    { type: 'yang', changing: false, name: '少阳' },
    { type: 'yin', changing: true, name: '老阴' },
    { type: 'yang', changing: true, name: '老阳' },
  ]
  return { ...options[Math.floor(Math.random() * options.length)], id: `${Date.now()}-${index}` }
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

const BaguaPlate = defineComponent({
  props: { still: Boolean },
  setup(props) {
    const items = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤']
    return () => h('div', { class: ['bagua-plate', props.still && 'still'] }, [
      h('div', { class: 'bagua-core' }, '易'),
      ...items.map((item, index) => h('span', { style: { '--p': index } }, item)),
    ])
  },
})

const HexagramLines = defineComponent({
  props: { lines: Array },
  setup(props) {
    return () => h('div', { class: 'hex-lines' }, (props.lines || []).map((line) => h('div', { key: line.id, class: ['hex-line', line.type, line.changing && 'changing'] }, [h('i'), line.type === 'yin' ? h('i') : null])))
  },
})
</script>

<style scoped>
.zhouyi-page {
  min-height: 100vh;
  overflow: hidden;
}

.ritual-dashboard {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr) 310px;
  gap: 16px;
  width: min(1660px, calc(100% - 28px));
  margin: 0 auto;
  padding-top: 96px;
}

.ritual-left,
.ritual-right {
  top: 96px;
  align-self: start;
}

.ritual-bg,
.ritual-bg > * {
  position: fixed;
  pointer-events: none;
}

.ritual-bg {
  inset: 0;
  z-index: 0;
}

.lantern {
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(184, 58, 47, 0.44), transparent 66%);
  filter: blur(14px);
  animation: pulse-glow 5s ease-in-out infinite;
}

.lantern.left {
  left: -70px;
  top: 92px;
}

.lantern.right {
  right: -76px;
  top: 180px;
  animation-delay: -2s;
}

.smoke {
  width: 560px;
  height: 280px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(245, 234, 212, 0.13), transparent 70%);
  filter: blur(18px);
  animation: smoke-drift 13s ease-in-out infinite alternate;
}

.smoke.a {
  left: 4%;
  top: 22%;
}

.smoke.b {
  right: 0;
  bottom: 12%;
  animation-delay: -5s;
}

.dust {
  left: calc((var(--i) * 43px) % 100vw);
  top: calc((var(--i) * 71px) % 100vh);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(240, 217, 132, 0.72);
  box-shadow: 0 0 14px rgba(240, 217, 132, 0.6);
  animation: dust-float 7s ease-in-out infinite;
  animation-delay: calc(var(--i) * -0.35s);
}

.ritual-nav {
  position: fixed;
  top: 16px;
  left: 50%;
  z-index: 20;
  display: grid;
  width: min(1120px, calc(100% - 28px));
  grid-template-columns: 120px 1fr 120px;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: rgba(20, 13, 9, 0.72);
  backdrop-filter: blur(18px);
  transform: translateX(-50%);
}

.ritual-nav div {
  text-align: center;
}

.ritual-nav span {
  color: var(--gold-bright);
  font-size: 12px;
}

.ritual-nav strong {
  display: block;
  font-family: var(--font-display);
  font-size: 21px;
  font-weight: 400;
}

.stage {
  position: relative;
  z-index: 2;
  display: grid;
  min-height: calc(100vh - 124px);
  place-items: center;
  padding: 0 0 28px;
}

.stage-card,
.result-scroll {
  width: min(980px, 100%);
  min-height: min(620px, calc(100vh - 150px));
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background:
    linear-gradient(135deg, rgba(255, 247, 231, 0.08), transparent 48%),
    rgba(32, 20, 13, 0.78);
  box-shadow: var(--shadow-deep);
}

.ritual-progress {
  display: grid;
  gap: 8px;
}

.ritual-progress span {
  padding: 9px 10px;
  border: 1px solid rgba(215, 179, 95, 0.14);
  border-radius: var(--radius-xs);
  color: rgba(245, 234, 212, 0.56);
  background: rgba(255, 247, 231, 0.035);
}

.ritual-progress span.active {
  color: var(--gold-bright);
  border-color: rgba(240, 217, 132, 0.42);
  background: rgba(215, 179, 95, 0.12);
}

.ritual-progress span.done {
  color: #9ad8c5;
  border-color: rgba(79, 155, 131, 0.32);
}

.stage-card {
  position: relative;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 18px;
  padding: 34px;
  text-align: center;
}

.stage-card h1,
.stage-card h2,
.result-scroll h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(44px, 7vw, 76px);
  font-weight: 400;
  line-height: 1;
}

.stage-card p,
.result-scroll p {
  margin: 0;
  color: var(--paper-dim);
}

.bagua-plate {
  position: relative;
  display: grid;
  width: 284px;
  height: 284px;
  place-items: center;
  border: 1px solid rgba(240, 217, 132, 0.42);
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(215, 179, 95, 0.2), transparent 58%),
    conic-gradient(from 0deg, transparent 0 20deg, rgba(215, 179, 95, 0.24) 21deg 23deg, transparent 24deg 45deg);
  box-shadow: 0 0 70px rgba(215, 179, 95, 0.18);
  animation: slow-rotate 38s linear infinite;
}

.bagua-plate.still {
  animation: align-plate 1.4s ease-out forwards;
}

.bagua-core {
  display: grid;
  width: 92px;
  height: 92px;
  place-items: center;
  border: 1px solid rgba(240, 217, 132, 0.45);
  border-radius: 50%;
  color: var(--gold-bright);
  background: rgba(13, 9, 7, 0.64);
  font-family: var(--font-display);
  font-size: 46px;
}

.bagua-plate span {
  position: absolute;
  inset: 17px;
  color: rgba(240, 217, 132, 0.86);
  font-family: var(--font-display);
  font-size: 22px;
  transform: rotate(calc(var(--p) * 45deg)) translateY(-112px) rotate(calc(var(--p) * -45deg));
}

.breath-ring {
  display: grid;
  width: 190px;
  height: 190px;
  place-items: center;
  border: 1px solid rgba(240, 217, 132, 0.5);
  border-radius: 50%;
  box-shadow: 0 0 60px rgba(215, 179, 95, 0.22), inset 0 0 30px rgba(215, 179, 95, 0.12);
  animation: breathe 3.6s ease-in-out infinite;
}

.breath-ring strong {
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 400;
}

.breath-ring em {
  color: rgba(245, 234, 212, 0.58);
  font-style: normal;
}

.seal-button:active {
  transform: translateY(3px) scale(0.95);
  filter: saturate(1.2);
}

.ink-field {
  position: relative;
  width: min(620px, 100%);
}

.ink-field::after {
  position: absolute;
  inset: 12px;
  pointer-events: none;
  border-radius: var(--radius-md);
  background: radial-gradient(circle at 50% 50%, rgba(13, 9, 7, 0.24), transparent 66%);
  opacity: 0;
  content: "";
  transition: opacity 260ms ease;
}

.ink-field:focus-within::after {
  opacity: 1;
}

.ink-field textarea {
  width: 100%;
  min-height: 174px;
  padding: 20px;
  border: 1px solid rgba(215, 179, 95, 0.34);
  border-radius: var(--radius-md);
  color: #2a1a12;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.42), transparent 40%),
    var(--paper);
  resize: vertical;
}

.desk-card .bagua-plate {
  width: 360px;
  height: 360px;
}

.desk-object {
  position: absolute;
  border: 1px solid rgba(215, 179, 95, 0.22);
  color: rgba(245, 234, 212, 0.66);
  background: rgba(255, 247, 231, 0.06);
}

.book {
  top: 88px;
  left: 72px;
  width: 150px;
  height: 92px;
  padding-top: 30px;
  border-radius: var(--radius-sm);
  transform: rotate(-8deg);
}

.bamboo {
  right: 72px;
  bottom: 96px;
  width: 180px;
  height: 58px;
  padding-top: 14px;
  border-radius: 999px;
  transform: rotate(8deg);
}

.brush {
  right: 120px;
  top: 110px;
  width: 12px;
  height: 160px;
  border-radius: 999px;
  background: linear-gradient(#4b2d18, var(--gold), #1b0e08);
  transform: rotate(34deg);
}

.burner {
  left: 108px;
  bottom: 108px;
  display: flex;
  width: 100px;
  height: 66px;
  align-items: end;
  justify-content: center;
  gap: 8px;
  border-radius: 12px 12px 28px 28px;
}

.burner i {
  width: 3px;
  height: 54px;
  border-radius: 999px;
  background: linear-gradient(var(--gold-bright), var(--seal) 70%, transparent);
}

.coin-row {
  display: flex;
  gap: 18px;
}

.coin-row span {
  display: grid;
  width: 62px;
  height: 62px;
  place-items: center;
  border: 4px solid #8f6a2c;
  border-radius: 50%;
  color: #30170a;
  background: radial-gradient(circle, #f0d984, #8f6a2c);
  font-family: var(--font-display);
  font-size: 24px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.28);
}

.coin-row.idle {
  position: absolute;
  bottom: 170px;
}

.coin-row.toss {
  min-height: 150px;
  align-items: center;
}

.coin-row.toss span {
  animation: coin-flip 1.15s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.coin-row.toss span:nth-child(2) {
  animation-delay: 90ms;
}

.coin-row.toss span:nth-child(3) {
  animation-delay: 180ms;
}

.builder-card .hex-lines,
.reveal-card .hex-lines {
  margin: 8px auto;
}

.reveal-card .hex-lines {
  filter: drop-shadow(0 0 24px rgba(215, 179, 95, 0.62));
  animation: hex-glow 1.8s ease-in-out infinite alternate;
}

.result-scroll {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  background: var(--paper);
  color: #2a1a12;
  transform-origin: center;
  animation: scroll-open 1.1s ease both;
}

.scroll-left,
.scroll-right {
  padding: clamp(24px, 4vw, 46px);
}

.scroll-left {
  border-right: 1px solid rgba(143, 106, 44, 0.25);
  background: linear-gradient(90deg, rgba(143, 106, 44, 0.1), transparent);
}

.result-scroll .hex-lines {
  width: 220px;
  margin: 28px 0;
}

.tag-row,
.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hexagram-meta {
  display: grid;
  gap: 8px;
  margin-top: 18px;
}

.hexagram-meta span {
  display: inline-flex;
  width: fit-content;
  padding: 6px 10px;
  border: 1px solid rgba(143, 106, 44, 0.2);
  border-radius: 999px;
  color: #6f4a1f;
  background: rgba(143, 106, 44, 0.08);
  font-size: 13px;
}

.ritual-privacy-note {
  margin: 0;
  color: rgba(245, 234, 212, 0.62);
  font-size: 13px;
  line-height: 1.7;
}

.tag-row span {
  padding: 4px 10px;
  border: 1px solid rgba(184, 58, 47, 0.26);
  border-radius: 999px;
  color: var(--seal);
  font-size: 12px;
}

.reading-block {
  margin-top: 16px;
}

.reading-block strong,
.scroll-left strong {
  color: #8f6a2c;
}

.yaoci-list {
  margin-top: 16px;
  border: 1px solid rgba(143, 106, 44, 0.18);
  border-radius: 10px;
  background: rgba(143, 106, 44, 0.06);
}

.yaoci-list summary {
  cursor: pointer;
  padding: 10px 12px;
  color: #8f6a2c;
  font-weight: 700;
}

.yaoci-list ol {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0 14px 14px 34px;
}

.yaoci-list li {
  color: #4a2f1a;
  line-height: 1.7;
}

.yaoci-list li.active {
  color: var(--seal);
  font-weight: 700;
}

.action-row {
  margin-top: 24px;
}

@keyframes breathe {
  0%, 100% { transform: scale(0.88); opacity: 0.78; }
  50% { transform: scale(1.08); opacity: 1; }
}

@keyframes align-plate {
  to { transform: rotate(45deg); }
}

@keyframes coin-flip {
  0% { transform: translateY(0) rotateX(0deg) rotateY(0deg); }
  58% { transform: translateY(-96px) rotateX(720deg) rotateY(540deg); }
  82% { transform: translateY(12px) rotateX(900deg) rotateY(720deg); }
  100% { transform: translateY(0) rotateX(1080deg) rotateY(900deg); }
}

@keyframes hex-glow {
  to { filter: drop-shadow(0 0 38px rgba(215, 179, 95, 0.86)); }
}

@keyframes scroll-open {
  from { clip-path: inset(0 48% 0 48%); opacity: 0.4; }
  to { clip-path: inset(0 0 0 0); opacity: 1; }
}

@keyframes dust-float {
  50% { transform: translateY(-28px); opacity: 0.35; }
}

@media (max-width: 760px) {
  .ritual-dashboard {
    grid-template-columns: 1fr;
    width: min(100% - 24px, 760px);
  }

  .ritual-left,
  .ritual-right {
    position: relative;
    top: auto;
    min-height: auto;
  }

  .ritual-left {
    display: none;
  }

  .ritual-nav {
    grid-template-columns: 1fr auto;
  }

  .ritual-nav div {
    display: none;
  }

  .stage-card,
  .result-scroll {
    min-height: 580px;
  }

  .bagua-plate,
  .desk-card .bagua-plate {
    width: 230px;
    height: 230px;
  }

  .bagua-plate span {
    transform: rotate(calc(var(--p) * 45deg)) translateY(-92px) rotate(calc(var(--p) * -45deg));
  }

  .desk-object {
    display: none;
  }

  .result-scroll {
    grid-template-columns: 1fr;
  }

  .scroll-left {
    border-right: 0;
    border-bottom: 1px solid rgba(143, 106, 44, 0.25);
  }
}
</style>
