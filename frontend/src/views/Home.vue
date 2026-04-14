<template>
  <div class="home">
    <!-- 浮游符文 -->
    <div class="runes-bg">
      <span v-for="r in runes" :key="r.id" class="rune" :style="r.style">{{ r.char }}</span>
    </div>

    <!-- 主标题区 -->
    <div class="hero">
      <div class="taiji-wrap">
        <div class="taiji">☯</div>
      </div>
      <h1 class="title">乾坤之道</h1>
      <div class="divider">
        <span class="line"></span>
        <span class="dot">道</span>
        <span class="line"></span>
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
        <div class="skill-icon">{{ skill.icon }}</div>
        <div class="skill-name">{{ skill.name }}</div>
        <div class="skill-seal">{{ ['乾','坤','离','坎'][idx] }}</div>
        <div class="skill-desc">{{ skill.description }}</div>
        <div class="card-ornament">{{ ['☰','☷','☲','☵'][idx] }}</div>
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

const runeChars = [
  '道','德','玄','妙','一','炁','无','极','太','上',
  '清','静','真','虚','灵','明','符','咒','罡','步',
  '甲','乙','丙','丁','戊','己','庚','辛','壬','癸',
  '子','丑','寅','卯','辰','巳','午','未','申','酉',
]

const runes = ref([])

onMounted(() => {
  const generated = []
  for (let i = 0; i < 40; i++) {
    generated.push({
      id: i,
      char: runeChars[Math.floor(Math.random() * runeChars.length)],
      style: {
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        fontSize: (10 + Math.random() * 18) + 'px',
        animationDuration: (20 + Math.random() * 30) + 's',
        animationDelay: (-Math.random() * 20) + 's',
        opacity: 0.04 + Math.random() * 0.05,
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
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 20px 60px;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(184,134,11,0.04) 0%, transparent 50%),
    radial-gradient(ellipse at 20% 80%, rgba(46,125,91,0.03) 0%, transparent 40%),
    var(--xuanzhi);
}

/* ===== 浮游符文 ===== */
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
  color: var(--mo);
  animation: rune-float linear infinite;
  will-change: transform;
}
@keyframes rune-float {
  0% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-20px) rotate(3deg); }
  50% { transform: translateY(-6px) rotate(-2deg); }
  75% { transform: translateY(-25px) rotate(2deg); }
  100% { transform: translateY(0) rotate(0deg); }
}

/* ===== 英雄区 ===== */
.hero {
  text-align: center;
  margin: 50px 0 40px;
  position: relative;
  z-index: 2;
}
.taiji-wrap { margin-bottom: 24px; }
.taiji {
  display: inline-block;
  font-size: 3.5rem;
  color: var(--mo);
  animation: rotate-taiji 40s linear infinite;
  opacity: 0.7;
}
@keyframes rotate-taiji {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.title {
  font-family: 'Ma Shan Zheng', 'STKaiti', serif;
  font-size: 3.2rem;
  font-weight: 900;
  color: var(--mo);
  letter-spacing: 16px;
  margin-bottom: 16px;
}
.divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-bottom: 14px;
}
.divider .line {
  width: 60px;
  height: 1px;
  background: var(--mo);
  opacity: 0.2;
}
.dot {
  color: var(--zhu);
  font-family: 'Ma Shan Zheng', serif;
  font-size: 1.2rem;
}
.subtitle {
  font-family: 'Ma Shan Zheng', 'STKaiti', serif;
  font-size: 1.1rem;
  color: var(--jin);
  letter-spacing: 6px;
  margin-bottom: 12px;
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
  gap: 16px;
  max-width: 640px;
  width: 100%;
  position: relative;
  z-index: 2;
}
.skill-card {
  position: relative;
  background: var(--xuanzhi-light);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 28px 18px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}
.skill-card::before {
  content: '';
  position: absolute;
  top: 0; left: 20%; right: 20%;
  height: 2px;
  transition: all 0.3s;
}
.skill-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px var(--ink-wash);
}
.skill-icon {
  font-size: 2.2rem;
  margin-bottom: 8px;
}
.skill-name {
  font-family: 'Ma Shan Zheng', 'STKaiti', serif;
  font-size: 1.4rem;
  color: var(--mo);
  margin-bottom: 4px;
  letter-spacing: 6px;
}
.skill-seal {
  display: inline-block;
  font-family: 'Ma Shan Zheng', serif;
  font-size: 0.6rem;
  padding: 1px 8px;
  margin-bottom: 10px;
  transform: rotate(-3deg);
  letter-spacing: 2px;
  border: 1px solid;
}
.skill-desc {
  font-size: 0.78rem;
  color: var(--hui);
  line-height: 1.6;
  letter-spacing: 1px;
}
.card-ornament {
  position: absolute;
  bottom: 6px; right: 10px;
  font-size: 1.2rem;
  opacity: 0.06;
  color: var(--mo);
}

/* 八字 - 靛蓝 */
.skill-bazi::before { background: var(--lan); }
.skill-bazi .skill-seal { border-color: var(--lan); color: var(--lan); }
.skill-bazi .skill-icon { color: var(--lan); }
.skill-bazi:hover { border-color: var(--lan); }

/* 姻缘 - 朱砂 */
.skill-yinyuan::before { background: var(--zhu); }
.skill-yinyuan .skill-seal { border-color: var(--zhu); color: var(--zhu); }
.skill-yinyuan .skill-icon { color: var(--zhu); }
.skill-yinyuan:hover { border-color: var(--zhu); }

/* 佛学 - 古金 */
.skill-fojiao::before { background: var(--jin); }
.skill-fojiao .skill-seal { border-color: var(--jin); color: var(--jin); }
.skill-fojiao .skill-icon { color: var(--jin); }
.skill-fojiao:hover { border-color: var(--jin); }

/* 奇门 - 青瓷 */
.skill-qimen::before { background: var(--qing); }
.skill-qimen .skill-seal { border-color: var(--qing); color: var(--qing); }
.skill-qimen .skill-icon { color: var(--qing); }
.skill-qimen:hover { border-color: var(--qing); }

/* ===== 底部 ===== */
.footer {
  margin-top: 50px;
  text-align: center;
  position: relative;
  z-index: 2;
}
.footer-line {
  width: 120px;
  height: 1px;
  background: var(--mo);
  opacity: 0.15;
  margin: 0 auto 16px;
}
.footer p {
  color: var(--hui);
  font-size: 0.72rem;
  letter-spacing: 3px;
}
.footer-sub {
  margin-top: 6px;
  font-family: 'Ma Shan Zheng', serif;
  font-size: 0.9rem;
  color: var(--jin);
  opacity: 0.5;
}

@media (max-width: 500px) {
  .skills { grid-template-columns: 1fr; }
  .title { font-size: 2.4rem; letter-spacing: 10px; }
  .taiji { font-size: 2.8rem; }
}
</style>
