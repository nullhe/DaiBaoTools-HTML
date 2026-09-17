window.DaibaoTools = window.DaibaoTools || {};
(function () {
  'use strict';

  // 本工具为「只读」：数据来自配置文件 js/data/site-nav-data.js（window.DAIBAO_SITE_NAV）。
  // 不在浏览器内做增删改、不使用 localStorage、不联网。

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
      return '<img class="sn-icon-img" src="' + esc(url) + '" alt="" ' +
        'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\';">' +
        '<span class="sn-icon-letter" style="display:none;background:' + hashColor(s.name) + '">' + esc(letter) + '</span>';
    }
    return '<span class="sn-icon-letter" style="background:' + hashColor(s.name) + '">' + esc(letter) + '</span>';
  }
  function cardHtml(s, catName) {
    return '' +
      '<div class="sn-card" data-id="' + esc(s.id) + '">' +
        '<a class="sn-open" href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer" title="点击打开 ' + esc(s.url) + '"></a>' +
        '<div class="sn-icon">' + iconHtml(s) + '</div>' +
        '<div class="sn-name">' + esc(s.name) + '</div>' +
        '<div class="sn-cat-tag">' + esc(catName) + '</div>' +
        '<div class="sn-intro">' + esc(s.intro || '') + '</div>' +
        '<div class="sn-url">' + esc(s.url) + '</div>' +
      '</div>';
  }

  DaibaoTools.createSiteNavTool = function (container) {
    var data = window.DAIBAO_SITE_NAV;
    var catMap = {};
    (data ? data.categories : []).forEach(function (c) { catMap[c.id] = c.name; });

    if (!data || !Array.isArray(data.sites) || !Array.isArray(data.categories)) {
      container.innerHTML = '<div class="sn-empty">未找到网址导航配置文件（js/data/site-nav-data.js）。' +
        '请在项目中创建该文件并定义 window.DAIBAO_SITE_NAV。</div>';
      return;
    }

    var activeCat = 'all';
    var keyword = '';

    container.innerHTML = [
      '<div class="sn-tool">',
      '  <div class="sn-bar">',
      '    <input class="tool-input sn-search" type="search" placeholder="搜索名称 / 介绍 / 链接…" maxlength="40" aria-label="搜索网址">',
      '    <span class="sn-spacer"></span>',
      '    <span class="sn-count"></span>',
      '  </div>',
      '  <div class="sn-cats" id="snCats"></div>',
      '  <div class="sn-grid" id="snGrid"></div>',
      '  <div class="sn-empty" id="snEmpty" hidden>没有匹配的网址</div>',
      '</div>'
    ].join('\n');

    var elCats = container.querySelector('#snCats');
    var elGrid = container.querySelector('#snGrid');
    var elEmpty = container.querySelector('#snEmpty');
    var elCount = container.querySelector('.sn-count');
    var elSearch = container.querySelector('.sn-search');

    function renderCats() {
      var html = '<button class="sn-cat' + (activeCat === 'all' ? ' active' : '') + '" data-cat="all">全部</button>';
      data.categories.forEach(function (c) {
        html += '<button class="sn-cat' + (activeCat === c.id ? ' active' : '') + '" data-cat="' + esc(c.id) + '">' + esc(c.name) + '</button>';
      });
      elCats.innerHTML = html;
    }

    function renderGrid() {
      var kw = keyword.trim().toLowerCase();
      var list = data.sites.filter(function (s) {
        if (activeCat !== 'all' && s.catId !== activeCat) return false;
        if (kw) {
          var hay = ((s.name || '') + ' ' + (s.intro || '') + ' ' + (s.url || '')).toLowerCase();
          if (hay.indexOf(kw) === -1) return false;
        }
        return true;
      });
      elCount.textContent = '共 ' + list.length + ' 个网址';
      if (!list.length) {
        elGrid.innerHTML = '';
        elEmpty.hidden = false;
        return;
      }
      elEmpty.hidden = true;
      elGrid.innerHTML = list.map(function (s) {
        return cardHtml(s, catMap[s.catId] || '未分类');
      }).join('');
    }

    function renderAll() { renderCats(); renderGrid(); }

    elCats.addEventListener('click', function (e) {
      var t = e.target.closest('.sn-cat');
      if (!t) return;
      activeCat = t.getAttribute('data-cat');
      renderAll();
    });
    elSearch.addEventListener('input', function () { keyword = elSearch.value; renderGrid(); });

    renderAll();
  };
})();
