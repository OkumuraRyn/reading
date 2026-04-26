/* src/store/studyStore.js — Pinia 版本 */

import { defineStore } from 'pinia';

const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 天过期
const STORAGE_KEY = 'cet_study_vocab';

export const useStudyStore = defineStore('study', {
  state: () => ({
    vocabularyList: [],
    currentDictEntry: null,
    isAiLoading: false,
    jumpTarget: null,
  }),

  getters: {
    // 单词总数
    totalWords: (state) => state.vocabularyList.length,

    // 按文章 ID 获取单词列表
    getWordsByArticle: (state) => (articleId) => {
      return state.vocabularyList.filter(v => 
        v.articleId === articleId || (v.sources && v.sources.includes(articleId))
      );
    },

    // 单词是否在词库中
    hasWord: (state) => (word) => {
      const w = word.toLowerCase();
      return state.vocabularyList.some(v => v.word.toLowerCase() === w);
    },
  },

  actions: {
    // 初始化：从 localStorage 恢复
    init() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const data = JSON.parse(saved);
          // 过滤过期缓存（只清理 AI 详情，保留生词列表）
          const now = Date.now();
          this.vocabularyList = data.map(item => ({
            ...item,
            detail: (item.detailTimestamp && now - item.detailTimestamp > CACHE_DURATION) 
              ? null 
              : item.detail
          }));
        }
      } catch {
        this.vocabularyList = [];
      }
    },

    // 持久化到 localStorage
    _persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.vocabularyList));
    },

    // 添加单词（全局唯一，多来源）
    addToVocab(entry, articleId) {
      const existing = this.vocabularyList.find(
        v => v.word.toLowerCase() === entry.word.toLowerCase()
      );

      if (existing) {
        // 更新来源
        if (!existing.sources) existing.sources = [existing.articleId];
        if (!existing.sources.includes(articleId)) {
          existing.sources.push(articleId);
        }
        existing.lastSeen = Date.now();
        // 更新 AI 详情（如果有新内容）
        if (entry.detail) {
          existing.detail = entry.detail;
          existing.detailTimestamp = Date.now();
        }
      } else {
        // 新建
        this.vocabularyList.unshift({
          word: entry.word,
          detail: entry.detail || null,
          detailTimestamp: entry.detail ? Date.now() : null,
          articleId,
          sources: [articleId],
          timestamp: Date.now(),
          lastSeen: Date.now(),
          wrongCount: 0,
        });
      }
      this._persist();
    },

    // 移除单词
    removeVocabItem(word) {
      const index = this.vocabularyList.findIndex(
        v => v.word.toLowerCase() === word.toLowerCase()
      );
      if (index !== -1) {
        this.vocabularyList.splice(index, 1);
        this._persist();
      }
    },

    // 单词跳转
    performJump(word, section, articleId = null) {
      this.jumpTarget = { word, section, articleId, t: Date.now() };
    },

    // 清空全部
    clearAll() {
      this.vocabularyList = [];
      this._persist();
    },
  },
});
