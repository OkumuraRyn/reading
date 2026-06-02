import OpenAI from "openai";

const openai = new OpenAI({
  // 使用 Vite 代理，密钥由后端隐藏
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: localStorage.getItem('deepseek_api_key') || '',
  dangerouslyAllowBrowser: true
});

// 缓存管理保持不变
const CACHE_NAME = 'cet_ai_cache';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 天

const getCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_NAME);
    if (!raw) return {};
    const cache = JSON.parse(raw);
    const now = Date.now();
    // 清理过期条目
    let hasExpired = false;
    for (const [key, entry] of Object.entries(cache)) {
      if (now - entry.timestamp > CACHE_DURATION) {
        delete cache[key];
        hasExpired = true;
      }
    }
    if (hasExpired) {
      localStorage.setItem(CACHE_NAME, JSON.stringify(cache));
    }
    return cache;
  } catch {
    return {};
  }
};

const setCache = (key, val) => {
  const cache = getCache();
  cache[key] = {
    data: val,
    timestamp: Date.now(),
  };
  localStorage.setItem(CACHE_NAME, JSON.stringify(cache));
};

// getCachedResult 也要随之修改
export function getCachedResult(type, query, context = "") {
  const key = `${type}_${query}_${context}`;
  const entry = getCache()[key];
  return entry ? entry.data : null;
}

export async function askDeepSeek(word, contextSent = "") {
  const cacheKey = `dict_${word}_${contextSent}`;
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `你是一个专业的英语语境词典。分析要求如下：

1. 【禁止格式】：严禁使用任何 Markdown 格式符号（如 **、#、*、- 等），必须使用纯文本。
2. 【语境优先】：必须结合用户提供的句子，给出该单词在当前句子中的具体含义。
3. 【输出结构】：
   单词: [单词] [音标]
   语境意义: [第一步：先提取该词在句中按照英语母语者阅读时的理解单位也就是chunk，并附上中文翻译，格式：chunk — 中文意思。第二步：用简单易懂的中文解释这个chunk是什么意思，让人看完就能理解。第三步：给出此单词的中文意思]
   语法分析: [简述该词在句中的chunk中的作用]
   例句: [基于这个词在本句中的chunk，再造一个简单例句帮助理解]`
        },
        {
          role: "user",
          content: contextSent
            ? `请结合下文语境分析单词 "${word}"。句子：${contextSent}`
            : `请分析单词: ${word}`
        }
      ],
      model: "deepseek-chat",
    });
    const result = completion.choices[0].message.content;
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    return handleAiError(error);
  }
}

export async function askAiQuestion(question, contextSent = "") {
  const cacheKey = `quest_${question}_${contextSent}`;
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `你是一个专业的英语老师。请回答用户关于文章句子的提问。
1. 【要求】：严禁使用 Markdown 符号（如 ** 等），只输出纯文本。使用换行来对齐内容。
2. 【语境】：如果是语法分析，请详细解释介词、连词或特定短语的作用。
3. 【简洁】：回答要直击重点，不要有冗长的开场白。`
        },
        {
          role: "user",
          content: contextSent
            ? `背景句子：${contextSent}\n我的问题：${question}`
            : `我的问题：${question}`
        }
      ],
      model: "deepseek-chat",
    });
    const result = completion.choices[0].message.content;
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    return handleAiError(error);
  }
}

function handleAiError(error) {
  if (error.status === 402) return "❌ 【余额不足】请前往 DeepSeek 官网充值。";
  if (error.status === 401) return "❌ 【API KEY 错误】请检查配置文件。";
  if (error.status === 429) return "❌ 【请求频繁】请几秒后再试。";
  return `🔍 【网络连接异常】状态码: ${error.status || '未知'}。可能是 API 密钥没填或代理没生效。`;
}
