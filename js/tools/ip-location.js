/* 网络工具 / IP定位（开发工具 L3），数据来自 OIAPI id/112 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createIpLocation = function createIpLocation(container) {
  container.innerHTML = `
    <div class="ipl-tool">
      <div class="ipl-header">
        <h2 class="ipl-title">📍 IP 定位</h2>
        <p class="ipl-subtitle">输入 IPv4 地址，查询其归属地、运营商与所在时区（数据来自 OIAPI）</p>
      </div>

      <form class="ipl-form" id="iplForm" novalidate>
        <div class="ipl-row">
          <div class="ipl-field ipl-field-grow">
            <label class="ipl-label" for="iplInput">IPv4 地址</label>
            <input
              type="text"
              id="iplInput"
              class="ipl-input"
              placeholder="例如 114.114.114.114、8.8.8.8"
              autocomplete="off"
              spellcheck="false"
            />
          </div>
          <button type="submit" class="ipl-submit" id="iplSubmit">查询</button>
        </div>
        <p class="ipl-error" id="iplError"></p>
      </form>

      <div class="ipl-result" id="iplResult" hidden>
        <div class="ipl-grid" id="iplGrid"></div>
        <p class="ipl-meta" id="iplMeta"></p>
      </div>
    </div>
  `;

  const form = container.querySelector('#iplForm');
  const input = container.querySelector('#iplInput');
  const submitBtn = container.querySelector('#iplSubmit');
  const errorEl = container.querySelector('#iplError');
  const resultEl = container.querySelector('#iplResult');
  const gridEl = container.querySelector('#iplGrid');
  const metaEl = container.querySelector('#iplMeta');

  const ipv4Re = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

  function setError(msg) {
    errorEl.textContent = msg || '';
  }

  function makeItem(label, value) {
    const item = document.createElement('div');
    item.className = 'ipl-item';
    const l = document.createElement('span');
    l.className = 'ipl-item-label';
    l.textContent = label;
    const v = document.createElement('span');
    v.className = 'ipl-item-value';
    v.textContent = (value === null || value === undefined || value === '') ? '—' : String(value);
    item.appendChild(l);
    item.appendChild(v);
    return item;
  }

  function renderResult(d) {
    gridEl.innerHTML = '';

    gridEl.appendChild(makeItem('IP 地址', d.IP));
    gridEl.appendChild(makeItem('归属地', d.address));
    gridEl.appendChild(makeItem('国家/地区', d.country));
    gridEl.appendChild(makeItem('省份/州', d.region));
    gridEl.appendChild(makeItem('城市', d.city));
    gridEl.appendChild(makeItem('运营商 / 机构', d.organization));
    gridEl.appendChild(makeItem('时区', d.timezone));

    metaEl.textContent = '查询结果：' + (d.address || '—') +
      (d.organization ? '（' + d.organization + '）' : '');

    resultEl.hidden = false;
  }

  async function query() {
    const ip = input.value.trim();
    setError('');
    if (!ip) {
      setError('请输入要查询的 IPv4 地址');
      input.focus();
      return;
    }
    if (!ipv4Re.test(ip)) {
      setError('格式不正确，请输入合法的 IPv4 地址（如 114.114.114.114）');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = '查询中…';
    resultEl.hidden = true;

    try {
      const url = 'https://www.oiapi.net/api/Ip?ip=' + encodeURIComponent(ip);
      const resp = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!resp.ok) throw new Error('接口返回 HTTP ' + resp.status);
      const json = await resp.json();
      if (json.code !== 1 || !json.data) {
        throw new Error(json.message || '未获取到定位信息');
      }
      renderResult(json.data);
    } catch (e) {
      resultEl.hidden = true;
      setError('查询失败：' + (e && e.message ? e.message : '网络异常'));
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '查询';
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    query();
  });

  if (window.DaibaoMotion && window.DaibaoMotion.onContentChange) {
    try {
      window.DaibaoMotion.onContentChange(container);
    } catch (e) {
      /* 动效异常不影响功能 */
    }
  }
};
