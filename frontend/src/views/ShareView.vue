<template>
  <main class="share-page mystic-app">
    <header class="mystic-topbar">
      <a class="brand" href="/" aria-label="返回首页">
        <span class="brand-seal">卦</span>
        <span><strong>乾坤之道</strong><em>问事记录</em></span>
      </a>
      <nav class="nav-links" aria-label="主导航">
        <a href="/">首页</a>
        <a href="/divine/bazi">AI问卦</a>
        <a href="/tools/qiming">功能中心</a>
      </nav>
      <div class="mystic-actions">
        <button class="ds-button primary" type="button" @click="router.push('/zhouyi')">重新起卦</button>
      </div>
    </header>

    <section class="share-shell">
      <AsyncBoundary
        immediate
        title="问事详情"
        description="从数据库读取已保存的排盘与解读。"
        :loader="loadRecord"
        :empty-when="(data) => !data?.record"
        empty-title="记录不存在"
        empty-description="这条分享记录可能已删除，或当前环境尚未绑定数据库。"
        error-title="无法读取记录"
        heading-level="1"
      >
        <template #default="{ data }">
          <article class="oracle-card share-record">
            <div class="answer-head">
              <span class="ds-badge gold">{{ data.record.skill }}</span>
              <time>{{ formatTime(data.record.createdAt) }}</time>
            </div>
            <h1>{{ data.record.title }}</h1>
            <p class="share-question">{{ data.record.question }}</p>
            <section class="answer-text">
              <div class="answer-text-head">
                <span>解读</span>
                <strong>文化娱乐参考</strong>
              </div>
              <div class="answer-text-body">
                <p v-for="line in readingLines(data.record.reading)" :key="line" class="answer-line">{{ line }}</p>
              </div>
            </section>
          </article>
        </template>
      </AsyncBoundary>
    </section>
  </main>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import AsyncBoundary from '../components/AsyncBoundary.vue'
import { getConsultationRecord } from '../api/divine'

const route = useRoute()
const router = useRouter()

function loadRecord() {
  return getConsultationRecord(route.params.id)
}

function readingLines(text) {
  const lines = String(text || '').split(/\n+/).map((line) => line.trim()).filter(Boolean)
  return lines.length ? lines : ['暂无解读内容。']
}

function formatTime(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}
</script>

<style scoped>
.share-shell {
  position: relative;
  z-index: 1;
  width: min(960px, calc(100% - 24px));
  margin: 0 auto;
}

.share-record {
  display: grid;
  gap: 16px;
  padding: 22px;
}

.share-record h1 {
  margin: 0;
  color: var(--gold-bright);
  font-family: var(--font-display);
  font-size: clamp(30px, 5vw, 52px);
  font-weight: 400;
  letter-spacing: 0;
}

.share-question {
  margin: 0;
  padding: 14px;
  border: 1px solid rgba(215, 179, 95, 0.14);
  border-radius: var(--radius-xs);
  color: var(--paper-dim);
  background: rgba(0, 0, 0, 0.16);
  word-break: break-word;
}
</style>
