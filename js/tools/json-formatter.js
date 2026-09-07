/* JSON 格式化 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createJsonFormatter = function (container) {
  container.innerHTML = `
    <div class="tool-wrap">
      <div class="tool-head">
        <div class="tool-title">JSON 格式化</div>
        <div class="tool-subtitle">格式化 / 压缩 / 校验 JSON 数据</div>
      </div>
      <div class="tool-cols">
        <div class="tool-col">
          <div class="tool-panel-title">输入 JSON</div>
          <textarea class="tool-textarea" id="jfInput" placeholder="在此粘贴 JSON 文本…"></textarea>
          <div class="tool-inline">
            <span class="tool-label">缩进</span>
            <select class="tool-select" id="jfIndent" style="max-width:150px">
              <option value="2">2 空格</option>
              <option value="4">4 空格</option>
              <option value="tab">Tab</option>
            </select>
          </div>
          <div class="tool-btn-row">
            <button class="tool-btn primary" id="jfFormat">格式化</button>
            <button class="tool-btn" id="jfMinify">压缩</button>
            <button class="tool-btn" id="jfValidate">校验</button>
            <button class="tool-btn" id="jfClear">清空</button>
          </div>
          <div class="tool-error" id="jfError"></div>
        </div>
        <div class="tool-col">
          <div class="tool-panel-title">结果</div>
          <div class="tool-output" id="jfOutput"></div>
          <div class="tool-btn-row">
            <button class="tool-btn accent" id="jfCopy">复制结果</button>
          </div>
        </div>
      </div>
    </div>`;

  var input = container.querySelector('#jfInput');
  var indentSel = container.querySelector('#jfIndent');
  var output = container.querySelector('#jfOutput');
  var errorEl = container.querySelector('#jfError');

  function getIndent() {
    var v = indentSel.value;
    return v === 'tab' ? '\t' : parseInt(v, 10);
  }

  function run(mode) {
    var text = input.value.trim();
    errorEl.textContent = '';
    errorEl.style.color = '';
    if (!text) {
      output.textContent = '';
      errorEl.textContent = '请输入 JSON 内容';
      return;
    }
    try {
      var obj = JSON.parse(text);
      if (mode === 'minify') {
        output.textContent = JSON.stringify(obj);
      } else {
        output.textContent = JSON.stringify(obj, null, getIndent());
      }
      if (mode === 'validate') {
        errorEl.style.color = '#0f6e56';
        errorEl.textContent = 'JSON 格式正确';
      }
    } catch (e) {
      output.textContent = '';
      errorEl.textContent = '解析失败：' + e.message;
    }
  }

  container.querySelector('#jfFormat').onclick = function () { run('format'); };
  container.querySelector('#jfMinify').onclick = function () { run('minify'); };
  container.querySelector('#jfValidate').onclick = function () { run('validate'); };
  container.querySelector('#jfClear').onclick = function () {
    input.value = '';
    output.textContent = '';
    errorEl.textContent = '';
    errorEl.style.color = '';
  };
  container.querySelector('#jfCopy').onclick = function () {
    if (!output.textContent) {
      DaibaoTools.toast('没有可复制的内容');
      return;
    }
    DaibaoTools.copyText(output.textContent);
    DaibaoTools.toast('已复制到剪贴板');
  };
};
