<!-- src/views/MemorizeView.vue -->
<template>
  <div class="memorize-container">
    <div class="sticky-header">
      <div class="stats">
        <span>全部: <span class="num">{{ words.length }}</span></span>
        <span class="stat-item correct">正确: <span class="num">{{ correctCount }}</span></span>
        <span class="stat-item wrong">错误: <span class="num">{{ wrongCount }}</span></span>
      </div>
      <div class="controls">
        <!-- 动态生成组切换按钮 -->
        <div class="switch-group">
          <button
            v-for="set in availableSets"
            :key="set"
            @click="switchSet(set)"
            :class="{ active: currentSet === set }"
          >📘 第{{ set }}组</button>
        </div>
        <button @click="currentMode = currentMode === 'browse' ? 'spell' : 'browse'">
          {{ currentMode === 'browse' ? '⌨️ 拼写练习' : '👀 预览模式' }}
        </button>
        <button @click="maskEng = !maskEng" :class="{ active: maskEng }">🙈 遮盖英文</button>
        <button @click="maskChi = !maskChi" :class="{ active: maskChi }">🙊 遮盖中文</button>
        <button class="btn-mistake" @click="filterMistake = !filterMistake">
          {{ filterMistake ? 'Show All' : '只看错题' }}
        </button>
        <button class="btn-reset" @click="resetAll">重置全部</button>
      </div>
    </div>

    <div class="word-list">
      <div
        v-for="(word, index) in displayWords"
        :key="word.e"
        class="word-card"
        :class="{ 'card-wrong': word.status === 'wrong', 'card-correct': word.status === 'correct' }"
      >
        <!-- 英文区域 -->
        <div class="eng-area">
          <template v-if="currentMode === 'spell'">
            <input
              type="text"
              placeholder="拼写单词..."
              @blur="checkSpell($event, word)"
              @keyup.enter="handleEnter($event, word)"
              :class="{ error: word.status === 'wrong' }"
            />
          </template>
          <template v-else>
            <span
              class="word-text"
              :class="{ mask: maskEng }"
              @click="speak(word.e)"
            >{{ word.e }}</span>
            <span class="ipa">{{ word.i }}</span>
            <span class="mini-speaker" @click="speak(word.e)">🔊</span>
          </template>
        </div>
        <!-- 中文区域 -->
        <div class="chi-area">
          <span
            class="chi-text"
            :class="{ mask: maskChi }"
            @click="toggleRevealed"
          >{{ word.c }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue';

// ==================== 自动加载所有单词组 ====================
const wordModules = import.meta.glob('../data/Vocab/v*.js', { eager: true });

// 从文件名提取组号，并按数字排序
const availableSets = Object.keys(wordModules)
  .map(path => {
    const match = path.match(/v(\d+)\.js$/);
    return match ? parseInt(match[1]) : null;
  })
  .filter(Boolean)
  .sort((a, b) => a - b);

// 构建组号到单词数组的映射
const rawWordSets = {};
availableSets.forEach(setNum => {
  // 找到对应的模块路径
  const key = `../data/Vocab/v${setNum}.js`;
  const mod = wordModules[key];
  // 兼容多种导出名：memorizeWords, memorizeWordsV1, memorizeWordsV2...
  const words = mod.memorizeWords || mod[`memorizeWordsV${setNum}`] || Object.values(mod)[0];
  if (words) {
    rawWordSets[setNum] = words;
  }
});

// ==================== 缓存管理 ====================
const STORAGE_KEY_PREFIX = 'cet_memorize_progress';

const getStorageKey = (set) => `${STORAGE_KEY_PREFIX}_set${set}`;

const loadProgress = (set) => {
  try {
    const raw = localStorage.getItem(getStorageKey(set));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveProgress = (set, wordsArray) => {
  const progress = {};
  wordsArray.forEach(w => {
    if (w.status !== 'none') {
      progress[w.e.toLowerCase()] = w.status;
    }
  });
  localStorage.setItem(getStorageKey(set), JSON.stringify(progress));
};

// ==================== 状态 ====================
const currentSet = ref(availableSets[0] || 1);
const currentMode = ref('browse');
const maskEng = ref(false);
const maskChi = ref(false);
const filterMistake = ref(false);

// 当前单词数组
const words = reactive([]);

// 初始化或切换组
const initWords = (setNum) => {
  const cached = loadProgress(setNum);
  const baseWords = rawWordSets[setNum] || [];
  words.length = 0;
  baseWords.forEach(w => {
    words.push({
      ...w,
      status: cached[w.e?.toLowerCase()] || 'none',
    });
  });
};

// 切换组
const switchSet = (setNum) => {
  if (currentSet.value === setNum) return;
  saveProgress(currentSet.value, words);
  currentSet.value = setNum;
  initWords(setNum);
  currentMode.value = 'browse';
  filterMistake.value = false;
};

// 首次加载
onMounted(() => {
  if (availableSets.length > 0) {
    initWords(availableSets[0]);
  }
});

// ==================== 计算属性 ====================
const displayWords = computed(() => {
  if (filterMistake.value) {
    return words.filter(w => w.status === 'wrong');
  }
  return words;
});

const correctCount = computed(() => words.filter(w => w.status === 'correct').length);
const wrongCount = computed(() => words.filter(w => w.status === 'wrong').length);

// ==================== 朗读 ====================
const speak = (content) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(content);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
};

// ==================== 拼写检查 ====================
const checkSpell = (e, wordObj) => {
  const userValue = e.target.value.trim().toLowerCase();
  if (!userValue) return;
  if (userValue === wordObj.e.toLowerCase()) {
    if (wordObj.status !== 'correct') {
      wordObj.status = 'correct';
      speak(wordObj.e);
      saveProgress(currentSet.value, words);
    }
  } else {
    wordObj.status = 'wrong';
    saveProgress(currentSet.value, words);
  }
};

const handleEnter = (e, wordObj) => {
  checkSpell(e, wordObj);
  const inputs = Array.from(document.querySelectorAll('input'));
  const idx = inputs.indexOf(e.target);
  if (idx < inputs.length - 1) inputs[idx + 1].focus();
};

const toggleRevealed = (e) => {
  e.target.classList.toggle('revealed');
};

// ==================== 重置 ====================
const resetAll = () => {
  if (confirm("确定要清空当前组的所有进度吗？")) {
    words.forEach(w => (w.status = 'none'));
    document.querySelectorAll('input').forEach(i => (i.value = ''));
    localStorage.removeItem(getStorageKey(currentSet.value));
  }
};

// 离开时保存
onUnmounted(() => {
  saveProgress(currentSet.value, words);
  window.speechSynthesis.cancel();
});
</script>

<style scoped>
/* 样式和之前完全相同，这里省略，你保持原来的 style 即可 */
.memorize-container { max-width: 900px; margin: 0 auto; padding: 20px; min-height: 100vh; }
.sticky-header { position: sticky; top: 10px; background: white; padding: 20px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); z-index: 100; margin-bottom: 30px; text-align: center; border: 1px solid #eef2f6; }
.stats { display: flex; justify-content: center; gap: 30px; margin-bottom: 15px; font-weight: 800; font-size: 1.1rem; }
.num { color: #4a90e2; }
.stat-item.correct .num { color: #2ecc71; }
.stat-item.wrong .num { color: #e74c3c; }
.controls { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.switch-group { display: flex; gap: 5px; margin-right: 10px; }
button { padding: 10px 18px; border: none; border-radius: 10px; cursor: pointer; font-size: 14px; transition: 0.3s; background: #f1f5f9; color: #64748b; font-weight: 600; }
button.active { background: #4a90e2; color: white; box-shadow: 0 4px 12px rgba(74,144,226,0.3); }
button:hover { transform: translateY(-2px); }
.btn-mistake { background: #fff1f1; color: #e74c3c; border: 1px solid #ffcfcf; }
.btn-reset { color: #94a3b8; text-decoration: underline; background: none; }
.word-card { background: white; padding: 20px; border-radius: 12px; margin-bottom: 15px; display: grid; grid-template-columns: 1fr 1.2fr; gap: 20px; align-items: center; border: 2px solid #f1f5f9; transition: 0.3s; }
.card-wrong { border-color: #ffcfcf; background: #fffafa; }
.card-correct { border-color: #d1fae5; background: #f0fdf4; }
.eng-area { font-size: 1.25rem; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 10px; }
.word-text { cursor: pointer; }
.mini-speaker { font-size: 0.9rem; cursor: pointer; opacity: 0.4; transition: 0.2s; }
.mini-speaker:hover { opacity: 1; color: #4a90e2; }
.ipa { font-size: 0.9rem; color: #94a3b8; font-weight: 400; font-family: 'Arial'; }
.chi-text { color: #475569; line-height: 1.5; font-size: 1rem; cursor: pointer; }
.mask { background: #e2e8f0 !important; color: transparent !important; border-radius: 6px; user-select: none; }
.mask:hover { background: #cbd5e1 !important; }
.mask.revealed { background: transparent !important; color: inherit !important; }
input[type="text"] { width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1.1rem; outline: none; transition: 0.2s; }
input.error { border-color: #e74c3c; background: #fff1f1; }
input:focus { border-color: #4a90e2; }
@media (max-width: 600px) { .word-card { grid-template-columns: 1fr; gap: 10px; } .sticky-header { padding: 15px; top: 0; border-radius: 0; } }
</style>
