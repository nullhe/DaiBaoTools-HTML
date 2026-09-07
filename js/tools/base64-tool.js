/* Base64 编解码（UTF-8 安全） */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createBase64Tool = function (container) {
  container.innerHTML = `
    <div class="tool-wrap">
      <div class="tool-head">
        <div class="tool-title">Base64 编解码</div>
        <div class="tool-subtitle">支持中文，按 UTF-8 处理</div>
      </div>
      <div class="tool-cols">
        <div class="tool-col">
          <div class="tool-panel-title">输入</div>
          <textarea class="tool-textarea" id="b64Input" placeholder="在此输入要编码或解码的内容…"></textarea>
          <div class="tool-btn-row">
            <button class="tool-btn primary" id="b64Encode">编码 →</button>
            <button class="tool-btn" id="b64Decode">← 解码</button>
            <button class="tool-btn" id="b64Swap">交换</button>
            <button class="tool-btn" id="b64Clear">清空</button>
          </div>
          <div class="tool-error" id="b64Error"></div>
          <p class="tool-hint">编码：文本 → Base64；解码：Base64 → 文本。中文按 UTF-8 处理，不会出现乱码。</p>
        </div>
        <div class="tool-col">
          <div class="tool-panel-title">结果</div>
          <div class="tool-output" id="b64Output"></div>
          <div class="tool-btn-row">
            <button class="tool-btn accent" id="b64Copy">复制结果</button>
          </div>
        </div>
      </div>
    </div>`;

  var input = container.querySelector('#b64Input');
  var output = container.querySelector('#b64Output');
  var errorEl = container.querySelector('#b64Error');

  function utf8ToBase64(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = '';
    var chunk = 0x8000;
    for (var i = 0; i < bytes.length; i += chunk) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(bin);
  }

  function base64ToUtf8(b64) {
    var clean = b64.replace(/\s+/g, '');
    var bin = atob(clean);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function encode() {
    var text = input.value;
    errorEl.textContent = '';
    if (!text) {
      output.textContent = '';
      errorEl.textContent = '请输入内容';
      return;
    }
    try {
      output.textContent = utf8ToBase64(text);
    } catch (e) {
      output.textContent = '';
      errorEl.textContent = '编码失败：' + e.message;
    }
  }

  function decode() {
    var text = input.value.trim();
    errorEl.textContent = '';
    if (!text) {
      output.textContent = '';
      errorEl.textContent = '请输入 Base64 内容';
      return;
    }
    try {
      output.textContent = base64ToUtf8(text);
    } catch (e) {
      output.textContent = '';
      errorEl.textContent = '解码失败：不是合法的 Base64 字符串';
    }
  }

  container.querySelector('#b64Encode').onclick = encode;
  container.querySelector('#b64Decode').onclick = decode;
  container.querySelector('#b64Swap').onclick = function () {
    var a = input.value;
    input.value = output.textContent;
    output.textContent = a;
    errorEl.textContent = '';
  };
  container.querySelector('#b64Clear').onclick = function () {
    input.value = '';
    output.textContent = '';
    errorEl.textContent = '';
  };
  container.querySelector('#b64Copy').onclick = function () {
    if (!output.textContent) {
      DaibaoTools.toast('没有可复制的内容');
      return;
    }
    DaibaoTools.copyText(output.textContent);
    DaibaoTools.toast('已复制到剪贴板');
  };
};
