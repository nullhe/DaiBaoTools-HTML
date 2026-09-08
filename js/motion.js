/**
 * 呆宝工具箱 - 交互动效层
 *
 * 与 css/motion.css 配套，负责纯 CSS 做不到的部分：
 *   1. 水波纹（需要知道点击坐标）
 *   2. 数字滚动（需要插值）
 *   3. 导航滑动指示条（需要读取元素位置）
 *   4. 光标柔光、顶栏滚动阴影
 *   5. 统计卡 3D 倾斜
 *   6. 主题切换与持久化
 *
 * 设计约束：
 *   - 零依赖，file:// 双击可用
 *   - 尊重 prefers-reduced-motion，开启时全部降级为无动画
 *   - 工具内容由 app.js 动态重建，因此所有增强都通过 onContentChange() 重新挂载
 */
(function (window, document) {
  'use strict';

  var CONFIG = {
    // 数字滚动
    countUp: true,
    countUpDuration: 420,
    // 两次变化间隔小于此值视为「实时输入」，跳过滚动动画，避免打字时数字乱跳
    countUpQuietMs: 160,

    // 水波纹
    ripple: true,

    // 光标柔光
    cursorGlow: true,

    // 统计卡 3D 倾斜最大角度
    tiltMaxDeg: 4,

    // 主题：'light' | 'dark' | 'auto'
    defaultTheme: 'light'
  };

  var THEME_KEY = 'daibao.theme';
  var reduceMotion = false;

  try {
    reduceMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {
    reduceMotion = false;
  }

  /* ================================ 工具函数 ================================ */

  function raf(fn) {
    return window.requestAnimationFrame ? window.requestAnimationFrame(fn) : window.setTimeout(fn, 16);
  }

  function readStore(key, fallback) {
    try {
      var v = window.localStorage.getItem(key);
      return v === null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }

  function writeStore(key, val) {
    try {
      window.localStorage.setItem(key, val);
    } catch (e) {
      /* file:// 下可能被禁用，忽略 */
    }
  }

  /* ================================ 1. 水波纹 ================================ */

  var RIPPLE_SELECTOR =
    '.tool-btn, .vat-submit, .nav-item, .sub-nav-item, .effect-toggle, .theme-toggle';

  function spawnRipple(host, x, y) {
    if (!CONFIG.ripple || reduceMotion) return;

    var rect = host.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height);
    var radius = size / 2;

    // 圆心用点击位置，视觉效果更自然；host 需要非 static 才能正确定位
    var cx = x - rect.left;
    var cy = y - rect.top;

    var el = document.createElement('span');
    el.className = 'ripple';
    el.style.width = el.style.height = size + 'px';
    el.style.left = cx - radius + 'px';
    el.style.top = cy - radius + 'px';

    host.appendChild(el);
    window.setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 560);
  }

  /**
   * 复制按钮统一加打勾反馈。
   * 用事件委托而不改各工具代码：凡是文案里带「复制」的按钮，点击后自动闪 ✓。
   * 新工具也可以直接调 DaibaoTools.copyWithFeedback(text, btn) 精确控制。
   */
  function initCopyFeedback() {
    document.addEventListener(
      'click',
      function (e) {
        var btn = e.target && e.target.closest ? e.target.closest('button, .tool-btn') : null;
        if (!btn || btn.disabled) return;
        var label = (btn.textContent || '').trim();
        if (label.indexOf('复制') === -1) return;
        flashOk(btn);
      },
      false
    );
  }

  function initRipple() {
    // 静态元素：加 relative，保证水波纹定位正确
    document.addEventListener(
      'pointerdown',
      function (e) {
        var host = e.target && e.target.closest ? e.target.closest(RIPPLE_SELECTOR) : null;
        if (!host) return;
        if (host.disabled) return;
        if (!host.classList.contains('ripple-host')) host.classList.add('ripple-host');
        spawnRipple(host, e.clientX, e.clientY);
      },
      { passive: true }
    );
  }

  /* ================================ 2. 数字滚动 ================================ */

  // 从文本中拆出「前缀 + 数字 + 后缀」，例如 ¥1,234.56 元
  var NUM_RE = /-?\d[\d,]*\.?\d*/;

  function countUp(el, text) {
    var match = String(text).match(NUM_RE);
    if (!match) {
      el.textContent = text;
      return;
    }

    var target = parseFloat(String(match[0]).replace(/,/g, ''));
    if (!isFinite(target)) {
      el.textContent = text;
      return;
    }

    var prefix = text.slice(0, match.index);
    var suffix = text.slice(match.index + match[0].length);
    var numStr = match[0];

    // 保留原始数字格式：小数位、千分位、正负号、前导零
    var decimals = (numStr.split('.')[1] || '').length;
    var useGroup = numStr.indexOf(',') > -1;

    if (!CONFIG.countUp || reduceMotion || target === 0) {
      el.textContent = text;
      return;
    }

    if (el.__raf) window.cancelAnimationFrame(el.__raf);

    var start = 0;
    var t0 = Date.now();
    var dur = CONFIG.countUpDuration;

    function fmt(v) {
      var s = Math.abs(v).toFixed(decimals);
      if (useGroup) {
        var parts = s.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        s = parts.join('.');
      }
      return (v < 0 ? '-' : '') + s;
    }

    function step() {
      var p = Math.min(1, (Date.now() - t0) / dur);
      // easeOutCubic
      var eased = 1 - Math.pow(1 - p, 3);
      var v = start + (target - start) * eased;
      el.textContent = prefix + fmt(v) + suffix;
      if (p < 1) {
        el.__raf = raf(step);
      } else {
        el.textContent = text;
        el.__raf = null;
      }
    }

    step();
  }

  // 记录每个元素上次变化时间，用于识别「实时输入」
  var lastChangeAt = new WeakMap();
  var lastText = new WeakMap();

  function watchNumbers(root) {
    if (!root || !window.MutationObserver) return;

    var targets = root.querySelectorAll('.tool-stat-num, .vat-result-value');
    Array.prototype.forEach.call(targets, function (el) {
      lastText.set(el, el.textContent);
    });

    var observer = new window.MutationObserver(function (records) {
      records.forEach(function (r) {
        var el = r.target.nodeType === 3 ? r.target.parentNode : r.target;
        if (!el || !el.classList) return;
        if (
          !el.classList.contains('tool-stat-num') &&
          !el.classList.contains('vat-result-value')
        ) {
          return;
        }

        var text = el.textContent;
        if (text === lastText.get(el)) return;
        lastText.set(el, text);

        var now = Date.now();
        var prev = lastChangeAt.get(el) || 0;
        lastChangeAt.set(el, now);

        // 变化过于频繁（实时输入）→ 直接显示，不做滚动
        if (now - prev < CONFIG.countUpQuietMs) {
          if (el.__raf) {
            window.cancelAnimationFrame(el.__raf);
            el.__raf = null;
          }
          return;
        }

        countUp(el, text);
      });
    });

    observer.observe(root, {
      subtree: true,
      childList: true,
      characterData: true
    });

    return observer;
  }

  /* ================================ 3. 导航滑动指示条 ================================ */

  function ensureIndicator(list) {
    if (!list) return null;
    // 用 li 而非 span，保持 ul > li 的合法结构；不用 :scope 以兼容旧内核
    var children = list.children;
    for (var i = 0; i < children.length; i++) {
      if (children[i].classList && children[i].classList.contains('nav-indicator')) {
        return children[i];
      }
    }
    var ind = document.createElement('li');
    ind.className = 'nav-indicator';
    ind.setAttribute('aria-hidden', 'true');
    list.appendChild(ind);
    return ind;
  }

  function moveIndicator(list) {
    if (!list) return;
    var active = list.querySelector('.nav-item.active, .sub-nav-item.active');
    var ind = ensureIndicator(list);
    if (!active || !ind) return;

    // offsetLeft 相对 list（list 已设 position: relative）
    var x = active.offsetLeft;
    var w = active.offsetWidth;

    ind.style.width = w + 'px';
    ind.style.transform = 'translateX(' + x + 'px)';
    ind.classList.add('is-ready');
  }

  function syncIndicators() {
    moveIndicator(document.querySelector('#mainNav .nav-list'));
    moveIndicator(document.getElementById('subNavList'));
  }

  /* ================================ 4. 光标柔光 + 顶栏阴影 ================================ */

  function initCursorGlow() {
    if (!CONFIG.cursorGlow || reduceMotion) return;
    // 触屏设备没有 hover，没必要
    if (window.matchMedia && window.matchMedia('(hover: none)').matches) return;

    var glow = document.getElementById('cursorGlow');
    if (!glow) {
      glow = document.createElement('div');
      glow.id = 'cursorGlow';
      document.body.appendChild(glow);
    }

    var tx = 0;
    var ty = 0;
    var pending = false;

    function paint() {
      pending = false;
      glow.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0)';
    }

    document.addEventListener(
      'pointermove',
      function (e) {
        tx = e.clientX;
        ty = e.clientY;
        if (!glow.classList.contains('is-active')) glow.classList.add('is-active');
        if (!pending) {
          pending = true;
          raf(paint);
        }
      },
      { passive: true }
    );

    document.addEventListener('pointerleave', function () {
      glow.classList.remove('is-active');
    });
  }

  function initHeaderShadow() {
    var header = document.querySelector('.app-header');
    if (!header) return;

    var ticking = false;
    function update() {
      ticking = false;
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      header.classList.toggle('is-scrolled', y > 4);
    }

    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          ticking = true;
          raf(update);
        }
      },
      { passive: true }
    );

    update();
  }

  /* ================================ 5. 统计卡 3D 倾斜 ================================ */

  function initTilt(root) {
    if (reduceMotion) return;
    var wraps = root.querySelectorAll('.tool-stats');
    Array.prototype.forEach.call(wraps, function (wrap) {
      if (wrap.__tiltBound) return;
      wrap.__tiltBound = true;
      wrap.classList.add('tool-tilt-wrap');

      var pending = false;
      var mx = 0;
      var my = 0;

      function paint() {
        pending = false;
        var cards = wrap.querySelectorAll('.tool-stat');
        Array.prototype.forEach.call(cards, function (card) {
          var r = card.getBoundingClientRect();
          var dx = (mx - (r.left + r.width / 2)) / (r.width / 2);
          var dy = (my - (r.top + r.height / 2)) / (r.height / 2);
          dx = Math.max(-1, Math.min(1, dx));
          dy = Math.max(-1, Math.min(1, dy));
          card.classList.add('tilt');
          card.style.transform =
            'perspective(700px) rotateX(' +
            (-dy * CONFIG.tiltMaxDeg).toFixed(2) +
            'deg) rotateY(' +
            (dx * CONFIG.tiltMaxDeg).toFixed(2) +
            'deg)';
        });
      }

      wrap.addEventListener(
        'pointermove',
        function (e) {
          mx = e.clientX;
          my = e.clientY;
          if (!pending) {
            pending = true;
            raf(paint);
          }
        },
        { passive: true }
      );

      wrap.addEventListener('pointerleave', function () {
        var cards = wrap.querySelectorAll('.tool-stat');
        Array.prototype.forEach.call(cards, function (card) {
          card.style.transform = '';
          card.classList.remove('tilt');
        });
      });
    });
  }

  /* ================================ 6. 工具内容增强入口 ================================ */

  var currentObserver = null;

  /**
   * 由 app.js 在每次渲染工具内容后调用
   * @param {HTMLElement} container 工具内容容器
   */
  function onContentChange(container) {
    if (!container) return;

    // 切换动画
    if (!reduceMotion) {
      container.classList.remove('tool-enter');
      // 强制重排以重启动画
      void container.offsetWidth;
      container.classList.add('tool-enter');
    }

    // 卡片错峰入场
    stagger(container);

    // 数字滚动监听（先断开上一个，避免泄漏）
    if (currentObserver) {
      currentObserver.disconnect();
      currentObserver = null;
    }
    currentObserver = watchNumbers(container);

    // 3D 倾斜
    initTilt(container);

    // 导航指示条（工具切换时二级导航会重建）
    syncIndicators();
  }

  function stagger(container) {
    if (reduceMotion) return;
    var groups = container.querySelectorAll('.tool-stats, .vat-result-list, .tool-output-section');
    Array.prototype.forEach.call(groups, function (g) {
      g.classList.add('stagger');
      var kids = g.children;
      Array.prototype.forEach.call(kids, function (k, i) {
        k.style.setProperty('--stagger-i', i);
      });
    });
  }

  /* ================================ 7. 主题切换 ================================ */

  function applyTheme(theme, animate) {
    var root = document.documentElement;
    if (animate && !reduceMotion) {
      root.classList.add('theme-transition');
      window.setTimeout(function () {
        root.classList.remove('theme-transition');
      }, 280);
    }

    if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');

    var btn = document.getElementById('themeToggle');
    if (btn) {
      btn.textContent = theme === 'dark' ? '☀️' : '🌙';
      btn.title = theme === 'dark' ? '切换为浅色模式' : '切换为深色模式';
    }
    writeStore(THEME_KEY, theme);
  }

  function currentTheme() {
    var stored = readStore(THEME_KEY, CONFIG.defaultTheme);
    return stored === 'dark' ? 'dark' : 'light';
  }

  function initTheme() {
    applyTheme(currentTheme(), false);
    var btn = document.getElementById('themeToggle');
    if (btn) {
      btn.addEventListener('click', function () {
        applyTheme(currentTheme() === 'dark' ? 'light' : 'dark', true);
      });
    }
  }

  /* ================================ 8. 对外小接口 ================================ */

  /** 让某个元素抖一下（校验失败时用） */
  function shake(el) {
    if (!el || reduceMotion) return;
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
    window.setTimeout(function () {
      el.classList.remove('shake');
    }, 360);
  }

  /** 让某个元素打勾闪一下（复制成功时用） */
  function flashOk(el) {
    if (!el || reduceMotion) return;
    el.classList.remove('copy-ok');
    void el.offsetWidth;
    el.classList.add('copy-ok');
    window.setTimeout(function () {
      el.classList.remove('copy-ok');
    }, 660);
  }

  /* ================================ 初始化 ================================ */

  function init() {
    initRipple();
    initCopyFeedback();
    initCursorGlow();
    initHeaderShadow();
    initTheme();
    syncIndicators();

    // 窗口尺寸变化后指示条位置会失效，重新计算
    window.addEventListener('resize', function () {
      syncIndicators();
    });

    // 顶部导航横向可滚动，滚动时指示条要跟随
    var navList = document.querySelector('#mainNav .nav-list');
    if (navList) {
      navList.addEventListener('scroll', syncIndicators, { passive: true });
    }
  }

  // app.js 同步执行渲染，主题必须在此之前生效，否则会闪一下浅色。
  // 本脚本位于 body 末尾，header / nav 已解析，可直接初始化。
  if (document.querySelector('.app-header')) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }

  window.DaibaoMotion = {
    CONFIG: CONFIG,
    onContentChange: onContentChange,
    syncIndicators: syncIndicators,
    shake: shake,
    flashOk: flashOk,
    applyTheme: applyTheme,
    isReducedMotion: function () {
      return reduceMotion;
    }
  };
})(window, document);
