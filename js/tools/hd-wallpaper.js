/* 高清背景图：1600×900 壁纸，支持 16 个分类切换、随机换图与下载
 * 接口 https://api.zxki.cn/api/gqbjt（酷酷 API，免 key）
 *
 * ⚠️ 三个实测结论，改动前务必读完（2026-09-11 修正）：
 * 1. 接口不是「直出 JPEG」，而是 **302 重定向**到 360 图床 http://p*.qhimg.com/bdm/1600_900_85/*.jpg
 *    （图床同时支持 https，Chrome 会自动升级，实测可显示）。
 * 2. 响应里 **没有任何 Access-Control-Allow-Origin 头**，所以：
 *    - 绝对不能用 fetch / XHR 取图 → 浏览器直接抛 TypeError: Failed to fetch；
 *    - 只能用 <img src> 直接加载（img 标签是「no-cors」资源，不受同源策略限制）。
 * 3. 图床无 CORS ⇒ canvas 一旦 drawImage 就被跨域污染，toBlob 抛 SecurityError，
 *    所以下载按钮必须 try/catch，失败时降级为「新标签打开 + 右键另存为」。
 *
 * 另：接口每次调用返回的是随机图，响应头 no-store；但 CDN 侧按 URL 缓存，
 *    仍保留 &_t= cache-buster 保证「换一张」必换。
 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createHdWallpaper = function (container) {
  var API = 'https://api.zxki.cn/api/gqbjt';
  var CATS = [
    '爱情', '风景', '清新', '动漫', '明星', '萌宠', '游戏', '汽车',
    '时尚', '美女', '日历', '影视', '军事', '体育', '萌娃', '格言',
  ];
  var TIMEOUT = 25000;

  container.innerHTML = `
    <div class="xmwp-card">
      <div class="xmwp-head">
        <h2 class="xmwp-title">🖼️ 高清背景图</h2>
        <p class="xmwp-sub">1600×900 高清壁纸，选择分类后点击「换一张」随机切换；图源未开放跨域下载，保存请用右键「图片另存为」</p>
      </div>
      <div class="xmwp-toolbar">
        <label class="xmwp-label" for="hdwCat">分类</label>
        <select class="tool-select hdw-select" id="hdwCat"></select>
        <button class="tool-btn tool-btn-primary" id="hdwNext">换一张</button>
        <button class="tool-btn" id="hdwDown" hidden>保存图片</button>
        <a class="tool-btn hdw-open" id="hdwOpen" target="_blank" rel="noopener noreferrer" hidden>新标签打开</a>
      </div>
      <div class="hdw-stage" id="hdwStage">
        <img class="hdw-img" id="hdwImg" alt="高清背景图" referrerpolicy="no-referrer" />
        <div class="hdw-mask" id="hdwMask" hidden>
          <div class="hdw-spinner"></div>
          <span class="hdw-mask-text">正在加载高清图…</span>
        </div>
        <div class="hdw-error" id="hdwError" hidden></div>
      </div>
      <div class="hdw-meta" id="hdwMeta" hidden></div>
    </div>`;

  var catSel = container.querySelector('#hdwCat');
  var nextBtn = container.querySelector('#hdwNext');
  var downBtn = container.querySelector('#hdwDown');
  var openLink = container.querySelector('#hdwOpen');
  var img = container.querySelector('#hdwImg');
  var mask = container.querySelector('#hdwMask');
  var errBox = container.querySelector('#hdwError');
  var meta = container.querySelector('#hdwMeta');

  CATS.forEach(function (c) {
    var o = document.createElement('option');
    o.value = c;
    o.textContent = c;
    catSel.appendChild(o);
  });

  var state = { cat: '风景', seq: 0, loading: false, w: 0, h: 0, apiUrl: '', timer: 0 };

  function notifyMotion(node) {
    if (window.DaibaoMotion && window.DaibaoMotion.onContentChange) {
      try { window.DaibaoMotion.onContentChange(node || container); } catch (e) { /* 忽略 */ }
    }
  }

  function setBusy(on) {
    state.loading = on;
    nextBtn.disabled = on;
    catSel.disabled = on;
    mask.hidden = !on;
  }

  function showError(msg) {
    errBox.textContent = msg || '加载失败，请稍后重试';
    errBox.hidden = false;
    img.hidden = true;
  }

  function clearError() {
    errBox.hidden = true;
    img.hidden = false;
  }

  // 每次请求带独立 _t：CDN 按 URL 缓存，不加则「换一张」可能拿到同一张图
  function buildUrl() {
    state.seq++;
    return API + '?msg=' + encodeURIComponent(state.cat) + '&_t=' + Date.now() + '_' + state.seq;
  }

  function load() {
    if (state.loading) return;
    clearError();
    setBusy(true);
    downBtn.hidden = true;
    openLink.hidden = true;
    meta.hidden = true;

    var url = buildUrl();
    state.apiUrl = url;

    clearTimeout(state.timer);
    state.timer = setTimeout(function () {
      img.onload = null;
      img.onerror = null;
      showError('加载超时，可能是网络较慢或图源不可用，请重试');
      setBusy(false);
    }, TIMEOUT);

    img.onload = function () {
      clearTimeout(state.timer);
      img.onload = null;
      img.onerror = null;
      state.w = img.naturalWidth;
      state.h = img.naturalHeight;
      meta.textContent = state.cat + ' · ' + state.w + '×' + state.h;
      meta.hidden = false;
      downBtn.hidden = false;
      openLink.hidden = false;
      openLink.href = state.apiUrl;
      setBusy(false);
      notifyMotion(container);
    };

    img.onerror = function () {
      clearTimeout(state.timer);
      img.onload = null;
      img.onerror = null;
      showError('图片加载失败，可能是该分类暂无图或图源被拦截，换个分类再试');
      setBusy(false);
    };

    // 关键：不走 fetch（图源无 CORS 头，fetch 必抛 Failed to fetch），由 <img> 自行跟随 302
    img.src = url;
  }

  catSel.addEventListener('change', function () {
    state.cat = catSel.value;
    load();
  });

  nextBtn.addEventListener('click', function () { load(); });

  downBtn.addEventListener('click', function () {
    if (!state.w) return;
    try {
      var c = document.createElement('canvas');
      c.width = state.w;
      c.height = state.h;
      c.getContext('2d').drawImage(img, 0, 0);
      c.toBlob(function (blob) {
        if (!blob) throw new Error('empty');
        var u = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = u;
        a.download = 'HD-' + state.cat + '-' + state.w + 'x' + state.h + '-' + Date.now() + '.jpg';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(u); }, 30000);
      }, 'image/jpeg', 0.95);
    } catch (e) {
      // 跨域污染：canvas.toBlob 抛 SecurityError，降级为新标签打开由用户右键另存
      window.open(state.apiUrl, '_blank', 'noopener');
      meta.textContent = '图源未开放跨域权限，已在新标签打开，请右键「图片另存为」保存';
      meta.hidden = false;
    }
  });

  load();
  notifyMotion(container);
};
