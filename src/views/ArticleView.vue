<!-- src/views/ArticleView.vue -->
<template>
  <div v-if="article" class="main-reader">
    <!-- 全文朗读按钮（固定右下角） -->
    <button class="full-read-btn" @click="toggleFullReading">
      {{
        readingState === 'playing'
          ? '⏸️ 暂停'
          : readingState === 'paused'
            ? '▶️ 继续朗读'
            : '🔊 全文朗读'
      }}
    </button>

    <!-- 左侧：文章阅读区 -->
    <ArticleReader
      :article="article"
      :reading-state="readingState"
      :current-para-idx="currentParaIdx"
      :current-sent-idx="currentSentIdx"
      :selected-sentence="selectedSentence"
      @select-sentence="handleSelectSentence"
      @clear-selection="clearSelection"
      @query-word="handleQueryWord"
      @speak="speak"
      @speak-paragraph="speakParagraph"
    />

    <!-- 右侧/底部：AI 智能面板 -->
    <AiPanel
      ref="aiPanelRef"
      :selected-sentence="selectedSentence"
      :selected-sentence-cn="selectedSentenceCn"
      @add-to-vocab="handleAddToVocab"
    />
  </div>

  <div v-else class="loading-container">
    <p>加载中...</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useStudyStore } from '../store/studyStore'
import { useFullReading } from '../composables/useFullReading'
import { allArticles } from '../data/index'
import { askDeepSeek, askAiQuestion, getCachedResult } from '../services/aiService'
import ArticleReader from '../components/ArticleReader.vue'
import AiPanel from '../components/AiPanel.vue'

// ==================== 路由与 Store ====================
const route = useRoute()
const studyStore = useStudyStore()

// ==================== 文章数据 ====================
const article = ref(null)

// ==================== 全文朗读 ====================
const {
  readingState,
  currentParaIdx,
  currentSentIdx,
  start: startFullReading,
  pause: pauseFullReading,
  resume: resumeFullReading,
  stop: stopFullReading,
} = useFullReading()

const toggleFullReading = () => {
  if (readingState.value === 'idle' && article.value) {
    startFullReading(article.value.paragraphs)
  } else if (readingState.value === 'playing') {
    pauseFullReading()
  } else if (readingState.value === 'paused') {
    resumeFullReading()
  }
}

// 滚动到当前朗读句子
watch([currentParaIdx, currentSentIdx], ([pIdx, sIdx]) => {
  if (pIdx >= 0 && sIdx >= 0) {
    nextTick(() => {
      const el = document.querySelector(
        `.sent-item[data-pidx="${pIdx}"][data-sidx="${sIdx}"]`
      )
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }
})

// 路由变化时停止朗读
watch(
  () => route.params.id,
  () => {
    if (readingState.value !== 'idle') stopFullReading()
  }
)

onUnmounted(() => {
  if (readingState.value !== 'idle') stopFullReading()
})

// ==================== 语音朗读 ====================
const speak = (content) => {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(content)
  utterance.lang = 'en-US'
  utterance.rate = 0.9
  window.speechSynthesis.speak(utterance)
}

const speakParagraph = (para) => {
  if (!window.speechSynthesis) return
  const text = para.sentences.map((s) => s.en).join(' ')
  speak(text)
}

// ==================== 句子选中 ====================
const selectedSentence = ref('')
const selectedSentenceCn = ref('')

const handleSelectSentence = (sent) => {
  selectedSentence.value = sent.en
  selectedSentenceCn.value = sent.cn || ''
  speak(sent.en)
}

const clearSelection = () => {
  selectedSentence.value = ''
  selectedSentenceCn.value = ''
}

// ==================== AI 单词查询 ====================
const aiPanelRef = ref(null)

const handleQueryWord = async (word, sentenceEn) => {
  if (!aiPanelRef.value) return
  aiPanelRef.value.isAiExpanded = true

  // 检查缓存（7 天有效期已在 aiService 中处理）
  const cached = getCachedResult('dict', word, sentenceEn)
  if (cached) {
    studyStore.currentDictEntry = { word, detail: cached }
    return
  }

  studyStore.isAiLoading = true
  studyStore.currentDictEntry = null

  try {
    const res = await askDeepSeek(word, sentenceEn)
    studyStore.currentDictEntry = { word, detail: res }
  } catch (err) {
    studyStore.currentDictEntry = {
      word,
      detail: `❌ 查询失败：${err.message || '网络错误，请稍后再试'}`,
    }
  } finally {
    studyStore.isAiLoading = false
  }
}

// ==================== 添加到词汇本 ====================
const handleAddToVocab = () => {
  if (studyStore.currentDictEntry?.word && article.value) {
    studyStore.addToVocab(studyStore.currentDictEntry, article.value.id)
  }
}

// ==================== 单词跳转高亮 ====================
watch(
  () => studyStore.jumpTarget,
  (target) => {
    if (!target) return
    nextTick(() => {
      let element = null
      if (target.section === 'article') {
        element = document.querySelector(
          `#art-word-${target.word.toLowerCase()}`
        )
      } else if (target.section === 'vocabulary') {
        element = document.getElementById(
          `vocab-card-${target.word.toLowerCase()}`
        )
      }
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.classList.add('jump-highlight-global')
        setTimeout(() => element.classList.remove('jump-highlight-global'), 1500)
      }
    })
  }
)

// ==================== 初始化 ====================
onMounted(() => {
  studyStore.init()
  article.value = allArticles.find((a) => a.id === route.params.id)
})
</script>

<style scoped>
/* ========== 整体布局 ========== */
.main-reader {
  display: flex;
  height: 100vh;
  background: #fff;
  overflow: hidden;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: #94a3b8;
  font-size: 1.1rem;
}

/* ========== 全文朗读按钮 ========== */
.full-read-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1500;
  background: #42b983;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(66, 185, 131, 0.4);
  transition: transform 0.2s, opacity 0.2s;
}
.full-read-btn:hover {
  transform: scale(1.05);
}

/* ========== 全局跳转高亮 ========== */
:global(.jump-highlight-global) {
  background: rgba(140, 220, 94, 0.56) !important;
  border-radius: 4px;
  transition: background 0.3s;
}

/* ========== 移动端适配 ========== */
@media (max-width: 768px) {
  .main-reader {
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .full-read-btn {
    bottom: 90px;
    right: 15px;
    padding: 10px 18px;
    font-size: 14px;
  }
}
</style>
