<template>
  <section class="meihua-board" aria-label="梅花易数排盘">
    <header class="meihua-meta">
      <span>起课：{{ board.meta.solar }}</span>
      <span>阴历：{{ board.meta.lunar }}</span>
      <strong>{{ board.meta.method }}</strong>
    </header>

    <div class="meihua-plate">
      <div class="meihua-axis top">本卦</div>
      <div class="meihua-axis left">互卦</div>
      <div class="meihua-axis right">变卦</div>
      <div class="meihua-axis bottom">体用</div>

      <article class="meihua-core" aria-label="体用关系">
        <span>体用生克</span>
        <strong>{{ board.relation.text }}</strong>
        <em>{{ board.relation.body }} / {{ board.relation.use }}</em>
        <small>{{ board.relation.movingLine }}</small>
      </article>

      <article
        v-for="item in hexagrams"
        :key="item.key"
        class="meihua-hex"
        :class="`pos-${item.key}`"
      >
        <span>{{ item.data.label }}</span>
        <strong>{{ item.data.name }}</strong>
        <div class="trigrams">
          <b>{{ item.data.upper.symbol }}</b>
          <i>{{ item.data.upper.name }}{{ item.data.upper.nature }}</i>
          <b>{{ item.data.lower.symbol }}</b>
          <i>{{ item.data.lower.name }}{{ item.data.lower.nature }}</i>
        </div>
        <em>{{ item.data.note }}</em>
      </article>
    </div>

    <footer class="meihua-clues">
      <div v-for="clue in board.clues" :key="clue.label">
        <span>{{ clue.label }}</span>
        <strong>{{ clue.value }}</strong>
      </div>
    </footer>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { normalizeMeihuaBoard } from '../domain/meihua'

const props = defineProps({
  data: { type: Object, default: () => ({}) },
})

const board = computed(() => normalizeMeihuaBoard(props.data))
const hexagrams = computed(() => [
  { key: 'original', data: board.value.original },
  { key: 'mutual', data: board.value.mutual },
  { key: 'changed', data: board.value.changed },
])
</script>

<style scoped>
.meihua-board {
  display: grid;
  gap: 12px;
  padding: 14px;
  border: 1px solid rgba(215, 179, 95, 0.18);
  border-radius: var(--radius-xs);
  background:
    radial-gradient(circle at 50% 42%, rgba(215, 179, 95, 0.13), transparent 38%),
    linear-gradient(145deg, rgba(255, 247, 231, 0.035), rgba(0, 0, 0, 0.12));
}

.meihua-meta,
.meihua-clues {
  display: grid;
  gap: 8px;
  border: 1px solid rgba(215, 179, 95, 0.12);
  border-radius: var(--radius-xs);
  background: rgba(0, 0, 0, 0.16);
}

.meihua-meta {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: 9px 12px;
}

.meihua-meta span,
.meihua-clues span,
.meihua-hex span,
.meihua-core span,
.meihua-core small {
  color: rgba(245, 234, 212, 0.62);
  font-size: 12px;
}

.meihua-meta strong {
  color: var(--gold-bright);
  text-align: right;
}

.meihua-plate {
  position: relative;
  display: grid;
  min-height: 560px;
  place-items: center;
  overflow: hidden;
  border: 1px solid rgba(215, 179, 95, 0.16);
  border-radius: var(--radius-sm);
  background:
    linear-gradient(90deg, transparent 49.8%, rgba(215, 179, 95, 0.08) 50%, transparent 50.2%),
    linear-gradient(0deg, transparent 49.8%, rgba(215, 179, 95, 0.08) 50%, transparent 50.2%),
    radial-gradient(circle at 50% 50%, rgba(184, 58, 47, 0.16), transparent 25%),
    rgba(13, 9, 7, 0.42);
}

.meihua-plate::before,
.meihua-plate::after {
  position: absolute;
  border: 1px solid rgba(215, 179, 95, 0.22);
  border-radius: 50%;
  content: "";
}

.meihua-plate::before {
  width: min(470px, 82%);
  aspect-ratio: 1;
}

.meihua-plate::after {
  width: min(310px, 56%);
  aspect-ratio: 1;
}

.meihua-axis {
  position: absolute;
  z-index: 2;
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 20px;
  text-shadow: 0 0 14px rgba(215, 179, 95, 0.38);
}

.meihua-axis.top { top: 15px; }
.meihua-axis.bottom { bottom: 15px; }
.meihua-axis.left { left: 18px; top: 50%; transform: translateY(-50%); }
.meihua-axis.right { right: 18px; top: 50%; transform: translateY(-50%); }

.meihua-core,
.meihua-hex {
  position: absolute;
  z-index: 3;
  display: grid;
  place-items: center;
  text-align: center;
}

.meihua-core {
  width: 166px;
  min-height: 166px;
  align-content: center;
  gap: 7px;
  padding: 16px;
  border: 1px solid rgba(240, 217, 132, 0.48);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(177, 49, 35, 0.22), rgba(13, 9, 7, 0.9) 68%);
  box-shadow: 0 0 30px rgba(215, 179, 95, 0.13);
}

.meihua-core strong {
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 400;
}

.meihua-core em {
  color: var(--paper);
  font-style: normal;
}

.meihua-hex {
  width: 178px;
  min-height: 168px;
  align-content: center;
  gap: 6px;
  padding: 14px;
  border: 1px solid rgba(215, 179, 95, 0.26);
  border-radius: var(--radius-xs);
  background:
    radial-gradient(circle at 50% 0%, rgba(215, 179, 95, 0.16), transparent 48%),
    rgba(13, 9, 7, 0.78);
}

.meihua-hex.pos-original { top: 62px; left: 50%; transform: translateX(-50%); }
.meihua-hex.pos-mutual { bottom: 70px; left: 12%; }
.meihua-hex.pos-changed { right: 12%; bottom: 70px; }

.meihua-hex strong {
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 400;
  line-height: 1.1;
}

.meihua-hex em {
  color: var(--paper-dim);
  font-size: 12px;
  font-style: normal;
  line-height: 1.45;
}

.trigrams {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  align-items: center;
  gap: 2px 8px;
  color: var(--paper);
}

.trigrams b {
  color: var(--gold-bright);
  font-size: 24px;
  line-height: 1;
}

.trigrams i {
  color: var(--paper);
  font-size: 13px;
  font-style: normal;
  text-align: left;
}

.meihua-clues {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  padding: 10px;
}

.meihua-clues div {
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 8px 10px;
  border-left: 1px solid rgba(215, 179, 95, 0.12);
}

.meihua-clues div:first-child {
  border-left: 0;
}

.meihua-clues strong {
  min-width: 0;
  overflow: hidden;
  color: var(--paper);
  font-size: 13px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 680px) {
  .meihua-board {
    padding: 10px;
  }

  .meihua-meta,
  .meihua-clues {
    grid-template-columns: 1fr;
  }

  .meihua-meta strong {
    text-align: left;
  }

  .meihua-plate {
    min-height: 420px;
  }

  .meihua-core {
    width: 126px;
    min-height: 126px;
    padding: 10px;
  }

  .meihua-core strong {
    font-size: 22px;
  }

  .meihua-hex {
    width: 118px;
    min-height: 118px;
    padding: 8px;
  }

  .meihua-hex.pos-original { top: 48px; }
  .meihua-hex.pos-mutual { bottom: 48px; left: 6%; }
  .meihua-hex.pos-changed { right: 6%; bottom: 48px; }

  .meihua-hex strong {
    font-size: 18px;
  }

  .meihua-hex em,
  .trigrams i {
    display: none;
  }

  .trigrams {
    grid-template-columns: repeat(2, 1fr);
  }

  .trigrams b {
    font-size: 20px;
  }

  .meihua-clues div {
    border-left: 0;
    border-top: 1px solid rgba(215, 179, 95, 0.12);
  }

  .meihua-clues div:first-child {
    border-top: 0;
  }
}
</style>
