/*
 * 语言文学 · 语录家族（学习资料 L3）
 * 古诗词名句 / 每日一句 / 爱情公寓语录 / 情话 / 发病语录 / 一言
 *
 * 这 6 个接口形态高度一致（随机一句 + 可选出处 / 配图），
 * 故共用同一套渲染内核，各自只声明「取数 URL + 解析规则」，避免重复代码。
 * 对外仍按项目约定暴露 window.DaibaoTools.createXxx(container) 工厂函数。
 */
window.DaibaoTools = window.DaibaoTools || {};

(function () {
  var NS = window.DaibaoTools;

  function str(v) {
    return v == null ? '' : String(v).replace(/\s+$/, '');
  }

  // 接口返回的配图多为 http://，统一升级 https:// 避免混合内容拦截
  function safeImg(u) {
    var s = str(u);
    return s ? s.replace(/^http:\/\//i, 'https://') : '';
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function copyText(text, onOk, onFail) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      (ok ? onOk : onFail)();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onOk, fallback);
    } else {
      fallback();
    }
  }

  function showError(result, msg) {
    result.innerHTML = '';
    var box = el('div', 'tool-empty');
    box.innerHTML = '<div class="tool-empty-icon">⚠️</div>';
    box.appendChild(el('h3', null, '没能取到内容'));
    box.appendChild(el('p', null, msg || '请稍后再试一次'));
    result.appendChild(box);
  }

  // 渲染卡片：card = { image, quote, sub, from, time, audio, copy }
  function renderCard(result, card) {
    result.innerHTML = '';

    var wrap = el('div', 'say-card');

    if (card.image) {
      var fig = el('div', 'say-figure');
      var im = el('img', 'say-img');
      im.src = card.image;
      im.alt = '配图';
      im.loading = 'lazy';
      im.referrerPolicy = 'no-referrer';
      im.onerror = function () { fig.remove(); };
      fig.appendChild(im);
      wrap.appendChild(fig);
    }

    if (card.quote) {
      wrap.appendChild(el('blockquote', 'say-quote', card.quote));
    }

    if (card.sub) {
      wrap.appendChild(el('div', 'say-sub', card.sub));
    }

    if (card.audio) {
      var a = document.createElement('audio');
      a.className = 'say-audio';
      a.controls = true;
      a.preload = 'none';
      a.src = card.audio;
      wrap.appendChild(a);
    }

    if (card.from || card.time) {
      var meta = el('div', 'say-meta');
      if (card.from) meta.appendChild(el('div', 'say-from', card.from));
      if (card.time) meta.appendChild(el('div', 'say-time', card.time));
      wrap.appendChild(meta);
    }

    result.appendChild(wrap);
  }

  /*
   * cfg = {
   *   icon, title, subtitle, buttonText,
   *   url:        function(ctx)   -> string,
   *   parse:      function(json, ctx) -> card,
   *   extraHtml:  string   (可选，插入控制区，如日期选择),
   *   onMount:    function(ctx)   (可选，绑定额外控件),
   *   beforeLoad: function(ctx)   (可选，每次取数前回调)
   * }
   */
  function makeTool(cfg) {
    return function createQuoteTool(container) {
      container.innerHTML = `
        <div class="say-tool">
          <div class="say-header">
            <h2 class="say-title"></h2>
            <p class="say-subtitle"></p>
          </div>
          <div class="say-controls"></div>
          <div class="say-result">
            <div class="say-loading">正在获取…</div>
          </div>
        </div>
      `;

      var titleEl = container.querySelector('.say-title');
      var subEl = container.querySelector('.say-subtitle');
      var controls = container.querySelector('.say-controls');
      var result = container.querySelector('.say-result');

      titleEl.textContent = (cfg.icon ? cfg.icon + ' ' : '') + cfg.title;
      subEl.textContent = cfg.subtitle || '';

      var loading = false;
      var current = '';

      var nextBtn = el('button', 'tool-btn tool-btn-primary', cfg.buttonText || '换一个');
      nextBtn.type = 'button';
      controls.appendChild(nextBtn);

      var copyBtn = el('button', 'tool-btn', '复制');
      copyBtn.type = 'button';
      copyBtn.hidden = true;
      controls.appendChild(copyBtn);

      var extra = null;
      if (cfg.extraHtml) {
        extra = document.createElement('div');
        extra.className = 'say-extra';
        extra.innerHTML = cfg.extraHtml;
        controls.appendChild(extra);
      }

      var ctx = {
        container: container,
        controls: controls,
        extra: extra,
        result: result,
        load: function () { load(); }
      };

      var flashTimer = null;
      function flash(msg) {
        copyBtn.textContent = msg;
        if (flashTimer) clearTimeout(flashTimer);
        flashTimer = setTimeout(function () { copyBtn.textContent = '复制'; }, 1500);
      }

      copyBtn.addEventListener('click', function () {
        if (!current) return;
        copyText(current, function () { flash('已复制'); }, function () { flash('复制失败'); });
      });

      function load() {
        if (loading) return;
        loading = true;
        nextBtn.disabled = true;
        copyBtn.hidden = true;
        current = '';

        result.innerHTML = '<div class="say-loading">正在获取…</div>';

        var url = '';
        try { url = cfg.url(ctx); } catch (e) { url = ''; }

        fetch(url)
          .then(function (resp) {
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            return resp.json();
          })
          .then(function (json) {
            if (json.code !== 1) {
              throw new Error(str(json.message) || '接口未返回有效数据');
            }
            var card = cfg.parse(json, ctx);
            if (!card || !card.quote) {
              throw new Error('接口未返回有效内容');
            }
            renderCard(result, card);
            current = card.copy || card.quote;
            copyBtn.hidden = !current;
          })
          .catch(function (err) {
            showError(result, str(err && err.message) || '网络或跨域读取失败');
          })
          .finally(function () {
            loading = false;
            nextBtn.disabled = false;
          });
      }

      nextBtn.addEventListener('click', function () {
        if (cfg.beforeMain) {
          try { cfg.beforeMain(ctx); } catch (e) { /* 忽略 */ }
        }
        load();
      });

      if (cfg.onMount) cfg.onMount(ctx);

      // 进入即自动取一条
      load();

      if (window.DaibaoMotion && window.DaibaoMotion.onContentChange) {
        try { window.DaibaoMotion.onContentChange(container); } catch (e) {}
      }
    };
  }

  /* ---------- 公共：解析「内容直接放在 message 里」的接口 ---------- */
  // 形如「有心就不怕迟。——胡一菲」，按「——」拆成正文 + 出处
  function parseMessage(message) {
    var raw = str(message);
    if (!raw) return null;
    var idx = raw.indexOf('——');
    if (idx > 0) {
      var head = str(raw.slice(0, idx));
      var tail = str(raw.slice(idx + 2));
      if (head && tail) {
        return { quote: head, from: '—— ' + tail, copy: head + '\n—— ' + tail };
      }
    }
    return { quote: raw, copy: raw };
  }

  /* ---------- 1. 古诗词名句（OIAPI id/32 · Sentences） ---------- */
  NS.createPoemSentence = makeTool({
    icon: '🏮',
    title: '古诗词名句',
    subtitle: '随机一句古诗词名句，附作者与出处篇目',
    url: function () { return 'https://www.oiapi.net/api/Sentences?type=json'; },
    parse: function (json) {
      var d = json.data || {};
      var quote = str(d.content);
      var author = str(d.author);
      var works = str(d.works);
      var from = '';
      if (author && works) from = '—— ' + author + '《' + works + '》';
      else if (author) from = '—— ' + author;
      else if (works) from = '—— 《' + works + '》';
      return { quote: quote, from: from, copy: [quote, from].filter(Boolean).join('\n') };
    }
  });

  /* ---------- 2. 每日一句（OIAPI id/31 · Daily） ---------- */
  function fmtDate(d) {
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }
  function todayStr() { return fmtDate(new Date()); }
  function randomDateStr() {
    // 近三年内的随机一天
    var end = Date.now();
    var start = end - 3 * 365 * 24 * 3600 * 1000;
    return fmtDate(new Date(start + Math.random() * (end - start)));
  }

  NS.createDailySentence = makeTool({
    icon: '🗓️',
    title: '每日一句',
    subtitle: '金山词霸每日一句，中英对照并附朗读音频；可按日期查询（非法日期自动回落今日）',
    buttonText: '查今日',
    // 主按钮固定复位到今天；「按日期查」/「随机一天」由各自按钮设好日期后触发
    beforeMain: function (ctx) { if (ctx && ctx.setDate) ctx.setDate(todayStr()); },
    extraHtml: `
      <label class="say-field">
        <span class="say-field-label">日期</span>
        <input class="tool-input say-date" type="date" />
      </label>
      <button class="tool-btn say-by-date" type="button">按日期查</button>
      <button class="tool-btn say-random-day" type="button">随机一天</button>
    `,
    onMount: function (ctx) {
      var dateInput = ctx.extra.querySelector('.say-date');
      var byDateBtn = ctx.extra.querySelector('.say-by-date');
      var randBtn = ctx.extra.querySelector('.say-random-day');
      dateInput.value = todayStr();

      ctx.getDate = function () { return dateInput.value || todayStr(); };
      ctx.setDate = function (v) { dateInput.value = v; };

      byDateBtn.addEventListener('click', function () { ctx.load(); });
      randBtn.addEventListener('click', function () {
        ctx.setDate(randomDateStr());
        ctx.load();
      });
    },
    url: function (ctx) {
      var d = (ctx && ctx.getDate) ? ctx.getDate() : todayStr();
      return 'https://www.oiapi.net/api/Daily?type=json&date=' + encodeURIComponent(d);
    },
    parse: function (json, ctx) {
      var d = json.data || {};
      var en = str(d.en);
      var zh = str(d.zh);
      return {
        image: safeImg(d.image),
        quote: en,
        sub: zh,
        audio: str(d.tts),
        time: (ctx && ctx.getDate) ? ctx.getDate() : '',
        copy: [en, zh].filter(Boolean).join('\n')
      };
    }
  });

  /* ---------- 3. 爱情公寓语录（OIAPI id/29 · iPartmentWord） ---------- */
  NS.createIPartmentWord = makeTool({
    icon: '🏠',
    title: '爱情公寓语录',
    subtitle: '随机一句《爱情公寓》经典台词，附说话角色',
    url: function () { return 'https://www.oiapi.net/api/iPartmentWord?type=json'; },
    parse: function (json) { return parseMessage(json.message); }
  });

  /* ---------- 4. 情话（OIAPI id/24 · LoveTalk） ---------- */
  NS.createLoveTalk = makeTool({
    icon: '💗',
    title: '情话',
    subtitle: '随机一句甜到心里的情话',
    url: function () { return 'https://www.oiapi.net/api/LoveTalk?type=json'; },
    parse: function (json) { return parseMessage(json.message); }
  });

  /* ---------- 5. 发病语录（OIAPI id/2 · SickL） ---------- */
  NS.createSickWord = makeTool({
    icon: '🤪',
    title: '发病语录',
    subtitle: '随机一句「发病」语录，整活专用',
    url: function () { return 'https://www.oiapi.net/api/SickL?type=json'; },
    parse: function (json) { return parseMessage(json.message); }
  });

  /* ---------- 6. 一言（OIAPI id/1 · AWord） ---------- */
  NS.createAWord = makeTool({
    icon: '💬',
    title: '一言',
    subtitle: '随机一条「一言」，含出处、日期与配图',
    url: function () { return 'https://www.oiapi.net/api/AWord?type=json'; },
    parse: function (json) {
      var d = json.data || {};
      var quote = str(d.content) || str(json.message);
      var from = str(d.from);
      if (from) from = '—— ' + from;
      return {
        image: safeImg(d.image),
        quote: quote,
        from: from,
        time: str(d.time),
        copy: [quote, from].filter(Boolean).join('\n')
      };
    }
  });
})();
