<!-- src/components/ArticleReader.vue -->
<template>
  <main class="article-section" ref="articleRef">
    <div class="article-content-wrapper">
      <!-- 文章标题 -->
      <header class="art-header">
        <h1>{{ article.title }}</h1>
        <p v-if="article.titleCn" class="art-title-cn">{{ article.titleCn }}</p>
      </header>

      <!-- 正文区域 -->
      <section class="reading-body">
        <template v-for="(para, pIdx) in article.paragraphs" :key="pIdx">
          <div v-if="para.type === 'date'" class="para-date">{{ para.text }}</div>
          <h2 v-else-if="para.type === 'heading' && para.level === 2" class="para-heading-2">{{ para.text }}</h2>
          <h3 v-else-if="para.type === 'heading' && para.level === 3" class="para-heading-3">{{ para.text }}</h3>
          <div v-else class="para-block">
            <div class="para-content">
              <span
                v-for="(sent, sIdx) in para.sentences"
                :key="sIdx"
                class="sent-item"
                :class="{
                  'is-focused': selectedSentence === sent.en,
                  'is-playing': readingState !== 'idle' && currentParaIdx === pIdx && currentSentIdx === sIdx
                }"
                :data-pidx="pIdx"
                :data-sidx="sIdx"
                @click.stop="handleSentenceClick(sent)"
                @touchstart.prevent="startLongPress(sent, pIdx, sIdx)"
                @touchend.prevent="cancelLongPress"
                @touchmove.prevent="cancelLongPress"
              >
                <span
                  v-for="(token, tIdx) in tokenize(sent.en)"
                  :key="tIdx"
                  class="token-wrapper"
                >
                  <span
                    v-if="token.isWord"
                    :id="`art-word-${token.text.toLowerCase()}`"
                    class="word-token"
                    :class="{
                      'is-added-green': isWordInCurrentVocab(token.text),
                      'is-review-yellow': isWordInOtherVocab(token.text)
                    }"
                    @click.stop="handleWordClick(token.text, sent.en)"
                  >{{ token.text }}</span>
                  <span v-else>{{ token.text }}</span>
                </span>
              </span>

              <!-- 段落末尾翻译按钮 -->
              <button
                class="para-trans-btn"
                @click.stop="toggleParaTrans(pIdx)"
              >译</button>
              <div v-if="hasParaTrans(pIdx)" class="para-trans-content">
                {{ getParaTrans(para) }}
              </div>
            </div>
          </div>
        </template>
      </section>

      <!-- 默写区域 -->
      <section class="dictation-area">
        <div class="box-header">
          <div class="header-main">
            <h3>Vocabulary Dictation</h3>
            <span class="badge">{{ currentArticleVocab.length }} 词</span>
          </div>
          <router-link to="/all-vocabulary" class="view-all-btn">查看全量词本 →</router-link>
        </div>
        <div class="vocab-grid">
          <div v-for="(v, idx) in currentArticleVocab" :key="v.word" :id="`vocab-card-${v.word.toLowerCase()}`" class="v-card-container">
            <div class="v-card">
              <div class="v-index">#{{ idx + 1 }}</div>
              <div class="v-info">
                <strong class="v-playable" @click="$emit('speak', v.word)">{{ v.word }} 🔊</strong>
                <span class="jump-link" @click="studyStore.performJump(v.word, 'article')">[原文]</span>
              </div>
              <input type="text" placeholder="输入拼写" :data-word="v.word" @keyup.enter="handleSpellCheck" />
              <button class="v-del" @click="studyStore.removeVocabItem(v.word)">×</button>
            </div>
            <div v-if="v.detail" class="v-item-detail" :class="{ 'is-expanded': isExpanded(v.word) }" @click="toggleExpand(v.word)">
              <span class="detail-text">{{ isExpanded(v.word) ? v.detail : truncateText(v.detail) }}</span>
              <span v-if="v.detail && v.detail.length > 55" class="expand-label">{{ isExpanded(v.word) ? ' [收起]' : ' [展开]' }}</span>
            </div>
          </div>
        </div>
        <div v-if="currentArticleVocab.length === 0" class="empty-tip">本篇文章暂无存入单词</div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useStudyStore } from '../store/studyStore'

const props = defineProps({
  article: Object,
  readingState: { type: String, default: 'idle' },
  currentParaIdx: { type: Number, default: -1 },
  currentSentIdx: { type: Number, default: -1 },
  selectedSentence: { type: String, default: '' }
})

const emit = defineEmits([
  'select-sentence',
  'clear-selection',
  'query-word',
  'speak',
  'speak-paragraph',
  'toggle-full-reading',
  'jump-to-sentence'
])

const studyStore = useStudyStore()
const articleRef = ref(null)

// 单词详情展开控制
const expandedWords = ref(new Set())
const isExpanded = (word) => expandedWords.value.has(word)
const toggleExpand = (word) => {
  if (expandedWords.value.has(word)) {
    expandedWords.value.delete(word)
  } else {
    expandedWords.value.add(word)
  }
}
const truncateText = (text) => {
  if (!text) return ''
  return text.length > 55 ? text.substring(0, 55) + '...' : text
}

// 段落翻译展开控制
const expandedParas = reactive({})
const toggleParaTrans = (pIdx) => {
  expandedParas[pIdx] = !expandedParas[pIdx]
}
const hasParaTrans = (pIdx) => {
  return !!expandedParas[pIdx]
}
const getParaTrans = (para) => {
  return para.sentences.map(s => s.cn).join('')
}

// 当前文章的词汇
const currentArticleVocab = computed(() => {
  if (!props.article) return []
  const articleId = props.article.id
  return studyStore.vocabularyList.filter(v => {
    return v.articleId === articleId || (v.sources && v.sources.includes(articleId))
  })
})

const isWordInCurrentVocab = (word) => {
  return currentArticleVocab.value.some(v => v.word.toLowerCase() === word.toLowerCase())
}

const isWordInOtherVocab = (word) => {
  const w = word.toLowerCase()
  return !isWordInCurrentVocab(word) &&
    studyStore.vocabularyList.some(v => v.word.toLowerCase() === w)
}

// Tokenizer
const tokenize = (text) => {
  return text.split(/(\b\w+\b)/g).map(t => ({
    text: t,
    isWord: /^\w+$/.test(t)
  }))
}

// 事件处理
// 长按相关
const longPressTimer = ref(null);
const longPressTriggered = ref(false);

const startLongPress = (sentence, pIdx, sIdx) => {
  longPressTriggered.value = false;
  longPressTimer.value = setTimeout(() => {
    longPressTriggered.value = true;
    emit('jump-to-sentence', { pIdx, sIdx, sentence });
    if (navigator.vibrate) navigator.vibrate(50);
  }, 500);
};

const cancelLongPress = () => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value);
    longPressTimer.value = null;
  }
};

// 修改原有的 handleSentenceClick，加入长按检查
const handleSentenceClick = (sent) => {
  if (longPressTriggered.value) {
    longPressTriggered.value = false;
    return;
  }
  emit('select-sentence', sent);
};

const handleWordClick = (word, sentenceEn) => {
  emit('query-word', word, sentenceEn)
  emit('speak', word)
}

const handleSpellCheck = (e) => {
  const input = e.target
  const value = input.value.trim().toLowerCase()
  const target = input.getAttribute('data-word')
  if (!value || !target) return
  const isOk = value === target.toLowerCase()
  input.style.borderColor = isOk ? '#42b983' : '#ef4444'
  input.style.backgroundColor = isOk ? '#f0fdf4' : '#fef2f2'
}

defineExpose({ articleRef })
</script>

<style scoped>
/* ========== 文章区域 ========== */
.article-section {
  flex: 1;
  overflow-y: auto;
  padding: 24px 20px 120px;
  background: #fff;
}

.article-content-wrapper {
  max-width: 720px;
  margin: 0 auto;
}

/* ========== 文章标题 ========== */
.art-header {
  margin-bottom: 30px;
}
.art-header h1 {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1.3;
  color: #1e293b;
  margin-bottom: 12px;
}
.art-title-cn {
  font-size: 1.1rem;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 10px;
}

/* ========== 新增段落类型样式 ========== */
.para-date {
  color: #94a3b8;
  font-size: 0.9rem;
  margin-bottom: 25px;
  font-style: italic;
  text-align: center;
}

.para-heading-2 {
  font-size: 1.4rem;
  color: #1e293b;
  font-weight: 700;
  margin: 32px 0 16px;
  padding-bottom: 6px;
  border-bottom: 2px solid #f1f5f9;
}

.para-heading-3 {
  font-size: 1.15rem;
  color: #475569;
  font-weight: 700;
  margin: 25px 0 12px;
}

/* ========== 段落与句子 ========== */
.para-block {
  margin-bottom: 32px;
}

.para-content {
  line-height: 2.2;
  font-size: 1.25rem;
  color: #334155;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: 0.01em;
  word-spacing: 0.08em;
}

.sent-item {
  display: inline;
  cursor: pointer;
  transition: background 0.15s;
  border-radius: 4px;
  padding: 2px 0;
  border-bottom: 2px solid transparent;
}
.sent-item:hover {
  background: #f8fafc;
}
.is-focused {
  background: #f0fdf4;
  border-bottom-color: #42b983;
}
.is-playing {
  background: #f0fdf4;
  border-bottom-color: #42b983;
  animation: pulse-border 1.5s ease-in-out infinite;
}

@keyframes pulse-border {
  0%, 100% { border-bottom-color: #42b983; }
  50% { border-bottom-color: #a7f3d0; }
}

/* ========== 单词 ========== */
.token-wrapper {
  display: contents;
}

.word-token {
  cursor: pointer;
  transition: all 0.15s;
  border-radius: 3px;
  padding: 1px 2px;
  user-select: none;
  -webkit-user-select: none;
}
.word-token:hover {
  background: #f1f5f9;
}
.is-added-green {
  color: #42b983 !important;
  font-weight: 600;
}
.is-review-yellow {
  color: #eab308 !important;
  font-weight: 600;
  border-bottom: 2px dashed #eab308;
}

/* ========== 翻译按钮 & 翻译内容 ========== */
.para-trans-btn {
  margin-top: 10px;
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 2px 10px;
  font-size: 0.85rem;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}
.para-trans-btn:hover {
  border-color: #42b983;
  color: #42b983;
}

.para-trans-content {
  margin-top: 10px;
  padding: 12px 16px;
  background: #f8fafc;
  border-left: 3px solid #42b983;
  border-radius: 4px;
  font-size: 0.95rem;
  color: #475569;
  line-height: 1.7;
}

/* ========== 默写区域 ========== */
.dictation-area {
  margin-top: 50px;
  padding-top: 30px;
  border-top: 2px solid #f1f5f9;
  padding-bottom: 60px;
}
.box-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.header-main {
  display: flex;
  align-items: center;
  gap: 10px;
}
.header-main h3 {
  margin: 0;
  font-size: 1.2rem;
}
.badge {
  background: #eefdf5;
  color: #42b983;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.8rem;
}
.view-all-btn {
  font-size: 0.8rem;
  color: #42b983;
  text-decoration: none;
  font-weight: bold;
}
.view-all-btn:hover {
  text-decoration: underline;
}

.v-card-container {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  transition: border-color 0.2s;
}
.v-card-container:hover {
  border-color: #d1d5db;
}
.v-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
}
.v-index {
  font-weight: 900;
  color: #cbd5e1;
  font-size: 0.75rem;
  width: 30px;
}
.v-info {
  flex: 1;
  font-size: 1rem;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
}
.v-playable {
  cursor: pointer;
  transition: 0.2s;
}
.v-playable:hover {
  color: #42b983;
}
.jump-link {
  font-size: 0.75rem;
  color: #42b983;
  cursor: pointer;
  text-decoration: underline;
  background: #eefdf5;
  padding: 2px 6px;
  border-radius: 4px;
}
.jump-link:hover {
  background: #d1fae5;
}
.v-card input {
  width: 150px;
  padding: 6px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  outline: none;
  transition: border-color 0.2s;
}
.v-card input:focus {
  border-color: #42b983;
}
.v-del {
  background: none;
  border: none;
  color: #cbd5e1;
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.2s;
}
.v-del:hover {
  color: #ef4444;
}

.v-item-detail {
  background: #f8fafc;
  padding: 10px 15px;
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.5;
  cursor: pointer;
  border-top: 1px solid #f1f5f9;
  transition: background 0.2s;
  word-break: break-word;
  overflow-wrap: break-word;
}
.v-item-detail:hover {
  background: #f1f5f9;
}
.v-item-detail.is-expanded {
  white-space: pre-line;
  color: #334155;
}
.expand-label {
  color: #42b983;
  font-weight: bold;
  margin-left: 4px;
}

.empty-tip {
  text-align: center;
  color: #94a3b8;
  font-size: 0.9rem;
  margin-bottom: 40px;
}

/* ========== 移动端适配 ========== */
@media (max-width: 768px) {
  .article-section {
    padding: 16px 16px 120px;
  }
  .art-header h1 {
    font-size: 1.6rem;
  }
  .para-content {
    font-size: 1.15rem;
    line-height: 2;
  }
  .v-card {
    flex-wrap: wrap;
  }
  .v-card input {
    width: 100%;
    order: 4;
  }
  .v-info {
    flex-wrap: wrap;
    gap: 4px;
  }
}
</style>
