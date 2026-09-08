/* 答案之书：调用 OIAPI BOfA，随机翻出一句答案（娱乐用） */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createAnswerBook = function (container) {
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  container.innerHTML = `
    <div class="tool-card aob-card">
      <div class="aob-head">
        <h3 class="tool-title">答案之书 📖</h3>
        <p class="aob-sub">心里默念一个问题，翻开书页，让宇宙给你一句答案（娱乐请勿当真）</p>
      </div>
      <div class="aob-stage" id="aobStage">
        <div class="aob-question">心里默念一个问题……</div>
        <button class="tool-btn primary aob-open" id="aobOpenBtn">🎲 翻开答案之书</button>
      </div>
      <div class="aob-result" id="aobResult" hidden></div>
      <div class="aob-status" id="aobStatus"></div>
    </div>`;

  var stageEl = container.querySelector('#aobStage');
  var resultEl = container.querySelector('#aobResult');
  var statusEl = container.querySelector('#aobStatus');
  var openBtn = container.querySelector('#aobOpenBtn');
  var currentText = '';

  function setStatus(msg, type) {
    statusEl.textContent = msg || '';
    statusEl.className = 'aob-status' + (type ? ' ' + type : '');
  }

  function flip() {
    setStatus('正在翻开书页…');
    openBtn.disabled = true;
    fetch('https://www.oiapi.net/api/BOfA')
      .then(function (r) {
        return r.json();
      })
      .then(function (json) {
        if (!json || json.code !== 1 || !json.data) {
          throw new Error((json && json.message) || '返回数据异常');
        }
        var d = json.data;
        var zh = d.zh || '';
        var en = d.en || '';
        currentText = (zh + (en ? '\n' + en : '')).trim();
        resultEl.hidden = false;
        stageEl.hidden = true;
        // 先重置动画类再触发，保证每次重抽都有翻牌效果
        resultEl.classList.remove('aob-flip');
        void resultEl.offsetWidth;
        resultEl.classList.add('aob-flip');
        resultEl.innerHTML = `
          <div class="aob-answer">${escapeHtml(zh)}</div>
          ${en ? `<div class="aob-en">${escapeHtml(en)}</div>` : ''}
          <div class="aob-actions">
            <button class="tool-btn" id="aobAgainBtn">🔄 再翻一次</button>
            <button class="tool-btn" id="aobCopyBtn">📋 复制答案</button>
          </div>`;
        container.querySelector('#aobAgainBtn').addEventListener('click', flip);
        container.querySelector('#aobCopyBtn').addEventListener('click', copyAnswer);
        if (window.DaibaoMotion && window.DaibaoMotion.onContentChange) {
          try {
            window.DaibaoMotion.onContentChange(resultEl);
          } catch (e) {
            /* 动效异常不影响功能 */
          }
        }
        setStatus('答案已呈现', 'ok');
      })
      .catch(function (err) {
        setStatus('翻开失败：' + err.message, 'warn');
      })
      .finally(function () {
        openBtn.disabled = false;
      });
  }

  function copyAnswer() {
    if (!currentText) {
      setStatus('先翻开书页再复制哦', 'warn');
      return;
    }
    window.DaibaoTools.copyWithFeedback(currentText, null);
    setStatus('答案已复制到剪贴板', 'ok');
  }

  openBtn.addEventListener('click', flip);
};
