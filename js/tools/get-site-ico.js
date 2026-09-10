/* 获取网站ico（图标处理 L3）：调用 OIAPI WebInfo 接口取网站标题/简介/favicon */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createGetSiteIco = function (container) {
  container.innerHTML = `
    <div class="wsi-tool">
      <div class="wsi-header">
        <h3 class="wsi-title">获取网站 ICO</h3>
        <p class="wsi-subtitle">输入网址，获取该网站的标题、简介与 favicon 图标</p>
      </div>

      <div class="wsi-form">
        <div class="wsi-row">
          <label class="wsi-label" for="wsiInput">网站地址</label>
          <div class="wsi-field">
            <input
              id="wsiInput"
              class="wsi-input"
              type="text"
              placeholder="例如：github.com 或 https://www.baidu.com"
              autocomplete="off"
              spellcheck="false"
            />
          </div>
          <button id="wsiBtn" class="wsi-submit" type="button">获取</button>
        </div>
        <div id="wsiError" class="wsi-error" hidden></div>
      </div>

      <div id="wsiResult" class="wsi-result" hidden></div>
      <div id="wsiLoading" class="wsi-loading" hidden>
        <span class="wsi-spinner"></span> 正在获取网站信息…
      </div>
    </div>
  `;

  var input = container.querySelector('#wsiInput');
  var btn = container.querySelector('#wsiBtn');
  var errorBox = container.querySelector('#wsiError');
  var result = container.querySelector('#wsiResult');
  var loading = container.querySelector('#wsiLoading');

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.hidden = false;
  }
  function clearError() {
    errorBox.textContent = '';
    errorBox.hidden = true;
  }

  // 规范化用户输入：补全协议，不允许非法字符
  function normalizeUrl(raw) {
    var s = (raw || '').trim();
    if (!s) return null;
    if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
    // 校验是否为合法 URL
    try {
      var u = new URL(s);
      if (!u.hostname || u.hostname.indexOf('.') === -1) return null;
      return u.href;
    } catch (e) {
      return null;
    }
  }

  // 将接口返回的 icon 可能是相对路径，归一到绝对地址
  function resolveIcon(icon, origin) {
    if (!icon) return '';
    try {
      return new URL(icon, origin).href;
    } catch (e) {
      return icon;
    }
  }

  function copyText(text, btn) {
    var done = function () {
      var old = btn.textContent;
      btn.textContent = '已复制';
      setTimeout(function () {
        btn.textContent = old;
      }, 1200);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () {
        fallbackCopy(text, done);
      });
    } else {
      fallbackCopy(text, done);
    }
  }
  function fallbackCopy(text, done) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      if (done) done();
    } catch (e) {
      /* 忽略复制失败 */
    }
  }

  function render(data, iconUrl) {
    result.innerHTML = '';

    // 图标预览
    var preview = document.createElement('div');
    preview.className = 'wsi-preview';
    var img = document.createElement('img');
    img.className = 'wsi-preview-img';
    img.alt = '网站图标';
    img.referrerPolicy = 'no-referrer';
    img.loading = 'lazy';
    var iconOk = false;
    if (iconUrl) {
      img.onerror = function () {
        // 部分站点返回的 icon 并非真实图片（如 CSS 文件），加载失败时回退
        img.style.display = 'none';
        fallback.style.display = 'flex';
        note.textContent = '接口返回的图标地址无法直接预览（可能为非图片资源），可点击右侧链接查看原地址。';
        note.hidden = false;
      };
      img.src = iconUrl;
      iconOk = true;
    }
    var fallback = document.createElement('div');
    fallback.className = 'wsi-preview-fallback';
    fallback.textContent = '🌐';
    fallback.style.display = iconOk ? 'none' : 'flex';

    preview.appendChild(img);
    preview.appendChild(fallback);

    var note = document.createElement('p');
    note.className = 'wsi-note';
    note.hidden = true;

    // 信息网格
    var grid = document.createElement('div');
    grid.className = 'wsi-grid';

    var title = (data.title || '').toString();
    var url = (data.url || '').toString();
    var desc = (data.desc || '').toString();

    function cell(label, valueEl) {
      var item = document.createElement('div');
      item.className = 'wsi-item';
      var l = document.createElement('div');
      l.className = 'wsi-item-label';
      l.textContent = label;
      item.appendChild(l);
      item.appendChild(valueEl);
      return item;
    }

    // 标题（可点击跳转）
    var titleVal = document.createElement('div');
    titleVal.className = 'wsi-item-value wsi-title-val';
    if (title) {
      var a = document.createElement('a');
      a.href = url || '#';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = title;
      titleVal.appendChild(a);
    } else {
      titleVal.textContent = '—';
    }

    // 网址
    var urlVal = document.createElement('div');
    urlVal.className = 'wsi-item-value';
    if (url) {
      var ua = document.createElement('a');
      ua.href = url;
      ua.target = '_blank';
      ua.rel = 'noopener noreferrer';
      ua.textContent = url;
      urlVal.appendChild(ua);
    } else {
      urlVal.textContent = '—';
    }

    // 简介
    var descVal = document.createElement('div');
    descVal.className = 'wsi-item-value wsi-desc-val';
    descVal.textContent = desc || '—';

    grid.appendChild(cell('标题', titleVal));
    grid.appendChild(cell('网址', urlVal));
    grid.appendChild(cell('简介', descVal));

    // ICO 链接区
    var icoWrap = document.createElement('div');
    icoWrap.className = 'wsi-ico-wrap';
    var icoLabel = document.createElement('div');
    icoLabel.className = 'wsi-item-label';
    icoLabel.textContent = 'ICO 地址';
    var icoRow = document.createElement('div');
    icoRow.className = 'wsi-ico-row';
    if (iconUrl) {
      var link = document.createElement('a');
      link.className = 'wsi-ico-link';
      link.href = iconUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = iconUrl;
      var copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'wsi-copy';
      copyBtn.textContent = '复制';
      copyBtn.addEventListener('click', function () {
        copyText(iconUrl, copyBtn);
      });
      icoRow.appendChild(link);
      icoRow.appendChild(copyBtn);
    } else {
      icoRow.textContent = '未获取到图标地址';
    }
    icoWrap.appendChild(icoLabel);
    icoWrap.appendChild(icoRow);

    result.appendChild(preview);
    result.appendChild(note);
    result.appendChild(grid);
    result.appendChild(icoWrap);
    result.hidden = false;
  }

  function fetchInfo() {
    clearError();
    var raw = input.value;
    var url = normalizeUrl(raw);
    if (!url) {
      showError('请输入合法的网址（如 github.com 或 https://www.baidu.com）');
      return;
    }

    result.hidden = true;
    loading.hidden = false;
    btn.disabled = true;

    var api =
      'https://www.oiapi.net/api/WebInfo?url=' +
      encodeURIComponent(url) +
      '&type=json';

    var controller = new AbortController();
    var timer = setTimeout(function () {
      controller.abort();
    }, 15000);

    fetch(api, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
      .then(function (resp) {
        return resp.json();
      })
      .then(function (json) {
        clearTimeout(timer);
        loading.hidden = true;
        btn.disabled = false;
        if (!json || json.code !== 1 || !json.data) {
          showError('未获取到该网站信息：' + ((json && json.message) || '接口返回异常'));
          return;
        }
        var data = json.data;
        var origin = '';
        try {
          origin = new URL(url).origin;
        } catch (e) {
          origin = '';
        }
        var iconUrl = resolveIcon(data.icon, origin);
        render(data, iconUrl);
      })
      .catch(function (err) {
        clearTimeout(timer);
        loading.hidden = true;
        btn.disabled = false;
        if (err && err.name === 'AbortError') {
          showError('请求超时，请稍后重试或检查网址是否正确');
        } else {
          showError('获取失败：' + (err && err.message ? err.message : '网络错误'));
        }
      });
  }

  btn.addEventListener('click', fetchInfo);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') fetchInfo();
  });
};
