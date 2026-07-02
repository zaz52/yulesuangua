<template>
  <main class="home-page">
    <header class="site-nav app-shell">
      <a class="brand" href="#top" aria-label="乾坤之道首页">
        <span class="taiji-mark small" aria-hidden="true"></span>
        <span>乾坤之道</span>
      </a>
      <nav class="nav-links" aria-label="主导航">
        <a href="#services">测算</a>
        <a href="#flow">流程</a>
      </nav>
      <button class="ds-button ghost nav-action" type="button" @click="goDivine('bazi')">开始问卦</button>
    </header>

    <section id="top" class="hero app-shell">
      <div class="hero-copy">
        <span class="section-kicker">复古科技命理平台</span>
        <h1>乾坤之道</h1>
        <p class="hero-subtitle">以东方术数为骨，以现代界面为形，为八字、姻缘、佛学、奇门提供清爽可信的 AI 测算体验。</p>
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
          <span>页面可正常预览；真实 AI 推演需要启动或部署后端服务。</span>
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

    <section id="flow" class="app-shell flow-section">
      <div class="section-head compact">
        <div>
          <span class="section-kicker">Flow</span>
          <h2 class="section-title">三步完成一次问卦</h2>
        </div>
      </div>
      <div class="flow-grid">
        <article v-for="item in flow" :key="item.title" class="flow-card ds-card">
          <span>{{ item.step }}</span>
          <h3>{{ item.title }}</h3>
          <p>{{ item.copy }}</p>
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
  { id: 'bazi', name: '四柱八字', shortName: '八字', description: '排出四柱命盘，分析性格、事业、财运与流年节奏。', icon: '乾', badge: '命理核心', tone: 'blue' },
  { id: 'yinyuan', name: '姻缘测算', shortName: '姻缘', description: '合盘、桃花、关系节奏与情感问题的温和解读。', icon: '缘', badge: '关系洞察', tone: 'red' },
  { id: 'fojiao', name: '佛学开示', shortName: '开示', description: '以经典智慧回应困惑，强调正念、慈悲与行动。', icon: '慧', badge: '心性指引', tone: 'gold' },
  { id: 'qimen', name: '奇门遁甲', shortName: '奇门', description: '按时局排盘，辅助判断方位、时机与行动策略。', icon: '门', badge: '时空决策', tone: 'green' },
]

const toneById = {
  bazi: 'blue',
  yinyuan: 'red',
  fojiao: 'gold',
  qimen: 'green',
}

const flow = [
  { step: '01', title: '选择术法', copy: '根据问题类型进入八字、姻缘、佛学或奇门。' },
  { step: '02', title: '补全信息', copy: '填写生日、时辰、地点或当前问题背景。' },
  { step: '03', title: '获取推演', copy: 'AI 结合术法上下文生成可阅读的分析结果。' },
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
.flow-section {
  padding: 72px 0 0;
}

.service-grid,
.flow-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.service-card,
.flow-card {
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
.flow-card > * {
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
.flow-card h3 {
  margin: 6px 0 0;
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 400;
}

.service-card p,
.flow-card p {
  margin: 0;
  color: var(--ink-soft);
  font-size: 14px;
}

.flow-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.flow-card span {
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
  .flow-grid {
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
  .flow-grid {
    grid-template-columns: 1fr;
  }
}
</style>
