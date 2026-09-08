/* 塔罗牌：调用 OIAPI Tarot，抽取 4 张牌并解读（仅供娱乐）
 * 接口已实测开放 CORS（Access-Control-Allow-Origin: *），可页内直接读取。 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createTarot = function (container) {
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  container.innerHTML = `
    <div class="tool-card tr-card">
      <div class="tr-head">
        <h3 class="tool-title">塔罗牌占卜 🔮</h3>
        <p class="tr-sub">静心默念你的问题，点击开始，抽取四张牌为你解读（仅供娱乐）</p>
      </div>
      <div class="tr-form">
        <input class="tool-input tr-input" id="trQuestion" type="text" maxlength="60" placeholder="（可选）在心里默念你的问题…" />
        <button class="tool-btn primary" id="trDrawBtn">开始占卜</button>
        <button class="tool-btn" id="trResetBtn">重置</button>
      </div>
      <div class="tr-result" id="trResult">
        <div class="tool-empty">
          <div class="tool-empty-icon">🔮</div>
          <p>点击「开始占卜」抽取你的塔罗牌</p>
        </div>
      </div>
      <div class="tr-status" id="trStatus"></div>
    </div>`;

  var qEl = container.querySelector('#trQuestion');
  var drawBtn = container.querySelector('#trDrawBtn');
  var resetBtn = container.querySelector('#trResetBtn');
  var resultEl = container.querySelector('#trResult');
  var statusEl = container.querySelector('#trStatus');

  function setStatus(msg, type) {
    statusEl.textContent = msg || '';
    statusEl.className = 'tr-status' + (type ? ' ' + type : '');
  }

  function makeImg(pic) {
    var img = document.createElement('img');
    img.className = 'tr-img';
    img.alt = 'tarot';
    img.loading = 'lazy';
    img.referrerPolicy = 'no-referrer';
    img.src = pic || '';
    img.addEventListener('error', function () {
      var ph = document.createElement('div');
      ph.className = 'tr-img tr-img-fallback';
      ph.textContent = '🔮';
      if (img.parentNode) img.parentNode.replaceChild(ph, img);
    });
    var wrap = document.createElement('div');
    wrap.className = 'tr-img-wrap';
    wrap.appendChild(img);
    return wrap;
  }

  function cardHtml(it) {
    var isRev = it.type === '逆位';
    var orientation = isRev ? '逆位' : '正位';
    var reading = isRev ? (it['逆位'] || '') : (it['正位'] || '');

    var card = document.createElement('div');
    card.className = 'tr-item';

    var pos = document.createElement('div');
    pos.className = 'tr-pos';
    pos.textContent = it.position || '';
    card.appendChild(pos);

    var posDesc = document.createElement('div');
    posDesc.className = 'tr-posdesc';
    posDesc.textContent = it.meaning || '';
    card.appendChild(posDesc);

    card.appendChild(makeImg(it.pic));

    var name = document.createElement('div');
    name.className = 'tr-name';
    var cn = document.createElement('span');
    cn.className = 'tr-name-cn';
    cn.textContent = it.name_cn || '';
    name.appendChild(cn);
    if (it.name_en) {
      var en = document.createElement('span');
      en.className = 'tr-name-en';
      en.textContent = ' ' + it.name_en;
      name.appendChild(en);
    }
    card.appendChild(name);

    var badge = document.createElement('div');
    badge.className = 'tr-badge ' + (isRev ? 'rev' : 'up');
    badge.textContent = orientation;
    card.appendChild(badge);

    var readingEl = document.createElement('div');
    readingEl.className = 'tr-reading';
    readingEl.textContent = reading;
    card.appendChild(readingEl);

    return card;
  }

  function render(d) {
    var data = d.data || [];
    resultEl.innerHTML = '';
    if (!data.length) {
      resultEl.innerHTML = '<div class="tool-empty"><p>本次没有抽到牌，请重试</p></div>';
      return;
    }
    var grid = document.createElement('div');
    grid.className = 'tr-grid';
    data.forEach(function (it) {
      grid.appendChild(cardHtml(it));
    });
    resultEl.appendChild(grid);

    if (window.DaibaoMotion && window.DaibaoMotion.onContentChange) {
      try {
        window.DaibaoMotion.onContentChange(resultEl);
      } catch (e) {
        /* 动效异常不影响功能 */
      }
    }
  }

  function draw() {
    setStatus('正在洗牌…');
    drawBtn.disabled = true;
    resetBtn.disabled = true;

    fetch('https://www.oiapi.net/api/Tarot')
      .then(function (r) {
        return r.json();
      })
      .then(function (json) {
        if (!json || json.code !== 1 || !json.data) {
          throw new Error((json && json.message) || '返回数据异常');
        }
        render(json);
        setStatus('占卜完成（仅供娱乐）', 'ok');
      })
      .catch(function (err) {
        resultEl.innerHTML =
          '<div class="tool-empty"><div class="tool-empty-icon">⚠️</div><p>占卜失败：' +
          escapeHtml(err.message) +
          '</p></div>';
        setStatus('占卜失败：' + err.message, 'warn');
      })
      .finally(function () {
        drawBtn.disabled = false;
        resetBtn.disabled = false;
      });
  }

  function reset() {
    qEl.value = '';
    resultEl.innerHTML =
      '<div class="tool-empty"><div class="tool-empty-icon">🔮</div><p>点击「开始占卜」抽取你的塔罗牌</p></div>';
    setStatus('');
  }

  drawBtn.addEventListener('click', draw);
  resetBtn.addEventListener('click', reset);
  qEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') draw();
  });
};
