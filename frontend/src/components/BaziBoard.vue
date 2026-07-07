<template>
  <section class="bazi-board" aria-label="四柱八字排盘">
    <header class="bazi-summary">
      <div>
        <span>日主</span>
        <strong>{{ board.meta.dayMaster || '待定' }}</strong>
      </div>
      <div>
        <span>旺衰</span>
        <strong>{{ board.meta.strength || '待定' }}</strong>
      </div>
      <div>
        <span>格局</span>
        <strong>{{ board.meta.pattern || '待定' }}</strong>
      </div>
      <div>
        <span>用忌</span>
        <strong>{{ board.meta.useful || '待定' }} / {{ board.meta.avoid || '待定' }}</strong>
      </div>
    </header>

    <div class="bazi-pillars" aria-label="四柱命盘">
      <article v-for="pillar in board.pillars" :key="pillar.key || pillar.label" class="bazi-pillar">
        <span>{{ pillar.label }}</span>
        <strong>{{ pillar.ganZhi || `${pillar.gan}${pillar.zhi}` || '待定' }}</strong>
        <b>{{ pillar.tenGod || '十神待定' }}</b>
        <em>{{ pillar.nayin || '纳音待定' }}</em>
        <small>{{ pillar.lifeStage || '长生待定' }}</small>
      </article>
    </div>

    <div class="bazi-elements" aria-label="五行强弱">
      <div v-for="item in board.elements" :key="item.name" class="bazi-element">
        <span>{{ item.name }}</span>
        <i><b :style="{ width: `${item.ratio}%` }"></b></i>
        <em>{{ item.state }}</em>
      </div>
    </div>

    <div class="bazi-row bazi-header">
      <span>项目</span>
      <strong v-for="column in board.columns" :key="column">{{ column }}</strong>
    </div>
    <div v-for="row in board.rows" :key="row[0]" class="bazi-row">
      <span>{{ row[0] }}</span>
      <em v-for="(item, index) in row.slice(1)" :key="`${row[0]}-${index}`">{{ item }}</em>
    </div>
    <footer class="bazi-tips">
      <small v-for="item in board.highlights" :key="item">{{ item }}</small>
      <small v-for="item in board.advice" :key="item">{{ item }}</small>
    </footer>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { normalizeBaziBoard } from '../domain/metaphysics'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
const board = computed(() => normalizeBaziBoard(props.data))
</script>

<style scoped>
.bazi-board {
  display: grid;
  gap: 12px;
  overflow: auto;
  padding: 12px;
  border: 1px solid rgba(215, 179, 95, 0.18);
  border-radius: var(--radius-xs);
  background: rgba(0, 0, 0, 0.12);
}

.bazi-summary,
.bazi-pillars,
.bazi-elements {
  display: grid;
  min-width: 620px;
  gap: 10px;
}

.bazi-summary {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.bazi-summary div,
.bazi-pillar,
.bazi-element {
  min-width: 0;
  border: 1px solid rgba(215, 179, 95, 0.14);
  border-radius: var(--radius-xs);
  background: rgba(255, 247, 231, 0.035);
}

.bazi-summary div {
  display: grid;
  gap: 5px;
  padding: 10px;
}

.bazi-summary span,
.bazi-pillar span,
.bazi-pillar small,
.bazi-element span,
.bazi-element em {
  color: rgba(245, 234, 212, 0.62);
  font-size: 12px;
  font-style: normal;
}

.bazi-summary strong {
  overflow: hidden;
  color: var(--gold-bright);
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bazi-pillars {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.bazi-pillar {
  display: grid;
  gap: 6px;
  justify-items: center;
  padding: 13px 10px;
  text-align: center;
}

.bazi-pillar strong {
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 400;
  line-height: 1;
}

.bazi-pillar b {
  color: var(--paper);
  font-size: 13px;
  font-weight: 600;
}

.bazi-pillar em {
  color: var(--seal);
  font-size: 12px;
  font-style: normal;
}

.bazi-elements {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.bazi-element {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) 28px;
  align-items: center;
  gap: 8px;
  padding: 8px 9px;
}

.bazi-element i {
  display: block;
  height: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(215, 179, 95, 0.12);
}

.bazi-element b {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(177, 49, 35, 0.72), rgba(240, 217, 132, 0.86));
}

.bazi-row {
  display: grid;
  grid-template-columns: 88px repeat(4, minmax(110px, 1fr));
  min-width: 620px;
  border-bottom: 1px solid rgba(215, 179, 95, 0.12);
}

.bazi-row > * {
  padding: 12px 10px;
  border-left: 1px solid rgba(215, 179, 95, 0.08);
  text-align: center;
}

.bazi-row > :first-child {
  border-left: 0;
}

.bazi-header {
  background: rgba(215, 179, 95, 0.08);
}

.bazi-row span {
  color: var(--seal);
  font-weight: 700;
}

.bazi-row strong {
  color: var(--gold-bright);
}

.bazi-row em {
  color: var(--paper);
  font-style: normal;
}

.bazi-tips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 620px;
  padding: 10px;
}

.bazi-tips small {
  padding: 5px 9px;
  border: 1px solid rgba(215, 179, 95, 0.16);
  border-radius: 999px;
  color: var(--paper-dim);
}

@media (max-width: 680px) {
  .bazi-board {
    padding: 10px;
  }

  .bazi-summary,
  .bazi-pillars,
  .bazi-elements,
  .bazi-row,
  .bazi-tips {
    min-width: 560px;
  }

  .bazi-pillar strong {
    font-size: 24px;
  }
}
</style>
