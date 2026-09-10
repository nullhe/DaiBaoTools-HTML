/* 天气查询：按国内地区查询实时天气、空气与生活习惯指数（OIAPI / weather id=40） */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createWeatherQuery = function (container) {
  var HOT_CITIES = ['北京', '上海', '广州', '深圳', '杭州', '成都', '西安', '武汉', '南京', '重庆'];
  var STORE_KEY = 'daibao_weather_city';

  container.innerHTML = `
    <div class="wtq-wrap">
      <div class="wtq-head">
        <h2 class="wtq-title">🌤️ 天气查询</h2>
        <p class="wtq-sub">输入国内地区查询实时天气、空气质量与生活习惯指数（数据来源 OIAPI）</p>
      </div>

      <div class="wtq-toolbar">
        <input class="tool-input wtq-input" id="wtqCity" type="text" placeholder="输入地区，如：北京 / 深圳 / 西湖区" maxlength="20" />
        <button class="tool-btn tool-btn-primary" id="wtqQuery">查询</button>
      </div>
      <div class="wtq-hot" id="wtqHot"></div>

      <div class="wtq-status" id="wtqStatus"></div>
      <div class="wtq-result" id="wtqResult" hidden></div>
    </div>
  `;

  var input = container.querySelector('#wtqCity');
  var queryBtn = container.querySelector('#wtqQuery');
  var hotBox = container.querySelector('#wtqHot');
  var status = container.querySelector('#wtqStatus');
  var result = container.querySelector('#wtqResult');

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

  // 天气 → emoji，图标加载失败时兜底
  function weatherEmoji(w) {
    var s = String(w || '');
    if (s.indexOf('雷') >= 0) return '⚡';
    if (s.indexOf('雪') >= 0) return '❄️';
    if (s.indexOf('雾') >= 0 || s.indexOf('霾') >= 0) return '🌫️';
    if (s.indexOf('雨') >= 0) return '🌧️';
    if (s.indexOf('阴') >= 0) return '☁️';
    if (s.indexOf('多云') >= 0) return '⛅';
    if (s.indexOf('晴') >= 0) return '☀️';
    return '🌡️';
  }

  // AQI 分级（参考国标）
  function airLevel(air) {
    var n = parseInt(air, 10);
    if (isNaN(n) || n < 0) return { text: '', cls: '' };
    if (n <= 50) return { text: '优', cls: 'wtq-air-1' };
    if (n <= 100) return { text: '良', cls: 'wtq-air-2' };
    if (n <= 150) return { text: '轻度污染', cls: 'wtq-air-3' };
    if (n <= 200) return { text: '中度污染', cls: 'wtq-air-4' };
    if (n <= 300) return { text: '重度污染', cls: 'wtq-air-5' };
    return { text: '严重污染', cls: 'wtq-air-6' };
  }

  // 热门城市 chip
  HOT_CITIES.forEach(function (city) {
    var chip = el('button', 'wtq-chip', city);
    chip.type = 'button';
    chip.addEventListener('click', function () {
      input.value = city;
      query(city);
    });
    hotBox.appendChild(chip);
  });

  function setStatus(html) {
    status.innerHTML = html || '';
  }

  function query(city) {
    var name = (city != null ? city : input.value).trim();
    if (!name) {
      setStatus('<div class="wtq-tip">请输入要查询的地区</div>');
      input.focus();
      return;
    }

    queryBtn.disabled = true;
    result.hidden = true;
    result.innerHTML = '';
    setStatus('<div class="wtq-loading">正在查询「' + name + '」的天气…</div>');

    var url = 'https://www.oiapi.net/api/weather?type=json&city=' + encodeURIComponent(name);

    fetch(url)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (json) {
        if (json.code !== 1 || !json.data || typeof json.data !== 'object') {
          result.hidden = true;
          setStatus(
            '<div class="tool-empty"><div class="tool-empty-icon">🗺️</div><h3>查不到该地区</h3><p>' +
            (json.message || '请确认地区名称是否正确，接口仅支持国内地区') + '</p></div>'
          );
          return;
        }
        try { localStorage.setItem(STORE_KEY, name); } catch (e) { /* 忽略存储异常 */ }
        setStatus('');
        renderResult(json.data);
        result.hidden = false;
        notifyMotion(result);
      })
      .catch(function (err) {
        result.hidden = true;
        setStatus(
          '<div class="tool-empty"><div class="tool-empty-icon">⚠️</div><h3>查询失败</h3><p>' +
          ((err && err.message) || '网络或跨域读取失败') + '</p></div>'
        );
      })
      .finally(function () { queryBtn.disabled = false; });
  }

  function renderResult(d) {
    result.innerHTML = '';
    var cur = d.current || {};

    // ---- 概览卡 ----
    var hero = el('div', 'wtq-hero');

    var heroMain = el('div', 'wtq-hero-main');
    var city = el('div', 'wtq-city', d.city || cur.city || '');
    var cityEn = el('div', 'wtq-city-en', d.cityEnglish || cur.cityEnglish || '');
    heroMain.appendChild(city);
    if (cityEn.textContent) heroMain.appendChild(cityEn);

    var tempRow = el('div', 'wtq-temp-row');
    var big = el('span', 'wtq-temp', cur.temp != null && cur.temp !== '' ? String(cur.temp) : '--');
    tempRow.appendChild(big);
    tempRow.appendChild(el('span', 'wtq-unit', '°C'));
    heroMain.appendChild(tempRow);

    var range = el('div', 'wtq-range');
    if (d.tempn != null && d.tempn !== '') range.appendChild(el('span', 'wtq-low', '低温 ' + d.tempn + '°'));
    if (d.temp != null && d.temp !== '') range.appendChild(el('span', 'wtq-high', '高温 ' + d.temp + '°'));
    if (cur.fahrenheit) range.appendChild(el('span', 'wtq-fah', '华氏 ' + cur.fahrenheit + '°F'));
    if (range.children.length) heroMain.appendChild(range);

    hero.appendChild(heroMain);

    var heroSide = el('div', 'wtq-hero-side');
    var iconWrap = el('div', 'wtq-icon');
    if (cur.image) {
      var im = el('img', 'wtq-icon-img');
      im.src = cur.image;
      im.alt = cur.weather || '天气图标';
      im.referrerPolicy = 'no-referrer';
      im.onerror = function () {
        iconWrap.textContent = weatherEmoji(cur.weather || d.weather);
        iconWrap.classList.add('wtq-icon-fallback');
      };
      iconWrap.appendChild(im);
    } else {
      iconWrap.textContent = weatherEmoji(cur.weather || d.weather);
      iconWrap.classList.add('wtq-icon-fallback');
    }
    heroSide.appendChild(iconWrap);
    heroSide.appendChild(el('div', 'wtq-weather', cur.weather || d.weather || ''));
    if (cur.date || cur.time) {
      heroSide.appendChild(el('div', 'wtq-time', [cur.date, cur.time].filter(Boolean).join(' ')));
    }
    hero.appendChild(heroSide);

    result.appendChild(hero);

    // ---- 预警 ----
    var warns = [];
    if (Array.isArray(d.warning)) {
      warns = d.warning.filter(Boolean);
    } else if (d.warning && typeof d.warning === 'object') {
      Object.keys(d.warning).forEach(function (k) {
        var v = d.warning[k];
        if (!v) return;
        if (typeof v === 'string') warns.push(v);
        else if (v && typeof v === 'object') warns.push(v.title || v.text || v.content || JSON.stringify(v));
        else warns.push(String(v));
      });
    }
    if (warns.length) {
      var wbox = el('div', 'wtq-warn');
      wbox.appendChild(el('div', 'wtq-warn-title', '⚠️ 气象预警'));
      var ul = el('ul', 'wtq-warn-list');
      warns.forEach(function (w) { ul.appendChild(el('li', 'wtq-warn-item', w)); });
      wbox.appendChild(ul);
      result.appendChild(wbox);
    }

    // ---- 详细指标 ----
    var items = [
      ['天气', cur.weather || d.weather],
      ['英文', cur.weatherEnglish],
      ['风向', cur.wind || d.wind],
      ['风级风速', cur.windSpeed || d.windSpeed],
      ['湿度', cur.humidity],
      ['能见度', cur.visibility],
      ['更新时间', d.time || cur.time],
    ];
    // 空气质量单独着色
    if (cur.air != null && cur.air !== '') {
      var lv = airLevel(cur.air);
      items.push(['空气质量', cur.air + (lv.text ? '（' + lv.text + '）' : '')]);
    }
    if (cur.air_pm25 != null && cur.air_pm25 !== '') items.push(['PM2.5', String(cur.air_pm25)]);

    var grid = el('div', 'wtq-grid');
    items.forEach(function (pair) {
      if (pair[1] == null || pair[1] === '') return;
      var cell = el('div', 'wtq-item');
      cell.appendChild(el('span', 'wtq-item-label', pair[0]));
      var val = el('span', 'wtq-item-value', String(pair[1]));
      if (pair[0] === '空气质量') {
        var lv2 = airLevel(cur.air);
        if (lv2.cls) val.classList.add(lv2.cls);
      }
      cell.appendChild(val);
      grid.appendChild(cell);
    });
    if (grid.children.length) result.appendChild(grid);

    // ---- 生活指数 ----
    var living = Array.isArray(d.living) ? d.living.filter(function (x) { return x && x.name; }) : [];
    if (living.length) {
      var sec = el('div', 'wtq-living');
      var head = el('div', 'wtq-living-head');
      head.appendChild(el('h3', 'wtq-living-title', '生活指数（' + living.length + ' 项）'));
      var toggle = el('button', 'wtq-toggle', '展开全部');
      toggle.type = 'button';
      head.appendChild(toggle);
      sec.appendChild(head);

      var lgrid = el('div', 'wtq-living-grid');
      living.forEach(function (lv, i) {
        var card = el('div', 'wtq-lv');
        if (i >= 8) card.classList.add('wtq-lv-extra');
        var top = el('div', 'wtq-lv-top');
        top.appendChild(el('span', 'wtq-lv-name', lv.name));
        if (lv.index) top.appendChild(el('span', 'wtq-lv-index', lv.index));
        card.appendChild(top);
        if (lv.tips) card.appendChild(el('div', 'wtq-lv-tips', lv.tips));
        lgrid.appendChild(card);
      });
      sec.appendChild(lgrid);

      toggle.addEventListener('click', function () {
        var expanded = lgrid.classList.toggle('wtq-expanded');
        toggle.textContent = expanded ? '收起' : '展开全部';
      });

      result.appendChild(sec);
    }
  }

  queryBtn.addEventListener('click', function () { query(); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') query();
  });

  // 回填上次查询的城市（不自动查询）
  try {
    var last = localStorage.getItem(STORE_KEY);
    if (last) input.value = last;
  } catch (e) { /* localStorage 不可用时静默忽略 */ }

  notifyMotion(container);
};
