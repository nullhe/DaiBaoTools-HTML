/* Pximg：随机 Pixiv 作品（可能含 R18，需勾选确认后方可查询）OIAPI / Pximg */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createPximgWallpaper = function (container) {
  container.innerHTML = `
    <div class="xmwp-card">
      <div class="xmwp-head">
        <h2 class="xmwp-title">🎨 Pximg 壁纸</h2>
        <p class="xmwp-sub">随机 Pixiv 作品，可能包含 R18 内容；勾选确认后方可查询，每次返回一张</p>
      </div>
      <div class="pxg-consent">
        <label class="pxg-check">
          <input type="checkbox" id="pxgConsent" />
          <span>可能存在 R18 内容，请确认后再查询</span>
        </label>
        <button class="tool-btn tool-btn-primary" id="pxgQuery" disabled>查询一张</button>
      </div>
      <div class="xmwp-status" id="pxgStatus">
        <div class="pxg-hint">请先勾选「可能存在 R18 内容」确认项，再点击「查询一张」</div>
      </div>
      <div class="xmwp-grid" id="pxgGrid"></div>
    </div>`;

  var consent = container.querySelector('#pxgConsent');
  var queryBtn = container.querySelector('#pxgQuery');
  var status = container.querySelector('#pxgStatus');
  var grid = container.querySelector('#pxgGrid');

  // 灯箱挂到 body，避免被祖先的 transform（动效/3D倾斜）影响导致 fixed 定位偏移
  document.querySelectorAll('.xmwp-lightbox').forEach(function (n) { n.remove(); });
  var light = document.createElement('div');
  light.className = 'xmwp-lightbox';
  light.hidden = true;
  light.innerHTML = `
    <div class="xmwp-light-backdrop"></div>
    <div class="xmwp-light-box">
      <button class="xmwp-light-close" aria-label="关闭">×</button>
      <img class="xmwp-light-img" alt="作品大图" referrerpolicy="no-referrer" />
      <div class="xmwp-light-bar">
        <span class="xmwp-light-name"></span>
        <a class="xmwp-light-link" target="_blank" rel="noopener noreferrer">在新标签打开</a>
      </div>
    </div>`;
  document.body.appendChild(light);
  var lightImg = light.querySelector('.xmwp-light-img');
  var lightName = light.querySelector('.xmwp-light-name');
  var lightLink = light.querySelector('.xmwp-light-link');
  var lightClose = light.querySelector('.xmwp-light-close');
  var lightBg = light.querySelector('.xmwp-light-backdrop');

  var querying = false;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function setStatus(html) {
    status.innerHTML = html || '';
  }

  function notifyMotion(node) {
    if (window.DaibaoMotion && window.DaibaoMotion.onContentChange) {
      try { window.DaibaoMotion.onContentChange(node || container); } catch (e) {}
    }
  }

  function isR18(item) {
    if (item.r18 === true) return true;
    var tags = item.tags || [];
    return tags.some(function (t) { return /r[-_]?18/i.test(String(t)); });
  }

  function queryOne() {
    if (!consent.checked) { consent.focus(); return; }
    if (querying) return;
    querying = true;
    queryBtn.disabled = true;
    setStatus('<div class="xmwp-loading">正在获取随机作品…</div>');

    fetch('https://www.oiapi.net/api/Pximg')
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (json) {
        var d = json.data;
        if (!d || typeof d !== 'object' || !d.pid) {
          setStatus('<div class="tool-empty"><div class="tool-empty-icon">⚠️</div><h3>未获取到作品</h3><p>稍后重试</p></div>');
          return;
        }
        grid.insertBefore(buildCard(d), grid.firstChild);
        notifyMotion(grid);
        setStatus('');
      })
      .catch(function (err) {
        setStatus('<div class="tool-empty"><div class="tool-empty-icon">⚠️</div><h3>加载失败</h3><p>' + (err.message || '网络或跨域读取失败') + '</p></div>');
      })
      .finally(function () {
        querying = false;
        queryBtn.disabled = !consent.checked;
      });
  }

  function buildCard(item) {
    var card = el('a', 'xmwp-card-item');
    var r18 = isR18(item);

    var imgWrap = el('div', 'xmwp-img-wrap');
    var img = el('img', 'xmwp-img');
    img.src = (item.urls && (item.urls.regular || item.urls.small)) || '';
    img.alt = item.title || 'Pixiv 作品';
    img.loading = 'lazy';
    img.referrerPolicy = 'no-referrer';
    img.onerror = function () {
      imgWrap.textContent = '🖼️';
      imgWrap.classList.add('xmwp-img-fallback');
    };
    imgWrap.appendChild(img);
    card.appendChild(imgWrap);

    var meta = el('div', 'xmwp-meta');
    var nameLine = el('span', 'xmwp-name', item.title || '未命名作品');
    meta.appendChild(nameLine);
    if (r18) meta.appendChild(el('span', 'pxg-r18', 'R18'));
    meta.appendChild(el('div', 'pxg-author', 'by ' + (item.author || '未知')));
    var tags = item.tags || [];
    if (tags.length) {
      var shown = tags.slice(0, 6).join(' · ');
      meta.appendChild(el('div', 'pxg-tags', shown + (tags.length > 6 ? ' …' : '')));
    }
    card.appendChild(meta);

    var orig = (item.urls && (item.urls.original || item.urls.regular)) || '';
    card.addEventListener('click', function (e) {
      e.preventDefault();
      if (!orig) return;
      openLight(orig, (item.title || '作品') + (item.author ? (' · ' + item.author) : ''));
    });

    return card;
  }

  function openLight(url, name) {
    lightImg.src = url;
    lightName.textContent = name;
    lightLink.href = url;
    light.hidden = false;
    lightClose.focus();
  }
  function closeLight() {
    light.hidden = true;
    lightImg.src = '';
  }

  lightClose.addEventListener('click', closeLight);
  lightBg.addEventListener('click', closeLight);
  light.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLight();
  });

  consent.addEventListener('change', function () {
    queryBtn.disabled = !consent.checked;
    if (consent.checked && grid.children.length === 0) {
      setStatus('<div class="pxg-hint">已确认，点击「查询一张」获取随机作品</div>');
    }
  });
  queryBtn.addEventListener('click', queryOne);

  // 默认不加载任何内容，仅展示确认区；用户勾选并点击后才查询
  notifyMotion(container);
};
