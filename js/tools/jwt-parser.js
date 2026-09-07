/* JWT 解析（仅解码，不校验签名） */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createJwtParser = function (container) {
  container.innerHTML = `
    <div class="tool-wrap">
      <div class="tool-head">
        <div class="tool-title">JWT 解析</div>
        <div class="tool-subtitle">解码 Header / Payload 并解读标准声明（不校验签名）</div>
      </div>

      <div>
        <div class="tool-panel-title">Token</div>
        <textarea class="tool-textarea" id="jwtInput" style="min-height:110px;font-size:13px" placeholder="粘贴 JWT（可带 Bearer 前缀）…"></textarea>
        <div class="tool-btn-row">
          <button class="tool-btn primary" id="jwtParse">解析</button>
          <button class="tool-btn" id="jwtDemo">填入示例</button>
          <button class="tool-btn" id="jwtClear">清空</button>
        </div>
        <div class="tool-error" id="jwtError"></div>
      </div>

      <div id="jwtResult" style="display:none">
        <div class="tool-stats">
          <div class="tool-stat"><div class="tool-stat-num" id="jwtAlg">-</div><div class="tool-stat-label">签名算法 (alg)</div></div>
          <div class="tool-stat"><div class="tool-stat-num" id="jwtType">-</div><div class="tool-stat-label">类型 (typ)</div></div>
          <div class="tool-stat"><div class="tool-stat-num" id="jwtStatus">-</div><div class="tool-stat-label">有效期状态</div></div>
          <div class="tool-stat"><div class="tool-stat-num" id="jwtLeft">-</div><div class="tool-stat-label">剩余有效期</div></div>
        </div>

        <div class="tool-cols" style="margin-top:20px">
          <div class="tool-col">
            <div class="tool-panel-title">Header</div>
            <div class="tool-output" id="jwtHeader" style="min-height:110px"></div>
            <div class="tool-btn-row">
              <button class="tool-btn accent" id="jwtCopyHeader">复制</button>
            </div>
          </div>
          <div class="tool-col">
            <div class="tool-panel-title">Payload</div>
            <div class="tool-output" id="jwtPayload" style="min-height:180px"></div>
            <div class="tool-btn-row">
              <button class="tool-btn accent" id="jwtCopyPayload">复制</button>
            </div>
          </div>
        </div>

        <div style="margin-top:20px">
          <div class="tool-panel-title">标准声明解读</div>
          <div class="tool-table-wrap">
            <table class="tool-table" id="jwtClaimTable">
              <thead><tr><th style="width:70px">声明</th><th style="width:110px">含义</th><th>值</th><th style="width:170px">时间（本地）</th></tr></thead>
              <tbody></tbody>
            </table>
          </div>
        </div>

        <div style="margin-top:20px">
          <div class="tool-panel-title">Signature</div>
          <div class="tool-output" id="jwtSig" style="min-height:60px;word-break:break-all"></div>
          <p class="tool-hint" style="margin-top:10px">
            签名段为原始 Base64URL 文本，未经解码。本工具<strong>不校验签名</strong>——验签需要密钥，且不可在前端安全完成。<br>
            因此页面显示的一切内容都只是 Token 中<strong>声称</strong>的信息，不能证明其真实可信，请勿据此判断身份或授权。
          </p>
        </div>
      </div>
    </div>`;

  var input = container.querySelector('#jwtInput');
  var errorEl = container.querySelector('#jwtError');
  var resultBox = container.querySelector('#jwtResult');

  var CLAIM_DESC = {
    iss: '签发者',
    sub: '主题（用户标识）',
    aud: '受众',
    exp: '过期时间',
    nbf: '生效时间',
    iat: '签发时间',
    jti: '令牌唯一 ID',
  };

  function b64urlDecode(str) {
    var s = str.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var bin = atob(s);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  function fmtDate(ts) {
    var d = new Date(ts * 1000);
    if (isNaN(d.getTime())) return '-';
    return (
      d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
      ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds())
    );
  }

  function fmtLeft(sec) {
    if (sec <= 0) return '已过期';
    var d = Math.floor(sec / 86400);
    var h = Math.floor((sec % 86400) / 3600);
    var m = Math.floor((sec % 3600) / 60);
    var parts = [];
    if (d) parts.push(d + ' 天');
    if (h) parts.push(h + ' 小时');
    if (!d && m) parts.push(m + ' 分钟');
    return parts.join(' ') || '不足 1 分钟';
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function parse() {
    errorEl.textContent = '';
    resultBox.style.display = 'none';
    var raw = input.value.trim().replace(/^Bearer\s+/i, '');
    if (!raw) {
      errorEl.textContent = '请输入 JWT';
      return;
    }
    var parts = raw.split('.');
    if (parts.length !== 3) {
      errorEl.textContent = 'JWT 应由三段组成（header.payload.signature），当前为 ' + parts.length + ' 段';
      return;
    }

    var header, payload;
    try {
      header = JSON.parse(b64urlDecode(parts[0]));
    } catch (e) {
      errorEl.textContent = 'Header 解码失败：' + e.message;
      return;
    }
    try {
      payload = JSON.parse(b64urlDecode(parts[1]));
    } catch (e) {
      errorEl.textContent = 'Payload 解码失败：' + e.message;
      return;
    }

    container.querySelector('#jwtHeader').textContent = JSON.stringify(header, null, 2);
    container.querySelector('#jwtPayload').textContent = JSON.stringify(payload, null, 2);
    container.querySelector('#jwtSig').textContent = parts[2] || '(空签名，alg 可能为 none)';

    container.querySelector('#jwtAlg').textContent = header.alg || '-';
    container.querySelector('#jwtType').textContent = header.typ || '-';

    // 有效期
    var now = Math.floor(Date.now() / 1000);
    var exp = typeof payload.exp === 'number' ? payload.exp : null;
    var nbf = typeof payload.nbf === 'number' ? payload.nbf : null;

    var statusEl = container.querySelector('#jwtStatus');
    var leftEl = container.querySelector('#jwtLeft');

    if (exp === null) {
      statusEl.textContent = '无过期时间';
      statusEl.style.color = '#d97706';
      leftEl.textContent = '-';
      leftEl.style.color = '';
    } else if (now > exp) {
      statusEl.textContent = '已过期';
      statusEl.style.color = '#dc2626';
      leftEl.textContent = fmtLeft(exp - now);
      leftEl.style.color = '#dc2626';
    } else if (nbf !== null && now < nbf) {
      statusEl.textContent = '尚未生效';
      statusEl.style.color = '#d97706';
      leftEl.textContent = fmtLeft(exp - now);
      leftEl.style.color = '#0f6e56';
    } else {
      statusEl.textContent = '有效';
      statusEl.style.color = '#0f6e56';
      leftEl.textContent = fmtLeft(exp - now);
      leftEl.style.color = '#0f6e56';
    }

    // 标准声明
    var rows = [];
    Object.keys(CLAIM_DESC).forEach(function (k) {
      if (payload[k] === undefined) return;
      var isTime = k === 'exp' || k === 'nbf' || k === 'iat';
      rows.push(
        '<tr><td><code>' + k + '</code></td><td>' + CLAIM_DESC[k] + '</td>' +
        '<td><code>' + esc(typeof payload[k] === 'object' ? JSON.stringify(payload[k]) : payload[k]) + '</code></td>' +
        '<td>' + (isTime ? fmtDate(payload[k]) : '-') + '</td></tr>'
      );
    });

    // 其他自定义声明
    var extra = Object.keys(payload).filter(function (k) {
      return CLAIM_DESC[k] === undefined;
    });
    extra.forEach(function (k) {
      var v = payload[k];
      var isTime = /^(exp|nbf|iat)$/.test(k);
      var timeCell = '-';
      if (isTime && typeof v === 'number') timeCell = fmtDate(v);
      rows.push(
        '<tr><td><code>' + esc(k) + '</code></td><td style="color:var(--text-muted)">自定义</td>' +
        '<td><code>' + esc(typeof v === 'object' ? JSON.stringify(v) : v) + '</code></td>' +
        '<td>' + timeCell + '</td></tr>'
      );
    });

    container.querySelector('#jwtClaimTable tbody').innerHTML =
      rows.join('') || '<tr><td colspan="4" style="color:var(--text-muted)">Payload 中没有可展示的声明</td></tr>';

    resultBox.style.display = '';
  }

  container.querySelector('#jwtParse').onclick = parse;

  container.querySelector('#jwtDemo').onclick = function () {
    var now = Math.floor(Date.now() / 1000);
    function b64(obj) {
      var bytes = new TextEncoder().encode(JSON.stringify(obj));
      var bin = '';
      for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    var header = { alg: 'HS256', typ: 'JWT' };
    var payload = {
      iss: 'daibao-toolbox',
      sub: '10086',
      name: '张三',
      role: 'admin',
      iat: now - 3600,
      exp: now + 7200,
    };
    input.value = b64(header) + '.' + b64(payload) + '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    parse();
  };

  container.querySelector('#jwtClear').onclick = function () {
    input.value = '';
    resultBox.style.display = 'none';
    errorEl.textContent = '';
  };

  container.querySelector('#jwtCopyHeader').onclick = function () {
    DaibaoTools.copyText(container.querySelector('#jwtHeader').textContent);
    DaibaoTools.toast('已复制 Header');
  };
  container.querySelector('#jwtCopyPayload').onclick = function () {
    DaibaoTools.copyText(container.querySelector('#jwtPayload').textContent);
    DaibaoTools.toast('已复制 Payload');
  };
};
