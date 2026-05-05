 // src/data/index.js — 自动树形分类版
const articleModules = import.meta.glob('./articles/**/*.js', { eager: true });

// 父分类目录名 → 显示名称
const parentNameMap = {
  cet4: 'CET-4 四级核心阅读',
  cet6: 'CET-6 六级深度阅读',
  zsb: '专升本阅读',
};

/**
 * 将子目录名转换为友好显示名
 * 例如: 'if-tomorrow-comes' -> 'If Tomorrow Comes'
 */
function dirNameToDisplay(dir) {
  return dir
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const builtTree = {};

for (const [path, mod] of Object.entries(articleModules)) {
  const article = mod.default;
  if (!article || !article.id) continue;

  // 路径示例: ./articles/cet4/if-tomorrow-comes/a1.js
  const parts = path.replace('./articles/', '').split('/'); // ['cet4', 'if-tomorrow-comes', 'a1.js']
  const parentDir = parts[0];           // 'cet4'
  const subDir = parts.length >= 3 ? parts[1] : null; // 'if-tomorrow-comes' 或 null

  if (!parentNameMap[parentDir]) {
    console.warn('未识别的父分类目录:', parentDir);
    continue;
  }

  const parentName = parentNameMap[parentDir];

  // 初始化父分类
  if (!builtTree[parentName]) {
    builtTree[parentName] = { articles: [], subGroups: {} };
  }

  if (subDir) {
    const subName = '长篇连载 · ' + dirNameToDisplay(subDir);
    if (!builtTree[parentName].subGroups[subName]) {
      builtTree[parentName].subGroups[subName] = { articles: [] };
    }
    builtTree[parentName].subGroups[subName].articles.push(article);
  } else {
    // 根目录下的文章（无二级目录）
    builtTree[parentName].articles.push(article);
  }
}

export const categoryTreeData = builtTree;

// 扁平化所有文章，兼容老代码
export const allArticles = Object.values(builtTree).flatMap(parent => [
  ...parent.articles,
  ...Object.values(parent.subGroups).flatMap(sub => sub.articles),
]);
