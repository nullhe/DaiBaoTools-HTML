/* 小米壁纸：按分类浏览小米主题商店壁纸，支持瀑布网格与灯箱预览（OIAPI / XiaoMiWallpaper） */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createXiaoMiWallpaper = function (container) {
  container.innerHTML = `
    <div class="xmwp-card">
      <div class="xmwp-head">
        <h2 class="xmwp-title">🖼️ 小米壁纸</h2>
        <p class="xmwp-sub">精选小米主题商店壁纸，按分类浏览，点击任意壁纸查看大图</p>
      </div>
      <div class="xmwp-toolbar">
        <label class="xmwp-label" for="xmwpCat">分类</label>
        <select class="tool-select xmwp-select" id="xmwpCat">
          <option value="1">热销榜</option>
        </select>
        <button class="tool-btn tool-btn-primary" id="xmwpMore">加载更多</button>
      </div>
      <div class="xmwp-grid" id="xmwpGrid"></div>
      <div class="xmwp-status" id="xmwpStatus">
        <div class="xmwp-loading">正在拉取分类与壁纸…</div>
      </div>
    </div>
  `;

  var catSel = container.querySelector('#xmwpCat');
  var moreBtn = container.querySelector('#xmwpMore');
  var grid = container.querySelector('#xmwpGrid');
  var status = container.querySelector('#xmwpStatus');

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

  var state = { format: 1, page: 1, loading: false, finished: false };
  var categoryCount = 17; // /a 最多 17 个分类，失败的分类会被跳过

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function fmtSize(kb) {
    if (kb == null) return '';
    if (kb >= 1024) return (kb / 1024).toFixed(1) + ' MB';
    return Math.round(kb) + ' KB';
  }

  function notifyMotion(node) {
    if (window.DaibaoMotion && window.DaibaoMotion.onContentChange) {
      try { window.DaibaoMotion.onContentChange(node || container); } catch (e) {}
    }
  }

  function setStatus(html) {
    status.innerHTML = html || '';
  }

  function loadCategories() {
    fetch('https://www.oiapi.net/api/XiaoMiWallpaper/a')
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (json) {
        if (json.code !== 1 || !Array.isArray(json.data)) return;
        var list = json.data.slice();
        if (list.length < categoryCount) {
          var arr = [];
          for (var i = 1; i <= categoryCount; i++) arr.push(i + '. 分类' + i);
          list = arr;
        }
        catSel.innerHTML = '';
        list.forEach(function (raw, i) {
          var idx = i + 1;
          var label = String(raw).replace(/^\d+\.\s*/, '');
          var opt = el('option', null, label);
          opt.value = String(idx);
          catSel.appendChild(opt);
        });
        state.format = 1;
        catSel.value = '1';
      })
      .catch(function () {
        // 分类接口失败：保留默认值，不阻断壁纸加载
      })
      .then(function () {
        loadPage(true);
      });
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

    var url = 'https://www.oiapi.net/api/XiaoMiWallpaper?page=' + state.page + '&format=' + state.format;
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
          setStatus('<div class="xmwp-end">加载出错，可点击下方按钮重试</div>');
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
    img.alt = item.name || '壁纸';
    img.loading = 'lazy';
    img.referrerPolicy = 'no-referrer';
    img.onerror = function () {
      imgWrap.textContent = '🖼️';
      imgWrap.classList.add('xmwp-img-fallback');
    };
    imgWrap.appendChild(img);
    card.appendChild(imgWrap);

    var meta = el('div', 'xmwp-meta');
    meta.appendChild(el('span', 'xmwp-name', item.name || '未命名壁纸'));
    if (item.fileSizeInKB) meta.appendChild(el('span', 'xmwp-size', fmtSize(item.fileSizeInKB)));
    card.appendChild(meta);

    card.addEventListener('click', function (e) {
      if (!item.url) { e.preventDefault(); return; }
      e.preventDefault();
      openLight(item.url, item.name || '壁纸');
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

  catSel.addEventListener('change', function () {
    state.format = parseInt(catSel.value, 10) || 1;
    loadPage(true);
  });
  moreBtn.addEventListener('click', function () { loadPage(false); });

  loadCategories();
  notifyMotion(container);
};
