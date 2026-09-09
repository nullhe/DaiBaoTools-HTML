/* 头条热搜：调用 OIAPI TouTiao，展示实时头条热搜榜
 * 接口已实测开放 CORS（Access-Control-Allow-Origin: *），可页内直接读取。
 * 数据：data 数组，每项 { cid, title, url, hot, images[] }。 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createTouTiaoHotSearch = function (container) {
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatHot(n) {
    n = Number(n) || 0;
    if (n >= 1e8) return (n / 1e8).toFixed(1).replace(/\.0$/, '') + ' 亿';
    if (n >= 1e4) return (n / 1e4).toFixed(1).replace(/\.0$/, '') + ' 万';
    return String(n);
  }

  container.innerHTML = `
    <div class="tool-card hts-card">
      <div class="hts-head">
        <h3 class="tool-title">🔥 头条热搜</h3>
        <p class="hts-sub" id="htsSub">实时头条热搜榜</p>
      </div>
      <div class="hts-controls">
        <button class="tool-btn primary" id="htsRefreshBtn">刷新</button>
      </div>
      <div class="hts-result" id="htsResult">
        <div class="tool-empty">
          <div class="tool-empty-icon">🔥</div>
          <p>正在加载头条热搜…</p>
        </div>
      </div>
      <div class="hts-status" id="htsStatus"></div>
    </div>`;

  var refreshBtn = container.querySelector('#htsRefreshBtn');
  var resultEl = container.querySelector('#htsResult');
  var statusEl = container.querySelector('#htsStatus');
  var subEl = container.querySelector('#htsSub');

  function setStatus(msg, type) {
    statusEl.textContent = msg || '';
    statusEl.className = 'hts-status' + (type ? ' ' + type : '');
  }

  function buildThumb(images) {
    if (!images || !images.length) return null;
    var img = document.createElement('img');
    img.className = 'hts-thumb';
    img.alt = 'thumb';
    img.loading = 'lazy';
    img.referrerPolicy = 'no-referrer';
    img.src = images[0];
    img.addEventListener('error', function () {
      if (img.parentNode) img.parentNode.removeChild(img);
    });
    return img;
  }

  function buildRow(it, idx) {
    var row = document.createElement('div');
    row.className = 'hts-item';

    var rank = document.createElement('span');
    rank.className = 'hts-rank rank-' + (idx < 3 ? idx + 1 : 'n');
    rank.textContent = String(idx + 1);
    row.appendChild(rank);

    var main = document.createElement('div');
    main.className = 'hts-main';

    var a = document.createElement('a');
    a.className = 'hts-title';
    a.href = it.url || '#';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = it.title || '(无标题)';
    main.appendChild(a);

    var hot = document.createElement('span');
    hot.className = 'hts-hot';
    hot.textContent = '🔥 ' + formatHot(it.hot);
    main.appendChild(hot);

    row.appendChild(main);

    var thumb = buildThumb(it.images);
    if (thumb) row.appendChild(thumb);

    return row;
  }

  function render(d) {
    var list = d.data || [];
    resultEl.innerHTML = '';
    if (!list.length) {
      resultEl.innerHTML = '<div class="tool-empty"><p>暂无可展示的热搜</p></div>';
      return;
    }
    subEl.textContent = '实时头条热搜榜 · 共 ' + list.length + ' 条';

    var wrap = document.createElement('div');
    wrap.className = 'hts-list';
    list.forEach(function (it, i) {
      wrap.appendChild(buildRow(it, i));
    });
    resultEl.appendChild(wrap);

    if (window.DaibaoMotion && window.DaibaoMotion.onContentChange) {
      try {
        window.DaibaoMotion.onContentChange(resultEl);
      } catch (e) {
        /* 动效异常不影响功能 */
      }
    }
  }

  function load() {
    setStatus('正在加载头条热搜…');
    refreshBtn.disabled = true;
    fetch('https://www.oiapi.net/api/TouTiao')
      .then(function (r) {
        return r.json();
      })
      .then(function (json) {
        if (!json || json.code !== 1 || !json.data) {
          throw new Error((json && json.message) || '返回数据异常');
        }
        render(json);
        setStatus('加载完成', 'ok');
      })
      .catch(function (err) {
        resultEl.innerHTML =
          '<div class="tool-empty"><div class="tool-empty-icon">⚠️</div><p>加载失败：' +
          escapeHtml(err.message) +
          '</p></div>';
        setStatus('加载失败：' + err.message, 'warn');
      })
      .finally(function () {
        refreshBtn.disabled = false;
      });
  }

  refreshBtn.addEventListener('click', load);
  load();
};
