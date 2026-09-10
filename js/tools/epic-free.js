/* Epic 免费游戏：查询 Epic 周免游戏列表（OIAPI / EpicFree） */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createEpicFree = function (container) {
  container.innerHTML = `
    <div class="epic-card">
      <div class="epic-head">
        <h2 class="epic-title">🎮 Epic 免费游戏</h2>
        <p class="epic-sub">Epic 商城每周限免游戏一览，含当前可领与即将免费</p>
      </div>
      <div class="epic-controls">
        <button class="tool-btn tool-btn-primary" type="button" id="epicRefresh">刷新列表</button>
        <span class="epic-updated" id="epicUpdated"></span>
      </div>
      <div class="epic-result" id="epicResult">
        <div class="epic-loading">正在拉取 Epic 周免清单…</div>
      </div>
    </div>
  `;

  var refreshBtn = container.querySelector('#epicRefresh');
  var updatedEl = container.querySelector('#epicUpdated');
  var result = container.querySelector('#epicResult');
  var loading = false;

  function str(v) {
    return v == null ? '' : String(v);
  }

  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  function fmtTime(s) {
    // 接口返回形如 "2026-09-03 23:00:00"，直接展示
    return str(s);
  }

  function badgeFor(item) {
    // status: 1 表示当前已开启（可领）
    if (item.status === 1) {
      return { text: '当前免费', cls: 'epic-badge epic-badge-on' };
    }
    return { text: '即将免费', cls: 'epic-badge epic-badge-soon' };
  }

  function renderList(list) {
    result.innerHTML = '';

    if (!Array.isArray(list) || !list.length) {
      var empty = document.createElement('div');
      empty.className = 'tool-empty';
      empty.innerHTML = '<div class="tool-empty-icon">🎮</div>';
      var h = document.createElement('h3');
      h.textContent = '暂时没有可免费领取的游戏';
      var p = document.createElement('p');
      p.textContent = 'Epic 周免清单为空，稍后再来看看吧';
      empty.appendChild(h);
      empty.appendChild(p);
      result.appendChild(empty);
      return;
    }

    var grid = document.createElement('div');
    grid.className = 'epic-grid';

    list.forEach(function (item) {
      var card = document.createElement('div');
      card.className = 'epic-game';

      var top = document.createElement('div');
      top.className = 'epic-game-top';

      var title = document.createElement('div');
      title.className = 'epic-game-title';
      title.textContent = str(item.title) || '未知游戏';

      var badge = badgeFor(item);
      var b = document.createElement('span');
      b.className = badge.cls;
      b.textContent = badge.text;
      top.appendChild(title);
      top.appendChild(b);

      var seller = document.createElement('div');
      seller.className = 'epic-game-seller';
      seller.textContent = '厂商：' + (item.seller && item.seller.name ? str(item.seller.name) : '未知');

      var desc = document.createElement('div');
      desc.className = 'epic-game-desc';
      desc.textContent = str(item.desc) || '（暂无简介）';

      var time = document.createElement('div');
      time.className = 'epic-game-time';
      time.textContent =
        '免费期：' + fmtTime(item.start_time) + ' ~ ' + fmtTime(item.end_time);

      card.appendChild(top);
      card.appendChild(seller);
      card.appendChild(desc);
      card.appendChild(time);
      grid.appendChild(card);
    });

    result.appendChild(grid);
  }

  function showError(msg) {
    result.innerHTML = '';
    var box = document.createElement('div');
    box.className = 'tool-empty';
    box.innerHTML = '<div class="tool-empty-icon">⚠️</div>';
    var h = document.createElement('h3');
    h.textContent = '没能拿到 Epic 免费游戏';
    var p = document.createElement('p');
    p.textContent = msg || '请稍后再试一次';
    box.appendChild(h);
    box.appendChild(p);
    result.appendChild(box);
  }

  function load() {
    if (loading) return;
    loading = true;
    refreshBtn.disabled = true;
    result.innerHTML = '<div class="epic-loading">正在拉取 Epic 周免清单…</div>';

    fetch('https://www.oiapi.net/api/EpicFree?type=json')
      .then(function (resp) {
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        return resp.json();
      })
      .then(function (json) {
        if (json.code !== 1 || !json.data) {
          throw new Error(json.message || '接口未返回有效数据');
        }
        // 当前可领（status=1）优先排前
        var list = json.data.slice().sort(function (a, b) {
          return (b.status === 1 ? 1 : 0) - (a.status === 1 ? 1 : 0);
        });
        renderList(list);
        var now = new Date();
        updatedEl.textContent =
          '更新于 ' +
          now.getFullYear() +
          '-' +
          pad(now.getMonth() + 1) +
          '-' +
          pad(now.getDate()) +
          ' ' +
          pad(now.getHours()) +
          ':' +
          pad(now.getMinutes());
      })
      .catch(function (err) {
        showError(err.message || '网络或跨域读取失败');
      })
      .finally(function () {
        loading = false;
        refreshBtn.disabled = false;
      });
  }

  refreshBtn.addEventListener('click', load);

  // 进入即自动拉取
  load();

  if (window.DaibaoMotion && window.DaibaoMotion.onContentChange) {
    try {
      window.DaibaoMotion.onContentChange(container);
    } catch (e) {
      /* 动效异常不影响功能 */
    }
  }
};
