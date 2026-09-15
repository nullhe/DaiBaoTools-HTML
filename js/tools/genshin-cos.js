/* 米游社原神COS：浏览米游社社区原神 COS 作品，手动翻页查看（OIAPI / MihoyoCos）
 * 接口 https://www.oiapi.net/api/MihoyoCos?page=N&limit=M
 *
 * 三个实测要点（2026-09-11），改动前务必读完：
 * 1. 响应带 `Access-Control-Allow-Origin: *`，免 key，可直接 fetch。
 * 2. 只有 page / limit 两个参数，返回体里**没有总数、也没有是否末页字段**；
 *    深页（如 page=100）返回的是 `code=1 + data:[]`（空数组，不是错误）。
 *    所以「末页」只能靠 `data.length < limit` 判定，跳到空页要单独提示而不是报错。
 * 3. 按需求：进入模块**默认不加载任何内容**，必须点「查询作品」才发请求；
 *    列表上方与下方各放一组联动的分页控件。
 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createGenshinCos = function (container) {
  var LIMITS = [10, 20, 30];

  var PAGER = `
    <div class="gcos-pager">
      <button class="tool-btn gcos-pgbtn" data-act="prev">上一页</button>
      <span class="gcos-pgtext">第</span>
      <input class="tool-input gcos-pginput" type="number" min="1" step="1" value="1" aria-label="页码" />
      <span class="gcos-pgtext">页</span>
      <button class="tool-btn gcos-pgbtn" data-act="next">下一页</button>
      <span class="gcos-pgcount"></span>
    </div>`;

  // 同一份模板渲染上下两组分页控件，仅 id / 初始 hidden 不同
  function pager(id) {
    return PAGER.replace('<div class="gcos-pager">', '<div class="gcos-pager" id="' + id + '" hidden>');
  }

  container.innerHTML = `
    <div class="xmwp-card">
      <div class="xmwp-head">
        <h2 class="xmwp-title">🎭 米游社原神COS</h2>
        <p class="xmwp-sub">来自米游社社区的原神 COS 作品，默认不加载内容，点击「查询作品」后按页浏览，点击任意图片查看大图</p>
      </div>
      <div class="xmwp-toolbar">
        <button class="tool-btn tool-btn-primary" id="gcosQuery">查询作品</button>
        <label class="xmwp-label" for="gcosLimit">每页</label>
        <select class="tool-select gcos-select" id="gcosLimit">
          ${LIMITS.map(function (n) { return '<option value="' + n + '">' + n + ' 条</option>'; }).join('')}
        </select>
      </div>
      ${pager('gcosPagerTop')}
      <div class="gcos-feed" id="gcosFeed"></div>
      <div class="gcos-status" id="gcosStatus"></div>
      ${pager('gcosPagerBottom')}
    </div>
  `;

  var queryBtn = container.querySelector('#gcosQuery');
  var limitSel = container.querySelector('#gcosLimit');
  var feed = container.querySelector('#gcosFeed');
  var status = container.querySelector('#gcosStatus');
  var pagers = container.querySelectorAll('.gcos-pager');

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

  var state = { page: 1, limit: LIMITS[0], loading: false, queried: false, end: true, count: 0 };

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

  function setStatus(node) {
    status.innerHTML = '';
    if (node) status.appendChild(node);
  }

  function statusNode(cls, html) {
    var d = document.createElement('div');
    d.className = cls;
    d.innerHTML = html;
    return d;
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

  // 上下两组分页控件联动：任何时候都以 state 为准刷新
  function syncPager() {
    pagers.forEach(function (p) {
      p.hidden = !state.queried;
      var prev = p.querySelector('[data-act="prev"]');
      var next = p.querySelector('[data-act="next"]');
      var input = p.querySelector('.gcos-pginput');
      var count = p.querySelector('.gcos-pgcount');
      prev.disabled = state.loading || state.page <= 1;
      next.disabled = state.loading || state.end;
      input.disabled = state.loading;
      if (input.value !== String(state.page)) input.value = String(state.page);
      count.textContent = state.count ? '本页 ' + state.count + ' 条' : '';
    });
  }

  function setBusy(on) {
    state.loading = on;
    queryBtn.disabled = on;
    limitSel.disabled = on;
    syncPager();
  }

  function goto(page) {
    if (state.loading) return;
    var n = Math.max(1, Math.floor(Number(page) || 1));
    if (state.queried && n === state.page) {
      // 同页重查视为刷新
    }
    setBusy(true);
    feed.innerHTML = '';
    setStatus(statusNode('xmwp-loading', '正在加载第 ' + n + ' 页…'));

    var url = 'https://www.oiapi.net/api/MihoyoCos?page=' + n + '&limit=' + state.limit;
    fetch(url)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (json) {
        if (json.code !== 1 || !Array.isArray(json.data)) {
          throw new Error((json && json.message) || '接口返回异常');
        }
        var posts = json.data;
        state.queried = true;
        state.page = n;
        state.count = posts.length;
        // 接口没有总数/末页字段：本页不足 limit 即认为是最后一页
        state.end = posts.length < state.limit;

        posts.forEach(function (post) { feed.appendChild(buildPost(post)); });
        notifyMotion(feed);

        if (!posts.length) {
          state.end = true;
          setStatus(statusNode('tool-empty', '<div class="tool-empty-icon">🍂</div><h3>第 ' + n + ' 页没有内容</h3><p>请回到上一页继续浏览</p>'));
        } else {
          setStatus(null);
        }
        setBusy(false);
      })
      .catch(function (err) {
        state.count = 0;
        feed.innerHTML = '';
        setStatus(statusNode('tool-empty', '<div class="tool-empty-icon">⚠️</div><h3>加载失败</h3><p>' + ((err && err.message) || '网络或跨域读取失败') + '</p>'));
        setBusy(false);
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

  // 两组分页器共用一套行为
  pagers.forEach(function (p) {
    var prev = p.querySelector('[data-act="prev"]');
    var next = p.querySelector('[data-act="next"]');
    var input = p.querySelector('.gcos-pginput');
    prev.addEventListener('click', function () { goto(state.page - 1); });
    next.addEventListener('click', function () { goto(state.page + 1); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); goto(input.value); }
    });
    input.addEventListener('change', function () { goto(input.value); });
  });

  queryBtn.addEventListener('click', function () { goto(1); });

  limitSel.addEventListener('change', function () {
    state.limit = Number(limitSel.value) || LIMITS[0];
    goto(1); // 每页条数变化后回到第 1 页，页码语义才一致
  });

  // 默认不加载：先给一个可操作的空态
  setStatus(statusNode('tool-empty', '<div class="tool-empty-icon">🎭</div><h3>尚未查询</h3><p>点击上方「查询作品」加载第 1 页内容</p>'));
  syncPager();
  notifyMotion(container);
};
