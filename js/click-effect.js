/**
 * 鼠标点击特效（原生实现，无 jQuery 依赖）
 *
 * 效果：点击页面任意位置，在光标处冒出一个文字，向上飘升并淡出。
 * 原版基于 jQuery 的 $().animate()，这里改用 CSS Animation 实现，
 * 由 GPU 合成，不占用 JS 主线程，性能更好。
 *
 * 配置项集中在 CONFIG 里，改词库、配色、动画时长都在这里。
 */
(function (window, document) {
  'use strict';

  var CONFIG = {
    // 冒出来的文字库（按顺序循环）
    words: ['富强', '民主', '和谐', '文明', '自由', '平等', '公正', '法治', '爱国', '敬业', '诚信', '友善'],

    // 候选配色，每次随机取一个。第一个是原版配色 rgb(72,85,137)
    colors: [
      '#485589', '#e15b64', '#f47e60', '#f8b26a', '#abbd81',
      '#849b87', '#4f86c6', '#9b6bc4', '#e0669b', '#2fa8a0'
    ],

    // 动画时长（毫秒），需与 css 中 .click-effect-item 的 animation-duration 保持一致
    duration: 1500,

    // 上飘距离（像素）
    rise: 160,

    // 字号范围（像素），随机取值让视觉更有层次
    minFontSize: 15,
    maxFontSize: 21,

    // 同时在场的文字上限，防止狂点导致 DOM 堆积
    maxAlive: 30,

    // 在输入框 / 文本域 / 下拉框里点击时不触发（工具站输入框多，避免干扰输入）
    skipFormFields: true,

    // 是否记住开关状态（存 localStorage）
    remember: true
  };

  var STORAGE_KEY = 'daibao.clickEffect.enabled';
  var enabled = true;
  var idx = 0;
  var alive = 0;

  /* ---------------------------------- 工具函数 ---------------------------------- */

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pick(arr) {
    return arr[randInt(0, arr.length - 1)];
  }

  function readEnabled() {
    if (!CONFIG.remember) return true;
    try {
      var v = window.localStorage.getItem(STORAGE_KEY);
      return v === null ? true : v === '1';
    } catch (e) {
      // file:// 下部分浏览器禁用 localStorage，忽略即可
      return true;
    }
  }

  function saveEnabled(v) {
    if (!CONFIG.remember) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, v ? '1' : '0');
    } catch (e) {
      /* 忽略 */
    }
  }

  function isFormField(el) {
    if (!el || !el.tagName) return false;
    var tag = el.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
    // contenteditable 元素也算输入区
    return el.isContentEditable === true;
  }

  /* ---------------------------------- 核心：冒一个字 ---------------------------------- */

  function spawn(x, y) {
    if (alive >= CONFIG.maxAlive) return;

    var word = CONFIG.words[idx % CONFIG.words.length];
    idx = (idx + 1) % CONFIG.words.length;

    var span = document.createElement('span');
    span.className = 'click-effect-item';
    span.textContent = word;

    var size = randInt(CONFIG.minFontSize, CONFIG.maxFontSize);
    // 水平随机漂移，让连续点击的字不完全重叠
    var drift = randInt(-28, 28);

    span.style.left = x + 'px';
    span.style.top = y - 20 + 'px';
    span.style.fontSize = size + 'px';
    span.style.color = pick(CONFIG.colors);
    span.style.setProperty('--ce-drift', drift + 'px');

    document.body.appendChild(span);
    alive++;

    // 动画结束后移除；setTimeout 兜底，防止 animationend 因标签页切后台不触发
    var removed = false;
    function remove() {
      if (removed) return;
      removed = true;
      alive--;
      if (span.parentNode) span.parentNode.removeChild(span);
    }
    span.addEventListener('animationend', remove);
    window.setTimeout(remove, CONFIG.duration + 300);
  }

  /* ---------------------------------- 事件绑定 ---------------------------------- */

  function shouldSkip(e) {
    if (!enabled) return true;
    // 只响应鼠标左键
    if (e.button !== undefined && e.button !== 0) return true;
    // 点开关按钮本身不冒字
    if (e.target && e.target.closest && e.target.closest('#clickEffectToggle')) return true;
    if (CONFIG.skipFormFields && isFormField(e.target)) return true;
    return false;
  }

  function onPointerDown(e) {
    if (shouldSkip(e)) return;
    spawn(e.clientX, e.clientY);
  }

  function onTouchStart(e) {
    if (!enabled) return;
    if (e.target && e.target.closest && e.target.closest('#clickEffectToggle')) return;
    if (CONFIG.skipFormFields && isFormField(e.target)) return;
    var t = e.touches && e.touches[0];
    if (!t) return;
    spawn(t.clientX, t.clientY);
  }

  /* ---------------------------------- 对外接口 ---------------------------------- */

  var ClickEffect = {
    /** 开启特效 */
    enable: function () {
      enabled = true;
      saveEnabled(true);
      document.body.classList.remove('click-effect-off');
      syncButton();
    },
    /** 关闭特效 */
    disable: function () {
      enabled = false;
      saveEnabled(false);
      document.body.classList.add('click-effect-off');
      syncButton();
    },
    /** 切换开关，返回切换后的状态 */
    toggle: function () {
      if (enabled) ClickEffect.disable();
      else ClickEffect.enable();
      return enabled;
    },
    /** 当前是否开启 */
    isEnabled: function () {
      return enabled;
    }
  };

  /* ---------------------------------- 开关按钮 ---------------------------------- */

  function syncButton() {
    var btn = document.getElementById('clickEffectToggle');
    if (!btn) return;
    btn.classList.toggle('is-off', !enabled);
    btn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    btn.title = enabled ? '点击特效：开启（点此关闭）' : '点击特效：关闭（点此开启）';
  }

  function init() {
    enabled = readEnabled();
    document.body.classList.toggle('click-effect-off', !enabled);

    // 支持 Pointer Events 的浏览器用它统一处理鼠标 + 触屏，避免两套事件重复触发
    if (window.PointerEvent) {
      document.addEventListener('pointerdown', onPointerDown, false);
    } else {
      document.addEventListener('mousedown', onPointerDown, false);
      document.addEventListener('touchstart', onTouchStart, { passive: true });
    }

    var btn = document.getElementById('clickEffectToggle');
    if (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        ClickEffect.toggle();
      });
    }
    syncButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.ClickEffect = ClickEffect;
})(window, document);
