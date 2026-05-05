// src/data/index.js — 树形分类版
const articleModules = import.meta.glob('./articles/**/*.js', { eager: true });

// 定义父分类与子分类规则
const categoryTree = {
  'CET-4 四级核心阅读': {
    matchDir: 'cet4',
    subGroups: {
      '长篇连载 · If Tomorrow Comes': {
        matchDir: 'if-tomorrow-comes',
      },
    },
  },
  'CET-6 六级深度阅读': {
    matchDir: 'cet6',
    subGroups: {
      '长篇连载 · The Everest Story': {
        matchDir: 'the-everest-story',
      },
      '长篇连载 · Wonder': {
        matchDir: 'wonder',
      },
    },
  },
  '专升本阅读': {
    matchDir: 'zsb',
    subGroups: {},
  },
};

// 构建树： { 父分类: { articles: [...], subGroups: { 子分类名: { articles: [...] } } } }
const builtTree = {};
for (const [parentName, cfg] of Object.entries(categoryTree)) {
  builtTree[parentName] = {
    articles: [],
    subGroups: {},
  };
  // 初始化子分类
  for (const [subName, subCfg] of Object.entries(cfg.subGroups)) {
    builtTree[parentName].subGroups[subName] = {
      articles: [],
    };
  }
}

for (const [path, mod] of Object.entries(articleModules)) {
  const article = mod.default;
  if (!article || !article.id) continue;

  let matched = false;
  for (const [parentName, cfg] of Object.entries(categoryTree)) {
    // 检查是否属于当前父分类（路径中包含该父分类的目录名）
    if (path.includes(`/${cfg.matchDir}/`)) {
      // 检查是否属于某个子分类
      let placed = false;
      for (const [subName, subCfg] of Object.entries(cfg.subGroups)) {
        if (path.includes(`/${subCfg.matchDir}/`)) {
          builtTree[parentName].subGroups[subName].articles.push(article);
          placed = true;
          break;
        }
      }
      // 不属于任何子分类 → 普通文章
      if (!placed) {
        builtTree[parentName].articles.push(article);
      }
      matched = true;
      break;
    }
  }
  // 若未匹配到任何分类，忽略或放入其它
  if (!matched) {
    console.warn('未分类文章：', path);
  }
}

export const categoryTreeData = builtTree;

// 为了兼容旧代码，保留扁平化的 allArticles
export const allArticles = Object.values(builtTree).flatMap(parent => [
  ...parent.articles,
  ...Object.values(parent.subGroups).flatMap(sub => sub.articles),
]);
