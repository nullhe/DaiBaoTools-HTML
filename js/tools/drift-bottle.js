/* 漂流瓶：随机捞取一条陌生人留言（OIAPI / DriftBottle） */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createDriftBottle = function (container) {
  container.innerHTML = `
    <div class="db-card">
      <div class="db-head">
        <h2 class="db-title">🍶 漂流瓶</h2>
        <p class="db-sub">捞起一个来自陌生人的悄悄话</p>
      </div>
      <div class="db-controls">
        <button class="tool-btn tool-btn-primary" id="dbPick">捞一个漂流瓶</button>
      </div>
      <div class="db-result" id="dbResult">
        <div class="db-loading">正在海边等待漂流瓶漂来…</div>
      </div>
    </div>
  `;

  var pickBtn = container.querySelector('#dbPick');
  var result = container.querySelector('#dbResult');
  var loading = false;

  function escapeText(text) {
    return String(text == null ? '' : text);
  }

  function renderBottle(item) {
    result.innerHTML = '';

    var bottle = document.createElement('div');
    bottle.className = 'db-bottle';

    var paper = document.createElement('div');
    paper.className = 'db-paper';
    var content = document.createElement('p');
    content.className = 'db-content';
    content.textContent = escapeText(item.content) || '（这条漂流瓶空空如也）';
    paper.appendChild(content);

    var meta = document.createElement('div');
    meta.className = 'db-meta';
    var nick = document.createElement('span');
    nick.className = 'db-nick';
    nick.textContent = '@' + (escapeText(item.nickname) || '匿名');
    meta.appendChild(nick);
    if (item.create_time) {
      var time = document.createElement('span');
      time.className = 'db-time';
      time.textContent = item.create_time;
      meta.appendChild(time);
    }
    bottle.appendChild(paper);
    bottle.appendChild(meta);

    // 回复列表
    var replies = item.replies;
    if (Array.isArray(replies) && replies.length) {
      var repWrap = document.createElement('div');
      repWrap.className = 'db-replies';
      var repTitle = document.createElement('div');
      repTitle.className = 'db-replies-title';
      repTitle.textContent = '瓶中信的回音（' + replies.length + '）';
      repWrap.appendChild(repTitle);
      replies.forEach(function (r) {
        var rep = document.createElement('div');
        rep.className = 'db-reply';
        var repNick = document.createElement('span');
        repNick.className = 'db-reply-nick';
        repNick.textContent = '@' + (escapeText(r.nickname) || '匿名');
        var repContent = document.createElement('span');
        repContent.className = 'db-reply-content';
        repContent.textContent = escapeText(r.content) || '';
        rep.appendChild(repNick);
        rep.appendChild(repContent);
        repWrap.appendChild(rep);
      });
      bottle.appendChild(repWrap);
    }

    result.appendChild(bottle);
  }

  function showError(msg) {
    result.innerHTML = '';
    var box = document.createElement('div');
    box.className = 'tool-empty';
    box.innerHTML = '<div class="tool-empty-icon">🌊</div>';
    var h = document.createElement('h3');
    h.textContent = '没能捞到漂流瓶';
    var p = document.createElement('p');
    p.textContent = msg || '请稍后再试一次';
    box.appendChild(h);
    box.appendChild(p);
    result.appendChild(box);
  }

  function pick() {
    if (loading) return;
    loading = true;
    pickBtn.disabled = true;
    result.innerHTML = '<div class="db-loading">正在海边等待漂流瓶漂来…</div>';

    fetch('https://www.oiapi.net/api/DriftBottle?method=random')
      .then(function (resp) {
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        return resp.json();
      })
      .then(function (json) {
        if (json.code !== 1 || !json.data) {
          throw new Error(json.message || '接口未返回有效数据');
        }
        renderBottle(json.data);
      })
      .catch(function (err) {
        showError(err.message || '网络或跨域读取失败');
      })
      .finally(function () {
        loading = false;
        pickBtn.disabled = false;
      });
  }

  pickBtn.addEventListener('click', pick);

  // 进入即自动捞一个
  pick();

  if (window.DaibaoMotion && window.DaibaoMotion.onContentChange) {
    try {
      window.DaibaoMotion.onContentChange(container);
    } catch (e) {
      /* 动效异常不影响功能 */
    }
  }
};
