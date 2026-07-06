<template>
  <section class="ziwei-board" aria-label="紫微斗数十二宫盘">
    <div class="ziwei-ring outer" />
    <div class="ziwei-ring middle" />
    <article
      v-for="(palace, index) in board.palaces"
      :key="`${palace.name}-${index}`"
      class="ziwei-palace"
      :class="{ 'is-ming': palace.note.includes('命宫'), 'is-body': palace.note.includes('身宫') }"
      :style="{ '--a': `${index * 30}deg` }"
    >
      <span>{{ palace.branch }}</span>
      <strong>{{ palace.name }}</strong>
      <b>{{ palace.star }}</b>
      <em>{{ palace.minor }}</em>
      <small>{{ palace.age }}</small>
    </article>
    <article class="ziwei-center">
      <b>紫微斗数</b>
      <strong>{{ board.meta.soul }}</strong>
      <span>{{ board.meta.body }}</span>
      <small>{{ board.meta.fiveElementsClass }} · {{ board.center }}</small>
    </article>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { normalizeZiweiBoard } from '../domain/metaphysics'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
const board = computed(() => normalizeZiweiBoard(props.data))
</script>

<style scoped>
.ziwei-board {
  position: relative;
  display: grid;
  width: min(640px, 100%);
  aspect-ratio: 1;
  place-items: center;
  justify-self: center;
  overflow: hidden;
  border: 1px solid rgba(215, 179, 95, 0.18);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(215, 179, 95, 0.12), transparent 34%), rgba(0, 0, 0, 0.14);
}

.ziwei-ring,
.ziwei-palace,
.ziwei-center {
  position: absolute;
}

.ziwei-ring {
  border: 1px solid rgba(215, 179, 95, 0.24);
  border-radius: 50%;
}

.ziwei-ring.outer { inset: 6%; }
.ziwei-ring.middle { inset: 25%; }

.ziwei-palace {
  display: grid;
  width: 112px;
  min-height: 92px;
  align-content: center;
  gap: 3px;
  padding: 8px;
  border: 1px solid rgba(215, 179, 95, 0.2);
  border-radius: var(--radius-xs);
  background: rgba(13, 9, 7, 0.74);
  text-align: center;
  transform: rotate(var(--a)) translateY(-235px) rotate(calc(-1 * var(--a)));
}

.ziwei-palace.is-ming,
.ziwei-palace.is-body {
  border-color: rgba(240, 217, 132, 0.48);
  background: rgba(184, 58, 47, 0.18);
}

.ziwei-palace span,
.ziwei-palace small,
.ziwei-center span,
.ziwei-center small {
  color: var(--paper-dim);
  font-size: 11px;
}

.ziwei-palace strong,
.ziwei-center b {
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-weight: 400;
}

.ziwei-palace b,
.ziwei-center strong {
  color: var(--paper);
}

.ziwei-palace em {
  overflow: hidden;
  color: var(--paper-dim);
  font-size: 11px;
  font-style: normal;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ziwei-center {
  display: grid;
  width: 176px;
  min-height: 128px;
  place-items: center;
  gap: 5px;
  padding: 14px;
  border: 1px solid rgba(240, 217, 132, 0.38);
  border-radius: var(--radius-xs);
  background: rgba(13, 9, 7, 0.9);
  text-align: center;
}

.ziwei-center b {
  font-size: 28px;
}

@media (max-width: 680px) {
  .ziwei-board {
    width: min(330px, 94vw);
  }

  .ziwei-palace {
    width: 72px;
    min-height: 66px;
    padding: 5px;
    transform: rotate(var(--a)) translateY(-128px) rotate(calc(-1 * var(--a)));
  }

  .ziwei-palace em,
  .ziwei-palace small {
    display: none;
  }

  .ziwei-center {
    width: 122px;
    min-height: 104px;
  }
}
</style>
