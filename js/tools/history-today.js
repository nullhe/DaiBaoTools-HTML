/* 历史上的今天：调用 OIAPI HistoryToday，按日期展示当日历史事件
 * 接口已实测开放 CORS（Access-Control-Allow-Origin: *），可页内直接读取。
 * 数据分：今日焦点(featured) / 历史事件(events) / 名人诞生(births) / 名人逝世(deaths) / 节日纪念(holidays)。 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createHistoryToday = function (container) {
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  container.innerHTML = `
    <div class="tool-card ht-card">
      <div class="ht-head">
        <h3 class="tool-title">📜 历史上的今天</h3>
        <p class="ht-sub" id="htSub">看看今天，历史上都发生过什么</p>
      </div>
      <div class="ht-controls">
        <label class="ht-date-label">日期
          <input class="tool-input ht-date" id="htDate" type="date" />
        </label>
        <button class="tool-btn primary" id="htLoadBtn">查询</button>
        <button class="tool-btn" id="htTodayBtn">回到今天</button>
        <button class="tool-btn" id="htCopyBtn">复制全文</button>
      </div>
      <div class="ht-result" id="htResult">
        <div class="tool-empty">
          <div class="tool-empty-icon">📜</div>
          <p>点击「查询」加载今天的历史</p>
        </div>
      </div>
      <div class="ht-status" id="htStatus"></div>
    </div>`;

  var dateEl = container.querySelector('#htDate');
  var loadBtn = container.querySelector('#htLoadBtn');
  var todayBtn = container.querySelector('#htTodayBtn');
  var copyBtn = container.querySelector('#htCopyBtn');
  var resultEl = container.querySelector('#htResult');
  var statusEl = container.querySelector('#htStatus');
  var subEl = container.querySelector('#htSub');

  var lastMessage = ''; // 供「复制全文」使用

  function setStatus(msg, type) {
    statusEl.textContent = msg || '';
    statusEl.className = 'ht-status' + (type ? ' ' + type : '');
  }

  function buildItem(it, showYear) {
    var item = document.createElement('div');
    item.className = 'ht-item';

    if (showYear && it.year != null && it.year !== '') {
      var year = document.createElement('span');
      year.className = 'ht-year';
      year.textContent = String(it.year) + '年';
      item.appendChild(year);
    }

    if (it.link) {
      var a = document.createElement('a');
      a.className = 'ht-text';
      a.href = it.link;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = it.text || '';
      item.appendChild(a);
    } else {
      var span = document.createElement('span');
      span.className = 'ht-text';
      span.textContent = it.text || '';
      item.appendChild(span);
    }
    return item;
  }

  function buildSection(title, icon, list, showYear) {
    if (!list || !list.length) return null;
    var sec = document.createElement('div');
    sec.className = 'ht-section';

    var h = document.createElement('h4');
    h.className = 'ht-section-title';
    h.textContent = icon + ' ' + title + '（' + list.length + '）';
    sec.appendChild(h);

    var ul = document.createElement('div');
    ul.className = 'ht-list';
    list.forEach(function (it) {
      ul.appendChild(buildItem(it, showYear));
    });
    sec.appendChild(ul);
    return sec;
  }

  function buildFeatured(list) {
    if (!list || !list.length) return null;
    var sec = document.createElement('div');
    sec.className = 'ht-section';

    var h = document.createElement('h4');
    h.className = 'ht-section-title';
    h.textContent = '⭐ 今日焦点';
    sec.appendChild(h);

    var grid = document.createElement('div');
    grid.className = 'ht-featured';
    list.forEach(function (it) {
      var card = document.createElement('div');
      card.className = 'ht-feat';

      var year = document.createElement('span');
      year.className = 'ht-feat-year';
      year.textContent = (it.year != null && it.year !== '' ? String(it.year) + '年' : '');
      card.appendChild(year);

      if (it.thumb) {
        var img = document.createElement('img');
        img.className = 'ht-feat-img';
        img.alt = 'thumb';
        img.loading = 'lazy';
        img.referrerPolicy = 'no-referrer';
        img.src = it.thumb;
        img.addEventListener('error', function () {
          img.style.display = 'none';
        });
        card.appendChild(img);
      }

      var text = document.createElement('p');
      text.className = 'ht-feat-text';
      if (it.link) {
        var a = document.createElement('a');
        a.href = it.link;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = it.text || '';
        text.appendChild(a);
      } else {
        text.textContent = it.text || '';
      }
      card.appendChild(text);
      grid.appendChild(card);
    });
    sec.appendChild(grid);
    return sec;
  }

  function render(d) {
    var data = d.data || {};
    resultEl.innerHTML = '';

    lastMessage = d.message || '';

    subEl.textContent = '📅 ' + (data.monthDay || '') + '　数据来源：' + (data.source || '未知') +
      (data.total != null ? '　共 ' + data.total + ' 条' : '');

    if (data.featured) {
      var feat = buildFeatured(data.featured);
      if (feat) resultEl.appendChild(feat);
    }

    var sec = data.sections || {};
    var order = [
      { key: 'events', title: '历史事件', icon: '📖', showYear: true },
      { key: 'births', title: '名人诞生', icon: '🎂', showYear: true },
      { key: 'deaths', title: '名人逝世', icon: '🕊️', showYear: true },
      { key: 'holidays', title: '节日纪念', icon: '🎉', showYear: false },
    ];
    order.forEach(function (o) {
      var secEl = buildSection(o.title, o.icon, sec[o.key], o.showYear);
      if (secEl) resultEl.appendChild(secEl);
    });

    if (!resultEl.children.length) {
      resultEl.innerHTML = '<div class="tool-empty"><p>这一天暂时没有收录到内容</p></div>';
    }

    if (window.DaibaoMotion && window.DaibaoMotion.onContentChange) {
      try {
        window.DaibaoMotion.onContentChange(resultEl);
      } catch (e) {
        /* 动效异常不影响功能 */
      }
    }
  }

  function load() {
    var dateVal = (dateEl.value || '').trim();
    var url = 'https://www.oiapi.net/api/HistoryToday';
    if (dateVal) {
      url += '?date=' + encodeURIComponent(dateVal);
    }
    setStatus('正在加载 ' + (dateVal || '今天') + ' 的历史…');
    loadBtn.disabled = true;
    todayBtn.disabled = true;

    fetch(url)
      .then(function (r) {
        return r.json();
      })
      .then(function (json) {
        if (!json || json.code !== 1 || !json.data) {
          throw new Error((json && json.message) || '返回数据异常');
        }
        render(json);
        setStatus('加载完成', 'ok');
      })
      .catch(function (err) {
        resultEl.innerHTML =
          '<div class="tool-empty"><div class="tool-empty-icon">⚠️</div><p>加载失败：' +
          escapeHtml(err.message) +
          '</p></div>';
        setStatus('加载失败：' + err.message, 'warn');
      })
      .finally(function () {
        loadBtn.disabled = false;
        todayBtn.disabled = false;
      });
  }

  function backToday() {
    dateEl.value = '';
    load();
  }

  function copyAll() {
    if (!lastMessage) {
      window.DaibaoTools.toast('暂无可复制的内容');
      return;
    }
    window.DaibaoTools.copyWithFeedback(lastMessage, copyBtn);
  }

  loadBtn.addEventListener('click', load);
  todayBtn.addEventListener('click', backToday);
  copyBtn.addEventListener('click', copyAll);
  dateEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') load();
  });

  // 首次进入自动加载今天
  load();
};
