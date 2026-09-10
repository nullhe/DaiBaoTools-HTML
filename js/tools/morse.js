/* 摩斯电码（生活工具 · 三级页面）：文本与摩斯电码互转，调用 OIAPI Morse 接口 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createMorse = function (container) {
  container.innerHTML = `
    <div class="tool-card">
      <h2 class="tool-title">摩斯电码</h2>
      <p class="mrs-desc">文本与摩斯电码互转（数据源：<a href="https://www.oiapi.net/doc/id/138.html" target="_blank" rel="noopener noreferrer">OIAPI Morse</a>）。编码支持中英文；解码时字母间用 <code>/</code> 分隔，粘贴空格会自动转换。</p>

      <div class="mrs-mode" role="tablist">
        <button class="mrs-mode-btn active" data-mode="encode" type="button">编码（文本 → 摩斯）</button>
        <button class="mrs-mode-btn" data-mode="decode" type="button">解码（摩斯 → 文本）</button>
      </div>

      <div class="tool-field">
        <label class="tool-label" id="mrsInLabel">输入文本（中英文均可）</label>
        <textarea class="tool-textarea" id="mrsInput" rows="4" placeholder="例如：SOS 或 你好"></textarea>
      </div>

      <div class="tool-btn-row">
        <button class="tool-btn primary" id="mrsRun" type="button">转换</button>
        <button class="tool-btn" id="mrsClear" type="button">清空</button>
      </div>

      <div class="tool-field">
        <label class="tool-label">转换结果</label>
        <textarea class="tool-textarea" id="mrsOutput" rows="4" readonly placeholder="结果将显示在这里"></textarea>
      </div>

      <div class="tool-btn-row">
        <button class="tool-btn" id="mrsCopy" type="button">复制结果</button>
      </div>

      <div class="mrs-status" id="mrsStatus"></div>
    </div>
  `;

  var mode = 'encode';
  var inLabel = container.querySelector('#mrsInLabel');
  var input = container.querySelector('#mrsInput');
  var output = container.querySelector('#mrsOutput');
  var statusEl = container.querySelector('#mrsStatus');

  function setMode(m) {
    mode = m;
    container.querySelectorAll('.mrs-mode-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.mode === m);
    });
    if (m === 'encode') {
      inLabel.textContent = '输入文本（中英文均可）';
      input.placeholder = '例如：SOS 或 你好';
    } else {
      inLabel.textContent = '输入摩斯电码（字母间用 / 分隔，可粘贴空格自动转换）';
      input.placeholder = '例如：.../---/...';
    }
  }

  function showStatus(msg, isErr) {
    statusEl.textContent = msg || '';
    statusEl.className = 'mrs-status' + (isErr ? ' error' : '');
  }

  function run() {
    var word = input.value.trim();
    if (!word) {
      showStatus('请输入内容', true);
      return;
    }
    var fmt = mode;
    var payload = word;
    if (fmt === 'decode') {
      // 容错：空格/制表符统一为 / 分隔，避免服务器 500（实测空格分隔会触发 Malformed UTF-8 错误）
      payload = word.replace(/\s+/g, '/');
    }
    var url =
      'https://www.oiapi.net/api/Morse?word=' +
      encodeURIComponent(payload) +
      '&format=' +
      fmt +
      '&type=json';
    showStatus('转换中…', false);
    output.value = '';
    fetch(url, { headers: { Accept: 'application/json' } })
      .then(function (r) {
        return r.text();
      })
      .then(function (txt) {
        var j;
        try {
          j = JSON.parse(txt);
        } catch (e) {
          throw new Error('接口返回异常：' + txt.slice(0, 80));
        }
        if (!j || j.code !== 1 || !j.data) {
          throw new Error(j && j.message ? j.message : '转换失败');
        }
        var result = fmt === 'encode' ? j.data.encode : j.data.decode;
        if (result == null) {
          throw new Error('未获取到转换结果');
        }
        output.value = result;
        showStatus('转换成功', false);
      })
      .catch(function (err) {
        output.value = '';
        showStatus('出错了：' + err.message, true);
      });
  }

  function fallbackCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showStatus('已复制', false);
    } catch (e) {
      showStatus('复制失败，请手动复制', true);
    }
  }

  container.querySelectorAll('.mrs-mode-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      setMode(b.dataset.mode);
    });
  });
  container.querySelector('#mrsRun').addEventListener('click', run);
  container.querySelector('#mrsClear').addEventListener('click', function () {
    input.value = '';
    output.value = '';
    showStatus('', false);
    input.focus();
  });
  container.querySelector('#mrsCopy').addEventListener('click', function () {
    if (!output.value) {
      showStatus('没有可复制的内容', true);
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(output.value).then(
        function () {
          showStatus('已复制', false);
        },
        function () {
          fallbackCopy(output.value);
        }
      );
    } else {
      fallbackCopy(output.value);
    }
  });

  setMode('encode');

  if (window.DaibaoMotion && window.DaibaoMotion.onContentChange) {
    try {
      window.DaibaoMotion.onContentChange(container);
    } catch (e) {
      /* 动效异常不影响功能 */
    }
  }
};
