<template>
  <section class="daliuren-plate-board" aria-label="大六壬课盘">
    <div class="daliuren-ring outer">
      <span v-for="(item, index) in board.branches" :key="item" :style="{ '--a': `${index * 30}deg` }">{{ item }}</span>
    </div>
    <div class="daliuren-ring middle">
      <span v-for="(item, index) in board.gods" :key="item" :style="{ '--a': `${index * 60 + 15}deg` }">{{ item }}</span>
    </div>
    <article class="daliuren-center">
      <strong>{{ board.center.time }}</strong>
      <span>旬首：{{ board.center.xun }}</span>
      <span>值符：{{ board.center.zhiFu }}</span>
      <span>值使：{{ board.center.zhiShi }}</span>
    </article>
    <div class="daliuren-pass">
      <div v-for="(name, index) in ['初传', '中传', '末传']" :key="name">
        <span>{{ name }}</span>
        <strong>{{ board.passes[index] || ['癸酉', '壬申', '辛未'][index] }}</strong>
      </div>
    </div>
    <footer class="daliuren-foot">
      <span>四课：{{ board.items[0]?.[1] }}</span>
      <span>课体：{{ board.items[2]?.[1] }}</span>
    </footer>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { normalizeDaliurenBoard } from '../domain/metaphysics'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
const board = computed(() => normalizeDaliurenBoard(props.data))
</script>

<style scoped>
.daliuren-plate-board {
  position: relative;
  display: grid;
  width: min(620px, 100%);
  aspect-ratio: 1;
  place-items: center;
  justify-self: center;
  overflow: hidden;
  border: 1px solid rgba(215, 179, 95, 0.18);
  border-radius: var(--radius-sm);
  background: radial-gradient(circle, rgba(215, 179, 95, 0.12), transparent 38%), rgba(0, 0, 0, 0.12);
}

.daliuren-ring,
.daliuren-ring span,
.daliuren-center,
.daliuren-pass,
.daliuren-foot {
  position: absolute;
}

.daliuren-ring {
  border: 1px solid rgba(215, 179, 95, 0.28);
  border-radius: 50%;
}

.daliuren-ring.outer { inset: 8%; }
.daliuren-ring.middle { inset: 24%; }

.daliuren-ring span {
  top: 50%;
  left: 50%;
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 22px;
  transform: rotate(var(--a)) translateY(-244px) rotate(calc(-1 * var(--a)));
}

.daliuren-ring.middle span {
  font-size: 15px;
  transform: rotate(var(--a)) translateY(-164px) rotate(calc(-1 * var(--a)));
}

.daliuren-center {
  display: grid;
  width: 170px;
  height: 170px;
  place-items: center;
  align-content: center;
  gap: 6px;
  border: 1px solid rgba(240, 217, 132, 0.46);
  border-radius: 50%;
  background: rgba(13, 9, 7, 0.9);
  text-align: center;
}

.daliuren-center strong,
.daliuren-pass strong {
  color: var(--gold-bright);
}

.daliuren-center span,
.daliuren-foot span,
.daliuren-pass span {
  color: var(--paper-dim);
}

.daliuren-pass,
.daliuren-foot {
  right: 18px;
  left: 18px;
  display: flex;
  justify-content: center;
  gap: 14px;
  padding: 9px 12px;
  border: 1px solid rgba(215, 179, 95, 0.16);
  border-radius: var(--radius-xs);
  background: rgba(0, 0, 0, 0.18);
}

.daliuren-pass {
  bottom: 54px;
}

.daliuren-foot {
  bottom: 14px;
}

@media (max-width: 680px) {
  .daliuren-plate-board {
    width: min(330px, 94vw);
  }

  .daliuren-ring span {
    font-size: 15px;
    transform: rotate(var(--a)) translateY(-132px) rotate(calc(-1 * var(--a)));
  }

  .daliuren-ring.middle span,
  .daliuren-foot {
    display: none;
  }

  .daliuren-center {
    width: 118px;
    height: 118px;
  }
}
</style>
