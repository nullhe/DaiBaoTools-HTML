/* 字数统计 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createWordCount = function (container) {
  container.innerHTML = `
    <div class="tool-wrap">
      <div class="tool-head">
        <div class="tool-title">字数统计</div>
        <div class="tool-subtitle">实时统计字符、单词、行数与字节数</div>
      </div>
      <div class="tool-field">
        <span class="tool-label">输入文本</span>
        <textarea class="tool-textarea" id="wcInput" placeholder="在此粘贴或输入文本…"></textarea>
      </div>
      <div class="tool-stats">
        <div class="tool-stat"><div class="tool-stat-num" id="wcTotal">0</div><div class="tool-stat-label">字符数</div></div>
        <div class="tool-stat"><div class="tool-stat-num" id="wcNoSpace">0</div><div class="tool-stat-label">去空白字符</div></div>
        <div class="tool-stat"><div class="tool-stat-num" id="wcCn">0</div><div class="tool-stat-label">中文字符</div></div>
        <div class="tool-stat"><div class="tool-stat-num" id="wcEn">0</div><div class="tool-stat-label">英文单词</div></div>
        <div class="tool-stat"><div class="tool-stat-num" id="wcNum">0</div><div class="tool-stat-label">数字个数</div></div>
        <div class="tool-stat"><div class="tool-stat-num" id="wcLines">0</div><div class="tool-stat-label">行数</div></div>
        <div class="tool-stat"><div class="tool-stat-num" id="wcPara">0</div><div class="tool-stat-label">段落数</div></div>
        <div class="tool-stat"><div class="tool-stat-num" id="wcBytes">0</div><div class="tool-stat-label">UTF-8 字节</div></div>
      </div>
      <div class="tool-btn-row">
        <button class="tool-btn" id="wcClear">清空</button>
      </div>
    </div>`;

  var input = container.querySelector('#wcInput');
  var ids = ['wcTotal', 'wcNoSpace', 'wcCn', 'wcEn', 'wcNum', 'wcLines', 'wcPara', 'wcBytes'];
  var els = {};
  ids.forEach(function (id) {
    els[id] = container.querySelector('#' + id);
  });

  function update() {
    var str = input.value;
    var chars = Array.from(str);
    var cn = str.match(/[\u4e00-\u9fa5]/g) || [];
    var en = str.match(/[A-Za-z]+/g) || [];
    var num = str.match(/\d/g) || [];
    var lines = str ? str.split(/\r\n|\r|\n/).length : 0;
    var paras = str.split(/\n\s*\n/).filter(function (s) { return s.trim(); }).length;

    els.wcTotal.textContent = chars.length;
    els.wcNoSpace.textContent = Array.from(str.replace(/\s/g, '')).length;
    els.wcCn.textContent = cn.length;
    els.wcEn.textContent = en.length;
    els.wcNum.textContent = num.length;
    els.wcLines.textContent = lines;
    els.wcPara.textContent = paras;
    els.wcBytes.textContent = new TextEncoder().encode(str).length;
  }

  input.addEventListener('input', update);
  container.querySelector('#wcClear').onclick = function () {
    input.value = '';
    update();
  };
  update();
};
