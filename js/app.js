/**
 * 呆宝工具箱 - 应用主入口
 * 原生 JavaScript 单页应用（SPA），无外部框架依赖
 * 使用全局命名空间 DaibaoTools，兼容 file:// 双击打开
 */

// 工具分类与工具定义
const categories = [
  {
    key: 'home',
    name: '首页',
    icon: '🏠',
    isHome: true,
    tools: [],
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
      { key: 'net-tool', name: '网络工具', factory: DaibaoTools.createNetTool },
    ],
  },
  {
    key: 'office',
    name: '办公工具',
    icon: '📄',
    tools: [
      // 财务工具整体并入办公工具，作为二级菜单（其下 3 个原二级工具变为三级菜单），固定放第一位
      { key: 'finance-tool', name: '财务工具', factory: DaibaoTools.createFinanceTool },
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
      { key: 'random', name: '随机数生成', factory: DaibaoTools.createRandomGenerator },
      { key: 'color-picker', name: '颜色选择器', factory: DaibaoTools.createColorPicker },
      { key: 'morse-tool', name: '摩斯电码', factory: DaibaoTools.createMorseTool },
      { key: 'garbage-tool', name: '垃圾分类', factory: DaibaoTools.createGarbageTool },
      { key: 'weather-tool', name: '天气查询', factory: DaibaoTools.createWeatherTool },
    ],
  },
  {
    key: 'image',
    name: '图片工具',
    icon: '🖼️',
    tools: [
      { key: 'icon-tool', name: '图标处理', factory: DaibaoTools.createIconTool },
      { key: 'qr-tool', name: '二维码', factory: DaibaoTools.createQrTool },
    ],
  },
  {
    key: 'music',
    name: '音乐音频',
    icon: '🎵',
    tools: [
      { key: 'music-tool', name: '歌词下载', factory: DaibaoTools.createMusicTool },
      { key: 'online-music-tool', name: '在线音乐', factory: DaibaoTools.createOnlineMusicTool },
    ],
  },
  {
    key: 'study',
    name: '学习资料',
    icon: '📚',
    tools: [
      { key: 'english-tool', name: '英语学习', factory: DaibaoTools.createEnglishTool },
      { key: 'language-tool', name: '语言文学', factory: DaibaoTools.createLanguageTool },
    ],
  },
  {
    key: 'other',
    name: '其他分类',
    icon: '🧩',
    tools: [
      { key: 'fun-calc-tool', name: '趣味测算', factory: DaibaoTools.createFunCalcTool },
      { key: 'hotnews-tool', name: '热点资讯', factory: DaibaoTools.createHotNewsTool },
      { key: 'leisure-tool', name: '休闲娱乐', factory: DaibaoTools.createLeisureTool },
      { key: 'gallery-tool', name: '图册表情', factory: DaibaoTools.createGalleryTool },
      { key: 'info-query-tool', name: '信息查询', factory: DaibaoTools.createInfoQueryTool },
    ],
  },
];

// 当前状态
let currentCategory = 'home';
let currentTool = 'finance-tool';

// DOM 元素
const mainNav = document.getElementById('mainNav');
const subNavList = document.getElementById('subNavList');
const subNavBar = document.getElementById('subNavBar');
const appMain = document.getElementById('appMain');

/**
 * 渲染完成后的统一钩子：交给动效层做入场动画、数字滚动监听与指示条同步。
 * 动效层未加载时静默跳过，不影响功能。
 */
function afterRender(container) {
  if (window.DaibaoMotion && typeof window.DaibaoMotion.onContentChange === 'function') {
    try {
      window.DaibaoMotion.onContentChange(container || null);
    } catch (e) {
      /* 动效出错不能影响工具本身 */
    }
  } else if (window.DaibaoMotion) {
    window.DaibaoMotion.syncIndicators();
  }
}

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
      // 默认选中该分类下第一个工具（首页无需工具）
      const category = categories.find((c) => c.key === catKey);
      if (category && category.tools && category.tools.length) {
        currentTool = category.tools[0].key;
      }
      renderMainNav();
      renderSubNav();
      renderTool();
    });
  });

  afterRender(null);
}

// 渲染二级导航
function renderSubNav() {
  const category = categories.find((c) => c.key === currentCategory);
  if (!category) return;
  // 首页是导航落地页，不需要二级工具菜单
  subNavBar.hidden = !!category.isHome;
  if (category.isHome) { subNavList.innerHTML = ''; return; }

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

  afterRender(null);
}

// 渲染当前工具
function renderTool() {
  const category = categories.find((c) => c.key === currentCategory);
  if (!category) return;

  // 首页：渲染独立的导航落地页（不使用 tool-card 包裹）
  if (category.isHome) {
    appMain.innerHTML = '';
    try {
      if (typeof DaibaoTools.createHomePage === 'function') {
        DaibaoTools.createHomePage(appMain);
      } else {
        appMain.innerHTML = '<div class="tool-empty"><div class="tool-empty-icon">🏠</div><h3>首页模块未加载</h3><p>js/tools/home-page.js 未正确引入。</p></div>';
      }
    } catch (err) {
      appMain.innerHTML = '<div class="tool-empty"><div class="tool-empty-icon">⚠️</div><h3>首页加载出错</h3><p>' + (err && err.message ? err.message : err) + '</p></div>';
    }
    afterRender(appMain);
    return;
  }

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

  afterRender(container);
}

// 初始化
function init() {
  renderMainNav();
  renderSubNav();
  renderTool();
}

init();
