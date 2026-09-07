/* URL 编解码 + 查询参数解析 + URL 结构分解 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createUrlCodec = function (container) {
  container.innerHTML = `
    <div class="tool-wrap">
      <div class="tool-head">
        <div class="tool-title">URL 编解码</div>
        <div class="tool-subtitle">URI 组件编解码、查询串解析、URL 结构拆解</div>
      </div>

      <div>
        <div class="tool-panel-title">编解码</div>
        <textarea class="tool-textarea" id="urlText" style="min-height:150px" placeholder="输入 URL 或任意文本…&#10;https://www.example.com/search?q=中文 测试&page=1#top"></textarea>
        <div class="tool-btn-row">
          <button class="tool-btn primary" id="urlEncodeComp">encodeURIComponent</button>
          <button class="tool-btn primary" id="urlDecodeComp">decodeURIComponent</button>
          <button class="tool-btn" id="urlEncode">encodeURI（整串）</button>
          <button class="tool-btn" id="urlDecode">decodeURI（整串）</button>
          <button class="tool-btn accent" id="urlCopy">复制</button>
          <button class="tool-btn" id="urlClear">清空</button>
        </div>
        <div class="tool-error" id="urlError"></div>
        <p class="tool-hint">
          <code>encodeURIComponent</code> 会编码 <code>/ ? & = #</code> 等所有保留字符，适合拼接参数值；<br>
          <code>encodeURI</code> 保留 URL 结构字符，只编码空格、中文等，适合处理整条 URL。
        </p>
      </div>

      <div class="tool-cols">
        <div class="tool-col">
          <div class="tool-panel-title">查询参数解析</div>
          <div class="tool-field">
            <label class="tool-label" for="urlQuery">查询串（可带前导 ?）</label>
            <input class="tool-input" type="text" id="urlQuery" placeholder="q=中文&page=1&tag=a&tag=b">
          </div>
          <div class="tool-btn-row">
            <button class="tool-btn primary" id="urlParseQuery">解析</button>
            <button class="tool-btn" id="urlBuildQuery">从表格生成</button>
            <button class="tool-btn" id="urlAddRow">新增一行</button>
          </div>
          <div class="tool-table-wrap" style="max-height:260px;overflow:auto">
            <table class="tool-table" id="urlParamTable">
              <thead><tr><th>参数名</th><th>参数值</th><th style="width:60px">操作</th></tr></thead>
              <tbody></tbody>
            </table>
          </div>
          <div class="tool-error" id="urlQueryError"></div>
        </div>

        <div class="tool-col">
          <div class="tool-panel-title">URL 结构分解</div>
          <div class="tool-field">
            <label class="tool-label" for="urlFull">完整 URL</label>
            <input class="tool-input" type="text" id="urlFull" placeholder="https://user:pass@www.example.com:8080/a/b?x=1#sec">
          </div>
          <div class="tool-btn-row">
            <button class="tool-btn primary" id="urlParse">解析</button>
          </div>
          <div class="tool-table-wrap" style="max-height:260px;overflow:auto">
            <table class="tool-table" id="urlStructTable">
              <thead><tr><th style="width:100px">组成部分</th><th>值</th></tr></thead>
              <tbody></tbody>
            </table>
          </div>
          <div class="tool-error" id="urlStructError"></div>
        </div>
      </div>
    </div>`;

  var textEl = container.querySelector('#urlText');
  var errorEl = container.querySelector('#urlError');

  function safe(fn, label) {
    errorEl.textContent = '';
    if (!textEl.value) {
      errorEl.textContent = '请输入内容';
      return;
    }
    try {
      textEl.value = fn(textEl.value);
    } catch (e) {
      errorEl.textContent = label + '失败：' + e.message;
    }
  }

  container.querySelector('#urlEncodeComp').onclick = function () {
    safe(function (s) { return encodeURIComponent(s); }, '编码');
  };
  container.querySelector('#urlDecodeComp').onclick = function () {
    safe(function (s) { return decodeURIComponent(s); }, '解码');
  };
  container.querySelector('#urlEncode').onclick = function () {
    safe(function (s) { return encodeURI(s); }, '编码');
  };
  container.querySelector('#urlDecode').onclick = function () {
    safe(function (s) { return decodeURI(s); }, '解码');
  };
  container.querySelector('#urlCopy').onclick = function () {
    if (!textEl.value) {
      DaibaoTools.toast('没有可复制的内容');
      return;
    }
    DaibaoTools.copyText(textEl.value);
    DaibaoTools.toast('已复制');
  };
  container.querySelector('#urlClear').onclick = function () {
    textEl.value = '';
    errorEl.textContent = '';
  };

  // ---------- 查询参数 ----------
  var queryEl = container.querySelector('#urlQuery');
  var paramBody = container.querySelector('#urlParamTable tbody');
  var queryError = container.querySelector('#urlQueryError');

  function addParamRow(k, v) {
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td><input class="tool-input table-input" value="' + esc(k || '') + '"></td>' +
      '<td><input class="tool-input table-input" value="' + esc(v || '') + '"></td>' +
      '<td><button class="tool-btn small" data-del>删</button></td>';
    tr.querySelector('[data-del]').onclick = function () {
      tr.remove();
    };
    paramBody.appendChild(tr);
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  container.querySelector('#urlParseQuery').onclick = function () {
    queryError.textContent = '';
    var raw = queryEl.value.replace(/^\?/, '').trim();
    paramBody.innerHTML = '';
    if (!raw) {
      queryError.textContent = '请填写查询串';
      return;
    }
    var pairs = raw.split('&');
    for (var i = 0; i < pairs.length; i++) {
      if (!pairs[i]) continue;
      var idx = pairs[i].indexOf('=');
      var k = idx === -1 ? pairs[i] : pairs[i].slice(0, idx);
      var v = idx === -1 ? '' : pairs[i].slice(idx + 1);
      try {
        k = decodeURIComponent(k.replace(/\+/g, ' '));
        v = decodeURIComponent(v.replace(/\+/g, ' '));
      } catch (e) {
        // 保留原始值
      }
      addParamRow(k, v);
    }
  };

  container.querySelector('#urlBuildQuery').onclick = function () {
    queryError.textContent = '';
    var parts = [];
    paramBody.querySelectorAll('tr').forEach(function (tr) {
      var inputs = tr.querySelectorAll('input');
      var k = inputs[0].value.trim();
      if (!k) return;
      parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(inputs[1].value));
    });
    queryEl.value = parts.join('&');
    if (!parts.length) queryError.textContent = '表格为空';
  };

  container.querySelector('#urlAddRow').onclick = function () {
    addParamRow('', '');
  };

  // ---------- URL 结构 ----------
  var fullEl = container.querySelector('#urlFull');
  var structBody = container.querySelector('#urlStructTable tbody');
  var structError = container.querySelector('#urlStructError');

  container.querySelector('#urlParse').onclick = function () {
    structError.textContent = '';
    structBody.innerHTML = '';
    var raw = fullEl.value.trim();
    if (!raw) {
      structError.textContent = '请填写 URL';
      return;
    }
    var u;
    try {
      u = new URL(raw);
    } catch (e) {
      structError.textContent = 'URL 无效：' + e.message + '（相对路径请补全协议，如 https://）';
      return;
    }
    var rows = [
      ['href', u.href],
      ['protocol', u.protocol],
      ['host', u.host],
      ['hostname', u.hostname],
      ['port', u.port || '(默认)'],
      ['pathname', u.pathname],
      ['search', u.search || '(无)'],
      ['hash', u.hash || '(无)'],
      ['origin', u.origin],
    ];
    if (u.username || u.password) {
      rows.splice(3, 0, ['username', u.username], ['password', u.password]);
    }
    structBody.innerHTML = rows
      .map(function (r) {
        return '<tr><td><strong>' + esc(r[0]) + '</strong></td><td><code>' + esc(r[1]) + '</code></td></tr>';
      })
      .join('');

    // 同步参数表
    if (u.search) {
      queryEl.value = u.search.replace(/^\?/, '');
      container.querySelector('#urlParseQuery').click();
    }
  };
};
