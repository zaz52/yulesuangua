<template>
  <main class="portal-page">
    <header class="portal-nav app-shell">
      <a class="brand" href="/" aria-label="乾坤之道首页">
        <span class="brand-seal">乾</span>
        <span>
          <strong>乾坤之道</strong>
          <em>东方术数与心愿工具台</em>
        </span>
      </a>
      <nav class="nav-links" aria-label="主导航">
        <a href="#core">AI 问卦</a>
        <a href="#tools">功能</a>
        <a href="#notice">说明</a>
      </nav>
      <button class="ds-button gold" type="button" @click="goDivine('bazi')">开始问卦</button>
    </header>

    <section class="hero app-shell">
      <div>
        <span class="section-kicker">Oracle Portal</span>
        <h1>首页做入口，功能进独立页</h1>
        <p class="hero-subtitle">每个项目都有自己的页面、表单和结果区域。八字、姻缘、佛学、奇门连接 AI 后端，其余工具先提供可用的本地交互和清晰引导。</p>
        <div class="hero-actions">
          <button class="ds-button primary" type="button" @click="goDivine('qimen')">起一局奇门</button>
          <button class="ds-button" type="button" @click="goTool('lingqian')">抽今日灵签</button>
        </div>
      </div>
      <div class="hero-panel ds-card">
        <span>今日入口</span>
        <strong>{{ today }}</strong>
        <p>先选功能，再补信息。结果页会显示盘面、表单或签文，不再把所有内容堆在首页。</p>
      </div>
    </section>

    <section id="core" class="app-shell section-block">
      <div class="section-head">
        <div>
          <span class="section-kicker">AI Divination</span>
          <h2 class="section-title">四个核心 AI 项目</h2>
        </div>
      </div>
      <div class="card-grid core-grid">
        <article v-for="item in coreTools" :key="item.id" class="portal-card ds-card" @click="goDivine(item.id)">
          <span class="tool-icon">{{ item.icon }}</span>
          <span class="ds-badge green">{{ item.badge }}</span>
          <h3>{{ item.name }}</h3>
          <p>{{ item.description }}</p>
          <button class="ds-button ghost" type="button">进入{{ item.short }}</button>
        </article>
      </div>
    </section>

    <section id="tools" class="app-shell section-block">
      <div class="section-head">
        <div>
          <span class="section-kicker">Tools</span>
          <h2 class="section-title">独立功能页</h2>
          <p class="section-copy">这些功能不再挤在首页。点击后进入单独页面填写信息、抽签或记录心愿。</p>
        </div>
      </div>
      <div class="card-grid">
        <article v-for="item in extraTools" :key="item.id" class="portal-card ds-card" @click="goTool(item.id)">
          <span class="tool-icon">{{ item.icon }}</span>
          <span class="ds-badge gold">{{ item.badge }}</span>
          <h3>{{ item.name }}</h3>
          <p>{{ item.description }}</p>
          <button class="ds-button ghost" type="button">打开页面</button>
        </article>
      </div>
    </section>

    <section id="notice" class="app-shell notice-block">
      <article class="ds-card">
        <span class="section-kicker">Boundary</span>
        <h2>使用边界</h2>
        <p>本站所有测算、黄历、灵签、解梦、起名和祈福内容仅供传统文化娱乐与自我观察参考，不构成医疗、法律、财务、婚恋等现实决策建议。</p>
      </article>
    </section>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const today = computed(() => new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date()))

const coreTools = [
  { id: 'bazi', icon: '命', name: '四柱八字', short: '八字', badge: 'AI 排盘', description: '填写出生信息，生成四柱盘面和阶段解读。' },
  { id: 'yinyuan', icon: '缘', name: '姻缘测算', short: '姻缘', badge: '关系洞察', description: '填写关系状态、对方信息和关注点，分析相处趋势。' },
  { id: 'fojiao', icon: '慧', name: '佛学开示', short: '开示', badge: '心性整理', description: '针对困惑、情绪和背景给出温和开示与行动提醒。' },
  { id: 'qimen', icon: '门', name: '奇门遁甲', short: '奇门', badge: '九宫盘', description: '围绕具体事件填写时间地点，查看九宫盘面和策略建议。' },
]

const extraTools = [
  { id: 'huangli', icon: '历', name: '今日黄历', badge: '宜忌吉时', description: '独立展示今日宜忌、吉时、冲煞和行动建议。' },
  { id: 'lingqian', icon: '签', name: '灵签占问', badge: '抽签解签', description: '填写所问之事，抽一支签并查看签文解释。' },
  { id: 'jiemeng', icon: '梦', name: '梦境解析', badge: '梦象记录', description: '输入梦境、情绪和现实背景，生成象意提示。' },
  { id: 'qiming', icon: '名', name: '宝宝起名', badge: '姓名方案', description: '填写姓氏、性别、生日和偏好，生成名字方向。' },
  { id: 'xianghuo', icon: '香', name: '祈福上香', badge: '心愿记录', description: '写下心愿、选择对象，完成本地祈福记录。' },
  { id: 'liuyao', icon: '易', name: '周易起卦', badge: '动态仪式', description: '静心、默念、投掷铜钱，完整生成六爻卦象与卷轴解卦。' },
]

function goDivine(id) {
  router.push(`/divine/${id}`)
}

function goTool(id) {
  router.push(`/tools/${id}`)
}
</script>

<style scoped>
.portal-page {
  min-height: 100vh;
  padding: 18px 0 72px;
  color: #f8edd2;
  background:
    radial-gradient(circle at 20% 10%, rgba(212, 175, 55, 0.18), transparent 30%),
    radial-gradient(circle at 80% 22%, rgba(46, 140, 122, 0.14), transparent 26%),
    linear-gradient(180deg, #1a1410 0%, #2a1712 48%, #120d0a 100%);
}

.portal-nav {
  position: sticky;
  top: 12px;
  z-index: 20;
  display: flex;
  min-height: 66px;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 10px 14px;
  border: 1px solid rgba(212, 175, 55, 0.24);
  border-radius: var(--radius-md);
  background: rgba(25, 17, 12, 0.78);
  backdrop-filter: blur(18px);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.brand-seal,
.tool-icon {
  display: grid;
  place-items: center;
  border: 1px solid rgba(244, 211, 122, 0.36);
  border-radius: 50%;
  color: #f4d37a;
  background: rgba(244, 211, 122, 0.08);
  font-family: var(--font-display);
}

.brand-seal {
  width: 42px;
  height: 42px;
  font-size: 24px;
}

.brand strong,
.brand em {
  display: block;
  line-height: 1.25;
}

.brand strong {
  font-family: var(--font-display);
  font-size: 23px;
  font-weight: 400;
}

.brand em {
  color: rgba(248, 237, 210, 0.62);
  font-size: 12px;
  font-style: normal;
}

.nav-links {
  display: flex;
  gap: 24px;
  color: rgba(248, 237, 210, 0.68);
  font-size: 14px;
}

.nav-links a:hover {
  color: #f4d37a;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) 360px;
  gap: 28px;
  align-items: center;
  min-height: 520px;
  padding: 48px 0 20px;
}

.hero h1 {
  max-width: 760px;
  margin: 16px 0 0;
  font-family: var(--font-display);
  font-size: clamp(48px, 8vw, 96px);
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0;
}

.hero-subtitle {
  max-width: 690px;
  margin: 22px 0 0;
  color: rgba(248, 237, 210, 0.72);
  font-size: clamp(16px, 1.6vw, 20px);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

.hero-panel {
  z-index: 1;
  padding: 24px;
  border-color: rgba(212, 175, 55, 0.26);
  background: rgba(33, 22, 15, 0.78);
}

.hero-panel > *,
.portal-card > *,
.notice-block article > * {
  position: relative;
  z-index: 1;
}

.hero-panel span {
  color: rgba(248, 237, 210, 0.66);
}

.hero-panel strong {
  display: block;
  margin: 8px 0;
  color: #f4d37a;
  font-size: 34px;
}

.hero-panel p,
.portal-card p,
.notice-block p,
.section-copy {
  color: rgba(248, 237, 210, 0.66);
}

.section-block,
.notice-block {
  padding-top: 56px;
}

.section-head {
  margin-bottom: 22px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.core-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.portal-card {
  z-index: 1;
  display: grid;
  min-height: 240px;
  align-content: start;
  gap: 12px;
  padding: 18px;
  border-color: rgba(212, 175, 55, 0.18);
  background: rgba(33, 22, 15, 0.76);
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
}

.portal-card:hover {
  transform: translateY(-3px);
  border-color: rgba(244, 211, 122, 0.5);
  background: rgba(50, 31, 20, 0.88);
}

.tool-icon {
  width: 48px;
  height: 48px;
  font-size: 24px;
}

.portal-card h3,
.notice-block h2 {
  margin: 2px 0 0;
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 400;
}

.notice-block article {
  z-index: 1;
  padding: 24px;
  border-color: rgba(212, 175, 55, 0.18);
  background: rgba(33, 22, 15, 0.76);
}

@media (max-width: 980px) {
  .hero,
  .core-grid,
  .card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hero > div:first-child {
    grid-column: 1 / -1;
  }
}

@media (max-width: 720px) {
  .portal-nav .nav-links,
  .portal-nav > .ds-button,
  .brand em {
    display: none;
  }

  .hero,
  .core-grid,
  .card-grid {
    grid-template-columns: 1fr;
  }

  .hero {
    min-height: auto;
    padding-top: 38px;
  }
}
</style>
