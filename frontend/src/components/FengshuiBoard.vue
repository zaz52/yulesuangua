<template>
  <section class="fengshui-panel" aria-label="风水九宫方位盘">
    <header class="fengshui-meta">
      <strong>{{ board.kind }}</strong>
      <span>{{ board.direction }}</span>
      <em v-if="board.summary.detected.length">识别：{{ board.summary.detected.join(' / ') }}</em>
      <em v-else>补充门、窗、床、桌、灶、卫生间方位后可细排</em>
    </header>
    <div class="fengshui-board">
      <article
        v-for="cell in board.cells"
        :key="cell.direction"
        class="feng-cell"
        :class="[cell.level, { center: cell.direction === '中宫' }]"
      >
        <div class="feng-cell-head">
          <span>{{ cell.direction }}</span>
          <b>{{ cell.level }}</b>
        </div>
        <strong>{{ cell.palace }}</strong>
        <em>{{ cell.theme }}</em>
        <small>{{ cell.meaning }}</small>
        <div class="feng-score" :aria-label="`${cell.direction}评分 ${cell.score}`">
          <i v-for="index in 7" :key="index" :class="{ active: index <= cell.score + 4 }"></i>
        </div>
        <p>{{ cell.advice }}</p>
      </article>
    </div>
    <footer class="fengshui-adjustments">
      <p v-for="item in board.adjustments" :key="item">{{ item }}</p>
    </footer>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { normalizeFengshuiBoard } from '../domain/metaphysics'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
const board = computed(() => normalizeFengshuiBoard(props.data))
</script>

<style scoped>
.fengshui-panel {
  display: grid;
  gap: 12px;
}

.fengshui-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid rgba(215, 179, 95, 0.16);
  border-radius: var(--radius-xs);
  background: rgba(0, 0, 0, 0.14);
}

.fengshui-meta strong {
  color: var(--gold-bright);
}

.fengshui-meta span,
.fengshui-meta em {
  color: var(--paper-dim);
  font-style: normal;
}

.fengshui-board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border: 1px solid rgba(240, 217, 132, 0.34);
  background: radial-gradient(circle at 50% 50%, rgba(215, 179, 95, 0.12), transparent 32%), rgba(0, 0, 0, 0.08);
}

.feng-cell {
  display: grid;
  min-height: 178px;
  align-content: start;
  gap: 7px;
  padding: 14px;
  border-right: 1px solid rgba(215, 179, 95, 0.18);
  border-bottom: 1px solid rgba(215, 179, 95, 0.18);
}

.feng-cell:nth-child(3n) { border-right: 0; }
.feng-cell:nth-last-child(-n + 3) { border-bottom: 0; }

.feng-cell.center {
  background: radial-gradient(circle, rgba(184, 58, 47, 0.18), rgba(215, 179, 95, 0.06));
}

.feng-cell.宜用 {
  background: linear-gradient(135deg, rgba(79, 155, 131, 0.16), rgba(0, 0, 0, 0.04));
}

.feng-cell.需调 {
  background: linear-gradient(135deg, rgba(184, 58, 47, 0.18), rgba(0, 0, 0, 0.04));
}

.feng-cell-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.feng-cell span,
.feng-cell-head b {
  color: var(--seal);
  font-weight: 700;
}

.feng-cell-head b {
  color: rgba(245, 234, 212, 0.64);
  font-size: 12px;
}

.feng-cell strong {
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 25px;
  font-weight: 400;
}

.feng-cell em {
  color: var(--paper-dim);
  font-style: normal;
}

.feng-cell small {
  color: rgba(245, 234, 212, 0.62);
  line-height: 1.5;
}

.feng-score {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 3px;
}

.feng-score i {
  height: 4px;
  border-radius: 999px;
  background: rgba(245, 234, 212, 0.14);
}

.feng-score i.active {
  background: rgba(215, 179, 95, 0.72);
}

.feng-cell p,
.fengshui-adjustments p {
  margin: 0;
  color: var(--paper);
  font-size: 13px;
  line-height: 1.6;
}

.fengshui-adjustments {
  display: grid;
  gap: 8px;
}

.fengshui-adjustments p {
  padding: 9px 11px;
  border-left: 2px solid rgba(215, 179, 95, 0.3);
  background: rgba(0, 0, 0, 0.12);
}

@media (max-width: 680px) {
  .fengshui-board {
    grid-template-columns: 1fr;
  }

  .feng-cell {
    min-height: 0;
    border-right: 0;
  }
}
</style>
