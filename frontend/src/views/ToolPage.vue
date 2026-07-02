<template>
  <main class="tool-page">
    <header class="tool-nav app-shell">
      <button class="ds-button ghost" type="button" @click="goHome">返回首页</button>
      <div>
        <span class="section-kicker">{{ tool.kicker }}</span>
        <h1>{{ tool.name }}</h1>
      </div>
      <button class="ds-button gold" type="button" @click="goDivine(tool.related)">AI 深问</button>
    </header>

    <section class="tool-shell app-shell">
      <aside class="tool-side ds-card">
        <span class="tool-mark">{{ tool.icon }}</span>
        <h2>{{ tool.name }}</h2>
        <p>{{ tool.description }}</p>
        <div class="side-links">
          <button v-for="item in tools" :key="item.id" type="button" :class="{ active: item.id === toolId }" @click="goTool(item.id)">
            {{ item.name }}
          </button>
        </div>
      </aside>

      <section class="tool-main">
        <article v-if="toolId === 'huangli'" class="work-card ds-card">
          <div class="panel-head">
            <div>
              <span class="section-kicker">Daily Almanac</span>
              <h2>今日宜忌</h2>
            </div>
            <span class="ds-badge gold">{{ today }}</span>
          </div>
          <div class="almanac-grid">
            <div><span>宜</span><strong>问卦、复盘、整理计划、拜访长辈</strong></div>
            <div><span>忌</span><strong>冲动承诺、借贷担保、情绪争执</strong></div>
            <div><span>吉时</span><strong>辰时、午时、酉时</strong></div>
            <div><span>方位</span><strong>东南利沟通，西北利决断</strong></div>
          </div>
          <ResultBlock title="今日提醒" copy="适合先把问题写清楚，再进入八字或奇门页面深问。黄历仅作文化参考，不作为现实决策依据。" />
        </article>

        <article v-else-if="toolId === 'lingqian'" class="work-card ds-card">
          <div class="panel-head">
            <div>
              <span class="section-kicker">Spiritual Lot</span>
              <h2>灵签占问</h2>
            </div>
            <span class="ds-badge red">{{ lot.level }}</span>
          </div>
          <div class="form-grid">
            <label class="ds-field wide">
              <span>所问之事</span>
              <input v-model.trim="question" placeholder="例如：这段关系是否还适合继续推进" />
            </label>
          </div>
          <button class="ds-button primary" type="button" @click="drawLot">诚心抽签</button>
          <ResultBlock :title="lot.title" :copy="lot.text" />
        </article>

        <article v-else-if="toolId === 'jiemeng'" class="work-card ds-card">
          <div class="panel-head">
            <div>
              <span class="section-kicker">Dream Reading</span>
              <h2>梦境解析</h2>
            </div>
            <span class="ds-badge green">梦象记录</span>
          </div>
          <div class="form-grid">
            <label class="ds-field wide">
              <span>梦境内容</span>
              <textarea v-model.trim="dreamForm.dream" placeholder="写下梦里最清楚的画面、人物、地点或情绪"></textarea>
            </label>
            <label class="ds-field">
              <span>醒来情绪</span>
              <select v-model="dreamForm.mood">
                <option>平静</option>
                <option>焦虑</option>
                <option>害怕</option>
                <option>怀念</option>
                <option>疑惑</option>
              </select>
            </label>
            <label class="ds-field">
              <span>现实背景</span>
              <input v-model.trim="dreamForm.context" placeholder="最近卡住的事情" />
            </label>
          </div>
          <button class="ds-button primary" type="button" @click="analyzeDream">解析梦境</button>
          <ResultBlock title="梦象提示" :copy="dreamResult" />
        </article>

        <article v-else-if="toolId === 'qiming'" class="work-card ds-card">
          <div class="panel-head">
            <div>
              <span class="section-kicker">Naming</span>
              <h2>宝宝起名</h2>
            </div>
            <span class="ds-badge gold">姓名方案</span>
          </div>
          <div class="form-grid">
            <label class="ds-field">
              <span>姓氏</span>
              <input v-model.trim="nameForm.familyName" placeholder="例如：林" />
            </label>
            <label class="ds-field">
              <span>性别</span>
              <select v-model="nameForm.gender">
                <option>男</option>
                <option>女</option>
                <option>不限定</option>
              </select>
            </label>
            <label class="ds-field">
              <span>出生日期</span>
              <input v-model="nameForm.birth" type="date" />
            </label>
            <label class="ds-field wide">
              <span>偏好</span>
              <input v-model.trim="nameForm.style" placeholder="例如：清雅、自然、有诗意、不要生僻字" />
            </label>
          </div>
          <button class="ds-button primary" type="button" @click="generateNames">生成方向</button>
          <ResultBlock title="起名方向" :copy="nameResult" />
        </article>

        <article v-else-if="toolId === 'xianghuo'" class="work-card ds-card">
          <div class="panel-head">
            <div>
              <span class="section-kicker">Wish & Incense</span>
              <h2>祈福上香</h2>
            </div>
            <span class="ds-badge red">香火 {{ incenseCount }} 炷</span>
          </div>
          <div class="form-grid">
            <label class="ds-field">
              <span>祈福对象</span>
              <select v-model="wishForm.target">
                <option>自己</option>
                <option>家人</option>
                <option>朋友</option>
                <option>众生</option>
              </select>
            </label>
            <label class="ds-field wide">
              <span>心愿</span>
              <textarea v-model.trim="wishForm.text" placeholder="写下今天想安放的一句话"></textarea>
            </label>
          </div>
          <button class="ds-button primary" type="button" @click="offerIncense">敬上三炷香</button>
          <ResultBlock title="心愿记录" :copy="wishResult" />
        </article>

        <article v-else class="work-card ds-card">
          <div class="panel-head">
            <div>
              <span class="section-kicker">Liuyao</span>
              <h2>六爻占卜</h2>
            </div>
            <span class="ds-badge green">三铜起卦</span>
          </div>
          <div class="form-grid">
            <label class="ds-field wide">
              <span>所问之事</span>
              <input v-model.trim="liuyaoQuestion" placeholder="例如：这个合作本月是否适合推进" />
            </label>
          </div>
          <button class="ds-button primary" type="button" @click="castLiuyao">起卦</button>
          <div class="yao-grid">
            <div v-for="(line, index) in yaoLines" :key="index" :class="{ changing: line.changing }">
              <span>{{ 6 - index }}</span>
              <strong>{{ line.symbol }}</strong>
              <em>{{ line.label }}</em>
            </div>
          </div>
          <ResultBlock title="卦象提示" :copy="liuyaoResult" />
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

const route = useRoute()
const router = useRouter()
const toolId = computed(() => route.params.tool || 'huangli')

const tools = [
  { id: 'huangli', icon: '历', name: '今日黄历', kicker: 'Almanac', related: 'qimen', description: '查看今日宜忌、吉时、方位与行动提醒。' },
  { id: 'lingqian', icon: '签', name: '灵签占问', kicker: 'Lot', related: 'fojiao', description: '填写所问之事，抽取签文并获得一段解释。' },
  { id: 'jiemeng', icon: '梦', name: '梦境解析', kicker: 'Dream', related: 'fojiao', description: '记录梦境、醒来情绪与现实背景，整理梦象提示。' },
  { id: 'qiming', icon: '名', name: '宝宝起名', kicker: 'Naming', related: 'bazi', description: '填写姓氏、生日与偏好，生成命名方向和名字候选。' },
  { id: 'xianghuo', icon: '香', name: '祈福上香', kicker: 'Wish', related: 'fojiao', description: '写下心愿并在本地记录香火，不上传个人愿望。' },
  { id: 'liuyao', icon: '爻', name: '六爻占卜', kicker: 'Liuyao', related: 'qimen', description: '输入具体问题后起六爻，查看爻象和行动提示。' },
]

const tool = computed(() => tools.find((item) => item.id === toolId.value) || tools[0])
const today = computed(() => new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date()))

const question = ref('')
const lotIndex = ref(0)
const lots = [
  { level: '上吉', title: '第一签：云开见月', text: '事情已有转机，但要先把问题说清楚。宜主动沟通，忌反复试探。' },
  { level: '中吉', title: '第十七签：静水照心', text: '当前更适合观察和整理，不宜急着定结果。把补充信息带入 AI 深问会更准确。' },
  { level: '小吉', title: '第三十二签：风入竹林', text: '外界变化较多，先守住边界，再看时机推进。' },
]
const lot = computed(() => lots[lotIndex.value % lots.length])

const dreamForm = ref({ dream: '', mood: '平静', context: '' })
const dreamResult = ref('填写梦境后点击解析，会从象意、情绪和现实提醒三个角度生成提示。')
const nameForm = ref({ familyName: '', gender: '不限定', birth: '', style: '' })
const nameResult = ref('填写姓氏和偏好后生成候选方向。正式起名建议先补全八字信息。')
const wishForm = ref({ target: '自己', text: '' })
const wishResult = ref('写下心愿后，点击上香会记录在当前浏览器中。')
const incenseCount = ref(108)
const liuyaoQuestion = ref('')
const yaoLines = ref([])
const liuyaoResult = ref('输入具体问题后起卦。六爻结果仅作传统文化参考。')

onMounted(() => {
  incenseCount.value = Number(localStorage.getItem('qk_incense') || 108)
  wishForm.value.text = localStorage.getItem('qk_wish') || ''
})

function goHome() {
  router.push('/')
}

function goTool(id) {
  router.push(`/tools/${id}`)
}

function goDivine(id) {
  router.push(`/divine/${id}`)
}

function drawLot() {
  lotIndex.value += 1
}

function analyzeDream() {
  const mood = dreamForm.value.mood
  const context = dreamForm.value.context || '未填写现实背景'
  dreamResult.value = `梦境可先看三层：一是画面象意，二是醒来时的${mood}情绪，三是它和现实背景“${context}”的关系。建议把梦中最强烈的画面写成一句问题，再进入佛学开示继续深问。`
}

function generateNames() {
  const family = nameForm.value.familyName || '姓氏'
  const style = nameForm.value.style || '清雅、自然、易读'
  nameResult.value = `可先按“${style}”方向取名。候选示例：${family}知宁、${family}景初、${family}予安。正式定名建议进入八字页补全出生信息，再结合喜忌细化。`
}

function offerIncense() {
  incenseCount.value += 3
  localStorage.setItem('qk_incense', String(incenseCount.value))
  localStorage.setItem('qk_wish', wishForm.value.text)
  wishResult.value = `已为${wishForm.value.target}敬上三炷香。心愿已保存在当前浏览器：${wishForm.value.text || '愿心安定，所行有度。'}`
}

function castLiuyao() {
  const labels = ['少阴', '少阳', '老阴', '老阳']
  yaoLines.value = Array.from({ length: 6 }, () => {
    const value = Math.floor(Math.random() * 4)
    return {
      label: labels[value],
      symbol: value % 2 === 0 ? '--  --' : '———',
      changing: value >= 2,
    }
  }).reverse()
  liuyaoResult.value = `本次问题：${liuyaoQuestion.value || '未填写'}。先看变爻数量和动静，再把具体问题带入奇门页深问时机与行动策略。`
}
</script>

<style scoped>
.tool-page {
  min-height: 100vh;
  padding: 18px 0 64px;
  color: #f8edd2;
  background:
    radial-gradient(circle at 18% 8%, rgba(212, 175, 55, 0.18), transparent 28%),
    linear-gradient(180deg, #1a1410 0%, #251610 54%, #120d0a 100%);
}

.tool-nav {
  position: sticky;
  top: 12px;
  z-index: 20;
  display: grid;
  grid-template-columns: 120px 1fr 120px;
  gap: 14px;
  align-items: center;
  padding: 10px 14px;
  border: 1px solid rgba(212, 175, 55, 0.24);
  border-radius: var(--radius-md);
  background: rgba(25, 17, 12, 0.8);
  backdrop-filter: blur(18px);
}

.tool-nav h1 {
  margin: 4px 0 0;
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 400;
  text-align: center;
}

.tool-nav .section-kicker {
  justify-content: center;
  width: 100%;
}

.tool-shell {
  display: grid;
  grid-template-columns: 290px minmax(0, 1fr);
  gap: 18px;
  padding-top: 24px;
}

.tool-side,
.work-card {
  z-index: 1;
  border-color: rgba(212, 175, 55, 0.2);
  background: rgba(33, 22, 15, 0.76);
}

.tool-side > *,
.work-card > * {
  position: relative;
  z-index: 1;
}

.tool-side {
  padding: 22px;
}

.tool-mark {
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  border: 1px solid rgba(244, 211, 122, 0.34);
  border-radius: 50%;
  color: #f4d37a;
  font-family: var(--font-display);
  font-size: 30px;
}

.tool-side h2,
.work-card h2 {
  margin: 12px 0 0;
  font-family: var(--font-display);
  font-size: 34px;
  font-weight: 400;
}

.tool-side p,
.result-block p,
.work-card p {
  color: rgba(248, 237, 210, 0.68);
}

.side-links {
  display: grid;
  gap: 8px;
  margin-top: 20px;
}

.side-links button {
  padding: 10px 12px;
  border: 1px solid rgba(244, 211, 122, 0.16);
  border-radius: var(--radius-xs);
  color: rgba(248, 237, 210, 0.72);
  background: rgba(255, 250, 242, 0.05);
  text-align: left;
}

.side-links button.active,
.side-links button:hover {
  color: #f4d37a;
  border-color: rgba(244, 211, 122, 0.36);
}

.work-card {
  display: grid;
  gap: 18px;
  padding: 24px;
}

.panel-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
}

.form-grid,
.almanac-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.ds-field span {
  color: #f4d37a;
  font-size: 13px;
  font-weight: 700;
}

.ds-field.wide {
  grid-column: 1 / -1;
}

.almanac-grid div,
.result-block,
.yao-grid div {
  padding: 14px;
  border: 1px solid rgba(244, 211, 122, 0.18);
  border-radius: var(--radius-xs);
  background: rgba(255, 250, 242, 0.06);
}

.almanac-grid span,
.result-block strong {
  color: #f4d37a;
  font-weight: 700;
}

.almanac-grid strong {
  display: block;
  margin-top: 6px;
}

.result-block p {
  margin: 8px 0 0;
}

.yao-grid {
  display: grid;
  gap: 8px;
}

.yao-grid div {
  display: grid;
  grid-template-columns: 40px 1fr 80px;
  align-items: center;
}

.yao-grid .changing {
  border-color: rgba(200, 58, 46, 0.42);
}

.yao-grid strong {
  color: #f4d37a;
  font-size: 24px;
  letter-spacing: 0;
}

@media (max-width: 900px) {
  .tool-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .tool-nav {
    grid-template-columns: 1fr auto;
  }

  .tool-nav > div {
    display: none;
  }

  .form-grid,
  .almanac-grid {
    grid-template-columns: 1fr;
  }
}
</style>
