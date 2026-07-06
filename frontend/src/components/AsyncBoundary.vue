<template>
  <section
    class="async-boundary"
    :class="[
      `is-${resolvedStatus}`,
      layoutClass,
      {
        'is-compact': compact,
        'is-bordered': bordered,
        'has-data': hasData,
      },
    ]"
    :style="boundaryStyle"
    :aria-label="computedAriaLabel"
    :aria-busy="resolvedStatus === 'loading' ? 'true' : undefined"
    :aria-live="live"
    :role="computedRole"
  >
    <header v-if="$slots.header || title || eyebrow" class="async-boundary-header">
      <slot
        name="header"
        :status="resolvedStatus"
        :data="resolvedData"
        :error="resolvedError"
        :reload="reload"
        :reset="reset"
      >
        <div>
          <span v-if="eyebrow" class="async-boundary-eyebrow">{{ eyebrow }}</span>
          <component :is="headingTag" v-if="title" class="async-boundary-title">{{ title }}</component>
          <p v-if="description" class="async-boundary-description">{{ description }}</p>
        </div>
      </slot>
    </header>

    <div class="async-boundary-body">
      <slot
        v-if="resolvedStatus === 'success'"
        :data="resolvedData"
        :status="resolvedStatus"
        :reload="reload"
        :reset="reset"
      />

      <slot v-else-if="resolvedStatus === 'loading'" name="loading" :status="resolvedStatus">
        <RitualState
          :compact="compact"
          :bordered="false"
          variant="loading"
          :title="loadingTitle"
          :description="loadingDescription"
          :heading-level="headingLevel"
        />
      </slot>

      <slot v-else-if="resolvedStatus === 'error'" name="error" :error="resolvedError" :reload="reload" :reset="reset">
        <RitualState
          :compact="compact"
          :bordered="false"
          variant="error"
          :title="errorTitle"
          :description="errorMessage"
          :actions="stateActions"
          :heading-level="headingLevel"
          @action="handleStateAction"
        />
      </slot>

      <slot v-else-if="resolvedStatus === 'empty'" name="empty" :reload="reload" :reset="reset">
        <RitualState
          :compact="compact"
          :bordered="false"
          variant="empty"
          :title="emptyTitle"
          :description="emptyDescription"
          :actions="stateActions"
          :heading-level="headingLevel"
          @action="handleStateAction"
        />
      </slot>

      <slot v-else name="idle" :load="load" :reload="reload" :reset="reset">
        <RitualState
          :compact="compact"
          :bordered="false"
          variant="idle"
          :title="idleTitle"
          :description="idleDescription"
          :actions="stateActions"
          :heading-level="headingLevel"
          @action="handleStateAction"
        />
      </slot>
    </div>

    <footer v-if="$slots.footer || showDefaultActions" class="async-boundary-footer">
      <slot
        name="footer"
        :status="resolvedStatus"
        :data="resolvedData"
        :error="resolvedError"
        :load="load"
        :reload="reload"
        :reset="reset"
      >
        <button
          v-if="showRefresh"
          class="ds-button ghost"
          type="button"
          :disabled="resolvedStatus === 'loading'"
          @click="reload"
        >
          {{ refreshLabel }}
        </button>
        <button
          v-if="showReset"
          class="ds-button ghost"
          type="button"
          :disabled="resolvedStatus === 'loading'"
          @click="reset"
        >
          {{ resetLabel }}
        </button>
      </slot>
    </footer>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import RitualState from './RitualState.vue'

const props = defineProps({
  loader: { type: Function, default: null },
  status: {
    type: String,
    default: '',
    validator: (value) => !value || ['idle', 'loading', 'success', 'empty', 'error'].includes(value),
  },
  data: { type: null, default: undefined },
  error: { type: null, default: null },
  immediate: { type: Boolean, default: false },
  reloadKey: { type: [String, Number, Boolean], default: '' },
  emptyWhen: { type: Function, default: null },
  transform: { type: Function, default: null },
  title: { type: String, default: '' },
  eyebrow: { type: String, default: '' },
  description: { type: String, default: '' },
  idleTitle: { type: String, default: '等待开始' },
  idleDescription: { type: String, default: '准备好后即可开始加载内容。' },
  loadingTitle: { type: String, default: '正在加载' },
  loadingDescription: { type: String, default: '正在获取最新内容，请稍候。' },
  emptyTitle: { type: String, default: '暂无内容' },
  emptyDescription: { type: String, default: '当前没有可展示的数据。' },
  errorTitle: { type: String, default: '加载失败' },
  retryLabel: { type: String, default: '重试' },
  refreshLabel: { type: String, default: '刷新' },
  resetLabel: { type: String, default: '重置' },
  compact: { type: Boolean, default: false },
  bordered: { type: Boolean, default: true },
  layout: {
    type: String,
    default: 'stack',
    validator: (value) => ['stack', 'panel', 'inline'].includes(value),
  },
  minHeight: { type: [Number, String], default: '' },
  headingLevel: {
    type: Number,
    default: 2,
    validator: (value) => value >= 2 && value <= 6,
  },
  ariaLabel: { type: String, default: '' },
  role: { type: String, default: '' },
  live: { type: String, default: 'polite' },
  showRetry: { type: Boolean, default: true },
  showRefresh: { type: Boolean, default: true },
  showReset: { type: Boolean, default: false },
})

const emit = defineEmits(['load-start', 'load-success', 'load-empty', 'load-error', 'reset'])

const internalStatus = ref('idle')
const internalData = ref(undefined)
const internalError = ref(null)
const requestId = ref(0)
let abortController = null

const isControlled = computed(() => Boolean(props.status))
const resolvedStatus = computed(() => {
  if (isControlled.value) return props.status
  return internalStatus.value
})
const resolvedData = computed(() => (isControlled.value ? props.data : internalData.value))
const resolvedError = computed(() => (isControlled.value ? props.error : internalError.value))
const hasData = computed(() => !isEmpty(resolvedData.value))
const headingTag = computed(() => `h${props.headingLevel}`)
const layoutClass = computed(() => `layout-${props.layout}`)
const boundaryStyle = computed(() => {
  if (!props.minHeight) return undefined
  return { minHeight: typeof props.minHeight === 'number' ? `${props.minHeight}px` : props.minHeight }
})
const computedRole = computed(() => props.role || (resolvedStatus.value === 'error' ? 'alert' : 'region'))
const computedAriaLabel = computed(() => props.ariaLabel || props.title || props.eyebrow || '动态内容区域')
const errorMessage = computed(() => normalizeError(resolvedError.value))
const showDefaultActions = computed(() => props.showRefresh || props.showReset)
const stateActions = computed(() => {
  const actions = []
  if (props.showRetry && ['error', 'empty', 'idle'].includes(resolvedStatus.value) && props.loader) {
    actions.push({ key: 'retry', label: resolvedStatus.value === 'idle' ? props.refreshLabel : props.retryLabel, tone: 'primary' })
  }
  if (props.showReset) actions.push({ key: 'reset', label: props.resetLabel, tone: 'ghost' })
  return actions
})

watch(() => props.reloadKey, () => {
  if (props.immediate || resolvedStatus.value !== 'idle') reload()
})

if (props.immediate && props.loader) {
  load()
}

async function load() {
  if (!props.loader) return
  const currentRequest = requestId.value + 1
  requestId.value = currentRequest
  abortController?.abort()
  abortController = typeof AbortController !== 'undefined' ? new AbortController() : null

  internalStatus.value = 'loading'
  internalError.value = null
  emit('load-start')

  try {
    const raw = await props.loader({ signal: abortController?.signal })
    if (currentRequest !== requestId.value) return
    const nextData = props.transform ? props.transform(raw) : raw
    internalData.value = nextData
    if (isEmptyByRule(nextData)) {
      internalStatus.value = 'empty'
      emit('load-empty', nextData)
    } else {
      internalStatus.value = 'success'
      emit('load-success', nextData)
    }
  } catch (error) {
    if (currentRequest !== requestId.value || error?.name === 'AbortError') return
    internalError.value = error
    internalStatus.value = 'error'
    emit('load-error', error)
  }
}

function reload() {
  return load()
}

function reset() {
  abortController?.abort()
  requestId.value += 1
  internalStatus.value = 'idle'
  internalData.value = undefined
  internalError.value = null
  emit('reset')
}

function handleStateAction(action) {
  if (action?.key === 'retry') reload()
  if (action?.key === 'reset') reset()
}

function isEmptyByRule(value) {
  if (props.emptyWhen) return props.emptyWhen(value)
  return isEmpty(value)
}

function isEmpty(value) {
  if (value === null || value === undefined) return true
  if (Array.isArray(value)) return value.length === 0
  if (value instanceof Map || value instanceof Set) return value.size === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

function normalizeError(error) {
  if (!error) return '请求没有返回可用错误信息。'
  if (typeof error === 'string') return error
  return error.message || error.statusText || '请求失败，请稍后重试。'
}

onBeforeUnmount(() => {
  abortController?.abort()
})

defineExpose({ load, reload, reset })
</script>

<style scoped>
.async-boundary {
  display: grid;
  gap: 14px;
  min-width: 0;
  color: var(--paper);
}

.async-boundary.is-bordered {
  padding: 16px;
  border: 1px solid rgba(215, 179, 95, 0.18);
  border-radius: var(--radius-sm);
  background:
    radial-gradient(circle at 50% 0%, rgba(215, 179, 95, 0.1), transparent 42%),
    rgba(255, 247, 231, 0.035);
}

.async-boundary.is-compact {
  gap: 10px;
  padding: 10px;
}

.async-boundary-header,
.async-boundary-footer {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.async-boundary-eyebrow {
  color: var(--seal);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
}

.async-boundary-title {
  margin: 4px 0 0;
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: clamp(24px, 4vw, 34px);
  font-weight: 400;
  line-height: 1.12;
}

.async-boundary-description {
  margin: 6px 0 0;
  color: var(--paper-dim);
  line-height: 1.7;
}

.async-boundary-body {
  min-width: 0;
}

.layout-panel .async-boundary-body {
  padding: 12px;
  border: 1px solid rgba(215, 179, 95, 0.12);
  border-radius: var(--radius-xs);
  background: rgba(0, 0, 0, 0.12);
}

.layout-inline {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
}

.layout-inline .async-boundary-header,
.layout-inline .async-boundary-body {
  min-width: 0;
}

.layout-inline .async-boundary-footer {
  grid-column: 2;
  grid-row: 1 / span 2;
}

@media (max-width: 680px) {
  .async-boundary-header,
  .async-boundary-footer,
  .layout-inline {
    display: grid;
    grid-template-columns: 1fr;
  }

  .layout-inline .async-boundary-footer {
    grid-column: auto;
    grid-row: auto;
  }
}
</style>
