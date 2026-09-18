window.DaibaoTools = window.DaibaoTools || {};
(function () {
  'use strict';

  // 首页模块：以「网址导航」为核心重新设计的落地页。
  // 数据来自配置文件 js/data/site-nav-data.js（window.DAIBAO_SITE_NAV），纯本地、不联网、不写盘。

  var PALETTE = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function hashColor(str) {
    var h = 0; str = String(str || '');
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return PALETTE[h % PALETTE.length];
  }
  // 分类图标：内置一套干净的线性 SVG（无外部依赖），配彩色圆角徽标
  var CAT_ICONS = {
    cat_common:  '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
    cat_dev:     '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    cat_open:    '<circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/><ellipse cx="12" cy="12" rx="4" ry="9"/>',
    cat_tool:    '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.9 2.9-2-2 2.9-2.9z"/>',
    cat_mail:    '<rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/>',
    cat_ai_tool: '<rect x="6" y="6" width="12" height="12" rx="2"/><line x1="9" y1="2" x2="9" y2="6"/><line x1="15" y1="2" x2="15" y2="6"/><line x1="9" y1="18" x2="9" y2="22"/><line x1="15" y1="18" x2="15" y2="22"/><line x1="2" y1="9" x2="6" y2="9"/><line x1="2" y1="15" x2="6" y2="15"/><line x1="18" y1="9" x2="22" y2="9"/><line x1="18" y1="15" x2="22" y2="15"/>',
    cat_wangpan: '<path d="M18 18H7a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.5A4 4 0 0 1 18 18z"/>',
    cat_fun:     '<rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="4" x2="8" y2="20"/><line x1="16" y1="4" x2="16" y2="20"/>'
  };
  var CAT_COLORS = {
    cat_common: '#3b82f6', cat_dev: '#8b5cf6', cat_open: '#10b981', cat_tool: '#f59e0b',
    cat_mail: '#ef4444', cat_ai_tool: '#ec4899', cat_wangpan: '#14b8a6', cat_fun: '#f97316'
  };
  function catIconHtml(c) {
    var color = CAT_COLORS[c.id] || '#64748b';
    var inner = CAT_ICONS[c.id] || CAT_ICONS.cat_common;
    return '<span class="home-section-icon" style="background:' + color + '">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>' +
      '</span>';
  }

  // 图标留空时，用网站域名的 Google Favicon 服务兜底；离线 / 加载失败则由 onerror 退回首字母
  function faviconFor(url) {
    try {
      var d = new URL(url).hostname;
      if (!d) return '';
      return 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(d) + '&sz=64';
    } catch (e) { return ''; }
  }
  function iconHtml(s) {
    var letter = (s.name || '?').trim().charAt(0) || '?';
    var url = s.icon || faviconFor(s.url);
    if (url) {
      return '<img class="home-card-icon-img" src="' + esc(url) + '" alt="" loading="lazy" ' +
        'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\';">' +
        '<span class="home-card-letter" style="display:none;background:' + hashColor(s.name) + '">' + esc(letter) + '</span>';
    }
    return '<span class="home-card-letter" style="background:' + hashColor(s.name) + '">' + esc(letter) + '</span>';
  }
  function cardHtml(s) {
    return '' +
      '<a class="home-card" href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer" ' +
      'title="点击打开 ' + esc(s.url) + '">' +
        '<span class="home-card-icon">' + iconHtml(s) + '</span>' +
        '<span class="home-card-name">' + esc(s.name) + '</span>' +
        '<span class="home-card-intro">' + esc(s.intro || '') + '</span>' +
      '</a>';
  }

  function greeting() {
    var h = new Date().getHours();
    if (h < 6) return '夜深了';
    if (h < 12) return '早上好';
    if (h < 14) return '中午好';
    if (h < 18) return '下午好';
    if (h < 22) return '晚上好';
    return '夜深了';
  }

  DaibaoTools.createHomePage = function (container) {
    var data = window.DAIBAO_SITE_NAV;

    if (!data || !Array.isArray(data.sites) || !Array.isArray(data.categories)) {
      container.innerHTML = '<div class="tool-empty"><div class="tool-empty-icon">🧭</div>' +
        '<h3>未找到首页导航配置</h3><p>请确认 js/data/site-nav-data.js 已定义 window.DAIBAO_SITE_NAV。</p></div>';
      return;
    }

    var catMap = {};
    data.categories.forEach(function (c) { catMap[c.id] = c.name; });
    var catIconMap = {};
    data.categories.forEach(function (c) { if (c.icon) catIconMap[c.id] = c.icon; });

    var keyword = '';
    // 当前选中的分类：'all' = 展示全部，其余 = 只展示该分类内容
    var activeCat = 'all';

    var chipsHtml = '<button class="home-chip active" data-cat="all">全部</button>' +
      data.categories.map(function (c) {
        return '<button class="home-chip" data-cat="' + esc(c.id) + '">' + esc(c.name) + '</button>';
      }).join('');

    var sectionsHtml = data.categories.map(function (c) {
      var list = data.sites.filter(function (s) { return s.catId === c.id; });
      if (!list.length) return '';
      return '' +
        '<section class="home-section" id="homeSection-' + esc(c.id) + '">' +
          '<div class="home-section-head">' +
            catIconHtml(c) +
            '<h2 class="home-section-title">' + esc(c.name) + '</h2>' +
            '<span class="home-section-count">' + list.length + '</span>' +
          '</div>' +
          '<div class="home-grid">' + list.map(cardHtml).join('') + '</div>' +
        '</section>';
    }).join('');

    container.innerHTML = '' +
      '<div class="home">' +
        '<div class="home-top">' +
          '<section class="home-hero">' +
            '<div class="home-hero-inner">' +
              '<h1 class="home-title">' + greeting() + '，欢迎使用呆宝工具箱</h1>' +
              '<p class="home-sub">常用网站一键直达 · 本地配置 · 点开即用</p>' +
              '<div class="home-search">' +
                '<span class="home-search-icon">🔍</span>' +
                '<input class="home-search-input" type="search" placeholder="搜索网站名称 / 介绍 / 网址…" maxlength="40" aria-label="搜索网站">' +
              '</div>' +
              '<div class="home-stats">共 <b>' + data.sites.length + '</b> 个网站 · <b>' + data.categories.length + '</b> 个分类</div>' +
            '</div>' +
          '</section>' +
          '<nav class="home-cats" id="homeCats">' + chipsHtml + '</nav>' +
        '</div>' +
        '<div class="home-body" id="homeBody">' + sectionsHtml + '</div>' +
        '<div class="home-results" id="homeResults" hidden>' +
          '<div class="home-results-head" id="homeResultsHead"></div>' +
          '<div class="home-grid" id="homeResultsGrid"></div>' +
        '</div>' +
      '</div>';

    var elCats = container.querySelector('#homeCats');
    var elBody = container.querySelector('#homeBody');
    var elResults = container.querySelector('#homeResults');
    var elResultsHead = container.querySelector('#homeResultsHead');
    var elResultsGrid = container.querySelector('#homeResultsGrid');
    var elSearch = container.querySelector('.home-search-input');
    var sections = elBody.querySelectorAll('.home-section');

    function renderResults() {
      var kw = keyword.trim().toLowerCase();
      var list = data.sites.filter(function (s) {
        var hay = ((s.name || '') + ' ' + (s.intro || '') + ' ' + (s.url || '')).toLowerCase();
        return hay.indexOf(kw) !== -1;
      });
      elResultsHead.textContent = '找到 ' + list.length + ' 个结果';
      elResultsGrid.innerHTML = list.length ? list.map(cardHtml).join('') :
        '<div class="home-empty">没有匹配的网站，换个关键词试试</div>';
    }

    // 统一视图：搜索优先；否则按 activeCat 决定展示全部分节还是单个分节
    function applyView() {
      if (keyword.trim()) {
        elBody.hidden = true;
        elCats.hidden = true;
        elResults.hidden = false;
        renderResults();
        return;
      }
      elCats.hidden = false;
      elResults.hidden = true;
      elBody.hidden = false;
      // 非「全部」时只显示所选分类的分节，其余隐藏
      sections.forEach(function (sec) {
        sec.hidden = activeCat !== 'all' && sec.id !== 'homeSection-' + activeCat;
      });
    }

    elCats.addEventListener('click', function (e) {
      var t = e.target.closest('.home-chip');
      if (!t) return;
      activeCat = t.getAttribute('data-cat') || 'all';
      elCats.querySelectorAll('.home-chip').forEach(function (b) {
        b.classList.toggle('active', b === t);
      });
      // 切换分类时退出搜索态，回到分类浏览视图
      keyword = '';
      if (elSearch.value) elSearch.value = '';
      applyView();
    });

    elSearch.addEventListener('input', function () {
      keyword = elSearch.value;
      applyView();
    });
  };
})();
