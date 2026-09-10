/* 英语学习：学习资料 L2 外壳，页内左侧竖直菜单为三级菜单（当前：随机英文单词） */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createEnglishTool = function (container) {
  // 三级菜单注册表：后续新增英语学习相关子功能在这里加一条即可
  var subTools = [
    { key: 'random-word', name: '随机英文单词', render: DaibaoTools.createRandomWord },
  ];

  container.innerHTML = `
    <div class="it-layout">
      <aside class="it-menu">
        <div class="it-menu-title">英语学习</div>
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
      <section class="it-content" id="enContent"></section>
    </div>`;

  var content = container.querySelector('#enContent');
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
