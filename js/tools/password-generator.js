/* 密码生成器（crypto.getRandomValues，拒绝采样避免取模偏差） */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createPasswordGenerator = function (container) {
  container.innerHTML = `
    <div class="tool-wrap">
      <div class="tool-head">
        <div class="tool-title">密码生成器</div>
        <div class="tool-subtitle">使用密码学安全随机数（CSPRNG），全程本地生成，不上传</div>
      </div>
      <div class="tool-cols">
        <div class="tool-col">
          <div class="tool-panel-title">参数</div>

          <div class="tool-field">
            <label class="tool-label" for="pwLength">密码长度：<strong id="pwLengthText">16</strong></label>
            <input class="tool-range" type="range" id="pwLength" min="4" max="64" value="16">
          </div>

          <div class="tool-field">
            <label class="tool-check"><input type="checkbox" id="pwLower" checked> 小写字母 a-z</label>
            <label class="tool-check"><input type="checkbox" id="pwUpper" checked> 大写字母 A-Z</label>
            <label class="tool-check"><input type="checkbox" id="pwDigit" checked> 数字 0-9</label>
            <label class="tool-check"><input type="checkbox" id="pwSymbol" checked> 符号 !@#$%^&* 等</label>
          </div>

          <div class="tool-field">
            <label class="tool-check"><input type="checkbox" id="pwNoSimilar"> 排除易混淆字符（0 O o 1 l I |）</label>
            <label class="tool-check"><input type="checkbox" id="pwEachSet" checked> 每种选中字符类至少包含一个</label>
            <label class="tool-check"><input type="checkbox" id="pwNoRepeat"> 字符不重复</label>
          </div>

          <div class="tool-inline">
            <label class="tool-label" for="pwCount">生成数量</label>
            <input class="tool-input" type="text" id="pwCount" inputmode="numeric" value="5" style="max-width:90px">
          </div>

          <div class="tool-btn-row">
            <button class="tool-btn primary" id="pwGen">生成</button>
            <button class="tool-btn" id="pwCopy">复制全部</button>
            <button class="tool-btn" id="pwClear">清空</button>
          </div>
          <div class="tool-error" id="pwError"></div>
          <p class="tool-hint">
            随机源为浏览器 <code>crypto.getRandomValues()</code>，并采用拒绝采样消除取模偏差，比 <code>Math.random()</code> 更安全可靠。
          </p>
        </div>

        <div class="tool-col">
          <div class="tool-panel-title">生成结果</div>
          <textarea class="tool-textarea" id="pwOutput" readonly placeholder="点击「生成」后显示，每行一个"></textarea>
          <div class="tool-stats">
            <div class="tool-stat">
              <div class="tool-stat-num" id="pwEntropy">0</div>
              <div class="tool-stat-label">单个密码熵（bit）</div>
            </div>
            <div class="tool-stat">
              <div class="tool-stat-num" id="pwStrength">-</div>
              <div class="tool-stat-label">强度</div>
            </div>
          </div>
          <p class="tool-hint">
            熵 = 长度 × log₂(字符集大小)。一般建议：<br>
            ≥ 60 bit 可抵御一般离线爆破；≥ 80 bit 属于强密码；≥ 128 bit 接近不可破解。
          </p>
        </div>
      </div>
    </div>`;

  var SETS = {
    lower: 'abcdefghijklmnopqrstuvwxyz',
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    digit: '0123456789',
    symbol: '!@#$%^&*()-_=+[]{};:,.?/',
  };
  var SIMILAR = /[0Oo1lI|]/g;

  var lengthEl = container.querySelector('#pwLength');
  var lengthText = container.querySelector('#pwLengthText');
  var output = container.querySelector('#pwOutput');
  var errorEl = container.querySelector('#pwError');

  function randInt(max) {
    // 拒绝采样：消除取模偏差
    if (max <= 0) return 0;
    var limit = Math.floor(0xffffffff / max) * max;
    var buf = new Uint32Array(1);
    var v;
    do {
      crypto.getRandomValues(buf);
      v = buf[0];
    } while (v >= limit);
    return v % max;
  }

  function pick(chars) {
    return chars.charAt(randInt(chars.length));
  }

  function activeSets() {
    var list = [];
    if (container.querySelector('#pwLower').checked) list.push(SETS.lower);
    if (container.querySelector('#pwUpper').checked) list.push(SETS.upper);
    if (container.querySelector('#pwDigit').checked) list.push(SETS.digit);
    if (container.querySelector('#pwSymbol').checked) list.push(SETS.symbol);
    if (container.querySelector('#pwNoSimilar').checked) {
      list = list.map(function (s) {
        var cleaned = s.replace(SIMILAR, '');
        return cleaned.length ? cleaned : s;
      });
    }
    return list;
  }

  function allChars(sets) {
    return sets.join('');
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = randInt(i + 1);
      var t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
    }
    return arr;
  }

  function generateOne(len, sets, eachSet, noRepeat) {
    var pool = allChars(sets);
    var chars = [];

    if (eachSet) {
      for (var i = 0; i < sets.length; i++) chars.push(pick(sets[i]));
    }
    if (noRepeat && len > pool.length) return null;

    var used = {};
    for (var k = 0; k < chars.length; k++) used[chars[k]] = true;

    var guard = 0;
    while (chars.length < len) {
      var c = pick(pool);
      if (noRepeat) {
        if (used[c]) {
          if (++guard > 10000) return null;
          continue;
        }
        used[c] = true;
      }
      chars.push(c);
    }
    return shuffle(chars).join('');
  }

  function strengthOf(bits) {
    if (bits < 40) return ['弱', 'bad'];
    if (bits < 60) return ['中等', 'warn'];
    if (bits < 90) return ['强', 'ok'];
    return ['极强', 'ok'];
  }

  function generate() {
    errorEl.textContent = '';
    var len = parseInt(lengthEl.value, 10);
    var sets = activeSets();
    if (!sets.length) {
      errorEl.textContent = '请至少选择一种字符类型';
      return;
    }
    if (container.querySelector('#pwNoRepeat').checked && len > allChars(sets).length) {
      errorEl.textContent = '勾选「字符不重复」时，长度不能超过字符集大小（' + allChars(sets).length + '）';
      return;
    }
    if (container.querySelector('#pwEachSet').checked && len < sets.length) {
      errorEl.textContent = '勾选「每种至少一个」时，长度不能小于已选类型数（' + sets.length + '）';
      return;
    }

    var count = parseInt(container.querySelector('#pwCount').value, 10);
    if (isNaN(count) || count < 1) count = 1;
    if (count > 200) count = 200;

    var eachSet = container.querySelector('#pwEachSet').checked;
    var noRepeat = container.querySelector('#pwNoRepeat').checked;

    var lines = [];
    for (var i = 0; i < count; i++) {
      var pw = generateOne(len, sets, eachSet, noRepeat);
      if (pw === null) {
        errorEl.textContent = '生成失败：约束条件冲突，请放宽「字符不重复」或增大字符集';
        return;
      }
      lines.push(pw);
    }
    output.value = lines.join('\n');

    var bits = len * (Math.log(allChars(sets).length) / Math.LN2);
    container.querySelector('#pwEntropy').textContent = bits.toFixed(1);
    var s = strengthOf(bits);
    var stEl = container.querySelector('#pwStrength');
    stEl.textContent = s[0];
    stEl.className = 'tool-stat-num ' + (s[1] === 'ok' ? '' : '');
    stEl.style.color = s[1] === 'bad' ? '#dc2626' : s[1] === 'warn' ? '#d97706' : '#0f6e56';
  }

  lengthEl.addEventListener('input', function () {
    lengthText.textContent = lengthEl.value;
  });

  container.querySelector('#pwGen').onclick = generate;
  container.querySelector('#pwCopy').onclick = function () {
    if (!output.value) {
      DaibaoTools.toast('没有可复制的内容');
      return;
    }
    DaibaoTools.copyText(output.value);
    DaibaoTools.toast('已复制 ' + output.value.split('\n').length + ' 条密码');
  };
  container.querySelector('#pwClear').onclick = function () {
    output.value = '';
    errorEl.textContent = '';
  };

  generate();
};
