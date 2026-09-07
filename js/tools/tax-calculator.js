/* 个人所得税计算器（工资薪金 · 累计预扣预缴法） */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createTaxCalculator = function (container) {
  container.innerHTML = `
    <div class="tool-wrap">
      <div class="tool-head">
        <div class="tool-title">个人所得税计算器</div>
        <div class="tool-subtitle">工资薪金所得 · 累计预扣预缴法（月度 5000 元起征）</div>
      </div>
      <div class="tool-cols">
        <div class="tool-col">
          <div class="tool-panel-title">收入与扣除</div>

          <div class="tool-field">
            <label class="tool-label" for="taxSalary">税前月薪（元）</label>
            <input class="tool-input" type="text" id="taxSalary" inputmode="decimal" placeholder="如 15000">
          </div>

          <div class="tool-field">
            <label class="tool-label" for="taxInsurance">三险一金个人缴纳部分（元/月）</label>
            <input class="tool-input" type="text" id="taxInsurance" inputmode="decimal" placeholder="如 1500">
          </div>

          <div class="tool-field">
            <label class="tool-label" for="taxOther">其他扣除（元/月）</label>
            <input class="tool-input" type="text" id="taxOther" inputmode="decimal" placeholder="如 0">
          </div>

          <div class="tool-panel-title">专项附加扣除（元/月）</div>

          <div class="tool-inline">
            <label class="tool-check"><input type="checkbox" id="spChild"> 子女教育 2000×人数</label>
            <input class="tool-input" type="text" id="spChildNum" inputmode="numeric" value="1" style="max-width:70px">
          </div>
          <div class="tool-inline">
            <label class="tool-check"><input type="checkbox" id="spBaby"> 3岁以下婴幼儿照护 2000×人数</label>
            <input class="tool-input" type="text" id="spBabyNum" inputmode="numeric" value="1" style="max-width:70px">
          </div>
          <div class="tool-inline">
            <label class="tool-check"><input type="checkbox" id="spEdu"> 继续教育（学历）400</label>
          </div>
          <div class="tool-inline">
            <label class="tool-check"><input type="checkbox" id="spLoan"> 住房贷款利息 1000</label>
          </div>
          <div class="tool-inline">
            <label class="tool-check"><input type="checkbox" id="spRent"> 住房租金</label>
            <select class="tool-select" id="spRentVal" style="max-width:170px">
              <option value="1500">直辖市/省会 1500</option>
              <option value="1100">市辖区户籍人口>100万 1100</option>
              <option value="800">市辖区户籍人口≤100万 800</option>
            </select>
          </div>
          <div class="tool-inline">
            <label class="tool-check"><input type="checkbox" id="spElder"> 赡养老人</label>
            <select class="tool-select" id="spElderVal" style="max-width:170px">
              <option value="3000">独生子女 3000</option>
              <option value="1500">非独生分摊 1500</option>
            </select>
          </div>

          <div class="tool-stat" style="text-align:left">
            <div class="tool-stat-num" id="taxSpecialSum">0</div>
            <div class="tool-stat-label">专项附加扣除合计（元/月）</div>
          </div>

          <div class="tool-panel-title">年终奖（可选，单独计税）</div>
          <div class="tool-field">
            <label class="tool-label" for="taxBonus">全年一次性奖金（元）</label>
            <input class="tool-input" type="text" id="taxBonus" inputmode="decimal" placeholder="不填则不计">
          </div>

          <div class="tool-btn-row">
            <button class="tool-btn primary" id="taxCalc">计算</button>
            <button class="tool-btn" id="taxReset">重置</button>
          </div>
          <div class="tool-error" id="taxError"></div>
        </div>

        <div class="tool-col">
          <div class="tool-panel-title">计算结果</div>

          <div class="tool-stats">
            <div class="tool-stat">
              <div class="tool-stat-num" id="taxMonth">0.00</div>
              <div class="tool-stat-label">第 <span id="taxMonthIdx">1</span> 月应缴个税</div>
            </div>
            <div class="tool-stat">
              <div class="tool-stat-num" id="taxNet">0.00</div>
              <div class="tool-stat-label">该月到手工资</div>
            </div>
            <div class="tool-stat">
              <div class="tool-stat-num" id="taxYear">0.00</div>
              <div class="tool-stat-label">全年个税合计</div>
            </div>
            <div class="tool-stat">
              <div class="tool-stat-num" id="taxRate">0%</div>
              <div class="tool-stat-label">全年税负率</div>
            </div>
          </div>

          <div id="taxBonusBox" style="display:none">
            <div class="tool-panel-title">年终奖（单独计税）</div>
            <div class="tool-stats">
              <div class="tool-stat">
                <div class="tool-stat-num" id="taxBonusTax">0.00</div>
                <div class="tool-stat-label">年终奖应缴个税</div>
              </div>
              <div class="tool-stat">
                <div class="tool-stat-num" id="taxBonusNet">0.00</div>
                <div class="tool-stat-label">年终奖到手</div>
              </div>
            </div>
          </div>

          <div class="tool-panel-title">全年 12 个月明细</div>
          <div class="tool-table-wrap">
            <table class="tool-table" id="taxTable">
              <thead>
                <tr>
                  <th>月份</th>
                  <th>累计应税所得</th>
                  <th>适用税率</th>
                  <th>本月个税</th>
                  <th>本月到手</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>

          <p class="tool-hint">
            计算依据：累计预扣预缴应纳税所得额 = 累计收入 − 累计减除费用(5000×月数) − 累计专项扣除(三险一金) − 累计专项附加扣除 − 累计其他扣除；<br>
            本月应预扣 = 累计应纳税额(按年度综合所得税率表) − 上月累计已预扣。<br>
            年终奖按「单独计税」政策（现行政策延续至 2027 年底），以奖金 ÷ 12 查月度税率表。<br>
            <strong>提示：</strong>大病医疗按年度汇算扣除，不在月度预扣中体现；本结果为估算，实际以税务机关汇算清缴为准。
          </p>
        </div>
      </div>
    </div>`;

  var salaryEl = container.querySelector('#taxSalary');
  var insuranceEl = container.querySelector('#taxInsurance');
  var otherEl = container.querySelector('#taxOther');
  var bonusEl = container.querySelector('#taxBonus');
  var errorEl = container.querySelector('#taxError');
  var specialSumEl = container.querySelector('#taxSpecialSum');
  var tbody = container.querySelector('#taxTable tbody');
  var bonusBox = container.querySelector('#taxBonusBox');

  // 年度综合所得预扣率表：[上限, 税率, 速算扣除数]
  var YEAR_TABLE = [
    [36000, 0.03, 0],
    [144000, 0.1, 2520],
    [300000, 0.2, 16920],
    [420000, 0.25, 31920],
    [660000, 0.3, 52920],
    [960000, 0.35, 85920],
    [Infinity, 0.45, 181920],
  ];

  // 月度税率表（年终奖单独计税用）
  var MONTH_TABLE = [
    [3000, 0.03, 0],
    [12000, 0.1, 210],
    [25000, 0.2, 1410],
    [35000, 0.25, 2660],
    [55000, 0.3, 4410],
    [80000, 0.35, 7160],
    [Infinity, 0.45, 15160],
  ];

  function lookup(table, amount) {
    for (var i = 0; i < table.length; i++) {
      if (amount <= table[i][0]) return table[i];
    }
    return table[table.length - 1];
  }

  function money(n) {
    return n.toFixed(2);
  }

  function num(id, def) {
    var v = parseFloat(container.querySelector(id).value);
    if (isNaN(v) || v < 0) return def === undefined ? 0 : def;
    return v;
  }

  function calcSpecial() {
    var sum = 0;
    if (container.querySelector('#spChild').checked) {
      sum += 2000 * Math.max(0, Math.floor(num('#spChildNum', 0)));
    }
    if (container.querySelector('#spBaby').checked) {
      sum += 2000 * Math.max(0, Math.floor(num('#spBabyNum', 0)));
    }
    if (container.querySelector('#spEdu').checked) sum += 400;
    if (container.querySelector('#spLoan').checked) sum += 1000;
    if (container.querySelector('#spRent').checked) {
      sum += parseFloat(container.querySelector('#spRentVal').value) || 0;
    }
    if (container.querySelector('#spElder').checked) {
      sum += parseFloat(container.querySelector('#spElderVal').value) || 0;
    }
    specialSumEl.textContent = money(sum);
    return sum;
  }

  function compute() {
    errorEl.textContent = '';
    var salary = num('#taxSalary', 0);
    if (salary <= 0) {
      errorEl.textContent = '请填写税前月薪';
      return;
    }
    var insurance = num('#taxInsurance', 0);
    var other = num('#taxOther', 0);
    var special = calcSpecial();

    var monthlyDeduct = 5000 + insurance + special + other;
    var rows = [];
    var prevCumTax = 0;
    var yearTax = 0;

    for (var m = 1; m <= 12; m++) {
      var cumIncome = salary * m;
      var cumTaxable = cumIncome - monthlyDeduct * m;
      if (cumTaxable < 0) cumTaxable = 0;
      var row = lookup(YEAR_TABLE, cumTaxable);
      var cumTax = cumTaxable * row[1] - row[2];
      if (cumTax < 0) cumTax = 0;
      var monthTax = cumTax - prevCumTax;
      if (monthTax < 0) monthTax = 0;
      prevCumTax = cumTax;
      yearTax += monthTax;

      rows.push({
        month: m,
        cumTaxable: cumTaxable,
        rate: row[1],
        tax: monthTax,
        net: salary - insurance - monthTax,
      });
    }

    tbody.innerHTML = rows
      .map(function (r) {
        return (
          '<tr><td>' + r.month + ' 月</td>' +
          '<td>' + money(r.cumTaxable) + '</td>' +
          '<td>' + (r.rate * 100).toFixed(0) + '%</td>' +
          '<td>' + money(r.tax) + '</td>' +
          '<td>' + money(r.net) + '</td></tr>'
        );
      })
      .join('');

    container.querySelector('#taxMonth').textContent = money(rows[0].tax);
    container.querySelector('#taxMonthIdx').textContent = '1';
    container.querySelector('#taxNet').textContent = money(rows[0].net);
    container.querySelector('#taxYear').textContent = money(yearTax);

    var yearIncome = salary * 12;
    container.querySelector('#taxRate').textContent =
      yearIncome > 0 ? ((yearTax / yearIncome) * 100).toFixed(2) + '%' : '0%';

    // 年终奖单独计税
    var bonus = num('#taxBonus', 0);
    if (bonus > 0) {
      var bRow = lookup(MONTH_TABLE, bonus / 12);
      var bTax = bonus * bRow[1] - bRow[2];
      if (bTax < 0) bTax = 0;
      bonusBox.style.display = '';
      container.querySelector('#taxBonusTax').textContent = money(bTax);
      container.querySelector('#taxBonusNet').textContent = money(bonus - bTax);
    } else {
      bonusBox.style.display = 'none';
    }
  }

  container.querySelectorAll('.tool-check input, .tool-select').forEach(function (el) {
    el.addEventListener('change', calcSpecial);
  });
  container.querySelectorAll('#spChildNum, #spBabyNum').forEach(function (el) {
    el.addEventListener('input', calcSpecial);
  });
  container.querySelector('#taxCalc').onclick = compute;
  container.querySelector('#taxReset').onclick = function () {
    ['#taxSalary', '#taxInsurance', '#taxOther', '#taxBonus'].forEach(function (s) {
      container.querySelector(s).value = '';
    });
    container.querySelectorAll('.tool-check input').forEach(function (el) {
      el.checked = false;
    });
    tbody.innerHTML = '';
    bonusBox.style.display = 'none';
    errorEl.textContent = '';
    calcSpecial();
  };

  calcSpecial();
};
