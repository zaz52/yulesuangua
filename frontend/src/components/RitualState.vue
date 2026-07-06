<template>
  <section
    class="ritual-state"
    :class="[`is-${variant}`, { 'is-compact': compact, 'is-bordered': bordered }]"
    :role="computedRole"
    :aria-live="live"
    :aria-busy="variant === 'loading' ? 'true' : undefined"
    :aria-label="computedAriaLabel"
    tabindex="-1"
  >
    <div v-if="$slots.media || hasVisualMedia" class="ritual-state-media" aria-hidden="true">
      <slot name="media">
        <span v-if="variant === 'loading'" class="state-spinner"></span>
        <span v-else class="state-icon">{{ icon || fallbackIcon }}</span>
      </slot>
    </div>

    <component :is="headingTag" class="ritual-state-title">
      <slot name="title">{{ title || fallbackTitle }}</slot>
    </component>

    <div v-if="description || $slots.default" class="ritual-state-description">
      <slot>{{ description }}</slot>
    </div>

    <div v-if="actions?.length || $slots.actions" class="ritual-state-actions">
      <slot name="actions">
        <button
          v-for="action in actions"
          :key="action.key || action.label"
          class="ds-button"
          :class="action.tone || 'ghost'"
          type="button"
          :disabled="action.disabled"
          @click="$emit('action', action)"
        >
          {{ action.label }}
        </button>
      </slot>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'empty',
    validator: (value) => ['idle', 'loading', 'empty', 'error', 'success', 'info'].includes(value),
  },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  icon: { type: String, default: '' },
  actions: { type: Array, default: () => [] },
  compact: { type: Boolean, default: false },
  bordered: { type: Boolean, default: true },
  role: { type: String, default: '' },
  live: { type: String, default: 'polite' },
  ariaLabel: { type: String, default: '' },
  headingLevel: {
    type: Number,
    default: 2,
    validator: (value) => value >= 2 && value <= 6,
  },
})

defineEmits(['action'])

const fallbackMap = {
  idle: { title: '等待开始', icon: '卦' },
  loading: { title: '正在推演', icon: '' },
  empty: { title: '暂无内容', icon: '空' },
  error: { title: '暂时无法完成', icon: '!' },
  success: { title: '已完成', icon: '成' },
  info: { title: '提示', icon: 'i' },
}

const fallbackTitle = computed(() => fallbackMap[props.variant]?.title || fallbackMap.empty.title)
const fallbackIcon = computed(() => fallbackMap[props.variant]?.icon || fallbackMap.empty.icon)
const hasVisualMedia = computed(() => props.variant === 'loading' || Boolean(props.icon || fallbackIcon.value))
const headingTag = computed(() => `h${props.headingLevel}`)
const computedRole = computed(() => props.role || (props.variant === 'error' ? 'alert' : 'status'))
const computedAriaLabel = computed(() => props.ariaLabel || props.title || fallbackTitle.value)
</script>

<style scoped>
.ritual-state {
  position: relative;
  display: grid;
  min-height: 220px;
  place-items: center;
  align-content: center;
  gap: 12px;
  padding: 24px;
  border-radius: var(--radius-sm);
  color: var(--paper);
  text-align: center;
}

.ritual-state.is-bordered {
  border: 1px solid rgba(215, 179, 95, 0.18);
  background:
    radial-gradient(circle at 50% 0%, rgba(215, 179, 95, 0.12), transparent 42%),
    rgba(255, 247, 231, 0.035);
}

.ritual-state.is-compact {
  min-height: auto;
  justify-items: start;
  padding: 12px;
  text-align: left;
}

.ritual-state-media {
  display: grid;
  width: 56px;
  height: 56px;
  place-items: center;
}

.state-icon {
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  border: 1px solid rgba(240, 217, 132, 0.4);
  border-radius: 50%;
  color: var(--gold-bright);
  background: rgba(255, 247, 231, 0.05);
  font-family: var(--font-display);
  font-size: 24px;
}

.state-spinner {
  width: 48px;
  height: 48px;
  border: 2px solid rgba(215, 179, 95, 0.26);
  border-top-color: var(--seal);
  border-radius: 50%;
  animation: state-spin 1s linear infinite;
}

.ritual-state-title {
  margin: 0;
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: clamp(24px, 4vw, 34px);
  font-weight: 400;
  line-height: 1.12;
}

.ritual-state-description {
  max-width: 540px;
  margin: 0;
  color: var(--paper-dim);
}

.ritual-state-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 4px;
}

.is-compact .ritual-state-actions {
  justify-content: flex-start;
}

.is-error .state-icon {
  border-color: rgba(184, 58, 47, 0.48);
  color: #ffb0a5;
  background: rgba(184, 58, 47, 0.12);
}

.is-success .state-icon {
  border-color: rgba(79, 155, 131, 0.4);
  color: #9ad8c5;
  background: rgba(79, 155, 131, 0.12);
}

@keyframes state-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .state-spinner {
    animation: none;
  }
}
</style>
