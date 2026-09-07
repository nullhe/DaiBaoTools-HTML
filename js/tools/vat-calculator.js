/**
 * 增值税计算器
 * 公式：
 *   不含税销售额 = 含税销售额 ÷ (1 + 税率)
 *   销项税额   = 不含税销售额 × 税率
 *   价税合计   = 含税销售额（原值）
 */

// 挂载到全局命名空间，兼容 file:// 双击打开（不依赖 ES Module）
window.DaibaoTools = window.DaibaoTools || {};
window.DaibaoTools.createVatCalculator = function createVatCalculator(container) {
  container.innerHTML = `
    <div class="vat-calculator">
      <div class="vat-header">
        <div class="vat-title-wrap">
          <span class="vat-title-deco"></span>
          <h2 class="vat-title">增值税计算器</h2>
          <span class="vat-title-deco right"></span>
        </div>
        <p class="vat-subtitle">（计算含税销售额的税额与不含税价格）</p>
      </div>

      <div class="vat-body">
        <!-- 输入数据 -->
        <section class="vat-input-section">
          <h3 class="vat-section-title">输入数据</h3>
          <form class="vat-form" id="vatForm" novalidate>
            <div class="vat-field">
              <label class="vat-label" for="vatSales">含税销售额</label>
              <input
                type="text"
                id="vatSales"
                class="vat-input"
                placeholder="含税销售额"
                inputmode="decimal"
                autocomplete="off"
              />
              <span class="vat-error-msg" id="vatSalesError"></span>
            </div>

            <div class="vat-field">
              <label class="vat-label" for="vatRate">增值税率（征收率）</label>
              <select id="vatRate" class="vat-select">
                <option value="0.13">13%</option>
                <option value="0.09">9%</option>
                <option value="0.06">6%</option>
                <option value="0.05">5%</option>
                <option value="0.03" selected>3%</option>
                <option value="0.00">0%</option>
              </select>
            </div>

            <button type="submit" class="vat-submit" id="vatSubmit">计算结果</button>
          </form>
        </section>

        <!-- 输出结果 -->
        <section class="vat-output-section">
          <h3 class="vat-section-title">输出结果</h3>
          <div class="vat-result-list">
            <div class="vat-result-item">
              <span class="vat-result-label">增值税额</span>
              <div class="vat-result-value" id="vatTaxAmount">0.000</div>
            </div>
            <div class="vat-result-item">
              <span class="vat-result-label">不含税销售额</span>
              <div class="vat-result-value" id="vatExclTaxAmount">0.000</div>
            </div>
            <div class="vat-result-item">
              <span class="vat-result-label">价税合计</span>
              <div class="vat-result-value" id="vatTotalAmount">0.000</div>
            </div>
          </div>
          <p class="vat-formula">
            <strong>提示：</strong><br>
            不含税销售额 = 含税销售额 ÷（1 + 税率）<br>
            销项税额 = 不含税销售额 × 税率<br>
            价税合计 = 含税销售额
          </p>
        </section>
      </div>
    </div>
  `;

  const form = container.querySelector('#vatForm');
  const salesInput = container.querySelector('#vatSales');
  const rateSelect = container.querySelector('#vatRate');
  const salesError = container.querySelector('#vatSalesError');
  const taxAmountEl = container.querySelector('#vatTaxAmount');
  const exclTaxAmountEl = container.querySelector('#vatExclTaxAmount');
  const totalAmountEl = container.querySelector('#vatTotalAmount');

  // 输入校验：只允许数字、小数点与负号（金额不应为负，但这里保留）
  salesInput.addEventListener('input', () => {
    const raw = salesInput.value;
    // 仅保留数字和小数点，并限制最多两位小数
    let cleaned = raw.replace(/[^\d.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts[1] && parts[1].length > 2) {
      cleaned = parts[0] + '.' + parts[1].slice(0, 2);
    }
    if (salesInput.value !== cleaned) {
      salesInput.value = cleaned;
    }
    clearError();
  });

  salesInput.addEventListener('blur', () => {
    validateAndCompute();
  });

  rateSelect.addEventListener('change', () => {
    clearError();
    compute();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validateAndCompute()) {
      salesInput.focus();
    }
  });

  function clearError() {
    salesInput.classList.remove('error');
    salesError.textContent = '';
  }

  function showError(msg) {
    salesInput.classList.add('error');
    salesError.textContent = msg;
  }

  function validate() {
    const value = salesInput.value.trim();
    if (value === '') {
      showError('请输入含税销售额');
      return false;
    }
    const num = parseFloat(value);
    if (Number.isNaN(num)) {
      showError('请输入有效的数字');
      return false;
    }
    if (num < 0) {
      showError('销售额不能为负数');
      return false;
    }
    return true;
  }

  function compute() {
    const value = salesInput.value.trim();
    if (value === '') {
      exclTaxAmountEl.textContent = '0.000';
      taxAmountEl.textContent = '0.000';
      totalAmountEl.textContent = '0.000';
      return;
    }
    const sales = parseFloat(value);
    if (Number.isNaN(sales) || sales < 0) {
      exclTaxAmountEl.textContent = '0.000';
      taxAmountEl.textContent = '0.000';
      totalAmountEl.textContent = '0.000';
      return;
    }
    const rate = parseFloat(rateSelect.value);
    const exclTax = sales / (1 + rate);
    const tax = exclTax * rate;

    exclTaxAmountEl.textContent = formatMoney(exclTax);
    taxAmountEl.textContent = formatMoney(tax);
    totalAmountEl.textContent = formatMoney(sales);
  }

  function validateAndCompute() {
    if (!validate()) {
      exclTaxAmountEl.textContent = '0.000';
      taxAmountEl.textContent = '0.000';
      totalAmountEl.textContent = '0.000';
      return false;
    }
    compute();
    return true;
  }

  function formatMoney(num) {
    return num.toFixed(3);
  }

  // 初始计算（空值时保持默认展示）
  compute();
}
