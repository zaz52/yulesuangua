<template>
  <main class="home-page mystic-app">
    <header class="mystic-topbar">
      <a class="brand" href="/" aria-label="乾坤之道首页">
        <span class="brand-seal">卦</span>
        <span>
          <strong>乾坤之道</strong>
          <em>周易起卦与玄学 Skills</em>
        </span>
      </a>
      <nav class="nav-links" aria-label="主导航">
        <a href="#ritual">首页</a>
        <a href="#skills">AI问卦</a>
        <a href="#tools">功能中心</a>
        <a href="#boundary">说明</a>
      </nav>
      <div class="mystic-actions">
        <span class="ds-badge green">隐私保护</span>
        <button class="ds-button primary" type="button" @click="go('/zhouyi')">开始问卦</button>
      </div>
    </header>

    <section class="mystic-layout">
      <aside class="left-rail">
        <button class="rail-link active" type="button" @click="go('/')"><i>⌂</i><span>首页</span></button>
        <span class="rail-section-title">术数工具</span>
        <button v-for="item in railSkills" :key="item.id" class="rail-link" type="button" @click="go(item.path)"><i>{{ item.icon }}</i><span>{{ item.name }}</span></button>
      </aside>

      <section class="main-workspace">
        <article id="ritual" class="home-hero hero-workspace">
          <div class="hero-copy">
            <span class="section-kicker">东方术数与 AI 智慧工具台</span>
            <h1>乾坤之道</h1>
            <p>集千年术数智慧与 AI 洞察于一体，助你洞察天时、明晰人事、把握机遇、趋吉避凶。</p>
            <div class="hero-actions">
              <button class="ds-button primary" type="button" @click="go('/zhouyi')">开始问卦</button>
              <button class="ds-button ghost" type="button" @click="go('/divine/qimen')">查看功能</button>
            </div>
            <form class="mobile-quick-ask" @submit.prevent="startMobileAsk">
              <label>
                <span>{{ quickAskLabel }}</span>
                <textarea v-model.trim="mobileQuestion" :placeholder="quickAskPlaceholder"></textarea>
              </label>
              <button class="ds-button primary" type="submit">{{ quickAskButton }}</button>
              <small>{{ quickAskPrivacy }}</small>
            </form>
          </div>
          <div class="hero-plate">
            <div class="bagua-orbit" aria-hidden="true">
              <span v-for="item in trigrams" :key="item">{{ item }}</span>
            </div>
            <div class="plate-center"><strong>易</strong><em>先定问题，再选术法</em></div>
          </div>
        </article>

        <article id="tools" class="function-center hero-workspace">
          <div class="function-hero-copy">
            <span class="section-kicker">功能中心</span>
            <h2>功能中心</h2>
            <p>集千年术数智慧与 AI 能力于一体，助你洞察天时、明晰人事、趋吉避凶。</p>
          </div>
          <div class="function-search-row">
            <label class="function-search">
              <input v-model.trim="toolSearch" placeholder="搜索工具名称或关键词" />
              <span>⌕</span>
            </label>
            <button v-for="group in functionGroups" :key="group.id" type="button" :class="{ active: activeFunctionGroup === group.id }" @click="activeFunctionGroup = group.id">
              {{ group.name }}
            </button>
          </div>
          <section v-for="section in visibleFunctionSections" :key="section.id" class="function-section">
            <div class="function-section-head">
              <h3>{{ section.name }}</h3>
              <button type="button" @click="activeFunctionGroup = section.id">展开全部 ›</button>
            </div>
            <div class="function-card-grid">
              <article v-for="item in section.items" :key="item.id" class="function-card" @click="go(item.path)">
                <span class="function-icon">{{ item.icon }}</span>
                <div>
                  <strong>{{ item.name }}</strong>
                  <p>{{ item.description }}</p>
                </div>
                <em>{{ item.badge }}</em>
                <button type="button">进入使用</button>
              </article>
            </div>
          </section>
        </article>

        <div class="dashboard-grid">
          <article class="oracle-card today-card">
            <div class="card-title-row"><h3>今日观象</h3><span class="ds-badge gold">查看详情</span></div>
            <strong>晴转多云</strong>
            <p>农历四月廿五，乙巳年 辛巳月 甲子日。</p>
            <div class="mini-metrics"><span>五行 海中金</span><span>冲煞 马日冲鼠</span><span>值神 金匮</span></div>
          </article>
          <article id="skills" class="oracle-card recommend-card">
            <div class="card-title-row"><h3>推荐功能</h3><span class="ds-badge">精选入口</span></div>
            <div class="recommend-row">
              <button v-for="item in featuredSkills" :key="item.id" type="button" @click="go(item.path)">
                <i>{{ item.icon }}</i><strong>{{ item.name }}</strong><span>{{ item.short }}</span>
              </button>
            </div>
          </article>
        </div>

        <section class="tool-strip">
          <article v-for="item in tools" :key="item.id" class="tool-card oracle-card" @click="go(item.path)">
            <span>{{ item.icon }}</span>
            <div><strong>{{ item.name }}</strong><p>{{ item.description }}</p></div>
          </article>
        </section>

        <article id="boundary" class="oracle-card boundary-section">
          <span class="section-kicker">Boundary</span>
          <h2>使用边界</h2>
          <p>本站内容用于传统文化体验、娱乐和自我观察，不构成医疗、法律、财务、婚恋等现实决策建议。重要事项请结合现实信息与专业人士意见。</p>
          <p>隐私保护：默认不会在本地浏览器或远端数据库保存你的姓名、生日、地点、问题和解读结果。</p>
        </article>
      </section>

      <aside class="right-rail">
        <article class="right-rail-card">
          <div class="card-title-row"><h3>今日卦象</h3><span class="ds-badge">查看详情</span></div>
          <div class="today-hex">☴</div>
          <strong>天风姤</strong>
          <p>姤者，遇也。阴长阳消，凡事宜谨慎观察，静待时机。</p>
          <div class="hex-tags"><span>卦象 乾上巽下</span><span>卦德 遇合·进退</span><span>运势 平中有变</span></div>
        </article>
        <article class="right-rail-card">
          <h3>今日宜忌</h3>
          <div class="mini-item"><strong>宜</strong><span>祭祀 祈福 求嗣 出行 解除 纳采 订盟</span></div>
          <div class="mini-item"><strong>忌</strong><span>动土 破土 安葬 冠笄 造桥</span></div>
        </article>
        <article class="right-rail-card">
          <h3>快捷入口</h3>
          <div class="quick-icons">
            <button v-for="item in quickTools" :key="item.id" type="button" @click="go(item.path)"><b>{{ item.icon }}</b>{{ item.name }}</button>
          </div>
        </article>
        <article class="right-rail-card quote-card">
          <p>知天地之数，明阴阳之理，趋吉避凶，顺势而为。</p>
        </article>
      </aside>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const today = computed(() => new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date()))
const trigrams = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤']
const activeGroup = ref('all')
const activeFunctionGroup = ref('all')
const toolSearch = ref('')
const mobileQuestion = ref('')
const quickAskLabel = '\u8bf7\u8f93\u5165\u4f60\u60f3\u95ee\u7684\u4e8b'
const quickAskPlaceholder = '\u4f8b\u5982\uff1a\u8fd9\u6b21\u9009\u62e9\u662f\u5426\u987a\u5229\uff1f'
const quickAskButton = '\u7acb\u5373\u8d77\u5366'
const quickAskPrivacy = '\u9690\u79c1\u4fdd\u62a4\uff1a\u95ee\u9898\u53ea\u5e26\u5165\u5f53\u524d\u8d77\u5366\u6d41\u7a0b\uff0c\u4e0d\u4fdd\u5b58\u4e3a\u672c\u5730\u8bb0\u5f55\u3002'

const groups = [
  { id: 'all', name: '全部' },
  { id: 'mingli', name: '命理' },
  { id: 'oracle', name: '占问' },
  { id: 'relation', name: '关系' },
  { id: 'space', name: '风水' },
  { id: 'western', name: '西式' },
]

const skills = [
  { id: 'bazi', group: 'mingli', icon: '命', name: '四柱八字', short: '八字', path: '/divine/bazi', added: false, sources: ['bazi-skill', 'horosa'], description: '出生年月日时、五行结构、流年关注与阶段复盘。' },
  { id: 'ziwei', group: 'mingli', icon: '紫', name: '紫微斗数', short: '紫微', path: '/divine/ziwei', added: true, sources: ['Numerologist', 'mingyu', 'ZhouYiLab'], description: '命宫、身宫、十二宫位、主星结构与人生领域分析。' },
  { id: 'qimen', group: 'oracle', icon: '门', name: '奇门遁甲', short: '奇门', path: '/divine/qimen', added: false, sources: ['Numerologist', 'mingyu', 'ZhouYiLab'], description: '用时间、地点、事件类型观察时机、方位和行动策略。' },
  { id: 'liuyao-ai', group: 'oracle', icon: '爻', name: '六爻解卦', short: '六爻', path: '/divine/liuyao', added: true, sources: ['taibu', 'mingyu', 'ZhouYiLab'], description: '围绕用神、世应、动爻和变卦生成结构化判断。' },
  { id: 'meihua', group: 'oracle', icon: '梅', name: '梅花易数', short: '梅花', path: '/divine/meihua', added: true, sources: ['meihua-yishu', 'meihua-divination'], description: '按时间、数字、外应起卦，观察体用生克与趋势。' },
  { id: 'daliuren', group: 'oracle', icon: '壬', name: '大六壬', short: '六壬', path: '/divine/daliuren', added: true, sources: ['mingyu', 'ZhouYiLab'], description: '以课传、神将、三传四课整理复杂事件脉络。' },
  { id: 'xiaoliuren', group: 'oracle', icon: '速', name: '小六壬', short: '小六壬', path: '/divine/xiaoliuren', added: true, sources: ['cyber-fortune', 'taibu'], description: '适合快速问事，输出大安、留连、速喜等轻量判断。' },
  { id: 'yinyuan', group: 'relation', icon: '缘', name: '姻缘测算', short: '姻缘', path: '/divine/yinyuan', added: false, sources: ['yinyuan-skills'], description: '关系状态、相处模式、桃花趋势与行动建议。' },
  { id: 'hehun', group: 'relation', icon: '合', name: '合婚配对', short: '合婚', path: '/divine/hehun', added: true, sources: ['yinyuan-skills', 'mingyu'], description: '生肖、生日、关系阶段与长期相处风险提示。' },
  { id: 'fojiao', group: 'relation', icon: '禅', name: '佛学开示', short: '开示', path: '/divine/fojiao', added: false, sources: ['Master-skill'], description: '以典籍和心性观照整理困惑、执着与日常练习。' },
  { id: 'fengshui', group: 'space', icon: '宅', name: '风水阳宅', short: '风水', path: '/divine/fengshui', added: true, sources: ['fengshui.skill'], description: '户型、朝向、办公桌、卧室和动线的趣味分析。' },
  { id: 'daily-fortune', group: 'oracle', icon: '运', name: '每日运势', short: '运势', path: '/divine/daily-fortune', added: true, sources: ['cyber-fortune'], description: '轻量日运、桌面风水、今日行动提醒和情绪节奏。' },
  { id: 'tarot', group: 'western', icon: '塔', name: '塔罗牌阵', short: '塔罗', path: '/divine/tarot', added: true, sources: ['tarot-skill'], description: '单牌、三牌和选择牌阵，适合纠结选择时多角度思考。' },
]

const tools = [
  { id: 'zhouyi', path: '/zhouyi', icon: '卦', name: '周易起卦', description: '静心、默念、投钱、六爻、卷轴解卦。' },
  { id: 'huangli', path: '/tools/huangli', icon: '历', name: '今日黄历', description: '宜忌、吉时、方位与今日提醒。' },
  { id: 'lingqian', path: '/tools/lingqian', icon: '签', name: '灵签占问', description: '写下所问之事，抽签查看签文。' },
  { id: 'jiemeng', path: '/tools/jiemeng', icon: '梦', name: '梦境解析', description: '记录梦境、情绪和现实背景。' },
  { id: 'qiming', path: '/tools/qiming', icon: '名', name: '宝宝起名', description: '按姓氏、生日和偏好生成方向。' },
  { id: 'xianghuo', path: '/tools/xianghuo', icon: '香', name: '祈福上香', description: '本页生成心愿回响，不保存个人愿望。' },
]

const visibleSkills = computed(() => activeGroup.value === 'all' ? skills : skills.filter((item) => item.group === activeGroup.value))
const coverage = computed(() => ({ added: skills.filter((item) => item.added).length }))
const railSkills = computed(() => skills.filter((item) => ['bazi', 'ziwei', 'qimen', 'liuyao-ai', 'meihua', 'daliuren', 'xiaoliuren', 'fengshui', 'hehun', 'daily-fortune'].includes(item.id)))
const featuredSkills = computed(() => skills.filter((item) => ['liuyao-ai', 'qimen', 'meihua', 'ziwei'].includes(item.id)))
const quickTools = computed(() => [
  { id: 'zhouyi', path: '/zhouyi', icon: '卦', name: '起卦占问' },
  { id: 'huangli', path: '/tools/huangli', icon: '历', name: '择吉日课' },
  { id: 'bazi', path: '/divine/bazi', icon: '命', name: '八字排盘' },
  { id: 'fengshui', path: '/divine/fengshui', icon: '宅', name: '风水布局' },
])
const functionGroups = [
  { id: 'all', name: '全部' },
  { id: 'core', name: 'AI推荐' },
  { id: 'mingli', name: '命理解析' },
  { id: 'oracle', name: '占卜预测' },
  { id: 'life', name: '生活辅助' },
]
const functionSections = computed(() => [
  {
    id: 'core',
    name: '核心问卦',
    items: [
      { ...skills.find((item) => item.id === 'liuyao-ai'), badge: '热门' },
      { ...skills.find((item) => item.id === 'qimen'), badge: 'AI推荐' },
      { id: 'lingqian', icon: '签', name: '灵签占问', path: '/tools/lingqian', description: '抽签问事，指点迷津。', badge: '热门' },
      { ...skills.find((item) => item.id === 'meihua'), badge: 'AI推荐' },
    ].filter(Boolean),
  },
  {
    id: 'mingli',
    name: '命理分析',
    items: [
      { ...skills.find((item) => item.id === 'bazi'), badge: 'AI推荐' },
      { ...skills.find((item) => item.id === 'ziwei'), badge: '热门' },
      { ...skills.find((item) => item.id === 'daliuren'), badge: 'AI推荐' },
      { ...skills.find((item) => item.id === 'xiaoliuren'), badge: '热门' },
    ].filter(Boolean),
  },
  {
    id: 'life',
    name: '生活工具',
    items: [
      { id: 'huangli', icon: '历', name: '今日黄历', path: '/tools/huangli', description: '宜忌择日，趋吉避凶。', badge: '每日必看' },
      { id: 'qiming', icon: '名', name: '宝宝起名', path: '/tools/qiming', description: '五行八字，吉祥好名。', badge: 'AI推荐' },
      { ...skills.find((item) => item.id === 'hehun'), badge: '热门' },
      { id: 'jiemeng', icon: '梦', name: '梦境解析', path: '/tools/jiemeng', description: '解析梦境，指引方向。', badge: 'AI推荐' },
      { id: 'xianghuo', icon: '香', name: '祈福上香', path: '/tools/xianghuo', description: '在线祈福，心诚则灵。', badge: '安心祈福' },
    ].filter(Boolean),
  },
])
const visibleFunctionSections = computed(() => {
  const keyword = toolSearch.value.trim().toLowerCase()
  return functionSections.value
    .filter((section) => activeFunctionGroup.value === 'all' || section.id === activeFunctionGroup.value)
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !keyword || `${item.name}${item.description}`.toLowerCase().includes(keyword)),
    }))
    .filter((section) => section.items.length)
})

function go(path) {
  router.push(path)
}

function startMobileAsk() {
  router.push({
    path: '/zhouyi',
    query: mobileQuestion.value ? { question: mobileQuestion.value } : {},
  })
}
</script>

<style scoped>
.home-page {
  padding-bottom: 28px;
}

.home-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 28px;
  align-items: center;
  background:
    linear-gradient(90deg, rgba(13, 9, 7, 0.84), rgba(13, 9, 7, 0.28)),
    radial-gradient(circle at 78% 54%, rgba(215, 179, 95, 0.22), transparent 32%),
    linear-gradient(145deg, rgba(255, 247, 231, 0.08), transparent);
}

.home-hero::before {
  position: absolute;
  right: 20px;
  bottom: 18px;
  width: 42%;
  height: 46%;
  pointer-events: none;
  content: "";
  background: radial-gradient(ellipse, rgba(184, 58, 47, 0.18), transparent 68%);
  filter: blur(10px);
}

.hero-copy h1 {
  max-width: 860px;
  margin: 18px 0 0;
  font-family: var(--font-display);
  font-size: clamp(54px, 9vw, 110px);
  font-weight: 400;
  line-height: 0.98;
}

.hero-copy p {
  max-width: 760px;
  margin: 24px 0 0;
  color: var(--paper-dim);
  font-size: clamp(16px, 1.7vw, 20px);
}

.hero-actions,
.source-row,
.skill-rail {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hero-actions {
  margin-top: 28px;
}

.hero-plate {
  position: relative;
  display: grid;
  min-height: 300px;
  place-items: center;
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(215, 179, 95, 0.16), transparent 58%),
    rgba(34, 21, 14, 0.7);
}

.function-center {
  display: grid;
  min-height: auto;
  gap: 18px;
  padding: 28px;
}

.function-hero-copy h2 {
  margin: 8px 0 0;
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: clamp(42px, 6vw, 68px);
  font-weight: 400;
  line-height: 1;
}

.function-hero-copy p {
  max-width: 720px;
  color: var(--paper-dim);
}

.function-search-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.function-search {
  position: relative;
  width: min(360px, 100%);
}

.function-search input {
  width: 100%;
  min-height: 44px;
  padding: 10px 44px 10px 14px;
  border: 1px solid rgba(215, 179, 95, 0.24);
  border-radius: var(--radius-xs);
  color: var(--paper);
  background: rgba(13, 9, 7, 0.48);
}

.function-search span {
  position: absolute;
  top: 50%;
  right: 14px;
  color: var(--gold-bright);
  transform: translateY(-50%);
}

.function-search-row button {
  min-height: 40px;
  padding: 8px 16px;
  border: 1px solid rgba(215, 179, 95, 0.18);
  border-radius: 999px;
  color: var(--paper-dim);
  background: rgba(255, 247, 231, 0.04);
}

.function-search-row button.active,
.function-search-row button:hover {
  border-color: rgba(240, 217, 132, 0.46);
  color: var(--gold-bright);
  background: rgba(184, 58, 47, 0.22);
}

.function-section {
  display: grid;
  gap: 12px;
}

.function-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.function-section-head h3 {
  margin: 0;
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 400;
}

.function-section-head button {
  border: 0;
  color: var(--paper-dim);
  background: transparent;
}

.function-card-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.function-card {
  display: grid;
  grid-template-columns: 70px minmax(0, 1fr);
  gap: 12px;
  min-height: 148px;
  padding: 16px;
  border: 1px solid rgba(215, 179, 95, 0.16);
  border-radius: var(--radius-xs);
  background: rgba(255, 247, 231, 0.045);
}

.function-icon {
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  border: 1px solid rgba(215, 179, 95, 0.36);
  border-radius: 50%;
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 28px;
}

.function-card strong {
  color: var(--paper);
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 400;
}

.function-card p {
  margin: 4px 0 0;
  color: var(--paper-dim);
  font-size: 13px;
}

.function-card em {
  grid-column: 2;
  width: fit-content;
  padding: 2px 8px;
  border-radius: 999px;
  color: #ffb0a5;
  background: rgba(184, 58, 47, 0.22);
  font-size: 12px;
  font-style: normal;
}

.function-card > button {
  grid-column: 1 / -1;
  min-height: 34px;
  border: 1px solid rgba(215, 179, 95, 0.18);
  border-radius: var(--radius-xs);
  color: var(--gold-bright);
  background: rgba(215, 179, 95, 0.08);
}

.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.card-title-row button {
  border: 0;
  color: var(--paper-dim);
  background: transparent;
}

.today-card > strong {
  display: block;
  margin: 8px 0;
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 400;
}

.today-card p,
.quote-card p {
  color: var(--paper-dim);
}

.mini-metrics,
.hex-tags {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 18px;
}

.mini-metrics span,
.hex-tags span {
  padding: 8px;
  border: 1px solid rgba(215, 179, 95, 0.14);
  border-radius: var(--radius-xs);
  color: rgba(245, 234, 212, 0.72);
  background: rgba(0, 0, 0, 0.12);
  font-size: 12px;
}

.recommend-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.recommend-row button {
  display: grid;
  min-height: 150px;
  place-items: center;
  gap: 8px;
  padding: 14px;
  border: 1px solid rgba(215, 179, 95, 0.18);
  border-radius: var(--radius-xs);
  color: var(--paper);
  background: rgba(255, 247, 231, 0.04);
}

.recommend-row i {
  display: grid;
  width: 56px;
  height: 56px;
  place-items: center;
  border: 1px solid rgba(215, 179, 95, 0.35);
  border-radius: 50%;
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 28px;
  font-style: normal;
}

.recommend-row strong {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 400;
}

.recommend-row span {
  color: rgba(245, 234, 212, 0.56);
  font-size: 12px;
}

.tool-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.today-hex {
  color: var(--gold-bright);
  font-size: 72px;
  line-height: 1;
}

.bagua-orbit {
  position: absolute;
  width: 340px;
  height: 340px;
  border: 1px solid rgba(215, 179, 95, 0.34);
  border-radius: 50%;
  animation: slow-rotate 48s linear infinite;
}

.bagua-orbit::before,
.bagua-orbit::after {
  position: absolute;
  inset: 38px;
  border: 1px solid rgba(215, 179, 95, 0.16);
  border-radius: 50%;
  content: "";
}

.bagua-orbit::after {
  inset: 84px;
}

.bagua-orbit span {
  position: absolute;
  top: 14px;
  left: 50%;
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 28px;
}

.bagua-orbit span:nth-child(1) { transform: rotate(0deg) translate(-50%, 0); }
.bagua-orbit span:nth-child(2) { transform: rotate(45deg) translate(118px, 12px) rotate(-45deg); }
.bagua-orbit span:nth-child(3) { transform: rotate(90deg) translate(150px, 132px) rotate(-90deg); }
.bagua-orbit span:nth-child(4) { transform: rotate(135deg) translate(112px, 250px) rotate(-135deg); }
.bagua-orbit span:nth-child(5) { transform: rotate(180deg) translate(0, 292px) rotate(-180deg); }
.bagua-orbit span:nth-child(6) { transform: rotate(225deg) translate(-126px, 250px) rotate(-225deg); }
.bagua-orbit span:nth-child(7) { transform: rotate(270deg) translate(-154px, 132px) rotate(-270deg); }
.bagua-orbit span:nth-child(8) { transform: rotate(315deg) translate(-118px, 12px) rotate(-315deg); }

.plate-center {
  position: relative;
  z-index: 2;
  display: grid;
  width: 184px;
  height: 184px;
  place-items: center;
  align-content: center;
  border: 1px solid var(--line-strong);
  border-radius: 50%;
  background: rgba(13, 9, 7, 0.64);
  text-align: center;
}

.plate-center span,
.plate-center em {
  color: rgba(245, 234, 212, 0.6);
  font-style: normal;
}

.plate-center strong {
  color: var(--gold-bright);
  font-size: 30px;
}

.section-block,
.boundary-section {
  position: relative;
  z-index: 1;
  padding-top: 54px;
}

.section-head {
  margin-bottom: 22px;
}

.split-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 18px;
  align-items: end;
}

.coverage-card {
  padding: 18px;
}

.coverage-card > * {
  position: relative;
  z-index: 1;
  display: block;
}

.coverage-card strong {
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 400;
}

.coverage-card span {
  color: var(--paper-dim);
}

.skill-rail {
  margin-bottom: 16px;
}

.skill-rail button {
  min-height: 36px;
  padding: 7px 14px;
  border: 1px solid rgba(215, 179, 95, 0.18);
  border-radius: 999px;
  color: var(--paper-dim);
  background: rgba(255, 247, 231, 0.05);
}

.skill-rail button.active,
.skill-rail button:hover {
  color: var(--gold-bright);
  border-color: rgba(240, 217, 132, 0.48);
}

.skill-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.skill-card,
.tool-card,
.boundary-section article {
  position: relative;
  z-index: 1;
}

.skill-card {
  display: grid;
  min-height: 304px;
  align-content: start;
  gap: 12px;
  padding: 18px;
  transition: transform 180ms ease, border-color 180ms ease;
}

.skill-card:hover,
.tool-card:hover {
  transform: translateY(-3px);
  border-color: rgba(240, 217, 132, 0.56);
}

.skill-card > *,
.tool-card > *,
.boundary-section article > * {
  position: relative;
  z-index: 1;
}

.skill-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.skill-card h3 {
  margin: 2px 0 0;
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 400;
}

.skill-card p,
.tool-card p,
.boundary-section p {
  margin: 0;
  color: var(--paper-dim);
}

.source-row span {
  padding: 2px 8px;
  border: 1px solid rgba(215, 179, 95, 0.15);
  border-radius: 999px;
  color: rgba(245, 234, 212, 0.62);
  font-size: 11px;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.tool-card {
  display: flex;
  gap: 14px;
  min-height: 128px;
  align-items: flex-start;
  padding: 18px;
  transition: transform 180ms ease, border-color 180ms ease;
}

.tool-card > span {
  display: grid;
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid var(--line-strong);
  border-radius: 50%;
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 24px;
}

.tool-card strong,
.boundary-section h2 {
  display: block;
  margin: 0 0 6px;
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 400;
}

.boundary-section article {
  padding: 24px;
}

.mobile-quick-ask {
  display: none;
}

@media (max-width: 1100px) {
  .skill-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .function-card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 980px) {
  .hero,
  .split-head {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .hero-plate {
    min-height: 360px;
    border-radius: var(--radius-lg);
  }

  .skill-grid,
  .tool-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .page-nav > .ds-button {
    display: none;
  }

  .hero {
    padding-top: 38px;
  }

  .hero-copy h1 {
    font-size: clamp(44px, 15vw, 68px);
  }

  .hero-plate {
    min-height: 300px;
  }

  .bagua-orbit {
    width: 250px;
    height: 250px;
  }

  .plate-center {
    width: 146px;
    height: 146px;
  }

  .skill-grid,
  .tool-grid,
  .function-card-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .home-page {
    padding-inline: 14px;
  }

  .home-hero {
    display: grid;
    grid-template-columns: 1fr;
    min-height: auto;
    padding: 20px 18px;
  }

  .hero-copy {
    width: 100%;
    min-width: 0;
  }

  .home-hero h1,
  .hero-copy h1 {
    margin: 6px 0 8px;
    color: var(--mobile-text);
    font-size: clamp(28px, 9vw, 38px);
    line-height: 1.18;
  }

  .home-hero p,
  .hero-copy p {
    max-width: none;
    color: var(--mobile-muted);
    font-size: 15px;
    line-height: 1.65;
  }

  .hero-actions,
  .function-actions {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    width: 100%;
  }

  .hero-actions .ds-button,
  .function-actions .ds-button {
    width: 100%;
  }

  .mobile-quick-ask {
    display: grid;
    gap: 10px;
    margin-top: 14px;
    padding: 14px;
    border: 1px solid var(--mobile-border);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.58);
  }

  .mobile-quick-ask label {
    display: grid;
    gap: 8px;
  }

  .mobile-quick-ask span {
    color: var(--mobile-primary-dark);
    font-size: 14px;
    font-weight: 700;
  }

  .mobile-quick-ask textarea {
    width: 100%;
    min-height: 118px;
    border-radius: 14px;
    font-size: 16px;
  }

  .mobile-quick-ask .ds-button {
    width: 100%;
  }

  .mobile-quick-ask small {
    color: var(--mobile-muted);
    font-size: 12px;
    line-height: 1.55;
  }

  .home-hero .hero-visual,
  .hero-plate {
    min-height: 220px;
    margin-top: 8px;
    border-radius: 18px;
  }

  .bagua-orbit {
    width: min(238px, 72vw);
    height: min(238px, 72vw);
  }

  .plate-center {
    width: min(138px, 42vw);
    height: min(138px, 42vw);
  }

  .function-center,
  .boundary-section {
    padding: 18px;
  }

  .skill-grid,
  .tool-grid,
  .function-card-grid {
    gap: 12px;
  }

  .function-card,
  .skill-card,
  .tool-card {
    min-height: auto;
    padding: 16px;
    border-radius: 18px;
  }

  .tool-card {
    align-items: center;
  }

  .tool-card strong,
  .boundary-section h2 {
    color: var(--mobile-text);
    font-size: 20px;
  }

  .tool-card p,
  .function-card p,
  .skill-card p {
    color: var(--mobile-muted);
    font-size: 14px;
    line-height: 1.6;
  }
}
</style>
