<template>
  <main class="home-page">
    <header class="site-nav app-shell">
      <a class="brand" href="#top" aria-label="乾坤之道首页">
        <span class="taiji-mark small" aria-hidden="true"></span>
        <span>乾坤之道</span>
      </a>
      <nav class="nav-links" aria-label="主导航">
        <a href="#services">测算</a>
        <a href="#system">系统</a>
        <a href="#components">组件</a>
      </nav>
      <button class="ds-button ghost nav-action" type="button" @click="goDivine('bazi')">开始问卦</button>
    </header>

    <section id="top" class="hero app-shell">
      <div class="hero-copy">
        <span class="section-kicker">复古科技命理平台</span>
        <h1>乾坤之道</h1>
        <p class="hero-subtitle">以东方术数为骨，以现代界面为形，为八字、姻缘、佛学、奇门构建清爽可信的 AI 测算体验。</p>
        <div class="hero-actions">
          <button class="ds-button primary" type="button" @click="goDivine('bazi')">立即测算</button>
          <a class="ds-button" href="#system">查看设计系统</a>
        </div>
        <div class="hero-tags" aria-label="风格关键词">
          <span class="ds-badge gold">复古宣纸</span>
          <span class="ds-badge green">玉青自然</span>
          <span class="ds-badge red">朱砂能量</span>
          <span class="ds-badge">科技网格</span>
        </div>
      </div>

      <div class="hero-visual ds-card" aria-label="乾坤视觉概念">
        <span class="tech-ring ring-a"></span>
        <span class="tech-ring ring-b"></span>
        <div class="hero-orbit">
          <span class="taiji-mark"></span>
          <span class="orbit-dot dot-a"></span>
          <span class="orbit-dot dot-b"></span>
          <span class="orbit-dot dot-c"></span>
        </div>
        <div class="hero-panel">
          <p>今日趋势</p>
          <strong>86</strong>
          <span>心性清明，宜定方向</span>
        </div>
        <div class="mountain-wash"></div>
      </div>
    </section>

    <section id="services" class="app-shell service-section">
      <div class="section-head">
        <div>
          <span class="section-kicker">Web UI</span>
          <h2 class="section-title">真实测算入口</h2>
          <p class="section-copy">四个模块使用同一套视觉语言：边界克制、信息清楚、状态明确，既有传统符号，也有数据化秩序。</p>
        </div>
        <div v-if="!backendOk" class="offline ds-card">
          <strong>离线预览</strong>
          <span>后端未连接，页面和交互仍可本地审查。</span>
        </div>
      </div>

      <div class="service-grid">
        <article
          v-for="skill in skills"
          :key="skill.id"
          class="service-card ds-card"
          :class="`tone-${skill.tone}`"
          @click="goDivine(skill.id)"
        >
          <div class="service-top">
            <span class="service-icon" aria-hidden="true">{{ skill.icon }}</span>
            <span class="ds-badge">{{ skill.badge }}</span>
          </div>
          <h3>{{ skill.name }}</h3>
          <p>{{ skill.description }}</p>
          <button class="ds-button ghost" type="button">进入{{ skill.shortName }}</button>
        </article>
      </div>
    </section>

    <section id="system" class="app-shell system-section">
      <span class="section-kicker">Design System</span>
      <h2 class="section-title">复古 + 科技 + 青春 + 自然</h2>
      <p class="section-copy">这套系统把“乾坤、山水、星轨、网格、光粒”拆成可落地的 tokens 和组件，适合继续扩展到运营页、会员页、报告页和移动端小程序。</p>

      <div class="system-grid">
        <article class="palette-panel ds-card">
          <h3>色彩系统</h3>
          <div class="swatches">
            <div v-for="color in colors" :key="color.name" class="swatch">
              <span :style="{ background: color.hex }"></span>
              <strong>{{ color.name }}</strong>
              <em>{{ color.hex }}</em>
            </div>
          </div>
        </article>

        <article class="type-panel ds-card">
          <h3>字体层级</h3>
          <div class="type-row display">乾坤之道</div>
          <div class="type-row h1">洞察天机，趋吉避凶</div>
          <div class="type-row h2">四柱八字 · 精准解析</div>
          <div class="type-row body">正文用于报告解释、问卦记录、控件说明，保持舒展易读。</div>
          <div class="type-row caption">Caption / 状态、日期、标签、辅助信息</div>
        </article>

        <article class="motif-panel ds-card">
          <h3>图形语言</h3>
          <div class="motifs">
            <span>太极</span>
            <span>八卦</span>
            <span>星轨</span>
            <span>山水</span>
            <span>竹影</span>
            <span>网格</span>
            <span>光粒</span>
            <span>云纹</span>
          </div>
        </article>
      </div>
    </section>

    <section id="components" class="app-shell components-section">
      <span class="section-kicker">Components</span>
      <h2 class="section-title">卡片、控件、按钮和状态</h2>

      <div class="component-layout">
        <article class="phone-frame">
          <div class="phone-screen">
            <div class="phone-bar">
              <strong>乾坤之道</strong>
              <span>今日</span>
            </div>
            <div class="phone-hero">
              <span class="taiji-mark small"></span>
              <div>
                <strong>今日运势</strong>
                <p>宜整理计划，忌急躁决断</p>
              </div>
            </div>
            <div class="phone-icons">
              <button v-for="skill in skills" :key="skill.id" type="button">{{ skill.icon }}</button>
            </div>
            <div class="phone-list">
              <div v-for="skill in skills.slice(0, 3)" :key="skill.id">
                <span>{{ skill.name }}</span>
                <em>{{ skill.badge }}</em>
              </div>
            </div>
          </div>
        </article>

        <div class="component-stack">
          <article class="cards-demo">
            <div class="mini-card ds-card">
              <span class="ds-badge red">文章卡片</span>
              <strong>如何通过八字改善运势？</strong>
              <p>适合知识内容、运营专题、报告引导。</p>
            </div>
            <div class="mini-card ds-card stat">
              <span>今日趋势</span>
              <strong>86</strong>
              <p>整体运势良好，把握机会。</p>
            </div>
            <div class="mini-card ds-card gold-card">
              <span>年度报告</span>
              <strong>2026</strong>
              <button class="ds-button gold" type="button">立即查看</button>
            </div>
          </article>

          <article class="control-demo ds-card">
            <h3>表单控件</h3>
            <div class="control-grid">
              <div class="ds-field">
                <label for="demo-name">姓名</label>
                <input id="demo-name" placeholder="请输入姓名" />
              </div>
              <div class="ds-field">
                <label for="demo-date">出生日期</label>
                <input id="demo-date" type="date" />
              </div>
              <div class="ds-field">
                <label for="demo-type">测算类型</label>
                <select id="demo-type">
                  <option>四柱八字</option>
                  <option>姻缘测算</option>
                  <option>奇门遁甲</option>
                </select>
              </div>
            </div>
            <div class="button-row">
              <button class="ds-button primary" type="button">主要按钮</button>
              <button class="ds-button" type="button">次要按钮</button>
              <button class="ds-button ghost" type="button">幽灵按钮</button>
              <button class="ds-button icon" type="button" aria-label="收藏">♡</button>
            </div>
            <div class="states-row">
              <span class="ds-badge green">成功</span>
              <span class="ds-badge gold">处理中</span>
              <span class="ds-badge red">需注意</span>
              <span class="ds-badge">空状态</span>
            </div>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchSkills, isBackendAvailable } from '../api/divine'

const router = useRouter()
const backendOk = ref(true)
const apiSkills = ref([])

const fallbackSkills = [
  { id: 'bazi', name: '四柱八字', shortName: '八字', description: '排出四柱命盘，分析性格、事业、财运与流年节奏。', icon: '乾', badge: '命理核心', tone: 'blue' },
  { id: 'yinyuan', name: '姻缘测算', shortName: '姻缘', description: '合盘、桃花、关系节奏与情感问题的温和解读。', icon: '缘', badge: '关系洞察', tone: 'red' },
  { id: 'fojiao', name: '佛学开示', shortName: '开示', description: '以经典智慧回应困惑，强调正念、慈悲与行动。', icon: '悟', badge: '心性指引', tone: 'gold' },
  { id: 'qimen', name: '奇门遁甲', shortName: '奇门', description: '按时局排盘，辅助判断方位、时机与行动策略。', icon: '门', badge: '时空决策', tone: 'green' },
]

const toneById = {
  bazi: 'blue',
  yinyuan: 'red',
  fojiao: 'gold',
  qimen: 'green',
}

const skills = computed(() => {
  if (!apiSkills.value.length) return fallbackSkills
  return apiSkills.value.map((skill) => ({
    ...skill,
    shortName: fallbackSkills.find((item) => item.id === skill.id)?.shortName || skill.name,
    icon: fallbackSkills.find((item) => item.id === skill.id)?.icon || skill.icon || '道',
    badge: fallbackSkills.find((item) => item.id === skill.id)?.badge || 'AI 测算',
    tone: toneById[skill.id] || 'blue',
  }))
})

const colors = [
  { name: '暖白', hex: '#FBF6EF' },
  { name: '宣纸米', hex: '#F3E9D5' },
  { name: '墨黑', hex: '#1D1D1F' },
  { name: '朱砂红', hex: '#C83A2E' },
  { name: '玉青绿', hex: '#2E8C7A' },
  { name: '鎏金', hex: '#D4AF37' },
  { name: '云水蓝', hex: '#7BB7C6' },
  { name: '珊瑚橙', hex: '#FF8A65' },
]

onMounted(async () => {
  try {
    const data = await fetchSkills()
    apiSkills.value = data.skills || []
    backendOk.value = isBackendAvailable() !== false
  } catch {
    backendOk.value = false
    apiSkills.value = []
  }
})

function goDivine(skillId) {
  router.push(`/divine/${skillId}`)
}
</script>

<style scoped>
.home-page {
  padding: 18px 0 76px;
}

.site-nav {
  position: sticky;
  top: 12px;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  min-height: 64px;
  padding: 10px 14px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: rgba(251, 246, 239, 0.82);
  box-shadow: 0 14px 40px rgba(63, 45, 23, 0.08);
  backdrop-filter: blur(18px);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display);
  font-size: 22px;
}

.nav-links {
  display: flex;
  gap: 24px;
  color: var(--ink-soft);
  font-size: 14px;
}

.nav-links a:hover {
  color: var(--seal);
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.95fr);
  gap: 36px;
  align-items: center;
  min-height: calc(100vh - 100px);
  padding: 54px 0 46px;
}

.hero-copy h1 {
  margin: 16px 0 0;
  font-family: var(--font-display);
  font-size: clamp(58px, 9vw, 116px);
  font-weight: 400;
  line-height: 0.98;
  letter-spacing: 0;
}

.hero-subtitle {
  max-width: 650px;
  margin: 22px 0 0;
  color: var(--ink-soft);
  font-size: clamp(16px, 1.6vw, 20px);
}

.hero-actions,
.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

.hero-visual {
  min-height: 500px;
  display: grid;
  place-items: center;
  isolation: isolate;
}

.hero-visual::after {
  position: absolute;
  inset: 48px;
  z-index: 0;
  content: "";
  border: 1px solid rgba(212, 175, 55, 0.22);
  border-radius: 50%;
  background:
    conic-gradient(from 90deg, transparent 0 20deg, rgba(212, 175, 55, 0.18) 22deg 24deg, transparent 26deg 360deg),
    radial-gradient(circle, transparent 0 56%, rgba(46, 140, 122, 0.08) 57%, transparent 58%);
}

.hero-orbit {
  position: relative;
  z-index: 2;
  display: grid;
  width: 210px;
  height: 210px;
  place-items: center;
  border: 1px dashed rgba(168, 111, 25, 0.34);
  border-radius: 50%;
  animation: rotate-slow 34s linear infinite;
}

.hero-orbit .taiji-mark {
  animation: rotate-slow 34s linear reverse infinite;
}

.ring-a {
  width: 72%;
  height: 72%;
}

.ring-b {
  width: 48%;
  height: 48%;
  border-style: dashed;
}

.orbit-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--gold);
  box-shadow: 0 0 18px var(--glow-gold);
}

.dot-a {
  top: 12px;
}

.dot-b {
  right: 18px;
  bottom: 42px;
  background: var(--jade);
}

.dot-c {
  left: 24px;
  bottom: 30px;
  background: var(--seal);
}

.hero-panel {
  position: absolute;
  right: 28px;
  bottom: 28px;
  z-index: 3;
  width: 160px;
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: rgba(255, 250, 242, 0.78);
}

.hero-panel p,
.hero-panel span {
  margin: 0;
  color: var(--ink-soft);
  font-size: 12px;
}

.hero-panel strong {
  display: block;
  margin: 4px 0;
  font-size: 48px;
  line-height: 1;
}

.section-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 22px;
  margin-bottom: 24px;
}

.offline {
  z-index: 1;
  display: grid;
  min-width: 260px;
  gap: 4px;
  padding: 14px 16px;
}

.offline strong,
.offline span {
  position: relative;
  z-index: 1;
}

.offline span {
  color: var(--ink-soft);
  font-size: 13px;
}

.service-section,
.system-section,
.components-section {
  padding: 72px 0 0;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.service-card {
  z-index: 1;
  display: grid;
  min-height: 244px;
  gap: 12px;
  align-content: start;
  padding: 20px;
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.service-card > * {
  position: relative;
  z-index: 1;
}

.service-card:hover {
  transform: translateY(-4px);
  border-color: rgba(168, 111, 25, 0.44);
  box-shadow: var(--shadow-soft);
}

.service-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.service-icon {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 50%;
  font-family: var(--font-display);
  font-size: 22px;
}

.service-card h3 {
  margin: 6px 0 0;
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 400;
}

.service-card p {
  margin: 0;
  color: var(--ink-soft);
  font-size: 14px;
}

.tone-red .service-icon {
  color: var(--seal);
}

.tone-gold .service-icon {
  color: var(--gold-deep);
}

.tone-green .service-icon {
  color: var(--jade);
}

.tone-blue .service-icon {
  color: var(--blue);
}

.system-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.95fr;
  gap: 16px;
  margin-top: 26px;
}

.palette-panel,
.type-panel,
.motif-panel,
.control-demo {
  z-index: 1;
  padding: 22px;
}

.system-grid h3,
.control-demo h3 {
  position: relative;
  z-index: 1;
  margin: 0 0 16px;
  font-size: 18px;
}

.swatches {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.swatch {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.swatch span {
  width: 100%;
  aspect-ratio: 1;
  border: 1px solid var(--line);
  border-radius: 50%;
  box-shadow: inset 0 0 0 6px rgba(255, 255, 255, 0.2);
}

.swatch strong {
  font-size: 13px;
}

.swatch em {
  color: var(--ink-soft);
  font-size: 11px;
  font-style: normal;
}

.type-panel {
  display: grid;
  align-content: start;
  gap: 12px;
}

.type-row {
  position: relative;
  z-index: 1;
  border-bottom: 1px solid var(--line);
  padding-bottom: 8px;
}

.type-row.display {
  font-family: var(--font-display);
  font-size: 46px;
}

.type-row.h1 {
  font-size: 24px;
  font-weight: 700;
}

.type-row.h2 {
  font-size: 18px;
  font-weight: 600;
}

.type-row.body,
.type-row.caption {
  color: var(--ink-soft);
}

.type-row.caption {
  font-size: 12px;
}

.motif-panel {
  grid-column: 1 / -1;
}

.motifs {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 12px;
}

.motifs span {
  display: grid;
  min-height: 76px;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 50%;
  color: var(--ink-soft);
  background:
    radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.15), transparent 38%),
    rgba(255, 250, 242, 0.46);
  font-size: 13px;
}

.component-layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 20px;
  margin-top: 26px;
}

.phone-frame {
  padding: 12px;
  border: 8px solid #32281f;
  border-radius: 34px;
  background: #1d1d1f;
  box-shadow: var(--shadow-soft);
}

.phone-screen {
  min-height: 620px;
  padding: 18px 14px;
  border-radius: 24px;
  background:
    radial-gradient(circle at 70% 16%, rgba(212, 175, 55, 0.18), transparent 28%),
    var(--paper);
}

.phone-bar,
.phone-hero,
.phone-icons,
.phone-list div {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.phone-bar {
  margin-bottom: 18px;
  font-size: 13px;
}

.phone-hero {
  gap: 12px;
  align-items: flex-start;
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: rgba(255, 250, 242, 0.76);
}

.phone-hero p {
  margin: 4px 0 0;
  color: var(--ink-soft);
  font-size: 12px;
}

.phone-icons {
  gap: 8px;
  margin: 16px 0;
}

.phone-icons button {
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 50%;
  color: var(--seal);
  background: rgba(255, 255, 255, 0.58);
  font-family: var(--font-display);
}

.phone-list {
  display: grid;
  gap: 10px;
}

.phone-list div {
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: rgba(255, 250, 242, 0.74);
}

.phone-list em {
  color: var(--gold-deep);
  font-size: 11px;
  font-style: normal;
}

.component-stack {
  display: grid;
  gap: 16px;
}

.cards-demo {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.mini-card {
  z-index: 1;
  display: grid;
  min-height: 156px;
  gap: 8px;
  align-content: start;
  padding: 18px;
}

.mini-card > * {
  position: relative;
  z-index: 1;
}

.mini-card strong {
  font-size: 20px;
  line-height: 1.35;
}

.mini-card p {
  margin: 0;
  color: var(--ink-soft);
  font-size: 13px;
}

.mini-card.stat strong {
  font-size: 50px;
  line-height: 1;
}

.gold-card {
  background: linear-gradient(135deg, rgba(255, 250, 242, 0.88), rgba(212, 175, 55, 0.22));
}

.control-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.button-row,
.states-row {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

@keyframes rotate-slow {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 980px) {
  .hero,
  .component-layout,
  .system-grid {
    grid-template-columns: 1fr;
  }

  .hero {
    min-height: auto;
  }

  .service-grid,
  .cards-demo {
    grid-template-columns: repeat(2, 1fr);
  }

  .motifs {
    grid-template-columns: repeat(4, 1fr);
  }

  .phone-frame {
    width: min(320px, 100%);
    margin: 0 auto;
  }
}

@media (max-width: 720px) {
  .site-nav {
    top: 8px;
  }

  .nav-links {
    display: none;
  }

  .nav-action {
    min-height: 36px;
    padding: 8px 12px;
  }

  .hero {
    padding-top: 38px;
  }

  .hero-visual {
    min-height: 360px;
  }

  .section-head {
    display: grid;
  }

  .service-grid,
  .cards-demo,
  .control-grid,
  .swatches {
    grid-template-columns: 1fr;
  }

  .motifs {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
