/* 微博热搜：调用 OIAPI WeiBoHot，展示实时微博热搜榜
 * 接口已实测开放 CORS（Access-Control-Allow-Origin: *），可页内直接读取。
 * 数据：data 数组，每项 { title, url, images[] }（无 hot 字段，不展示热度）。 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createWeiBoHotSearch = function (container) {
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  container.innerHTML = `
    <div class="tool-card wbs-card">
      <div class="wbs-head">
        <h3 class="tool-title">🔥 微博热搜</h3>
        <p class="wbs-sub" id="wbsSub">实时微博热搜榜</p>
      </div>
      <div class="wbs-controls">
        <button class="tool-btn primary" id="wbsRefreshBtn">刷新</button>
      </div>
      <div class="wbs-result" id="wbsResult">
        <div class="tool-empty">
          <div class="tool-empty-icon">🔥</div>
          <p>正在加载微博热搜…</p>
        </div>
      </div>
      <div class="wbs-status" id="wbsStatus"></div>
    </div>`;

  var refreshBtn = container.querySelector('#wbsRefreshBtn');
  var resultEl = container.querySelector('#wbsResult');
  var statusEl = container.querySelector('#wbsStatus');
  var subEl = container.querySelector('#wbsSub');

  function setStatus(msg, type) {
    statusEl.textContent = msg || '';
    statusEl.className = 'wbs-status' + (type ? ' ' + type : '');
  }

  function buildThumb(images) {
    if (!images || !images.length) return null;
    var img = document.createElement('img');
    img.className = 'wbs-thumb';
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
    row.className = 'wbs-item';

    var rank = document.createElement('span');
    rank.className = 'wbs-rank rank-' + (idx < 3 ? idx + 1 : 'n');
    rank.textContent = String(idx + 1);
    row.appendChild(rank);

    var main = document.createElement('div');
    main.className = 'wbs-main';

    var a = document.createElement('a');
    a.className = 'wbs-title';
    a.href = it.url || '#';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = it.title || '(无标题)';
    main.appendChild(a);

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
    subEl.textContent = '实时微博热搜榜 · 共 ' + list.length + ' 条';

    var wrap = document.createElement('div');
    wrap.className = 'wbs-list';
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
    setStatus('正在加载微博热搜…');
    refreshBtn.disabled = true;
    fetch('https://www.oiapi.net/api/WeiBoHot')
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
