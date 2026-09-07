/* 文本批量处理：行操作 + 查找替换（支持正则）+ 撤销 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createTextProcess = function (container) {
  container.innerHTML = `
    <div class="tool-wrap">
      <div class="tool-head">
        <div class="tool-title">文本批量处理</div>
        <div class="tool-subtitle">行级批量操作 + 正则查找替换，支持多步撤销</div>
      </div>

      <div>
        <div class="tool-panel-title">文本</div>
        <textarea class="tool-textarea" id="tpText" style="min-height:230px" placeholder="在此粘贴或输入文本…"></textarea>
        <div class="tool-stats" style="margin-top:12px">
          <div class="tool-stat"><div class="tool-stat-num" id="tpLines">0</div><div class="tool-stat-label">行数</div></div>
          <div class="tool-stat"><div class="tool-stat-num" id="tpChars">0</div><div class="tool-stat-label">字符数</div></div>
          <div class="tool-stat"><div class="tool-stat-num" id="tpNoBlank">0</div><div class="tool-stat-label">非空行</div></div>
          <div class="tool-stat"><div class="tool-stat-num" id="tpSteps">0</div><div class="tool-stat-label">已执行步骤</div></div>
        </div>
      </div>

      <div class="tool-cols">
        <div class="tool-col">
          <div class="tool-panel-title">行操作</div>
          <div class="tool-btn-row">
            <button class="tool-btn" data-act="trimBlank">去空行</button>
            <button class="tool-btn" data-act="trimSpace">去首尾空白</button>
            <button class="tool-btn" data-act="dedupe">去重行</button>
            <button class="tool-btn" data-act="sortAsc">排序 ↑</button>
            <button class="tool-btn" data-act="sortDesc">排序 ↓</button>
            <button class="tool-btn" data-act="sortLen">按长度排序</button>
            <button class="tool-btn" data-act="reverse">反转行序</button>
            <button class="tool-btn" data-act="shuffle">打乱行序</button>
            <button class="tool-btn" data-act="squeeze">合并连续空格</button>
            <button class="tool-btn" data-act="tab2space">Tab→空格</button>
            <button class="tool-btn" data-act="removeEmptyChars">去全角空格</button>
          </div>

          <div class="tool-panel-title">查找替换</div>
          <div class="tool-field">
            <label class="tool-label" for="tpFind">查找内容</label>
            <input class="tool-input" type="text" id="tpFind" placeholder="支持正则表达式">
          </div>
          <div class="tool-field">
            <label class="tool-label" for="tpReplace">替换为</label>
            <input class="tool-input" type="text" id="tpReplace" placeholder="留空表示删除；可用 $1 引用分组">
          </div>
          <div class="tool-inline">
            <label class="tool-check"><input type="checkbox" id="tpRegex"> 正则</label>
            <label class="tool-check"><input type="checkbox" id="tpCase"> 忽略大小写</label>
            <label class="tool-check"><input type="checkbox" id="tpGlobal" checked> 全部替换</label>
            <label class="tool-check"><input type="checkbox" id="tpLiteral"> 替换串按纯文本</label>
          </div>
          <div class="tool-btn-row">
            <button class="tool-btn primary" id="tpDoReplace">执行替换</button>
            <button class="tool-btn" id="tpCount">统计出现次数</button>
          </div>

          <div class="tool-panel-title">行过滤 / 增删</div>
          <div class="tool-inline">
            <input class="tool-input" type="text" id="tpKeyword" placeholder="关键字">
            <select class="tool-select" id="tpKeywordMode" style="max-width:150px">
              <option value="keep">仅保留包含</option>
              <option value="drop">删除包含</option>
            </select>
            <button class="tool-btn" id="tpFilter">应用</button>
          </div>
          <div class="tool-inline">
            <input class="tool-input" type="text" id="tpAffix" placeholder="前缀 / 后缀内容">
            <button class="tool-btn" data-affix="prefix">加前缀</button>
            <button class="tool-btn" data-affix="suffix">加后缀</button>
          </div>
        </div>

        <div class="tool-col">
          <div class="tool-panel-title">操作与说明</div>
          <div class="tool-btn-row">
            <button class="tool-btn accent" id="tpUndo">撤销上一步</button>
            <button class="tool-btn" id="tpReset">回到初始</button>
            <button class="tool-btn" id="tpCopy">复制文本</button>
            <button class="tool-btn" id="tpClear">清空</button>
          </div>
          <div class="tool-error" id="tpError"></div>
          <div class="tool-output plain" id="tpLog" style="min-height:120px;max-height:220px;overflow:auto">操作记录会显示在这里</div>
          <p class="tool-hint">
            · 所有操作按「行」为单位处理，<strong>去重行</strong>与<strong>排序</strong>会改变行顺序，请留意。<br>
            · 正则模式使用 JavaScript 正则语法，替换串中 <code>$1</code> 引用第 1 个捕获组，<code>$&</code> 表示整个匹配。<br>
            · 勾选「替换串按纯文本」后，替换串里的 <code>$</code> 会被当作普通字符处理。<br>
            · 撤销栈最多保留 60 步，回到初始可一次性还原到本次编辑前的文本。
          </p>
        </div>
      </div>
    </div>`;

  var textEl = container.querySelector('#tpText');
  var errorEl = container.querySelector('#tpError');
  var logEl = container.querySelector('#tpLog');

  var history = []; // 撤销栈
  var initial = '';
  var steps = 0;

  function log(msg) {
    var time = new Date();
    var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
    var ts = pad(time.getHours()) + ':' + pad(time.getMinutes()) + ':' + pad(time.getSeconds());
    var line = '[' + ts + '] ' + msg;
    logEl.textContent = logEl.textContent === '操作记录会显示在这里'
      ? line
      : line + '\n' + logEl.textContent;
  }

  function pushHistory(label) {
    history.push({ text: textEl.value, label: label });
    if (history.length > 60) history.shift();
    steps++;
  }

  function stats() {
    var v = textEl.value;
    var lines = v === '' ? 0 : v.split('\n').length;
    var noBlank = v === '' ? 0 : v.split('\n').filter(function (l) { return l.trim() !== ''; }).length;
    container.querySelector('#tpLines').textContent = lines;
    container.querySelector('#tpChars').textContent = v.length;
    container.querySelector('#tpNoBlank').textContent = noBlank;
    container.querySelector('#tpSteps').textContent = steps;
  }

  function apply(label, fn) {
    errorEl.textContent = '';
    var before = textEl.value;
    var after;
    try {
      after = fn(before);
    } catch (e) {
      errorEl.textContent = '操作失败：' + e.message;
      return;
    }
    if (after === before) {
      log(label + '（无变化）');
      return;
    }
    pushHistory(label);
    textEl.value = after;
    stats();
    log(label + '（' + before.split('\n').length + ' → ' + after.split('\n').length + ' 行）');
  }

  function lineOp(label, fn) {
    apply(label, function (t) {
      return t.split('\n').map(fn).join('\n');
    });
  }

  var ACTIONS = {
    trimBlank: function (t) {
      return t.split('\n').filter(function (l) { return l.trim() !== ''; }).join('\n');
    },
    trimSpace: function (t) {
      return t.split('\n').map(function (l) { return l.replace(/^[ \t\u3000]+|[ \t\u3000]+$/g, ''); }).join('\n');
    },
    dedupe: function (t) {
      var seen = {};
      return t.split('\n').filter(function (l) {
        if (seen[l]) return false;
        seen[l] = true;
        return true;
      }).join('\n');
    },
    sortAsc: function (t) {
      return t.split('\n').sort(function (a, b) { return a.localeCompare(b, 'zh-CN'); }).join('\n');
    },
    sortDesc: function (t) {
      return t.split('\n').sort(function (a, b) { return b.localeCompare(a, 'zh-CN'); }).join('\n');
    },
    sortLen: function (t) {
      return t.split('\n').sort(function (a, b) { return a.length - b.length; }).join('\n');
    },
    reverse: function (t) {
      return t.split('\n').reverse().join('\n');
    },
    shuffle: function (t) {
      var arr = t.split('\n');
      var buf = new Uint32Array(arr.length);
      crypto.getRandomValues(buf);
      for (var i = arr.length - 1; i > 0; i--) {
        var j = buf[i] % (i + 1);
        var tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
      }
      return arr.join('\n');
    },
    squeeze: function (t) {
      return t.split('\n').map(function (l) { return l.replace(/[ \t]{2,}/g, ' '); }).join('\n');
    },
    tab2space: function (t) {
      return t.replace(/\t/g, '  ');
    },
    removeEmptyChars: function (t) {
      return t.replace(/\u3000/g, '');
    },
  };

  var ACTION_LABELS = {
    trimBlank: '去空行',
    trimSpace: '去首尾空白',
    dedupe: '去重行',
    sortAsc: '升序排序',
    sortDesc: '降序排序',
    sortLen: '按长度排序',
    reverse: '反转行序',
    shuffle: '打乱行序',
    squeeze: '合并连续空格',
    tab2space: 'Tab 转空格',
    removeEmptyChars: '去全角空格',
  };

  container.querySelectorAll('[data-act]').forEach(function (btn) {
    btn.onclick = function () {
      var key = btn.dataset.act;
      apply(ACTION_LABELS[key], ACTIONS[key]);
    };
  });

  container.querySelectorAll('[data-affix]').forEach(function (btn) {
    btn.onclick = function () {
      var v = container.querySelector('#tpAffix').value;
      if (!v) {
        errorEl.textContent = '请填写前缀或后缀内容';
        return;
      }
      var mode = btn.dataset.affix;
      apply(mode === 'prefix' ? '加前缀' : '加后缀', function (t) {
        return t.split('\n').map(function (l) {
          return mode === 'prefix' ? v + l : l + v;
        }).join('\n');
      });
    };
  });

  function buildRegExp() {
    var find = container.querySelector('#tpFind').value;
    if (!find) {
      errorEl.textContent = '请填写查找内容';
      return null;
    }
    var useRegex = container.querySelector('#tpRegex').checked;
    var flags = '';
    if (container.querySelector('#tpGlobal').checked) flags += 'g';
    if (container.querySelector('#tpCase').checked) flags += 'i';
    try {
      return new RegExp(useRegex ? find : find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    } catch (e) {
      errorEl.textContent = '正则表达式无效：' + e.message;
      return null;
    }
  }

  container.querySelector('#tpDoReplace').onclick = function () {
    errorEl.textContent = '';
    var re = buildRegExp();
    if (!re) return;
    var rep = container.querySelector('#tpReplace').value;
    if (container.querySelector('#tpLiteral').checked) {
      rep = rep.replace(/\$/g, '$$$$');
    }
    var count = 0;
    apply('查找替换', function (t) {
      return t.replace(re, function () {
        count++;
        var args = arguments;
        return rep.replace(/\$(\$|&|`|')|(\d{1,2})/g, function (m, special, num) {
          if (special === '$') return '$';
          if (special === '&') return args[0];
          if (special === '`') return args[args.length - 2].slice(0, args[args.length - 1]);
          if (special === "'") return args[args.length - 2].slice(args[args.length - 1] + args[0].length);
          var n = parseInt(num, 10);
          return args[n] === undefined ? m : args[n];
        });
      });
    });
    if (count > 0) log('共替换 ' + count + ' 处');
  };

  container.querySelector('#tpCount').onclick = function () {
    errorEl.textContent = '';
    var re = buildRegExp();
    if (!re) return;
    var m = textEl.value.match(re);
    var n = m ? m.length : 0;
    log('出现次数：' + n + ' 处');
    DaibaoTools.toast('匹配到 ' + n + ' 处');
  };

  container.querySelector('#tpFilter').onclick = function () {
    errorEl.textContent = '';
    var kw = container.querySelector('#tpKeyword').value;
    if (!kw) {
      errorEl.textContent = '请填写关键字';
      return;
    }
    var mode = container.querySelector('#tpKeywordMode').value;
    apply(mode === 'keep' ? '仅保留包含「' + kw + '」的行' : '删除包含「' + kw + '」的行', function (t) {
      return t.split('\n').filter(function (l) {
        var hit = l.indexOf(kw) !== -1;
        return mode === 'keep' ? hit : !hit;
      }).join('\n');
    });
  };

  container.querySelector('#tpUndo').onclick = function () {
    errorEl.textContent = '';
    if (!history.length) {
      DaibaoTools.toast('没有可撤销的操作');
      return;
    }
    var last = history.pop();
    textEl.value = last.text;
    steps = Math.max(0, steps - 1);
    stats();
    log('撤销：' + last.label);
  };

  container.querySelector('#tpReset').onclick = function () {
    if (!history.length) {
      DaibaoTools.toast('尚未执行任何操作');
      return;
    }
    textEl.value = initial;
    history = [];
    steps = 0;
    stats();
    log('已回到初始文本');
  };

  container.querySelector('#tpCopy').onclick = function () {
    if (!textEl.value) {
      DaibaoTools.toast('没有可复制的内容');
      return;
    }
    DaibaoTools.copyText(textEl.value);
    DaibaoTools.toast('已复制文本');
  };

  container.querySelector('#tpClear').onclick = function () {
    pushHistory('清空');
    textEl.value = '';
    stats();
    log('清空文本');
  };

  textEl.addEventListener('input', function () {
    if (!initial && textEl.value) initial = textEl.value;
    stats();
  });

  initial = textEl.value;
  stats();
};
