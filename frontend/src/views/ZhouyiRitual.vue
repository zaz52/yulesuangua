<template>
  <main class="zy-page">
    <SmokeBackground />

    <header class="zy-nav">
      <button class="ritual-button ghost" type="button" @click="goHome">返回首页</button>
      <div>
        <span>周易起卦</span>
        <strong>{{ stepTitle }}</strong>
      </div>
      <button class="ritual-button ghost" type="button" @click="resetRitual">重新起卦</button>
    </header>

    <section class="ritual-stage">
      <MeditationIntro v-if="step === 'intro'" :breath-index="breathIndex" :ready="introReady" @start="step = 'question'" />
      <QuestionInput v-else-if="step === 'question'" v-model="question" @next="step = 'prepare'" />
      <RitualPreparation v-else-if="step === 'prepare'" @cast="beginCasting" />
      <HexagramBuilder
        v-else-if="step === 'casting'"
        :lines="lines"
        :casting="casting"
        :coin-round="coinRound"
        :casting-label="castingLabel"
      />
      <HexagramReveal v-else-if="step === 'reveal'" :lines="lines" @open="step = 'result'" />
      <ResultScrollCard v-else :lines="lines" :question="question" @reset="resetRitual" @home="goHome" />
    </section>
  </main>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const step = ref('intro')
const breathIndex = ref(0)
const introReady = ref(false)
const question = ref('')
const lines = ref([])
const casting = ref(false)
const coinRound = ref(0)

const breathWords = ['静心', '凝神', '起意']
const castingWords = ['初爻已定', '二爻已成', '三爻既显', '四爻渐明', '五爻将成', '上爻既就，卦象已成']

const stepTitle = computed(() => {
  const labels = {
    intro: '静心引导',
    question: '默念所问',
    prepare: '起卦准备',
    casting: '铜钱投掷',
    reveal: '卦象定格',
    result: '卷轴解卦',
  }
  return labels[step.value]
})

const castingLabel = computed(() => castingWords[Math.max(0, lines.value.length - 1)] || '心念既定，铜钱将起')

let breathTimer
onMounted(() => {
  breathTimer = window.setInterval(() => {
    if (step.value !== 'intro' || introReady.value) return
    if (breathIndex.value < 2) breathIndex.value += 1
    else introReady.value = true
  }, 3600)
})

onUnmounted(() => {
  window.clearInterval(breathTimer)
})

function goHome() {
  router.push('/')
}

function resetRitual() {
  step.value = 'intro'
  breathIndex.value = 0
  introReady.value = false
  question.value = ''
  lines.value = []
  casting.value = false
  coinRound.value = 0
}

async function beginCasting() {
  step.value = 'casting'
  lines.value = []
  casting.value = true
  for (let index = 0; index < 6; index += 1) {
    coinRound.value += 1
    await sleep(1200)
    lines.value.push(makeLine(index))
    await sleep(650)
  }
  casting.value = false
  await sleep(900)
  step.value = 'reveal'
}

function makeLine(index) {
  const seed = Math.floor(Math.random() * 4)
  const labels = [
    { type: 'yin', changing: false, name: '少阴' },
    { type: 'yang', changing: false, name: '少阳' },
    { type: 'yin', changing: true, name: '老阴' },
    { type: 'yang', changing: true, name: '老阳' },
  ]
  return { ...labels[seed], id: `${Date.now()}-${index}` }
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

const SmokeBackground = defineComponent({
  setup() {
    return () =>
      h('div', { class: 'smoke-bg', 'aria-hidden': 'true' }, [
        h('div', { class: 'lantern lantern-left' }),
        h('div', { class: 'lantern lantern-right' }),
        h(
          'div',
          { class: 'bagua-bg' },
          ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'].map((v, i) => h('span', { style: { '--i': i } }, v)),
        ),
        h('div', { class: 'smoke smoke-a' }),
        h('div', { class: 'smoke smoke-b' }),
        h('div', { class: 'gold-dust' }, Array.from({ length: 24 }, (_, i) => h('i', { style: { '--i': i } }))),
      ])
  },
})

const BaguaPlate = defineComponent({
  props: { still: Boolean },
  setup(props) {
    return () =>
      h('div', { class: ['bagua-plate', props.still && 'still'] }, [
        h('div', { class: 'bagua-core' }, '易'),
        ...['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'].map((v, i) => h('span', { style: { '--p': i } }, v)),
      ])
  },
})

const RitualButton = defineComponent({
  emits: ['click'],
  props: { label: String, ghost: Boolean },
  setup(props, { emit }) {
    return () => h('button', { class: ['ritual-button', props.ghost && 'ghost'], type: 'button', onClick: () => emit('click') }, props.label)
  },
})

const MeditationIntro = defineComponent({
  props: { breathIndex: Number, ready: Boolean },
  emits: ['start'],
  setup(props, { emit }) {
    return () =>
      h('article', { class: 'intro-panel' }, [
        h(BaguaPlate),
        h('span', { class: 'eyebrow' }, '观象取意，推演吉凶'),
        h('h1', '周易起卦'),
        h('p', '请静心三息，默念所问之事'),
        h('div', { class: 'breath-ring' }, [
          h('span', breathWords[props.breathIndex || 0]),
          h('em', `${Math.min((props.breathIndex || 0) + 1, 3)} / 3`),
        ]),
        props.ready
          ? h(RitualButton, { label: '开始仪式', onClick: () => emit('start') })
          : h('small', '呼吸随圆，心念渐定'),
      ])
  },
})

const QuestionInput = defineComponent({
  props: { modelValue: String },
  emits: ['update:modelValue', 'next'],
  setup(props, { emit }) {
    return () =>
      h('article', { class: 'question-panel parchment-card' }, [
        h('span', { class: 'eyebrow' }, 'Question'),
        h('h2', '默念所问之事'),
        h('p', '可在心中默念，也可写下你想占问的问题'),
        h('label', { class: 'ink-field' }, [
          h('textarea', {
            value: props.modelValue,
            placeholder: '例如：这次选择是否顺利？',
            onInput: (event) => emit('update:modelValue', event.target.value),
          }),
        ]),
        h('small', '心诚则灵，意定则显'),
        h(RitualButton, { label: '开始起卦', onClick: () => emit('next') }),
      ])
  },
})

const RitualPreparation = defineComponent({
  emits: ['cast'],
  setup(_, { emit }) {
    return () =>
      h('article', { class: 'desk-scene' }, [
        h(BaguaPlate),
        h('div', { class: 'desk-object book' }, '古籍'),
        h('div', { class: 'desk-object bamboo' }, '竹简'),
        h('div', { class: 'desk-object brush' }),
        h('div', { class: 'desk-object burner' }, [h('i'), h('i'), h('i')]),
        h('div', { class: 'coin-row idle' }, [h('span', '乾'), h('span', '坤'), h('span', '易')]),
        h('h2', '心念既定，开始起卦'),
        h(RitualButton, { label: '投掷铜钱', onClick: () => emit('cast') }),
      ])
  },
})

const CoinTossAnimation = defineComponent({
  props: { round: Number, active: Boolean },
  setup(props) {
    return () =>
      h('div', { class: ['coin-row toss', props.active && 'active'], key: props.round }, [
        h('span', '乾'),
        h('span', '坤'),
        h('span', '易'),
      ])
  },
})

const HexagramLines = defineComponent({
  props: { lines: Array },
  setup(props) {
    return () =>
      h('div', { class: 'hexagram-lines' }, (props.lines || []).map((line) => h('div', { key: line.id, class: ['yao-line', line.type, line.changing && 'changing'] }, [h('i'), h('i')])))
  },
})

const HexagramBuilder = defineComponent({
  props: { lines: Array, casting: Boolean, coinRound: Number, castingLabel: String },
  setup(props) {
    return () =>
      h('article', { class: 'builder-panel' }, [
        h('span', { class: 'eyebrow' }, props.castingLabel),
        h(CoinTossAnimation, { round: props.coinRound, active: props.casting }),
        h(HexagramLines, { lines: props.lines }),
        h('p', '六爻自下而上生成。水墨先散，金线后定。'),
      ])
  },
})

const HexagramReveal = defineComponent({
  props: { lines: Array },
  emits: ['open'],
  setup(props, { emit }) {
    return () =>
      h('article', { class: 'reveal-panel' }, [
        h(BaguaPlate, { still: true }),
        h(HexagramLines, { lines: props.lines }),
        h('h2', '卦象已成'),
        h('p', '天地方位既定，吉凶之意可观'),
        h(RitualButton, { label: '展开解卦', onClick: () => emit('open') }),
      ])
  },
})

const ResultScrollCard = defineComponent({
  props: { lines: Array, question: String },
  emits: ['reset', 'home'],
  setup(props, { emit }) {
    return () =>
      h('article', { class: 'result-scroll' }, [
        h('div', { class: 'scroll-left' }, [
          h('span', { class: 'eyebrow' }, '本卦'),
          h('h2', '乾为天'),
          h(HexagramLines, { lines: props.lines }),
          h('p', `所问：${props.question || '未书写，心中默念'}`),
          h('strong', '变卦：天风姤'),
        ]),
        h('div', { class: 'scroll-right' }, [
          h('span', { class: 'tag-row' }, ['吉', '中平', '谨慎', '宜守', '宜进'].map((v) => h('em', v))),
          h('h2', '元亨，利贞。'),
          h('section', [h('strong', '爻辞'), h('p', '初九，潜龙勿用。')]),
          h('section', [h('strong', '白话解析'), h('p', '此卦象征刚健、主动、向上，但当前仍需审时度势，不宜急进。')]),
          h('section', [h('strong', '行动建议'), h('p', '宜稳中求进，先蓄势，再行动。')]),
          h('div', { class: 'action-row' }, [
            h(RitualButton, { label: '重新起卦', onClick: () => emit('reset') }),
            h(RitualButton, { label: '保存结果', ghost: true }),
            h(RitualButton, { label: '分享结果', ghost: true }),
            h(RitualButton, { label: '返回首页', ghost: true, onClick: () => emit('home') }),
          ]),
        ]),
      ])
  },
})
</script>

<style scoped>
.zy-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  color: #f6ead2;
  background:
    radial-gradient(circle at 20% 10%, rgba(216, 182, 95, 0.16), transparent 30%),
    linear-gradient(180deg, #160e0a 0%, #28170f 55%, #100b08 100%);
}

.zy-nav {
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
  border: 1px solid rgba(216, 182, 95, 0.26);
  border-radius: 12px;
  background: rgba(20, 13, 9, 0.72);
  backdrop-filter: blur(18px);
  transform: translateX(-50%);
}

.zy-nav div {
  text-align: center;
}

.zy-nav span,
.eyebrow {
  color: #d8b65f;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.zy-nav strong {
  display: block;
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 400;
}

.ritual-stage {
  position: relative;
  z-index: 2;
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 104px 18px 38px;
}

.intro-panel,
.question-panel,
.desk-scene,
.builder-panel,
.reveal-panel,
.result-scroll {
  position: relative;
  width: min(980px, 100%);
  min-height: 620px;
  overflow: hidden;
  border: 1px solid rgba(216, 182, 95, 0.28);
  border-radius: 18px;
  background:
    linear-gradient(135deg, rgba(255, 250, 242, 0.08), transparent 48%),
    rgba(32, 20, 13, 0.78);
  box-shadow: 0 30px 120px rgba(0, 0, 0, 0.38);
}

.intro-panel,
.question-panel,
.builder-panel,
.reveal-panel {
  display: grid;
  place-items: center;
  align-content: center;
  gap: 18px;
  padding: 34px;
  text-align: center;
}

.intro-panel h1,
.question-panel h2,
.desk-scene h2,
.reveal-panel h2,
.result-scroll h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(44px, 7vw, 76px);
  font-weight: 400;
  letter-spacing: 0;
}

.intro-panel p,
.question-panel p,
.builder-panel p,
.reveal-panel p,
.result-scroll p {
  margin: 0;
  color: rgba(246, 234, 210, 0.72);
}

.bagua-plate {
  position: relative;
  display: grid;
  width: 280px;
  height: 280px;
  place-items: center;
  border: 1px solid rgba(216, 182, 95, 0.4);
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(216, 182, 95, 0.2), transparent 58%),
    conic-gradient(from 0deg, transparent 0 20deg, rgba(216, 182, 95, 0.24) 21deg 23deg, transparent 24deg 45deg);
  box-shadow: 0 0 70px rgba(216, 182, 95, 0.18);
  animation: rotate-slow 36s linear infinite;
}

.bagua-plate.still {
  animation: align-plate 1.4s ease-out forwards;
}

.bagua-core {
  display: grid;
  width: 92px;
  height: 92px;
  place-items: center;
  border: 1px solid rgba(216, 182, 95, 0.45);
  border-radius: 50%;
  color: #f0d27a;
  font-family: var(--font-display);
  font-size: 48px;
  background: rgba(16, 10, 7, 0.64);
}

.bagua-plate span {
  position: absolute;
  inset: 17px;
  color: rgba(240, 210, 122, 0.82);
  font-size: 22px;
  transform: rotate(calc(var(--p) * 45deg)) translateY(-112px) rotate(calc(var(--p) * -45deg));
}

.breath-ring {
  display: grid;
  width: 190px;
  height: 190px;
  place-items: center;
  border: 1px solid rgba(216, 182, 95, 0.5);
  border-radius: 50%;
  box-shadow: 0 0 60px rgba(216, 182, 95, 0.22), inset 0 0 30px rgba(216, 182, 95, 0.12);
  animation: breathe 3.6s ease-in-out infinite;
}

.breath-ring span {
  color: #f0d27a;
  font-family: var(--font-display);
  font-size: 36px;
}

.breath-ring em {
  color: rgba(246, 234, 210, 0.58);
  font-style: normal;
}

.ritual-button {
  min-height: 42px;
  padding: 9px 18px;
  border: 1px solid rgba(216, 182, 95, 0.42);
  border-radius: 4px;
  color: #2a120c;
  background: linear-gradient(135deg, #efd17a, #b98528);
  box-shadow: 0 10px 28px rgba(168, 50, 37, 0.2);
  transition: transform 150ms ease, filter 150ms ease;
}

.ritual-button:active {
  transform: translateY(2px) scale(0.96);
  filter: saturate(1.2);
}

.ritual-button.ghost {
  color: #f6ead2;
  background: rgba(255, 250, 242, 0.06);
}

.parchment-card {
  background:
    radial-gradient(circle at 50% 40%, rgba(244, 234, 214, 0.16), transparent 36%),
    rgba(35, 23, 14, 0.82);
}

.ink-field {
  position: relative;
  width: min(620px, 100%);
}

.ink-field::after {
  position: absolute;
  inset: 12px;
  pointer-events: none;
  border-radius: 18px;
  background: radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.22), transparent 64%);
  opacity: 0;
  content: "";
  transition: opacity 260ms ease;
}

.ink-field:focus-within::after {
  opacity: 1;
}

.ink-field textarea {
  width: 100%;
  min-height: 170px;
  padding: 20px;
  border: 1px solid rgba(216, 182, 95, 0.32);
  border-radius: 10px;
  color: #2a1a12;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.42), transparent 40%),
    #f4ead6;
  font-family: var(--font-serif);
  resize: vertical;
}

.desk-scene {
  display: grid;
  place-items: center;
  padding: 34px;
  text-align: center;
}

.desk-scene .bagua-plate {
  width: 360px;
  height: 360px;
}

.desk-object {
  position: absolute;
  border: 1px solid rgba(216, 182, 95, 0.22);
  color: rgba(246, 234, 210, 0.64);
  background: rgba(255, 250, 242, 0.07);
}

.book {
  top: 88px;
  left: 72px;
  width: 150px;
  height: 92px;
  padding-top: 30px;
  border-radius: 8px;
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
  background: linear-gradient(#4b2d18, #d8b65f, #1b0e08);
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
  background: linear-gradient(#efd17a, #a83225 70%, transparent);
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
  color: #3a1e0e;
  background: radial-gradient(circle, #efd17a, #8f6a2c);
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

.coin-row.toss.active span {
  animation: coin-flip 1.15s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.coin-row.toss.active span:nth-child(2) {
  animation-delay: 90ms;
}

.coin-row.toss.active span:nth-child(3) {
  animation-delay: 180ms;
}

.hexagram-lines {
  display: flex;
  flex-direction: column-reverse;
  gap: 12px;
  width: min(360px, 82vw);
  margin: 8px auto;
}

.yao-line {
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
  height: 16px;
  animation: ink-to-gold 900ms ease both;
}

.yao-line.yin {
  grid-template-columns: 1fr 1fr;
}

.yao-line i {
  border-radius: 999px;
  background: linear-gradient(90deg, #b98528, #fff0a8, #b98528);
  box-shadow: 0 0 22px rgba(216, 182, 95, 0.5);
}

.yao-line.changing i {
  outline: 2px solid rgba(168, 50, 37, 0.7);
  box-shadow: 0 0 28px rgba(168, 50, 37, 0.72), 0 0 22px rgba(216, 182, 95, 0.5);
}

.reveal-panel .hexagram-lines {
  filter: drop-shadow(0 0 24px rgba(216, 182, 95, 0.62));
  animation: hex-glow 1.8s ease-in-out infinite alternate;
}

.result-scroll {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 0;
  min-height: 620px;
  background: #f4ead6;
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

.result-scroll .hexagram-lines {
  width: 220px;
  margin: 28px 0;
}

.result-scroll p {
  color: #584735;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-row em {
  padding: 4px 9px;
  border: 1px solid rgba(168, 50, 37, 0.25);
  border-radius: 999px;
  color: #a83225;
  font-style: normal;
  font-size: 12px;
}

.scroll-right section {
  margin-top: 16px;
}

.scroll-right section strong {
  color: #8f6a2c;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
}

.smoke-bg,
.smoke-bg > * {
  position: fixed;
  pointer-events: none;
}

.smoke-bg {
  inset: 0;
  z-index: 0;
}

.bagua-bg {
  inset: 50%;
  width: 720px;
  height: 720px;
  margin: -360px;
  border: 1px solid rgba(216, 182, 95, 0.08);
  border-radius: 50%;
  animation: rotate-slow 70s linear infinite;
}

.bagua-bg span {
  position: absolute;
  inset: 26px;
  color: rgba(216, 182, 95, 0.08);
  font-size: 52px;
  transform: rotate(calc(var(--i, 0) * 45deg));
}

.smoke {
  width: 520px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(246, 234, 210, 0.12), transparent 68%);
  filter: blur(16px);
  animation: smoke-flow 12s ease-in-out infinite alternate;
}

.smoke-a {
  left: 4%;
  top: 18%;
}

.smoke-b {
  right: 2%;
  bottom: 10%;
  animation-delay: -4s;
}

.lantern {
  width: 230px;
  height: 230px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(168, 50, 37, 0.45), transparent 66%);
  filter: blur(12px);
  animation: lantern 5s ease-in-out infinite alternate;
}

.lantern-left {
  left: -50px;
  top: 80px;
}

.lantern-right {
  right: -70px;
  top: 160px;
  animation-delay: -2s;
}

.gold-dust i {
  position: absolute;
  left: calc((var(--i) * 43px) % 100vw);
  top: calc((var(--i) * 71px) % 100vh);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(216, 182, 95, 0.72);
  box-shadow: 0 0 14px rgba(216, 182, 95, 0.6);
  animation: dust 7s ease-in-out infinite;
  animation-delay: calc(var(--i) * -0.35s);
}

@keyframes rotate-slow {
  to {
    transform: rotate(360deg);
  }
}

@keyframes align-plate {
  to {
    transform: rotate(45deg);
  }
}

@keyframes breathe {
  0%,
  100% {
    transform: scale(0.88);
    opacity: 0.78;
  }
  50% {
    transform: scale(1.08);
    opacity: 1;
  }
}

@keyframes coin-flip {
  0% {
    transform: translateY(0) rotateX(0deg) rotateY(0deg);
  }
  58% {
    transform: translateY(-96px) rotateX(720deg) rotateY(540deg);
  }
  82% {
    transform: translateY(12px) rotateX(900deg) rotateY(720deg);
  }
  100% {
    transform: translateY(0) rotateX(1080deg) rotateY(900deg);
  }
}

@keyframes ink-to-gold {
  0% {
    opacity: 0;
    filter: blur(14px);
    transform: scaleX(0.2);
  }
  50% {
    opacity: 0.6;
    filter: blur(6px);
    transform: scaleX(1.05);
  }
  100% {
    opacity: 1;
    filter: blur(0);
    transform: scaleX(1);
  }
}

@keyframes hex-glow {
  to {
    filter: drop-shadow(0 0 38px rgba(216, 182, 95, 0.86));
  }
}

@keyframes scroll-open {
  from {
    clip-path: inset(0 48% 0 48%);
    opacity: 0.4;
  }
  to {
    clip-path: inset(0 0 0 0);
    opacity: 1;
  }
}

@keyframes smoke-flow {
  to {
    transform: translateX(80px) translateY(-24px) scale(1.16);
  }
}

@keyframes lantern {
  to {
    opacity: 0.55;
    transform: scale(1.1);
  }
}

@keyframes dust {
  50% {
    transform: translateY(-28px);
    opacity: 0.35;
  }
}

@media (max-width: 760px) {
  .zy-nav {
    grid-template-columns: 1fr auto;
  }

  .zy-nav div {
    display: none;
  }

  .intro-panel,
  .question-panel,
  .desk-scene,
  .builder-panel,
  .reveal-panel,
  .result-scroll {
    min-height: 580px;
  }

  .bagua-plate,
  .desk-scene .bagua-plate {
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
