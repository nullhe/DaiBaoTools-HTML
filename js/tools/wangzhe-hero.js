/* 王者英雄：随机抽英雄 / 按名查询（OIAPI / Honor） */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createWangZheHero = function (container) {
  container.innerHTML = `
    <div class="wzh-card">
      <div class="wzh-head">
        <h2 class="wzh-title">🛡️ 王者英雄</h2>
        <p class="wzh-sub">随机抽一位英雄，看看 TA 的背景故事与皮肤语音</p>
      </div>
      <div class="wzh-form">
        <input type="text" class="tool-input wzh-input" id="wzhName" placeholder="输入英雄名（留空随机抽）" maxlength="20" />
        <button class="tool-btn" id="wzhSearch">查询</button>
        <button class="tool-btn tool-btn-primary" id="wzhRandom">随机抽一位</button>
      </div>
      <div class="wzh-result" id="wzhResult">
        <div class="wzh-loading">正在召唤英雄…</div>
      </div>
    </div>
  `;

  var nameInput = container.querySelector('#wzhName');
  var searchBtn = container.querySelector('#wzhSearch');
  var randomBtn = container.querySelector('#wzhRandom');
  var result = container.querySelector('#wzhResult');
  var loading = false;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function renderHero(item) {
    result.innerHTML = '';

    var wrap = el('div', 'wzh-hero');

    // 顶部：立绘 + 基本信息
    var top = el('div', 'wzh-top');
    var picWrap = el('div', 'wzh-pic-wrap');
    var img = el('img', 'wzh-pic');
    img.src = item.big_cover || item.medium_cover || item.small_cover || '';
    img.alt = item.name || '英雄';
    img.loading = 'lazy';
    img.referrerPolicy = 'no-referrer';
    img.onerror = function () { picWrap.textContent = '🦸'; };
    picWrap.appendChild(img);

    var info = el('div', 'wzh-info');
    info.appendChild(el('h3', 'wzh-name', item.name || '未知英雄'));
    if (item.title) info.appendChild(el('div', 'wzh-title-tag', item.title));
    var tags = el('div', 'wzh-tags');
    if (item.camp) tags.appendChild(el('span', 'wzh-tag', '阵营 · ' + item.camp));
    if (item.position) tags.appendChild(el('span', 'wzh-tag', '定位 · ' + item.position));
    if (item.zone) tags.appendChild(el('span', 'wzh-tag', '区域 · ' + item.zone));
    info.appendChild(tags);
    if (item.id) info.appendChild(el('div', 'wzh-id', '英雄 ID：' + item.id));

    top.appendChild(picWrap);
    top.appendChild(info);
    wrap.appendChild(top);

    // detailed
    var det = item.detailed || {};
    var facts = el('div', 'wzh-facts');
    if (det.word) facts.appendChild(el('p', 'wzh-word', '“' + det.word + '”'));
    var factGrid = el('div', 'wzh-fact-grid');
    function fact(label, val) {
      if (!val) return;
      var f = el('div', 'wzh-fact');
      f.appendChild(el('span', 'wzh-fact-label', label));
      f.appendChild(el('span', 'wzh-fact-val', String(val)));
      factGrid.appendChild(f);
    }
    fact('身高', det.height ? det.height + ' cm' : '');
    fact('特长', det.strong);
    fact('喜好', det.like);
    fact('讨厌', det.dislike);
    if (factGrid.childNodes.length) facts.appendChild(factGrid);
    wrap.appendChild(facts);

    // 故事
    var stories = det.stories || [];
    if (stories.length) {
      var storyBox = el('div', 'wzh-section');
      storyBox.appendChild(el('div', 'wzh-section-title', '📖 英雄故事'));
      stories.forEach(function (s) {
        var block = el('div', 'wzh-story');
        if (s.title) block.appendChild(el('div', 'wzh-story-title', s.title));
        if (s.content) block.appendChild(el('p', 'wzh-story-content', s.content));
        var imgs = s.images || [];
        if (imgs.length) {
          var ig = el('div', 'wzh-story-imgs');
          imgs.forEach(function (src) {
            var si = el('img', 'wzh-story-img');
            si.src = src;
            si.loading = 'lazy';
            si.referrerPolicy = 'no-referrer';
            si.onerror = function () { si.style.display = 'none'; };
            ig.appendChild(si);
          });
          block.appendChild(ig);
        }
        storyBox.appendChild(block);
      });
      wrap.appendChild(storyBox);
    }

    // 皮肤语音
    var voices = det.voice || [];
    if (voices.length) {
      var vb = el('div', 'wzh-section');
      vb.appendChild(el('div', 'wzh-section-title', '🎙️ 皮肤语音'));
      voices.forEach(function (v) {
        var skin = el('div', 'wzh-skin');
        var skinHead = el('div', 'wzh-skin-head');
        var sImg = el('img', 'wzh-skin-img');
        sImg.src = v.picture || v.cover || '';
        sImg.loading = 'lazy';
        sImg.referrerPolicy = 'no-referrer';
        sImg.onerror = function () { sImg.style.display = 'none'; };
        skinHead.appendChild(sImg);
        skinHead.appendChild(el('span', 'wzh-skin-name', v.name || '皮肤'));
        skin.appendChild(skinHead);
        var lines = v.list || [];
        var ll = el('ul', 'wzh-lines');
        lines.slice(0, 8).forEach(function (ln) {
          var li = el('li', 'wzh-line');
          li.appendChild(el('span', 'wzh-line-word', ln.word || ''));
          if (ln.voice) {
            var a = el('a', 'wzh-line-voice');
            a.href = ln.voice;
            a.textContent = '🔊 试听';
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            li.appendChild(a);
          }
          ll.appendChild(li);
        });
        skin.appendChild(ll);
        vb.appendChild(skin);
      });
      wrap.appendChild(vb);
    }

    result.appendChild(wrap);
  }

  function showError(msg) {
    result.innerHTML = '';
    var box = el('div', 'tool-empty');
    box.appendChild(el('div', 'tool-empty-icon', '🛡️'));
    box.appendChild(el('h3', null, '没有召唤到英雄'));
    box.appendChild(el('p', null, msg || '请稍后再试一次'));
    result.appendChild(box);
  }

  function fetchHero(name) {
    if (loading) return;
    loading = true;
    searchBtn.disabled = true;
    randomBtn.disabled = true;
    result.innerHTML = '<div class="wzh-loading">正在召唤英雄…</div>';

    var url = 'https://www.oiapi.net/api/Honor';
    if (name) url += '?name=' + encodeURIComponent(name);

    fetch(url)
      .then(function (resp) {
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        return resp.json();
      })
      .then(function (json) {
        if (json.code !== 1 || !json.data) {
          throw new Error(json.message || '接口未返回有效数据');
        }
        renderHero(json.data);
      })
      .catch(function (err) {
        showError(err.message || '网络或跨域读取失败');
      })
      .finally(function () {
        loading = false;
        searchBtn.disabled = false;
        randomBtn.disabled = false;
      });
  }

  searchBtn.addEventListener('click', function () {
    fetchHero(nameInput.value.trim());
  });
  nameInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') fetchHero(nameInput.value.trim());
  });
  randomBtn.addEventListener('click', function () {
    nameInput.value = '';
    fetchHero('');
  });

  // 进入即随机抽一位
  fetchHero('');

  if (window.DaibaoMotion && window.DaibaoMotion.onContentChange) {
    try {
      window.DaibaoMotion.onContentChange(container);
    } catch (e) {
      /* 动效异常不影响功能 */
    }
  }
};
