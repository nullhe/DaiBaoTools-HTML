/* 时间戳转换 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createTimestampTool = function (container) {
  container.innerHTML = `
    <div class="tool-wrap">
      <div class="tool-head">
        <div class="tool-title">时间戳转换</div>
        <div class="tool-subtitle">Unix 时间戳与日期时间互转</div>
      </div>
      <div class="tool-cols">
        <div class="tool-col">
          <div class="tool-panel-title">当前时间</div>
          <div class="tool-stats">
            <div class="tool-stat">
              <div class="tool-stat-num" id="tsNowSec">-</div>
              <div class="tool-stat-label">秒级时间戳</div>
            </div>
            <div class="tool-stat">
              <div class="tool-stat-num" id="tsNowMs">-</div>
              <div class="tool-stat-label">毫秒级时间戳</div>
            </div>
          </div>
          <div class="tool-btn-row">
            <button class="tool-btn" id="tsRefresh">刷新</button>
          </div>
          <div class="tool-output plain" id="tsNowText" style="min-height:auto"></div>

          <div class="tool-panel-title">时间戳 → 日期</div>
          <div class="tool-inline">
            <input class="tool-input" id="tsInput" placeholder="输入时间戳，如 1700000000">
          </div>
          <div class="tool-inline">
            <select class="tool-select" id="tsUnit" style="max-width:150px">
              <option value="s">秒（10 位）</option>
              <option value="ms">毫秒（13 位）</option>
            </select>
            <button class="tool-btn primary" id="tsToDate">转换</button>
          </div>
          <div class="tool-output plain" id="tsDateOut" style="min-height:auto">-</div>
        </div>

        <div class="tool-col">
          <div class="tool-panel-title">日期 → 时间戳</div>
          <div class="tool-field">
            <span class="tool-label">选择日期时间</span>
            <input class="tool-input" type="datetime-local" id="tsDateInput" step="1">
          </div>
          <div class="tool-btn-row">
            <button class="tool-btn primary" id="tsToStamp">转换</button>
            <button class="tool-btn" id="tsUseNow">填入当前时间</button>
          </div>
          <div class="tool-output plain" id="tsStampOut" style="min-height:auto">-</div>
          <p class="tool-hint">时间戳指 Unix 时间戳，即从 1970-01-01 00:00:00 UTC 起算的秒数或毫秒数。显示的日期时间均为本机时区。</p>
        </div>
      </div>
    </div>`;

  var nowSec = container.querySelector('#tsNowSec');
  var nowMs = container.querySelector('#tsNowMs');
  var nowText = container.querySelector('#tsNowText');
  var tsInput = container.querySelector('#tsInput');
  var tsUnit = container.querySelector('#tsUnit');
  var tsDateOut = container.querySelector('#tsDateOut');
  var dateInput = container.querySelector('#tsDateInput');
  var stampOut = container.querySelector('#tsStampOut');

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function formatLocal(d) {
    return (
      d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
      ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds())
    );
  }

  function weekday(d) {
    return ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][d.getDay()];
  }

  function refreshNow() {
    var now = Date.now();
    nowSec.textContent = Math.floor(now / 1000);
    nowMs.textContent = now;
    var d = new Date(now);
    nowText.textContent = formatLocal(d) + '  ' + weekday(d);
  }

  container.querySelector('#tsRefresh').onclick = refreshNow;

  container.querySelector('#tsToDate').onclick = function () {
    var raw = tsInput.value.trim();
    if (!raw) {
      tsDateOut.textContent = '请输入时间戳';
      return;
    }
    var num = Number(raw);
    if (!isFinite(num)) {
      tsDateOut.textContent = '时间戳无效，请输入数字';
      return;
    }
    var ms = tsUnit.value === 's' ? num * 1000 : num;
    var d = new Date(ms);
    if (isNaN(d.getTime())) {
      tsDateOut.textContent = '时间戳超出可表示范围';
      return;
    }
    tsDateOut.textContent =
      '本地时间：' + formatLocal(d) + '  ' + weekday(d) + '\n' +
      'UTC 时间：' + d.toISOString().replace('T', ' ').slice(0, 19);
  };

  container.querySelector('#tsUseNow').onclick = function () {
    var d = new Date();
    var off = d.getTimezoneOffset() * 60000;
    dateInput.value = new Date(d.getTime() - off).toISOString().slice(0, 19);
    stampOut.textContent = '-';
  };

  container.querySelector('#tsToStamp').onclick = function () {
    var val = dateInput.value;
    if (!val) {
      stampOut.textContent = '请选择日期时间';
      return;
    }
    var d = new Date(val);
    if (isNaN(d.getTime())) {
      stampOut.textContent = '日期无效';
      return;
    }
    stampOut.textContent =
      '秒级时间戳：' + Math.floor(d.getTime() / 1000) + '\n' +
      '毫秒级时间戳：' + d.getTime();
  };

  refreshNow();
};
