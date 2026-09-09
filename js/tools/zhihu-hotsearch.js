/* 知乎热搜：调用 OIAPI ZhiHuHot，展示实时知乎热搜榜
 * 接口已实测开放 CORS（Access-Control-Allow-Origin: *），可页内直接读取。
 * 数据：data 数组，每项 { id, title, images[] }（无 url 字段，标题不可跳转）。 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createZhiHuHotSearch = function (container) {
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  container.innerHTML = `
    <div class="tool-card zhs-card">
      <div class="zhs-head">
        <h3 class="tool-title">💡 知乎热搜</h3>
        <p class="zhs-sub" id="zhsSub">实时知乎热搜榜</p>
      </div>
      <div class="zhs-controls">
        <button class="tool-btn primary" id="zhsRefreshBtn">刷新</button>
      </div>
      <div class="zhs-result" id="zhsResult">
        <div class="tool-empty">
          <div class="tool-empty-icon">💡</div>
          <p>正在加载知乎热搜…</p>
        </div>
      </div>
      <div class="zhs-status" id="zhsStatus"></div>
    </div>`;

  var refreshBtn = container.querySelector('#zhsRefreshBtn');
  var resultEl = container.querySelector('#zhsResult');
  var statusEl = container.querySelector('#zhsStatus');
  var subEl = container.querySelector('#zhsSub');

  function setStatus(msg, type) {
    statusEl.textContent = msg || '';
    statusEl.className = 'zhs-status' + (type ? ' ' + type : '');
  }

  function buildThumb(images) {
    if (!images || !images.length) return null;
    var img = document.createElement('img');
    img.className = 'zhs-thumb';
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
    row.className = 'zhs-item';

    var rank = document.createElement('span');
    rank.className = 'zhs-rank rank-' + (idx < 3 ? idx + 1 : 'n');
    rank.textContent = String(idx + 1);
    row.appendChild(rank);

    var title = document.createElement('span');
    title.className = 'zhs-title';
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
    subEl.textContent = '实时知乎热搜榜 · 共 ' + list.length + ' 条';

    var wrap = document.createElement('div');
    wrap.className = 'zhs-list';
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
    setStatus('正在加载知乎热搜…');
    refreshBtn.disabled = true;
    fetch('https://www.oiapi.net/api/ZhiHuHot')
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
