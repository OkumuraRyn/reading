<template>
  <div v-if="article" class="reader-wrapper">
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
      @toggle-full-reading="toggleFullReading"
    />

    <AiPanel
      ref="aiPanelRef"
      :selected-sentence="selectedSentence"
      :selected-sentence-cn="selectedSentenceCn"
      @add-to-vocab="handleAddToVocab"
    />

    <!-- 底部朗读控制栏 -->
    <Transition name="control-slide">
      <div v-if="showControls" class="reading-control-bar">
        <button @click="prevSentence" :disabled="readingState === 'idle'">⏮ 上一句</button>
        <button v-if="readingState === 'playing'" @click="pauseFullReading">⏸ 暂停</button>
        <button v-else-if="readingState === 'paused'" @click="resumeFullReading">▶️ 继续</button>
        <button v-else disabled>⏸ 暂停</button>
        <button @click="nextSentence" :disabled="readingState === 'idle'">⏭ 下一句</button>
      </div>
    </Transition>
  </div>
  <div v-else class="loading-container"><p>加载中...</p></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useStudyStore } from '../store/studyStore'
import { useFullReading } from '../composables/useFullReading'
import { allArticles } from '../data/index'
import { askDeepSeek, getCachedResult } from '../services/aiService'
import ArticleReader from '../components/ArticleReader.vue'
import AiPanel from '../components/AiPanel.vue'

const route = useRoute()
const studyStore = useStudyStore()
const article = ref(null)

const {
  readingState,
  currentParaIdx,
  currentSentIdx,
  start: startFullReading,
  pause: pauseFullReading,
  resume: resumeFullReading,
  stop: stopFullReading,
  nextSentence,
  prevSentence
} = useFullReading()

const showControls = ref(false)

const toggleFullReading = () => {
  if (readingState.value === 'idle' && article.value) {
    startFullReading(article.value.paragraphs)
    showControls.value = true
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
      const el = document.querySelector(`.sent-item[data-pidx="${pIdx}"][data-sidx="${sIdx}"]`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }
})

// 路由变化或朗读结束隐藏控制栏
watch(readingState, (val) => {
  if (val === 'idle') showControls.value = false
})

watch(() => route.params.id, () => {
  if (readingState.value !== 'idle') stopFullReading()
})

onUnmounted(() => {
  if (readingState.value !== 'idle') stopFullReading()
})

const speak = (content) => {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(content)
  u.lang = 'en-US'
  u.rate = 0.9
  window.speechSynthesis.speak(u)
}

const speakParagraph = (para) => {
  const text = para.sentences.map(s => s.en).join(' ')
  speak(text)
}

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

const aiPanelRef = ref(null)

const handleQueryWord = async (word, sentenceEn) => {
  if (!aiPanelRef.value) return
  aiPanelRef.value.isAiExpanded = true

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
    studyStore.currentDictEntry = { word, detail: `❌ 查询失败：${err.message || '网络错误'}` }
  } finally {
    studyStore.isAiLoading = false
  }
}

const handleAddToVocab = () => {
  if (studyStore.currentDictEntry?.word && article.value) {
    studyStore.addToVocab(studyStore.currentDictEntry, article.value.id)
  }
}

watch(() => studyStore.jumpTarget, (target) => {
  if (!target) return
  nextTick(() => {
    let element = null
    if (target.section === 'article') {
      element = document.querySelector(`#art-word-${target.word.toLowerCase()}`)
    } else if (target.section === 'vocabulary') {
      element = document.getElementById(`vocab-card-${target.word.toLowerCase()}`)
    }
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      element.classList.add('jump-highlight-global')
      setTimeout(() => element.classList.remove('jump-highlight-global'), 1500)
    }
  })
})

onMounted(() => {
  studyStore.init()
  article.value = allArticles.find(a => a.id === route.params.id)
})
</script>

<style scoped>
.reader-wrapper { position: relative; width: 100%; }

.reading-control-bar {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 40px;
  padding: 10px 24px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
  display: flex;
  gap: 16px;
  z-index: 800;
}
.reading-control-bar button {
  background: #f1f5f9;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: background 0.2s;
}
.reading-control-bar button:hover:not(:disabled) {
  background: #e2e8f0;
}
.reading-control-bar button:disabled {
  opacity: 0.5;
  cursor: default;
}

.control-slide-enter-active,
.control-slide-leave-active {
  transition: all 0.3s ease;
}
.control-slide-enter-from,
.control-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>
