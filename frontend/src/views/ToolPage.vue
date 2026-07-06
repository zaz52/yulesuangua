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
        <button class="ds-button ghost" type="button">会员中心</button>
        <span class="icon-pill">铃</span>
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
        <button class="rail-link rail-record" type="button"><i>记</i><span>我的记录</span></button>
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

        <article v-if="toolId === 'huangli'" class="work-card oracle-card">
          <PanelHead kicker="Daily Almanac" title="今日宜忌" :badge="today" />
          <div class="almanac-grid">
            <div><span>宜</span><strong>问卦、复盘、整理计划、拜访长辈</strong></div>
            <div><span>忌</span><strong>冲动承诺、借贷担保、情绪争执</strong></div>
            <div><span>吉时</span><strong>辰时、午时、酉时</strong></div>
            <div><span>方位</span><strong>东南利沟通，西北利决断</strong></div>
          </div>
          <ResultBlock title="今日提醒" copy="适合先把问题写清楚，再进入周易起卦或奇门页面深问。黄历仅作传统文化参考，不作为现实决策依据。" />
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
          <PanelHead kicker="Dream Reading" title="梦境解析" badge="梦象记录" />
          <p>请尽可能详细地描述您的梦境，包括场景、人物、事件、情绪感受等细节。</p>
          <label class="ds-field wide dream-textarea"><span>梦境内容</span><textarea v-model.trim="dreamForm.dream" placeholder="请输入您的梦境内容..."></textarea></label>
          <div class="dream-prompts">
            <button type="button">梦中的主要场景是什么？</button>
            <button type="button">出现了哪些人物或动物？</button>
            <button type="button">发生了什么事情？</button>
            <button type="button">您的情绪感受如何？</button>
            <button type="button">梦中有哪些特别的物品或符号？</button>
            <button type="button">梦醒时的第一感受？</button>
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
            <label class="ds-field wide"><span>偏好</span><input v-model.trim="nameForm.style" placeholder="例如：清雅、自然、有诗意、不要生僻字" /></label>
          </div>
          <button class="ds-button primary" type="button" @click="generateNames">生成名册</button>
          <NameBoard :names="nameCandidates" :summary="nameResult" />
        </article>

        <article v-else class="work-card oracle-card">
          <PanelHead kicker="Wish & Incense" title="祈福上香" :badge="`香火 ${incenseCount} 点`" />
          <div class="form-grid">
            <label class="ds-field"><span>祈福对象</span><select v-model="wishForm.target"><option>自己</option><option>家人</option><option>朋友</option><option>众生</option></select></label>
            <label class="ds-field wide"><span>心愿</span><textarea v-model.trim="wishForm.text" placeholder="写下今天想安放的一句话"></textarea></label>
          </div>
          <button class="ds-button primary" type="button" @click="offerIncense">敬上三炷香</button>
          <ResultBlock title="心愿记录" :copy="wishResult" />
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
          <h3>最近记录</h3>
          <div v-if="recentRecords.length" class="mini-list">
            <button v-for="item in recentRecords" :key="`${item.title}-${item.time}`" type="button" class="mini-record" @click="item.path && router.push(item.path)">
              <strong>{{ item.title }}</strong>
              <span>{{ item.time }}</span>
            </button>
          </div>
          <RitualState
            v-else
            compact
            :bordered="false"
            variant="empty"
            heading-level="3"
            title="暂无最近记录"
            description="使用工具后会自动显示在这里。"
          />
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
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RitualState from '../components/RitualState.vue'
import { loadLocalRecentRecords, saveLocalRecentRecord } from '../storage/recentRecords'

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
const recentRecords = ref([])

onMounted(() => {
  if (toolId.value === 'liuyao') router.replace('/zhouyi')
  incenseCount.value = Number(localStorage.getItem('qk_incense') || 108)
  wishForm.value.text = localStorage.getItem('qk_wish') || ''
  recentRecords.value = loadRecentRecords()
})

function loadRecentRecords() {
  return loadLocalRecentRecords()
}

function saveRecentRecord(title, path = `/tools/${toolId.value}`) {
  const next = saveLocalRecentRecord({ title, path })
  recentRecords.value = next
}

function drawLot() {
  lotIndex.value += 1
  saveRecentRecord(`灵签占问 · ${question.value || lot.value.title}`)
}

function analyzeDream() {
  const mood = dreamForm.value.mood
  const context = dreamForm.value.context || '未填写现实背景'
  dreamResult.value = `梦境可先看三层：一是画面象意，二是醒来时的${mood}情绪，三是它和现实背景“${context}”的关系。建议把梦中最强烈的画面写成一句问题，再进入佛学开示继续深问。`
  saveRecentRecord(`梦境解析 · ${mood}`)
}

function generateNames() {
  const family = nameForm.value.familyName || '林'
  const style = nameForm.value.style || '清雅、自然、易读'
  nameCandidates.value = buildNameCandidates(family, style)
  nameResult.value = `${family}姓 · ${nameForm.value.gender} · 农历 ${nameForm.value.birth || '未填'} · ${style}`
  saveRecentRecord(`宝宝起名 · ${family}姓${nameForm.value.gender}`)
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
  saveRecentRecord(`祈福上香 · ${wishForm.value.target}`)
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

.work-card {
  display: grid;
  gap: 18px;
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
