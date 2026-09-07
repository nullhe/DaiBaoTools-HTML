/* BMI 计算器 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createBmiCalculator = function (container) {
  container.innerHTML = `
    <div class="tool-wrap">
      <div class="tool-head">
        <div class="tool-title">BMI 计算器</div>
        <div class="tool-subtitle">身体质量指数，按中国成人标准分级</div>
      </div>
      <div class="tool-cols">
        <div class="tool-col">
          <div class="tool-panel-title">输入数据</div>
          <div class="tool-field">
            <span class="tool-label">身高（厘米）</span>
            <input class="tool-input" type="number" id="bmiHeight" placeholder="如 170" min="1" step="0.1">
          </div>
          <div class="tool-field">
            <span class="tool-label">体重（公斤）</span>
            <input class="tool-input" type="number" id="bmiWeight" placeholder="如 65" min="1" step="0.1">
          </div>
          <div class="tool-btn-row">
            <button class="tool-btn primary" id="bmiCalc">计算</button>
            <button class="tool-btn" id="bmiClear">重置</button>
          </div>
          <div class="tool-error" id="bmiError"></div>
        </div>

        <div class="tool-col">
          <div class="tool-panel-title">结果</div>
          <div class="tool-bignum" id="bmiValue">--</div>
          <div class="tool-center"><span class="tool-badge" id="bmiLevel">待计算</span></div>
          <div class="tool-output plain" id="bmiDetail" style="min-height:auto">请输入身高与体重后点击计算。</div>
          <p class="tool-hint">
            BMI = 体重（kg）÷ 身高²（m²）。中国成人标准：偏瘦 &lt; 18.5，正常 18.5～23.9，超重 24～27.9，肥胖 ≥ 28。
            该结果仅供参考，不适用于孕妇、运动员及未成年人。
          </p>
        </div>
      </div>
    </div>`;

  var height = container.querySelector('#bmiHeight');
  var weight = container.querySelector('#bmiWeight');
  var errorEl = container.querySelector('#bmiError');
  var valueEl = container.querySelector('#bmiValue');
  var levelEl = container.querySelector('#bmiLevel');
  var detailEl = container.querySelector('#bmiDetail');

  function levelOf(bmi) {
    if (bmi < 18.5) return { text: '偏瘦', cls: 'warn' };
    if (bmi < 24) return { text: '正常', cls: 'ok' };
    if (bmi < 28) return { text: '超重', cls: 'warn' };
    return { text: '肥胖', cls: 'bad' };
  }

  container.querySelector('#bmiCalc').onclick = function () {
    errorEl.textContent = '';
    var h = parseFloat(height.value);
    var w = parseFloat(weight.value);
    if (!isFinite(h) || h <= 0) {
      errorEl.textContent = '请输入有效的身高';
      return;
    }
    if (!isFinite(w) || w <= 0) {
      errorEl.textContent = '请输入有效的体重';
      return;
    }
    var m = h / 100;
    var bmi = w / (m * m);
    var lv = levelOf(bmi);

    valueEl.textContent = bmi.toFixed(1);
    levelEl.textContent = lv.text;
    levelEl.className = 'tool-badge ' + lv.cls;

    var minW = 18.5 * m * m;
    var maxW = 23.9 * m * m;
    detailEl.textContent =
      '身高：' + h + ' cm　体重：' + w + ' kg\n' +
      'BMI：' + bmi.toFixed(2) + '（' + lv.text + '）\n' +
      '健康体重范围：' + minW.toFixed(1) + ' ~ ' + maxW.toFixed(1) + ' kg';
  };

  container.querySelector('#bmiClear').onclick = function () {
    height.value = '';
    weight.value = '';
    errorEl.textContent = '';
    valueEl.textContent = '--';
    levelEl.textContent = '待计算';
    levelEl.className = 'tool-badge';
    detailEl.textContent = '请输入身高与体重后点击计算。';
  };
};
