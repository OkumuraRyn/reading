<!-- src/components/ArticleReader.vue -->
<template>
  <main class="article-section" ref="articleRef">
    <div class="article-content-wrapper">
      <nav class="breadcrumb">
        <router-link to="/">← 目录</router-link> / {{ article.type }}
      </nav>

      <header class="art-header">
        <h1>{{ article.title }}</h1>
        <p v-if="article.titleCn" class="art-title-cn">{{ article.titleCn }}</p>
        <div class="interaction-hint">
          💡 单击单词查词并朗读 | 单击句子选中提问
        </div>
        <div v-if="selectedSentence" class="selection-tip">
          已选中句子，可在 AI 面板提问
          <button @click="$emit('clear-selection')">取消选中</button>
        </div>
      </header>

      <section class="reading-body">
        <template v-for="(para, pIdx) in article.paragraphs" :key="pIdx">
          <div v-if="para.type === 'date'" class="para-date">
            {{ para.text }}
          </div>
          <h2 v-else-if="para.type === 'heading' && para.level === 2" class="para-heading para-heading-2">
            {{ para.text }}
          </h2>
          <h3 v-else-if="para.type === 'heading' && para.level === 3" class="para-heading para-heading-3">
            {{ para.text }}
          </h3>
          <div v-else class="para-block para-with-speaker">
            <span
              class="para-speaker-btn"
              @click.stop="$emit('speak-paragraph', para)"
              title="朗读全段"
            >🔊</span>

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

            <!-- 整段翻译按钮 -->
            <button
              v-if="para.sentences && para.sentences.length"
              class="para-trans-btn"
              @click.stop="toggleParaTrans(pIdx)"
            >
              {{ expandedParas.has(pIdx) ? '收起译文' : '译' }}
            </button>
            <!-- 整段翻译内容 -->
            <div v-if="expandedParas.has(pIdx)" class="para-trans-content">
              {{ getParaTrans(para) }}
            </div>
          </div>
        </template>
      </section>

      <!-- 全文朗读按钮（放在文章末尾） -->
      <div class="read-all-btn-wrapper">
        <button class="read-all-btn" @click="$emit('toggle-full-reading')">
          🔊 全文朗读
        </button>
      </div>

      <section class="dictation-area">
        <!-- ... 原默写区域代码不变 ... -->
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
import { ref, computed, reactive } from 'vue'
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
  'toggle-full-reading'
])

const studyStore = useStudyStore()
const articleRef = ref(null)
const expandedWords = ref(new Set())
const expandedParas = reactive(new Set())   // 储存展开翻译的段落索引

const currentArticleVocab = computed(() => {
  if (!props.article) return []
  const articleId = props.article.id
  return studyStore.vocabularyList.filter(v => {
    return v.articleId === articleId || (v.sources && v.sources.includes(articleId))
  })
})

const isWordInCurrentVocab = (word) => currentArticleVocab.value.some(v => v.word.toLowerCase() === word.toLowerCase())
const isWordInOtherVocab = (word) => {
  const w = word.toLowerCase()
  return !isWordInCurrentVocab(word) && studyStore.vocabularyList.some(v => v.word.toLowerCase() === w)
}

const isExpanded = (word) => expandedWords.value.has(word)
const toggleExpand = (word) => {
  if (expandedWords.value.has(word)) expandedWords.value.delete(word)
  else expandedWords.value.add(word)
}
const truncateText = (text) => text && text.length > 55 ? text.substring(0, 55) + '...' : text

const tokenize = (text) => text.split(/(\b\w+\b)/g).map(t => ({ text: t, isWord: /^\w+$/.test(t) }))

const handleSentenceClick = (sent) => emit('select-sentence', sent)

// 单击单词：查词 + 朗读
const handleWordClick = (word, sentenceEn) => {
  emit('query-word', word, sentenceEn)
  emit('speak', word)
}

// 段落翻译开关
const toggleParaTrans = (pIdx) => {
  if (expandedParas.has(pIdx)) expandedParas.delete(pIdx)
  else expandedParas.add(pIdx)
}

// 获取整段翻译
const getParaTrans = (para) => {
  return para.sentences.map(s => s.cn).join('')
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
/* 原有样式保持不变，增加以下新样式 */

.para-trans-btn {
  display: inline-block;
  margin-top: 8px;
  padding: 2px 12px;
  font-size: 0.85rem;
  color: #42b983;
  background: #f0fdf4;
  border: 1px solid #42b983;
  border-radius: 4px;
  cursor: pointer;
}

.para-trans-content {
  margin-top: 8px;
  padding: 10px 12px;
  background: #f8fafc;
  border-left: 3px solid #42b983;
  border-radius: 4px;
  color: #475569;
  line-height: 1.6;
  font-size: 0.9rem;
}

.read-all-btn-wrapper {
  display: flex;
  justify-content: center;
  margin: 25px 0 40px;
}

.read-all-btn {
  padding: 8px 30px;
  font-size: 1rem;
  color: #42b983;
  background: white;
  border: 2px solid #42b983;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.read-all-btn:hover {
  background: #f0fdf4;
}
/* ========== 文章区域 ========== */
.article-section {
  flex: 1;
  overflow-y: auto;
  padding: 40px 20px 120px 20px;
}

.article-content-wrapper {
  max-width: 800px;
  margin: 0 auto;
}

/* ========== 面包屑 ========== */
.breadcrumb {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-bottom: 15px;
}
.breadcrumb a {
  color: #64748b;
  text-decoration: none;
}
.breadcrumb a:hover {
  color: #42b983;
}

/* ========== 文章标题 ========== */
.art-header h1 {
  font-size: 2.2rem;
  margin-bottom: 8px;
  color: #1e293b;
}
.art-title-cn {
  font-size: 1.1rem;
  color: #42b983;
  font-weight: 500;
  margin-bottom: 10px;
}
.interaction-hint {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-bottom: 20px;
  line-height: 1.5;
}
.selection-tip {
  background: #eefdf5;
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #34a871;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.selection-tip button {
  background: #fff;
  border: 1px solid #42b983;
  color: #42b983;
  padding: 2px 10px;
  border-radius: 4px;
  cursor: pointer;
}
.selection-tip button:hover {
  background: #f0fdf4;
}

/* ========== 新增段落类型样式 ========== */
.para-date {
  color: #94a3b8;
  font-size: 0.9rem;
  margin-bottom: 25px;
  font-style: italic;
  text-align: center;
}

.para-heading {
  color: #1e293b;
  font-weight: 700;
  margin: 32px 0 16px;
  padding-bottom: 6px;
  border-bottom: 2px solid #f1f5f9;
}
.para-heading-2 {
  font-size: 1.4rem;
}
.para-heading-3 {
  font-size: 1.15rem;
  color: #475569;
  border-bottom: none;
}

/* ========== 段落与句子 ========== */
.para-with-speaker {
  position: relative;
  padding-left: 35px;
}
.para-speaker-btn {
  position: absolute;
  left: 0;
  top: 5px;
  cursor: pointer;
  font-size: 1.1rem;
  opacity: 0.3;
  transition: opacity 0.2s;
  user-select: none;
}
.para-speaker-btn:hover {
  opacity: 1;
  transform: scale(1.2);
}

.para-block {
  margin-bottom: 25px;
  line-height: 2;
  font-size: 1.15rem;
  color: #334155;
}

.sent-item {
  display: inline;
  transition: all 0.2s;
  border-radius: 4px;
  padding: 2px 4px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  -webkit-tap-highlight-color: transparent;
}
.sent-item:hover {
  background: #f8fafc;
}
.is-focused {
  background: #f0fdf4;
  border-bottom: 2px solid #42b983;
}
.is-playing {
  background: #f0fdf4;
  border-bottom: 2px solid #42b983;
  animation: pulse-border 1.5s ease-in-out infinite;
}

@keyframes pulse-border {
  0%,
  100% {
    border-bottom-color: #42b983;
  }
  50% {
    border-bottom-color: #a7f3d0;
  }
}

/* ========== 单词 ========== */
.token-wrapper {
  display: contents;
}

.word-token {
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 3px;
  user-select: none;
  -webkit-user-select: none;
  padding: 1px 2px;
}
.word-token:hover {
  background: #f1f5f9;
  color: #42b983;
}
.is-added-green {
  color: #42b983 !important;
  font-weight: bold;
}
.is-review-yellow {
  color: #eab308 !important;
  font-weight: bold;
  border-bottom: 2px dashed #eab308;
}

/* ========== 默写区域 ========== */
.dictation-area {
  margin-top: 60px;
  padding-top: 40px;
  border-top: 2px solid #f1f5f9;
  padding-bottom: 100px;
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
    padding: 20px 15px 140px 15px;
  }
  .para-with-speaker {
    padding-left: 30px;
  }
  .art-header h1 {
    font-size: 1.5rem;
  }
  .art-title-cn {
    font-size: 0.95rem;
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
