/* 五行穿衣：调用 OIAPI FiveElementsDressingGuide，查询每日五行穿衣指南（娱乐用） */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createFiveElementDressing = function (container) {
  function todayStr() {
    var d = new Date();
    var m = ('0' + (d.getMonth() + 1)).slice(-2);
    var day = ('0' + d.getDate()).slice(-2);
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  container.innerHTML = `
    <div class="tool-card fed-card">
      <div class="fed-head">
        <h3 class="tool-title">五行穿衣 🌈</h3>
        <p class="fed-sub">每日五行属性与宜穿颜色指南（娱乐请勿当真）</p>
      </div>
      <div class="fed-controls">
        <label class="fed-label-inline" for="fedDate">日期</label>
        <input class="tool-input fed-date" id="fedDate" type="date" value="${todayStr()}" />
        <button class="tool-btn primary" id="fedQueryBtn">查询</button>
        <button class="tool-btn" id="fedCopyBtn">复制指南</button>
      </div>
      <div class="fed-result" id="fedResult">
        <div class="tool-empty">
          <div class="tool-empty-icon">👕</div>
          <p>正在加载今日穿衣指南…</p>
        </div>
      </div>
      <div class="fed-status" id="fedStatus"></div>
    </div>`;

  var dateEl = container.querySelector('#fedDate');
  var queryBtn = container.querySelector('#fedQueryBtn');
  var copyBtn = container.querySelector('#fedCopyBtn');
  var resultEl = container.querySelector('#fedResult');
  var statusEl = container.querySelector('#fedStatus');
  var currentMsg = '';

  function setStatus(msg, type) {
    statusEl.textContent = msg || '';
    statusEl.className = 'fed-status' + (type ? ' ' + type : '');
  }

  function colorGroup(title, obj, cls) {
    var keys = obj ? Object.keys(obj) : [];
    if (!keys.length) return '';
    var items = keys
      .map(function (k) {
        var hex = obj[k];
        return `
          <div class="fed-swatch">
            <div class="fed-chip ${cls}" style="background:${escapeHtml(hex)}"></div>
            <div class="fed-meta">
              <span class="fed-name">${escapeHtml(k)}</span>
              <span class="fed-hex">${escapeHtml(hex)}</span>
            </div>
          </div>`;
      })
      .join('');
    return `
      <div class="fed-group">
        <div class="fed-group-title ${cls}">${title}</div>
        <div class="fed-colors">${items}</div>
      </div>`;
  }

  function render(d, message) {
    currentMsg = message || d.description || '';
    resultEl.innerHTML = `
      <div class="fed-day">今日五行：<span class="fed-element">${escapeHtml(d.day_element)}</span>
        <span class="fed-date-tag">${escapeHtml(d.date)}</span></div>
      ${colorGroup('大吉颜色 · 相生', d.best_colors, 'best')}
      ${colorGroup('次吉颜色 · 相助', d.good_colors, 'good')}
      ${colorGroup('不宜颜色 · 相克', d.avoid_colors, 'avoid')}
      <div class="fed-desc"><span class="fed-label">穿衣建议</span>${escapeHtml(d.description)}</div>`;
    if (window.DaibaoMotion && window.DaibaoMotion.onContentChange) {
      try {
        window.DaibaoMotion.onContentChange(resultEl);
      } catch (e) {
        /* 动效异常不影响功能 */
      }
    }
  }

  function query(dateStr) {
    setStatus('查询中…');
    queryBtn.disabled = true;
    var url =
      'https://www.oiapi.net/api/FiveElementsDressingGuide' +
      (dateStr ? '?date=' + encodeURIComponent(dateStr) : '');
    fetch(url)
      .then(function (r) {
        return r.json();
      })
      .then(function (json) {
        if (!json || json.code !== 1 || !json.data) {
          throw new Error((json && json.message) || '返回数据异常');
        }
        render(json.data, json.message);
        setStatus(json.data.date + ' 五行穿衣指南已更新', 'ok');
      })
      .catch(function (err) {
        resultEl.innerHTML = `
          <div class="tool-empty">
            <div class="tool-empty-icon">⚠️</div>
            <p>查询失败，请稍后重试</p>
          </div>`;
        setStatus('查询失败：' + err.message, 'warn');
      })
      .finally(function () {
        queryBtn.disabled = false;
      });
  }

  queryBtn.addEventListener('click', function () {
    query(dateEl.value);
  });
  copyBtn.addEventListener('click', function () {
    if (!currentMsg) {
      setStatus('先查询再复制哦', 'warn');
      return;
    }
    window.DaibaoTools.copyWithFeedback(currentMsg, copyBtn);
  });

  // 进入页面自动加载今日指南
  query(todayStr());
};
