<template>
  <section class="bazi-board" aria-label="四柱八字排盘">
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
  overflow: auto;
  border: 1px solid rgba(215, 179, 95, 0.18);
  border-radius: var(--radius-xs);
  background: rgba(0, 0, 0, 0.12);
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
</style>
