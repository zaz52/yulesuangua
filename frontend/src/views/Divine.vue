<template>
  <main class="divine-page mystic-app">
    <header class="mystic-topbar">
      <a class="brand" href="/" aria-label="乾坤之道首页">
        <span class="brand-seal">卦</span>
        <span><strong>乾坤之道</strong><em>AI问卦</em></span>
      </a>
      <nav class="nav-links" aria-label="主导航">
        <a href="/">首页</a>
        <a href="/divine/bazi">AI问卦</a>
        <a href="/tools/qiming">功能中心</a>
        <a href="/">说明</a>
      </nav>
      <div class="mystic-actions">
        <span class="ds-badge green">隐私保护</span>
        <button class="ds-button primary" type="button" @click="router.push('/zhouyi')">开始问卦</button>
      </div>
    </header>

    <section class="divine-shell mystic-layout">
      <aside class="method-panel left-rail">
        <button class="rail-link" type="button" @click="router.push('/')"><i>⌂</i><span>首页</span></button>
        <span class="rail-section-title">核心工具</span>
        <button v-for="item in skillList" :key="item.id" type="button" class="rail-link" :class="{ active: item.id === skillId }" @click="switchSkill(item.id)">
          <i>{{ item.icon }}</i>
          <span>{{ item.name }}</span>
        </button>
      </aside>

      <section class="workbench main-workspace">
        <article class="skill-hero hero-workspace">
          <div>
            <span class="section-kicker">{{ skillInfo.caption }}</span>
            <h1>{{ skillInfo.name }}</h1>
            <p>{{ skillInfo.description }}</p>
            <div class="method-tags">
              <span v-for="tag in skillInfo.tags" :key="tag" class="ds-badge gold">{{ tag }}</span>
            </div>
          </div>
          <span class="ds-badge">文化娱乐参考</span>
        </article>

        <div class="dimension-filter">
          <span>查看维度：</span>
          <button v-for="item in dimensionChips" :key="item" type="button" :class="{ active: item === '全部' }">{{ item }}</button>
        </div>

        <div class="work-tabs"><span class="active">基础信息</span><span>排盘结果</span></div>

        <section class="primary-work-grid" :class="{ 'is-qimen-work': skillId === 'qimen', 'is-meihua-work': skillId === 'meihua' }">
          <article class="form-panel oracle-card">
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
              <label class="ds-field"><span>农历生日</span><input v-model.trim="profile.birthDate" placeholder="例如：1996-05-01" /></label>
              <label class="ds-field"><span>出生时辰</span><select v-model="profile.shichen"><option value="">请选择</option><option v-for="item in shichenList" :key="item.name" :value="item.name">{{ item.name }}（{{ item.range }}）</option></select></label>
              <label class="ds-field"><span>出生地</span><input v-model.trim="profile.place" placeholder="例如：杭州" /></label>
              <div class="info-chip">按阴历生日排盘。请填写农历年月日，闰月后续会单独加开关；当前默认非闰月。</div>
            </div>

            <div v-else-if="skillId === 'yinyuan' || skillId === 'hehun'" class="form-grid">
              <label class="ds-field"><span>你的称呼</span><input v-model.trim="relation.name" placeholder="例如：小林" /></label>
              <label class="ds-field"><span>你的农历生日</span><input v-model.trim="relation.birthday" placeholder="例如：1996-05-01 / 属鼠" /></label>
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

            <div v-else class="form-grid event-form-grid">
              <label class="ds-field"><span>起课时间</span><input v-model="eventForm.datetime" type="datetime-local" /></label>
              <label class="ds-field"><span>地点/方位</span><input v-model.trim="eventForm.place" placeholder="例如：杭州 / 东南 / 不确定" /></label>
              <label class="ds-field"><span>事件类型</span><select v-model="eventForm.topic"><option>合作/项目</option><option>出行/迁移</option><option>求职/事业</option><option>感情/关系</option><option>财务/交易</option><option>健康/心态</option><option>其他</option></select></label>
              <div class="info-chip wide">起课仍以你选择的现实时间定位，算法内部会换算农历、节气、干支和时辰后排盘。</div>
            </div>

            <label class="ds-field wide inline-question">
              <span>{{ skillInfo.questionLabel }}</span>
              <textarea v-model.trim="userInput" :placeholder="skillInfo.askHint" :disabled="loading" @keydown.ctrl.enter="sendMessage"></textarea>
            </label>

            <p class="privacy-note">隐私保护：本站不会在本地浏览器或远端数据库自动保存你的姓名、生日、地点、问题和解读结果。</p>
            <div class="actions">
              <button class="ds-button primary" type="button" :disabled="loading || !canSend" @click="sendMessage">{{ loading ? '推演中...' : '开始排盘' }}</button>
              <button class="ds-button ghost" type="button" :disabled="loading" @click="responses = []">重置</button>
            </div>
          </article>

          <article v-if="previewableSkills.includes(skillId)" class="board-preview-panel oracle-card">
            <div class="panel-head">
              <div>
                <span class="section-kicker">{{ skillInfo.name }}命盘</span>
                <h2>排盘结果</h2>
              </div>
              <span class="ds-badge gold">实时预览</span>
            </div>
            <VisualBoard :board="buildBoard(null)" />
            <p class="preview-note">此为示例命盘，填写信息并排盘后可查看你的专属盘面与详细解读。</p>
          </article>
        </section>

        <article v-if="false" class="ask-panel oracle-card">
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
          <p class="privacy-note">隐私保护：本站不会在本地浏览器或远端数据库自动保存你的姓名、生日、地点、问题和解读结果。</p>
          <div class="actions">
            <button class="ds-button primary" type="button" :disabled="loading || !canSend" @click="sendMessage">{{ loading ? '推演中...' : '提交问事' }}</button>
            <button class="ds-button ghost" type="button" :disabled="loading" @click="responses = []">清空本页结果</button>
          </div>
        </article>

        <section class="result-list">
          <article v-if="responses.length === 0 && !loading && false" class="empty-card oracle-card">
            <span class="round-mark">{{ skillInfo.icon }}</span>
            <h2>{{ skillInfo.greeting }}</h2>
            <p>{{ skillInfo.emptyCopy }}</p>
          </article>

          <RitualState
            v-if="loading"
            class="oracle-card"
            variant="loading"
            title="正在推演"
            description="正在连接后端和术法提示词，请稍候。"
          />

          <article v-for="(resp, index) in responses" :key="index" class="answer-card oracle-card">
            <div class="answer-head">
              <span class="ds-badge gold">第 {{ index + 1 }} 次问事</span>
              <time>{{ today }}</time>
            </div>
            <VisualBoard v-if="typeof resp !== 'string' && resp.board" :board="resp.board" />
            <RitualState
              v-if="typeof resp !== 'string' && resp.error"
              compact
              variant="error"
              title="解读暂时失败"
              :description="resp.text"
              :actions="[{ key: 'reset', label: '清空后重试', tone: 'ghost' }]"
              @action="handleStateAction"
            />
            <AnswerText v-else :text="typeof resp === 'string' ? resp : resp.text" />
          </article>
        </section>
      </section>

      <aside class="right-rail">
        <article class="right-rail-card">
          <div class="card-title-row"><h3>填写提示</h3><span class="ds-badge">?</span></div>
          <div v-for="tip in formTips" :key="tip.title" class="mini-item tip-item">
            <strong>{{ tip.title }}</strong>
            <span>{{ tip.text }}</span>
          </div>
        </article>
        <article class="right-rail-card">
          <h3>推荐功能</h3>
          <div class="quick-icons">
            <button v-for="item in sideRecommendations" :key="item.id" type="button" @click="switchSkill(item.id)">
              <b>{{ item.icon }}</b>{{ item.name }}
            </button>
          </div>
        </article>
      </aside>
    </section>
  </main>
</template>

<script setup>
import { computed, defineComponent, h, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { calculateChart, divineStream } from '../api/divine'
import BaziBoard from '../components/BaziBoard.vue'
import DaliurenBoard from '../components/DaliurenBoard.vue'
import FengshuiBoard from '../components/FengshuiBoard.vue'
import LiuyaoBoard from '../components/LiuyaoBoard.vue'
import MeihuaBoard from '../components/MeihuaBoard.vue'
import QimenBoard from '../components/QimenBoard.vue'
import RitualState from '../components/RitualState.vue'
import TarotBoard from '../components/TarotBoard.vue'
import XiaoliurenBoard from '../components/XiaoliurenBoard.vue'
import ZiweiBoard from '../components/ZiweiBoard.vue'
import { buildMeihuaBoard } from '../domain/meihua'
import { buildQimenFallbackBoard } from '../domain/qimen'

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
const sideRecommendations = computed(() => skillList.filter((item) => item.id !== skillId.value).slice(0, 4))
const previewableSkills = ['bazi', 'ziwei', 'qimen', 'liuyao', 'meihua', 'daliuren', 'xiaoliuren', 'yinyuan', 'hehun', 'fojiao', 'fengshui', 'daily-fortune', 'tarot']
const dimensionMap = {
  bazi: ['全部', '命理', '阶段', '流年', '关系', '风水', '六亲'],
  ziwei: ['全部', '命宫', '事业', '财帛', '夫妻', '迁移', '福德'],
  qimen: ['全部', '时机', '方位', '用神', '宫门', '策略'],
  liuyao: ['全部', '本卦', '变卦', '世应', '用神', '动爻'],
  meihua: ['全部', '本卦', '互卦', '变卦', '体用', '外应'],
  daliuren: ['全部', '四课', '三传', '神将', '课体', '应期'],
  xiaoliuren: ['全部', '六宫', '速断', '应事', '吉凶'],
  yinyuan: ['全部', '桃花', '关系', '沟通', '时机'],
  hehun: ['全部', '生肖', '合盘', '性格', '长期'],
  fojiao: ['全部', '情绪', '观照', '行动', '典籍'],
  fengshui: ['全部', '门向', '卧室', '书桌', '财位', '动线'],
  'daily-fortune': ['全部', '宜忌', '行动', '情绪', '方位'],
  tarot: ['全部', '牌阵', '现状', '建议', '选择'],
}
const formTipMap = {
  bazi: [
    { title: '请使用本人真实信息排盘', text: '出生时间建议精确到时辰，结果更准确。' },
    { title: '出生地影响真太阳时校正', text: '请如实填写城市或地区。' },
    { title: '补充问题将帮助解读聚焦', text: '比如事业、财运、感情或阶段选择。' },
  ],
  ziwei: [
    { title: '生日与时辰要尽量准确', text: '紫微斗数对时辰较敏感。' },
    { title: '可指定想看的宫位', text: '如事业宫、夫妻宫、迁移宫。' },
  ],
  qimen: [
    { title: '问题要具体', text: '奇门适合问一个明确事件，不适合一次问多个问题。' },
    { title: '时间按起念或决策时刻', text: '若不确定，可使用当前时间。' },
    { title: '地点/方位有助于判断', text: '可填城市、方向或“不确定”。' },
  ],
  liuyao: [
    { title: '先定一事一问', text: '六爻更适合围绕一个具体问题起卦。' },
    { title: '可从周易起卦带入卦象', text: '也可以直接描述本卦、动爻和变卦。' },
  ],
  default: [
    { title: '信息越明确越好', text: '请写清楚时间、背景和你真正关心的点。' },
    { title: '结果仅作文化娱乐参考', text: '重要现实事项请结合专业意见。' },
  ],
}
const dimensionChips = computed(() => dimensionMap[skillId.value] || dimensionMap.bazi)
const formTips = computed(() => formTipMap[skillId.value] || formTipMap.default)
const today = new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit' }).format(new Date())
const userInput = ref('')
const loading = ref(false)
const responses = ref([])
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

function buildMessage() {
  const name = skillInfo.value.name
  if (['bazi', 'ziwei'].includes(skillId.value)) {
    const f = profile.value
    return [`术法：${name}`, `姓名：${f.name}`, `性别：${f.gender}`, `农历生日：${f.birthDate}`, `出生时辰：${f.shichen}`, f.place && `出生地：${f.place}`, userInput.value && `补充问题：${userInput.value}`].filter(Boolean).join('；')
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

function buildBoard(chartResult = null) {
  if (chartResult?.ok && chartResult.data) {
    return {
      type: skillId.value,
      title: `${skillInfo.value.name}盘面`,
      badge: '真实排盘',
      data: chartResult.data,
      source: chartResult.source,
    }
  }

  const birthYear = profile.value.birthDate?.slice(0, 4) || '待定'
  const birthMonth = profile.value.birthDate?.slice(5, 7) || '待定'
  const birthDay = profile.value.birthDate?.slice(8, 10) || '待定'
  const baziColumns = ['年柱', '月柱', '日柱', '时柱']
  const base = {
    bazi: {
      columns: baziColumns,
      rows: [
        ['天干', `${birthYear}干`, `${birthMonth}干`, '日主', `${profile.value.shichen || '时'}干`],
        ['地支', `${birthYear}支`, `${birthMonth}支`, `${birthDay}支`, `${profile.value.shichen || '时'}支`],
        ['藏干', '主气 / 余气', '月令司权', '根气定位', '时上取象'],
        ['十神', '祖上与早年', '父母与环境', profile.value.name || '本人', '子女与晚景'],
        ['五行', '木火土金水', '月令旺衰', '日主强弱', '时柱补偏'],
        ['纳音', '年命参考', '月柱参考', '日柱参考', '时柱参考'],
        ['长生', '阶段起势', '节气承接', '自身落点', '后续走势'],
        ['合冲刑害', '年支关系', '月日关系', '日时关系', '全局复核'],
      ],
      highlights: ['先看日主旺衰', '再看月令格局', '最后看合冲刑害'],
    },
    ziwei: {
      palaces: buildZiweiPreviewPalaces(),
      center: `${profile.value.name || '命主'} · ${profile.value.gender} · 农历${profile.value.birthDate || '生日待填'} · ${profile.value.shichen || '时辰待定'}`,
      meta: {
        soul: profile.value.name ? `${profile.value.name.slice(0, 1)}命` : '命主待定',
        body: profile.value.shichen || '身宫待定',
        fiveElementsClass: ziweiElementClass(),
      },
    },
    qimen: buildQimenFallbackBoard({
      datetime: eventForm.value.datetime,
      topic: eventForm.value.topic,
      place: eventForm.value.place,
      today: today.value,
    }),
    liuyao: {
      lines: [
        ['上爻', '阴爻', '父母', '应', '收束与外部'],
        ['五爻', '阳爻', '官鬼', '', '主事压力'],
        ['四爻', '阴爻', '妻财', '动', '资源变化'],
        ['三爻', '阳爻', '兄弟', '', '竞争与阻力'],
        ['二爻', '阴爻', '子孙', '世', '自身落点'],
        ['初爻', '阳爻', '父母', '', '事情起因'],
      ],
    },
    meihua: {
      ...buildMeihuaBoard({
        datetime: eventForm.value.datetime,
        topic: eventForm.value.topic,
        place: eventForm.value.place,
        question: userInput.value,
      }),
    },
    daliuren: { items: [['四课', '日干 / 日支 / 课体 / 发用'], ['三传', '初传 -> 中传 -> 末传'], ['神将', '贵人、六合、勾陈、天空'], ['判断', eventForm.value.topic || '复杂事件']] },
    xiaoliuren: { items: [['大安', '稳定可守'], ['留连', '拖延反复'], ['速喜', '消息临近'], ['赤口', '口舌谨慎'], ['小吉', '小成可进'], ['空亡', '暂缓复核']] },
    yinyuan: { items: [['关系阶段', relation.value.status || '待定'], ['关注点', relation.value.focus || '待定'], ['对方线索', relation.value.partner || '未填'], ['建议方向', '先看沟通与边界']] },
    hehun: { items: [['你的信息', relation.value.birthday || '生日未填'], ['对方信息', relation.value.partner || '未填'], ['合盘重点', relation.value.focus || '待定'], ['长期磨合', '价值观 / 节奏 / 家庭观']] },
    fojiao: { items: [['所问困惑', mind.value.topic || '待定'], ['当前心境', mind.value.mood || '待定'], ['观照重点', '看见执着处'], ['行动练习', '少说急话，先定一念']] },
    fengshui: {
      cells: [
        ['东南', '文昌', '书桌 / 学习'], ['正南', '名声', '光线 / 火气'], ['西南', '坤位', '关系 / 稳定'],
        ['正东', '生发', '入口动线'], ['中宫', space.value.kind, space.value.direction], ['正西', '收敛', '金属 / 口舌'],
        ['东北', '止息', '储物 / 静区'], ['正北', '事业', '水气 / 流动'], ['西北', '乾位', '贵人 / 主位'],
      ],
    },
    'daily-fortune': { items: [['今日主题', eventForm.value.topic], ['行动节奏', '先稳后动'], ['提醒方位', eventForm.value.place || '自定'], ['桌面建议', '清空正前方杂物']] },
    tarot: {
      cards: [['过去', '权杖二', '选择已经出现'], ['现在', '节制', '需要重新配比资源'], ['建议', '星币八', '把注意力放回可执行步骤']],
      spread: tarot.value.spread,
    },
  }
  return {
    type: skillId.value,
    title: `${skillInfo.value.name}盘面`,
    badge: skillInfo.value.caption,
    data: base[skillId.value] || base.qimen,
  }
}

function buildZiweiPreviewPalaces() {
  const palaceNames = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '仆役', '官禄', '田宅', '福德', '父母']
  const stars = ['紫微', '天机', '太阳', '武曲', '天同', '廉贞', '天府', '太阴', '贪狼', '巨门', '天相', '天梁']
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  const seed = ziweiSeed()
  const mingIndex = seed % 12
  const bodyIndex = (mingIndex + shichenToPreviewIndex(profile.value.shichen)) % 12
  return palaceNames.map((name, index) => {
    const star = stars[(index + seed) % stars.length]
    const ageStart = 4 + ((index + seed) % 12) * 10
    const labels = []
    if (index === mingIndex) labels.push('命宫')
    if (index === bodyIndex) labels.push('身宫')
    if (['官禄', '财帛', '夫妻', '迁移'].includes(name)) labels.push('重点')
    return {
      name,
      branch: branches[(index + seed) % 12],
      star,
      note: labels.length ? labels.join(' · ') : '排盘参考',
      age: `${ageStart}-${ageStart + 9}`,
      minor: ['天府', '天相', '文昌', '文曲', '左辅', '右弼', '禄存', '擎羊', '陀罗', '火星', '铃星', '天魁'][(index + seed + 3) % 12],
    }
  })
}

function ziweiSeed() {
  const raw = `${profile.value.name || ''}${profile.value.gender || ''}${profile.value.birthDate || ''}${profile.value.shichen || ''}`
  return [...raw].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 12
}

function shichenToPreviewIndex(value) {
  const index = shichenList.findIndex((item) => item.name === value)
  return index >= 0 ? index : 0
}

function ziweiElementClass() {
  return ['水二局', '木三局', '金四局', '土五局', '火六局'][ziweiSeed() % 5]
}

async function sendMessage() {
  if (!canSend.value || loading.value) return
  const message = buildMessage()
  const chartPayload = buildChartPayload(message)
  let chartResult = null
  try {
    chartResult = await calculateChart(skillId.value, chartPayload)
  } catch {
    chartResult = null
  }
  const board = buildBoard(chartResult)
  const extra = {}
  if (skillId.value === 'qimen' && eventForm.value.datetime) extra.datetime_str = eventForm.value.datetime.replace('T', ' ')

  loading.value = true
  userInput.value = ''
  let answer = ''
  responses.value.push({ text: '盘面已定，正在生成文字解读...', streaming: true, board })
  await nextTick()

  try {
    await divineStream(skillId.value, message, [], extra, (chunk) => {
      answer += chunk
      const last = responses.value[responses.value.length - 1]
      if (last?.streaming) last.text = answer
    }, () => {
      const last = responses.value[responses.value.length - 1]
      if (last && typeof last !== 'string') responses.value[responses.value.length - 1] = { ...last, text: last.text || answer, streaming: false }
      loading.value = false
    })
  } catch (error) {
    const last = responses.value[responses.value.length - 1]
    if (last && typeof last !== 'string') {
      responses.value[responses.value.length - 1] = { ...last, text: `暂时无法完成推演：${error.message}`, streaming: false, error: true }
    } else {
      responses.value.push({ text: `暂时无法完成推演：${error.message}`, streaming: false, error: true })
    }
    loading.value = false
  }
}

function handleStateAction(action) {
  if (action?.key === 'reset') {
    responses.value = []
  }
}

function buildChartPayload(message) {
  return {
    message,
    question: message,
    profile: profile.value,
    relation: relation.value,
    mind: mind.value,
    space: space.value,
    tarot: tarot.value,
    spread: tarot.value.spread,
    datetime: eventForm.value.datetime || nowDatetimeLocal(),
    place: eventForm.value.place,
    topic: eventForm.value.topic,
    context: tarot.value.context || userInput.value,
  }
}

const VisualBoard = defineComponent({
  props: { board: Object },
  setup(props) {
    return () => h('div', { class: ['visual-board', 'pro-board', `board-${props.board.type}`] }, [
      h('div', { class: 'board-head' }, [
        h('h3', props.board.title),
        h('div', { class: 'board-badges' }, [
          props.board.source ? h('span', { class: 'ds-badge green' }, props.board.source) : null,
          h('span', { class: 'ds-badge gold' }, props.board.badge),
        ]),
      ]),
      renderBoard(props.board),
    ])
  },
})

const AnswerText = defineComponent({
  props: { text: String },
  setup(props) {
    return () => {
      const lines = String(props.text || '').split(/\n+/).map((line) => line.trim()).filter(Boolean)
      const visibleLines = lines.length ? lines : ['解读生成中...']
      return h('section', { class: 'answer-text' }, [
        h('div', { class: 'answer-text-head' }, [h('span', '解读'), h('strong', 'AI 文字仅作文化娱乐参考')]),
        h('div', { class: 'answer-text-body' }, visibleLines.map((line) => h('p', { class: line.length > 28 ? 'answer-line' : 'answer-line is-short' }, line))),
      ])
    }
  },
})

function renderBoard(board) {
  const renderers = {
    bazi: renderBaziBoard,
    ziwei: renderZiweiBoard,
    qimen: renderQimenBoard,
    liuyao: renderLiuyaoBoard,
    meihua: renderMeihuaBoard,
    daliuren: renderDaliurenBoard,
    xiaoliuren: renderXiaoliurenBoard,
    yinyuan: renderYinyuanBoard,
    hehun: renderHehunBoard,
    fojiao: renderFojiaoBoard,
    fengshui: renderFengshuiBoard,
    'daily-fortune': renderDailyFortuneBoard,
    tarot: renderTarotBoard,
  }
  return (renderers[board.type] || renderGenericBoard)(board.data)
}

function renderBaziBoard(data) {
  return h(BaziBoard, { data })
}

function renderZiweiBoard(data) {
  return h(ZiweiBoard, { data })
}

function normalizeZiweiPalaces(data) {
  const fallback = buildZiweiPreviewPalaces()
  const source = Array.isArray(data?.palaces) && data.palaces.length ? data.palaces : fallback
  return source.slice(0, 12).map((palace, index) => {
    if (Array.isArray(palace)) {
      return {
        name: palace[0] || fallback[index].name,
        star: palace[1] || fallback[index].star,
        note: palace[2] || fallback[index].note,
        branch: fallback[index].branch,
        minor: fallback[index].minor,
        age: fallback[index].age,
      }
    }
    return {
      name: palace.name || palace.label || fallback[index].name,
      branch: palace.branch || palace.earthlyBranch || fallback[index].branch,
      star: palace.star || palace.mainStar || palace.majorStars?.[0]?.name || fallback[index].star,
      minor: palace.minor || palace.minorStar || palace.stars?.[0]?.name || fallback[index].minor,
      note: palace.note || palace.description || fallback[index].note,
      age: palace.age || palace.range || fallback[index].age,
    }
  })
}

function renderQimenBoard(data) {
  return h(QimenBoard, { data })
}

function renderLiuyaoBoard(data) {
  return h(LiuyaoBoard, { data })
}

function renderMeihuaBoard(data) {
  return h(MeihuaBoard, { data })
}

function renderDaliurenBoard(data) {
  return h(DaliurenBoard, { data })
}

function renderXiaoliurenBoard(data) {
  return h(XiaoliurenBoard, { data })
}

function renderYinyuanBoard(data) {
  const items = data.items || []
  return h('div', { class: 'relation-board yinyuan-board' }, [
    h('div', { class: 'relation-orbit' }, [
      h('span', '缘'),
      h('strong', items[0]?.[1] || '关系阶段待定'),
    ]),
    h('div', { class: 'relation-panels' }, items.slice(1).map((item) => h('div', [
      h('span', item[0]),
      h('strong', item[1]),
    ]))),
  ])
}

function renderHehunBoard(data) {
  const items = data.items || []
  return h('div', { class: 'hehun-board' }, [
    h('div', { class: 'hehun-person left' }, [h('span', '甲方'), h('strong', items[0]?.[1] || '你的信息待填')]),
    h('div', { class: 'hehun-score' }, [h('b', '合'), h('span', items[2]?.[1] || '合盘重点待定')]),
    h('div', { class: 'hehun-person right' }, [h('span', '乙方'), h('strong', items[1]?.[1] || '对方信息待填')]),
    h('div', { class: 'hehun-note' }, items.slice(2).map((item) => h('p', [h('strong', `${item[0]}：`), item[1]]))),
  ])
}

function renderFojiaoBoard(data) {
  const items = data.items || []
  return h('div', { class: 'fojiao-scroll' }, [
    h('div', { class: 'fojiao-seal' }, '禅'),
    h('div', { class: 'fojiao-lines' }, items.map((item) => h('section', [
      h('span', item[0]),
      h('p', item[1]),
    ]))),
  ])
}

function renderFengshuiBoard(data) {
  return h(FengshuiBoard, { data })
}

function renderDailyFortuneBoard(data) {
  const items = data.items || []
  return h('div', { class: 'daily-board' }, [
    h('div', { class: 'daily-sun' }, [h('strong', '今日'), h('span', items[0]?.[1] || '先稳后动')]),
    h('div', { class: 'daily-rhythm' }, items.slice(1).map((item) => h('div', [
      h('span', item[0]),
      h('strong', item[1]),
    ]))),
  ])
}

function renderTarotBoard(data) {
  return h(TarotBoard, { data })
}

function renderGenericBoard(data) {
  return h('div', { class: 'generic-pro-grid' }, data.items.map((item) => h('div', { class: 'generic-cell' }, [
    h('span', item[0]),
    h('strong', item[1]),
  ])))
}
</script>

<style scoped>
.divine-page {
  padding-bottom: 28px;
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
  align-items: start;
  grid-template-columns: 190px minmax(0, 1fr) 230px;
  width: min(1720px, 100%);
}

.skill-hero {
  display: flex;
  min-height: 220px;
  align-items: flex-end;
  justify-content: space-between;
  gap: 22px;
  background:
    linear-gradient(90deg, rgba(13, 9, 7, 0.84), rgba(13, 9, 7, 0.22)),
    radial-gradient(circle at 82% 30%, rgba(215, 179, 95, 0.18), transparent 32%),
    linear-gradient(145deg, rgba(255, 247, 231, 0.08), transparent);
}

.skill-hero h1 {
  margin: 12px 0 0;
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: clamp(48px, 7vw, 78px);
  font-weight: 400;
  line-height: 1;
}

.skill-hero p {
  max-width: 720px;
  color: var(--paper-dim);
}

.method-panel,
.form-panel,
.ask-panel,
.empty-card,
.answer-card {
  padding: 22px;
}

.primary-work-grid {
  display: grid;
  grid-template-columns: minmax(360px, 0.92fr) minmax(480px, 1.08fr);
  gap: 16px;
  align-items: stretch;
}

.primary-work-grid.is-qimen-work {
  grid-template-columns: minmax(280px, 0.58fr) minmax(0, 1.42fr);
}

.primary-work-grid.is-meihua-work {
  grid-template-columns: minmax(320px, 0.7fr) minmax(0, 1.3fr);
}

.primary-work-grid .form-panel,
.board-preview-panel {
  min-height: 560px;
}

.primary-work-grid .form-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.primary-work-grid.is-qimen-work .event-form-grid {
  grid-template-columns: 1fr;
}

.primary-work-grid.is-qimen-work .event-form-grid .ds-field,
.primary-work-grid.is-qimen-work .event-form-grid .info-chip {
  grid-column: 1 / -1;
}

.primary-work-grid.is-meihua-work .event-form-grid {
  grid-template-columns: 1fr;
}

.primary-work-grid.is-meihua-work .event-form-grid .ds-field,
.primary-work-grid.is-meihua-work .event-form-grid .info-chip {
  grid-column: 1 / -1;
}

.inline-question {
  margin-top: 14px;
}

.inline-question textarea {
  min-height: 88px;
}

.board-preview-panel {
  display: grid;
  align-content: start;
  gap: 14px;
  padding: 20px;
}

.divine-shell .right-rail-card {
  padding: 14px;
}

.divine-shell .right-rail-card h3 {
  font-size: 23px;
}

.divine-shell .right-rail .ritual-state {
  padding: 8px;
}

.divine-shell .right-rail .ritual-state-title {
  font-size: 24px;
}

.divine-shell .right-rail .quick-icons {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.divine-shell .right-rail .quick-icons button {
  min-height: 66px;
  padding: 7px;
}

.divine-shell .right-rail .quick-icons b {
  width: 30px;
  height: 30px;
}

.board-preview-panel .visual-board {
  margin-bottom: 0;
}

.preview-note {
  margin: 0;
  color: var(--paper-dim);
  font-size: 13px;
}

.left-rail.method-panel {
  padding: 14px;
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

.dimension-filter {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border: 1px solid rgba(215, 179, 95, 0.16);
  border-radius: var(--radius-sm);
  background: rgba(34, 21, 14, 0.54);
}

.dimension-filter span {
  color: var(--paper-dim);
}

.dimension-filter button {
  min-height: 34px;
  padding: 6px 14px;
  border: 1px solid rgba(215, 179, 95, 0.2);
  border-radius: 999px;
  color: var(--paper-dim);
  background: rgba(255, 247, 231, 0.04);
}

.dimension-filter button.active,
.dimension-filter button:hover {
  border-color: rgba(240, 217, 132, 0.52);
  color: var(--gold-bright);
  background: rgba(215, 179, 95, 0.12);
}

.tip-item {
  grid-template-columns: 28px minmax(0, 1fr);
}

.tip-item::before {
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  border: 1px solid rgba(215, 179, 95, 0.24);
  border-radius: 50%;
  color: var(--gold-bright);
  content: "•";
}

.tip-item strong,
.tip-item span {
  grid-column: 2;
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

.mini-record {
  display: grid;
  gap: 4px;
  padding: 11px 0;
  border: 0;
  border-top: 1px solid rgba(215, 179, 95, 0.12);
  color: var(--paper-dim);
  background: transparent;
  text-align: left;
}

.mini-record:first-child {
  border-top: 0;
}

.mini-record strong {
  color: var(--paper);
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

.visual-board {
  display: grid;
  gap: 14px;
  overflow-x: auto;
  margin-bottom: 18px;
  padding: 16px;
  border: 1px solid rgba(215, 179, 95, 0.2);
  border-radius: var(--radius-sm);
  background:
    radial-gradient(circle at 20% 0%, rgba(215, 179, 95, 0.12), transparent 34%),
    linear-gradient(145deg, rgba(13, 9, 7, 0.72), rgba(43, 25, 16, 0.42));
}

.board-head h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 400;
}

.bazi-pro-table,
.ziwei-palace-grid,
.ziwei-dial,
.qimen-nine-grid,
.liuyao-layout,
.liuyao-pro-lines,
.meihua-flow,
.daliuren-board,
.xiaoliuren-wheel,
.relation-board,
.hehun-board,
.fojiao-scroll,
.fengshui-compass,
.fengshui-nine-grid,
.daily-board,
.tarot-spread,
.generic-pro-grid {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(215, 179, 95, 0.18);
  border-radius: var(--radius-xs);
  background: rgba(255, 247, 231, 0.035);
}

.bazi-pro-table {
  min-width: 680px;
}

.bazi-row {
  display: grid;
  grid-template-columns: 92px repeat(4, minmax(116px, 1fr));
  border-top: 1px solid rgba(215, 179, 95, 0.13);
}

.bazi-row:first-child {
  border-top: 0;
}

.bazi-row > * {
  min-height: 44px;
  padding: 11px 10px;
  border-left: 1px solid rgba(215, 179, 95, 0.13);
  color: var(--paper);
  font-style: normal;
  line-height: 1.45;
}

.bazi-row > :first-child {
  border-left: 0;
  color: var(--seal);
  font-weight: 700;
}

.bazi-header {
  background: rgba(215, 179, 95, 0.12);
}

.bazi-header strong {
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 400;
}

.board-tips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid rgba(215, 179, 95, 0.13);
}

.board-tips small,
.tarot-spread-name {
  padding: 6px 9px;
  border: 1px solid rgba(215, 179, 95, 0.18);
  border-radius: 999px;
  color: var(--paper-dim);
  background: rgba(0, 0, 0, 0.16);
}

.ziwei-palace-grid,
.qimen-nine-grid,
.fengshui-nine-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  min-height: 390px;
}

.ziwei-dial {
  display: grid;
  width: min(680px, 100%);
  aspect-ratio: 1;
  place-items: center;
  justify-self: center;
  overflow: visible;
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(13, 9, 7, 0.9) 0 22%, rgba(215, 179, 95, 0.08) 23% 31%, transparent 32%),
    conic-gradient(from -15deg, rgba(215, 179, 95, 0.06) 0 30deg, rgba(184, 58, 47, 0.1) 30deg 60deg, rgba(79, 155, 131, 0.08) 60deg 90deg, rgba(215, 179, 95, 0.06) 90deg 120deg, rgba(109, 150, 170, 0.08) 120deg 150deg, rgba(215, 179, 95, 0.06) 150deg 180deg, rgba(184, 58, 47, 0.08) 180deg 210deg, rgba(215, 179, 95, 0.06) 210deg 240deg, rgba(79, 155, 131, 0.08) 240deg 270deg, rgba(215, 179, 95, 0.06) 270deg 300deg, rgba(109, 150, 170, 0.08) 300deg 330deg, rgba(215, 179, 95, 0.06) 330deg 360deg),
    rgba(0, 0, 0, 0.14);
  box-shadow: inset 0 0 62px rgba(0, 0, 0, 0.46), 0 0 36px rgba(215, 179, 95, 0.12);
}

.ziwei-dial-ring,
.ziwei-dial-palace,
.ziwei-dial-center {
  position: absolute;
}

.ziwei-dial-ring {
  border: 1px solid rgba(215, 179, 95, 0.28);
  border-radius: 50%;
  pointer-events: none;
}

.ziwei-dial-ring.outer { inset: 3%; }
.ziwei-dial-ring.middle { inset: 19%; }
.ziwei-dial-ring.inner { inset: 36%; }

.ziwei-dial-palace {
  display: grid;
  width: 112px;
  min-height: 104px;
  place-items: center;
  gap: 2px;
  padding: 9px;
  border: 1px solid rgba(215, 179, 95, 0.16);
  border-radius: var(--radius-xs);
  background: rgba(13, 9, 7, 0.6);
  text-align: center;
  transform: rotate(var(--a)) translateY(-246px) rotate(calc(-1 * var(--a)));
}

.ziwei-dial-palace.is-ming {
  border-color: rgba(240, 217, 132, 0.5);
  background: radial-gradient(circle, rgba(215, 179, 95, 0.16), rgba(13, 9, 7, 0.66));
}

.ziwei-dial-palace.is-body {
  box-shadow: 0 0 18px rgba(184, 58, 47, 0.18);
}

.ziwei-dial-palace span,
.ziwei-dial-palace small {
  color: rgba(245, 234, 212, 0.58);
  font-size: 11px;
}

.ziwei-dial-palace strong {
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 21px;
  font-weight: 400;
  line-height: 1.1;
}

.ziwei-dial-palace b {
  color: var(--paper);
  font-size: 14px;
}

.ziwei-dial-palace em {
  color: #e59686;
  font-size: 12px;
  font-style: normal;
}

.ziwei-dial-center {
  display: grid;
  width: 218px;
  min-height: 168px;
  place-items: center;
  gap: 6px;
  padding: 18px;
  border: 1px solid rgba(240, 217, 132, 0.42);
  border-radius: 50%;
  background: rgba(13, 9, 7, 0.92);
  text-align: center;
}

.ziwei-dial-center b {
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 29px;
  font-weight: 400;
}

.ziwei-dial-center strong {
  color: var(--paper);
}

.ziwei-dial-center span,
.ziwei-dial-center small {
  color: var(--paper-dim);
}

.ziwei-palace-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.palace-cell,
.nine-cell,
.feng-cell,
.meihua-cell,
.generic-cell,
.tarot-card {
  display: grid;
  align-content: start;
  gap: 7px;
  min-height: 118px;
  padding: 13px;
  border: 1px solid rgba(215, 179, 95, 0.12);
  background: rgba(255, 247, 231, 0.035);
}

.palace-cell span,
.nine-cell span,
.feng-cell span,
.meihua-cell span,
.generic-cell span,
.tarot-card span,
.yao-row span {
  color: var(--seal);
  font-weight: 700;
  font-size: 12px;
}

.palace-cell strong,
.nine-cell strong,
.feng-cell strong,
.meihua-cell strong,
.generic-cell strong,
.tarot-card strong {
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 25px;
  font-weight: 400;
  line-height: 1.1;
}

.palace-cell em,
.nine-cell em,
.feng-cell em,
.meihua-cell em,
.tarot-card em,
.yao-row em {
  color: var(--paper-dim);
  font-size: 13px;
  font-style: normal;
}

.palace-cell.is-primary,
.nine-cell.center,
.feng-cell.center {
  background: radial-gradient(circle, rgba(177, 49, 35, 0.22), rgba(215, 179, 95, 0.08));
}

.ziwei-center {
  position: absolute;
  inset: 50%;
  display: grid;
  width: 170px;
  height: 118px;
  place-items: center;
  padding: 12px;
  border: 1px solid rgba(240, 217, 132, 0.4);
  border-radius: var(--radius-xs);
  color: var(--paper);
  background: rgba(13, 9, 7, 0.92);
  transform: translate(-50%, -50%);
  text-align: center;
}

.ziwei-center b {
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 400;
}

.ziwei-center small,
.nine-cell small {
  color: var(--paper-dim);
}

.liuyao-pro-lines {
  display: grid;
  gap: 0;
}

.liuyao-layout {
  display: grid;
  gap: 12px;
  padding: 14px;
}

.liuyao-title-strip,
.liuyao-footnotes {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid rgba(215, 179, 95, 0.14);
  border-radius: var(--radius-xs);
  background: rgba(0, 0, 0, 0.14);
}

.liuyao-title-strip strong {
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 400;
}

.liuyao-title-strip span,
.liuyao-title-strip em,
.liuyao-footnotes span {
  color: var(--paper-dim);
  font-style: normal;
}

.yao-row {
  display: grid;
  grid-template-columns: 52px minmax(120px, 1fr) 64px 44px minmax(120px, 1fr);
  align-items: center;
  gap: 12px;
  min-height: 58px;
  padding: 9px 12px;
  border-top: 1px solid rgba(215, 179, 95, 0.12);
}

.yao-row:first-child {
  border-top: 0;
}

.yao-line {
  position: relative;
  display: block;
  height: 10px;
}

.yao-line::before,
.yao-line::after {
  content: "";
  position: absolute;
  top: 0;
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(90deg, #b8842d, #f0d984, #b8842d);
  box-shadow: 0 0 18px rgba(240, 217, 132, 0.28);
}

.yao-line.yang::before {
  left: 0;
  right: 0;
}

.yao-line.yin::before {
  left: 0;
  width: 42%;
}

.yao-line.yin::after {
  right: 0;
  width: 42%;
}

.yao-row b {
  min-height: 24px;
  color: var(--gold-bright);
}

.yao-row.is-marked {
  background: rgba(184, 58, 47, 0.08);
}

.meihua-flow {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  padding: 14px;
}

.meihua-plum-board {
  position: relative;
  display: grid;
  width: min(620px, 100%);
  aspect-ratio: 1.12;
  place-items: center;
  justify-self: center;
  overflow: hidden;
  border: 1px solid rgba(215, 179, 95, 0.18);
  border-radius: var(--radius-sm);
  background:
    radial-gradient(circle at 50% 50%, rgba(215, 179, 95, 0.16), transparent 22%),
    radial-gradient(circle at 18% 20%, rgba(184, 58, 47, 0.18), transparent 28%),
    rgba(0, 0, 0, 0.12);
}

.meihua-plum-center {
  position: absolute;
  z-index: 3;
  display: grid;
  width: 128px;
  height: 128px;
  place-items: center;
  border: 1px solid rgba(240, 217, 132, 0.42);
  border-radius: 50%;
  background: rgba(13, 9, 7, 0.88);
  color: var(--gold-bright);
  text-align: center;
}

.meihua-plum-center b {
  font-size: 48px;
  line-height: 1;
}

.meihua-plum-center span,
.meihua-plum-note {
  color: var(--paper-dim);
  font-size: 13px;
}

.meihua-petal {
  position: absolute;
  display: grid;
  width: 138px;
  min-height: 138px;
  place-items: center;
  align-content: center;
  gap: 5px;
  padding: 14px;
  border: 1px solid rgba(215, 179, 95, 0.28);
  border-radius: 48% 52% 48% 52%;
  background: radial-gradient(circle, rgba(215, 179, 95, 0.12), rgba(13, 9, 7, 0.7));
  text-align: center;
  transform: rotate(var(--a)) translateY(-190px) rotate(calc(-1 * var(--a)));
}

.meihua-petal strong {
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 400;
}

.meihua-petal i {
  color: var(--paper);
  font-size: 26px;
  font-style: normal;
}

.meihua-petal span {
  color: var(--paper);
  font-weight: 700;
}

.meihua-petal em {
  color: var(--paper-dim);
  font-size: 12px;
  font-style: normal;
}

.meihua-plum-note {
  position: absolute;
  right: 24px;
  bottom: 18px;
  left: 24px;
  margin: 0;
  text-align: center;
}

.meihua-node {
  position: relative;
  display: grid;
  min-height: 164px;
  align-content: center;
  gap: 9px;
  padding: 16px;
  border: 1px solid rgba(215, 179, 95, 0.16);
  border-radius: var(--radius-xs);
  background: radial-gradient(circle at 50% 0%, rgba(215, 179, 95, 0.12), transparent 46%), rgba(0, 0, 0, 0.12);
  text-align: center;
}

.meihua-node:not(:last-child)::after {
  position: absolute;
  top: 50%;
  right: -13px;
  z-index: 2;
  color: var(--gold-bright);
  content: ">";
  transform: translateY(-50%);
}

.meihua-node.is-relation {
  background: radial-gradient(circle, rgba(184, 58, 47, 0.18), rgba(215, 179, 95, 0.06));
}

.meihua-node span,
.daliuren-core span,
.daliuren-pass span,
.daliuren-grid span,
.relation-panels span,
.hehun-person span,
.fojiao-lines span,
.daily-rhythm span {
  color: var(--seal);
  font-size: 12px;
  font-weight: 700;
}

.meihua-node strong,
.daliuren-core strong,
.daliuren-pass strong,
.daliuren-grid strong,
.relation-panels strong,
.hehun-person strong,
.daily-rhythm strong {
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 25px;
  font-weight: 400;
  line-height: 1.15;
}

.meihua-node em {
  color: var(--paper-dim);
  font-style: normal;
}

.daliuren-board {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 14px;
  padding: 14px;
}

.daliuren-plate {
  position: relative;
  display: grid;
  width: min(620px, 100%);
  aspect-ratio: 1;
  place-items: center;
  justify-self: center;
  overflow: hidden;
  border: 1px solid rgba(215, 179, 95, 0.18);
  border-radius: var(--radius-sm);
  background:
    radial-gradient(circle, rgba(215, 179, 95, 0.12), transparent 38%),
    conic-gradient(from -15deg, rgba(215, 179, 95, 0.08), rgba(109, 150, 170, 0.08), rgba(184, 58, 47, 0.08), rgba(215, 179, 95, 0.08)),
    rgba(0, 0, 0, 0.12);
}

.daliuren-ring,
.daliuren-ring span,
.daliuren-center,
.daliuren-pass-strip,
.daliuren-foot {
  position: absolute;
}

.daliuren-ring {
  border: 1px solid rgba(215, 179, 95, 0.28);
  border-radius: 50%;
}

.daliuren-ring.outer {
  inset: 8%;
}

.daliuren-ring.middle {
  inset: 24%;
}

.daliuren-ring span {
  top: 50%;
  left: 50%;
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 22px;
  transform: rotate(var(--a)) translateY(-244px) rotate(calc(-1 * var(--a)));
}

.daliuren-ring.middle span {
  font-size: 15px;
  transform: rotate(var(--a)) translateY(-164px) rotate(calc(-1 * var(--a)));
}

.daliuren-center {
  display: grid;
  width: 170px;
  height: 170px;
  place-items: center;
  align-content: center;
  gap: 6px;
  border: 1px solid rgba(240, 217, 132, 0.46);
  border-radius: 50%;
  background: rgba(13, 9, 7, 0.9);
  text-align: center;
}

.daliuren-center strong {
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 25px;
  font-weight: 400;
}

.daliuren-center span,
.daliuren-foot span {
  color: var(--paper-dim);
  font-size: 12px;
}

.daliuren-pass-strip,
.daliuren-foot {
  right: 18px;
  left: 18px;
  display: flex;
  justify-content: center;
  gap: 14px;
  padding: 9px 12px;
  border: 1px solid rgba(215, 179, 95, 0.16);
  border-radius: var(--radius-xs);
  background: rgba(0, 0, 0, 0.18);
}

.daliuren-pass-strip {
  bottom: 54px;
}

.daliuren-foot {
  bottom: 14px;
}

.daliuren-pass-strip div {
  display: flex;
  gap: 6px;
}

.daliuren-pass-strip span {
  color: var(--paper-dim);
}

.daliuren-pass-strip strong {
  color: var(--gold-bright);
}

:deep(.meihua-plum-board) {
  position: relative;
  display: grid;
  width: min(620px, 100%);
  aspect-ratio: 1.12;
  place-items: center;
  justify-self: center;
  overflow: hidden;
}

:deep(.meihua-plum-center),
:deep(.meihua-petal),
:deep(.meihua-plum-note),
:deep(.daliuren-ring),
:deep(.daliuren-ring span),
:deep(.daliuren-center),
:deep(.daliuren-pass-strip),
:deep(.daliuren-foot) {
  position: absolute;
}

:deep(.meihua-petal) {
  transform: rotate(var(--a)) translateY(-190px) rotate(calc(-1 * var(--a)));
}

:deep(.daliuren-plate) {
  position: relative;
  display: grid;
  width: min(620px, 100%);
  aspect-ratio: 1;
  place-items: center;
  justify-self: center;
  overflow: hidden;
}

:deep(.daliuren-ring span) {
  top: 50%;
  left: 50%;
  transform: rotate(var(--a)) translateY(-244px) rotate(calc(-1 * var(--a)));
}

:deep(.daliuren-ring.middle span) {
  transform: rotate(var(--a)) translateY(-164px) rotate(calc(-1 * var(--a)));
}

.daliuren-core {
  display: grid;
  min-height: 250px;
  place-items: center;
  align-content: center;
  gap: 10px;
  padding: 20px;
  border: 1px solid rgba(240, 217, 132, 0.28);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(215, 179, 95, 0.16), rgba(0, 0, 0, 0.2) 68%);
  text-align: center;
}

.daliuren-core em {
  color: var(--paper-dim);
  font-style: normal;
}

.daliuren-pass {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.daliuren-pass div,
.daliuren-grid div {
  display: grid;
  align-content: center;
  gap: 8px;
  min-height: 112px;
  padding: 14px;
  border: 1px solid rgba(215, 179, 95, 0.14);
  border-radius: var(--radius-xs);
  background: rgba(255, 247, 231, 0.04);
}

.daliuren-grid {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.xiaoliuren-wheel {
  display: grid;
  width: min(520px, 100%);
  aspect-ratio: 1;
  place-items: center;
  justify-self: center;
  overflow: visible;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(13, 9, 7, 0.82) 0 28%, transparent 29%), conic-gradient(rgba(215, 179, 95, 0.08), rgba(184, 58, 47, 0.12), rgba(79, 155, 131, 0.1), rgba(215, 179, 95, 0.08));
}

.xiaoliuren-center,
.xiaoliuren-gate {
  position: absolute;
  display: grid;
  place-items: center;
  text-align: center;
}

.xiaoliuren-center {
  width: 140px;
  height: 140px;
  border: 1px solid rgba(240, 217, 132, 0.4);
  border-radius: 50%;
  background: rgba(13, 9, 7, 0.9);
}

.xiaoliuren-center strong,
.relation-orbit strong,
.hehun-score b,
.daily-sun strong {
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 400;
}

.xiaoliuren-center span,
.xiaoliuren-gate em,
.relation-orbit span,
.hehun-score span,
.daily-sun span {
  color: var(--paper-dim);
}

.xiaoliuren-gate {
  width: 104px;
  min-height: 82px;
  padding: 10px;
  border: 1px solid rgba(215, 179, 95, 0.16);
  border-radius: var(--radius-xs);
  background: rgba(13, 9, 7, 0.62);
  transform: rotate(var(--a)) translateY(-178px) rotate(calc(-1 * var(--a)));
}

.xiaoliuren-gate span {
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 24px;
}

.relation-board {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 14px;
  padding: 14px;
}

.relation-orbit {
  display: grid;
  min-height: 260px;
  place-items: center;
  align-content: center;
  gap: 10px;
  border: 1px solid rgba(215, 179, 95, 0.24);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(184, 58, 47, 0.16), rgba(215, 179, 95, 0.08), transparent 70%);
  text-align: center;
}

.relation-orbit span {
  font-family: var(--font-display);
  font-size: 56px;
}

.relation-panels {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.relation-panels div {
  display: grid;
  align-content: center;
  gap: 7px;
  min-height: 120px;
  padding: 14px;
  border: 1px solid rgba(215, 179, 95, 0.14);
  border-radius: var(--radius-xs);
  background: rgba(255, 247, 231, 0.04);
}

.hehun-board {
  display: grid;
  grid-template-columns: 1fr 150px 1fr;
  gap: 12px;
  padding: 14px;
}

.hehun-person,
.hehun-score {
  display: grid;
  min-height: 180px;
  place-items: center;
  align-content: center;
  gap: 9px;
  padding: 14px;
  border: 1px solid rgba(215, 179, 95, 0.16);
  border-radius: var(--radius-xs);
  background: rgba(255, 247, 231, 0.04);
  text-align: center;
}

.hehun-score {
  border-radius: 50%;
  background: radial-gradient(circle, rgba(184, 58, 47, 0.2), rgba(215, 179, 95, 0.08));
}

.hehun-note {
  display: grid;
  grid-column: 1 / -1;
  gap: 8px;
  padding: 14px;
  border: 1px solid rgba(215, 179, 95, 0.12);
  border-radius: var(--radius-xs);
  background: rgba(0, 0, 0, 0.12);
}

.hehun-note p,
.fojiao-lines p {
  margin: 0;
  color: var(--paper-dim);
}

.fojiao-scroll {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: 16px;
  padding: 22px;
  background:
    linear-gradient(90deg, rgba(245, 234, 212, 0.08), transparent),
    rgba(13, 9, 7, 0.28);
}

.fojiao-seal {
  display: grid;
  width: 72px;
  height: 72px;
  place-items: center;
  border: 1px solid rgba(184, 58, 47, 0.46);
  border-radius: 50%;
  color: var(--paper-soft);
  background: linear-gradient(145deg, var(--seal), var(--seal-dark));
  font-family: var(--font-display);
  font-size: 38px;
}

.fojiao-lines {
  display: grid;
  gap: 10px;
}

.fojiao-lines section {
  padding: 12px 0;
  border-bottom: 1px solid rgba(215, 179, 95, 0.13);
}

.fengshui-compass {
  padding: 14px;
  background:
    radial-gradient(circle at 50% 50%, rgba(215, 179, 95, 0.12), transparent 32%),
    rgba(0, 0, 0, 0.08);
}

.daily-board {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 14px;
  padding: 14px;
}

.daily-sun {
  display: grid;
  min-height: 220px;
  place-items: center;
  align-content: center;
  gap: 8px;
  border: 1px solid rgba(240, 217, 132, 0.3);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(240, 217, 132, 0.2), rgba(184, 58, 47, 0.1), transparent 72%);
  text-align: center;
}

.daily-rhythm {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.daily-rhythm div {
  display: grid;
  align-content: center;
  gap: 8px;
  min-height: 112px;
  padding: 14px;
  border: 1px solid rgba(215, 179, 95, 0.14);
  border-radius: var(--radius-xs);
  background: rgba(255, 247, 231, 0.04);
}

.meihua-pro-grid,
.generic-pro-grid,
.tarot-spread {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.tarot-spread {
  grid-template-columns: 120px repeat(3, minmax(0, 1fr));
  align-items: stretch;
  padding: 12px;
  gap: 10px;
}

.tarot-spread-name {
  display: grid;
  place-items: center;
  border-radius: var(--radius-xs);
  color: var(--gold-bright);
  writing-mode: vertical-rl;
  letter-spacing: 0;
}

.tarot-card {
  min-height: 180px;
  place-items: center;
  text-align: center;
  background:
    linear-gradient(135deg, rgba(177, 49, 35, 0.16), transparent),
    rgba(255, 247, 231, 0.045);
}

.answer-text {
  display: grid;
  gap: 10px;
  padding: 14px;
  border: 1px solid rgba(215, 179, 95, 0.16);
  border-radius: var(--radius-xs);
  background: rgba(255, 247, 231, 0.04);
}

.answer-text-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.answer-text-head span {
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 24px;
}

.answer-text-head strong {
  color: rgba(245, 234, 212, 0.52);
  font-size: 12px;
  font-weight: 400;
}

.answer-text-body {
  display: grid;
  gap: 8px;
}

.answer-line {
  margin: 0;
  padding: 10px 12px;
  border-left: 2px solid rgba(215, 179, 95, 0.35);
  color: var(--paper);
  background: rgba(0, 0, 0, 0.12);
  font-family: var(--font-serif);
  line-height: 1.8;
  word-break: break-word;
}

.answer-line.is-short {
  color: var(--gold-bright);
  font-weight: 700;
}

@media (max-width: 980px) {
  .divine-shell {
    grid-template-columns: 1fr;
  }

  .primary-work-grid {
    grid-template-columns: 1fr;
  }

  .primary-work-grid.is-qimen-work {
    grid-template-columns: 1fr;
  }

  .primary-work-grid.is-meihua-work {
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
  .daliuren-board,
  .relation-board,
  .hehun-board,
  .daily-board,
  .meihua-pro-grid,
  .meihua-flow,
  .generic-pro-grid,
  .tarot-spread {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .daliuren-core,
  .daily-sun {
    min-height: 190px;
  }

  .hehun-score {
    border-radius: var(--radius-xs);
  }

  .ziwei-palace-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .tarot-spread-name {
    writing-mode: horizontal-tb;
  }
}

@media (max-width: 680px) {
  .page-nav > .ds-badge,
  .title-center div {
    display: none;
  }

  .method-menu,
  .form-grid,
  .primary-work-grid .form-grid,
  .ziwei-palace-grid,
  .qimen-nine-grid,
  .fengshui-nine-grid,
  .meihua-pro-grid,
  .generic-pro-grid,
  .tarot-spread {
    grid-template-columns: 1fr;
  }

  .daliuren-board,
  .relation-board,
  .hehun-board,
  .daily-board,
  .meihua-flow,
  .daliuren-pass,
  .daliuren-grid,
  .relation-panels,
  .daily-rhythm,
  .fojiao-scroll {
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

  .ziwei-center {
    position: relative;
    inset: auto;
    width: auto;
    height: auto;
    order: -1;
    transform: none;
  }

  .yao-row {
    grid-template-columns: 42px minmax(100px, 1fr) 48px;
  }

  .yao-row b,
  .yao-row em {
    grid-column: 2 / -1;
  }

  .ziwei-dial {
    width: min(350px, 94vw);
  }

  .ziwei-dial-palace {
    width: 72px;
    min-height: 66px;
    padding: 5px;
    transform: rotate(var(--a)) translateY(-128px) rotate(calc(-1 * var(--a)));
  }

  .ziwei-dial-palace strong {
    font-size: 15px;
  }

  .ziwei-dial-palace b {
    font-size: 11px;
  }

  .ziwei-dial-palace em,
  .ziwei-dial-palace small {
    display: none;
  }

  .ziwei-dial-center {
    width: 122px;
    min-height: 104px;
    padding: 10px;
  }

  .ziwei-dial-center b {
    font-size: 19px;
  }

  .meihua-node:not(:last-child)::after {
    top: auto;
    right: 50%;
    bottom: -18px;
    transform: translateX(50%) rotate(90deg);
  }

  .xiaoliuren-wheel {
    width: min(330px, 94vw);
  }

  .meihua-plum-board,
  .daliuren-plate {
    width: min(330px, 94vw);
  }

  .meihua-petal {
    width: 82px;
    min-height: 82px;
    padding: 7px;
    transform: rotate(var(--a)) translateY(-112px) rotate(calc(-1 * var(--a)));
  }

  .meihua-petal strong,
  .meihua-petal i {
    font-size: 17px;
  }

  .meihua-petal em,
  .meihua-plum-note,
  .daliuren-foot {
    display: none;
  }

  .meihua-plum-center {
    width: 92px;
    height: 92px;
  }

  .daliuren-ring span {
    font-size: 15px;
    transform: rotate(var(--a)) translateY(-132px) rotate(calc(-1 * var(--a)));
  }

  .daliuren-ring.middle span {
    display: none;
  }

  .daliuren-center {
    width: 118px;
    height: 118px;
  }

  .daliuren-pass-strip {
    bottom: 12px;
    gap: 6px;
  }

  .xiaoliuren-gate {
    width: 76px;
    min-height: 64px;
    padding: 6px;
    transform: rotate(var(--a)) translateY(-118px) rotate(calc(-1 * var(--a)));
  }

  .xiaoliuren-gate span {
    font-size: 18px;
  }

  .xiaoliuren-gate em {
    display: none;
  }

  .xiaoliuren-center {
    width: 112px;
    height: 112px;
  }

  .fojiao-seal {
    width: 62px;
    height: 62px;
  }
}
</style>
