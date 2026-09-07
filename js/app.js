/**
 * 呆宝工具箱 - 应用主入口
 * 原生 JavaScript 单页应用（SPA），无外部框架依赖
 * 使用全局命名空间 DaibaoTools，兼容 file:// 双击打开
 */

// 工具分类与工具定义
const categories = [
  {
    key: 'finance',
    name: '财务工具',
    icon: '💰',
    tools: [
      { key: 'vat-calculator', name: '增值税计算器', factory: DaibaoTools.createVatCalculator },
      { key: 'tax-calculator', name: '个税计算器', factory: DaibaoTools.createTaxCalculator },
    ],
  },
  {
    key: 'dev',
    name: '开发工具',
    icon: '💻',
    tools: [
      { key: 'json-formatter', name: 'JSON 格式化', factory: DaibaoTools.createJsonFormatter },
      { key: 'base64', name: 'Base64 编解码', factory: DaibaoTools.createBase64Tool },
      { key: 'timestamp', name: '时间戳转换', factory: DaibaoTools.createTimestampTool },
      { key: 'regex-tester', name: '正则测试器', factory: DaibaoTools.createRegexTester },
      { key: 'url-codec', name: 'URL 编解码', factory: DaibaoTools.createUrlCodec },
      { key: 'jwt-parser', name: 'JWT 解析', factory: DaibaoTools.createJwtParser },
      { key: 'text-diff', name: '文本对比', factory: DaibaoTools.createTextDiff },
    ],
  },
  {
    key: 'office',
    name: '办公工具',
    icon: '📄',
    tools: [
      { key: 'word-count', name: '字数统计', factory: DaibaoTools.createWordCount },
      { key: 'case-convert', name: '大小写转换', factory: DaibaoTools.createCaseConvert },
      { key: 'text-process', name: '文本批量处理', factory: DaibaoTools.createTextProcess },
      { key: 'password-generator', name: '密码生成器', factory: DaibaoTools.createPasswordGenerator },
    ],
  },
  {
    key: 'life',
    name: '生活工具',
    icon: '🏠',
    tools: [
      { key: 'date-calculator', name: '日期计算器', factory: DaibaoTools.createDateCalculator },
      { key: 'bmi', name: 'BMI 计算器', factory: DaibaoTools.createBmiCalculator },
      { key: 'unit-converter', name: '单位换算', factory: DaibaoTools.createUnitConverter },
    ],
  },
  {
    key: 'other',
    name: '其他分类',
    icon: '🧩',
    tools: [
      { key: 'random', name: '随机数生成', factory: DaibaoTools.createRandomGenerator },
      { key: 'color-picker', name: '颜色选择器', factory: DaibaoTools.createColorPicker },
    ],
  },
];

// 当前状态
let currentCategory = 'finance';
let currentTool = 'vat-calculator';

// DOM 元素
const mainNav = document.getElementById('mainNav');
const subNavList = document.getElementById('subNavList');
const appMain = document.getElementById('appMain');

// 占位渲染函数（用于未实现的工具）
function renderPlaceholder(container, toolName) {
  container.innerHTML = `
    <div class="tool-card">
      <div class="tool-empty">
        <div class="tool-empty-icon">🚧</div>
        <h3>「${toolName}」暂未实现</h3>
        <p>该工具正在开发中，敬请期待。</p>
      </div>
    </div>
  `;
}

// 渲染主导航
function renderMainNav() {
  const navList = mainNav.querySelector('.nav-list');
  navList.innerHTML = categories
    .map(
      (cat) => `
      <li class="nav-item ${cat.key === currentCategory ? 'active' : ''}" data-category="${cat.key}">
        <span class="nav-icon">${cat.icon}</span>
        <span class="nav-text">${cat.name}</span>
      </li>
    `
    )
    .join('');

  navList.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      const catKey = item.dataset.category;
      if (catKey === currentCategory) return;
      currentCategory = catKey;
      // 默认选中该分类下第一个工具
      const category = categories.find((c) => c.key === catKey);
      currentTool = category.tools[0].key;
      renderMainNav();
      renderSubNav();
      renderTool();
    });
  });
}

// 渲染二级导航
function renderSubNav() {
  const category = categories.find((c) => c.key === currentCategory);
  if (!category) return;

  subNavList.innerHTML = category.tools
    .map(
      (tool) => `
      <li class="sub-nav-item ${tool.key === currentTool ? 'active' : ''}" data-tool="${tool.key}">
        ${tool.name}
      </li>
    `
    )
    .join('');

  subNavList.querySelectorAll('.sub-nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      const toolKey = item.dataset.tool;
      if (toolKey === currentTool) return;
      currentTool = toolKey;
      renderSubNav();
      renderTool();
    });
  });
}

// 渲染当前工具
function renderTool() {
  const category = categories.find((c) => c.key === currentCategory);
  if (!category) return;
  const tool = category.tools.find((t) => t.key === currentTool);
  if (!tool) return;

  appMain.innerHTML = '<div class="tool-card" id="toolContainer"></div>';
  const container = document.getElementById('toolContainer');

  if (typeof tool.factory === 'function') {
    try {
      tool.factory(container, tool.name);
    } catch (err) {
      container.innerHTML = `
        <div class="tool-empty">
          <div class="tool-empty-icon">⚠️</div>
          <h3>加载「${tool.name}」时出错</h3>
          <p>${err.message}</p>
        </div>
      `;
    }
  }
}

// 初始化
function init() {
  renderMainNav();
  renderSubNav();
  renderTool();
}

init();
