/* 表情包搜索：QQ 输入框同款表情包检索（OIAPI / EmoticonPack id=43） */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createEmoticonSearch = function (container) {
  container.innerHTML = `
    <div class="xmwp-card">
      <div class="xmwp-head">
        <h2 class="xmwp-title">😀 表情包搜索</h2>
        <p class="xmwp-sub">QQ 输入框同款表情包。输入关键词搜索，留空则随机抽取热门表情包；点击图片可看大图、复制链接或「找相似」</p>
      </div>
      <div class="ems-toolbar">
        <input class="tool-input ems-input" id="emsKeyword" type="text" placeholder="输入关键词，如：笑、哭、无语（留空随机）" maxlength="30" />
        <select class="tool-select ems-limit" id="emsLimit">
          <option value="20">20 张</option>
          <option value="40" selected>40 张</option>
          <option value="60">60 张</option>
          <option value="100">100 张</option>
        </select>
        <button class="tool-btn tool-btn-primary" id="emsSearch">搜索</button>
        <button class="tool-btn" id="emsLucky">随机热门</button>
      </div>
      <div class="ems-grid" id="emsGrid"></div>
      <div class="ems-foot">
        <div class="ems-status" id="emsStatus"></div>
        <button class="tool-btn" id="emsMore" hidden>加载更多</button>
      </div>
    </div>
  `;

  var input = container.querySelector('#emsKeyword');
  var limitSel = container.querySelector('#emsLimit');
  var searchBtn = container.querySelector('#emsSearch');
  var luckyBtn = container.querySelector('#emsLucky');
  var grid = container.querySelector('#emsGrid');
  var status = container.querySelector('#emsStatus');
  var moreBtn = container.querySelector('#emsMore');

  // 灯箱挂到 body，避免被祖先的 transform（动效 / 3D 倾斜）影响导致 fixed 定位偏移
  document.querySelectorAll('.ems-lightbox').forEach(function (n) { n.remove(); });
  var light = document.createElement('div');
  light.className = 'xmwp-lightbox ems-lightbox';
  light.hidden = true;
  light.innerHTML = `
    <div class="xmwp-light-backdrop"></div>
    <div class="xmwp-light-box">
      <button class="xmwp-light-close" aria-label="关闭">×</button>
      <img class="xmwp-light-img" alt="表情包大图" referrerpolicy="no-referrer" />
      <div class="xmwp-light-bar">
        <span class="ems-light-meta"></span>
        <span class="ems-light-actions">
          <button class="ems-light-btn" id="emsSimilar">找相似</button>
          <button class="ems-light-btn" id="emsCopy">复制链接</button>
          <a class="xmwp-light-link" target="_blank" rel="noopener noreferrer">在新标签打开</a>
        </span>
      </div>
    </div>`;
  document.body.appendChild(light);
  var lightImg = light.querySelector('.xmwp-light-img');
  var lightMeta = light.querySelector('.ems-light-meta');
  var lightLink = light.querySelector('.xmwp-light-link');
  var lightClose = light.querySelector('.xmwp-light-close');
  var lightBg = light.querySelector('.xmwp-light-backdrop');
  var similarBtn = light.querySelector('#emsSimilar');
  var copyBtn = light.querySelector('#emsCopy');

  // keyword === '' 表示随机热门；相似模式用 simId
  var state = { keyword: null, simId: null, page: 1, loading: false, finished: false };
  var seen = new Set(); // 按 url 去重

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

  function fmtSize(bytes) {
    if (!bytes || bytes <= 0) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { flash('已复制链接'); },
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
    try { document.execCommand('copy'); flash('已复制链接'); }
    catch (e) { flash('复制失败，请手动复制'); }
    document.body.removeChild(ta);
  }

  var flashTimer = null;
  function flash(msg) {
    status.textContent = msg;
    if (flashTimer) clearTimeout(flashTimer);
    flashTimer = setTimeout(function () {
      if (state.finished) status.textContent = '已加载全部结果';
      else status.textContent = '';
    }, 1600);
  }

  function buildUrl() {
    var params = ['type=json', 'limit=' + limitSel.value, 'page=' + state.page];
    if (state.simId) {
      params.push('id=' + encodeURIComponent(state.simId));
    } else if (state.keyword) {
      params.push('keyword=' + encodeURIComponent(state.keyword));
    }
    return 'https://www.oiapi.net/api/EmoticonPack?' + params.join('&');
  }

  function doSearch(keyword, simId) {
    state.keyword = keyword || null;
    state.simId = simId || null;
    state.page = 1;
    state.finished = false;
    grid.innerHTML = '';
    seen = new Set();
    moreBtn.hidden = true;
    loadPage();
  }

  function loadPage() {
    if (state.loading) return;
    state.loading = true;
    searchBtn.disabled = true;
    luckyBtn.disabled = true;
    moreBtn.disabled = true;
    status.innerHTML = '<span class="ems-loading">正在获取表情包…</span>';

    fetch(buildUrl())
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (json) {
        if (json.code !== 1 || !Array.isArray(json.data) || json.data.length === 0) {
          state.finished = true;
          moreBtn.hidden = true;
          if (grid.children.length === 0) {
            grid.innerHTML = '';
            status.innerHTML =
              '<div class="tool-empty"><div class="tool-empty-icon">😶</div>' +
              '<h3>没有找到相关表情包</h3><p>换个关键词试试，或直接点「随机热门」</p></div>';
          } else {
            status.textContent = '没有更多了';
          }
          return;
        }

        var added = 0;
        json.data.forEach(function (item) {
          var url = item && item.url;
          if (!url) return;
          if (seen.has(url)) return;
          seen.add(url);
          grid.appendChild(buildCell(item));
          added++;
        });

        notifyMotion(grid);

        if (added === 0) {
          state.finished = true;
          moreBtn.hidden = true;
          status.textContent = '没有更多了';
        } else {
          state.page++;
          moreBtn.hidden = state.finished;
          status.textContent = '已加载 ' + grid.children.length + ' 张';
        }
      })
      .catch(function (err) {
        moreBtn.hidden = false;
        status.innerHTML =
          '<div class="tool-empty"><div class="tool-empty-icon">⚠️</div><h3>获取失败</h3>' +
          '<p>' + ((err && err.message) || '网络或跨域读取失败') + '</p></div>';
      })
      .finally(function () {
        state.loading = false;
        searchBtn.disabled = false;
        luckyBtn.disabled = false;
        moreBtn.disabled = false;
        moreBtn.hidden = state.finished;
      });
  }

  function buildCell(item) {
    var cell = el('button', 'ems-cell');
    cell.type = 'button';
    // 用真实宽高比避免图片被压扁
    if (item.width && item.height) {
      cell.style.aspectRatio = (item.width / item.height).toFixed(4);
    }

    var im = el('img', 'ems-img');
    im.src = item.url;
    im.alt = (item.type || '表情包') + ' 表情';
    im.loading = 'lazy';
    im.referrerPolicy = 'no-referrer';
    im.onerror = function () {
      cell.textContent = '🖼️';
      cell.classList.add('ems-cell-fallback');
    };
    cell.appendChild(im);

    var badge = el('span', 'ems-badge', (item.type || '').toUpperCase());
    cell.appendChild(badge);

    cell.addEventListener('click', function () { openLight(item); });
    return cell;
  }

  var current = null;
  function openLight(item) {
    current = item;
    lightImg.src = item.url;
    var parts = [];
    if (item.width && item.height) parts.push(item.width + '×' + item.height);
    if (item.size) parts.push(fmtSize(item.size));
    if (item.type) parts.push(String(item.type).toUpperCase());
    lightMeta.textContent = parts.join(' · ');
    lightLink.href = item.url;
    similarBtn.hidden = !item.id;
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
  copyBtn.addEventListener('click', function () {
    if (current && current.url) copyText(current.url);
  });
  similarBtn.addEventListener('click', function () {
    if (!current || !current.id) return;
    closeLight();
    input.value = '';
    status.textContent = '正在查找相似表情包…';
    doSearch(null, current.id);
  });

  searchBtn.addEventListener('click', function () {
    doSearch(input.value.trim(), null);
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') doSearch(input.value.trim(), null);
  });
  luckyBtn.addEventListener('click', function () {
    input.value = '';
    doSearch(null, null);
  });
  limitSel.addEventListener('change', function () {
    // 重新按当前条件拉取，使每页数量立即生效
    if (state.keyword || state.simId || grid.children.length) {
      doSearch(state.keyword, state.simId);
    }
  });
  moreBtn.addEventListener('click', function () { loadPage(); });

  notifyMotion(container);
};
