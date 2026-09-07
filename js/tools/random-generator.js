/* 随机数生成 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createRandomGenerator = function (container) {
  container.innerHTML = `
    <div class="tool-wrap">
      <div class="tool-head">
        <div class="tool-title">随机数生成</div>
        <div class="tool-subtitle">按范围与规则批量生成随机数</div>
      </div>
      <div class="tool-cols">
        <div class="tool-col">
          <div class="tool-panel-title">生成设置</div>
          <div class="tool-field">
            <span class="tool-label">生成数量</span>
            <input class="tool-input" type="number" id="rgCount" value="5" min="1" step="1">
          </div>
          <div class="tool-inline">
            <div class="tool-field" style="flex:1">
              <span class="tool-label">最小值</span>
              <input class="tool-input" type="number" id="rgMin" value="1" step="any">
            </div>
            <div class="tool-field" style="flex:1">
              <span class="tool-label">最大值</span>
              <input class="tool-input" type="number" id="rgMax" value="100" step="any">
            </div>
          </div>
          <div class="tool-inline">
            <div class="tool-field" style="flex:1">
              <span class="tool-label">类型</span>
              <select class="tool-select" id="rgType">
                <option value="int">整数</option>
                <option value="float">小数</option>
              </select>
            </div>
            <div class="tool-field" style="flex:1">
              <span class="tool-label">小数位数</span>
              <input class="tool-input" type="number" id="rgDigits" value="2" min="0" max="10" step="1">
            </div>
          </div>
          <label class="tool-inline" style="font-size:14px;color:var(--text-main)">
            <input type="checkbox" id="rgUnique"> 结果不重复
          </label>
          <div class="tool-btn-row">
            <button class="tool-btn primary" id="rgGenerate">生成</button>
            <button class="tool-btn" id="rgClear">清空</button>
          </div>
          <div class="tool-error" id="rgError"></div>
        </div>

        <div class="tool-col">
          <div class="tool-panel-title">结果</div>
          <div class="tool-output" id="rgOutput">-</div>
          <div class="tool-btn-row">
            <button class="tool-btn accent" id="rgCopy">复制结果</button>
          </div>
          <p class="tool-hint">使用 crypto.getRandomValues 生成，随机性优于 Math.random。勾选「结果不重复」时，数量不能超过可选范围大小。</p>
        </div>
      </div>
    </div>`;

  var count = container.querySelector('#rgCount');
  var minEl = container.querySelector('#rgMin');
  var maxEl = container.querySelector('#rgMax');
  var type = container.querySelector('#rgType');
  var digits = container.querySelector('#rgDigits');
  var unique = container.querySelector('#rgUnique');
  var output = container.querySelector('#rgOutput');
  var errorEl = container.querySelector('#rgError');

  function randomInt(maxExclusive) {
    var array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % maxExclusive;
  }

  container.querySelector('#rgGenerate').onclick = function () {
    errorEl.textContent = '';
    var n = parseInt(count.value, 10);
    var lo = parseFloat(minEl.value);
    var hi = parseFloat(maxEl.value);
    var dp = parseInt(digits.value, 10);

    if (!isFinite(n) || n < 1) {
      errorEl.textContent = '生成数量必须是大于 0 的整数';
      return;
    }
    if (!isFinite(lo) || !isFinite(hi)) {
      errorEl.textContent = '请输入有效的最小值与最大值';
      return;
    }
    if (lo > hi) {
      errorEl.textContent = '最小值不能大于最大值';
      return;
    }
    if (n > 10000) {
      errorEl.textContent = '单次最多生成 10000 个';
      return;
    }

    var isInt = type.value === 'int';
    if (isInt) {
      lo = Math.ceil(lo);
      hi = Math.floor(hi);
    }

    var results = [];
    var used = {};
    var poolSize = isInt ? hi - lo + 1 : Infinity;

    if (unique.checked && isInt && n > poolSize) {
      errorEl.textContent = '范围内只有 ' + poolSize + ' 个整数，无法生成 ' + n + ' 个不重复结果';
      return;
    }

    var guard = 0;
    while (results.length < n && guard < n * 200) {
      guard++;
      var val;
      if (isInt) {
        val = lo + randomInt(hi - lo + 1);
      } else {
        var r = randomInt(100000000) / 100000000;
        val = lo + r * (hi - lo);
        val = parseFloat(val.toFixed(dp));
      }
      if (unique.checked) {
        if (used[val]) continue;
        used[val] = true;
      }
      results.push(val);
    }

    if (results.length < n) {
      errorEl.textContent = '不重复条件下可生成的数量不足，已生成 ' + results.length + ' 个';
    }
    output.textContent = results.join('\n');
  };

  container.querySelector('#rgClear').onclick = function () {
    output.textContent = '-';
    errorEl.textContent = '';
  };

  container.querySelector('#rgCopy').onclick = function () {
    if (!output.textContent || output.textContent === '-') {
      DaibaoTools.toast('没有可复制的内容');
      return;
    }
    DaibaoTools.copyText(output.textContent);
    DaibaoTools.toast('已复制到剪贴板');
  };
};
