/* 澎湃新闻：调用 OIAPI HotNews，展示实时澎湃新闻列表
 * 接口已实测开放 CORS（Access-Control-Allow-Origin: *），可页内直接读取。
 * 数据：data 数组，每项 { title, url, pic, time }
 *   - title 标题 / url 详情链接 / pic 封面图 / time 相对发布时间（如“18小时前”）。 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createPengPaiNews = function (container) {
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  container.innerHTML = `
    <div class="tool-card ppn-card">
      <div class="ppn-head">
        <h3 class="tool-title">🌊 澎湃新闻</h3>
        <p class="ppn-sub" id="ppnSub">实时澎湃新闻</p>
      </div>
      <div class="ppn-controls">
        <button class="tool-btn primary" id="ppnRefreshBtn">刷新</button>
      </div>
      <div class="ppn-result" id="ppnResult">
        <div class="tool-empty">
          <div class="tool-empty-icon">🌊</div>
          <p>正在加载澎湃新闻…</p>
        </div>
      </div>
      <div class="ppn-status" id="ppnStatus"></div>
    </div>`;

  var refreshBtn = container.querySelector('#ppnRefreshBtn');
  var resultEl = container.querySelector('#ppnResult');
  var statusEl = container.querySelector('#ppnStatus');
  var subEl = container.querySelector('#ppnSub');

  function setStatus(msg, type) {
    statusEl.textContent = msg || '';
    statusEl.className = 'ppn-status' + (type ? ' ' + type : '');
  }

  function buildCover(pic) {
    if (!pic) return null;
    var img = document.createElement('img');
    img.className = 'ppn-cover';
    img.alt = 'cover';
    img.loading = 'lazy';
    img.referrerPolicy = 'no-referrer';
    img.src = pic;
    img.addEventListener('error', function () {
      if (img.parentNode) img.parentNode.removeChild(img);
    });
    return img;
  }

  function buildRow(it, idx) {
    var row = document.createElement('div');
    row.className = 'ppn-item';

    var rank = document.createElement('span');
    rank.className = 'ppn-rank rank-' + (idx < 3 ? idx + 1 : 'n');
    rank.textContent = String(idx + 1);
    row.appendChild(rank);

    var main = document.createElement('div');
    main.className = 'ppn-main';

    var a = document.createElement('a');
    a.className = 'ppn-title';
    a.href = it.url || '#';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = it.title || '(无标题)';
    main.appendChild(a);

    if (it.time) {
      var time = document.createElement('span');
      time.className = 'ppn-time';
      time.textContent = '🕒 ' + it.time;
      main.appendChild(time);
    }
    row.appendChild(main);

    var cover = buildCover(it.pic);
    if (cover) row.appendChild(cover);

    return row;
  }

  function render(d) {
    var list = d.data || [];
    resultEl.innerHTML = '';
    if (!list.length) {
      resultEl.innerHTML = '<div class="tool-empty"><p>暂无可展示的新闻</p></div>';
      return;
    }
    subEl.textContent = '实时澎湃新闻 · 共 ' + list.length + ' 条';

    var wrap = document.createElement('div');
    wrap.className = 'ppn-list';
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
    setStatus('正在加载澎湃新闻…');
    refreshBtn.disabled = true;
    fetch('https://www.oiapi.net/api/HotNews')
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
