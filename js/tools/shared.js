/* 各工具模块共用的小工具：复制文本、轻提示 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.copyText = function (text) {
  function fallback(t) {
    var ta = document.createElement('textarea');
    ta.value = t;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    ta.remove();
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).catch(function () {
      fallback(text);
    });
  }
  fallback(text);
  return Promise.resolve();
};

window.DaibaoTools.toast = function (msg) {
  var el = document.createElement('div');
  el.className = 'tool-toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(function () {
    el.remove();
  }, 2200);
};

/**
 * 复制文本 + 按钮打勾反馈
 * @param {string} text   要复制的内容
 * @param {HTMLElement} [btn] 触发复制的按钮，传入后会闪一个 ✓
 */
window.DaibaoTools.copyWithFeedback = function (text, btn) {
  function done() {
    if (window.DaibaoMotion && typeof window.DaibaoMotion.flashOk === 'function') {
      window.DaibaoMotion.flashOk(btn);
    } else {
      window.DaibaoTools.toast('已复制');
    }
  }
  var p = window.DaibaoTools.copyText(text);
  if (p && typeof p.then === 'function') p.then(done, done);
  else done();
  return p;
};
