/* 抖音热搜：调用 OIAPI DouYinHot，展示实时抖音热搜榜
 * 接口已实测开放 CORS（Access-Control-Allow-Origin: *），可页内直接读取。
 * 数据：data 数组，每项 { title, images[] }（无 url / hot 字段，标题不可跳转）。 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createDouYinHotSearch = function (container) {
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  container.innerHTML = `
    <div class="tool-card dhs-card">
      <div class="dhs-head">
        <h3 class="tool-title">🎵 抖音热搜</h3>
        <p class="dhs-sub" id="dhsSub">实时抖音热搜榜</p>
      </div>
      <div class="dhs-controls">
        <button class="tool-btn primary" id="dhsRefreshBtn">刷新</button>
      </div>
      <div class="dhs-result" id="dhsResult">
        <div class="tool-empty">
          <div class="tool-empty-icon">🎵</div>
          <p>正在加载抖音热搜…</p>
        </div>
      </div>
      <div class="dhs-status" id="dhsStatus"></div>
    </div>`;

  var refreshBtn = container.querySelector('#dhsRefreshBtn');
  var resultEl = container.querySelector('#dhsResult');
  var statusEl = container.querySelector('#dhsStatus');
  var subEl = container.querySelector('#dhsSub');

  function setStatus(msg, type) {
    statusEl.textContent = msg || '';
    statusEl.className = 'dhs-status' + (type ? ' ' + type : '');
  }

  function buildThumb(images) {
    if (!images || !images.length) return null;
    var img = document.createElement('img');
    img.className = 'dhs-thumb';
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
    row.className = 'dhs-item';

    var rank = document.createElement('span');
    rank.className = 'dhs-rank rank-' + (idx < 3 ? idx + 1 : 'n');
    rank.textContent = String(idx + 1);
    row.appendChild(rank);

    var title = document.createElement('span');
    title.className = 'dhs-title';
    title.textContent = it.title || '(无标题)';
    row.appendChild(title);

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
    subEl.textContent = '实时抖音热搜榜 · 共 ' + list.length + ' 条';

    var wrap = document.createElement('div');
    wrap.className = 'dhs-list';
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
    setStatus('正在加载抖音热搜…');
    refreshBtn.disabled = true;
    fetch('https://www.oiapi.net/api/DouYinHot')
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
