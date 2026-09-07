/* 单位换算（长度/质量/面积/体积/温度/速度/时间/数据存储/功率） */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createUnitConverter = function (container) {
  container.innerHTML = `
    <div class="tool-wrap">
      <div class="tool-head">
        <div class="tool-title">单位换算</div>
        <div class="tool-subtitle">双向实时换算，数据存储区分 1024 与 1000 进制</div>
      </div>

      <div class="tool-field">
        <label class="tool-label" for="ucCategory">换算类别</label>
        <select class="tool-select" id="ucCategory"></select>
      </div>

      <div class="tool-cols">
        <div class="tool-col">
          <div class="tool-panel-title">换算</div>
          <div class="tool-field">
            <label class="tool-label" for="ucFromUnit">从</label>
            <div class="tool-inline">
              <input class="tool-input" type="text" id="ucFromVal" inputmode="decimal" value="1">
              <select class="tool-select" id="ucFromUnit" style="max-width:190px"></select>
            </div>
          </div>
          <div class="tool-btn-row">
            <button class="tool-btn" id="ucSwap">↑ 交换 ↓</button>
          </div>
          <div class="tool-field">
            <label class="tool-label" for="ucToUnit">到</label>
            <div class="tool-inline">
              <input class="tool-input" type="text" id="ucToVal" inputmode="decimal">
              <select class="tool-select" id="ucToUnit" style="max-width:190px"></select>
            </div>
          </div>
          <div class="tool-error" id="ucError"></div>
          <p class="tool-hint" id="ucHint"></p>
        </div>

        <div class="tool-col">
          <div class="tool-panel-title">当前值在各单位下的结果</div>
          <div class="tool-output plain" id="ucAll" style="min-height:190px"></div>
          <div class="tool-btn-row">
            <button class="tool-btn accent" id="ucCopy">复制结果</button>
          </div>
        </div>
      </div>
    </div>`;

  // f = 与基准单位的换算系数（值 × f = 基准值）
  // 温度单位用 to/from 函数，基准为摄氏度
  var GROUPS = [
    {
      name: '长度',
      hint: '基准单位：米 (m)。1 英寸 = 2.54 厘米，1 市尺 = 1/3 米。',
      units: [
        { n: '毫米 (mm)', f: 0.001 },
        { n: '厘米 (cm)', f: 0.01 },
        { n: '分米 (dm)', f: 0.1 },
        { n: '米 (m)', f: 1 },
        { n: '千米 (km)', f: 1000 },
        { n: '英寸 (in)', f: 0.0254 },
        { n: '英尺 (ft)', f: 0.3048 },
        { n: '码 (yd)', f: 0.9144 },
        { n: '英里 (mi)', f: 1609.344 },
        { n: '海里 (nmi)', f: 1852 },
        { n: '市尺', f: 1 / 3 },
        { n: '市里', f: 500 },
      ],
    },
    {
      name: '质量',
      hint: '基准单位：千克 (kg)。1 市斤 = 500 克，1 磅 = 0.45359237 千克。',
      units: [
        { n: '毫克 (mg)', f: 0.000001 },
        { n: '克 (g)', f: 0.001 },
        { n: '千克 (kg)', f: 1 },
        { n: '吨 (t)', f: 1000 },
        { n: '磅 (lb)', f: 0.45359237 },
        { n: '盎司 (oz)', f: 0.028349523125 },
        { n: '克拉 (ct)', f: 0.0002 },
        { n: '市斤', f: 0.5 },
        { n: '市两', f: 0.05 },
      ],
    },
    {
      name: '面积',
      hint: '基准单位：平方米 (m²)。1 亩 ≈ 666.667 平方米，1 公顷 = 10000 平方米。',
      units: [
        { n: '平方毫米 (mm²)', f: 0.000001 },
        { n: '平方厘米 (cm²)', f: 0.0001 },
        { n: '平方米 (m²)', f: 1 },
        { n: '平方千米 (km²)', f: 1000000 },
        { n: '公顷 (ha)', f: 10000 },
        { n: '亩', f: 10000 / 15 },
        { n: '英亩 (acre)', f: 4046.8564224 },
        { n: '平方英寸 (in²)', f: 0.00064516 },
        { n: '平方英尺 (ft²)', f: 0.09290304 },
        { n: '平方英里 (mi²)', f: 2589988.110336 },
      ],
    },
    {
      name: '体积',
      hint: '基准单位：升 (L)。1 美制加仑 = 3.785412 升，1 英制加仑 = 4.54609 升。',
      units: [
        { n: '毫升 (mL)', f: 0.001 },
        { n: '升 (L)', f: 1 },
        { n: '立方厘米 (cm³)', f: 0.001 },
        { n: '立方米 (m³)', f: 1000 },
        { n: '立方英寸 (in³)', f: 0.016387064 },
        { n: '立方英尺 (ft³)', f: 28.316846592 },
        { n: '美制加仑 (gal US)', f: 3.785411784 },
        { n: '英制加仑 (gal UK)', f: 4.54609 },
        { n: '美制品脱 (pt US)', f: 0.473176473 },
      ],
    },
    {
      name: '温度',
      hint: '基准单位：摄氏度 (°C)。华氏度 °F = °C × 9/5 + 32；开尔文 K = °C + 273.15。',
      units: [
        { n: '摄氏度 (°C)', to: function (v) { return v; }, from: function (v) { return v; } },
        { n: '华氏度 (°F)', to: function (v) { return (v - 32) * 5 / 9; }, from: function (c) { return c * 9 / 5 + 32; } },
        { n: '开尔文 (K)', to: function (v) { return v - 273.15; }, from: function (c) { return c + 273.15; } },
        { n: '兰氏度 (°R)', to: function (v) { return (v - 491.67) * 5 / 9; }, from: function (c) { return (c + 273.15) * 9 / 5; } },
      ],
    },
    {
      name: '速度',
      hint: '基准单位：米/秒 (m/s)。马赫按海平面标准音速 340.3 m/s 估算。',
      units: [
        { n: '米/秒 (m/s)', f: 1 },
        { n: '千米/小时 (km/h)', f: 1 / 3.6 },
        { n: '英里/小时 (mph)', f: 0.44704 },
        { n: '节 (kn)', f: 1852 / 3600 },
        { n: '英尺/秒 (ft/s)', f: 0.3048 },
        { n: '马赫 (Ma)', f: 340.3 },
      ],
    },
    {
      name: '时间',
      hint: '基准单位：秒 (s)。月按 30 天、年按 365 天计算。',
      units: [
        { n: '毫秒 (ms)', f: 0.001 },
        { n: '秒 (s)', f: 1 },
        { n: '分钟 (min)', f: 60 },
        { n: '小时 (h)', f: 3600 },
        { n: '天 (d)', f: 86400 },
        { n: '周', f: 604800 },
        { n: '月 (30天)', f: 2592000 },
        { n: '年 (365天)', f: 31536000 },
      ],
    },
    {
      name: '数据存储',
      hint: '基准单位：字节 (B)。KiB/MiB 系列为 1024 进制，kB/MB 系列为 1000 进制。',
      units: [
        { n: '字节 (B)', f: 1 },
        { n: '比特 (bit)', f: 0.125 },
        { n: 'KiB (1024)', f: 1024 },
        { n: 'MiB (1024²)', f: 1048576 },
        { n: 'GiB (1024³)', f: 1073741824 },
        { n: 'TiB (1024⁴)', f: 1099511627776 },
        { n: 'PiB (1024⁵)', f: 1125899906842624 },
        { n: 'kB (1000)', f: 1000 },
        { n: 'MB (1000²)', f: 1000000 },
        { n: 'GB (1000³)', f: 1000000000 },
        { n: 'TB (1000⁴)', f: 1000000000000 },
      ],
    },
    {
      name: '功率',
      hint: '基准单位：瓦 (W)。公制马力 (PS) = 735.49875 W，英制马力 (hp) = 745.7 W。',
      units: [
        { n: '瓦 (W)', f: 1 },
        { n: '千瓦 (kW)', f: 1000 },
        { n: '兆瓦 (MW)', f: 1000000 },
        { n: '公制马力 (PS)', f: 735.49875 },
        { n: '英制马力 (hp)', f: 745.6998715822702 },
        { n: 'BTU/小时', f: 0.29307107017 },
        { n: '千卡/小时', f: 1.163 },
      ],
    },
  ];

  var catEl = container.querySelector('#ucCategory');
  var fromUnitEl = container.querySelector('#ucFromUnit');
  var toUnitEl = container.querySelector('#ucToUnit');
  var fromValEl = container.querySelector('#ucFromVal');
  var toValEl = container.querySelector('#ucToVal');
  var allEl = container.querySelector('#ucAll');
  var errorEl = container.querySelector('#ucError');
  var hintEl = container.querySelector('#ucHint');

  catEl.innerHTML = GROUPS.map(function (g, i) {
    return '<option value="' + i + '">' + g.name + '</option>';
  }).join('');

  function currentGroup() {
    return GROUPS[parseInt(catEl.value, 10)];
  }

  function fillUnits() {
    var g = currentGroup();
    var opts = g.units
      .map(function (u, i) {
        return '<option value="' + i + '">' + u.n + '</option>';
      })
      .join('');
    fromUnitEl.innerHTML = opts;
    toUnitEl.innerHTML = opts;
    fromUnitEl.selectedIndex = 0;
    toUnitEl.selectedIndex = Math.min(1, g.units.length - 1);
    hintEl.textContent = g.hint;
  }

  function toBase(u, v) {
    return u.to ? u.to(v) : v * u.f;
  }

  function fromBase(u, base) {
    return u.from ? u.from(base) : base / u.f;
  }

  function fmt(n) {
    if (!isFinite(n)) return '-';
    var abs = Math.abs(n);
    if (abs !== 0 && (abs >= 1e15 || abs < 1e-6)) return n.toExponential(6);
    var s = n.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
    return s === '-0' ? '0' : s;
  }

  function renderAll(base) {
    var g = currentGroup();
    allEl.textContent = g.units
      .map(function (u) {
        return u.n + '  =  ' + fmt(fromBase(u, base));
      })
      .join('\n');
  }

  function calcFromLeft() {
    errorEl.textContent = '';
    var raw = fromValEl.value.trim();
    if (raw === '') {
      toValEl.value = '';
      allEl.textContent = '';
      return;
    }
    var v = parseFloat(raw);
    if (isNaN(v)) {
      errorEl.textContent = '请输入有效数字';
      toValEl.value = '';
      return;
    }
    var g = currentGroup();
    var fu = g.units[fromUnitEl.selectedIndex];
    var tu = g.units[toUnitEl.selectedIndex];
    var base = toBase(fu, v);
    toValEl.value = fmt(fromBase(tu, base));
    renderAll(base);
  }

  function calcFromRight() {
    errorEl.textContent = '';
    var raw = toValEl.value.trim();
    if (raw === '') {
      fromValEl.value = '';
      allEl.textContent = '';
      return;
    }
    var v = parseFloat(raw);
    if (isNaN(v)) {
      errorEl.textContent = '请输入有效数字';
      fromValEl.value = '';
      return;
    }
    var g = currentGroup();
    var fu = g.units[fromUnitEl.selectedIndex];
    var tu = g.units[toUnitEl.selectedIndex];
    var base = toBase(tu, v);
    fromValEl.value = fmt(fromBase(fu, base));
    renderAll(base);
  }

  fromValEl.addEventListener('input', calcFromLeft);
  toValEl.addEventListener('input', calcFromRight);
  [fromUnitEl, toUnitEl].forEach(function (el) {
    el.addEventListener('change', calcFromLeft);
  });
  catEl.addEventListener('change', function () {
    fillUnits();
    calcFromLeft();
  });

  container.querySelector('#ucSwap').onclick = function () {
    var ui = fromUnitEl.selectedIndex;
    fromUnitEl.selectedIndex = toUnitEl.selectedIndex;
    toUnitEl.selectedIndex = ui;
    var vv = fromValEl.value;
    fromValEl.value = toValEl.value;
    toValEl.value = vv;
    calcFromLeft();
  };

  container.querySelector('#ucCopy').onclick = function () {
    var g = currentGroup();
    var fu = g.units[fromUnitEl.selectedIndex];
    var tu = g.units[toUnitEl.selectedIndex];
    var text = fromValEl.value + ' ' + fu.n + '  =  ' + toValEl.value + ' ' + tu.n;
    if (!fromValEl.value) {
      DaibaoTools.toast('没有可复制的内容');
      return;
    }
    DaibaoTools.copyText(text);
    DaibaoTools.toast('已复制换算结果');
  };

  fillUnits();
  calcFromLeft();
};
