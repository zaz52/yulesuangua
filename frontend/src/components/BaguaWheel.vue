<script setup>
import { computed } from 'vue';

/**
 * 罗盘式八卦轮：SVG 绘制
 * - 外圈 72 刻度（罗盘感）
 * - 八卦用真实爻线绘制（阳爻实线 / 阴爻断线），非 Unicode 符号
 * - 卦名 + 自然象，中心太极
 * - 卦序沿用旧版：乾 兌 離 震 巽 坎 艮 坤（后天八卦序）
 */
const TRIGRAMS = [
  { name: '乾', nature: '天', lines: [1, 1, 1] },
  { name: '兌', nature: '澤', lines: [0, 1, 1] },
  { name: '離', nature: '火', lines: [1, 0, 1] },
  { name: '震', nature: '雷', lines: [0, 0, 1] },
  { name: '巽', nature: '風', lines: [1, 1, 0] },
  { name: '坎', nature: '水', lines: [0, 1, 0] },
  { name: '艮', nature: '山', lines: [1, 0, 0] },
  { name: '坤', nature: '地', lines: [0, 0, 0] },
];

const C = 240;

// 刻度环：每 5° 一格
const ticks = computed(() => {
  const arr = [];
  for (let a = 0; a < 360; a += 5) {
    const major = a % 45 === 0;
    const medium = a % 15 === 0;
    const r1 = major ? 213 : medium ? 216 : 219;
    const r2 = major ? 230 : medium ? 227 : 225;
    const rad = (a * Math.PI) / 180;
    const s = Math.sin(rad);
    const c = Math.cos(rad);
    arr.push({
      x1: C + r1 * s, y1: C - r1 * c,
      x2: C + r2 * s, y2: C - r2 * c,
      major, medium,
    });
  }
  return arr;
});

// 爻线：第 j 爻（0=初爻最内），d 为到圆心距离
const yaoTop = (j) => C - (172 + j * 15) - 4;
</script>

<template>
  <svg viewBox="0 0 480 480" class="bagua-wheel" role="img" aria-label="八卦轮盘">
    <defs>
      <radialGradient id="bw-disk" cx="50%" cy="42%" r="65%">
        <stop offset="0%" stop-color="#251b0e" />
        <stop offset="55%" stop-color="#14100a" />
        <stop offset="100%" stop-color="#0a0705" />
      </radialGradient>
      <linearGradient id="bw-gold" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#8a5f1a" />
        <stop offset="50%" stop-color="#f7dc8a" />
        <stop offset="100%" stop-color="#8a5f1a" />
      </linearGradient>
      <radialGradient id="bw-taiji" cx="38%" cy="32%" r="80%">
        <stop offset="0%" stop-color="#ffedb0" />
        <stop offset="100%" stop-color="#d9a441" />
      </radialGradient>
      <filter id="bw-glow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="2.2" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <!-- 底盘 -->
    <circle :cx="C" :cy="C" r="236" fill="url(#bw-disk)" />
    <circle :cx="C" :cy="C" r="236" fill="none" stroke="#c9982f" stroke-opacity="0.55" stroke-width="1.5" />
    <circle :cx="C" :cy="C" r="206" fill="none" stroke="#c9982f" stroke-opacity="0.35" stroke-width="1" />

    <!-- 旋转刻度环 -->
    <g class="bw-spin">
      <line
        v-for="(t, i) in ticks" :key="i"
        :x1="t.x1" :y1="t.y1" :x2="t.x2" :y2="t.y2"
        stroke="#d9a94a"
        :stroke-width="t.major ? 2.5 : t.medium ? 1.5 : 1"
        :stroke-opacity="t.major ? 0.85 : t.medium ? 0.45 : 0.22"
        stroke-linecap="round"
      />
    </g>

    <!-- 八卦扇区 -->
    <g v-for="(t, i) in TRIGRAMS" :key="t.name" :transform="`rotate(${i * 45} ${C} ${C})`">
      <!-- 爻线 -->
      <g v-for="(yao, j) in t.lines" :key="j" filter="url(#bw-glow)">
        <rect v-if="yao === 1" x="207" :y="yaoTop(j)" width="66" height="8" rx="4" fill="url(#bw-gold)" />
        <g v-else>
          <rect x="207" :y="yaoTop(j)" width="29" height="8" rx="4" fill="url(#bw-gold)" fill-opacity="0.92" />
          <rect x="244" :y="yaoTop(j)" width="29" height="8" rx="4" fill="url(#bw-gold)" fill-opacity="0.92" />
        </g>
      </g>
      <!-- 卦名 / 自然象 -->
      <text x="240" y="96" text-anchor="middle" font-size="23" fill="#f0d488" class="bw-serif">{{ t.name }}</text>
      <text x="240" y="116" text-anchor="middle" font-size="12" letter-spacing="3" fill="#9a865e">{{ t.nature }}</text>
    </g>

    <!-- 内圈 -->
    <circle :cx="C" :cy="C" r="146" fill="none" stroke="#c9982f" stroke-opacity="0.4" stroke-width="1" />
    <circle :cx="C" :cy="C" r="104" fill="url(#bw-disk)" stroke="#c9982f" stroke-opacity="0.5" stroke-width="1.5" />

    <!-- 太极（缓慢逆转） -->
    <g class="bw-taiji">
      <circle :cx="C" :cy="C" r="58" fill="url(#bw-taiji)" />
      <path
        :d="`M ${C} ${C - 58} A 58 58 0 0 1 ${C} ${C + 58}
             A 29 29 0 0 1 ${C} ${C}
             A 29 29 0 0 0 ${C} ${C - 58} Z`"
        fill="#14100a"
      />
      <circle :cx="C" :cy="C - 29" r="8.5" fill="#f7dc8a" />
      <circle :cx="C" :cy="C + 29" r="8.5" fill="#14100a" />
      <circle :cx="C" :cy="C" r="58" fill="none" stroke="#8a5f1a" stroke-width="2" />
      <circle :cx="C" :cy="C" r="66" fill="none" stroke="#c9982f" stroke-opacity="0.45" stroke-width="1" />
    </g>
  </svg>
</template>

<style scoped>
.bagua-wheel {
  width: min(400px, 78vw);
  height: auto;
  display: block;
  filter: drop-shadow(0 18px 44px rgba(0, 0, 0, 0.55)) drop-shadow(0 0 26px rgba(217, 169, 65, 0.12));
}

.bw-serif {
  font-family: var(--font-display, 'Noto Serif SC', serif);
  font-weight: 700;
}

.bw-spin {
  transform-origin: 240px 240px;
  animation: bw-rotate 90s linear infinite;
}

.bw-taiji {
  transform-origin: 240px 240px;
  animation: bw-rotate-rev 140s linear infinite;
}

@keyframes bw-rotate {
  to { transform: rotate(360deg); }
}

@keyframes bw-rotate-rev {
  to { transform: rotate(-360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .bw-spin, .bw-taiji { animation: none; }
}
</style>
