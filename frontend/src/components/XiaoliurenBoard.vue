<template>
  <section class="xiaoliuren-board-shell" aria-label="小六壬六宫盘">
    <div class="xiaoliuren-board">
      <article class="xiaoliuren-center">
        <span>{{ board.meta.method }}</span>
        <strong>{{ board.meta.primary }}</strong>
        <em>{{ board.meta.fortune || board.meta.tendency }}</em>
      </article>
      <article
        v-for="(item, index) in board.palaces"
        :key="item.name"
        class="xiaoliuren-gate"
        :class="{ 'is-primary': item.isPrimary, 'is-sequence': item.isInSequence }"
        :style="{ '--a': `${index * 60}deg` }"
      >
        <span>{{ item.name }}</span>
        <b>{{ item.element }} · {{ item.fortune }}</b>
        <em>{{ item.tendency }}</em>
      </article>
    </div>

    <div class="xiaoliuren-stages" aria-label="起因过程结果">
      <article v-for="stage in board.stages" :key="stage.key || stage.label">
        <span>{{ stage.label }}</span>
        <strong>{{ stage.name }}</strong>
        <em>{{ stage.state || stage.tendency || '待观察' }}</em>
      </article>
    </div>

    <footer class="xiaoliuren-meta">
      <span>方位：{{ board.meta.direction || '待定' }}</span>
      <span>应期：{{ board.meta.timing || '待定' }}</span>
      <span>神煞：{{ board.meta.shenSha || '待定' }}</span>
      <p>{{ board.meta.questionHint || board.meta.relation || '以当前六宫落点作快速参考。' }}</p>
    </footer>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { normalizeXiaoliurenBoard } from '../domain/metaphysics'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
const board = computed(() => normalizeXiaoliurenBoard(props.data))
</script>

<style scoped>
.xiaoliuren-board-shell {
  display: grid;
  gap: 12px;
  justify-items: center;
}

.xiaoliuren-board {
  position: relative;
  display: grid;
  width: min(520px, 100%);
  aspect-ratio: 1;
  place-items: center;
  justify-self: center;
  overflow: visible;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(13, 9, 7, 0.82) 0 28%, transparent 29%), conic-gradient(rgba(215, 179, 95, 0.08), rgba(184, 58, 47, 0.12), rgba(79, 155, 131, 0.1), rgba(215, 179, 95, 0.08));
}

.xiaoliuren-center,
.xiaoliuren-gate {
  position: absolute;
  display: grid;
  place-items: center;
  text-align: center;
}

.xiaoliuren-center {
  align-content: center;
  gap: 5px;
  width: 140px;
  height: 140px;
  border: 1px solid rgba(240, 217, 132, 0.4);
  border-radius: 50%;
  background: rgba(13, 9, 7, 0.9);
}

.xiaoliuren-center strong,
.xiaoliuren-gate span {
  color: var(--gold-bright);
  font-family: var(--font-display);
}

.xiaoliuren-center strong {
  font-size: 30px;
  font-weight: 400;
}

.xiaoliuren-center span,
.xiaoliuren-center em,
.xiaoliuren-gate em,
.xiaoliuren-gate b,
.xiaoliuren-stages span,
.xiaoliuren-stages em,
.xiaoliuren-meta {
  color: var(--paper-dim);
  font-style: normal;
}

.xiaoliuren-gate {
  width: 104px;
  min-height: 82px;
  padding: 10px;
  border: 1px solid rgba(215, 179, 95, 0.16);
  border-radius: var(--radius-xs);
  background: rgba(13, 9, 7, 0.62);
  transform: rotate(var(--a)) translateY(-178px) rotate(calc(-1 * var(--a)));
}

.xiaoliuren-gate span {
  font-size: 24px;
}

.xiaoliuren-gate b {
  font-size: 11px;
}

.xiaoliuren-gate.is-primary {
  border-color: rgba(184, 58, 47, 0.68);
  box-shadow: 0 0 18px rgba(184, 58, 47, 0.18);
}

.xiaoliuren-gate.is-sequence:not(.is-primary) {
  border-color: rgba(240, 217, 132, 0.34);
}

.xiaoliuren-stages,
.xiaoliuren-meta {
  display: grid;
  width: min(620px, 100%);
  border: 1px solid rgba(215, 179, 95, 0.14);
  border-radius: var(--radius-xs);
  background: rgba(0, 0, 0, 0.14);
}

.xiaoliuren-stages {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  padding: 10px;
}

.xiaoliuren-stages article {
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 9px;
  border: 1px solid rgba(215, 179, 95, 0.1);
  border-radius: var(--radius-xs);
  text-align: center;
}

.xiaoliuren-stages strong {
  color: var(--gold-bright);
}

.xiaoliuren-meta {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  padding: 10px;
}

.xiaoliuren-meta span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xiaoliuren-meta p {
  grid-column: 1 / -1;
  margin: 0;
  color: var(--paper);
  line-height: 1.55;
}

@media (max-width: 680px) {
  .xiaoliuren-board {
    width: min(330px, 94vw);
  }

  .xiaoliuren-gate {
    width: 76px;
    min-height: 64px;
    padding: 6px;
    transform: rotate(var(--a)) translateY(-118px) rotate(calc(-1 * var(--a)));
  }

  .xiaoliuren-gate em {
    display: none;
  }

  .xiaoliuren-gate b {
    display: none;
  }

  .xiaoliuren-center {
    width: 112px;
    height: 112px;
  }

  .xiaoliuren-stages,
  .xiaoliuren-meta {
    grid-template-columns: 1fr;
  }
}
</style>
