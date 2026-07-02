<template>
  <main class="oracle-page">
    <header class="oracle-nav">
      <button class="ds-button ghost" type="button" @click="goBack">返回首页</button>
      <div class="oracle-title">
        <span class="taiji-mark small" aria-hidden="true"></span>
        <div>
          <strong>{{ skillInfo.name }}</strong>
          <span>{{ skillInfo.caption }}</span>
        </div>
      </div>
      <span class="ds-badge green">AI 推演</span>
    </header>

    <section class="oracle-shell app-shell">
      <aside class="side-panel">
        <div class="side-card ds-card">
          <span class="section-kicker">当前术法</span>
          <h1>{{ skillInfo.name }}</h1>
          <p>{{ skillInfo.description }}</p>
          <div class="side-tags">
            <span v-for="tag in skillInfo.tags" :key="tag" class="ds-badge gold">{{ tag }}</span>
          </div>
        </div>

        <div class="side-menu ds-card">
          <button
            v-for="item in skillList"
            :key="item.id"
            type="button"
            :class="{ active: item.id === skillId }"
            @click="switchSkill(item.id)"
          >
            <span>{{ item.icon }}</span>
            <strong>{{ item.name }}</strong>
          </button>
        </div>
      </aside>

      <section class="workbench">
        <div v-if="skillId === 'bazi'" class="form-panel ds-card">
          <div class="panel-head">
            <div>
              <span class="section-kicker">Birth Profile</span>
              <h2>出生信息</h2>
            </div>
            <span class="ds-badge red">必填姓名、日期、时辰</span>
          </div>

          <div class="form-grid">
            <div class="ds-field">
              <label for="name">姓名</label>
              <input id="name" v-model.trim="baziForm.name" placeholder="请输入姓名" />
            </div>
            <div class="ds-field">
              <label for="gender">性别</label>
              <select id="gender" v-model="baziForm.gender">
                <option>男</option>
                <option>女</option>
                <option>不便说明</option>
              </select>
            </div>
            <div class="ds-field">
              <label for="solar-date">阳历生日</label>
              <input id="solar-date" v-model="baziForm.solarDate" type="date" @change="convertLunar" />
            </div>
            <div class="ds-field">
              <label for="shichen">出生时辰</label>
              <select id="shichen" v-model="baziForm.shichen">
                <option value="">请选择</option>
                <option v-for="item in shichenList" :key="item.name" :value="item.name">{{ item.name }}（{{ item.range }}）</option>
              </select>
            </div>
            <div class="ds-field">
              <label for="place">出生地</label>
              <input id="place" v-model.trim="baziForm.place" placeholder="例如：北京" />
            </div>
            <div class="lunar-box">
              <strong>阴历换算</strong>
              <span v-if="lunarResult">{{ lunarResult.lunar_full }} · {{ lunarResult.ganzhi_year }}年 · {{ lunarResult.shengxiao }}生肖</span>
              <span v-else>选择阳历生日后自动换算；后端离线时可继续提交阳历信息。</span>
            </div>
          </div>
        </div>

        <div v-if="skillId === 'qimen'" class="form-panel ds-card">
          <div class="panel-head">
            <div>
              <span class="section-kicker">Qimen Board</span>
              <h2>排盘信息</h2>
            </div>
            <span class="ds-badge gold">默认当前时间</span>
          </div>
          <div class="form-grid two">
            <div class="ds-field">
              <label for="qimen-time">排盘时间</label>
              <input id="qimen-time" v-model="qimenForm.datetime" type="datetime-local" />
            </div>
            <div class="ds-field">
              <label for="city">所在城市</label>
              <input id="city" v-model.trim="qimenForm.city" placeholder="例如：杭州" />
            </div>
          </div>
        </div>

        <div class="chat-panel ds-card">
          <div class="panel-head">
            <div>
              <span class="section-kicker">Ask</span>
              <h2>问卦内容</h2>
            </div>
            <span class="ds-badge" :class="{ green: canSend, red: !canSend }">{{ canSend ? '可提交' : '待补全' }}</span>
          </div>

          <div class="ds-field">
            <label for="question">{{ skillInfo.questionLabel }}</label>
            <textarea
              id="question"
              v-model.trim="userInput"
              :placeholder="skillInfo.askHint"
              :disabled="loading"
              @keydown.ctrl.enter="sendMessage"
            ></textarea>
          </div>

          <div class="chat-actions">
            <button class="ds-button primary" type="button" :disabled="loading || !canSend" @click="sendMessage">
              {{ loading ? '推演中...' : '提交问卦' }}
            </button>
            <button class="ds-button ghost" type="button" :disabled="loading" @click="clearChat">清空记录</button>
          </div>
        </div>

        <div class="result-panel">
          <div v-if="responses.length === 0 && !loading" class="empty-state ds-card">
            <span class="taiji-mark"></span>
            <h2>{{ skillInfo.greeting }}</h2>
            <p>填写信息后提交，结果会以卷轴卡片形式保留在当前页面。</p>
          </div>

          <div v-if="loading" class="loading-state ds-card">
            <span></span>
            <strong>正在推演</strong>
            <p>正在连接术法知识与当前问题，请稍候。</p>
          </div>

          <article v-for="(resp, index) in responses" :key="index" class="answer-card ds-card">
            <div class="answer-head">
              <span class="ds-badge gold">第 {{ index + 1 }} 卦</span>
              <time>{{ today }}</time>
            </div>
            <pre>{{ typeof resp === 'string' ? resp : resp.text }}</pre>
          </article>
        </div>
      </section>
    </section>
  </main>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { divineStream, solarToLunar } from '../api/divine'

const route = useRoute()
const router = useRouter()
const skillId = computed(() => route.params.skill || 'bazi')

const skillList = [
  {
    id: 'bazi',
    icon: '乾',
    name: '四柱八字',
    caption: '命理核心',
    description: '以出生年月日时排出四柱，观察五行、十神、大运与流年节奏。',
    tags: ['四柱', '五行', '大运'],
    questionLabel: '补充问题',
    askHint: '例如：我想重点看未来三年的事业变化。',
    greeting: '请先补全出生信息',
  },
  {
    id: 'yinyuan',
    icon: '缘',
    name: '姻缘测算',
    caption: '关系洞察',
    description: '围绕关系状态、相处模式、桃花机缘与长期稳定性给出温和建议。',
    tags: ['合盘', '桃花', '关系'],
    questionLabel: '姻缘问题',
    askHint: '描述你想了解的关系问题，可包含双方生日或当前状态。',
    greeting: '写下你的情感问题',
  },
  {
    id: 'fojiao',
    icon: '悟',
    name: '佛学开示',
    caption: '心性指引',
    description: '以经典义理和修行视角回应困惑，强调清明、慈悲和可执行的行动。',
    tags: ['开示', '正念', '经典'],
    questionLabel: '困惑或请益',
    askHint: '例如：最近心绪不宁，应如何安顿自己？',
    greeting: '写下你此刻的困惑',
  },
  {
    id: 'qimen',
    icon: '门',
    name: '奇门遁甲',
    caption: '时空决策',
    description: '结合时间、地点和所问之事，用盘局辅助判断方向、时机与策略。',
    tags: ['排盘', '方位', '择时'],
    questionLabel: '所问之事',
    askHint: '例如：这周是否适合推进某个合作？',
    greeting: '填写排盘时间并描述所问之事',
  },
]

const skillInfo = computed(() => skillList.find((item) => item.id === skillId.value) || skillList[0])
const today = new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit' }).format(new Date())

const userInput = ref('')
const loading = ref(false)
const responses = ref([])
const lunarResult = ref(null)
const baziForm = ref({ name: '', gender: '男', solarDate: '', shichen: '', place: '' })
const qimenForm = ref({ datetime: '', city: '' })

const shichenList = [
  { name: '子时', range: '23:00-01:00' },
  { name: '丑时', range: '01:00-03:00' },
  { name: '寅时', range: '03:00-05:00' },
  { name: '卯时', range: '05:00-07:00' },
  { name: '辰时', range: '07:00-09:00' },
  { name: '巳时', range: '09:00-11:00' },
  { name: '午时', range: '11:00-13:00' },
  { name: '未时', range: '13:00-15:00' },
  { name: '申时', range: '15:00-17:00' },
  { name: '酉时', range: '17:00-19:00' },
  { name: '戌时', range: '19:00-21:00' },
  { name: '亥时', range: '21:00-23:00' },
]

const canSend = computed(() => {
  if (skillId.value === 'bazi') {
    return Boolean(baziForm.value.name && baziForm.value.solarDate && baziForm.value.shichen)
  }
  return Boolean(userInput.value)
})

onMounted(() => {
  baziForm.value.shichen = getCurrentShichen()
  qimenForm.value.datetime = getNowDatetimeLocal()
})

watch(skillId, () => {
  userInput.value = ''
  responses.value = []
  lunarResult.value = null
})

function getCurrentShichen() {
  const h = new Date().getHours()
  if (h >= 23 || h < 1) return '子时'
  if (h < 3) return '丑时'
  if (h < 5) return '寅时'
  if (h < 7) return '卯时'
  if (h < 9) return '辰时'
  if (h < 11) return '巳时'
  if (h < 13) return '午时'
  if (h < 15) return '未时'
  if (h < 17) return '申时'
  if (h < 19) return '酉时'
  if (h < 21) return '戌时'
  return '亥时'
}

function getNowDatetimeLocal() {
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

function goBack() {
  router.push('/')
}

function switchSkill(id) {
  router.push(`/divine/${id}`)
}

function clearChat() {
  responses.value = []
}

async function sendMessage() {
  if (!canSend.value || loading.value) return

  let message = userInput.value
  if (skillId.value === 'bazi') {
    const form = baziForm.value
    const parts = [
      `姓名：${form.name}`,
      `性别：${form.gender}`,
      `阳历生日：${form.solarDate}`,
      `出生时辰：${form.shichen}`,
    ]
    if (form.place) parts.push(`出生地：${form.place}`)
    if (lunarResult.value) {
      parts.push(`阴历生日：${lunarResult.value.lunar_full}`)
      parts.push(`年柱：${lunarResult.value.ganzhi_year}`)
      parts.push(`生肖：${lunarResult.value.shengxiao}`)
    }
    if (userInput.value) parts.push(`补充问题：${userInput.value}`)
    message = parts.join('，')
  }

  const extra = {}
  if (skillId.value === 'qimen') {
    if (qimenForm.value.datetime) extra.datetime_str = qimenForm.value.datetime.replace('T', ' ')
    if (qimenForm.value.city) extra.city = qimenForm.value.city
  }

  loading.value = true
  userInput.value = ''
  let answer = ''

  await nextTick()

  try {
    await divineStream(
      skillId.value,
      message,
      [],
      extra,
      (chunk) => {
        answer += chunk
        if (responses.value.length && responses.value[responses.value.length - 1].streaming) {
          responses.value[responses.value.length - 1].text = answer
        } else {
          responses.value.push({ text: answer, streaming: true })
        }
      },
      () => {
        if (responses.value.length) {
          responses.value[responses.value.length - 1] = responses.value[responses.value.length - 1].text || answer
        }
        loading.value = false
      },
    )
  } catch (error) {
    responses.value.push(`暂时无法完成推演：${error.message}`)
    loading.value = false
  }
}
</script>

<style scoped>
.oracle-page {
  min-height: 100vh;
  padding: 18px 0 42px;
}

.oracle-nav {
  position: sticky;
  top: 12px;
  z-index: 20;
  display: grid;
  width: min(var(--max), calc(100% - 40px));
  grid-template-columns: 140px 1fr 110px;
  gap: 16px;
  align-items: center;
  margin: 0 auto;
  padding: 10px 14px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: rgba(251, 246, 239, 0.84);
  box-shadow: 0 14px 40px rgba(63, 45, 23, 0.08);
  backdrop-filter: blur(18px);
}

.oracle-title {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.oracle-title strong,
.oracle-title span {
  display: block;
  line-height: 1.35;
}

.oracle-title strong {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 400;
}

.oracle-title span {
  color: var(--ink-soft);
  font-size: 12px;
}

.oracle-shell {
  display: grid;
  grid-template-columns: 290px minmax(0, 1fr);
  gap: 20px;
  padding-top: 24px;
}

.side-panel {
  display: grid;
  gap: 14px;
  align-content: start;
}

.side-card,
.side-menu,
.form-panel,
.chat-panel,
.empty-state,
.loading-state,
.answer-card {
  z-index: 1;
}

.side-card {
  padding: 22px;
}

.side-card > *,
.side-menu > *,
.form-panel > *,
.chat-panel > *,
.empty-state > *,
.loading-state > *,
.answer-card > * {
  position: relative;
  z-index: 1;
}

.side-card h1 {
  margin: 10px 0 0;
  font-family: var(--font-display);
  font-size: 42px;
  font-weight: 400;
  line-height: 1.1;
}

.side-card p {
  margin: 12px 0 0;
  color: var(--ink-soft);
}

.side-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}

.side-menu {
  display: grid;
  gap: 8px;
  padding: 10px;
}

.side-menu button {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px;
  border: 1px solid transparent;
  border-radius: var(--radius-xs);
  color: var(--ink-soft);
  background: transparent;
  text-align: left;
}

.side-menu button span {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 50%;
  font-family: var(--font-display);
}

.side-menu button.active,
.side-menu button:hover {
  border-color: var(--line);
  color: var(--ink);
  background: rgba(255, 250, 242, 0.72);
}

.workbench {
  display: grid;
  gap: 16px;
  align-content: start;
}

.form-panel,
.chat-panel,
.empty-state,
.loading-state,
.answer-card {
  padding: 22px;
}

.panel-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.panel-head h2 {
  margin: 8px 0 0;
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 400;
  line-height: 1.1;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.form-grid.two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.lunar-box {
  display: grid;
  gap: 4px;
  min-height: 42px;
  padding: 10px 12px;
  border: 1px solid rgba(212, 175, 55, 0.26);
  border-radius: var(--radius-xs);
  background: rgba(212, 175, 55, 0.08);
}

.lunar-box strong {
  color: var(--gold-deep);
  font-size: 13px;
}

.lunar-box span {
  color: var(--ink-soft);
  font-size: 13px;
}

.chat-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.result-panel {
  display: grid;
  gap: 14px;
}

.empty-state,
.loading-state {
  display: grid;
  min-height: 260px;
  place-items: center;
  text-align: center;
}

.empty-state h2,
.loading-state strong {
  margin: 10px 0 0;
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 400;
}

.empty-state p,
.loading-state p {
  max-width: 420px;
  margin: 4px auto 0;
  color: var(--ink-soft);
}

.loading-state span {
  width: 46px;
  height: 46px;
  border: 2px solid rgba(212, 175, 55, 0.24);
  border-top-color: var(--seal);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.answer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.answer-head time {
  color: var(--ink-soft);
  font-size: 12px;
}

.answer-card pre {
  margin: 0;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--ink);
  font-family: var(--font-serif);
  line-height: 2;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 960px) {
  .oracle-shell {
    grid-template-columns: 1fr;
  }

  .side-panel {
    grid-template-columns: 1fr;
  }

  .side-menu {
    grid-template-columns: repeat(4, 1fr);
  }

  .side-menu button {
    justify-content: center;
  }

  .side-menu button strong {
    display: none;
  }

  .form-grid,
  .form-grid.two {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 680px) {
  .oracle-nav {
    width: min(100% - 28px, var(--max));
    grid-template-columns: 1fr auto;
  }

  .oracle-nav > .ds-badge {
    display: none;
  }

  .oracle-title {
    justify-content: end;
  }

  .oracle-title div {
    display: none;
  }

  .form-grid,
  .form-grid.two {
    grid-template-columns: 1fr;
  }

  .panel-head {
    display: grid;
  }

  .side-menu {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
