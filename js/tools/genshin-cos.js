/* 米游社原神COS：浏览米游社社区原神 COS 作品，按时间线翻页（OIAPI / MihoyoCos） */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createGenshinCos = function (container) {
  container.innerHTML = `
    <div class="xmwp-card">
      <div class="xmwp-head">
        <h2 class="xmwp-title">🎭 米游社原神COS</h2>
        <p class="xmwp-sub">来自米游社社区的原神 COS 作品，按时间线浏览，点击任意图片查看大图</p>
      </div>
      <div class="xmwp-toolbar">
        <button class="tool-btn" id="gcosRefresh">刷新</button>
        <button class="tool-btn tool-btn-primary" id="gcosMore">加载更多</button>
      </div>
      <div class="gcos-feed" id="gcosFeed"></div>
      <div class="gcos-status" id="gcosStatus">
        <div class="xmwp-loading">正在拉取作品…</div>
      </div>
    </div>
  `;

  var refreshBtn = container.querySelector('#gcosRefresh');
  var moreBtn = container.querySelector('#gcosMore');
  var feed = container.querySelector('#gcosFeed');
  var status = container.querySelector('#gcosStatus');

  // 灯箱挂到 body，避免被祖先的 transform（动效/3D倾斜）影响导致 fixed 定位偏移
  document.querySelectorAll('.xmwp-lightbox').forEach(function (n) { n.remove(); });
  var light = document.createElement('div');
  light.className = 'xmwp-lightbox';
  light.hidden = true;
  light.innerHTML = `
    <div class="xmwp-light-backdrop"></div>
    <div class="xmwp-light-box">
      <button class="xmwp-light-close" aria-label="关闭">×</button>
      <img class="xmwp-light-img" alt="COS 大图" referrerpolicy="no-referrer" />
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

  var state = { page: 1, loading: false, finished: false };
  var seen = new Set(); // 翻页去重：created|title 作为唯一标识
  var LIMIT = 10;

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

  function relTime(sec) {
    if (!sec) return '';
    var diff = Math.floor(Date.now() / 1000) - sec;
    if (diff < 60) return '刚刚';
    if (diff < 3600) return Math.floor(diff / 60) + ' 分钟前';
    if (diff < 86400) return Math.floor(diff / 3600) + ' 小时前';
    if (diff < 86400 * 30) return Math.floor(diff / 86400) + ' 天前';
    var d = new Date(sec * 1000);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function loadPage(reset) {
    if (state.loading) return;
    if (reset) {
      state.page = 1;
      state.finished = false;
      feed.innerHTML = '';
      seen = new Set();
    }
    if (state.finished) return;

    state.loading = true;
    moreBtn.disabled = true;
    refreshBtn.disabled = true;
    setStatus('<div class="xmwp-loading">正在加载第 ' + state.page + ' 页…</div>');

    var url = 'https://www.oiapi.net/api/MihoyoCos?page=' + state.page + '&limit=' + LIMIT;
    fetch(url)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (json) {
        if (json.code !== 1 || !Array.isArray(json.data)) {
          state.finished = true;
          setStatus(reset
            ? '<div class="tool-empty"><div class="tool-empty-icon">🎭</div><h3>暂无可展示的作品</h3><p>稍后重试或点击刷新</p></div>'
            : '<div class="xmwp-end">没有更多了</div>');
          return;
        }
        var posts = json.data;
        var added = 0;
        posts.forEach(function (post) {
          var key = (post.created || '') + '|' + (post.title || '');
          if (seen.has(key)) return;
          seen.add(key);
          feed.appendChild(buildPost(post));
          added++;
        });
        notifyMotion(feed);
        if (posts.length === 0 || added === 0) {
          state.finished = true;
          setStatus(reset
            ? '<div class="tool-empty"><div class="tool-empty-icon">🎭</div><h3>暂无可展示的作品</h3><p>稍后重试或点击刷新</p></div>'
            : '<div class="xmwp-end">没有更多了</div>');
        } else {
          state.page++;
          setStatus(added < posts.length
            ? '<div class="xmwp-end">已过滤重复作品，没有更多了</div>'
            : '');
        }
      })
      .catch(function (err) {
        state.finished = false;
        setStatus(reset
          ? '<div class="tool-empty"><div class="tool-empty-icon">⚠️</div><h3>加载失败</h3><p>' + (err.message || '网络或跨域读取失败') + '</p></div>'
          : '<div class="xmwp-end">加载出错，可点击下方按钮重试</div>');
      })
      .finally(function () {
        state.loading = false;
        moreBtn.disabled = state.finished;
        refreshBtn.disabled = false;
      });
  }

  function buildPost(post) {
    var card = el('div', 'gcos-post');

    // 头部：作者 + 时间
    var head = el('div', 'gcos-head');
    var avatar = el('img', 'gcos-avatar');
    avatar.src = (post.user && post.user.avatar_url) || '';
    avatar.alt = (post.user && post.user.nickname) || '作者';
    avatar.loading = 'lazy';
    avatar.referrerPolicy = 'no-referrer';
    avatar.onerror = function () { avatar.style.visibility = 'hidden'; };
    var meta = el('div', 'gcos-meta');
    meta.appendChild(el('span', 'gcos-nick', (post.user && post.user.nickname) || '匿名'));
    meta.appendChild(el('span', 'gcos-time', relTime(post.created)));
    head.appendChild(avatar);
    head.appendChild(meta);
    card.appendChild(head);

    // 标题
    if (post.title) card.appendChild(el('div', 'gcos-title', post.title));

    // 正文（多为 #标签 话题，作为副信息）
    if (post.content && post.content !== post.title) {
      var c = el('div', 'gcos-content', post.content);
      c.title = post.content;
      card.appendChild(c);
    }

    // 图片网格
    var imgs = Array.isArray(post.images) ? post.images : [];
    if (imgs.length) {
      var grid = el('div', 'gcos-imgs');
      imgs.forEach(function (img) {
        var url = (img && img.url) || '';
        if (!url) return;
        var cell = el('button', 'gcos-img');
        cell.type = 'button';
        // 用真实宽高比避免封面被压扁
        if (img.width && img.height) cell.style.aspectRatio = (img.width / img.height).toFixed(4);
        var im = el('img');
        im.src = url;
        im.alt = post.title || 'COS 图';
        im.loading = 'lazy';
        im.referrerPolicy = 'no-referrer';
        im.onerror = function () {
          cell.textContent = '🖼️';
          cell.classList.add('gcos-img-fallback');
        };
        cell.appendChild(im);
        cell.addEventListener('click', function () { openLight(url, post.title || 'COS 图'); });
        grid.appendChild(cell);
      });
      card.appendChild(grid);
    }

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

  refreshBtn.addEventListener('click', function () { loadPage(true); });
  moreBtn.addEventListener('click', function () { loadPage(false); });

  loadPage(true);
  notifyMotion(container);
};
