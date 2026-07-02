<template>
  <main class="tool-page ritual-page">
    <header class="page-nav app-shell">
      <button class="ds-button ghost" type="button" @click="router.push('/')">返回首页</button>
      <div class="title-center">
        <span class="round-mark small">{{ tool.icon }}</span>
        <div>
          <strong>{{ tool.name }}</strong>
          <em>{{ tool.kicker }}</em>
        </div>
      </div>
      <button class="ds-button gold" type="button" @click="router.push(`/divine/${tool.related}`)">AI 深问</button>
    </header>

    <section class="tool-shell app-shell">
      <aside class="tool-side ds-card">
        <span class="round-mark">{{ tool.icon }}</span>
        <h1>{{ tool.name }}</h1>
        <p>{{ tool.description }}</p>
        <div class="side-links">
          <button v-for="item in tools" :key="item.id" type="button" :class="{ active: item.id === toolId }" @click="router.push(`/tools/${item.id}`)">
            {{ item.name }}
          </button>
        </div>
      </aside>

      <section class="tool-main">
        <article v-if="toolId === 'huangli'" class="work-card ds-card">
          <PanelHead kicker="Daily Almanac" title="今日宜忌" :badge="today" />
          <div class="almanac-grid">
            <div><span>宜</span><strong>问卦、复盘、整理计划、拜访长辈</strong></div>
            <div><span>忌</span><strong>冲动承诺、借贷担保、情绪争执</strong></div>
            <div><span>吉时</span><strong>辰时、午时、酉时</strong></div>
            <div><span>方位</span><strong>东南利沟通，西北利决断</strong></div>
          </div>
          <ResultBlock title="今日提醒" copy="适合先把问题写清楚，再进入周易起卦或奇门页面深问。黄历仅作传统文化参考，不作为现实决策依据。" />
        </article>

        <article v-else-if="toolId === 'lingqian'" class="work-card ds-card">
          <PanelHead kicker="Spiritual Lot" title="灵签占问" :badge="lot.level" />
          <label class="ds-field wide"><span>所问之事</span><input v-model.trim="question" placeholder="例如：这段关系是否还适合继续推进" /></label>
          <button class="ds-button primary" type="button" @click="drawLot">诚心抽签</button>
          <ResultBlock :title="lot.title" :copy="lot.text" />
        </article>

        <article v-else-if="toolId === 'jiemeng'" class="work-card ds-card">
          <PanelHead kicker="Dream Reading" title="梦境解析" badge="梦象记录" />
          <div class="form-grid">
            <label class="ds-field wide"><span>梦境内容</span><textarea v-model.trim="dreamForm.dream" placeholder="写下梦里最清楚的画面、人物、地点或情绪"></textarea></label>
            <label class="ds-field"><span>醒来情绪</span><select v-model="dreamForm.mood"><option>平静</option><option>焦虑</option><option>害怕</option><option>怀念</option><option>疑惑</option></select></label>
            <label class="ds-field"><span>现实背景</span><input v-model.trim="dreamForm.context" placeholder="最近卡住的事情" /></label>
          </div>
          <button class="ds-button primary" type="button" @click="analyzeDream">解析梦境</button>
          <ResultBlock title="梦象提示" :copy="dreamResult" />
        </article>

        <article v-else-if="toolId === 'qiming'" class="work-card ds-card">
          <PanelHead kicker="Naming" title="美称生成" badge="候选名册" />
          <div class="form-grid">
            <label class="ds-field"><span>姓氏</span><input v-model.trim="nameForm.familyName" placeholder="例如：林" /></label>
            <label class="ds-field"><span>性别</span><select v-model="nameForm.gender"><option>男</option><option>女</option><option>不限</option></select></label>
            <label class="ds-field"><span>农历生日</span><input v-model.trim="nameForm.birth" placeholder="例如：2024-04-16" /></label>
            <label class="ds-field wide"><span>偏好</span><input v-model.trim="nameForm.style" placeholder="例如：清雅、自然、有诗意、不要生僻字" /></label>
          </div>
          <button class="ds-button primary" type="button" @click="generateNames">生成名册</button>
          <NameBoard :names="nameCandidates" :summary="nameResult" />
        </article>

        <article v-else class="work-card ds-card">
          <PanelHead kicker="Wish & Incense" title="祈福上香" :badge="`香火 ${incenseCount} 点`" />
          <div class="form-grid">
            <label class="ds-field"><span>祈福对象</span><select v-model="wishForm.target"><option>自己</option><option>家人</option><option>朋友</option><option>众生</option></select></label>
            <label class="ds-field wide"><span>心愿</span><textarea v-model.trim="wishForm.text" placeholder="写下今天想安放的一句话"></textarea></label>
          </div>
          <button class="ds-button primary" type="button" @click="offerIncense">敬上三炷香</button>
          <ResultBlock title="心愿记录" :copy="wishResult" />
        </article>
      </section>
    </section>
  </main>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

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

const NameBoard = defineComponent({
  props: { names: Array, summary: String },
  setup(props) {
    return () => h('section', { class: 'name-board' }, [
      h('div', { class: 'name-board-head' }, [
        h('div', [h('span', '候选美称'), h('strong', props.summary)]),
        h('em', '参考图样式：卡片候选，不再输出纯文字段落'),
      ]),
      h('div', { class: 'name-grid' }, (props.names || []).map((item) => h('article', { class: 'name-card' }, [
        h('div', { class: 'name-main' }, [h('strong', item.full), h('span', item.pinyin)]),
        h('p', item.meaning),
        h('div', { class: 'name-tags' }, item.tags.map((tag) => h('span', tag))),
        h('dl', [
          h('div', [h('dt', '补益'), h('dd', item.element)]),
          h('div', [h('dt', '气质'), h('dd', item.style)]),
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
  { id: 'jiemeng', icon: '梦', name: '梦境解析', kicker: 'Dream', related: 'fojiao', description: '记录梦境、醒来情绪与现实背景，整理梦象提示。' },
  { id: 'qiming', icon: '名', name: '宝宝起名', kicker: 'Naming', related: 'bazi', description: '填写姓氏、生日与偏好，生成命名方向和名字候选。' },
  { id: 'xianghuo', icon: '香', name: '祈福上香', kicker: 'Wish', related: 'fojiao', description: '写下心愿并在本地记录香火，不上传个人愿望。' },
]

const tool = computed(() => tools.find((item) => item.id === toolId.value) || tools[0])
const today = computed(() => new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date()))
const question = ref('')
const lotIndex = ref(0)
const lots = [
  { level: '上吉', title: '第一签：云开见月', text: '事情已有转机，但要先把问题说清楚。宜主动沟通，忌反复试探。' },
  { level: '中吉', title: '第十七签：静水照心', text: '当前更适合观察和整理，不宜急着定结论。把补充信息带入 AI 深问会更准确。' },
  { level: '小吉', title: '第三十二签：风入竹林', text: '外界变化较多，先守住边界，再看时机推进。' },
]
const lot = computed(() => lots[lotIndex.value % lots.length])
const dreamForm = ref({ dream: '', mood: '平静', context: '' })
const dreamResult = ref('填写梦境后点击解析，会从象意、情绪和现实提醒三个角度生成提示。')
const nameForm = ref({ familyName: '', gender: '不限', birth: '', style: '' })
const nameResult = ref('填写姓氏、农历生日和偏好后生成候选名册。')
const nameCandidates = ref(buildNameCandidates('林', '清雅、自然'))
const wishForm = ref({ target: '自己', text: '' })
const wishResult = ref('写下心愿后，点击上香会记录在当前浏览器中。')
const incenseCount = ref(108)

onMounted(() => {
  if (toolId.value === 'liuyao') router.replace('/zhouyi')
  incenseCount.value = Number(localStorage.getItem('qk_incense') || 108)
  wishForm.value.text = localStorage.getItem('qk_wish') || ''
})

function drawLot() {
  lotIndex.value += 1
}

function analyzeDream() {
  const mood = dreamForm.value.mood
  const context = dreamForm.value.context || '未填写现实背景'
  dreamResult.value = `梦境可先看三层：一是画面象意，二是醒来时的${mood}情绪，三是它和现实背景“${context}”的关系。建议把梦中最强烈的画面写成一句问题，再进入佛学开示继续深问。`
}

function generateNames() {
  const family = nameForm.value.familyName || '林'
  const style = nameForm.value.style || '清雅、自然、易读'
  nameCandidates.value = buildNameCandidates(family, style)
  nameResult.value = `${family}姓 · ${nameForm.value.gender} · 农历 ${nameForm.value.birth || '未填'} · ${style}`
}

function buildNameCandidates(family, style) {
  const pool = [
    ['知宁', 'zhi ning', '知止而后有定，宁静而致远。', '木火', '清雅', ['静气', '书卷', '平衡']],
    ['景初', 'jing chu', '景行维贤，初心得守。', '木火', '明朗', ['开阔', '朝气', '有光']],
    ['予安', 'yu an', '予人安定，也自守安宁。', '土金', '温和', ['安定', '易读', '亲和']],
    ['云舒', 'yun shu', '云卷云舒，行止从容。', '水木', '自然', ['松弛', '灵动', '诗意']],
    ['沐辰', 'mu chen', '如沐清光，辰星有序。', '水土', '清新', ['朝气', '清润', '稳重']],
    ['若衡', 'ruo heng', '若水含章，衡心守正。', '木土', '端正', ['克制', '雅致', '格局']],
  ]
  return pool.map(([name, pinyin, meaning, element, fallbackStyle, tags]) => ({
    full: `${family}${name}`,
    pinyin,
    meaning,
    element,
    style: style || fallbackStyle,
    tags,
  }))
}

function offerIncense() {
  incenseCount.value += 3
  localStorage.setItem('qk_incense', String(incenseCount.value))
  localStorage.setItem('qk_wish', wishForm.value.text)
  wishResult.value = `已为${wishForm.value.target}敬上三炷香。心愿已保存在当前浏览器：${wishForm.value.text || '愿心安定，所行有度。'}`
}
</script>

<style scoped>
.tool-page {
  padding: 18px 0 64px;
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
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 18px;
  padding-top: 24px;
}

.tool-side,
.work-card {
  padding: 22px;
}

.tool-side > *,
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
  margin-top: 20px;
}

.side-links button {
  padding: 10px 12px;
  border: 1px solid rgba(215, 179, 95, 0.16);
  border-radius: var(--radius-xs);
  color: var(--paper-dim);
  background: rgba(255, 247, 231, 0.04);
  text-align: left;
}

.side-links button.active,
.side-links button:hover {
  color: var(--gold-bright);
  border-color: rgba(240, 217, 132, 0.42);
}

.tool-main {
  display: grid;
  gap: 16px;
}

.work-card {
  display: grid;
  gap: 18px;
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

.name-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.name-card {
  display: grid;
  gap: 10px;
  min-height: 210px;
  padding: 14px;
  border: 1px solid rgba(215, 179, 95, 0.16);
  border-radius: var(--radius-xs);
  background:
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
  font-size: 34px;
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
  .name-grid,
  .panel-head {
    grid-template-columns: 1fr;
    display: grid;
  }

  .name-board-head {
    display: grid;
  }

  .name-board-head em {
    text-align: left;
  }
}
</style>
