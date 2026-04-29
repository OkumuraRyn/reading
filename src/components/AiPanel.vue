<!-- src/components/AiPanel.vue -->
<template>
  <!-- 浮动面板 -->
  <div
    class="ai-float"
    :class="{
      'is-expanded': isAiExpanded,
      'is-mobile': isMobile,
      'is-dragging': dragging,
    }"
    :style="
      !isMobile
        ? { left: panelX + 'px', top: panelY + 'px' }
        : {}
    "
    @mousedown="startDrag"
    @touchstart="startDrag"
  >
    <!-- 折叠状态：圆形按钮（移动端也固定在底部） -->
    <div v-if="!isAiExpanded" class="float-btn" @click="isAiExpanded = true">
      🤖
    </div>

    <!-- 展开状态：毛玻璃卡片（标题栏可拖拽） -->
    <div v-else class="ai-card glass-card">
      <div class="card-header" @mousedown.stop @touchstart.stop>
        <span>AI 助手分析</span>
        <button class="close-btn" @click="isAiExpanded = false">✕</button>
      </div>

      <div class="ai-body">
        <!-- 上下文预览 -->
        <div v-if="selectedSentence" class="context-preview">
          <small>当前句子</small>
          <p>{{ selectedSentence }}</p>
          <p v-if="selectedSentenceCn" class="translation-preview">
            {{ selectedSentenceCn }}
          </p>
        </div>

        <!-- 加载中 -->
        <div v-if="studyStore.isAiLoading" class="loading-state">
          <span class="loading-spinner"></span>
          深度分析中...
        </div>

        <!-- AI 分析结果 -->
        <div v-else-if="studyStore.currentDictEntry" class="result-area">
          <div class="ai-word-title">
            {{ studyStore.currentDictEntry.word || '分析结果' }}
          </div>
          <div class="ai-res-detail">
            {{ studyStore.currentDictEntry.detail }}
          </div>
          <button
            v-if="studyStore.currentDictEntry.word"
            class="save-word-btn"
            @click="$emit('add-to-vocab')"
          >
            + 存入本篇默写本
          </button>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <div class="empty-icon">📖</div>
          <p>长按单词深度解析</p>
          <p>单击选中句子进行提问</p>
        </div>
      </div>

      <!-- 提问输入 -->
      <div class="ai-input-group">
        <input
          type="text"
          v-model="userQuestion"
          placeholder="输入你的问题..."
          @keyup.enter="handleQuestionSubmit"
        />
        <button @click="handleQuestionSubmit" :disabled="!userQuestion.trim()">
          发送
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useStudyStore } from '../store/studyStore'
import { askAiQuestion, getCachedResult } from '../services/aiService'

const props = defineProps({
  selectedSentence: { type: String, default: '' },
  selectedSentenceCn: { type: String, default: '' },
})

const emit = defineEmits(['add-to-vocab'])

const studyStore = useStudyStore()
const isAiExpanded = ref(false)
const userQuestion = ref('')

// ==================== 提问处理 ====================
const handleQuestionSubmit = async () => {
  const question = userQuestion.value.trim()
  if (!question) return

  const cached = getCachedResult('quest', question, props.selectedSentence)
  if (cached) {
    studyStore.currentDictEntry = { word: '', detail: cached }
    userQuestion.value = ''
    return
  }

  studyStore.isAiLoading = true
  studyStore.currentDictEntry = null

  try {
    const res = await askAiQuestion(question, props.selectedSentence)
    studyStore.currentDictEntry = { word: '', detail: res }
  } catch (err) {
    studyStore.currentDictEntry = {
      word: '',
      detail: `❌ 分析失败：${err.message || '网络错误，请稍后再试'}`,
    }
  } finally {
    studyStore.isAiLoading = false
    userQuestion.value = ''
  }
}

// ==================== 移动端检测 ====================
const isMobile = ref(window.innerWidth <= 768)

const updateMobile = () => {
  isMobile.value = window.innerWidth <= 768
}
window.addEventListener('resize', updateMobile)
onBeforeUnmount(() => window.removeEventListener('resize', updateMobile))

// ==================== 拖拽管理（仅桌面端） ====================
const panelX = ref(window.innerWidth - 400)
const panelY = ref(window.innerHeight - 450)
const dragging = ref(false)
let startX = 0
let startY = 0

const setDefaultPosition = () => {
  // 避免与右下角全文朗读按钮重叠（按钮 bottom:30px, right:30px）
  panelX.value = Math.max(20, window.innerWidth - 420)
  panelY.value = Math.max(20, window.innerHeight - 480)
}

onMounted(setDefaultPosition)
window.addEventListener('resize', setDefaultPosition)
onBeforeUnmount(() => window.removeEventListener('resize', setDefaultPosition))

const startDrag = (e) => {
  if (isMobile.value) return // 移动端不允许拖拽

  // 只允许点击标题栏或折叠按钮时拖动
  if (!e.target.closest('.card-header') && !e.target.closest('.float-btn')) return

  dragging.value = true
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY

  startX = clientX - panelX.value
  startY = clientY - panelY.value

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag, { passive: false })
  document.addEventListener('touchend', stopDrag)
  e.preventDefault()
}

const onDrag = (e) => {
  if (!dragging.value) return
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY

  panelX.value = Math.min(
    Math.max(clientX - startX, 0),
    window.innerWidth - 60
  )
  panelY.value = Math.min(
    Math.max(clientY - startY, 0),
    window.innerHeight - 60
  )
}

const stopDrag = () => {
  dragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
}

onBeforeUnmount(stopDrag)

defineExpose({ isAiExpanded })
</script>

<style scoped>
/* ========== 浮动容器 ========== */
.ai-float {
  position: fixed;
  z-index: 899;
  user-select: none;
}

/* 折叠时的圆形按钮 */
.float-btn {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #42b983, #2e865f);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(66, 185, 131, 0.4);
  transition: transform 0.2s, box-shadow 0.2s;
}
.float-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(66, 185, 131, 0.5);
}

/* 展开时的毛玻璃卡片 */
.ai-card {
  width: 360px;
  max-height: 520px;
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
}

/* 标题栏（拖拽句柄） */
.card-header {
  background: linear-gradient(135deg, #42b983, #2e865f);
  color: white;
  padding: 12px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 1rem;
  cursor: move;
  flex-shrink: 0;
}
.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 22px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  opacity: 0.8;
  transition: opacity 0.2s;
}
.close-btn:hover {
  opacity: 1;
}

/* 内容区域 */
.ai-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #334155;
}

/* 上下文预览 */
.context-preview {
  background: rgba(241, 245, 249, 0.7);
  padding: 10px;
  border-radius: 10px;
  margin-bottom: 12px;
  border-left: 4px solid #42b983;
}
.context-preview small {
  color: #64748b;
  font-size: 0.75rem;
}
.translation-preview {
  color: #42b983;
  margin-top: 8px;
  font-weight: 500;
  border-top: 1px dashed rgba(0,0,0,0.1);
  padding-top: 5px;
}

/* 分析结果 */
.result-area {
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.ai-word-title {
  font-weight: 900;
  font-size: 1.1rem;
  color: #1e293b;
  margin-bottom: 10px;
}
.ai-res-detail {
  white-space: pre-line;
  margin-bottom: 20px;
  word-break: break-word;
}
.save-word-btn {
  width: 100%;
  background: #42b983;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.save-word-btn:hover {
  background: #2e865f;
}

/* 空状态 & 加载 */
.empty-state {
  text-align: center;
  color: #94a3b8;
  padding: 30px 0;
}
.empty-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}
.loading-state {
  text-align: center;
  color: #42b983;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
}
.loading-spinner {
  width: 18px;
  height: 18px;
  border: 3px solid rgba(66, 185, 131, 0.2);
  border-top: 3px solid #42b983;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 提问输入区 */
.ai-input-group {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid rgba(0,0,0,0.05);
  background: rgba(255,255,255,0.6);
  flex-shrink: 0;
}
.ai-input-group input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 8px;
  outline: none;
  font-size: 0.9rem;
  background: rgba(255,255,255,0.9);
}
.ai-input-group button {
  background: #42b983;
  color: white;
  border: none;
  padding: 0 16px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.ai-input-group button:hover:not(:disabled) {
  background: #2e865f;
}
.ai-input-group button:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

/* ========== 移动端固定底部 ========== */
@media (max-width: 768px) {
  .ai-float {
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    top: auto !important;
    z-index: 899;
    width: auto !important;
  }
  .float-btn {
    position: absolute;
    right: 20px;
    bottom: 20px;
    width: 46px;
    height: 46px;
    font-size: 22px;
  }
  .ai-card {
    width: 100%;
    max-height: 60vh;
    border-radius: 20px 20px 0 0;
    margin: 0 auto;
  }
  .card-header {
    cursor: default; /* 移动端不需要拖拽手势 */
  }
}
</style>
