/* 360壁纸：按分类浏览360壁纸，支持瀑布网格与灯箱预览（OIAPI / Wallpaper360） */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createWallpaper360 = function (container) {
  var CATEGORIES = [
    { v: 1, n: '4K专区' },
    { v: 2, n: '美女模特' },
    { v: 3, n: '爱情美图' },
    { v: 4, n: '风景' },
    { v: 5, n: '小清新' },
    { v: 6, n: '动漫' },
    { v: 7, n: '明星' },
    { v: 8, n: '萌宠' },
    { v: 9, n: '游戏' },
    { v: 10, n: '汽车' },
    { v: 11, n: '炫酷' },
    { v: 12, n: '军事' },
    { v: 13, n: '劲爆' },
    { v: 14, n: '纹理' },
    { v: 15, n: '文字' },
    { v: 16, n: '限时' },
  ];
  var PAGE_SIZE = 24;

  container.innerHTML = `
    <div class="xmwp-card">
      <div class="xmwp-head">
        <h2 class="xmwp-title">🖼️ 360壁纸</h2>
        <p class="xmwp-sub">精选360壁纸，按分类浏览，点击任意壁纸查看大图</p>
      </div>
      <div class="xmwp-toolbar">
        <label class="xmwp-label" for="wp360Cat">分类</label>
        <select class="tool-select xmwp-select" id="wp360Cat"></select>
        <button class="tool-btn tool-btn-primary" id="wp360More">加载更多</button>
      </div>
      <div class="xmwp-grid" id="wp360Grid"></div>
      <div class="xmwp-status" id="wp360Status">
        <div class="xmwp-loading">正在拉取壁纸…</div>
      </div>
    </div>
  `;

  var catSel = container.querySelector('#wp360Cat');
  var moreBtn = container.querySelector('#wp360More');
  var grid = container.querySelector('#wp360Grid');
  var status = container.querySelector('#wp360Status');

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

  var state = { format: 6, page: 1, loading: false, finished: false };

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
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
      grid.innerHTML = '';
    }
    if (state.finished) return;

    state.loading = true;
    moreBtn.disabled = true;
    setStatus('<div class="xmwp-loading">正在加载第 ' + state.page + ' 页…</div>');

    var url = 'https://www.oiapi.net/api/Wallpaper360?format=' + state.format +
      '&page=' + state.page + '&limit=' + PAGE_SIZE;
    fetch(url)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (json) {
        if (json.code !== 1 || !Array.isArray(json.data)) {
          if (reset) {
            state.finished = true;
            setStatus('<div class="tool-empty"><div class="tool-empty-icon">🖼️</div><h3>该分类暂无数据或暂不可用</h3><p>换个分类试试</p></div>');
          } else {
            state.finished = true;
            setStatus('<div class="xmwp-end">没有更多了</div>');
          }
          return;
        }
        var items = json.data;
        if (reset && items.length === 0) {
          state.finished = true;
          setStatus('<div class="tool-empty"><div class="tool-empty-icon">🖼️</div><h3>该分类暂无数据</h3><p>换个分类试试</p></div>');
          return;
        }
        items.forEach(function (item) { grid.appendChild(buildCard(item)); });
        notifyMotion(grid);
        if (items.length === 0) {
          state.finished = true;
          setStatus('<div class="xmwp-end">没有更多了</div>');
        } else {
          state.page++;
          setStatus('');
        }
      })
      .catch(function (err) {
        if (reset) {
          setStatus('<div class="tool-empty"><div class="tool-empty-icon">⚠️</div><h3>加载失败</h3><p>' + (err.message || '网络或跨域读取失败') + '</p></div>');
        } else {
          setStatus('<div class="xmwp-end">加载出错，可点击"加载更多"重试</div>');
        }
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
    img.src = item.url || '';
    img.alt = item.tag || '壁纸';
    img.loading = 'lazy';
    img.referrerPolicy = 'no-referrer';
    img.onerror = function () {
      imgWrap.textContent = '🖼️';
      imgWrap.classList.add('xmwp-img-fallback');
    };
    imgWrap.appendChild(img);
    card.appendChild(imgWrap);

    var meta = el('div', 'xmwp-meta');
    meta.appendChild(el('span', 'xmwp-name', item.tag || '未命名壁纸'));
    if (item.resolution) meta.appendChild(el('span', 'xmwp-size', item.resolution));
    card.appendChild(meta);

    card.addEventListener('click', function (e) {
      if (!item.url) { e.preventDefault(); return; }
      e.preventDefault();
      openLight(item.url, item.tag || '壁纸');
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

  // 分类下拉
  CATEGORIES.forEach(function (c) {
    var opt = el('option', null, c.n);
    opt.value = String(c.v);
    catSel.appendChild(opt);
  });
  state.format = 6;
  catSel.value = '6';

  catSel.addEventListener('change', function () {
    state.format = parseInt(catSel.value, 10) || 6;
    loadPage(true);
  });
  moreBtn.addEventListener('click', function () { loadPage(false); });

  loadPage(true);
  notifyMotion(container);
};
