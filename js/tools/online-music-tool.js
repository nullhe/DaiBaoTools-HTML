/* 在线音乐：二级菜单外壳，页内左侧竖直菜单为三级菜单（当前：咪咕音乐） */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createOnlineMusicTool = function (container) {
  // 三级菜单注册表：后续新增在线音乐相关子功能在这里加一条即可
  var subTools = [
    { key: 'migu-music', name: '咪咕音乐', render: DaibaoTools.createMiGuMusic },
    { key: 'kuwo-music', name: '酷我音乐', render: DaibaoTools.createKuwoMusic },
    { key: 'netease-music', name: '网易云音乐', render: DaibaoTools.createNeteaseMusic },
  ];

  container.innerHTML = `
    <div class="it-layout">
      <aside class="it-menu">
        <div class="it-menu-title">在线音乐</div>
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
      <section class="it-content" id="omContent"></section>
    </div>`;

  var content = container.querySelector('#omContent');
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
