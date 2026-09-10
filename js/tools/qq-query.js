/* QQ账号查询：信息查询 L3，调用 OIAPI QQMemberInfo 接口（需用户自备 apikey） */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createQqQuery = function (container) {
  // 简单 HTML 转义，避免接口返回内容造成注入
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  container.innerHTML = `
    <div class="iql-tool">
      <div class="iql-header">
        <h2 class="iql-title">QQ 账号查询</h2>
        <p class="iql-subtitle">通过 OIAPI 的 QQMemberInfo 接口查询 QQ 账号的昵称、性别、年龄、头像、注册时间与个性签名。</p>
      </div>

      <div class="iql-form">
        <div class="iql-row">
          <div class="iql-field">
            <label class="iql-label" for="iqlUin">QQ 账号</label>
            <input class="iql-input" id="iqlUin" type="text" inputmode="numeric" autocomplete="off" placeholder="例如 10001" />
          </div>
          <div class="iql-field">
            <label class="iql-label" for="iqlKey">API Key</label>
            <input class="iql-input" id="iqlKey" type="text" autocomplete="off" placeholder="在 OIAPI 加群免费获取" />
          </div>
        </div>
        <div class="iql-row iql-row-actions">
          <label class="iql-remember"><input type="checkbox" id="iqlRemember" /> 记住 Key（仅存本机）</label>
          <button class="iql-submit" id="iqlSubmit">查询</button>
        </div>
        <p class="iql-hint">该接口需使用 apikey 访问（<a href="https://www.oiapi.net/doc/id/77.html" target="_blank" rel="noopener noreferrer">文档</a>）。Key 仅保存在本机浏览器 localStorage，不会上传任何第三方。</p>
      </div>

      <div class="iql-error" id="iqlError" hidden></div>
      <div class="iql-result" id="iqlResult" hidden></div>
    </div>`;

  var uinInput = container.querySelector('#iqlUin');
  var keyInput = container.querySelector('#iqlKey');
  var remember = container.querySelector('#iqlRemember');
  var submit = container.querySelector('#iqlSubmit');
  var errorBox = container.querySelector('#iqlError');
  var resultBox = container.querySelector('#iqlResult');

  // 读取记忆的 key
  try {
    var saved = localStorage.getItem('daibao_qq_key');
    if (saved) {
      keyInput.value = saved;
      remember.checked = true;
    }
  } catch (e) {
    /* localStorage 不可用时静默忽略 */
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.hidden = false;
    resultBox.hidden = true;
  }

  function hideError() {
    errorBox.hidden = true;
    errorBox.textContent = '';
  }

  function buildResult(d) {
    var avatar = d.cover || '';
    var rows = [
      { label: 'QQ 账号', value: d.uin },
      { label: '昵称', value: d.name },
      { label: '性别', value: d.sex },
      { label: '年龄', value: d.age },
      { label: '注册时间', value: d.register },
      { label: '状态', value: d.status },
      { label: '个性签名', value: d.sign },
    ];

    var cells = rows
      .map(function (r) {
        var v = r.value;
        var text = v === undefined || v === null || v === '' ? '—' : String(v);
        return (
          '<div class="iql-item">' +
          '<div class="iql-item-label">' + esc(r.label) + '</div>' +
          '<div class="iql-item-value">' + esc(text) + '</div>' +
          '</div>'
        );
      })
      .join('');

    var avatarHtml = '';
    if (avatar) {
      avatarHtml =
        '<div class="iql-avatar-wrap">' +
        '<img class="iql-avatar" src="' + esc(avatar) + '" alt="头像" referrerpolicy="no-referrer" onerror="this.style.display=\'none\'" />' +
        '</div>';
    }

    return '<div class="iql-card">' + avatarHtml + '<div class="iql-grid">' + cells + '</div></div>';
  }

  function query() {
    hideError();

    var uin = uinInput.value.trim();
    var key = keyInput.value.trim();

    if (!/^\d{4,15}$/.test(uin)) {
      showError('请输入有效的 QQ 账号（4-15 位纯数字）');
      return;
    }
    if (!key) {
      showError('请填写 API Key（在 OIAPI 加群免费获取，文档见上方链接）');
      return;
    }

    // 记住 / 清除 key
    try {
      if (remember.checked) localStorage.setItem('daibao_qq_key', key);
      else localStorage.removeItem('daibao_qq_key');
    } catch (e) {
      /* 忽略存储异常 */
    }

    submit.disabled = true;
    submit.textContent = '查询中…';

    var url =
      'https://www.oiapi.net/api/QQMemberInfo?uin=' +
      encodeURIComponent(uin) +
      '&type=json&key=' +
      encodeURIComponent(key);

    fetch(url, { headers: { Accept: 'application/json' } })
      .then(function (res) {
        return res.json();
      })
      .then(function (json) {
        submit.disabled = false;
        submit.textContent = '查询';

        if (json && typeof json.code === 'number' && json.code < 0) {
          showError('查询失败：' + (json.message || 'code ' + json.code));
          return;
        }

        var d = json ? json.data : null;
        if (Array.isArray(d)) d = d[0] || null;
        if (!d || typeof d !== 'object' || Object.keys(d).length === 0) {
          showError('未查询到该 QQ 账号的信息，请确认账号与 Key 是否正确');
          return;
        }

        resultBox.innerHTML = buildResult(d);
        resultBox.hidden = false;
      })
      .catch(function (err) {
        submit.disabled = false;
        submit.textContent = '查询';
        showError('网络请求失败：' + err.message);
      });
  }

  submit.addEventListener('click', query);
  uinInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') query();
  });
  keyInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') query();
  });
};
