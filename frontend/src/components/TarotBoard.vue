<template>
  <section class="tarot-board" aria-label="塔罗牌阵">
    <aside class="tarot-spread-name">{{ board.spread }}</aside>
    <article v-for="card in board.cards" :key="`${card[0]}-${card[1]}`" class="tarot-card">
      <span>{{ card[0] }}</span>
      <strong>{{ card[1] }}</strong>
      <em>{{ card[2] }}</em>
    </article>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { normalizeTarotBoard } from '../domain/metaphysics'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
const board = computed(() => normalizeTarotBoard(props.data))
</script>

<style scoped>
.tarot-board {
  display: grid;
  grid-template-columns: 120px repeat(3, minmax(0, 1fr));
  gap: 10px;
  padding: 12px;
}

.tarot-spread-name,
.tarot-card {
  display: grid;
  place-items: center;
  border: 1px solid rgba(215, 179, 95, 0.16);
  border-radius: var(--radius-xs);
  background: rgba(255, 247, 231, 0.045);
  text-align: center;
}

.tarot-spread-name {
  color: var(--gold-bright);
  writing-mode: vertical-rl;
}

.tarot-card {
  min-height: 180px;
  gap: 8px;
  padding: 14px;
  background: linear-gradient(135deg, rgba(177, 49, 35, 0.16), transparent), rgba(255, 247, 231, 0.045);
}

.tarot-card span {
  color: var(--seal);
  font-weight: 700;
}

.tarot-card strong {
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 25px;
  font-weight: 400;
}

.tarot-card em {
  color: var(--paper-dim);
  font-style: normal;
}

@media (max-width: 680px) {
  .tarot-board {
    grid-template-columns: 1fr;
  }

  .tarot-spread-name {
    writing-mode: horizontal-tb;
    min-height: 48px;
  }
}
</style>
