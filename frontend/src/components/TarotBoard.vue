<template>
  <section
    class="tarot-board"
    :class="[`layout-${layoutKind}`, { 'is-empty': board.cards.length === 0 }]"
    aria-label="塔罗牌阵"
  >
    <header class="tarot-board-head">
      <div>
        <span class="tarot-kicker">Tarot Spread</span>
        <strong class="tarot-spread-name">{{ board.spread }}</strong>
      </div>
      <dl class="tarot-summary" aria-label="牌阵摘要">
        <div>
          <dt>主导能量</dt>
          <dd>{{ board.summary.dominantSuit || '综合' }}</dd>
        </div>
        <div>
          <dt>逆位</dt>
          <dd>{{ board.summary.reversedCount || 0 }}/{{ board.summary.cardCount || board.cards.length }}</dd>
        </div>
        <div>
          <dt>节奏</dt>
          <dd>{{ board.summary.tendency || '观察后行动' }}</dd>
        </div>
      </dl>
    </header>

    <p v-if="board.summary.focus" class="tarot-focus">{{ board.summary.focus }}</p>

    <div v-if="board.cards.length" class="tarot-spread-stage" :class="`stage-${layoutKind}`">
      <article
        v-for="card in board.cards"
        :key="card.id"
        class="tarot-card"
        :class="[{ 'is-reversed': card.isReversed }, `area-${cardArea(card)}`]"
      >
        <div class="tarot-card-face" aria-hidden="true">
          <span class="tarot-card-index">{{ String(card.index).padStart(2, '0') }}</span>
          <b>{{ cardGlyph(card) }}</b>
          <i>{{ card.element || '灵性' }}</i>
        </div>
        <div class="tarot-card-copy">
          <span class="tarot-position">{{ card.position }}</span>
          <h4>{{ card.name }}</h4>
          <div class="tarot-meta">
            <span>{{ card.orientation }}</span>
            <span>{{ card.suit || card.type }}</span>
          </div>
          <div class="tarot-keywords" aria-label="关键词">
            <em v-for="keyword in card.keywords" :key="`${card.id}-${keyword}`">{{ keyword }}</em>
          </div>
          <p>{{ card.advice || card.meaning }}</p>
        </div>
      </article>
    </div>

    <div v-else class="tarot-empty" role="status">
      <strong>牌阵未生成</strong>
      <span>补全问题后开始排盘，会在这里显示每张牌的位置、正逆位和建议。</span>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { normalizeTarotBoard } from '../domain/metaphysics'

const props = defineProps({ data: { type: Object, default: () => ({}) } })
const board = computed(() => normalizeTarotBoard(props.data))
const layoutKind = computed(() => board.value.layout?.kind || board.value.spreadType || 'three')

function cardArea(card) {
  return board.value.layout?.positions?.find((item) => item.id === card.id)?.area || `slot-${card.index}`
}

function cardGlyph(card) {
  const suit = card.suit || ''
  if (suit.includes('权杖')) return '杖'
  if (suit.includes('圣杯')) return '杯'
  if (suit.includes('宝剑')) return '剑'
  if (suit.includes('钱币') || suit.includes('星币')) return '币'
  return '塔'
}
</script>

<style scoped>
.tarot-board {
  display: grid;
  gap: 14px;
  padding: 14px;
  min-width: 0;
}

.tarot-board-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 0.9fr);
  gap: 12px;
  align-items: stretch;
}

.tarot-kicker {
  display: block;
  color: var(--seal);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
}

.tarot-spread-name {
  display: block;
  margin-top: 4px;
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 400;
  line-height: 1.15;
}

.tarot-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 0;
}

.tarot-summary div,
.tarot-card,
.tarot-empty {
  border: 1px solid rgba(215, 179, 95, 0.16);
  border-radius: var(--radius-xs);
  background: rgba(255, 247, 231, 0.045);
}

.tarot-summary div {
  display: grid;
  align-content: center;
  gap: 4px;
  min-height: 64px;
  padding: 10px;
}

.tarot-summary dt,
.tarot-position,
.tarot-card-index {
  color: var(--seal);
  font-size: 12px;
  font-weight: 700;
}

.tarot-summary dd {
  margin: 0;
  color: var(--paper);
  font-weight: 700;
}

.tarot-focus {
  margin: 0;
  color: var(--paper-dim);
  line-height: 1.7;
}

.tarot-spread-stage {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.stage-single {
  grid-template-columns: minmax(0, 420px);
  justify-content: center;
}

.stage-timeline,
.stage-three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.stage-decision {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-areas:
    "left center right"
    "left advice right";
}

.stage-relationship,
.stage-love {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.tarot-card {
  display: grid;
  grid-template-rows: 180px minmax(0, 1fr);
  min-width: 0;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 22%, rgba(215, 179, 95, 0.13), transparent 34%),
    linear-gradient(135deg, rgba(177, 49, 35, 0.16), transparent 62%),
    rgba(255, 247, 231, 0.045);
}

.tarot-card.is-reversed .tarot-card-face {
  transform: rotate(180deg);
}

.area-left {
  grid-area: left;
}

.area-right {
  grid-area: right;
}

.area-center {
  grid-area: center;
}

.area-advice {
  grid-area: advice;
}

.tarot-card-face {
  position: relative;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 6px;
  min-height: 180px;
  border-bottom: 1px solid rgba(215, 179, 95, 0.14);
  background:
    linear-gradient(90deg, transparent 48%, rgba(215, 179, 95, 0.13) 49% 51%, transparent 52%),
    radial-gradient(circle, rgba(13, 9, 7, 0.76), rgba(13, 9, 7, 0.18));
  transition: transform 220ms ease;
}

.tarot-card-face b {
  display: grid;
  width: 74px;
  height: 74px;
  place-items: center;
  border: 1px solid rgba(240, 217, 132, 0.42);
  border-radius: 50%;
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 34px;
  font-weight: 400;
}

.tarot-card-face i {
  color: var(--paper-dim);
  font-style: normal;
}

.tarot-card-index {
  position: absolute;
  top: 10px;
  left: 10px;
}

.tarot-card-copy {
  display: grid;
  align-content: start;
  gap: 8px;
  min-width: 0;
  padding: 13px;
}

.tarot-card-copy h4 {
  margin: 0;
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: 25px;
  font-weight: 400;
  line-height: 1.15;
}

.tarot-meta,
.tarot-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tarot-meta span,
.tarot-keywords em {
  padding: 4px 7px;
  border: 1px solid rgba(215, 179, 95, 0.16);
  border-radius: 999px;
  color: var(--paper-dim);
  background: rgba(0, 0, 0, 0.12);
  font-size: 12px;
  font-style: normal;
  line-height: 1.2;
}

.tarot-keywords em {
  color: var(--gold-bright);
}

.tarot-card-copy p {
  margin: 0;
  color: var(--paper);
  line-height: 1.65;
  word-break: break-word;
}

.tarot-empty {
  display: grid;
  gap: 6px;
  min-height: 120px;
  place-items: center;
  padding: 18px;
  text-align: center;
}

.tarot-empty strong {
  color: var(--gold-bright);
}

.tarot-empty span {
  color: var(--paper-dim);
}

@media (max-width: 980px) {
  .tarot-board-head,
  .stage-timeline,
  .stage-three,
  .stage-decision,
  .stage-relationship,
  .stage-love {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .stage-decision {
    grid-template-areas: none;
  }

  .area-left,
  .area-right,
  .area-center,
  .area-advice {
    grid-area: auto;
  }
}

@media (max-width: 680px) {
  .tarot-board {
    padding: 10px;
  }

  .tarot-board-head,
  .tarot-summary,
  .stage-single,
  .stage-timeline,
  .stage-three,
  .stage-decision,
  .stage-relationship,
  .stage-love {
    grid-template-columns: 1fr;
  }

  .tarot-card {
    grid-template-rows: auto;
  }

  .tarot-card-face {
    min-height: 132px;
  }
}
</style>
