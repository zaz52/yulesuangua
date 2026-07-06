<template>
  <section class="xiaoliuren-board" aria-label="小六壬六宫盘">
    <article class="xiaoliuren-center">
      <strong>小六壬</strong>
      <span>六宫速断</span>
    </article>
    <article
      v-for="(item, index) in board.items"
      :key="item[0]"
      class="xiaoliuren-gate"
      :style="{ '--a': `${index * 60}deg` }"
    >
      <span>{{ item[0] }}</span>
      <em>{{ item[1] }}</em>
    </article>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { normalizeXiaoliurenBoard } from '../domain/metaphysics'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
const board = computed(() => normalizeXiaoliurenBoard(props.data))
</script>

<style scoped>
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
.xiaoliuren-gate em {
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

  .xiaoliuren-center {
    width: 112px;
    height: 112px;
  }
}
</style>
