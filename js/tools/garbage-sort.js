/* 垃圾分类（生活工具 · 三级页面）：查询垃圾所属分类，调用 OIAPI WasteSorting 接口（doc id/64） */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createGarbageSort = function (container) {
  // 接口两种模式：
  //   - 分类模式（n=1）：返回 data.waste（最佳匹配名）+ data.name（类别）+ message（如「塑料是可回收垃圾」）
  //   - 列表模式（不带 n）：返回 data.list（候选垃圾名数组），用于精确选择
  var API = 'https://www.oiapi.net/api/WasteSorting';

  // 类别关键字 -> 配色（参考上海四分类标准色）
  var CAT_COLORS = {
    '可回收': '#2563eb',
    '有害': '#e5484d',
    '湿': '#a8651a',
    '干': '#6b7280',
    '大件': '#7c3aed',
  };
  function catColor(name) {
    if (!name) return '#6b7280';
    for (var k in CAT_COLORS) {
      if (name.indexOf(k) !== -1) return CAT_COLORS[k];
    }
    return '#6b7280';
  }

  container.innerHTML = `
    <div class="tool-card gbg-card">
      <h2 class="tool-title">垃圾分类查询</h2>
      <p class="gbg-desc">输入垃圾名称，查询它属于哪一类（数据源：<a href="https://www.oiapi.net/doc/id/64.html" target="_blank" rel="noopener noreferrer">OIAPI 垃圾分类</a>）。返回「最佳匹配」与「更多可能」，点击候选可精确查询。</p>

      <div class="gbg-legend">
        <span class="gbg-leg" style="background:#2563eb">可回收</span>
        <span class="gbg-leg" style="background:#e5484d">有害</span>
        <span class="gbg-leg" style="background:#a8651a">湿</span>
        <span class="gbg-leg" style="background:#6b7280">干</span>
        <span class="gbg-leg" style="background:#7c3aed">大件</span>
      </div>

      <div class="gbg-form">
        <div class="gbg-input-row">
          <input type="text" class="gbg-input" id="gbgInput" placeholder="例如：电池、塑料瓶、苹果核、纸箱" maxlength="20" autocomplete="off" />
          <button class="gbg-submit" id="gbgBtn" type="button">查询分类</button>
        </div>
      </div>
      <div class="gbg-error" id="gbgErr" hidden></div>

      <div class="gbg-result" id="gbgResult">
        <div id="gbgBest"></div>
        <div id="gbgList"></div>
      </div>
    </div>`;

  var input = container.querySelector('#gbgInput');
  var btn = container.querySelector('#gbgBtn');
  var errBox = container.querySelector('#gbgErr');
  var best = container.querySelector('#gbgBest');
  var list = container.querySelector('#gbgList');

  function showErr(msg) {
    errBox.textContent = msg;
    errBox.hidden = false;
  }
  function hideErr() {
    errBox.hidden = true;
    errBox.textContent = '';
  }
  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }

  // 统一请求：n=1 为分类模式，否则为列表模式
  function api(word, withName) {
    var url =
      API +
      '?word=' + encodeURIComponent(word) +
      (withName ? '&n=1' : '') +
      '&type=json';
    return fetch(url, { headers: { Accept: 'application/json' } }).then(function (r) {
      return r.json();
    });
  }

  function renderBest(bj, word) {
    best.innerHTML = '';
    if (bj && bj.code === 1 && bj.data && bj.data.name) {
      var data = bj.data;
      var color = catColor(data.name);
      var card = el('div', 'gbg-best');
      var badge = el('div', 'gbg-badge', data.name);
      badge.style.background = color;
      var msg = el('div', 'gbg-msg', bj.message || (data.waste + ' 是 ' + data.name));
      var sub = el('div', 'gbg-sub', '最佳匹配：' + (data.waste || word));
      card.appendChild(badge);
      card.appendChild(msg);
      card.appendChild(sub);
      best.appendChild(card);
    } else {
      best.appendChild(el('div', 'gbg-hint-box', '未直接匹配到分类，请从下方「更多可能」中选择更精确的名称。'));
    }
  }

  function renderList(lj, word) {
    list.innerHTML = '';
    var items = (lj && lj.code === 1 && lj.data && Array.isArray(lj.data.list)) ? lj.data.list : [];
    if (!items.length) return;
    var wrap = el('div', 'gbg-more');
    wrap.appendChild(el('div', 'gbg-more-title', '更多可能（点击精确查询）'));
    var chips = el('div', 'gbg-chips');
    items.forEach(function (name) {
      var chip = el('button', 'gbg-chip', name);
      chip.type = 'button';
      chip.addEventListener('click', function () {
        chips.querySelectorAll('.gbg-chip').forEach(function (c) {
          c.classList.remove('active');
        });
        chip.classList.add('active');
        classifyExact(name);
      });
      chips.appendChild(chip);
    });
    wrap.appendChild(chips);
    list.appendChild(wrap);
  }

  function classifyExact(name) {
    best.innerHTML = '';
    best.appendChild(el('div', 'gbg-loading', '查询中…'));
    api(name, true)
      .then(function (j) {
        renderBest(j, name);
      })
      .catch(function () {
        best.innerHTML = '';
        best.appendChild(el('div', 'gbg-hint-box', '查询失败，请重试'));
      });
  }

  function doQuery() {
    var word = input.value.trim();
    if (!word) {
      showErr('请输入要查询的垃圾名称');
      input.focus();
      return;
    }
    hideErr();
    best.innerHTML = '';
    list.innerHTML = '';
    best.appendChild(el('div', 'gbg-loading', '查询中…'));
    btn.disabled = true;
    btn.textContent = '查询中…';

    Promise.all([api(word, true), api(word, false)])
      .then(function (vals) {
        btn.disabled = false;
        btn.textContent = '查询分类';
        renderBest(vals[0], word);
        renderList(vals[1], word);

        var hasBest = vals[0] && vals[0].code === 1 && vals[0].data && vals[0].data.name;
        var listItems = (vals[1] && vals[1].data && Array.isArray(vals[1].data.list)) ? vals[1].data.list : [];
        if (!hasBest && !listItems.length) {
          best.innerHTML = '';
          best.appendChild(el('div', 'gbg-hint-box', '未找到「' + word + '」的分类，换个说法试试（如「电池」「塑料瓶」）'));
        }
      })
      .catch(function (err) {
        btn.disabled = false;
        btn.textContent = '查询分类';
        best.innerHTML = '';
        best.appendChild(el('div', 'gbg-error-box', '网络请求失败：' + err.message));
      });
  }

  btn.addEventListener('click', doQuery);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') doQuery();
  });

  if (window.DaibaoMotion && window.DaibaoMotion.onContentChange) {
    try {
      window.DaibaoMotion.onContentChange(container);
    } catch (e) {
      /* 动效异常不影响功能 */
    }
  }
};
