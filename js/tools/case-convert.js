/* 大小写转换 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createCaseConvert = function (container) {
  container.innerHTML = `
    <div class="tool-wrap">
      <div class="tool-head">
        <div class="tool-title">大小写转换</div>
        <div class="tool-subtitle">驼峰、下划线、短横线等命名风格互转</div>
      </div>
      <div class="tool-cols">
        <div class="tool-col">
          <div class="tool-panel-title">输入</div>
          <textarea class="tool-textarea" id="ccInput" placeholder="在此输入文本，如 user name、UserName、user_name"></textarea>
          <div class="tool-btn-row">
            <button class="tool-btn" data-mode="upper">全大写</button>
            <button class="tool-btn" data-mode="lower">全小写</button>
            <button class="tool-btn" data-mode="title">首字母大写</button>
            <button class="tool-btn" data-mode="camel">驼峰 camelCase</button>
            <button class="tool-btn" data-mode="pascal">帕斯卡 PascalCase</button>
            <button class="tool-btn" data-mode="snake">下划线 snake_case</button>
            <button class="tool-btn" data-mode="kebab">短横线 kebab-case</button>
            <button class="tool-btn primary" id="ccClear">清空</button>
          </div>
        </div>
        <div class="tool-col">
          <div class="tool-panel-title">结果</div>
          <div class="tool-output" id="ccOutput"></div>
          <div class="tool-btn-row">
            <button class="tool-btn accent" id="ccCopy">复制结果</button>
          </div>
          <p class="tool-hint">转换前会先按空格、下划线、短横线以及大小写边界拆分单词，因此 user_name、user-name、UserName 都能正确识别。</p>
        </div>
      </div>
    </div>`;

  var input = container.querySelector('#ccInput');
  var output = container.querySelector('#ccOutput');

  function words(str) {
    return str
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .split(/[^a-zA-Z0-9\u4e00-\u9fa5]+/)
      .filter(Boolean);
  }

  function cap(w) {
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  }

  function convert(mode, str) {
    if (!str) return '';
    var ws = words(str);
    switch (mode) {
      case 'upper':
        return str.toUpperCase();
      case 'lower':
        return str.toLowerCase();
      case 'title':
        return ws.map(cap).join(' ');
      case 'camel':
        return ws.map(function (w, i) { return i === 0 ? w.toLowerCase() : cap(w); }).join('');
      case 'pascal':
        return ws.map(cap).join('');
      case 'snake':
        return ws.map(function (w) { return w.toLowerCase(); }).join('_');
      case 'kebab':
        return ws.map(function (w) { return w.toLowerCase(); }).join('-');
      default:
        return str;
    }
  }

  container.querySelectorAll('[data-mode]').forEach(function (btn) {
    btn.onclick = function () {
      output.textContent = convert(btn.dataset.mode, input.value.trim());
    };
  });

  container.querySelector('#ccClear').onclick = function () {
    input.value = '';
    output.textContent = '';
  };

  container.querySelector('#ccCopy').onclick = function () {
    if (!output.textContent) {
      DaibaoTools.toast('没有可复制的内容');
      return;
    }
    DaibaoTools.copyText(output.textContent);
    DaibaoTools.toast('已复制到剪贴板');
  };
};
