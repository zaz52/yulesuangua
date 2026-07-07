<template>
  <section class="qimen-board" aria-label="奇门遁甲九宫排盘">
    <div class="qimen-meta">
      <span>公历：{{ board.meta.solar }}</span>
      <span>农历：{{ board.meta.lunar }}</span>
      <strong>{{ board.meta.juShu }}</strong>
    </div>

    <div class="qimen-shell">
      <b class="qimen-axis south">南</b>
      <b class="qimen-axis east">东</b>
      <b class="qimen-axis west">西</b>
      <b class="qimen-axis north">北</b>

      <div class="qimen-grid" role="table" aria-label="奇门九宫">
        <article
          v-for="cell in board.cells"
          :key="`${cell.palace}-${cell.direction}`"
          class="qimen-cell"
          :class="{ 'is-center': cell.key === 'center' }"
          role="cell"
        >
          <div class="qimen-cell-head">
            <strong>{{ cell.palace }}</strong>
            <span>{{ cell.direction }} · {{ cell.element || '五行' }}</span>
          </div>
          <div class="qimen-cell-body">
            <p><span>八神</span><b>{{ cell.god }}</b></p>
            <p><span>九星</span><b>{{ cell.star }}</b></p>
            <p><span>八门</span><b>{{ cell.gate }}</b></p>
            <p><span>天盘干</span><em>{{ cell.heavenStem }}</em></p>
            <p><span>地盘干</span><em>{{ cell.earthStem }}</em></p>
          </div>
          <div v-if="cell.marks.length" class="qimen-cell-tags">
            <small v-for="mark in cell.marks" :key="mark">{{ mark }}</small>
          </div>
        </article>
      </div>
    </div>

    <div class="qimen-foot">
      <span>值符：{{ board.meta.zhiFu }}</span>
      <span>值使：{{ board.meta.zhiShi }}</span>
      <span>旬首：{{ board.meta.xunShou }}</span>
      <span>马星：{{ board.meta.horse }}</span>
      <span>空亡：{{ board.meta.empty }}</span>
    </div>

    <div class="qimen-context">
      <strong>{{ board.center.topic }}</strong>
      <span>{{ board.center.place }} · {{ board.center.time }}</span>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { normalizeQimenBoard } from '../domain/qimen'

const props = defineProps({
  data: { type: Object, default: () => ({}) },
})

const board = computed(() => normalizeQimenBoard(props.data))
</script>

<style scoped>
.qimen-board {
  display: grid;
  gap: 12px;
  padding: 14px;
  border: 1px solid rgba(215, 179, 95, 0.18);
  border-radius: var(--radius-xs);
  background:
    radial-gradient(circle at 50% 50%, rgba(215, 179, 95, 0.1), transparent 42%),
    linear-gradient(145deg, rgba(255, 247, 231, 0.035), rgba(0, 0, 0, 0.12));
}

.qimen-meta,
.qimen-foot,
.qimen-context {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px 18px;
  padding: 8px 10px;
  border: 1px solid rgba(215, 179, 95, 0.12);
  border-radius: var(--radius-xs);
  background: rgba(0, 0, 0, 0.16);
}

.qimen-meta span,
.qimen-foot span,
.qimen-context span {
  color: var(--paper-dim);
  font-size: 13px;
}

.qimen-meta strong,
.qimen-context strong {
  color: var(--gold-bright);
  font-weight: 700;
}

.qimen-shell {
  position: relative;
  display: grid;
  min-height: 560px;
  place-items: center;
  padding: 36px 34px;
}

.qimen-shell::before {
  position: absolute;
  inset: 18px 26px;
  border: 1px solid rgba(215, 179, 95, 0.14);
  border-radius: var(--radius-sm);
  background:
    radial-gradient(circle at 50% 50%, rgba(215, 179, 95, 0.12), transparent 34%),
    linear-gradient(90deg, transparent 49.8%, rgba(215, 179, 95, 0.08) 50%, transparent 50.2%),
    linear-gradient(0deg, transparent 49.8%, rgba(215, 179, 95, 0.08) 50%, transparent 50.2%);
  content: "";
}

.qimen-grid {
  position: relative;
  z-index: 1;
  display: grid;
  width: min(680px, 100%);
  max-width: 100%;
  aspect-ratio: 1;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: repeat(3, minmax(0, 1fr));
  border: 1px solid rgba(240, 217, 132, 0.5);
  background: rgba(13, 9, 7, 0.56);
  box-shadow:
    inset 0 0 32px rgba(0, 0, 0, 0.45),
    0 0 28px rgba(215, 179, 95, 0.14);
}

.qimen-cell {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 8px;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  padding: 12px;
  border-right: 1px solid rgba(215, 179, 95, 0.32);
  border-bottom: 1px solid rgba(215, 179, 95, 0.32);
  background:
    radial-gradient(circle at 80% 12%, rgba(215, 179, 95, 0.1), transparent 28%),
    rgba(255, 247, 231, 0.02);
}

.qimen-cell:nth-child(3n) {
  border-right: 0;
}

.qimen-cell:nth-last-child(-n + 3) {
  border-bottom: 0;
}

.qimen-cell.is-center {
  background:
    radial-gradient(circle, rgba(215, 179, 95, 0.16), rgba(13, 9, 7, 0.72) 64%),
    rgba(0, 0, 0, 0.2);
}

.qimen-cell-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.qimen-cell-head strong {
  min-width: 0;
  overflow: hidden;
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: clamp(20px, 1.75vw, 26px);
  font-weight: 400;
  line-height: 1;
}

.qimen-cell-head span {
  color: rgba(245, 234, 212, 0.48);
  font-size: 12px;
}

.qimen-cell-body {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.qimen-cell-body p {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  min-width: 0;
  align-items: center;
  gap: 6px;
  margin: 0;
  color: var(--paper);
  line-height: 1.18;
}

.qimen-cell-body span {
  color: rgba(245, 234, 212, 0.44);
  font-size: 11px;
  white-space: nowrap;
}

.qimen-cell-body b {
  min-width: 0;
  overflow: hidden;
  color: var(--gold-bright);
  font-size: clamp(13px, 1.2vw, 17px);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.qimen-cell-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-height: 18px;
}

.qimen-cell-tags small {
  padding: 2px 5px;
  border: 1px solid rgba(215, 179, 95, 0.18);
  border-radius: 999px;
  color: rgba(245, 234, 212, 0.68);
  background: rgba(0, 0, 0, 0.12);
  font-size: 10px;
  line-height: 1.1;
}

.qimen-cell-body em {
  overflow: hidden;
  color: var(--paper-dim);
  font-size: 13px;
  font-style: normal;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.qimen-axis {
  position: absolute;
  z-index: 2;
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 400;
  text-shadow: 0 0 14px rgba(215, 179, 95, 0.38);
}

.qimen-axis.south { top: 3px; left: 50%; transform: translateX(-50%); }
.qimen-axis.north { bottom: 2px; left: 50%; transform: translateX(-50%); }
.qimen-axis.east { top: 50%; left: 9px; transform: translateY(-50%); }
.qimen-axis.west { top: 50%; right: 9px; transform: translateY(-50%); }

@media (max-width: 680px) {
  .qimen-board {
    padding: 10px;
  }

  .qimen-meta,
  .qimen-foot,
  .qimen-context {
    justify-content: flex-start;
    gap: 6px 10px;
  }

  .qimen-shell {
    min-height: 360px;
    padding: 28px 22px;
  }

  .qimen-grid {
    width: min(330px, 100%);
  }

  .qimen-cell {
    gap: 4px;
    padding: 6px;
  }

  .qimen-cell-head {
    display: grid;
    gap: 2px;
  }

  .qimen-cell-head strong {
    font-size: 16px;
  }

  .qimen-cell-head span,
  .qimen-cell-body span,
  .qimen-cell-body em {
    font-size: 10px;
  }

  .qimen-cell-body b {
    font-size: 11px;
  }

  .qimen-cell-body p {
    grid-template-columns: 38px minmax(0, 1fr);
  }

  .qimen-cell-tags small {
    font-size: 9px;
  }

  .qimen-axis {
    font-size: 16px;
  }
}
</style>
