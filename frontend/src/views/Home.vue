<template>
  <div class="home">
    <!-- 浮游道家符文背景 -->
    <div class="runes-bg">
      <span v-for="r in runes" :key="r.id" class="rune" :style="r.style">{{ r.char }}</span>
    </div>

    <!-- 扫描线 -->
    <div class="scanlines"></div>

    <!-- 主标题区 -->
    <div class="hero">
      <div class="taiji-glow">
        <div class="taiji">☯</div>
        <div class="ring ring-1"></div>
        <div class="ring ring-2"></div>
      </div>
      <h1 class="title">乾坤之道</h1>
      <div class="divider">
        <span class="line-left"></span>
        <span class="dot-glow">道</span>
        <span class="line-right"></span>
      </div>
      <p class="subtitle">千 年 玄 学 · A I 启 示</p>
      <p class="desc">四柱八字 · 姻缘测算 · 佛学开示 · 奇门遁甲<br/>以算力之力 · 解命运之码</p>
    </div>

    <!-- 四大技能 -->
    <div class="skills">
      <div
        v-for="(skill, idx) in skills"
        :key="skill.id"
        class="skill-card"
        :class="'skill-' + skill.id"
        @click="goDivine(skill.id)"
      >
        <div class="card-glow"></div>
        <div class="card-border-top"></div>
        <div class="skill-icon">{{ skill.icon }}</div>
        <div class="skill-name">{{ skill.name }}</div>
        <div class="skill-seal">{{ ['乾','坤','离','坎'][idx] }}</div>
        <div class="skill-desc">{{ skill.description }}</div>
        <div class="card-hex">{{ ['☰','☷','☲','☵'][idx] }}</div>
        <div class="card-corner tl"></div>
        <div class="card-corner tr"></div>
        <div class="card-corner bl"></div>
        <div class="card-corner br"></div>
      </div>
    </div>

    <!-- 底部 -->
    <div class="footer">
      <div class="footer-line"></div>
      <p>仅供娱乐参考 · 不作为任何决策依据</p>
      <p class="footer-sub">道 法 自 然 · 顺 应 天 时</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchSkills } from '../api/divine'

const router = useRouter()
const skills = ref([])

// 道家符文字符
const runeChars = [
  '道','德','玄','妙','一','炁','无','极','太','上',
  '清','静','真','虚','灵','明','乾坤','离','坎','震',
  '巽','艮','兑','符','咒','罡','步','斗','宿','曜',
  '甲','乙','丙','丁','戊','己','庚','辛','壬','癸',
  '子','丑','寅','卯','辰','巳','午','未','申','酉',
]

const runes = ref([])

onMounted(() => {
  // 生成随机浮游符文
  const generated = []
  for (let i = 0; i < 50; i++) {
    generated.push({
      id: i,
      char: runeChars[Math.floor(Math.random() * runeChars.length)],
      style: {
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        fontSize: (12 + Math.random() * 24) + 'px',
        animationDuration: (15 + Math.random() * 25) + 's',
        animationDelay: (-Math.random() * 20) + 's',
        opacity: 0.03 + Math.random() * 0.06,
      }
    })
  }
  runes.value = generated

  try {
    fetchSkills().then(data => { skills.value = data.skills })
  } catch {
    skills.value = [
      { id: 'bazi', name: '四柱八字', description: '排出四柱八字，分析命理运势', icon: '☰' },
      { id: 'yinyuan', name: '姻缘测算', description: '八字合婚、生肖配对、签诗占卜', icon: '🎎' },
      { id: 'fojiao', name: '佛学开示', description: '高僧大德智慧开示，经典解读', icon: '☸' },
      { id: 'qimen', name: '奇门遁甲', description: '时家奇门排盘、解盘、择时', icon: '☯' },
    ]
  }
})

function goDivine(skillId) {
  router.push(`/divine/${skillId}`)
}
</script>

<style scoped>
/* ===== 赛博修仙首页 ===== */
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 20px 60px;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 30% 20%, rgba(168,85,247,0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 80%, rgba(0,229,160,0.04) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(240,192,64,0.03) 0%, transparent 40%),
    var(--xuan);
}

/* ===== 浮游道家符文 ===== */
.runes-bg {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.rune {
  position: absolute;
  font-family: 'Ma Shan Zheng', 'STKaiti', serif;
  color: var(--jin);
  animation: rune-float linear infinite;
  text-shadow: 0 0 8px var(--jin-glow);
  will-change: transform;
}

@keyframes rune-float {
  0% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-30px) rotate(5deg); }
  50% { transform: translateY(-10px) rotate(-3deg); }
  75% { transform: translateY(-40px) rotate(4deg); }
  100% { transform: translateY(0) rotate(0deg); }
}

/* ===== 扫描线 ===== */
.scanlines {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  z-index: 1;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0,0,0,0.03) 2px,
    rgba(0,0,0,0.03) 4px
  );
}

/* ===== 英雄区 ===== */
.hero {
  text-align: center;
  margin: 60px 0 50px;
  position: relative;
  z-index: 2;
}

.taiji-glow {
  position: relative;
  display: inline-block;
  margin-bottom: 28px;
}

.taiji {
  font-size: 4rem;
  color: var(--jin);
  animation: rotate-taiji 30s linear infinite;
  filter: drop-shadow(0 0 20px var(--jin-glow)) drop-shadow(0 0 40px rgba(240,192,64,0.15));
  position: relative;
  z-index: 2;
}

.ring {
  position: absolute;
  border-radius: 50%;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  border: 1px solid;
}

.ring-1 {
  width: 90px; height: 90px;
  border-color: rgba(168,85,247,0.3);
  animation: ring-pulse 3s ease-in-out infinite;
}

.ring-2 {
  width: 120px; height: 120px;
  border-color: rgba(0,229,160,0.2);
  animation: ring-pulse 3s ease-in-out infinite 1.5s;
}

@keyframes rotate-taiji {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes ring-pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.2; }
}

.title {
  font-family: 'Ma Shan Zheng', 'STKaiti', serif;
  font-size: 3.5rem;
  font-weight: 900;
  color: #e8e8f0;
  letter-spacing: 16px;
  margin-bottom: 16px;
  text-shadow:
    0 0 20px var(--jin-glow),
    0 0 40px rgba(240,192,64,0.1);
}

.divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
}

.divider .line-left,
.divider .line-right {
  width: 80px;
  height: 1px;
}

.line-left {
  background: linear-gradient(to right, transparent, var(--zhu), var(--jin));
  box-shadow: 0 0 6px var(--zhu-glow);
}

.line-right {
  background: linear-gradient(to left, transparent, var(--zhu), var(--jin));
  box-shadow: 0 0 6px var(--zhu-glow);
}

.dot-glow {
  color: var(--zhu);
  font-family: 'Ma Shan Zheng', serif;
  font-size: 1.3rem;
  text-shadow: 0 0 10px var(--zhu-glow);
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { text-shadow: 0 0 10px var(--zhu-glow); }
  50% { text-shadow: 0 0 20px var(--zhu-glow), 0 0 30px rgba(255,46,76,0.2); }
}

.subtitle {
  font-family: 'Ma Shan Zheng', 'STKaiti', serif;
  font-size: 1.2rem;
  color: var(--jin);
  letter-spacing: 6px;
  margin-bottom: 16px;
  text-shadow: 0 0 10px var(--jin-glow);
}

.desc {
  color: var(--hui);
  line-height: 2;
  font-size: 0.85rem;
  letter-spacing: 1px;
}

/* ===== 技能卡片 ===== */
.skills {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  max-width: 640px;
  width: 100%;
  position: relative;
  z-index: 2;
}

.skill-card {
  position: relative;
  background: rgba(20,20,40,0.6);
  border: 1px solid rgba(240,192,64,0.15);
  border-radius: 2px;
  padding: 32px 20px 28px;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25,0.46,0.45,0.94);
  overflow: hidden;
  backdrop-filter: blur(8px);
}

.card-glow {
  position: absolute;
  top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: radial-gradient(circle at center, rgba(240,192,64,0.03) 0%, transparent 50%);
  pointer-events: none;
  transition: opacity 0.4s;
  opacity: 0;
}

.skill-card:hover .card-glow { opacity: 1; }

.card-border-top {
  position: absolute;
  top: 0; left: 15%; right: 15%;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--jin), transparent);
  box-shadow: 0 0 8px var(--jin-glow);
}

.skill-icon {
  font-size: 2.4rem;
  margin-bottom: 10px;
  filter: drop-shadow(0 0 8px rgba(240,192,64,0.3));
}

.skill-name {
  font-family: 'Ma Shan Zheng', 'STKaiti', serif;
  font-size: 1.5rem;
  color: #e8e8f0;
  margin-bottom: 6px;
  letter-spacing: 6px;
  text-shadow: 0 0 8px rgba(232,232,240,0.15);
}

.skill-seal {
  display: inline-block;
  font-family: 'Ma Shan Zheng', serif;
  font-size: 0.65rem;
  padding: 1px 8px;
  margin-bottom: 10px;
  transform: rotate(-3deg);
  letter-spacing: 2px;
}

.skill-desc {
  font-size: 0.78rem;
  color: var(--hui);
  line-height: 1.6;
  letter-spacing: 1px;
}

.card-hex {
  position: absolute;
  bottom: 6px; right: 10px;
  font-size: 1.2rem;
  opacity: 0.08;
  color: var(--jin);
}

/* 四角装饰 */
.card-corner {
  position: absolute;
  width: 12px; height: 12px;
  border-color: rgba(240,192,64,0.2);
  border-style: solid;
  border-width: 0;
}
.card-corner.tl { top: 6px; left: 6px; border-top-width: 1px; border-left-width: 1px; }
.card-corner.tr { top: 6px; right: 6px; border-top-width: 1px; border-right-width: 1px; }
.card-corner.bl { bottom: 6px; left: 6px; border-bottom-width: 1px; border-left-width: 1px; }
.card-corner.br { bottom: 6px; right: 6px; border-bottom-width: 1px; border-right-width: 1px; }

/* 各技能特色 */
.skill-bazi .skill-seal { border: 1px solid var(--lan); color: var(--lan); }
.skill-bazi .skill-icon { filter: drop-shadow(0 0 12px var(--lan-glow)); }
.skill-bazi:hover { border-color: var(--lan); box-shadow: 0 0 20px var(--lan-glow), inset 0 0 30px rgba(56,189,248,0.03); }

.skill-yinyuan .skill-seal { border: 1px solid var(--zhu); color: var(--zhu); }
.skill-yinyuan .skill-icon { filter: drop-shadow(0 0 12px var(--zhu-glow)); }
.skill-yinyuan:hover { border-color: var(--zhu); box-shadow: 0 0 20px var(--zhu-glow), inset 0 0 30px rgba(255,46,76,0.03); }

.skill-fojiao .skill-seal { border: 1px solid var(--jin); color: var(--jin); }
.skill-fojiao .skill-icon { filter: drop-shadow(0 0 12px var(--jin-glow)); }
.skill-fojiao:hover { border-color: var(--jin); box-shadow: 0 0 20px var(--jin-glow), inset 0 0 30px rgba(240,192,64,0.03); }

.skill-qimen .skill-seal { border: 1px solid var(--qing); color: var(--qing); }
.skill-qimen .skill-icon { filter: drop-shadow(0 0 12px var(--qing-glow)); }
.skill-qimen:hover { border-color: var(--qing); box-shadow: 0 0 20px var(--qing-glow), inset 0 0 30px rgba(0,229,160,0.03); }

.skill-card:hover {
  transform: translateY(-4px);
  background: rgba(20,20,40,0.8);
}

/* ===== 底部 ===== */
.footer {
  margin-top: 60px;
  text-align: center;
  position: relative;
  z-index: 2;
}

.footer-line {
  width: 160px;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--jin), transparent);
  box-shadow: 0 0 6px var(--jin-glow);
  margin: 0 auto 20px;
}

.footer p {
  color: var(--hui);
  font-size: 0.72rem;
  letter-spacing: 3px;
}

.footer-sub {
  margin-top: 8px;
  font-family: 'Ma Shan Zheng', serif;
  font-size: 0.9rem;
  color: var(--jin);
  opacity: 0.4;
  text-shadow: 0 0 6px var(--jin-glow);
}

@media (max-width: 500px) {
  .skills { grid-template-columns: 1fr; }
  .title { font-size: 2.4rem; letter-spacing: 10px; }
  .taiji { font-size: 3rem; }
}
</style>
