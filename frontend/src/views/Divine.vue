<template>
  <main class="divine-page ritual-page">
    <header class="page-nav app-shell">
      <button class="ds-button ghost" type="button" @click="router.push('/')">返回首页</button>
      <div class="title-center">
        <span class="round-mark small">{{ skillInfo.icon }}</span>
        <div>
          <strong>{{ skillInfo.name }}</strong>
          <em>{{ skillInfo.caption }}</em>
        </div>
      </div>
      <span class="ds-badge green">AI 推演</span>
    </header>

    <section class="divine-shell app-shell">
      <aside class="method-panel ds-card">
        <span class="section-kicker">当前术法</span>
        <h1>{{ skillInfo.name }}</h1>
        <p>{{ skillInfo.description }}</p>
        <div class="method-tags">
          <span v-for="tag in skillInfo.tags" :key="tag" class="ds-badge gold">{{ tag }}</span>
        </div>
        <div class="method-menu">
          <button v-for="item in skillList" :key="item.id" type="button" :class="{ active: item.id === skillId }" @click="switchSkill(item.id)">
            <span>{{ item.icon }}</span>
            <strong>{{ item.name }}</strong>
          </button>
        </div>
      </aside>

      <section class="workbench">
        <article class="form-panel ds-card">
          <div class="panel-head">
            <div>
              <span class="section-kicker">{{ skillInfo.formKicker }}</span>
              <h2>{{ skillInfo.formTitle }}</h2>
            </div>
            <span class="ds-badge" :class="canSend ? 'green' : 'red'">{{ canSend ? '可提交' : '待补全' }}</span>
          </div>

          <div v-if="skillId === 'bazi'" class="form-grid">
            <label class="ds-field"><span>姓名</span><input v-model.trim="baziForm.name" placeholder="请输入姓名" /></label>
            <label class="ds-field"><span>性别</span><select v-model="baziForm.gender"><option>男</option><option>女</option><option>不便说明</option></select></label>
            <label class="ds-field"><span>阳历生日</span><input v-model="baziForm.solarDate" type="date" @change="convertLunar" /></label>
            <label class="ds-field"><span>出生时辰</span><select v-model="baziForm.shichen"><option value="">请选择</option><option v-for="item in shichenList" :key="item.name" :value="item.name">{{ item.name }}（{{ item.range }}）</option></select></label>
            <label class="ds-field"><span>出生地</span><input v-model.trim="baziForm.place" placeholder="例如：杭州" /></label>
            <div class="info-chip">{{ lunarResult ? `${lunarResult.lunar_full} · ${lunarResult.ganzhi_year}年 · ${lunarResult.shengxiao}生肖` : '选择阳历生日后尝试换算农历；后端不可用时会直接使用阳历信息。' }}</div>
          </div>

          <div v-else-if="skillId === 'yinyuan'" class="form-grid">
            <label class="ds-field"><span>你的称呼</span><input v-model.trim="yinyuanForm.name" placeholder="例如：小林" /></label>
            <label class="ds-field"><span>你的生日</span><input v-model="yinyuanForm.birthday" type="date" /></label>
            <label class="ds-field wide"><span>对方信息</span><input v-model.trim="yinyuanForm.partner" placeholder="姓名、生日或大致情况" /></label>
            <label class="ds-field"><span>关系状态</span><select v-model="yinyuanForm.status"><option value="">请选择</option><option>单身，想看正缘</option><option>暧昧中，想看走向</option><option>恋爱中，想看稳定性</option><option>分开后，想看是否复合</option><option>婚姻中，想看相处问题</option></select></label>
            <label class="ds-field"><span>关注点</span><select v-model="yinyuanForm.focus"><option value="">请选择</option><option>正缘时间</option><option>对方是否合适</option><option>关系阻碍</option><option>沟通与相处</option><option>未来半年趋势</option></select></label>
          </div>

          <div v-else-if="skillId === 'fojiao'" class="form-grid">
            <label class="ds-field"><span>困惑类型</span><select v-model="fojiaoForm.topic"><option value="">请选择</option><option>情绪焦虑</option><option>人际关系</option><option>工作压力</option><option>家庭牵挂</option><option>修行疑问</option><option>人生取舍</option></select></label>
            <label class="ds-field"><span>当前心境</span><select v-model="fojiaoForm.mood"><option value="">请选择</option><option>焦虑不安</option><option>犹豫反复</option><option>执着放不下</option><option>疲惫麻木</option><option>想要安定</option></select></label>
            <label class="ds-field wide"><span>事情背景</span><input v-model.trim="fojiaoForm.context" placeholder="简单说说发生了什么，或你卡在哪里" /></label>
          </div>

          <div v-else class="form-grid">
            <label class="ds-field"><span>排盘时间</span><input v-model="qimenForm.datetime" type="datetime-local" /></label>
            <label class="ds-field"><span>所在城市</span><input v-model.trim="qimenForm.city" placeholder="例如：杭州" /></label>
            <label class="ds-field"><span>事情类型</span><select v-model="qimenForm.topic"><option>合作/项目</option><option>出行/迁移</option><option>求职/事业</option><option>感情/关系</option><option>财务/交易</option><option>其他</option></select></label>
          </div>
        </article>

        <article class="ask-panel ds-card">
          <div class="panel-head">
            <div>
              <span class="section-kicker">Ask</span>
              <h2>{{ skillInfo.questionLabel }}</h2>
            </div>
          </div>
          <label class="ds-field">
            <span>所问内容</span>
            <textarea v-model.trim="userInput" :placeholder="skillInfo.askHint" :disabled="loading" @keydown.ctrl.enter="sendMessage"></textarea>
          </label>
          <p class="privacy-note">页面不会在浏览器之外主动保存你的姓名、生日、地点或提问内容。</p>
          <div class="actions">
            <button class="ds-button primary" type="button" :disabled="loading || !canSend" @click="sendMessage">{{ loading ? '推演中...' : '提交问事' }}</button>
            <button class="ds-button ghost" type="button" :disabled="loading" @click="responses = []">清空记录</button>
          </div>
        </article>

        <section class="result-list">
          <article v-if="responses.length === 0 && !loading" class="empty-card ds-card">
            <span class="round-mark">{{ skillInfo.icon }}</span>
            <h2>{{ skillInfo.greeting }}</h2>
            <p>{{ skillInfo.emptyCopy }}</p>
          </article>

          <article v-if="loading" class="empty-card ds-card">
            <span class="loading-ring"></span>
            <h2>正在推演</h2>
            <p>正在连接后端和术法提示词，请稍候。</p>
          </article>

          <article v-for="(resp, index) in responses" :key="index" class="answer-card ds-card">
            <div class="answer-head">
              <span class="ds-badge gold">第 {{ index + 1 }} 卦</span>
              <time>{{ today }}</time>
            </div>
            <VisualBoard v-if="typeof resp !== 'string' && resp.board" :board="resp.board" />
            <pre>{{ typeof resp === 'string' ? resp : resp.text }}</pre>
          </article>
        </section>
      </section>
    </section>
  </main>
</template>

<script setup>
import { computed, defineComponent, h, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { divineStream, solarToLunar } from '../api/divine'

const route = useRoute()
const router = useRouter()
const skillId = computed(() => route.params.skill || 'bazi')

const skillList = [
  { id: 'bazi', icon: '命', name: '四柱八字', caption: '命理核心', formKicker: 'Birth Profile', formTitle: '出生信息', description: '以出生年月日时排出四柱，观察五行、阶段节奏与关注方向。', tags: ['四柱', '五行', '大运'], questionLabel: '补充问题', askHint: '例如：我想重点看未来三年的事业变化。', greeting: '请先补全出生信息', emptyCopy: '八字需要姓名、生日和时辰。补全后可继续写一个具体关注点。' },
  { id: 'yinyuan', icon: '缘', name: '姻缘测算', caption: '关系洞察', formKicker: 'Relationship', formTitle: '姻缘信息', description: '围绕关系状态、相处模式、桃花机缘与长期稳定性给出建议。', tags: ['合盘', '桃花', '关系'], questionLabel: '补充描述', askHint: '例如：我们最近联系变少，我想知道是否还适合继续推进。', greeting: '请补全关系信息', emptyCopy: '姻缘测算需要关系状态、关注点和必要背景。' },
  { id: 'fojiao', icon: '禅', name: '佛学开示', caption: '心性指引', formKicker: 'Mind Practice', formTitle: '请益背景', description: '以经典义理和修行视角回应困惑，强调清明、慈悲和可执行行动。', tags: ['开示', '正念', '观照'], questionLabel: '请益内容', askHint: '例如：最近总为一件事反复内耗，应如何安顿自己？', greeting: '写下此刻的困惑', emptyCopy: '佛学开示需要困惑类型、当前心境和事情背景。' },
  { id: 'qimen', icon: '门', name: '奇门遁甲', caption: '时空决策', formKicker: 'Qimen Board', formTitle: '排盘信息', description: '结合时间、地点和所问之事，用盘局辅助判断方向、时机与策略。', tags: ['排盘', '方位', '择时'], questionLabel: '所问之事', askHint: '例如：这周是否适合推进某个合作？', greeting: '填写排盘时间并描述所问之事', emptyCopy: '奇门更适合具体问题，请填写时间、城市、事情类型和明确问题。' },
]

const shichenList = [
  { name: '子时', range: '23:00-01:00' }, { name: '丑时', range: '01:00-03:00' }, { name: '寅时', range: '03:00-05:00' }, { name: '卯时', range: '05:00-07:00' },
  { name: '辰时', range: '07:00-09:00' }, { name: '巳时', range: '09:00-11:00' }, { name: '午时', range: '11:00-13:00' }, { name: '未时', range: '13:00-15:00' },
  { name: '申时', range: '15:00-17:00' }, { name: '酉时', range: '17:00-19:00' }, { name: '戌时', range: '19:00-21:00' }, { name: '亥时', range: '21:00-23:00' },
]

const skillInfo = computed(() => skillList.find((item) => item.id === skillId.value) || skillList[0])
const today = new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit' }).format(new Date())
const userInput = ref('')
const loading = ref(false)
const responses = ref([])
const lunarResult = ref(null)
const baziForm = ref({ name: '', gender: '男', solarDate: '', shichen: '', place: '' })
const yinyuanForm = ref({ name: '', birthday: '', partner: '', status: '', focus: '' })
const fojiaoForm = ref({ topic: '', mood: '', context: '' })
const qimenForm = ref({ datetime: '', city: '', topic: '合作/项目' })

const canSend = computed(() => {
  if (skillId.value === 'bazi') return Boolean(baziForm.value.name && baziForm.value.solarDate && baziForm.value.shichen)
  if (skillId.value === 'yinyuan') return Boolean(yinyuanForm.value.status && yinyuanForm.value.focus)
  if (skillId.value === 'fojiao') return Boolean(fojiaoForm.value.topic && fojiaoForm.value.mood)
  return Boolean(qimenForm.value.datetime && userInput.value)
})

onMounted(() => {
  baziForm.value.shichen = currentShichen()
  qimenForm.value.datetime = nowDatetimeLocal()
})

watch(skillId, () => {
  userInput.value = ''
  responses.value = []
  lunarResult.value = null
})

function switchSkill(id) {
  router.push(`/divine/${id}`)
}

function currentShichen() {
  const h = new Date().getHours()
  if (h >= 23 || h < 1) return '子时'
  return shichenList[Math.floor((h + 1) / 2)]?.name || '亥时'
}

function nowDatetimeLocal() {
  const d = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

async function convertLunar() {
  if (!baziForm.value.solarDate) {
    lunarResult.value = null
    return
  }
  try {
    lunarResult.value = await solarToLunar(baziForm.value.solarDate)
  } catch {
    lunarResult.value = null
  }
}

function buildMessage() {
  if (skillId.value === 'bazi') {
    const f = baziForm.value
    return [`姓名：${f.name}`, `性别：${f.gender}`, `阳历生日：${f.solarDate}`, `出生时辰：${f.shichen}`, f.place && `出生地：${f.place}`, lunarResult.value && `农历：${lunarResult.value.lunar_full}`, userInput.value && `补充问题：${userInput.value}`].filter(Boolean).join('；')
  }
  if (skillId.value === 'yinyuan') {
    const f = yinyuanForm.value
    return [`我的称呼：${f.name || '未填写'}`, `我的生日：${f.birthday || '未填写'}`, `对方信息：${f.partner || '未填写'}`, `关系状态：${f.status}`, `关注点：${f.focus}`, userInput.value && `补充描述：${userInput.value}`].filter(Boolean).join('；')
  }
  if (skillId.value === 'fojiao') {
    const f = fojiaoForm.value
    return [`困惑类型：${f.topic}`, `当前心境：${f.mood}`, `事情背景：${f.context || '未填写'}`, userInput.value && `请益内容：${userInput.value}`].filter(Boolean).join('；')
  }
  const f = qimenForm.value
  return [`事情类型：${f.topic}`, `所在城市：${f.city || '未填写'}`, `所问之事：${userInput.value}`].join('；')
}

function buildBoard() {
  const boardMap = {
    bazi: { title: '四柱盘面', badge: baziForm.value.shichen || '时辰', items: [['年柱', baziForm.value.solarDate?.slice(0, 4) || '待定'], ['月柱', baziForm.value.solarDate?.slice(5, 7) || '待定'], ['日主', baziForm.value.name || '本人'], ['时柱', baziForm.value.shichen || '待定']] },
    yinyuan: { title: '姻缘关系盘', badge: yinyuanForm.value.focus || '关注点', items: [['关系', yinyuanForm.value.status || '待定'], ['关注', yinyuanForm.value.focus || '待定'], ['对方', yinyuanForm.value.partner || '未填'], ['阶段', '观察沟通']] },
    fojiao: { title: '心性观照盘', badge: fojiaoForm.value.mood || '心境', items: [['困惑', fojiaoForm.value.topic || '待定'], ['心境', fojiaoForm.value.mood || '待定'], ['执着点', '先照见'], ['行动', '小步安顿']] },
    qimen: { title: '奇门九宫盘', badge: qimenForm.value.topic, items: [['巽四', '东南'], ['离九', '南'], ['坤二', '西南'], ['震三', '东'], ['中五', qimenForm.value.topic], ['兑七', '西'], ['艮八', '东北'], ['坎一', '北'], ['乾六', '西北']] },
  }
  return { type: skillId.value, ...boardMap[skillId.value] }
}

async function sendMessage() {
  if (!canSend.value || loading.value) return
  const message = buildMessage()
  const board = buildBoard()
  const extra = {}
  if (skillId.value === 'qimen') {
    extra.datetime_str = qimenForm.value.datetime.replace('T', ' ')
    if (qimenForm.value.city) extra.city = qimenForm.value.city
  }

  loading.value = true
  userInput.value = ''
  let answer = ''
  await nextTick()

  try {
    await divineStream(skillId.value, message, [], extra, (chunk) => {
      answer += chunk
      const last = responses.value[responses.value.length - 1]
      if (last?.streaming) last.text = answer
      else responses.value.push({ text: answer, streaming: true, board })
    }, () => {
      const last = responses.value[responses.value.length - 1]
      if (last && typeof last !== 'string') responses.value[responses.value.length - 1] = { ...last, text: last.text || answer, streaming: false }
      loading.value = false
    })
  } catch (error) {
    responses.value.push(`暂时无法完成推演：${error.message}`)
    loading.value = false
  }
}

const VisualBoard = defineComponent({
  props: { board: Object },
  setup(props) {
    return () => h('div', { class: ['visual-board', `board-${props.board.type}`] }, [
      h('div', { class: 'board-head' }, [h('h3', props.board.title), h('span', { class: 'ds-badge gold' }, props.board.badge)]),
      h('div', { class: 'board-grid' }, props.board.items.map(([label, value]) => h('div', { class: 'board-cell' }, [h('span', label), h('strong', value), h('em', boardNote(props.board.type, label))]))),
    ])
  },
})

function boardNote(type, label) {
  if (type === 'qimen') return label === '中五' ? '本次所问核心' : '观察方位与策略'
  if (type === 'bazi') return '用于定位命盘结构'
  if (type === 'yinyuan') return '用于观察关系状态'
  return '用于安顿当下心念'
}
</script>

<style scoped>
.divine-page {
  padding: 18px 0 54px;
}

.title-center {
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
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

.divine-shell {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 18px;
  padding-top: 24px;
}

.method-panel,
.form-panel,
.ask-panel,
.empty-card,
.answer-card {
  padding: 22px;
}

.method-panel > *,
.form-panel > *,
.ask-panel > *,
.empty-card > *,
.answer-card > * {
  position: relative;
  z-index: 1;
}

.method-panel h1,
.panel-head h2,
.empty-card h2 {
  margin: 10px 0 0;
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 400;
  line-height: 1.08;
}

.method-panel p,
.privacy-note,
.empty-card p {
  color: var(--paper-dim);
}

.method-tags,
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.method-menu {
  display: grid;
  gap: 8px;
  margin-top: 22px;
}

.method-menu button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px;
  border: 1px solid rgba(215, 179, 95, 0.14);
  border-radius: var(--radius-xs);
  color: var(--paper-dim);
  background: rgba(255, 247, 231, 0.04);
  text-align: left;
}

.method-menu button.active,
.method-menu button:hover {
  color: var(--gold-bright);
  border-color: rgba(240, 217, 132, 0.42);
}

.method-menu span {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 50%;
}

.workbench {
  display: grid;
  gap: 16px;
  align-content: start;
}

.panel-head,
.answer-head,
.board-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.wide {
  grid-column: span 2;
}

.info-chip {
  display: grid;
  align-items: center;
  min-height: 44px;
  padding: 10px 12px;
  border: 1px solid rgba(215, 179, 95, 0.24);
  border-radius: var(--radius-xs);
  color: var(--paper-dim);
  background: rgba(215, 179, 95, 0.08);
}

.privacy-note {
  margin: 10px 0 0;
  font-size: 13px;
}

.result-list {
  display: grid;
  gap: 14px;
}

.empty-card {
  display: grid;
  min-height: 260px;
  place-items: center;
  text-align: center;
}

.loading-ring {
  width: 48px;
  height: 48px;
  border: 2px solid rgba(215, 179, 95, 0.26);
  border-top-color: var(--seal);
  border-radius: 50%;
  animation: slow-rotate 1s linear infinite;
}

.visual-board {
  display: grid;
  gap: 14px;
  margin-bottom: 18px;
  padding: 16px;
  border: 1px solid rgba(215, 179, 95, 0.2);
  border-radius: var(--radius-sm);
  background: rgba(13, 9, 7, 0.32);
}

.board-head h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 400;
}

.board-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.board-qimen .board-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.board-cell {
  display: grid;
  min-height: 116px;
  align-content: start;
  gap: 6px;
  padding: 12px;
  border: 1px solid rgba(215, 179, 95, 0.16);
  border-radius: var(--radius-xs);
  background: rgba(255, 247, 231, 0.05);
}

.board-cell span {
  color: var(--seal);
  font-weight: 700;
  font-size: 12px;
}

.board-cell strong {
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 25px;
  font-weight: 400;
  line-height: 1.1;
}

.board-cell em {
  color: var(--paper-dim);
  font-size: 13px;
  font-style: normal;
}

.answer-card pre {
  margin: 0;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--paper);
  font-family: var(--font-serif);
  line-height: 2;
}

@media (max-width: 980px) {
  .divine-shell {
    grid-template-columns: 1fr;
  }

  .method-menu {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .method-menu strong {
    display: none;
  }

  .method-menu button {
    justify-content: center;
  }

  .form-grid,
  .board-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .page-nav > .ds-badge,
  .title-center div {
    display: none;
  }

  .method-menu,
  .form-grid,
  .board-grid,
  .board-qimen .board-grid {
    grid-template-columns: 1fr;
  }

  .wide {
    grid-column: auto;
  }

  .panel-head,
  .answer-head,
  .board-head {
    display: grid;
  }
}
</style>
