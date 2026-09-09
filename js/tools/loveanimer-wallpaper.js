/* Loveanimer壁纸：竖屏/横屏图片壁纸，支持分类浏览与灯箱预览（OIAPI / Loveanimer） */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createLoveanimerWallpaper = function (container) {
  // 方向：3竖屏 / 1横屏。视频(screen=2)上游封面与视频 CDN 返回 502 不可达，暂不纳入 UI。
  var SCREENS = [
    { value: 3, name: '竖屏' },
    { value: 1, name: '横屏' },
  ];
  // 类型（文档口径）。实测 美女/动漫 上游返回 -2 失效，保留选项但加载会优雅提示。
  var FORMATS = [
    { value: 1, name: '美女' }, { value: 2, name: '动漫' }, { value: 3, name: '风景' },
    { value: 4, name: '游戏' }, { value: 5, name: '明星' }, { value: 6, name: '机械' },
    { value: 7, name: '动物' }, { value: 8, name: '文字' }, { value: 9, name: '城市' },
    { value: 10, name: '视觉' }, { value: 11, name: '物语' }, { value: 12, name: '情感' },
    { value: 13, name: '设计' }, { value: 14, name: '男人' },
  ];

  container.innerHTML = `
    <div class="xmwp-card">
      <div class="xmwp-head">
        <h2 class="xmwp-title">💕 Loveanimer 壁纸</h2>
        <p class="xmwp-sub">Loveanimer 精选壁纸，支持竖屏/横屏与多种类型，点击任意壁纸查看大图</p>
      </div>
      <div class="xmwp-toolbar">
        <label class="xmwp-label" for="lavScreen">方向</label>
        <select class="tool-select xmwp-select" id="lavScreen"></select>
        <label class="xmwp-label" for="lavFmt">类型</label>
        <select class="tool-select xmwp-select" id="lavFmt"></select>
        <button class="tool-btn tool-btn-primary" id="lavMore">加载更多</button>
      </div>
      <div class="xmwp-grid" id="lavGrid"></div>
      <div class="xmwp-status" id="lavStatus">
        <div class="xmwp-loading">正在加载壁纸…</div>
      </div>
    </div>`;

  var screenSel = container.querySelector('#lavScreen');
  var fmtSel = container.querySelector('#lavFmt');
  var moreBtn = container.querySelector('#lavMore');
  var grid = container.querySelector('#lavGrid');
  var status = container.querySelector('#lavStatus');

  SCREENS.forEach(function (s) {
    var o = document.createElement('option');
    o.value = String(s.value);
    o.textContent = s.name;
    screenSel.appendChild(o);
  });
  FORMATS.forEach(function (f) {
    var o = document.createElement('option');
    o.value = String(f.value);
    o.textContent = f.name;
    fmtSel.appendChild(o);
  });

  // 灯箱挂到 body，避免被祖先的 transform（动效/3D倾斜）影响导致 fixed 定位偏移
  document.querySelectorAll('.xmwp-lightbox').forEach(function (n) { n.remove(); });
  var light = document.createElement('div');
  light.className = 'xmwp-lightbox';
  light.hidden = true;
  light.innerHTML = `
    <div class="xmwp-light-backdrop"></div>
    <div class="xmwp-light-box">
      <button class="xmwp-light-close" aria-label="关闭">×</button>
      <img class="xmwp-light-img" alt="壁纸大图" referrerpolicy="no-referrer" />
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

  var state = { screen: 3, format: 3, page: 1, loading: false, finished: false, seen: {} };

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function fmtSize(bytes) {
    if (bytes == null) return '';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
    if (bytes >= 1024) return Math.round(bytes / 1024) + ' KB';
    return bytes + ' B';
  }

  function notifyMotion(node) {
    if (window.DaibaoMotion && window.DaibaoMotion.onContentChange) {
      try { window.DaibaoMotion.onContentChange(node || container); } catch (e) {}
    }
  }

  function setStatus(html) {
    status.innerHTML = html || '';
  }

  function loadPage(reset) {
    if (state.loading) return;
    if (reset) {
      state.page = 1;
      state.finished = false;
      state.seen = {};
      grid.innerHTML = '';
    }
    if (state.finished) return;

    state.loading = true;
    moreBtn.disabled = true;
    setStatus('<div class="xmwp-loading">正在加载第 ' + state.page + ' 页…</div>');

    var url = 'https://www.oiapi.net/api/Loveanimer?screen=' + state.screen +
      '&format=' + state.format + '&page=' + state.page + '&limit=24';
    fetch(url)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (json) {
        if (json.code !== 1 || !Array.isArray(json.data) || json.data.length === 0) {
          state.finished = true;
          setStatus('<div class="tool-empty"><div class="tool-empty-icon">🖼️</div><h3>该分类暂未获取到壁纸</h3><p>上游可能暂时下线，换个类型试试</p></div>');
          return;
        }
        var items = json.data;
        var added = 0;
        items.forEach(function (item) {
          if (!item || !item.url) return;
          if (state.seen[item.url]) return; // 翻页去重
          state.seen[item.url] = true;
          grid.appendChild(buildCard(item));
          added++;
        });
        notifyMotion(grid);
        if (added === 0) {
          state.finished = true;
          setStatus('<div class="xmwp-end">没有更多了</div>');
        } else {
          state.page++;
          setStatus('');
        }
      })
      .catch(function (err) {
        state.finished = true;
        setStatus('<div class="tool-empty"><div class="tool-empty-icon">⚠️</div><h3>加载失败</h3><p>' + (err.message || '网络或跨域读取失败') + '</p></div>');
      })
      .finally(function () {
        state.loading = false;
        moreBtn.disabled = state.finished;
      });
  }

  function buildCard(item) {
    var card = el('a', 'xmwp-card-item');
    card.href = item.url || '#';
    card.target = '_blank';
    card.rel = 'noopener noreferrer';

    var imgWrap = el('div', 'xmwp-img-wrap');
    var img = el('img', 'xmwp-img');
    var tag = (item.tag || '').trim();
    img.src = item.url || '';
    img.alt = tag || '壁纸';
    img.loading = 'lazy';
    img.referrerPolicy = 'no-referrer';
    img.onerror = function () {
      imgWrap.textContent = '🖼️';
      imgWrap.classList.add('xmwp-img-fallback');
    };
    imgWrap.appendChild(img);
    card.appendChild(imgWrap);

    var meta = el('div', 'xmwp-meta');
    var shortTag = tag.split(/\s+/).slice(0, 3).join(' ');
    meta.appendChild(el('span', 'xmwp-name', shortTag || '壁纸'));
    if (item.size) meta.appendChild(el('span', 'xmwp-size', fmtSize(item.size)));
    card.appendChild(meta);

    card.addEventListener('click', function (e) {
      if (!item.url) { e.preventDefault(); return; }
      e.preventDefault();
      openLight(item.url, shortTag || '壁纸');
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

  screenSel.addEventListener('change', function () {
    state.screen = parseInt(screenSel.value, 10) || 3;
    loadPage(true);
  });
  fmtSel.addEventListener('change', function () {
    state.format = parseInt(fmtSel.value, 10) || 3;
    loadPage(true);
  });
  moreBtn.addEventListener('click', function () { loadPage(false); });

  loadPage(true);
  notifyMotion(container);
};
