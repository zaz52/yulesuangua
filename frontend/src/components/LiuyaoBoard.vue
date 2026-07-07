<template>
  <section class="liuyao-board" aria-label="六爻排盘">
    <header class="liuyao-title">
      <strong>{{ board.meta.originalName }}</strong>
      <span>{{ board.meta.changedName ? `变卦：${board.meta.changedName}` : '变卦随动爻而定' }}</span>
      <em>{{ board.meta.palace }}</em>
    </header>
    <div class="liuyao-lines">
      <article v-for="line in board.lines" :key="line.position" class="liuyao-line-row" :class="{ marked: line.flags.length }">
        <span>{{ line.position }}</span>
        <i class="yao-line" :class="line.yaoType.includes('阳') ? 'yang' : 'yin'" />
        <strong>{{ line.sixRelative }}</strong>
        <b>{{ line.sixGod }}</b>
        <em>{{ line.najia }}{{ line.wuxing }}</em>
        <small>{{ line.change || line.note }}</small>
        <div class="liuyao-flags">
          <mark v-for="flag in line.flags" :key="flag">{{ flag }}</mark>
        </div>
      </article>
    </div>
    <footer class="liuyao-foot">
      <span>{{ board.meta.interName ? `互卦 ${board.meta.interName}` : '互卦待排' }}</span>
      <span>{{ board.meta.specialPattern }}</span>
      <span v-if="board.meta.voidBranches">空亡 {{ board.meta.voidBranches }}</span>
      <span>{{ board.meta.usefulGod }}</span>
    </footer>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { normalizeLiuyaoBoard } from '../domain/metaphysics'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
const board = computed(() => normalizeLiuyaoBoard(props.data))
</script>

<style scoped>
.liuyao-board {
  display: grid;
  gap: 10px;
  padding: 14px;
  border: 1px solid rgba(215, 179, 95, 0.18);
  border-radius: var(--radius-xs);
  background: rgba(0, 0, 0, 0.12);
}

.liuyao-title,
.liuyao-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid rgba(215, 179, 95, 0.14);
  border-radius: var(--radius-xs);
}

.liuyao-title strong {
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 400;
}

.liuyao-title span,
.liuyao-title em,
.liuyao-foot span,
.liuyao-line-row em {
  color: var(--paper-dim);
  font-style: normal;
}

.liuyao-lines {
  display: grid;
}

.liuyao-line-row {
  display: grid;
  grid-template-columns: 52px minmax(120px, 1fr) 64px 58px 76px minmax(100px, 1fr) minmax(90px, auto);
  align-items: center;
  gap: 10px;
  min-height: 64px;
  padding: 9px 12px;
  border-top: 1px solid rgba(215, 179, 95, 0.12);
}

.liuyao-line-row:first-child {
  border-top: 0;
}

.liuyao-line-row.marked {
  background: rgba(184, 58, 47, 0.08);
}

.liuyao-line-row span {
  color: var(--seal);
  font-weight: 700;
}

.liuyao-line-row strong,
.liuyao-line-row b {
  color: var(--gold-bright);
}

.liuyao-line-row small {
  color: var(--paper-dim);
  font-size: 12px;
}

.liuyao-flags {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 4px;
}

.liuyao-flags mark {
  padding: 2px 6px;
  border: 1px solid rgba(215, 179, 95, 0.22);
  border-radius: 999px;
  color: rgba(245, 234, 212, 0.72);
  background: rgba(0, 0, 0, 0.14);
  font-size: 11px;
}

.yao-line {
  position: relative;
  display: block;
  height: 10px;
}

.yao-line::before,
.yao-line::after {
  position: absolute;
  top: 0;
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(90deg, #b8842d, #f0d984, #b8842d);
  content: "";
}

.yao-line.yang::before {
  left: 0;
  right: 0;
}

.yao-line.yin::before {
  left: 0;
  width: 42%;
}

.yao-line.yin::after {
  right: 0;
  width: 42%;
}

@media (max-width: 680px) {
  .liuyao-line-row {
    grid-template-columns: 42px minmax(100px, 1fr) 48px;
  }

  .liuyao-line-row b,
  .liuyao-line-row em,
  .liuyao-line-row small,
  .liuyao-flags {
    grid-column: 2 / -1;
  }

  .liuyao-flags {
    justify-content: flex-start;
  }
}
</style>
