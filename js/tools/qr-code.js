/* 二维码工具：二维码 L3，调用 OIAPI QRcode 接口（生成 / 解析，免 key，CORS *） */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createQrCode = function (container) {
  container.innerHTML = `
    <div class="qr-tool">
      <!-- 生成 -->
      <div class="qr-card">
        <h2 class="qr-card-title">生成二维码</h2>
        <div class="qr-field">
          <label class="qr-label" for="qrContent">内容（文字 / 网址 / 任意文本）</label>
          <textarea class="qr-textarea" id="qrContent" rows="3" placeholder="例如 https://github.com/nullhe"></textarea>
        </div>
        <div class="qr-row">
          <div class="qr-field qr-field-grow">
            <label class="qr-label" for="qrSize">尺寸（像素，1-2000）</label>
            <input class="qr-input" id="qrSize" type="number" min="1" max="2000" value="300" />
          </div>
          <div class="qr-field">
            <label class="qr-label" for="qrLevel">纠错级别</label>
            <select class="qr-select" id="qrLevel">
              <option value="L">L (7%)</option>
              <option value="M" selected>M (15%)</option>
              <option value="Q">Q (25%)</option>
              <option value="H">H (30%)</option>
            </select>
          </div>
          <div class="qr-field">
            <label class="qr-label" for="qrFormat">格式</label>
            <select class="qr-select" id="qrFormat">
              <option value="png" selected>PNG</option>
              <option value="jpeg">JPEG</option>
            </select>
          </div>
        </div>
        <button class="qr-submit" id="qrGenBtn" type="button">生成二维码</button>
        <div class="qr-error" id="qrGenErr" hidden></div>
        <div class="qr-result" id="qrGenResult" hidden>
          <img class="qr-img" id="qrImg" alt="二维码" referrerpolicy="no-referrer"
            onerror="this.style.display='none';this.nextElementSibling.style.display='block'" />
          <div class="qr-img-fallback" id="qrImgFallback" hidden>⚠️ 图片加载失败（可能被防盗链拦截，可点右侧链接查看原图）</div>
          <div class="qr-result-meta">
            <a class="qr-img-link" id="qrImgLink" target="_blank" rel="noopener noreferrer">查看 / 下载原图 ↗</a>
          </div>
        </div>
      </div>

      <!-- 解析 -->
      <div class="qr-card">
        <h2 class="qr-card-title">解析二维码</h2>
        <p class="qr-card-tip">填入一张公网可访问的二维码图片链接，接口在服务端识别并返回内容（当前仅支持 URL 方式，需图片本身可被外网访问）。</p>
        <div class="qr-field">
          <label class="qr-label" for="qrUrl">二维码图片链接（URL）</label>
          <input class="qr-input" id="qrUrl" type="text" autocomplete="off" placeholder="https://example.com/qrcode.png" />
        </div>
        <button class="qr-submit" id="qrDecBtn" type="button">解析二维码</button>
        <div class="qr-error" id="qrDecErr" hidden></div>
        <div class="qr-out" id="qrDecResult" hidden>
          <div class="qr-out-head">
            <span class="qr-out-label">解析结果</span>
            <button class="qr-copy" id="qrCopyBtn" type="button">复制</button>
          </div>
          <pre class="qr-out-text" id="qrOutText"></pre>
        </div>
      </div>
    </div>`;

  var qrContent = container.querySelector('#qrContent');
  var qrSize = container.querySelector('#qrSize');
  var qrLevel = container.querySelector('#qrLevel');
  var qrFormat = container.querySelector('#qrFormat');
  var genBtn = container.querySelector('#qrGenBtn');
  var genErr = container.querySelector('#qrGenErr');
  var genResult = container.querySelector('#qrGenResult');
  var qrImg = container.querySelector('#qrImg');
  var qrImgFallback = container.querySelector('#qrImgFallback');
  var qrImgLink = container.querySelector('#qrImgLink');

  var qrUrl = container.querySelector('#qrUrl');
  var decBtn = container.querySelector('#qrDecBtn');
  var decErr = container.querySelector('#qrDecErr');
  var decResult = container.querySelector('#qrDecResult');
  var qrOutText = container.querySelector('#qrOutText');
  var qrCopyBtn = container.querySelector('#qrCopyBtn');

  function showErr(box, msg) {
    box.textContent = msg;
    box.hidden = false;
  }
  function hideErr(box) {
    box.hidden = true;
    box.textContent = '';
  }

  function generate() {
    hideErr(genErr);
    genResult.hidden = true;

    var content = qrContent.value.trim();
    if (!content) {
      showErr(genErr, '请输入要生成二维码的内容');
      return;
    }
    var size = parseInt(qrSize.value, 10);
    if (isNaN(size) || size < 1 || size > 2000) {
      showErr(genErr, '尺寸需为 1-2000 之间的整数');
      return;
    }
    var level = qrLevel.value;
    var format = qrFormat.value;

    var url =
      'https://www.oiapi.net/api/QRcode/encode?content=' +
      encodeURIComponent(content) +
      '&size=' + size +
      '&level=' + encodeURIComponent(level) +
      '&format=' + encodeURIComponent(format) +
      '&type=json';

    genBtn.disabled = true;
    genBtn.textContent = '生成中…';

    fetch(url, { headers: { Accept: 'application/json' } })
      .then(function (res) {
        return res.json();
      })
      .then(function (json) {
        genBtn.disabled = false;
        genBtn.textContent = '生成二维码';

        if (!json || typeof json.code === 'number' && json.code < 0) {
          showErr(genErr, '生成失败：' + (json && json.message ? json.message : '未知错误'));
          return;
        }
        // 成功时 message 字段即为二维码图片地址
        var imgUrl = json && json.message;
        if (!imgUrl || !/^https?:\/\//.test(imgUrl)) {
          showErr(genErr, '生成失败：未返回有效图片地址');
          return;
        }
        qrImg.style.display = '';
        qrImgFallback.style.display = 'none';
        qrImg.src = imgUrl;
        qrImgLink.href = imgUrl;
        genResult.hidden = false;
      })
      .catch(function (err) {
        genBtn.disabled = false;
        genBtn.textContent = '生成二维码';
        showErr(genErr, '网络请求失败：' + err.message);
      });
  }

  function decode() {
    hideErr(decErr);
    decResult.hidden = true;

    var url = qrUrl.value.trim();
    if (!/^https?:\/\//.test(url)) {
      showErr(decErr, '请输入有效的二维码图片链接（以 http/https 开头）');
      return;
    }

    var api =
      'https://www.oiapi.net/api/QRcode/decode?url=' +
      encodeURIComponent(url) +
      '&type=json';

    decBtn.disabled = true;
    decBtn.textContent = '解析中…';

    fetch(api, { headers: { Accept: 'application/json' } })
      .then(function (res) {
        return res.json();
      })
      .then(function (json) {
        decBtn.disabled = false;
        decBtn.textContent = '解析二维码';

        if (!json || typeof json.code === 'number' && json.code < 0) {
          showErr(decErr, '解析失败：' + (json && json.message ? json.message : '未知错误'));
          return;
        }
        var texts = [];
        if (Array.isArray(json.data)) {
          json.data.forEach(function (t) {
            if (t != null && t !== '') texts.push(String(t));
          });
        }
        if (texts.length === 0 && json.message) texts.push(String(json.message));

        if (texts.length === 0) {
          showErr(decErr, '未能从图片中识别到二维码内容');
          return;
        }
        // 用 textContent 写入，避免识别出的内容造成注入
        qrOutText.textContent = texts.join('\n');
        decResult.hidden = false;
      })
      .catch(function (err) {
        decBtn.disabled = false;
        decBtn.textContent = '解析二维码';
        showErr(decErr, '网络请求失败：' + err.message);
      });
  }

  function copyResult() {
    var text = qrOutText.textContent;
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () {
          flashCopy('已复制');
        },
        function () {
          fallbackCopy(text);
        }
      );
    } else {
      fallbackCopy(text);
    }
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
      flashCopy('已复制');
    } catch (e) {
      flashCopy('复制失败');
    }
  }

  function flashCopy(msg) {
    var old = qrCopyBtn.textContent;
    qrCopyBtn.textContent = msg;
    setTimeout(function () {
      qrCopyBtn.textContent = old;
    }, 1200);
  }

  genBtn.addEventListener('click', generate);
  decBtn.addEventListener('click', decode);
  qrCopyBtn.addEventListener('click', copyResult);
};
