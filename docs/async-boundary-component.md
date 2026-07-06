# AsyncBoundary 动态 UI 组件

`AsyncBoundary` 是用于动态内容区域的生产级组件。它不绑定具体业务，可用于排盘结果、最近记录、推荐列表、AI 解读片段、后台任务结果等异步 UI。

## 组件架构

```text
AsyncBoundary.vue
  ├─ 受控模式：由父组件传入 status/data/error
  ├─ 非受控模式：传入 loader，由组件内部管理请求状态
  ├─ RitualState：复用现有加载/空/错误/待开始状态视觉
  ├─ Slots：header/default/loading/empty/error/idle/footer
  └─ defineExpose：load/reload/reset
```

设计原则：

- 业务数据和视觉状态分离：组件不理解“八字”“奇门”等业务，只承载异步生命周期。
- 默认可用，插槽可覆写：没有 slot 时能显示完整状态，有 slot 时可定制业务 UI。
- 竞态安全：新请求会中止旧请求，并忽略过期响应。
- 可访问：错误态使用 `alert`，加载态设置 `aria-busy`，支持 `aria-live` 和 heading 层级。
- 响应式：`stack`、`panel`、`inline` 三种布局在移动端自动回落。

## Props 设计

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `loader` | `Function` | `null` | 非受控模式的数据加载函数，接收 `{ signal }`。 |
| `status` | `idle/loading/success/empty/error` | `''` | 受控模式状态。传入后组件不再内部管理状态。 |
| `data` | `any` | `undefined` | 受控模式数据。 |
| `error` | `any` | `null` | 受控模式错误。 |
| `immediate` | `Boolean` | `false` | 挂载后是否立即执行 `loader`。 |
| `reloadKey` | `String/Number/Boolean` | `''` | 变化时触发重新加载。 |
| `emptyWhen` | `Function` | `null` | 自定义空态判断。 |
| `transform` | `Function` | `null` | loader 返回后先转换数据。 |
| `title/eyebrow/description` | `String` | `''` | 头部内容。 |
| `idleTitle/loadingTitle/emptyTitle/errorTitle` | `String` | 内置文案 | 各状态标题。 |
| `idleDescription/loadingDescription/emptyDescription` | `String` | 内置文案 | 各状态说明。 |
| `retryLabel/refreshLabel/resetLabel` | `String` | `重试/刷新/重置` | 操作文案。 |
| `compact` | `Boolean` | `false` | 紧凑模式。 |
| `bordered` | `Boolean` | `true` | 是否显示边框背景。 |
| `layout` | `stack/panel/inline` | `stack` | 布局模式。 |
| `minHeight` | `Number/String` | `''` | 最小高度。 |
| `headingLevel` | `2-6` | `2` | 状态标题层级。 |
| `ariaLabel` | `String` | `''` | 动态区域无障碍名称。 |
| `role` | `String` | `''` | 覆盖默认 role。 |
| `live` | `String` | `polite` | `aria-live` 策略。 |
| `showRetry` | `Boolean` | `true` | 空态、错误态、待开始态是否显示默认重试/加载按钮。 |
| `showRefresh/showReset` | `Boolean` | `true/false` | 默认 footer 操作。 |

## Events

- `load-start`
- `load-success(data)`
- `load-empty(data)`
- `load-error(error)`
- `reset`

## Slots

| Slot | Scope |
| --- | --- |
| `header` | `{ status, data, error, reload, reset }` |
| `default` | `{ data, status, reload, reset }` |
| `loading` | `{ status }` |
| `empty` | `{ reload, reset }` |
| `error` | `{ error, reload, reset }` |
| `idle` | `{ load, reload, reset }` |
| `footer` | `{ status, data, error, load, reload, reset }` |

## 完整实现

代码位置：

- `frontend/src/components/AsyncBoundary.vue`

## 使用示例：加载最近记录

```vue
<template>
  <AsyncBoundary
    title="最近记录"
    eyebrow="Records"
    :loader="loadRecentRecords"
    :empty-when="(records) => records.length === 0"
    immediate
    layout="panel"
    empty-title="暂无最近记录"
    empty-description="完成一次问卦后会自动显示在这里。"
    aria-label="最近记录列表"
  >
    <template #default="{ data, reload }">
      <div class="record-list">
        <button v-for="item in data" :key="item.time" type="button">
          <strong>{{ item.title }}</strong>
          <span>{{ item.time }}</span>
        </button>
      </div>
      <button class="ds-button ghost" type="button" @click="reload">刷新</button>
    </template>
  </AsyncBoundary>
</template>

<script setup>
import AsyncBoundary from '../components/AsyncBoundary.vue'

async function loadRecentRecords() {
  const raw = localStorage.getItem('qk_recent_records')
  return raw ? JSON.parse(raw) : []
}
</script>
```

## 当前项目接入点

`/divine/:skill` 右侧“最近记录”已经接入 `AsyncBoundary`：

- `loader`: `loadRecentRecordsAsync`
- `reloadKey`: `recentRecordsVersion`
- `emptyWhen`: `(items) => items.length === 0`
- `showRetry`: `false`
- 成功态：渲染 `.mini-list`
- 空态：复用 `RitualState`
- 保存问卦记录后：`recentRecordsVersion += 1`，组件自动重新加载

对应文件：

- `frontend/src/views/Divine.vue`

## 使用示例：受控模式

```vue
<AsyncBoundary
  title="排盘结果"
  :status="loading ? 'loading' : error ? 'error' : records.length ? 'success' : 'empty'"
  :data="records"
  :error="error"
  :show-refresh="false"
>
  <template #default="{ data }">
    <ResultCard v-for="item in data" :key="item.id" :record="item" />
  </template>
</AsyncBoundary>
```

## 边缘情况

- `loader` 返回 `[]`、`{}`、`null` 或 `undefined` 时默认进入空态。
- 可用 `emptyWhen` 覆盖复杂业务空态，例如接口返回 `{ items: [] }`。
- 多次快速刷新时，旧请求会被 abort；即使旧请求最终返回，也不会覆盖新结果。
- 组件卸载时会 abort 当前请求，避免内存泄漏。
- `loader` 应尽量使用传入的 `signal`：

```js
async function loader({ signal }) {
  const response = await fetch('/api/records', { signal })
  return response.json()
}
```
