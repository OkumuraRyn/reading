import { ref, onUnmounted } from 'vue';

export function useFullReading() {
  const readingState = ref('idle'); // idle | playing | paused
  const currentParaIdx = ref(-1);
  const currentSentIdx = ref(-1);
  const currentIndex = ref(0);

  let sentenceQueue = [];
  let utterance = null;

  const stopCurrentUtterance = () => {
    if (utterance) {
      utterance.onend = null;
      utterance.onerror = null;
      window.speechSynthesis.cancel();
    }
  };

  const playNext = () => {
    if (readingState.value !== 'playing') return;
    if (currentIndex.value >= sentenceQueue.length) {
      stop();
      return;
    }

    const { text, pIdx, sIdx } = sentenceQueue[currentIndex.value];
    currentParaIdx.value = pIdx;
    currentSentIdx.value = sIdx;

    utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.onend = () => {
      currentIndex.value++;
      playNext();
    };
    utterance.onerror = () => {
      currentIndex.value++;
      playNext();
    };
    window.speechSynthesis.speak(utterance);
  };

  const start = (paragraphs, startIndex = 0) => {
    sentenceQueue = [];
    paragraphs.forEach((para, pIdx) => {
      // 关键修复：只处理包含 sentences 的段落
      if (para.sentences && Array.isArray(para.sentences)) {
        para.sentences.forEach((sent, sIdx) => {
          sentenceQueue.push({ text: sent.en, pIdx, sIdx });
        });
      }
    });
    if (sentenceQueue.length === 0) return;
    currentIndex.value = startIndex;
    readingState.value = 'playing';
    playNext();
  };

  const pause = () => {
    stopCurrentUtterance();
    readingState.value = 'paused';
  };

  const resume = () => {
    readingState.value = 'playing';
    playNext();
  };

  const stop = () => {
    stopCurrentUtterance();
    readingState.value = 'idle';
    currentParaIdx.value = -1;
    currentSentIdx.value = -1;
    currentIndex.value = 0;
    sentenceQueue = [];
  };

  const gotoIndex = (index) => {
    if (index < 0 || index >= sentenceQueue.length) return;
    const wasPlaying = readingState.value === 'playing';
    stopCurrentUtterance();
    currentIndex.value = index;
    if (wasPlaying) {
      readingState.value = 'playing';
      playNext();
    } else {
      const { pIdx, sIdx } = sentenceQueue[index];
      currentParaIdx.value = pIdx;
      currentSentIdx.value = sIdx;
    }
  };

  const nextSentence = () => gotoIndex(currentIndex.value + 1);
  const prevSentence = () => gotoIndex(currentIndex.value - 1);

  onUnmounted(() => stop());

  return {
    readingState,
    currentParaIdx,
    currentSentIdx,
    currentIndex,
    start,
    pause,
    resume,
    stop,
    nextSentence,
    prevSentence,
    gotoIndex
  };
}
