/* 热点资讯：二级菜单外壳，页内左侧竖直菜单为三级菜单（当前：历史上的今天） */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createHotNewsTool = function (container) {
  // 三级菜单注册表：后续新增热点资讯相关子功能在这里加一条即可
  var subTools = [
    { key: 'history-today', name: '历史上的今天', render: DaibaoTools.createHistoryToday },
    { key: 'toutiao-hotsearch', name: '头条热搜', render: DaibaoTools.createTouTiaoHotSearch },
    { key: 'douyin-hotsearch', name: '抖音热搜', render: DaibaoTools.createDouYinHotSearch },
    { key: 'weibo-hotsearch', name: '微博热搜', render: DaibaoTools.createWeiBoHotSearch },
    { key: 'zhihu-hotsearch', name: '知乎热搜', render: DaibaoTools.createZhiHuHotSearch },
    { key: 'penpai-news', name: '澎湃新闻', render: DaibaoTools.createPengPaiNews },
  ];

  container.innerHTML = `
    <div class="it-layout">
      <aside class="it-menu">
        <div class="it-menu-title">热点资讯</div>
        <ul class="it-menu-list">
          ${subTools
            .map(
              (t) => `
            <li class="it-menu-item" data-sub="${t.key}">${t.name}</li>
          `
            )
            .join('')}
        </ul>
      </aside>
      <section class="it-content" id="hnContent"></section>
    </div>`;

  var content = container.querySelector('#hnContent');
  var items = container.querySelectorAll('.it-menu-item');

  function activate(key) {
    var tool = null;
    for (var i = 0; i < subTools.length; i++) {
      if (subTools[i].key === key) tool = subTools[i];
    }
    if (!tool) return;

    items.forEach(function (item) {
      item.classList.toggle('active', item.dataset.sub === key);
    });

    content.innerHTML = '';
    try {
      tool.render(content);
    } catch (err) {
      content.innerHTML = `
        <div class="tool-empty">
          <div class="tool-empty-icon">⚠️</div>
          <h3>加载「${tool.name}」时出错</h3>
          <p>${err.message}</p>
        </div>
      `;
    }

    // 子功能渲染后交回动效层处理入场动画
    if (window.DaibaoMotion && window.DaibaoMotion.onContentChange) {
      try {
        window.DaibaoMotion.onContentChange(content);
      } catch (e) {
        /* 动效异常不影响功能 */
      }
    }
  }

  items.forEach(function (item) {
    item.addEventListener('click', function () {
      activate(item.dataset.sub);
    });
  });

  activate(subTools[0].key);
};
