/* 图标处理：页内左侧竖直菜单外壳，子功能可扩展注册 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createIconTool = function (container) {
  // 子功能注册表：后续新增子功能在这里加一条即可
  var subTools = [
    { key: 'arrange', name: '图标排列', render: DaibaoTools.createIconArrange },
    { key: 'get-site-ico', name: '获取网站ico', render: DaibaoTools.createGetSiteIco },
  ];

  container.innerHTML = `
    <div class="it-layout">
      <aside class="it-menu">
        <div class="it-menu-title">图标处理</div>
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
      <section class="it-content" id="itContent"></section>
    </div>`;

  var content = container.querySelector('#itContent');
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
  }

  items.forEach(function (item) {
    item.addEventListener('click', function () {
      activate(item.dataset.sub);
    });
  });

  activate(subTools[0].key);
};
