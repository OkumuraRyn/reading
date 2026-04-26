/* src/composables/useFullReading.js */

import { ref, onUnmounted } from 'vue';

export function useFullReading() {
  const readingState = ref('idle'); // idle | playing | paused
  const currentParaIdx = ref(-1);
  const currentSentIdx = ref(-1);
  
  let sentenceQueue = [];
  let currentIndex = 0;

  const start = (paragraphs) => {
    // 构建句子队列
    sentenceQueue = [];
    paragraphs.forEach((para, pIdx) => {
      para.sentences.forEach((sent, sIdx) => {
        sentenceQueue.push({ text: sent.en, pIdx, sIdx });
      });
    });
    currentIndex = 0;
    readingState.value = 'playing';
    playNext();
  };

  const pause = () => {
    window.speechSynthesis.cancel();
    readingState.value = 'paused';
  };

  const resume = () => {
    readingState.value = 'playing';
    playNext();
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    readingState.value = 'idle';
    currentParaIdx.value = -1;
    currentSentIdx.value = -1;
    sentenceQueue = [];
    currentIndex = 0;
  };

  const playNext = () => {
    if (readingState.value !== 'playing') return;
    if (currentIndex >= sentenceQueue.length) {
      stop();
      return;
    }

    const { text, pIdx, sIdx } = sentenceQueue[currentIndex];
    currentParaIdx.value = pIdx;
    currentSentIdx.value = sIdx;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.onend = () => {
      currentIndex++;
      playNext();
    };
    utterance.onerror = () => {
      currentIndex++;
      playNext();
    };
    window.speechSynthesis.speak(utterance);
  };

  onUnmounted(() => {
    stop();
  });

  return {
    readingState,
    currentParaIdx,
    currentSentIdx,
    start,
    pause,
    resume,
    stop,
  };
}
