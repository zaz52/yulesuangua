<template>
  <main class="home-page">
    <header class="site-nav app-shell">
      <a class="brand" href="#top" aria-label="乾坤之道首页">
        <span class="taiji-mark small" aria-hidden="true"></span>
        <span>乾坤之道</span>
      </a>
      <nav class="nav-links" aria-label="主导航">
        <a href="#services">测算</a>
        <a href="#guide">指南</a>
        <a href="#trust">说明</a>
      </nav>
      <button class="ds-button ghost nav-action" type="button" @click="goDivine('bazi')">开始问卦</button>
    </header>

    <section id="top" class="hero app-shell">
      <div class="hero-copy">
        <span class="section-kicker">复古科技命理平台</span>
        <h1>乾坤之道</h1>
        <p class="hero-subtitle">以东方术数为骨，以现代界面为形，为八字、姻缘、佛学、奇门提供清爽可信的 AI 问卦体验。</p>
        <div class="hero-actions">
          <button class="ds-button primary" type="button" @click="goDivine('bazi')">立即测算</button>
          <a class="ds-button" href="#services">选择术法</a>
        </div>
        <div class="hero-tags" aria-label="风格关键词">
          <span class="ds-badge gold">复古宣纸</span>
          <span class="ds-badge green">玉青自然</span>
          <span class="ds-badge red">朱砂能量</span>
          <span class="ds-badge">科技星轨</span>
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
          <span class="section-kicker">AI Divination</span>
          <h2 class="section-title">选择你的测算方式</h2>
          <p class="section-copy">四个入口使用统一视觉语言：边界克制、信息清楚、状态明确，保留传统符号，也有现代数据化秩序。</p>
        </div>
        <div v-if="!backendOk" class="offline ds-card">
          <strong>后端未连接</strong>
          <span>页面可正常预览；真实 AI 推演需要部署后端 API 后启用。</span>
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

    <section id="guide" class="app-shell guide-section">
      <div class="section-head compact">
        <div>
          <span class="section-kicker">Guide</span>
          <h2 class="section-title">问之前，可以这样准备</h2>
        </div>
      </div>
      <div class="guide-grid">
        <article v-for="item in guide" :key="item.title" class="guide-card ds-card">
          <span>{{ item.step }}</span>
          <h3>{{ item.title }}</h3>
          <p>{{ item.copy }}</p>
        </article>
      </div>
    </section>

    <section id="trust" class="app-shell trust-section">
      <div class="trust-grid">
        <article class="trust-card ds-card">
          <span class="section-kicker">Privacy</span>
          <h2>隐私与使用边界</h2>
          <p>页面不会在浏览器之外主动保存你的姓名、生日、地点或问题内容。上线后端后，服务端仅为生成结果处理当次请求，后续如增加记录功能会单独提示。</p>
        </article>
        <article class="trust-card ds-card">
          <span class="section-kicker">Notice</span>
          <h2>理性参考</h2>
          <p>测算结果仅供传统文化娱乐与自我观察参考，不构成医疗、法律、财务、婚恋等现实决策建议。涉及重大事项时，请结合现实信息和专业意见判断。</p>
        </article>
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
  { id: 'bazi', name: '四柱八字', shortName: '八字', description: '适合看个人节奏、性格倾向、事业财运与阶段重点。', icon: '乾', badge: '命理核心', tone: 'blue' },
  { id: 'yinyuan', name: '姻缘测算', shortName: '姻缘', description: '适合梳理关系状态、相处模式、桃花机缘与情感困惑。', icon: '缘', badge: '关系洞察', tone: 'red' },
  { id: 'fojiao', name: '佛学开示', shortName: '开示', description: '适合在焦虑、犹豫、执着时整理心念与行动方向。', icon: '慧', badge: '心性指引', tone: 'gold' },
  { id: 'qimen', name: '奇门遁甲', shortName: '奇门', description: '适合围绕具体事情观察时机、方位、取舍与行动策略。', icon: '门', badge: '时空决策', tone: 'green' },
]

const toneById = {
  bazi: 'blue',
  yinyuan: 'red',
  fojiao: 'gold',
  qimen: 'green',
}

const guide = [
  { step: '01', title: '明确问题', copy: '把问题写成一句具体的话，例如事业变化、关系走向或某个合作是否推进。' },
  { step: '02', title: '补全信息', copy: '八字需要生日和时辰；奇门适合提供时间、地点与所问之事。' },
  { step: '03', title: '理性阅读', copy: '结果用于辅助观察与复盘，不把任何推演当成必须服从的命令。' },
]

const skills = computed(() => {
  if (!apiSkills.value.length) return fallbackSkills
  return apiSkills.value.map((skill) => {
    const fallback = fallbackSkills.find((item) => item.id === skill.id)
    return {
      ...skill,
      shortName: fallback?.shortName || skill.name,
      icon: fallback?.icon || skill.icon || '卦',
      badge: fallback?.badge || 'AI 测算',
      tone: toneById[skill.id] || 'blue',
    }
  })
})

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

.section-head.compact {
  margin-bottom: 16px;
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
.guide-section,
.trust-section {
  padding: 72px 0 0;
}

.service-grid,
.guide-grid,
.trust-grid {
  display: grid;
  gap: 16px;
}

.service-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.guide-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.trust-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.service-card,
.guide-card,
.trust-card {
  z-index: 1;
  display: grid;
  gap: 12px;
  align-content: start;
  padding: 20px;
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.service-card {
  min-height: 244px;
}

.service-card > *,
.guide-card > *,
.trust-card > * {
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

.service-card h3,
.guide-card h3,
.trust-card h2 {
  margin: 6px 0 0;
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 400;
}

.service-card p,
.guide-card p,
.trust-card p {
  margin: 0;
  color: var(--ink-soft);
  font-size: 14px;
}

.guide-card span {
  color: var(--gold-deep);
  font-size: 13px;
  font-weight: 700;
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

@keyframes rotate-slow {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 980px) {
  .hero {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .service-grid,
  .guide-grid,
  .trust-grid {
    grid-template-columns: repeat(2, 1fr);
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
  .guide-grid,
  .trust-grid {
    grid-template-columns: 1fr;
  }
}
</style>
