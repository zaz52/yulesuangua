<template>
  <main class="home-page ritual-page">
    <header class="page-nav app-shell">
      <a class="brand" href="/" aria-label="乾坤之道首页">
        <span class="brand-seal">卦</span>
        <span>
          <strong>乾坤之道</strong>
          <em>周易起卦与东方问事</em>
        </span>
      </a>
      <nav class="nav-links" aria-label="主导航">
        <a href="#ai">AI 问事</a>
        <a href="#tools">传统工具</a>
        <a href="#boundary">说明</a>
      </nav>
      <button class="ds-button gold" type="button" @click="go('/zhouyi')">进入起卦</button>
    </header>

    <section class="hero app-shell">
      <div class="hero-copy">
        <span class="section-kicker">Zhouyi Ritual</span>
        <h1>静心起卦，观象问事</h1>
        <p>
          以完整仪式流程生成六爻卦象，再结合 AI 问事、八字、姻缘、佛学与奇门盘面，帮你把复杂问题整理成可观察、可行动的线索。
        </p>
        <div class="hero-actions">
          <button class="ds-button primary" type="button" @click="go('/zhouyi')">开始周易起卦</button>
          <button class="ds-button ghost" type="button" @click="go('/divine/qimen')">起一局奇门</button>
        </div>
      </div>

      <div class="hero-plate ds-card">
        <div class="bagua-orbit" aria-hidden="true">
          <span v-for="item in trigrams" :key="item">{{ item }}</span>
        </div>
        <div class="plate-center">
          <span>今日</span>
          <strong>{{ today }}</strong>
          <em>先定问题，再观其象</em>
        </div>
      </div>
    </section>

    <section id="ai" class="app-shell section-block">
      <div class="section-head">
        <div>
          <span class="section-kicker">AI Divination</span>
          <h2 class="section-title">四个核心问事入口</h2>
          <p class="section-copy">每个入口都有对应信息表单和视觉盘面，提交后连接后端生成流式解读。</p>
        </div>
      </div>
      <div class="core-grid">
        <article v-for="item in coreTools" :key="item.id" class="portal-card ds-card" @click="go(`/divine/${item.id}`)">
          <span class="round-mark">{{ item.icon }}</span>
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
          <span class="section-kicker">Classic Tools</span>
          <h2 class="section-title">独立传统工具</h2>
          <p class="section-copy">黄历、灵签、解梦、起名、香火与六爻均有单独页面，移动端也能直接使用。</p>
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

    <section id="boundary" class="app-shell boundary-section">
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
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const today = computed(() => new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date()))
const trigrams = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤']

const coreTools = [
  { id: 'bazi', icon: '命', name: '四柱八字', short: '八字', badge: '命理盘', description: '填写出生信息，生成四柱盘面与阶段解读。' },
  { id: 'yinyuan', icon: '缘', name: '姻缘测算', short: '姻缘', badge: '关系盘', description: '整理关系状态、关注点与相处趋势。' },
  { id: 'fojiao', icon: '禅', name: '佛学开示', short: '开示', badge: '心性观照', description: '围绕困惑、情绪和背景给出温和提醒。' },
  { id: 'qimen', icon: '门', name: '奇门遁甲', short: '奇门', badge: '九宫盘', description: '根据时间、地点和事件观察时机与策略。' },
]

const tools = [
  { id: 'zhouyi', path: '/zhouyi', icon: '卦', name: '周易起卦', description: '静心、默念、投钱、六爻、卷轴解卦。' },
  { id: 'huangli', path: '/tools/huangli', icon: '历', name: '今日黄历', description: '宜忌、吉时、方位与今日提醒。' },
  { id: 'lingqian', path: '/tools/lingqian', icon: '签', name: '灵签占问', description: '写下所问之事，抽签查看签文。' },
  { id: 'jiemeng', path: '/tools/jiemeng', icon: '梦', name: '梦境解析', description: '记录梦境、情绪和现实背景。' },
  { id: 'qiming', path: '/tools/qiming', icon: '名', name: '宝宝起名', description: '按姓氏、生日和偏好生成方向。' },
  { id: 'xianghuo', path: '/tools/xianghuo', icon: '香', name: '祈福上香', description: '本地记录心愿和香火次数。' },
]

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
  max-width: 820px;
  margin: 18px 0 0;
  font-family: var(--font-display);
  font-size: clamp(58px, 10vw, 122px);
  font-weight: 400;
  line-height: 0.95;
  letter-spacing: 0;
}

.hero-copy p {
  max-width: 720px;
  margin: 24px 0 0;
  color: var(--paper-dim);
  font-size: clamp(16px, 1.7vw, 20px);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
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
  transform: rotate(calc(var(--index, 0) * 45deg));
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

.core-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.portal-card,
.tool-card,
.boundary-section article {
  position: relative;
  z-index: 1;
}

.portal-card {
  display: grid;
  min-height: 260px;
  align-content: start;
  gap: 12px;
  padding: 18px;
  transition: transform 180ms ease, border-color 180ms ease;
}

.portal-card:hover,
.tool-card:hover {
  transform: translateY(-3px);
  border-color: rgba(240, 217, 132, 0.56);
}

.portal-card > *,
.tool-card > *,
.boundary-section article > * {
  position: relative;
  z-index: 1;
}

.portal-card h3 {
  margin: 2px 0 0;
  font-family: var(--font-display);
  font-size: 31px;
  font-weight: 400;
}

.portal-card p,
.tool-card p,
.boundary-section p {
  margin: 0;
  color: var(--paper-dim);
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

@media (max-width: 980px) {
  .hero {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .hero-plate {
    min-height: 360px;
    border-radius: var(--radius-lg);
  }

  .core-grid,
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
    font-size: clamp(48px, 16vw, 72px);
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

  .core-grid,
  .tool-grid {
    grid-template-columns: 1fr;
  }
}
</style>
