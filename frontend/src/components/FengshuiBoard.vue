<template>
  <section class="fengshui-board" aria-label="风水九宫方位盘">
    <article
      v-for="cell in board.cells"
      :key="cell[0]"
      class="feng-cell"
      :class="{ center: cell[0] === '中宫' }"
    >
      <span>{{ cell[0] }}</span>
      <strong>{{ cell[1] }}</strong>
      <em>{{ cell[2] }}</em>
    </article>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { normalizeFengshuiBoard } from '../domain/metaphysics'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
const board = computed(() => normalizeFengshuiBoard(props.data))
</script>

<style scoped>
.fengshui-board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border: 1px solid rgba(240, 217, 132, 0.34);
  background: radial-gradient(circle at 50% 50%, rgba(215, 179, 95, 0.12), transparent 32%), rgba(0, 0, 0, 0.08);
}

.feng-cell {
  display: grid;
  min-height: 132px;
  align-content: center;
  gap: 8px;
  padding: 14px;
  border-right: 1px solid rgba(215, 179, 95, 0.18);
  border-bottom: 1px solid rgba(215, 179, 95, 0.18);
  text-align: center;
}

.feng-cell:nth-child(3n) { border-right: 0; }
.feng-cell:nth-last-child(-n + 3) { border-bottom: 0; }

.feng-cell.center {
  background: radial-gradient(circle, rgba(184, 58, 47, 0.18), rgba(215, 179, 95, 0.06));
}

.feng-cell span {
  color: var(--seal);
  font-weight: 700;
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

@media (max-width: 680px) {
  .fengshui-board {
    grid-template-columns: 1fr;
  }

  .feng-cell {
    min-height: 96px;
    border-right: 0;
  }
}
</style>
