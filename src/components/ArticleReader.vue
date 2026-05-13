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
              <div v-if="expandedParas.has(pIdx)" class="para-trans-content">
                {{ getParaTrans(para) }}
              </div>
            </div>
          </div>
        </template>
      </section>

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
import { ref,reactive, computed } from 'vue';
import { useStudyStore } from '../store/studyStore';

const props = defineProps({
  article: Object,
  readingState: { type: String, default: 'idle' },
  currentParaIdx: { type: Number, default: -1 },
  currentSentIdx: { type: Number, default: -1 },
  selectedSentence: { type: String, default: '' }
});

const emit = defineEmits([
  'select-sentence',
  'clear-selection',
  'query-word',
  'speak',
  'speak-paragraph',
  'toggle-full-reading'
]);

const studyStore = useStudyStore();
const articleRef = ref(null);
const expandedWords = ref(new Set());
const expandedParas = reactive(new Set());   // 控制段落翻译展开

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

/* 段落翻译按钮 */
.para-trans-btn {
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 2px 10px;
  font-size: 0.85rem;
  color: #666;
  margin-top: 10px;
  cursor: pointer;
  transition: all 0.2s;
}
.para-trans-btn:hover {
  border-color: #42b983;
  color: #42b983;
}
.para-trans-content {
  margin-top: 10px;
  padding: 10px 12px;
  background: #f8fafc;
  border-left: 3px solid #42b983;
  border-radius: 4px;
  font-size: 0.95rem;
  color: #475569;
  line-height: 1.7;
}

  /* ========== 顶部功能栏 ========== */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}
.top-date {
  font-size: 0.9rem;
  color: #999;
  font-weight: 500;
}
.top-actions {
  display: flex;
  gap: 10px;
}
.action-btn {
  background: none;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 4px 14px;
  font-size: 0.85rem;
  color: #666;
  cursor: pointer;
}
.action-active {
  background: #f0fdf4;
  border-color: #42b983;
  color: #42b983;
  font-weight: 600;
}

/* ========== 标题区 ========== */
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
  margin-bottom: 10px;
  font-weight: 500;
}
.difficulty-badge {
  display: inline-block;
  background: #f1f5f9;
  color: #64748b;
  font-size: 0.8rem;
  padding: 2px 12px;
  border-radius: 12px;
  font-weight: 500;
}

/* ========== 段落样式 ========== */
.para-block {
  display: flex;
  margin-bottom: 32px;
  position: relative;
}

.para-side {
  width: 36px;
  margin-right: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 2px;
}

.para-trans-btn {
  background: none;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}
.para-trans-btn:hover,
.para-trans-btn.trans-open {
  border-color: #42b983;
  color: #42b983;
  background: #f0fdf4;
}

.para-content {
  flex: 1;
  min-width: 0;
}
/* 句子 */
.sent-item {
  display: inline;
  line-height: 2.2;
  font-size: 1.25rem;
  color: #334155;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: 0.01em;
  word-spacing: 0.08em;
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

/* 单词标记 */
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

/* 段落翻译内容 */
.para-trans-content {
  margin-top: 12px;
  padding: 12px 16px;
  background: #f8fafc;
  border-left: 3px solid #42b983;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #475569;
  line-height: 1.7;
}

/* 全文朗读按钮 */
.read-all-btn-wrapper {
  display: flex;
  justify-content: center;
  margin: 40px 0 50px;
}
.read-all-btn {
  padding: 10px 35px;
  font-size: 1rem;
  color: #42b983;
  background: white;
  border: 2px solid #42b983;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}
.read-all-btn:hover {
  background: #f0fdf4;
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

@keyframes pulse-border {
  0%, 100% { border-bottom-color: #42b983; }
  50% { border-bottom-color: #a7f3d0; }
}

/* 移动端调整 */
@media (max-width: 768px) {
  .article-section {
    padding: 16px 16px 120px;
  }
  .art-header h1 {
    font-size: 1.6rem;
  }
  .sent-item {
    font-size: 1.15rem;
    line-height: 2;
  }
  .para-side {
    width: 30px;
    margin-right: 8px;
  }
}
</style>
