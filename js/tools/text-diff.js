/* 文本对比 Diff：逐行 LCS 算法，并排高亮差异 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createTextDiff = function (container) {
  container.innerHTML = `
    <div class="tool-wrap">
      <div class="tool-head">
        <div class="tool-title">文本对比</div>
        <div class="tool-subtitle">逐行 LCS 差异比对，并排高亮新增 / 删除 / 修改</div>
      </div>

      <div class="tool-cols">
        <div class="tool-col">
          <div class="tool-panel-title">原始文本</div>
          <textarea class="tool-textarea" id="diffLeft" placeholder="粘贴原始内容…"></textarea>
        </div>
        <div class="tool-col">
          <div class="tool-panel-title">对比文本</div>
          <textarea class="tool-textarea" id="diffRight" placeholder="粘贴修改后的内容…"></textarea>
        </div>
      </div>

      <div>
        <div class="tool-inline">
          <button class="tool-btn primary" id="diffRun">开始对比</button>
          <button class="tool-btn" id="diffSwap">交换左右</button>
          <button class="tool-btn" id="diffClear">清空</button>
          <label class="tool-check"><input type="checkbox" id="diffTrim"> 忽略行首尾空白</label>
          <label class="tool-check"><input type="checkbox" id="diffCase"> 忽略大小写</label>
          <label class="tool-check"><input type="checkbox" id="diffBlank"> 忽略空行</label>
          <label class="tool-check"><input type="checkbox" id="diffOnlyDiff"> 仅显示差异行</label>
        </div>
        <div class="tool-error" id="diffError"></div>
      </div>

      <div id="diffResult" style="display:none">
        <div class="tool-stats">
          <div class="tool-stat"><div class="tool-stat-num" id="diffAdd" style="color:#0f6e56">0</div><div class="tool-stat-label">新增行</div></div>
          <div class="tool-stat"><div class="tool-stat-num" id="diffDel" style="color:#dc2626">0</div><div class="tool-stat-label">删除行</div></div>
          <div class="tool-stat"><div class="tool-stat-num" id="diffMod" style="color:#d97706">0</div><div class="tool-stat-label">修改行</div></div>
          <div class="tool-stat"><div class="tool-stat-num" id="diffSame">0</div><div class="tool-stat-label">相同行</div></div>
          <div class="tool-stat"><div class="tool-stat-num" id="diffRatio">0%</div><div class="tool-stat-label">相似度</div></div>
        </div>

        <div class="tool-btn-row" style="margin-top:14px">
          <button class="tool-btn accent" id="diffCopy">复制差异报告</button>
        </div>

        <div class="tool-panel-title" style="margin-top:16px">差异明细</div>
        <div class="tool-table-wrap" style="max-height:460px;overflow:auto">
          <table class="tool-table diff-table" id="diffTable">
            <thead>
              <tr>
                <th style="width:52px">原行号</th>
                <th>原始内容</th>
                <th style="width:52px">新行号</th>
                <th>对比内容</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
        <p class="tool-hint" style="margin-top:10px">
          <span class="diff-tag add">新增</span>
          <span class="diff-tag del">删除</span>
          <span class="diff-tag mod">修改</span>
          相邻的一组「删除 + 新增」会被合并识别为一次修改。单侧文本超过 2000 行时仅比对前 2000 行。
        </p>
      </div>
    </div>`;

  var leftEl = container.querySelector('#diffLeft');
  var rightEl = container.querySelector('#diffRight');
  var errorEl = container.querySelector('#diffError');
  var resultBox = container.querySelector('#diffResult');
  var tbody = container.querySelector('#diffTable tbody');

  var MAX_LINES = 2000;
  var lastOps = [];
  // 归一化下标 → 原始行下标的映射，以及原始行数组（供复制报告时还原真实文本与行号）
  var lastLeftMap = [];
  var lastRightMap = [];
  var lastLeftRaw = [];
  var lastRightRaw = [];

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function normalize(lines) {
    var trim = container.querySelector('#diffTrim').checked;
    var ignoreCase = container.querySelector('#diffCase').checked;
    var ignoreBlank = container.querySelector('#diffBlank').checked;

    var out = [];
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i];
      if (ignoreBlank && l.trim() === '') continue;
      if (trim) l = l.replace(/^\s+|\s+$/g, '');
      if (ignoreCase) l = l.toLowerCase();
      out.push(l);
    }
    return out;
  }

  // 行级 LCS：返回 ops 数组 [{t:'eq'|'del'|'ins', ai, bi}]
  function diffLines(a, b) {
    var n = a.length;
    var m = b.length;
    var W = m + 1;
    var dp = new Int32Array((n + 1) * W);

    for (var i = n - 1; i >= 0; i--) {
      for (var j = m - 1; j >= 0; j--) {
        dp[i * W + j] =
          a[i] === b[j]
            ? dp[(i + 1) * W + j + 1] + 1
            : Math.max(dp[(i + 1) * W + j], dp[i * W + j + 1]);
      }
    }

    var ops = [];
    var x = 0;
    var y = 0;
    while (x < n && y < m) {
      if (a[x] === b[y]) {
        ops.push({ t: 'eq', ai: x, bi: y });
        x++;
        y++;
      } else if (dp[(x + 1) * W + y] >= dp[x * W + y + 1]) {
        ops.push({ t: 'del', ai: x });
        x++;
      } else {
        ops.push({ t: 'ins', bi: y });
        y++;
      }
    }
    while (x < n) ops.push({ t: 'del', ai: x++ });
    while (y < m) ops.push({ t: 'ins', bi: y++ });

    return mergeModify(ops);
  }

  // 相邻 del 与 ins 配对为 mod
  function mergeModify(ops) {
    var out = [];
    var i = 0;
    while (i < ops.length) {
      if (ops[i].t === 'eq') {
        out.push(ops[i]);
        i++;
        continue;
      }
      var dels = [];
      var ins = [];
      while (i < ops.length && ops[i].t === 'del') dels.push(ops[i++]);
      while (i < ops.length && ops[i].t === 'ins') ins.push(ops[i++]);
      var k = 0;
      while (k < dels.length && k < ins.length) {
        out.push({ t: 'mod', ai: dels[k].ai, bi: ins[k].bi });
        k++;
      }
      while (k < dels.length) out.push(dels[k++]);
      while (k < ins.length) out.push(ins[k++]);
    }
    return out;
  }

  function run() {
    errorEl.textContent = '';
    var rawLeft = leftEl.value.split('\n');
    var rawRight = rightEl.value.split('\n');
    if (rawLeft.length > MAX_LINES || rawRight.length > MAX_LINES) {
      DaibaoTools.toast('文本过大，仅比对前 ' + MAX_LINES + ' 行');
      rawLeft = rawLeft.slice(0, MAX_LINES);
      rawRight = rawRight.slice(0, MAX_LINES);
    }

    var normLeft = normalize(rawLeft);
    var normRight = normalize(rawRight);

    // 归一化后下标与原始下标建立映射
    var leftMap = [];
    for (var i = 0; i < rawLeft.length; i++) {
      var l = rawLeft[i];
      if (container.querySelector('#diffBlank').checked && l.trim() === '') continue;
      leftMap.push(i);
    }
    var rightMap = [];
    for (var j = 0; j < rawRight.length; j++) {
      var r = rawRight[j];
      if (container.querySelector('#diffBlank').checked && r.trim() === '') continue;
      rightMap.push(j);
    }

    lastLeftMap = leftMap;
    lastRightMap = rightMap;
    lastLeftRaw = rawLeft;
    lastRightRaw = rawRight;

    var ops = diffLines(normLeft, normRight);
    lastOps = ops;

    var add = 0, del = 0, mod = 0, same = 0;
    var html = [];

    for (var k = 0; k < ops.length; k++) {
      var op = ops[k];
      var la = op.ai !== undefined ? leftMap[op.ai] : undefined;
      var lb = op.bi !== undefined ? rightMap[op.bi] : undefined;
      var laText = op.ai !== undefined ? rawLeft[leftMap[op.ai]] : '';
      var lbText = op.bi !== undefined ? rawRight[rightMap[op.bi]] : '';
      var cls = '';

      if (op.t === 'eq') {
        same++;
        cls = 'eq';
      } else if (op.t === 'del') {
        del++;
        cls = 'del';
      } else if (op.t === 'ins') {
        add++;
        cls = 'add';
      } else {
        mod++;
        cls = 'mod';
      }

      html.push(
        '<tr class="diff-row ' + cls + '" data-kind="' + op.t + '">' +
        '<td class="diff-num">' + (la !== undefined ? la + 1 : '') + '</td>' +
        '<td class="diff-cell"><code>' + (op.t === 'ins' ? '' : esc(laText || '&nbsp;')) + '</code></td>' +
        '<td class="diff-num">' + (lb !== undefined ? lb + 1 : '') + '</td>' +
        '<td class="diff-cell"><code>' + (op.t === 'del' ? '' : esc(lbText || '&nbsp;')) + '</code></td>' +
        '</tr>'
      );
    }

    tbody.innerHTML = html.join('');
    container.querySelector('#diffAdd').textContent = add;
    container.querySelector('#diffDel').textContent = del;
    container.querySelector('#diffMod').textContent = mod;
    container.querySelector('#diffSame').textContent = same;

    var total = normLeft.length + normRight.length;
    var ratio = total === 0 ? 100 : (same * 2 / total) * 100;
    container.querySelector('#diffRatio').textContent = ratio.toFixed(1) + '%';

    resultBox.style.display = '';
    applyOnlyDiff();
  }

  function applyOnlyDiff() {
    var only = container.querySelector('#diffOnlyDiff').checked;
    tbody.querySelectorAll('.diff-row').forEach(function (tr) {
      tr.style.display = only && tr.dataset.kind === 'eq' ? 'none' : '';
    });
  }

  container.querySelector('#diffRun').onclick = run;
  container.querySelector('#diffOnlyDiff').addEventListener('change', applyOnlyDiff);

  container.querySelector('#diffSwap').onclick = function () {
    var t = leftEl.value;
    leftEl.value = rightEl.value;
    rightEl.value = t;
    if (resultBox.style.display !== 'none') run();
  };

  container.querySelector('#diffClear').onclick = function () {
    leftEl.value = '';
    rightEl.value = '';
    resultBox.style.display = 'none';
    errorEl.textContent = '';
  };

  container.querySelector('#diffCopy').onclick = function () {
    if (!lastOps.length) {
      DaibaoTools.toast('请先执行对比');
      return;
    }
    var lines = [];
    lastOps.forEach(function (op) {
      if (op.t === 'eq') return;
      var lt = op.ai !== undefined ? lastLeftRaw[lastLeftMap[op.ai]] : '';
      var rt = op.bi !== undefined ? lastRightRaw[lastRightMap[op.bi]] : '';
      if (op.t === 'del') lines.push('- ' + lt);
      else if (op.t === 'ins') lines.push('+ ' + rt);
      else lines.push('- ' + lt + '\n+ ' + rt);
    });
    if (!lines.length) {
      DaibaoTools.toast('两份文本完全一致');
      return;
    }
    DaibaoTools.copyText(lines.join('\n'));
    DaibaoTools.toast('已复制差异报告');
  };
};
