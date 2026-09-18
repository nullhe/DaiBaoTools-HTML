/* 财务工具：办公工具 L2 外壳，页内左侧竖直菜单为三级菜单（增值税计算器 / 个税计算器 / 单位换算） */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createFinanceTool = function (container) {
  // 三级菜单注册表：后续新增财务相关子功能在这里加一条即可
  var subTools = [
    { key: 'vat-calculator', name: '增值税计算器', render: DaibaoTools.createVatCalculator },
    { key: 'tax-calculator', name: '个税计算器', render: DaibaoTools.createTaxCalculator },
    { key: 'unit-converter', name: '单位换算', render: DaibaoTools.createUnitConverter },
  ];

  container.innerHTML = `
    <div class="it-layout">
      <aside class="it-menu">
        <div class="it-menu-title">财务工具</div>
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
      <section class="it-content" id="financeContent"></section>
    </div>`;

  var content = container.querySelector('#financeContent');
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
