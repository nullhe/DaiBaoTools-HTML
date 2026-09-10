/* 语言文学 / 名言警句（学习资料 L3），数据来自 OIAPI id/33 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createSaying = function createSaying(container) {
  container.innerHTML = `
    <div class="say-tool">
      <div class="say-header">
        <h2 class="say-title">📜 名言警句</h2>
        <p class="say-subtitle">每次随机奉上一句名言，附出处与配图，点击「换一句」继续</p>
      </div>

      <div class="say-controls">
        <button class="tool-btn tool-btn-primary" type="button" id="sayNext">换一句</button>
        <button class="tool-btn" type="button" id="sayCopy" hidden>复制</button>
      </div>

      <div class="say-result" id="sayResult">
        <div class="say-loading">正在摘取名言…</div>
      </div>
    </div>
  `;

  var nextBtn = container.querySelector('#sayNext');
  var copyBtn = container.querySelector('#sayCopy');
  var result = container.querySelector('#sayResult');
  var loading = false;
  var current = null;

  function str(v) {
    return v == null ? '' : String(v).replace(/\s+$/, '');
  }

  // 接口返回的配图是 http://，统一升级为 https:// 避免混合内容拦截（已实测两种协议均可达）
  function safeImg(url) {
    var u = str(url);
    if (!u) return '';
    return u.replace(/^http:\/\//i, 'https://');
  }

  function showError(msg) {
    current = null;
    copyBtn.hidden = true;
    result.innerHTML = '';
    var box = document.createElement('div');
    box.className = 'tool-empty';
    box.innerHTML = '<div class="tool-empty-icon">⚠️</div>';
    var h = document.createElement('h3');
    h.textContent = '没能拿到名言';
    var p = document.createElement('p');
    p.textContent = msg || '请稍后再试一次';
    box.appendChild(h);
    box.appendChild(p);
    result.appendChild(box);
  }

  function renderSaying(d) {
    result.innerHTML = '';

    var card = document.createElement('div');
    card.className = 'say-card';

    // 配图（加载失败则整块隐藏，不留空白）
    var imgUrl = safeImg(d.Image || d.image);
    if (imgUrl) {
      var fig = document.createElement('div');
      fig.className = 'say-figure';
      var im = document.createElement('img');
      im.className = 'say-img';
      im.src = imgUrl;
      im.alt = '名言配图';
      im.loading = 'lazy';
      im.referrerPolicy = 'no-referrer';
      im.onerror = function () { fig.remove(); };
      fig.appendChild(im);
      card.appendChild(fig);
    }

    // 正文
    var quote = document.createElement('blockquote');
    quote.className = 'say-quote';
    quote.textContent = str(d.content) || '—';
    card.appendChild(quote);

    // 出处 + 时间
    var meta = document.createElement('div');
    meta.className = 'say-meta';

    var from = str(d.from || d.From);
    if (from) {
      var f = document.createElement('div');
      f.className = 'say-from';
      f.textContent = '—— ' + from;
      meta.appendChild(f);
    }

    var time = str(d.time);
    if (time) {
      var t = document.createElement('div');
      t.className = 'say-time';
      t.textContent = time;
      meta.appendChild(t);
    }

    if (meta.children.length) card.appendChild(meta);

    result.appendChild(card);

    // 记录当前内容供复制
    current = [str(d.content), from ? '—— ' + from : ''].filter(Boolean).join('\n');
    copyBtn.hidden = !str(d.content);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { flashBtn('已复制'); },
        function () { fallbackCopy(text); }
      );
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); flashBtn('已复制'); }
    catch (e) { flashBtn('复制失败'); }
    document.body.removeChild(ta);
  }

  var flashTimer = null;
  function flashBtn(msg) {
    var old = copyBtn.textContent;
    copyBtn.textContent = msg;
    if (flashTimer) clearTimeout(flashTimer);
    flashTimer = setTimeout(function () { copyBtn.textContent = old || '复制'; }, 1500);
  }

  function load() {
    if (loading) return;
    loading = true;
    nextBtn.disabled = true;
    copyBtn.hidden = true;
    result.innerHTML = '<div class="say-loading">正在摘取名言…</div>';

    fetch('https://www.oiapi.net/api/Saying?type=json')
      .then(function (resp) {
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        return resp.json();
      })
      .then(function (json) {
        if (json.code !== 1 || !json.data) {
          throw new Error(json.message || '接口未返回有效数据');
        }
        renderSaying(json.data);
      })
      .catch(function (err) {
        showError(err.message || '网络或跨域读取失败');
      })
      .finally(function () {
        loading = false;
        nextBtn.disabled = false;
      });
  }

  nextBtn.addEventListener('click', load);
  copyBtn.addEventListener('click', function () {
    if (current) copyText(current);
  });

  // 进入即自动取一句
  load();

  if (window.DaibaoMotion && window.DaibaoMotion.onContentChange) {
    try {
      window.DaibaoMotion.onContentChange(container);
    } catch (e) {
      /* 动效异常不影响功能 */
    }
  }
};
