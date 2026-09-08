/* 咪咕音乐：在线听歌 + 歌词滚动同步
 * 音频用咪咕直链（<audio> 播放无需 CORS）；
 * 歌词优先取咪咕原版 lrc，跨域被拦时自动兜底到 OIAPI(QQ) 同曲歌词。 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createMiGuMusic = function (container) {
  var API = 'https://www.oiapi.net/api/MiGu_Music';
  var QQ_API = 'https://www.oiapi.net/api/QQMusicLyric';

  var state = {
    keyword: '',
    results: [],
    current: null, // 搜索数组中的歌曲对象
    detail: null, // 取词详情对象（url / lrcUrl / picture / time / quality ...）
    n: 0, // 取词序号，从 1 开始
    lines: [], // 解析后的歌词行 [{time, timeSec, text, el}]
    raw: '',
    parsed: true,
    lyricSource: '', // 'migu' | 'qq'
    showTime: true,
    br: '', // 当前音质
    audioErrorRetry: false,
    activeIdx: -1,
    autoScroll: true,
  };

  container.innerHTML = `
    <div class="tool-card">
      <div class="tool-section">
        <h3 class="tool-section-title">搜索歌曲</h3>
        <p class="tool-quiet">数据来源 OIAPI「咪咕音乐」接口。音频来自咪咕，歌词优先取咪咕原版，跨域受限时自动兜底到 QQ 同曲歌词。仅供个人学习使用。</p>
      </div>

      <div class="qm-search">
        <input type="text" class="tool-input" id="mmKeyword" placeholder="输入歌名或歌手，例如：周杰伦 / 晴天" />
        <button class="tool-btn primary" id="mmSearchBtn">搜索</button>
      </div>

      <div id="mmStatus" class="qm-status" hidden></div>
      <div id="mmResults" class="qm-results" hidden></div>

      <div id="mmDetail" class="mm-detail" hidden>
        <div class="qm-song-head">
          <div class="qm-cover" id="mmCover"></div>
          <div class="qm-song-info">
            <div class="qm-song-name" id="mmName"></div>
            <div class="qm-song-sub" id="mmSub"></div>
            <span class="mm-vip" id="mmVip" hidden>VIP</span>
          </div>
        </div>

        <audio id="mmAudio" class="mm-audio" controls preload="metadata"></audio>

        <div class="mm-quality" id="mmQuality"></div>

        <div class="qm-toolbar">
          <label class="qm-switch" title="控制歌词行前是否显示播放时间">
            <input type="checkbox" id="mmShowTime" checked />
            <span class="qm-switch-track"><span class="qm-switch-thumb"></span></span>
            <span class="qm-switch-label">显示播放时间</span>
          </label>
          <div class="qm-toolbar-right">
            <button class="tool-btn" id="mmCoverBtn">封面下载</button>
            <button class="tool-btn" id="mmCopyBtn">复制歌词</button>
            <button class="tool-btn primary" id="mmDownloadBtn">下载 TXT</button>
          </div>
        </div>

        <div id="mmLyric" class="qm-lyric"></div>
        <div class="mm-src" id="mmSrc" hidden></div>
      </div>
    </div>`;

  var keywordEl = container.querySelector('#mmKeyword');
  var searchBtn = container.querySelector('#mmSearchBtn');
  var statusEl = container.querySelector('#mmStatus');
  var resultsEl = container.querySelector('#mmResults');
  var detailEl = container.querySelector('#mmDetail');
  var coverEl = container.querySelector('#mmCover');
  var nameEl = container.querySelector('#mmName');
  var subEl = container.querySelector('#mmSub');
  var vipEl = container.querySelector('#mmVip');
  var audioEl = container.querySelector('#mmAudio');
  var qualityEl = container.querySelector('#mmQuality');
  var showTimeEl = container.querySelector('#mmShowTime');
  var copyBtn = container.querySelector('#mmCopyBtn');
  var downloadBtn = container.querySelector('#mmDownloadBtn');
  var coverBtn = container.querySelector('#mmCoverBtn');
  var lyricEl = container.querySelector('#mmLyric');
  var srcEl = container.querySelector('#mmSrc');

  var autoTimer = null;

  /* ================================ 工具函数 ================================ */

  function setStatus(msg, type) {
    if (!msg) {
      statusEl.hidden = true;
      statusEl.textContent = '';
      return;
    }
    statusEl.hidden = false;
    statusEl.className = 'qm-status' + (type ? ' is-' + type : '');
    statusEl.textContent = msg;
  }

  function hintNet() {
    if (location.protocol === 'file:') {
      return '（若浏览器拦截了跨域请求，请用本地服务器方式打开本项目）';
    }
    return '';
  }

  function request(params) {
    var qs = Object.keys(params)
      .map(function (k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
      })
      .join('&');
    return fetch(API + '?' + qs, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    }).then(function (res) {
      if (!res.ok) throw new Error('接口返回 HTTP ' + res.status);
      return res.json();
    });
  }

  function requestDetail(keyword, n, br) {
    var params = { msg: keyword, n: n };
    if (br) params.br = br;
    return request(params).then(function (json) {
      if (
        json.code !== 1 ||
        !json.data ||
        typeof json.data !== 'object' ||
        Array.isArray(json.data)
      ) {
        throw new Error(json.message || '未找到该歌曲详情');
      }
      return json.data;
    });
  }

  var TIME_TAG = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g;

  function parseLrc(text) {
    var lines = String(text || '').split(/\r?\n/);
    var out = [];
    lines.forEach(function (line) {
      var trimmed = line.trim();
      if (!trimmed) return;
      var times = [];
      var m;
      TIME_TAG.lastIndex = 0;
      while ((m = TIME_TAG.exec(trimmed)) !== null) {
        times.push({ mm: +m[1], ss: +m[2], cs: m[3] ? +m[3] : 0 });
      }
      if (!times.length) return;
      var content = trimmed.replace(TIME_TAG, '').trim();
      times.forEach(function (t) {
        out.push({
          time: t,
          timeSec: t.mm * 60 + t.ss + (t.cs || 0) / 100,
          sortKey: t.mm * 60000 + t.ss * 1000 + (t.cs || 0),
          text: content,
        });
      });
    });
    out.sort(function (a, b) {
      return a.sortKey - b.sortKey;
    });
    return out;
  }

  function fmtTimeTag(t) {
    var mm = String(t.mm);
    if (mm.length < 2) mm = '0' + mm;
    var ss = String(t.ss);
    if (ss.length < 2) ss = '0' + ss;
    var cs = String(t.cs || 0);
    while (cs.length < 2) cs = '0' + cs;
    return mm + ':' + ss + '.' + cs;
  }

  var CREDIT_RE = /^(作?词|作?曲|编曲|制作人|监制|录音|混音|母带|合声|和声|吉他|贝斯|鼓|键盘|弦乐|OP|SP|出品|发行)[:：]/;

  function isCredit(text) {
    return CREDIT_RE.test(String(text || '').trim());
  }

  /* ================================ 歌词获取 ================================ */

  // 1) 优先取咪咕原版 lrc（跨域会被拦，走 catch 兜底）
  function fetchLrcDirect(url) {
    if (!url) return Promise.reject(new Error('no lrcUrl'));
    return fetch(encodeURI(url), { method: 'GET' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    });
  }

  // 2) 兜底：用已支持 CORS 的 QQ 接口拿同曲歌词
  function fetchQqLrc(song, singer) {
    if (!song) return Promise.reject(new Error('no song'));
    var kw = singer ? song + ' ' + singer : song;
    return fetch(QQ_API + '?keyword=' + encodeURIComponent(kw) + '&limit=10', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (json) {
        if (json.code !== 1 || !Array.isArray(json.data) || !json.data.length) {
          throw new Error('QQ 未找到同曲');
        }
        var pick = json.data[0];
        for (var i = 0; i < json.data.length; i++) {
          var s = json.data[i];
          if (
            singer &&
            s.singer &&
            (s.singer.indexOf(singer) >= 0 || singer.indexOf(s.singer) >= 0)
          ) {
            pick = s;
            break;
          }
        }
        return fetch(QQ_API + '?id=' + encodeURIComponent(pick.mid) + '&format=lrc', {
          method: 'GET',
          headers: { Accept: 'application/json' },
        })
          .then(function (r2) {
            if (!r2.ok) throw new Error('HTTP ' + r2.status);
            return r2.json();
          })
          .then(function (j2) {
            if (j2.code !== 1) throw new Error('QQ 歌词获取失败');
            var content = (j2.data && (j2.data.content || j2.data.conteng)) || '';
            if (!content && j2.data && j2.data.base64) {
              try {
                content = decodeURIComponent(escape(window.atob(j2.data.base64)));
              } catch (e) {
                content = '';
              }
            }
            if (!content) throw new Error('QQ 歌词为空');
            return { text: content, source: 'qq' };
          });
      });
  }

  function loadLyric() {
    state.raw = '';
    state.lines = [];
    state.parsed = true;
    state.lyricSource = '';
    state.activeIdx = -1;
    lyricEl.innerHTML = '<div class="qm-loading">正在获取歌词…</div>';
    srcEl.hidden = true;

    var lrcUrl = state.detail && state.detail.lrcUrl;

    fetchLrcDirect(lrcUrl)
      .then(function (text) {
        applyLrc(text, 'migu');
      })
      .catch(function () {
        return fetchQqLrc(
          state.current && state.current.song,
          state.current && state.current.singer
        );
      })
      .then(function (res) {
        if (res && typeof res.text === 'string') {
          applyLrc(res.text, res.source);
        } else if (!state.lines.length) {
          finishNoLyric();
        }
      })
      .catch(function () {
        finishNoLyric();
      });
  }

  function applyLrc(text, source) {
    state.raw = text || '';
    state.lyricSource = source || '';
    var parsed = parseLrc(text);
    state.lines = parsed.map(function (l) {
      return { time: l.time, timeSec: l.timeSec, text: l.text };
    });
    state.parsed = state.lines.length > 0;
    state.activeIdx = -1;
    renderLyric();

    if (state.lyricSource) {
      srcEl.hidden = false;
      srcEl.textContent =
        state.lyricSource === 'migu'
          ? '歌词来源：咪咕原版'
          : '歌词来源：咪咕 CDN 未开放跨域，已自动兜底到 QQ 同曲歌词（仅歌词文本，音频仍为咪咕）';
    }

    if (state.parsed) {
      setStatus('歌词已加载，共 ' + state.lines.length + ' 句，播放时将自动滚动高亮', 'ok');
    } else if (state.raw) {
      setStatus('当前歌词无法按行解析，已原样展示', 'warn');
    } else {
      setStatus('该歌曲暂无歌词内容', 'warn');
    }
  }

  function finishNoLyric() {
    state.lines = [];
    state.parsed = true;
    state.raw = '';
    renderLyric();
    setStatus('该歌曲暂无歌词内容', 'warn');
  }

  /* ================================ 渲染 ================================ */

  function renderResults() {
    if (!state.results.length) {
      resultsEl.hidden = true;
      return;
    }
    resultsEl.hidden = false;
    resultsEl.innerHTML = '';

    state.results.forEach(function (song, i) {
      var card = document.createElement('div');
      card.className = 'qm-result-item';
      card.setAttribute('role', 'button');
      card.tabIndex = 0;
      card.dataset.index = i;

      var img = document.createElement('img');
      img.className = 'qm-result-cover';
      img.loading = 'lazy';
      img.referrerPolicy = 'no-referrer';
      img.alt = '';
      img.src = song.picture || '';
      img.addEventListener('error', function () {
        img.classList.add('is-broken');
      });

      var info = document.createElement('div');
      info.className = 'qm-result-info';
      var name = document.createElement('div');
      name.className = 'qm-result-name';
      name.textContent = song.song || '未知歌曲';
      var sub = document.createElement('div');
      sub.className = 'qm-result-sub';
      sub.textContent = song.singer || '';
      info.appendChild(name);
      info.appendChild(sub);

      var dur = document.createElement('div');
      dur.className = 'qm-result-dur';
      dur.textContent = Array.isArray(song.types)
        ? song.types
            .map(function (t) {
              return t.level;
            })
            .join('·')
        : '';

      card.appendChild(img);
      card.appendChild(info);
      card.appendChild(dur);

      function pick() {
        pickSong(i);
      }
      card.addEventListener('click', pick);
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          pick();
        }
      });

      resultsEl.appendChild(card);
    });
  }

  function renderHead(d) {
    var song = (d && d.song) || (state.current && state.current.song) || '未知歌曲';
    var singer = (d && d.singer) || (state.current && state.current.singer) || '';
    nameEl.textContent = song;
    var sub = [singer, d && d.time].filter(Boolean).join(' · ');
    subEl.textContent = sub;

    if (d && d.picture) {
      coverEl.innerHTML = '';
      var img = document.createElement('img');
      img.referrerPolicy = 'no-referrer';
      img.alt = '';
      img.src = d.picture;
      img.addEventListener('error', function () {
        coverEl.classList.add('is-broken');
      });
      coverEl.classList.remove('is-broken');
      coverEl.appendChild(img);
    }

    vipEl.hidden = !(
      (d && (d.isVip === true || d.isVip === '1' || d.isVip === 'true')) ||
      (d && d.vipLogo)
    );
  }

  function renderQuality(d) {
    var types = (d && d.types) || (state.detail && state.detail.types) || [];
    qualityEl.innerHTML = '';
    var label = document.createElement('span');
    label.className = 'mm-quality-label';
    label.textContent = '音质：';
    qualityEl.appendChild(label);
    types.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'mm-qbtn' + (t.level === state.br ? ' active' : '');
      b.textContent = t.level + (t.bitrate ? ' ' + t.bitrate : '');
      b.addEventListener('click', function () {
        setBr(t.level);
      });
      qualityEl.appendChild(b);
    });
  }

  function renderLyric() {
    lyricEl.innerHTML = '';
    if (!state.parsed) {
      var pre = document.createElement('pre');
      pre.className = 'qm-raw';
      pre.textContent = state.raw;
      lyricEl.appendChild(pre);
      return;
    }
    if (!state.lines.length) {
      lyricEl.innerHTML =
        '<div class="tool-empty"><div class="tool-empty-icon">🎼</div><h3>该歌曲暂无歌词</h3><p>可能为纯音乐，或接口未提供歌词内容。</p></div>';
      return;
    }
    var showTime = state.showTime;
    var frag = document.createDocumentFragment();
    state.lines.forEach(function (line) {
      if (!line.text) return;
      var row = document.createElement('div');
      row.className = 'qm-line' + (isCredit(line.text) ? ' is-credit' : '');
      if (showTime) {
        var tm = document.createElement('span');
        tm.className = 'qm-line-time';
        tm.textContent = fmtTimeTag(line.time);
        row.appendChild(tm);
      }
      var tx = document.createElement('span');
      tx.className = 'qm-line-text';
      tx.textContent = line.text;
      row.appendChild(tx);
      row.addEventListener('click', function () {
        if (audioEl && isFinite(line.timeSec)) {
          audioEl.currentTime = line.timeSec;
          audioEl.play().catch(function () {});
          state.autoScroll = false;
          scheduleAutoResume();
        }
      });
      line.el = row;
      frag.appendChild(row);
    });
    lyricEl.appendChild(frag);
    state.activeIdx = -1;
  }

  /* ================================ 播放 / 音质 ================================ */

  function applyAudio(d) {
    var url = d && d.url;
    if (!url) {
      audioEl.removeAttribute('src');
      audioEl.load();
      return;
    }
    var wasPlaying = !audioEl.paused;
    var pos = audioEl.currentTime || 0;
    audioEl.src = encodeURI(url);
    audioEl.load();
    if (wasPlaying) {
      var onCanplay = function () {
        try {
          audioEl.currentTime = pos;
        } catch (e) {}
        audioEl.play().catch(function () {});
        audioEl.removeEventListener('canplay', onCanplay);
      };
      audioEl.addEventListener('canplay', onCanplay);
    }
  }

  function setBr(level) {
    if (level === state.br) return;
    state.br = level;
    renderQuality(state.detail);
    setStatus('正在切换音质…', 'info');
    requestDetail(state.keyword, state.n, level)
      .then(function (d) {
        state.detail = d;
        applyAudio(d);
        setStatus('已切换至 ' + (d.quality || level), 'ok');
      })
      .catch(function (err) {
        setStatus('切换音质失败：' + err.message, 'error');
      });
  }

  /* ================================ 交互 ================================ */

  function search() {
    var kw = keywordEl.value.trim();
    if (!kw) {
      setStatus('请输入歌名或歌手后再搜索', 'warn');
      if (window.DaibaoMotion) window.DaibaoMotion.shake(keywordEl);
      return;
    }
    state.keyword = kw;
    setStatus('正在搜索「' + kw + '」…', 'info');
    searchBtn.disabled = true;
    searchBtn.textContent = '搜索中…';

    request({ msg: kw })
      .then(function (json) {
        searchBtn.disabled = false;
        searchBtn.textContent = '搜索';
        if (json.code !== 1 || !Array.isArray(json.data) || !json.data.length) {
          setStatus('没有找到相关歌曲，换个关键词试试', 'warn');
          resultsEl.hidden = true;
          return;
        }
        state.results = json.data;
        renderResults();
        setStatus('共找到 ' + json.data.length + ' 首歌曲，点击任一首开始播放', 'ok');
      })
      .catch(function (err) {
        searchBtn.disabled = false;
        searchBtn.textContent = '搜索';
        setStatus('请求失败：' + err.message + hintNet(), 'error');
      });
  }

  function pickSong(i) {
    var item = state.results[i];
    if (!item) return;
    state.current = item;
    state.n = i + 1;
    state.br = '';
    detailEl.hidden = false;
    renderHead(item);
    audioEl.removeAttribute('src');
    audioEl.load();
    lyricEl.innerHTML = '<div class="qm-loading">正在准备播放…</div>';
    srcEl.hidden = true;
    setStatus('正在获取「' + (item.song || '') + '」的播放链接…', 'info');

    requestDetail(state.keyword, state.n, '')
      .then(function (d) {
        state.detail = d;
        state.br = d.quality || (d.supportedQualities && d.supportedQualities[0]) || '';
        renderHead(d);
        applyAudio(d);
        renderQuality(d);
        setStatus('播放链接已就绪，点击播放即可听歌', 'ok');
        loadLyric();
      })
      .catch(function (err) {
        setStatus('获取播放链接失败：' + err.message + hintNet(), 'error');
      });
  }

  function syncLyric() {
    if (!state.lines.length) return;
    var t = audioEl.currentTime;
    var idx = 0;
    for (var i = 0; i < state.lines.length; i++) {
      if (state.lines[i].timeSec <= t) idx = i;
      else break;
    }
    if (idx === state.activeIdx) return;
    state.activeIdx = idx;
    state.lines.forEach(function (l, i) {
      if (l.el) l.el.classList.toggle('is-active', i === idx);
    });
    if (state.autoScroll && state.lines[idx] && state.lines[idx].el) {
      var el = state.lines[idx].el;
      var top = el.offsetTop - lyricEl.clientHeight / 2 + el.clientHeight / 2;
      lyricEl.scrollTo({ top: top, behavior: 'smooth' });
    }
  }

  function scheduleAutoResume() {
    if (autoTimer) clearTimeout(autoTimer);
    autoTimer = setTimeout(function () {
      state.autoScroll = true;
    }, 4000);
  }

  function buildText() {
    var d = state.detail || state.current || {};
    var parts = [];
    parts.push('歌曲：' + (d.song || (state.current && state.current.song) || '未知歌曲'));
    var ar = d.singer || (state.current && state.current.singer) || '';
    if (ar) parts.push('歌手：' + ar);
    if (d.time) parts.push('时长：' + d.time);
    parts.push('歌词来源：' + (state.lyricSource === 'qq' ? 'QQ 同曲兜底' : '咪咕'));
    parts.push('音频来源：咪咕音乐 (OIAPI)');
    parts.push('');
    parts.push('--------------------');
    parts.push('');
    if (!state.parsed) {
      parts.push(state.raw);
    } else {
      state.lines.forEach(function (line) {
        if (!line.text) return;
        parts.push(state.showTime ? '[' + fmtTimeTag(line.time) + '] ' + line.text : line.text);
      });
    }
    return '﻿' + parts.join('\r\n');
  }

  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  function downloadText() {
    if (!state.raw && !state.lines.length) {
      setStatus('还没有歌词内容可以下载', 'warn');
      return;
    }
    var d = state.detail || state.current || {};
    var name = [(d.singer || ''), (d.song || '歌词')]
      .filter(Boolean)
      .join(' - ')
      .replace(/[\\/:*?"<>|]/g, '_')
      .trim() || '歌词';
    downloadBlob(new Blob([buildText()], { type: 'text/plain;charset=utf-8' }), name + '.txt');
    setStatus('已下载：' + name + '.txt', 'ok');
  }

  function copyLyric() {
    if (!state.raw && !state.lines.length) {
      setStatus('还没有歌词内容可以复制', 'warn');
      return;
    }
    window.DaibaoTools.copyWithFeedback(buildText(), copyBtn);
    setStatus('歌词已复制到剪贴板', 'ok');
  }

  function downloadCover() {
    var url = state.detail && state.detail.picture;
    if (!url) {
      setStatus('没有可用的封面', 'warn');
      return;
    }
    fetch(encodeURI(url))
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.blob();
      })
      .then(function (blob) {
        var d = state.detail || state.current || {};
        var name = [(d.singer || ''), (d.song || 'cover')]
          .filter(Boolean)
          .join(' - ')
          .replace(/[\\/:*?"<>|]/g, '_')
          .trim() || 'cover';
        downloadBlob(blob, name + '.webp');
        setStatus('封面已下载', 'ok');
      })
      .catch(function () {
        window.open(url, '_blank');
        window.DaibaoTools.toast('已在新标签打开封面，请右键图片「图片另存为」');
        setStatus('封面受跨域限制无法直接下载，已在新标签打开，请手动保存', 'warn');
      });
  }

  /* ================================ 事件绑定 ================================ */

  searchBtn.addEventListener('click', search);
  keywordEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') search();
  });
  downloadBtn.addEventListener('click', downloadText);
  copyBtn.addEventListener('click', copyLyric);
  coverBtn.addEventListener('click', downloadCover);
  showTimeEl.addEventListener('change', function () {
    state.showTime = showTimeEl.checked;
    renderLyric();
  });
  audioEl.addEventListener('timeupdate', syncLyric);
  audioEl.addEventListener('error', function () {
    if (!state.audioErrorRetry && state.detail) {
      state.audioErrorRetry = true;
      setStatus('音频链接可能已失效，正在刷新…', 'info');
      requestDetail(state.keyword, state.n, state.br)
        .then(function (d) {
          state.detail = d;
          applyAudio(d);
          state.audioErrorRetry = false;
        })
        .catch(function () {
          state.audioErrorRetry = false;
        });
    }
  });
  lyricEl.addEventListener('wheel', function () {
    state.autoScroll = false;
    scheduleAutoResume();
  });
};
