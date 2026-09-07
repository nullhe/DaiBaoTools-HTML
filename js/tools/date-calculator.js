/* 日期计算器 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createDateCalculator = function (container) {
  container.innerHTML = `
    <div class="tool-wrap">
      <div class="tool-head">
        <div class="tool-title">日期计算器</div>
        <div class="tool-subtitle">计算日期间隔与日期推算</div>
      </div>
      <div class="tool-cols">
        <div class="tool-col">
          <div class="tool-panel-title">日期间隔</div>
          <div class="tool-field">
            <span class="tool-label">开始日期</span>
            <input class="tool-input" type="date" id="dcStart">
          </div>
          <div class="tool-field">
            <span class="tool-label">结束日期</span>
            <input class="tool-input" type="date" id="dcEnd">
          </div>
          <div class="tool-btn-row">
            <button class="tool-btn primary" id="dcDiff">计算间隔</button>
          </div>
          <div class="tool-output plain" id="dcDiffOut" style="min-height:auto">-</div>
        </div>

        <div class="tool-col">
          <div class="tool-panel-title">日期推算</div>
          <div class="tool-field">
            <span class="tool-label">基准日期</span>
            <input class="tool-input" type="date" id="dcBase">
          </div>
          <div class="tool-inline">
            <input class="tool-input" type="number" id="dcAmount" placeholder="数量，可填负数" value="30">
            <select class="tool-select" id="dcUnit" style="max-width:110px">
              <option value="day">天</option>
              <option value="week">周</option>
              <option value="month">月</option>
              <option value="year">年</option>
            </select>
          </div>
          <div class="tool-btn-row">
            <button class="tool-btn primary" id="dcCalc">推算</button>
          </div>
          <div class="tool-output plain" id="dcCalcOut" style="min-height:auto">-</div>
        </div>
      </div>
    </div>`;

  var start = container.querySelector('#dcStart');
  var end = container.querySelector('#dcEnd');
  var diffOut = container.querySelector('#dcDiffOut');
  var base = container.querySelector('#dcBase');
  var amount = container.querySelector('#dcAmount');
  var unit = container.querySelector('#dcUnit');
  var calcOut = container.querySelector('#dcCalcOut');

  var WEEK = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function fmt(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function parseDate(input, label) {
    if (!input.value) {
      throw new Error('请选择' + label);
    }
    var d = new Date(input.value + 'T00:00:00');
    if (isNaN(d.getTime())) {
      throw new Error(label + '无效');
    }
    return d;
  }

  container.querySelector('#dcDiff').onclick = function () {
    try {
      var d1 = parseDate(start, '开始日期');
      var d2 = parseDate(end, '结束日期');
      var ms = d2.getTime() - d1.getTime();
      var days = Math.round(ms / 86400000);
      var sign = days < 0 ? '早' : '晚';
      var abs = Math.abs(days);
      var years = Math.floor(abs / 365);
      var months = Math.floor((abs % 365) / 30);
      diffOut.textContent =
        '相差：' + Math.abs(days) + ' 天\n' +
        '（约 ' + years + ' 年 ' + months + ' 个月 ' + (abs % 30) + ' 天）\n' +
        '结束日期比开始日期' + sign + ' ' + abs + ' 天\n' +
        '开始：' + fmt(d1) + ' ' + WEEK[d1.getDay()] + '\n' +
        '结束：' + fmt(d2) + ' ' + WEEK[d2.getDay()];
    } catch (e) {
      diffOut.textContent = e.message;
    }
  };

  container.querySelector('#dcCalc').onclick = function () {
    try {
      var d = parseDate(base, '基准日期');
      var n = parseInt(amount.value, 10);
      if (!isFinite(n)) {
        throw new Error('请输入有效的数量');
      }
      var result = new Date(d.getTime());
      if (unit.value === 'day') {
        result.setDate(result.getDate() + n);
      } else if (unit.value === 'week') {
        result.setDate(result.getDate() + n * 7);
      } else if (unit.value === 'month') {
        result.setMonth(result.getMonth() + n);
      } else {
        result.setFullYear(result.getFullYear() + n);
      }
      calcOut.textContent =
        '结果日期：' + fmt(result) + '  ' + WEEK[result.getDay()] + '\n' +
        '基准日期：' + fmt(d) + '  ' + WEEK[d.getDay()];
    } catch (e) {
      calcOut.textContent = e.message;
    }
  };
};
