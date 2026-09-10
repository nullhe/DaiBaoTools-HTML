/* 网络工具 / SSL证书检测（开发工具 L3），数据来自 OIAPI id/147 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createSslCheck = function createSslCheck(container) {
  container.innerHTML = `
    <div class="ssl-tool">
      <div class="ssl-header">
        <h2 class="ssl-title">🔒 SSL 证书检测</h2>
        <p class="ssl-subtitle">输入域名，查询其 HTTPS 证书的有效期、颁发机构与配置信息（数据来自 OIAPI）</p>
      </div>

      <form class="ssl-form" id="sslForm" novalidate>
        <div class="ssl-row">
          <div class="ssl-field ssl-field-grow">
            <label class="ssl-label" for="sslDomain">域名</label>
            <input
              type="text"
              id="sslDomain"
              class="ssl-input"
              placeholder="例如 oiapi.net、github.com"
              autocomplete="off"
              spellcheck="false"
            />
          </div>
          <div class="ssl-field ssl-field-port">
            <label class="ssl-label" for="sslPort">端口</label>
            <input
              type="number"
              id="sslPort"
              class="ssl-input"
              placeholder="443"
              value="443"
              min="1"
              max="65535"
              autocomplete="off"
            />
          </div>
          <button type="submit" class="ssl-submit" id="sslSubmit">检测</button>
        </div>
        <p class="ssl-error" id="sslError"></p>
      </form>

      <div class="ssl-result" id="sslResult" hidden>
        <div class="ssl-status-bar" id="sslStatus"></div>
        <div class="ssl-grid" id="sslGrid"></div>
        <p class="ssl-meta" id="sslMeta"></p>
      </div>
    </div>
  `;

  const form = container.querySelector('#sslForm');
  const domainInput = container.querySelector('#sslDomain');
  const portInput = container.querySelector('#sslPort');
  const submitBtn = container.querySelector('#sslSubmit');
  const errorEl = container.querySelector('#sslError');
  const resultEl = container.querySelector('#sslResult');
  const statusEl = container.querySelector('#sslStatus');
  const gridEl = container.querySelector('#sslGrid');
  const metaEl = container.querySelector('#sslMeta');

  // issuer_detail / subject_detail 可能是字符串化的 JSON 或对象，统一解析
  function parseDetail(obj) {
    if (!obj) return null;
    if (typeof obj === 'string') {
      try { return JSON.parse(obj); } catch (e) { return null; }
    }
    return obj;
  }

  function setError(msg) {
    errorEl.textContent = msg || '';
  }

  function makeItem(label, value) {
    const item = document.createElement('div');
    item.className = 'ssl-item';
    const l = document.createElement('span');
    l.className = 'ssl-item-label';
    l.textContent = label;
    const v = document.createElement('span');
    v.className = 'ssl-item-value';
    v.textContent = (value === null || value === undefined || value === '') ? '—' : String(value);
    item.appendChild(l);
    item.appendChild(v);
    return item;
  }

  function renderResult(d) {
    gridEl.innerHTML = '';

    const issuerDetail = parseDetail(d.issuer_detail);
    const subjectDetail = parseDetail(d.subject_detail);
    const issuerCN = issuerDetail && issuerDetail.CN ? issuerDetail.CN : (d.issuer || '—');
    const subjectCN = subjectDetail && subjectDetail.CN ? subjectDetail.CN : (d.subject || '—');

    // 状态条：按剩余天数着色
    const days = Number(d.expire_days);
    let statusClass = 'ssl-status-ok';
    let statusText = '证书有效';
    if (!isNaN(days)) {
      if (days <= 0) {
        statusClass = 'ssl-status-expired';
        statusText = '证书已过期（剩余 ' + days + ' 天）';
      } else if (days <= 30) {
        statusClass = 'ssl-status-danger';
        statusText = '即将过期（剩余 ' + days + ' 天）';
      } else if (days <= 90) {
        statusClass = 'ssl-status-warn';
        statusText = '需注意续期（剩余 ' + days + ' 天）';
      } else {
        statusText = '证书有效（剩余 ' + days + ' 天）';
      }
    }
    statusEl.className = 'ssl-status-bar ' + statusClass;
    statusEl.textContent = statusText;

    gridEl.appendChild(makeItem('域名', d.domain));
    gridEl.appendChild(makeItem('端口', d.port));
    gridEl.appendChild(makeItem('颁发机构', issuerCN));
    gridEl.appendChild(makeItem('证书主体', subjectCN));
    gridEl.appendChild(makeItem('生效时间', d.start_time));
    gridEl.appendChild(makeItem('过期时间', d.expire_time));
    gridEl.appendChild(makeItem('剩余天数', isNaN(days) ? '—' : days));
    gridEl.appendChild(makeItem('证书版本', d.version));
    gridEl.appendChild(makeItem('签名算法', d.signature_alg));
    gridEl.appendChild(makeItem('序列号', d.serial_number));

    const issuerFull = issuerDetail
      ? [issuerDetail.CN, issuerDetail.O, issuerDetail.C].filter(Boolean).join(' · ')
      : (d.issuer || '');
    const subjectFull = subjectDetail
      ? [subjectDetail.CN, subjectDetail.O, subjectDetail.ST, subjectDetail.L].filter(Boolean).join(' · ')
      : (d.subject || '');
    metaEl.textContent = '颁发者：' + issuerFull + '　|　主体：' + subjectFull;

    resultEl.hidden = false;
  }

  async function detect() {
    const domain = domainInput.value.trim();
    const portRaw = portInput.value.trim();
    setError('');
    if (!domain) {
      setError('请输入要检测的域名');
      domainInput.focus();
      return;
    }
    let port = 443;
    if (portRaw) {
      port = parseInt(portRaw, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        setError('端口需在 1 ~ 65535 之间');
        return;
      }
    }

    submitBtn.disabled = true;
    submitBtn.textContent = '检测中…';
    resultEl.hidden = true;

    try {
      const url =
        'https://www.oiapi.net/api/CsrSSL?domain=' +
        encodeURIComponent(domain) +
        '&port=' + port +
        '&type=json';
      const resp = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!resp.ok) throw new Error('接口返回 HTTP ' + resp.status);
      const json = await resp.json();
      if (json.code !== 1 || !json.data) {
        throw new Error(json.message || '未获取到证书信息');
      }
      renderResult(json.data);
    } catch (e) {
      resultEl.hidden = true;
      setError('检测失败：' + (e && e.message ? e.message : '网络异常'));
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '检测';
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    detect();
  });
};
