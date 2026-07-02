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
      <span class="ds-badge green">AI Skill</span>
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

          <div v-if="skillId === 'bazi' || skillId === 'ziwei'" class="form-grid">
            <label class="ds-field"><span>姓名/称呼</span><input v-model.trim="profile.name" placeholder="请输入称呼" /></label>
            <label class="ds-field"><span>性别</span><select v-model="profile.gender"><option>男</option><option>女</option><option>不便说明</option></select></label>
            <label class="ds-field"><span>阳历生日</span><input v-model="profile.birthDate" type="date" @change="convertLunar" /></label>
            <label class="ds-field"><span>出生时辰</span><select v-model="profile.shichen"><option value="">请选择</option><option v-for="item in shichenList" :key="item.name" :value="item.name">{{ item.name }}（{{ item.range }}）</option></select></label>
            <label class="ds-field"><span>出生地</span><input v-model.trim="profile.place" placeholder="例如：杭州" /></label>
            <div class="info-chip">{{ lunarResult ? `${lunarResult.lunar_full} · ${lunarResult.ganzhi_year}年 · ${lunarResult.shengxiao}` : '生日可用于农历换算；后端不可用时直接使用阳历信息。' }}</div>
          </div>

          <div v-else-if="skillId === 'yinyuan' || skillId === 'hehun'" class="form-grid">
            <label class="ds-field"><span>你的称呼</span><input v-model.trim="relation.name" placeholder="例如：小林" /></label>
            <label class="ds-field"><span>你的生日</span><input v-model="relation.birthday" type="date" /></label>
            <label class="ds-field wide"><span>对方信息</span><input v-model.trim="relation.partner" placeholder="姓名、生日、生肖或大致情况" /></label>
            <label class="ds-field"><span>关系状态</span><select v-model="relation.status"><option value="">请选择</option><option>单身，想看正缘</option><option>暧昧中，想看走向</option><option>恋爱中，想看稳定性</option><option>分开后，想看是否复合</option><option>婚姻中，想看相处问题</option></select></label>
            <label class="ds-field"><span>关注点</span><select v-model="relation.focus"><option value="">请选择</option><option>正缘时间</option><option>对方是否合适</option><option>关系阻碍</option><option>生肖合婚</option><option>未来半年趋势</option></select></label>
          </div>

          <div v-else-if="skillId === 'fengshui'" class="form-grid">
            <label class="ds-field"><span>空间类型</span><select v-model="space.kind"><option>住宅</option><option>卧室</option><option>办公室</option><option>店铺</option><option>书房/工位</option></select></label>
            <label class="ds-field"><span>朝向</span><select v-model="space.direction"><option>坐北朝南</option><option>坐南朝北</option><option>坐东朝西</option><option>坐西朝东</option><option>不确定</option></select></label>
            <label class="ds-field wide"><span>布局描述</span><input v-model.trim="space.layout" placeholder="例如：门在东侧，床靠西墙，窗户朝南，办公桌背后是走道" /></label>
          </div>

          <div v-else-if="skillId === 'tarot'" class="form-grid">
            <label class="ds-field"><span>牌阵</span><select v-model="tarot.spread"><option>单牌指引</option><option>过去-现在-未来</option><option>选择 A/B</option><option>关系牌阵</option></select></label>
            <label class="ds-field"><span>问题类型</span><select v-model="tarot.topic"><option>感情</option><option>事业</option><option>选择</option><option>自我成长</option><option>其他</option></select></label>
            <label class="ds-field wide"><span>当前背景</span><input v-model.trim="tarot.context" placeholder="简单说明你纠结的选项或当前处境" /></label>
          </div>

          <div v-else-if="skillId === 'fojiao'" class="form-grid">
            <label class="ds-field"><span>困惑类型</span><select v-model="mind.topic"><option value="">请选择</option><option>情绪焦虑</option><option>人际关系</option><option>工作压力</option><option>家庭牵挂</option><option>修行疑问</option><option>人生取舍</option></select></label>
            <label class="ds-field"><span>当前心境</span><select v-model="mind.mood"><option value="">请选择</option><option>焦虑不安</option><option>犹豫反复</option><option>执着放不下</option><option>疲惫麻木</option><option>想要安定</option></select></label>
            <label class="ds-field wide"><span>事情背景</span><input v-model.trim="mind.context" placeholder="简单说说发生了什么，或你卡在哪里" /></label>
          </div>

          <div v-else class="form-grid">
            <label class="ds-field"><span>起局时间</span><input v-model="eventForm.datetime" type="datetime-local" /></label>
            <label class="ds-field"><span>地点/方位</span><input v-model.trim="eventForm.place" placeholder="例如：杭州 / 东南 / 不确定" /></label>
            <label class="ds-field"><span>事件类型</span><select v-model="eventForm.topic"><option>合作/项目</option><option>出行/迁移</option><option>求职/事业</option><option>感情/关系</option><option>财务/交易</option><option>健康/心态</option><option>其他</option></select></label>
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
              <span class="ds-badge gold">第 {{ index + 1 }} 次问事</span>
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
  { id: 'bazi', icon: '命', name: '四柱八字', caption: '命理核心', formKicker: 'Birth Profile', formTitle: '出生信息', description: '以出生年月日时排出四柱，观察五行、阶段节奏与关注方向。', tags: ['四柱', '五行', '流年'], questionLabel: '补充问题', askHint: '例如：我想重点看未来三年的事业变化。', greeting: '请先补全出生信息', emptyCopy: '八字需要姓名、生日和时辰。补全后可继续写一个具体关注点。' },
  { id: 'ziwei', icon: '紫', name: '紫微斗数', caption: '十二宫位', formKicker: 'Ziwei Board', formTitle: '命盘信息', description: '参考紫微斗数的命宫、身宫、十二宫位和主星结构做综合分析。', tags: ['命宫', '十二宫', '主星'], questionLabel: '想看的宫位或问题', askHint: '例如：我想看事业宫和迁移宫，适不适合换城市发展。', greeting: '补全生日时辰后查看紫微盘', emptyCopy: '紫微斗数需要生日、时辰和性别，用于生成宫位分析提示。' },
  { id: 'qimen', icon: '门', name: '奇门遁甲', caption: '时空决策', formKicker: 'Qimen Board', formTitle: '起局信息', description: '结合时间、地点和所问之事，辅助判断方向、时机与策略。', tags: ['九宫', '方位', '择时'], questionLabel: '所问之事', askHint: '例如：这周是否适合推进某个合作？', greeting: '填写起局时间并描述问题', emptyCopy: '奇门更适合具体问题，请填写时间、地点、事件类型和明确问题。' },
  { id: 'liuyao', icon: '爻', name: '六爻解卦', caption: '世应用神', formKicker: 'Liuyao', formTitle: '问卦信息', description: '围绕动爻、变卦、世应、用神和六亲关系生成结构化解读。', tags: ['动爻', '世应', '用神'], questionLabel: '卦象或问题', askHint: '例如：本卦乾为天，二爻动，问合作能否推进。', greeting: '写下卦象或问题', emptyCopy: '可先去周易起卦生成卦象，再把结果带入这里深问。' },
  { id: 'meihua', icon: '梅', name: '梅花易数', caption: '体用生克', formKicker: 'Meihua', formTitle: '起卦线索', description: '按时间、数字、外应和所见之象起卦，观察体用生克与趋势。', tags: ['体用', '外应', '趋势'], questionLabel: '所见之象或数字', askHint: '例如：今天 15:36 听到三声响，想问项目是否顺利。', greeting: '输入外应或数字线索', emptyCopy: '梅花易数适合把时间、数字、外应和具体问题结合起来。' },
  { id: 'daliuren', icon: '壬', name: '大六壬', caption: '三传四课', formKicker: 'Daliuren', formTitle: '课传信息', description: '以时间、事件和三传四课思路整理复杂事件的来龙去脉。', tags: ['三传', '四课', '神将'], questionLabel: '具体事件', askHint: '例如：这次谈判对方真实意图如何，何时推进合适？', greeting: '填写事件时间与背景', emptyCopy: '大六壬适合较复杂的事件判断，请把背景说具体。' },
  { id: 'xiaoliuren', icon: '速', name: '小六壬', caption: '快速问事', formKicker: 'Quick Oracle', formTitle: '快速起课', description: '用大安、留连、速喜等轻量结构做快速娱乐判断。', tags: ['大安', '速喜', '空亡'], questionLabel: '快速问题', askHint: '例如：今天适不适合去谈这件事？', greeting: '写下一个明确的小问题', emptyCopy: '小六壬适合短平快问题，不适合复杂长期决策。' },
  { id: 'yinyuan', icon: '缘', name: '姻缘测算', caption: '关系洞察', formKicker: 'Relationship', formTitle: '姻缘信息', description: '围绕关系状态、相处模式、桃花机缘与长期稳定性给出建议。', tags: ['桃花', '关系', '沟通'], questionLabel: '补充描述', askHint: '例如：我们最近联系变少，我想知道是否还适合继续推进。', greeting: '请补全关系信息', emptyCopy: '姻缘测算需要关系状态、关注点和必要背景。' },
  { id: 'hehun', icon: '合', name: '合婚配对', caption: '生肖合盘', formKicker: 'Match', formTitle: '双方信息', description: '参考生肖、生日、关系阶段和相处模式做娱乐型合婚提示。', tags: ['生肖', '合盘', '长期'], questionLabel: '合婚关注点', askHint: '例如：我们适合长期相处吗，最大的磨合点是什么？', greeting: '补全双方信息', emptyCopy: '合婚需要双方生日或生肖、关系状态和关注点。' },
  { id: 'fojiao', icon: '禅', name: '佛学开示', caption: '心性指引', formKicker: 'Mind Practice', formTitle: '请益背景', description: '以典籍义理和修行视角回应困惑，强调清明、慈悲和行动。', tags: ['开示', '正念', '观照'], questionLabel: '请益内容', askHint: '例如：最近总为一件事反复内耗，应如何安顿自己？', greeting: '写下此刻的困惑', emptyCopy: '佛学开示需要困惑类型、当前心境和事情背景。' },
  { id: 'fengshui', icon: '宅', name: '风水阳宅', caption: '空间布局', formKicker: 'Feng Shui', formTitle: '空间信息', description: '围绕户型、方位、床位、桌位和动线做趣味空间建议。', tags: ['阳宅', '方位', '布局'], questionLabel: '布局问题', askHint: '例如：我的办公桌背后是走道，是否需要调整？', greeting: '描述你的空间布局', emptyCopy: '风水分析需要空间类型、朝向和布局描述。' },
  { id: 'daily-fortune', icon: '运', name: '每日运势', caption: '轻量日运', formKicker: 'Daily', formTitle: '今日状态', description: '生成今日行动提醒、情绪节奏、桌面风水和轻量运势。', tags: ['日运', '提醒', '桌面'], questionLabel: '今天想关注什么', askHint: '例如：今天工作沟通有什么需要注意？', greeting: '写下今天的关注点', emptyCopy: '每日运势适合快速获得一段轻量提醒。' },
  { id: 'tarot', icon: '塔', name: '塔罗牌阵', caption: '多角度思考', formKicker: 'Tarot', formTitle: '牌阵信息', description: '用单牌、三牌、选择牌阵帮助你从不同角度看问题。', tags: ['单牌', '三牌', '选择'], questionLabel: '抽牌问题', askHint: '例如：A 和 B 两个选择，我应该优先考虑什么？', greeting: '选择牌阵并写下问题', emptyCopy: '塔罗适合纠结选择、关系观察和自我反思。' },
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
const profile = ref({ name: '', gender: '男', birthDate: '', shichen: '', place: '' })
const relation = ref({ name: '', birthday: '', partner: '', status: '', focus: '' })
const mind = ref({ topic: '', mood: '', context: '' })
const eventForm = ref({ datetime: '', place: '', topic: '合作/项目' })
const space = ref({ kind: '住宅', direction: '不确定', layout: '' })
const tarot = ref({ spread: '三牌', topic: '选择', context: '' })

const canSend = computed(() => {
  if (['bazi', 'ziwei'].includes(skillId.value)) return Boolean(profile.value.name && profile.value.birthDate && profile.value.shichen)
  if (['yinyuan', 'hehun'].includes(skillId.value)) return Boolean(relation.value.status && relation.value.focus)
  if (skillId.value === 'fojiao') return Boolean(mind.value.topic && mind.value.mood)
  if (skillId.value === 'fengshui') return Boolean(space.value.layout)
  if (skillId.value === 'tarot') return Boolean(tarot.value.context || userInput.value)
  return Boolean(eventForm.value.datetime && userInput.value)
})

onMounted(() => {
  profile.value.shichen = currentShichen()
  eventForm.value.datetime = nowDatetimeLocal()
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
  if (!profile.value.birthDate) {
    lunarResult.value = null
    return
  }
  try {
    lunarResult.value = await solarToLunar(profile.value.birthDate)
  } catch {
    lunarResult.value = null
  }
}

function buildMessage() {
  const name = skillInfo.value.name
  if (['bazi', 'ziwei'].includes(skillId.value)) {
    const f = profile.value
    return [`术法：${name}`, `姓名：${f.name}`, `性别：${f.gender}`, `阳历生日：${f.birthDate}`, `出生时辰：${f.shichen}`, f.place && `出生地：${f.place}`, lunarResult.value && `农历：${lunarResult.value.lunar_full}`, userInput.value && `补充问题：${userInput.value}`].filter(Boolean).join('；')
  }
  if (['yinyuan', 'hehun'].includes(skillId.value)) {
    const f = relation.value
    return [`术法：${name}`, `我的称呼：${f.name || '未填写'}`, `我的生日：${f.birthday || '未填写'}`, `对方信息：${f.partner || '未填写'}`, `关系状态：${f.status}`, `关注点：${f.focus}`, userInput.value && `补充描述：${userInput.value}`].filter(Boolean).join('；')
  }
  if (skillId.value === 'fojiao') {
    const f = mind.value
    return [`术法：${name}`, `困惑类型：${f.topic}`, `当前心境：${f.mood}`, `事情背景：${f.context || '未填写'}`, userInput.value && `请益内容：${userInput.value}`].filter(Boolean).join('；')
  }
  if (skillId.value === 'fengshui') {
    const f = space.value
    return [`术法：${name}`, `空间类型：${f.kind}`, `朝向：${f.direction}`, `布局描述：${f.layout}`, userInput.value && `具体问题：${userInput.value}`].filter(Boolean).join('；')
  }
  if (skillId.value === 'tarot') {
    const f = tarot.value
    return [`术法：${name}`, `牌阵：${f.spread}`, `问题类型：${f.topic}`, `当前背景：${f.context || '未填写'}`, `抽牌问题：${userInput.value || f.context}`].join('；')
  }
  const f = eventForm.value
  return [`术法：${name}`, `事件类型：${f.topic}`, `起局时间：${f.datetime}`, `地点/方位：${f.place || '未填写'}`, `所问之事：${userInput.value}`].join('；')
}

function buildBoard() {
  const base = {
    bazi: [['年柱', profile.value.birthDate?.slice(0, 4) || '待定'], ['月柱', profile.value.birthDate?.slice(5, 7) || '待定'], ['日主', profile.value.name || '本人'], ['时柱', profile.value.shichen || '待定']],
    ziwei: [['命宫', '待排'], ['身宫', '待排'], ['事业宫', '重点'], ['迁移宫', '观察']],
    qimen: [['巽四', '东南'], ['离九', '南'], ['坤二', '西南'], ['震三', '东'], ['中五', eventForm.value.topic], ['兑七', '西'], ['艮八', '东北'], ['坎一', '北'], ['乾六', '西北']],
    liuyao: [['本卦', '待填'], ['动爻', '观察'], ['世应', '关系'], ['用神', '取象']],
    meihua: [['上卦', '外应'], ['下卦', '时间'], ['体卦', '自身'], ['用卦', '所问']],
    daliuren: [['四课', '结构'], ['三传', '路径'], ['神将', '环境'], ['所问', eventForm.value.topic]],
    xiaoliuren: [['宫位', '速断'], ['状态', '待定'], ['宜', '简行'], ['忌', '拖延']],
    yinyuan: [['关系', relation.value.status || '待定'], ['关注', relation.value.focus || '待定'], ['对方', relation.value.partner || '未填'], ['阶段', '沟通']],
    hehun: [['生肖', '参考'], ['生日', relation.value.birthday || '未填'], ['对方', relation.value.partner || '未填'], ['磨合', relation.value.focus || '待定']],
    fojiao: [['困惑', mind.value.topic || '待定'], ['心境', mind.value.mood || '待定'], ['执着点', '照见'], ['练习', '安顿']],
    fengshui: [['空间', space.value.kind], ['朝向', space.value.direction], ['明堂', '观察'], ['动线', '调整']],
    'daily-fortune': [['日运', '今日'], ['行动', eventForm.value.topic], ['方位', eventForm.value.place || '自定'], ['提醒', '稳中求进']],
    tarot: [['牌阵', tarot.value.spread], ['主题', tarot.value.topic], ['现状', '第一张'], ['建议', '第三张']],
  }
  return {
    type: skillId.value,
    title: `${skillInfo.value.name}盘面`,
    badge: skillInfo.value.caption,
    items: base[skillId.value] || base.qimen,
  }
}

async function sendMessage() {
  if (!canSend.value || loading.value) return
  const message = buildMessage()
  const board = buildBoard()
  const extra = {}
  if (skillId.value === 'qimen' && eventForm.value.datetime) extra.datetime_str = eventForm.value.datetime.replace('T', ' ')

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
  if (['bazi', 'ziwei'].includes(type)) return '用于定位命盘结构'
  if (['yinyuan', 'hehun'].includes(type)) return '用于观察关系状态'
  if (type === 'fengshui') return '用于观察空间气口'
  if (type === 'tarot') return '用于多角度思考'
  return '用于整理问事线索'
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
