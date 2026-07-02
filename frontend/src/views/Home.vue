<template>
  <main class="home-page ritual-page">
    <header class="page-nav app-shell">
      <a class="brand" href="/" aria-label="乾坤之道首页">
        <span class="brand-seal">卦</span>
        <span>
          <strong>乾坤之道</strong>
          <em>周易起卦与玄学 Skills</em>
        </span>
      </a>
      <nav class="nav-links" aria-label="主导航">
        <a href="#ritual">起卦</a>
        <a href="#skills">Skills</a>
        <a href="#tools">工具</a>
      </nav>
      <button class="ds-button gold" type="button" @click="go('/zhouyi')">进入起卦</button>
    </header>

    <section id="ritual" class="hero app-shell">
      <div class="hero-copy">
        <span class="section-kicker">Zhouyi Ritual</span>
        <h1>一站式玄学问事台</h1>
        <p>
          在原有周易起卦、八字、姻缘、佛学和奇门基础上，补入紫微斗数、梅花易数、大六壬、小六壬、塔罗、风水阳宅、生肖合婚与每日运势。
        </p>
        <div class="hero-actions">
          <button class="ds-button primary" type="button" @click="go('/zhouyi')">开始周易起卦</button>
          <button class="ds-button ghost" type="button" @click="go('/divine/ziwei')">看紫微斗数</button>
          <button class="ds-button ghost" type="button" @click="go('/divine/fengshui')">测风水布局</button>
        </div>
      </div>

      <div class="hero-plate ds-card">
        <div class="bagua-orbit" aria-hidden="true">
          <span v-for="item in trigrams" :key="item">{{ item }}</span>
        </div>
        <div class="plate-center">
          <span>今日</span>
          <strong>{{ today }}</strong>
          <em>先定问题，再选术法</em>
        </div>
      </div>
    </section>

    <section id="skills" class="app-shell section-block">
      <div class="section-head split-head">
        <div>
          <span class="section-kicker">Skill Matrix</span>
          <h2 class="section-title">玄学 Skills 能力库</h2>
          <p class="section-copy">
            参考你给的 14 个玄学 Skill 项目，把网站重组为“起卦仪式 + 命理排盘 + 关系情感 + 决策占问 + 空间风水 + 西式牌阵”的入口矩阵。
          </p>
        </div>
        <div class="coverage-card ds-card">
          <strong>{{ coverage.added }} 个新增入口</strong>
          <span>已覆盖：紫微、梅花、大六壬、小六壬、塔罗、风水、生肖合婚、每日运势</span>
        </div>
      </div>

      <div class="skill-rail">
        <button
          v-for="group in groups"
          :key="group.id"
          type="button"
          :class="{ active: activeGroup === group.id }"
          @click="activeGroup = group.id"
        >
          {{ group.name }}
        </button>
      </div>

      <div class="skill-grid">
        <article
          v-for="item in visibleSkills"
          :key="item.id"
          class="skill-card ds-card"
          @click="go(item.path)"
        >
          <div class="skill-top">
            <span class="round-mark">{{ item.icon }}</span>
            <span class="ds-badge" :class="item.added ? 'green' : 'gold'">{{ item.added ? '新增' : '已有' }}</span>
          </div>
          <h3>{{ item.name }}</h3>
          <p>{{ item.description }}</p>
          <div class="source-row">
            <span v-for="source in item.sources" :key="source">{{ source }}</span>
          </div>
          <button class="ds-button ghost" type="button">进入{{ item.short }}</button>
        </article>
      </div>
    </section>

    <section id="tools" class="app-shell section-block">
      <div class="section-head">
        <div>
          <span class="section-kicker">Classic Tools</span>
          <h2 class="section-title">轻量工具与仪式入口</h2>
          <p class="section-copy">这些是独立工具页，适合快速记录、抽签、起名或进入完整周易起卦流程。</p>
        </div>
      </div>
      <div class="tool-grid">
        <article v-for="item in tools" :key="item.id" class="tool-card ds-card" @click="go(item.path)">
          <span>{{ item.icon }}</span>
          <div>
            <strong>{{ item.name }}</strong>
            <p>{{ item.description }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="app-shell boundary-section">
      <article class="ds-card">
        <span class="section-kicker">Boundary</span>
        <h2>使用边界</h2>
        <p>
          本站内容用于传统文化体验、娱乐和自我观察，不构成医疗、法律、财务、婚恋等现实决策建议。重要事项请结合现实信息与专业人士意见。
        </p>
      </article>
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
  { id: 'xianghuo', path: '/tools/xianghuo', icon: '香', name: '祈福上香', description: '本地记录心愿和香火次数。' },
]

const visibleSkills = computed(() => activeGroup.value === 'all' ? skills : skills.filter((item) => item.group === activeGroup.value))
const coverage = computed(() => ({ added: skills.filter((item) => item.added).length }))

function go(path) {
  router.push(path)
}
</script>

<style scoped>
.home-page {
  padding: 18px 0 72px;
}

.hero {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 34px;
  align-items: center;
  min-height: 620px;
  padding: 58px 0 24px;
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
  display: grid;
  min-height: 420px;
  place-items: center;
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(215, 179, 95, 0.16), transparent 58%),
    rgba(34, 21, 14, 0.7);
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

@media (max-width: 1100px) {
  .skill-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
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
  .tool-grid {
    grid-template-columns: 1fr;
  }
}
</style>
