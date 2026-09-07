/* 正则表达式测试器：实时匹配高亮、捕获分组、替换预览 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createRegexTester = function (container) {
  container.innerHTML = `
    <div class="tool-wrap">
      <div class="tool-head">
        <div class="tool-title">正则表达式测试器</div>
        <div class="tool-subtitle">JavaScript 正则语法，实时匹配与高亮</div>
      </div>

      <div>
        <div class="tool-panel-title">正则表达式</div>
        <div class="tool-inline">
          <span style="color:var(--text-muted)">/</span>
          <input class="tool-input" type="text" id="rePattern" placeholder="如 (\\d{4})-(\\d{2})-(\\d{2})" style="font-family:monospace">
          <span style="color:var(--text-muted)">/</span>
          <input class="tool-input" type="text" id="reFlags" value="g" style="max-width:90px;font-family:monospace">
        </div>
        <div class="tool-inline" style="margin-top:10px">
          <label class="tool-check"><input type="checkbox" data-flag="g" checked> g 全局</label>
          <label class="tool-check"><input type="checkbox" data-flag="i"> i 忽略大小写</label>
          <label class="tool-check"><input type="checkbox" data-flag="m"> m 多行</label>
          <label class="tool-check"><input type="checkbox" data-flag="s"> s 点匹配换行</label>
          <label class="tool-check"><input type="checkbox" data-flag="u"> u Unicode</label>
        </div>
      </div>

      <div class="tool-cols">
        <div class="tool-col">
          <div class="tool-panel-title">测试文本</div>
          <textarea class="tool-textarea" id="reText" placeholder="在此输入待匹配文本…">订单号：ORD20240115001
日期：2024-01-15，金额：￥1,280.00
联系人：张三  手机：138-0013-8000
邮箱：zhangsan@example.com
URL：https://www.example.com/path?q=1#top
日期：2024-12-31，备注：测试 test regex TEST</textarea>
          <div class="tool-panel-title">常用正则</div>
          <div class="tool-btn-row" id="rePresets">
            <button class="tool-btn" data-p="\\d+" data-f="g">数字</button>
            <button class="tool-btn" data-p="[a-zA-Z]+" data-f="g">英文字母</button>
            <button class="tool-btn" data-p="[\\u4e00-\\u9fa5]+" data-f="g">中文</button>
            <button class="tool-btn" data-p="\\d{4}-\\d{2}-\\d{2}" data-f="g">日期 YYYY-MM-DD</button>
            <button class="tool-btn" data-p="1[3-9]\\d{9}" data-f="g">手机号</button>
            <button class="tool-btn" data-p="[\\w.+-]+@[\\w-]+\\.[\\w.]+" data-f="g">邮箱</button>
            <button class="tool-btn" data-p="https?://[^\\s]+" data-f="g">URL</button>
            <button class="tool-btn" data-p="^[^\\n]*$" data-f="gm">整行</button>
            <button class="tool-btn" data-p="^\\s+|\\s+$" data-f="gm">行首尾空白</button>
          </div>
        </div>

        <div class="tool-col">
          <div class="tool-panel-title">匹配结果</div>
          <div class="tool-stats">
            <div class="tool-stat"><div class="tool-stat-num" id="reCount">0</div><div class="tool-stat-label">匹配数量</div></div>
            <div class="tool-stat"><div class="tool-stat-num" id="reGroups">0</div><div class="tool-stat-label">捕获组数</div></div>
            <div class="tool-stat"><div class="tool-stat-num" id="reTime">0</div><div class="tool-stat-label">耗时 (ms)</div></div>
          </div>
          <div class="tool-error" id="reError"></div>
          <div class="tool-output" id="reHighlight" style="min-height:150px;max-height:260px;overflow:auto"></div>

          <div class="tool-panel-title">匹配明细</div>
          <div class="tool-table-wrap" style="max-height:230px;overflow:auto">
            <table class="tool-table" id="reTable">
              <thead><tr><th>#</th><th>位置</th><th>匹配内容</th><th>分组</th></tr></thead>
              <tbody></tbody>
            </table>
          </div>

          <div class="tool-panel-title">替换预览</div>
          <div class="tool-inline">
            <input class="tool-input" type="text" id="reReplace" placeholder="替换为，可用 $1 引用分组">
            <button class="tool-btn" id="reDoReplace">生成</button>
          </div>
          <div class="tool-output" id="reReplaceOut" style="min-height:80px"></div>
          <div class="tool-btn-row">
            <button class="tool-btn accent" id="reCopy">复制替换结果</button>
          </div>
        </div>
      </div>
    </div>`;

  var patternEl = container.querySelector('#rePattern');
  var flagsEl = container.querySelector('#reFlags');
  var textEl = container.querySelector('#reText');
  var errorEl = container.querySelector('#reError');
  var highlightEl = container.querySelector('#reHighlight');
  var tbody = container.querySelector('#reTable tbody');
  var replaceOut = container.querySelector('#reReplaceOut');

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function buildRe() {
    var p = patternEl.value;
    if (!p) return null;
    try {
      return new RegExp(p, flagsEl.value);
    } catch (e) {
      errorEl.textContent = '正则无效：' + e.message;
      return null;
    }
  }

  function run() {
    errorEl.textContent = '';
    highlightEl.innerHTML = '';
    tbody.innerHTML = '';
    replaceOut.textContent = '';
    container.querySelector('#reCount').textContent = '0';
    container.querySelector('#reGroups').textContent = '0';

    var re = buildRe();
    if (!re) return;

    var text = textEl.value;
    if (!text) {
      highlightEl.innerHTML = '<span style="color:var(--text-muted)">请输入测试文本</span>';
      return;
    }

    var t0 = performance.now();
    var global = re.flags.indexOf('g') !== -1;
    var matches = [];
    var m;
    var guard = 0;

    if (global) {
      re.lastIndex = 0;
      while ((m = re.exec(text)) !== null) {
        matches.push({ index: m.index, text: m[0], groups: m.slice(1) });
        if (m[0] === '') re.lastIndex++;
        if (++guard > 20000) break;
      }
    } else {
      m = re.exec(text);
      if (m) matches.push({ index: m.index, text: m[0], groups: m.slice(1) });
    }
    var cost = performance.now() - t0;

    container.querySelector('#reCount').textContent = matches.length;
    container.querySelector('#reGroups').textContent = matches.length ? matches[0].groups.length : 0;
    container.querySelector('#reTime').textContent = cost.toFixed(2);

    // 高亮
    var html = '';
    var pos = 0;
    for (var i = 0; i < matches.length; i++) {
      var mt = matches[i];
      if (mt.index < pos) continue;
      html += escapeHtml(text.slice(pos, mt.index));
      html += '<mark class="re-hit">' + escapeHtml(mt.text) + '</mark>';
      pos = mt.index + mt.text.length;
    }
    html += escapeHtml(text.slice(pos));
    highlightEl.innerHTML = html || escapeHtml(text);

    // 明细表
    tbody.innerHTML = matches
      .slice(0, 500)
      .map(function (mt, i) {
        return (
          '<tr><td>' + (i + 1) + '</td>' +
          '<td>' + mt.index + '</td>' +
          '<td><code>' + escapeHtml(mt.text || '(空)') + '</code></td>' +
          '<td>' + (mt.groups.length ? escapeHtml(mt.groups.join(' | ')) : '-') + '</td></tr>'
        );
      })
      .join('');
    if (matches.length > 500) {
      tbody.innerHTML += '<tr><td colspan="4" style="color:var(--text-muted)">仅显示前 500 条，共 ' + matches.length + ' 条</td></tr>';
    }
  }

  function doReplace() {
    var re = buildRe();
    if (!re) return;
    var rep = container.querySelector('#reReplace').value;
    try {
      replaceOut.textContent = textEl.value.replace(re, rep);
    } catch (e) {
      errorEl.textContent = '替换失败：' + e.message;
    }
  }

  // flags 复选框与输入框双向同步
  var flagBoxes = container.querySelectorAll('[data-flag]');
  flagBoxes.forEach(function (box) {
    box.addEventListener('change', function () {
      var flags = '';
      flagBoxes.forEach(function (b) {
        if (b.checked) flags += b.dataset.flag;
      });
      flagsEl.value = flags;
      run();
    });
  });
  flagsEl.addEventListener('input', function () {
    var f = flagsEl.value;
    flagBoxes.forEach(function (b) {
      b.checked = f.indexOf(b.dataset.flag) !== -1;
    });
    run();
  });

  [patternEl, textEl].forEach(function (el) {
    el.addEventListener('input', run);
  });

  container.querySelectorAll('#rePresets .tool-btn').forEach(function (btn) {
    btn.onclick = function () {
      patternEl.value = btn.dataset.p;
      flagsEl.value = btn.dataset.f;
      flagBoxes.forEach(function (b) {
        b.checked = btn.dataset.f.indexOf(b.dataset.flag) !== -1;
      });
      run();
    };
  });

  container.querySelector('#reDoReplace').onclick = doReplace;
  container.querySelector('#reCopy').onclick = function () {
    if (!replaceOut.textContent) {
      DaibaoTools.toast('请先生成替换预览');
      return;
    }
    DaibaoTools.copyText(replaceOut.textContent);
    DaibaoTools.toast('已复制替换结果');
  };

  run();
};
