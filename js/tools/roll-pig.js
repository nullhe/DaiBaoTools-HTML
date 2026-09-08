/* 你是小猪：调用 OIAPI RollPig 接口随机返回一只小猪的答案 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createRollPig = function (container) {
  container.innerHTML = `
    <div class="tool-card rp-card">
      <div class="rp-head">
        <h3 class="tool-title">你是小猪 🐷</h3>
        <p class="rp-sub">点击下方按钮，随机抽一只属于你的小猪，看看你是哪只猪~</p>
      </div>
      <div class="rp-actions">
        <button class="tool-btn primary" id="rpRollBtn">🎲 抽一只小猪</button>
        <button class="tool-btn" id="rpDlBtn" style="display:none">⬇ 保存图片</button>
      </div>
      <div class="rp-result" id="rpResult">
        <div class="tool-empty">
          <div class="tool-empty-icon">🐽</div>
          <p>还没有抽哦，点上面的按钮试试~</p>
        </div>
      </div>
      <div class="rp-status" id="rpStatus"></div>
    </div>`;

  var rollBtn = container.querySelector('#rpRollBtn');
  var dlBtn = container.querySelector('#rpDlBtn');
  var resultEl = container.querySelector('#rpResult');
  var statusEl = container.querySelector('#rpStatus');
  var current = null; // 当前抽中的 { image, name }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setStatus(msg, type) {
    statusEl.textContent = msg || '';
    statusEl.className = 'rp-status' + (type ? ' ' + type : '');
  }

  function downloadImage(url, name) {
    fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.blob();
      })
      .then(function (blob) {
        var ext = 'jpg';
        var ct = blob.type || '';
        if (ct.indexOf('png') > -1) ext = 'png';
        else if (ct.indexOf('webp') > -1) ext = 'webp';
        else if (ct.indexOf('gif') > -1) ext = 'gif';
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = (name || 'pig') + '.' + ext;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () {
          URL.revokeObjectURL(a.href);
        }, 1000);
        window.DaibaoTools.toast('图片已开始下载');
      })
      .catch(function () {
        // 跨域或网络异常时降级：新标签打开供手动另存
        window.open(url, '_blank', 'noopener');
        window.DaibaoTools.toast('已新标签打开，可右键图片另存为');
      });
  }

  function render(data) {
    current = { image: data.image, name: data.name };
    dlBtn.style.display = '';
    resultEl.innerHTML = `
      <div class="rp-pig">
        <div class="rp-img-wrap">
          <img class="rp-img" src="${data.image}" alt="${escapeHtml(data.name)}" referrerpolicy="no-referrer" />
        </div>
        <div class="rp-info">
          <div class="rp-name">${escapeHtml(data.name)}</div>
          <div class="rp-desc">${escapeHtml(data.description)}</div>
          <div class="rp-analysis"><span class="rp-label">猪生解析</span>${escapeHtml(data.analysis)}</div>
        </div>
      </div>`;

    // 交回动效层处理入场动画
    if (window.DaibaoMotion && window.DaibaoMotion.onContentChange) {
      try {
        window.DaibaoMotion.onContentChange(resultEl);
      } catch (e) {
        /* 动效异常不影响功能 */
      }
    }
  }

  function roll() {
    setStatus('正在抽取小猪…');
    rollBtn.disabled = true;
    fetch('https://www.oiapi.net/api/RollPig?method=random')
      .then(function (r) {
        return r.json();
      })
      .then(function (json) {
        if (!json || json.code !== 1 || !json.data) {
          throw new Error((json && json.message) || '返回数据异常');
        }
        render(json.data);
        setStatus('抽中：' + json.data.name, 'ok');
      })
      .catch(function (err) {
        setStatus('抽取失败：' + err.message, 'warn');
      })
      .finally(function () {
        rollBtn.disabled = false;
      });
  }

  rollBtn.addEventListener('click', roll);
  dlBtn.addEventListener('click', function () {
    if (current) downloadImage(current.image, current.name);
    else setStatus('先抽一只小猪再保存哦', 'warn');
  });
};
