<template>
  <div class="divine-page">
    <!-- 浮游符文 -->
    <div class="runes-bg">
      <span v-for="r in runes" :key="r.id" class="rune" :style="r.style">{{ r.char }}</span>
    </div>

    <!-- 顶栏 -->
    <div class="header">
      <button class="back-btn" @click="goBack">⟵ 山门</button>
      <div class="page-title-wrap">
        <span class="page-icon">{{ skillInfo.icon }}</span>
        <h2 class="page-title">{{ skillInfo.name }}</h2>
        <span class="header-seal">{{ skillInfo.seal }}</span>
      </div>
      <div class="header-spacer"></div>
    </div>

    <!-- 主内容区 -->
    <div class="main-scroll" ref="mainScroll">

      <!-- 八字：出生信息 -->
      <div v-if="skillId === 'bazi'" class="info-form">
        <div class="form-title">出生信息</div>
        <div class="form-grid">
          <div class="form-item">
            <label>姓名</label>
            <input v-model="baziForm.name" placeholder="请输入姓名" />
          </div>
          <div class="form-item">
            <label>性别</label>
            <div class="radio-group">
              <span :class="['radio', baziForm.gender === '男' ? 'active' : '']" @click="baziForm.gender = '男'">男</span>
              <span :class="['radio', baziForm.gender === '女' ? 'active' : '']" @click="baziForm.gender = '女'">女</span>
            </div>
          </div>
          <div class="form-item">
            <label>阳历生日</label>
            <input type="date" v-model="baziForm.solarDate" @change="convertLunar" />
          </div>
          <div class="form-item" v-if="lunarResult">
            <label>阴历生日</label>
            <div class="lunar-display">
              <span class="lunar-main">{{ lunarResult.lunar_full }}</span>
              <span class="lunar-gz">{{ lunarResult.ganzhi_year }}年 {{ lunarResult.shengxiao }}属</span>
            </div>
          </div>
          <div class="form-item" v-else>
            <label>阴历生日</label>
            <div class="lunar-hint">选择阳历后自动匹配</div>
          </div>
          <div class="form-item">
            <label>出生时辰</label>
            <select v-model="baziForm.shichen">
              <option value="">请选择</option>
              <option v-for="s in shichenList" :key="s.name" :value="s.name">{{ s.name }}（{{ s.range }}）</option>
            </select>
          </div>
          <div class="form-item">
            <label>出生地</label>
            <input v-model="baziForm.place" placeholder="如：北京" />
          </div>
        </div>
      </div>

      <!-- 奇门：排盘信息 -->
      <div v-if="skillId === 'qimen'" class="info-form compact">
        <div class="form-title">排盘信息</div>
        <div class="form-grid">
          <div class="form-item">
            <label>排盘时间</label>
            <input type="datetime-local" v-model="qimenForm.datetime" />
          </div>
          <div class="form-item">
            <label>所在城池</label>
            <input v-model="qimenForm.city" placeholder="如：长安" />
          </div>
        </div>
      </div>

      <!-- 提问输入 -->
      <div class="ask-area">
        <div class="ask-wrap">
          <input
            v-model="userInput"
            class="ask-input"
            :placeholder="skillInfo.askHint"
            @keydown.enter="sendMessage"
            :disabled="loading"
          />
          <button class="ask-btn" @click="sendMessage" :disabled="loading || !canSend">
            <span v-if="!loading">问卦</span>
            <span v-else class="loading-text">推演中…</span>
          </button>
        </div>
      </div>

      <!-- 初始引导 -->
      <div v-if="responses.length === 0 && !loading" class="guide">
        <div class="guide-icon">{{ skillInfo.icon }}</div>
        <div class="guide-text">{{ skillInfo.greeting }}</div>
      </div>

      <!-- AI 回应卷轴 -->
      <div v-if="responses.length > 0" class="responses">
        <div v-for="(resp, idx) in responses" :key="idx" class="scroll-response">
          <div class="scroll-header">
            <span class="scroll-icon">◈</span>
            <span class="scroll-label">第{{ idx + 1 }}卦 · 天机启示</span>
          </div>
          <div class="scroll-body">
            <div class="scroll-content">{{ resp }}</div>
          </div>
          <div class="scroll-footer">
            <span class="scroll-hex">{{ ['☰','☷','☲','☵','☳','☴','☶','☱'][idx % 8] }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { divineStream, solarToLunar } from '../api/divine'

const route = useRoute()
const router = useRouter()
const skillId = computed(() => route.params.skill)

const skillMap = {
  bazi: {
    icon: '☰', name: '四柱八字', seal: '乾',
    greeting: '请填写出生信息，贫道为您推演命理。信息越详细，推演越精准。',
    askHint: '补充问题（可选）…',
  },
  yinyuan: {
    icon: '🎎', name: '姻缘测算', seal: '坤',
    greeting: '有缘人，您所问何事？八字合婚、生肖配对、求签问姻缘、桃花运势，皆可一测。',
    askHint: '请输入您的姻缘问题…',
  },
  fojiao: {
    icon: '☸', name: '佛学开示', seal: '离',
    greeting: '阿弥陀佛。您想向哪位高僧大德请益？或有何困惑，愿听佛法开示？',
    askHint: '请输入您的困惑…',
  },
  qimen: {
    icon: '☯', name: '奇门遁甲', seal: '坎',
    greeting: '阁下欲观何事？请填写排盘信息，告知所问之事。',
    askHint: '请描述您要测算的事…',
  },
}

const skillInfo = computed(() => skillMap[skillId.value] || skillMap.bazi)

const userInput = ref('')
const loading = ref(false)
const responses = ref([])
const mainScroll = ref(null)

const baziForm = ref({ name: '', gender: '男', solarDate: '', shichen: '', place: '' })
const lunarResult = ref(null)
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

const runeChars = ['道','德','玄','妙','一','炁','无','极','太','上','清','静','真','符','甲','乙','丙','丁','戊','己','庚','辛','壬','癸','子','丑','寅','卯','辰','巳','午','未','申','酉']
const runes = ref([])

onMounted(() => {
  const generated = []
  for (let i = 0; i < 25; i++) {
    generated.push({
      id: i,
      char: runeChars[Math.floor(Math.random() * runeChars.length)],
      style: {
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        fontSize: (10 + Math.random() * 14) + 'px',
        animationDuration: (20 + Math.random() * 25) + 's',
        animationDelay: (-Math.random() * 15) + 's',
        opacity: 0.03 + Math.random() * 0.04,
      }
    })
  }
  runes.value = generated
})

watch(skillId, () => {
  responses.value = []
  lunarResult.value = null
})

async function convertLunar() {
  if (!baziForm.value.solarDate) { lunarResult.value = null; return }
  try {
    lunarResult.value = await solarToLunar(baziForm.value.solarDate)
  } catch {
    lunarResult.value = null
  }
}

const canSend = computed(() => {
  if (skillId.value === 'bazi') {
    return baziForm.value.name && baziForm.value.solarDate && baziForm.value.shichen
  }
  return userInput.value.trim()
})

function goBack() { router.push('/') }

async function sendMessage() {
  if (!canSend.value || loading.value) return

  let message = userInput.value.trim()

  if (skillId.value === 'bazi') {
    const f = baziForm.value
    let info = `姓名：${f.name}，性别：${f.gender}，阳历生日：${f.solarDate}`
    if (lunarResult.value) {
      info += `，阴历生日：${lunarResult.value.lunar_full}，年柱：${lunarResult.value.ganzhi_year}，生肖：${lunarResult.value.shengxiao}`
    }
    info += `，时辰：${f.shichen}`
    if (f.place) info += `，出生地：${f.place}`
    if (message) info += `\n\n补充问题：${message}`
    message = info
  }

  userInput.value = ''
  loading.value = true
  let aiContent = ''

  const extra = {}
  if (skillId.value === 'qimen' && qimenForm.value.datetime) {
    extra.datetime_str = qimenForm.value.datetime.replace('T', ' ')
    if (qimenForm.value.city) extra.city = qimenForm.value.city
  }

  await nextTick()
  scrollToBottom()

  try {
    await divineStream(
      skillId.value, message, [], extra,
      (chunk) => {
        aiContent += chunk
        if (responses.value.length > 0 && responses.value[responses.value.length - 1]._streaming) {
          responses.value[responses.value.length - 1] = aiContent
          responses.value[responses.value.length - 1]._streaming = true
        } else {
          responses.value.push(aiContent)
        }
        scrollToBottom()
      },
      () => {
        if (responses.value.length > 0) {
          const last = responses.value[responses.value.length - 1]
          if (typeof last === 'object') delete last._streaming
        }
        loading.value = false
      }
    )
  } catch (err) {
    responses.value.push(`天机不可泄…出错了: ${err.message}`)
    loading.value = false
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (mainScroll.value) mainScroll.value.scrollTop = mainScroll.value.scrollHeight
  })
}
</script>

<style scoped>
.divine-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(184,134,11,0.04) 0%, transparent 50%),
    var(--xuanzhi);
}

/* ===== 符文背景 ===== */
.runes-bg {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none; z-index: 0; overflow: hidden;
}
.rune {
  position: absolute;
  font-family: 'Ma Shan Zheng', serif;
  color: var(--mo);
  animation: rune-float linear infinite;
}
@keyframes rune-float {
  0% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-18px) rotate(2deg); }
  50% { transform: translateY(-6px) rotate(-1deg); }
  75% { transform: translateY(-22px) rotate(2deg); }
  100% { transform: translateY(0) rotate(0deg); }
}

/* ===== 顶栏 ===== */
.header {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 20px;
  background: rgba(247,242,232,0.92);
  border-bottom: 1px solid var(--border);
  position: relative; z-index: 3;
  backdrop-filter: blur(12px);
}
.header::after {
  content: ''; position: absolute; bottom: 0; left: 20%; right: 20%; height: 1px;
  background: linear-gradient(to right, transparent, var(--jin), transparent);
  opacity: 0.3;
}
.header-spacer { width: 70px; }
.back-btn {
  background: none; border: 1px solid var(--border);
  font-family: 'Noto Serif SC', serif; font-size: 0.82rem;
  color: var(--mo); cursor: pointer; padding: 6px 12px; border-radius: 4px;
  transition: all 0.3s;
}
.back-btn:hover {
  background: var(--ink-wash); border-color: var(--jin); color: var(--jin);
}
.page-title-wrap { display: flex; align-items: center; gap: 8px; flex: 1; justify-content: center; }
.page-icon { font-size: 1.2rem; }
.page-title {
  font-family: 'Ma Shan Zheng', serif; font-size: 1.3rem;
  color: var(--mo); letter-spacing: 4px;
}
.header-seal {
  font-family: 'Ma Shan Zheng', serif; font-size: 0.55rem;
  color: var(--zhu); border: 1px solid var(--zhu); padding: 1px 6px;
  transform: rotate(-5deg); opacity: 0.7;
}

/* ===== 主滚动区 ===== */
.main-scroll {
  flex: 1; overflow-y: auto; padding: 20px 20px 100px;
  position: relative; z-index: 2;
}

/* ===== 信息表单 ===== */
.info-form {
  background: var(--xuanzhi-light);
  border: 1px solid var(--border);
  border-radius: 6px; padding: 20px; margin-bottom: 20px;
}
.info-form.compact .form-grid { grid-template-columns: 1fr 1fr; }
.form-title {
  font-family: 'Ma Shan Zheng', serif; font-size: 1.05rem;
  color: var(--mo); letter-spacing: 4px; margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
}
.form-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
}
.form-item { display: flex; flex-direction: column; gap: 5px; }
.form-item label {
  font-family: 'Ma Shan Zheng', serif; font-size: 0.82rem;
  color: var(--jin); letter-spacing: 2px;
}
.form-item input, .form-item select {
  padding: 8px 12px; border: 1px solid var(--border);
  background: #fff; border-radius: 4px;
  font-family: 'Noto Serif SC', serif; font-size: 0.85rem;
  color: var(--mo); outline: none; transition: all 0.3s;
}
.form-item input:focus, .form-item select:focus {
  border-color: var(--jin);
  box-shadow: 0 0 0 2px var(--jin-glow);
}
.form-item input::placeholder { color: var(--hui-light); }
.form-item select option { background: #fff; color: var(--mo); }

.lunar-display {
  padding: 8px 12px; background: rgba(184,134,11,0.06);
  border: 1px solid rgba(184,134,11,0.15); border-radius: 4px;
}
.lunar-main {
  font-family: 'Ma Shan Zheng', serif; font-size: 1rem;
  color: var(--jin);
}
.lunar-gz {
  display: block; font-size: 0.75rem; color: var(--hui);
  margin-top: 3px; letter-spacing: 1px;
}
.lunar-hint {
  padding: 8px 12px; font-size: 0.82rem; color: var(--hui-light);
  font-style: italic;
}

.radio-group { display: flex; gap: 8px; }
.radio {
  padding: 6px 16px; border: 1px solid var(--border);
  border-radius: 4px; cursor: pointer; font-family: 'Ma Shan Zheng', serif;
  font-size: 0.9rem; color: var(--hui); transition: all 0.3s; letter-spacing: 2px;
}
.radio.active {
  color: var(--zhu); border-color: var(--zhu);
  background: rgba(192,57,43,0.06);
}

/* ===== 提问区 ===== */
.ask-area { margin-bottom: 20px; }
.ask-wrap { display: flex; gap: 10px; }
.ask-input {
  flex: 1; padding: 12px 16px;
  border: 1px solid var(--border);
  background: #fff; border-radius: 6px;
  font-family: 'Noto Serif SC', serif; font-size: 0.9rem;
  color: var(--mo); outline: none; transition: all 0.3s;
}
.ask-input:focus {
  border-color: var(--jin);
  box-shadow: 0 0 0 2px var(--jin-glow);
}
.ask-input::placeholder { color: var(--hui-light); }
.ask-btn {
  padding: 12px 24px; background: var(--zhu);
  color: #fff; border: none;
  border-radius: 6px; font-family: 'Ma Shan Zheng', serif;
  font-size: 1.05rem; letter-spacing: 4px; cursor: pointer;
  transition: all 0.3s; white-space: nowrap;
}
.ask-btn:hover:not(:disabled) {
  background: #a93226;
  box-shadow: 0 2px 12px var(--zhu-glow);
}
.ask-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.loading-text { animation: text-pulse 1.2s ease-in-out infinite; }
@keyframes text-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* ===== 引导区 ===== */
.guide {
  text-align: center; padding: 50px 20px;
  animation: fade-in 0.8s ease;
}
.guide-icon {
  font-size: 2.8rem; margin-bottom: 18px;
  opacity: 0.6;
}
.guide-text {
  font-family: 'Ma Shan Zheng', serif; font-size: 1.05rem;
  color: var(--hui); line-height: 2; letter-spacing: 2px;
  max-width: 480px; margin: 0 auto;
}
@keyframes fade-in {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== 卷轴回应区 ===== */
.responses { display: flex; flex-direction: column; gap: 20px; }
.scroll-response {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 6px; overflow: hidden;
  animation: scroll-appear 0.5s ease;
  box-shadow: 0 1px 6px var(--ink-wash);
}
@keyframes scroll-appear {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.scroll-header {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 16px; border-bottom: 1px solid var(--border);
  background: rgba(184,134,11,0.03);
}
.scroll-icon { color: var(--jin); font-size: 0.85rem; }
.scroll-label {
  font-family: 'Ma Shan Zheng', serif; font-size: 0.82rem;
  color: var(--jin); letter-spacing: 3px;
}
.scroll-body { padding: 18px 16px; }
.scroll-content {
  font-family: 'Noto Serif SC', serif; font-size: 0.9rem;
  color: var(--mo); line-height: 2; letter-spacing: 0.5px;
  white-space: pre-wrap; word-break: break-word;
}
.scroll-footer {
  display: flex; justify-content: flex-end;
  padding: 6px 16px; border-top: 1px solid rgba(184,134,11,0.06);
}
.scroll-hex {
  font-size: 1.1rem; color: var(--mo); opacity: 0.06;
}

@media (max-width: 500px) {
  .form-grid { grid-template-columns: 1fr; }
  .info-form.compact .form-grid { grid-template-columns: 1fr; }
  .ask-wrap { flex-direction: column; }
}
</style>
