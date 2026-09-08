/* 网易云音乐：在线听歌 + 歌词滚动同步
 * 音频用网易云直链（升级 https 规避混合内容，<audio> 播放无需 CORS）；
 * 网易云接口为单一直链、不提供歌词，统一兜底到 OIAPI(QQ) 同曲歌词做滚动同步；
 * 封面 CDN 已开放 CORS，可直接 blob 下载。 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createNeteaseMusic = function (container) {
  var API = 'https://www.oiapi.net/api/Music_163';
  var QQ_API = 'https://www.oiapi.net/api/QQMusicLyric';

  var state = {
    keyword: '',
    results: [],
    current: null, // 搜索数组中的歌曲对象
    detail: null, // 取词详情对象（url / picurl / pay ...）
    n: 0, // 取词序号，从 1 开始
    lines: [], // 解析后的歌词行 [{time, timeSec, text, el}]
    raw: '',
    parsed: true,
    lyricSource: '', // 'qq'
    showTime: true,
    audioErrorRetry: false,
    activeIdx: -1,
    autoScroll: true,
  };

  container.innerHTML = `
    <div class="tool-card">
      <div class="tool-section">
        <h3 class="tool-section-title">搜索歌曲</h3>
        <p class="tool-quiet">数据来源 OIAPI「网易云音乐」接口。音频来自网易云；网易云未提供歌词，已自动使用 QQ 同曲歌词做滚动同步。仅供个人学习使用。</p>
      </div>

      <div class="qm-search">
        <input type="text" class="tool-input" id="neKeyword" placeholder="输入歌名或歌手，例如：周杰伦 / 晴天" />
        <button class="tool-btn primary" id="neSearchBtn">搜索</button>
      </div>

      <div id="neStatus" class="qm-status" hidden></div>
      <div id="neResults" class="qm-results" hidden></div>

      <div id="neDetail" class="mm-detail" hidden>
        <div class="qm-song-head">
          <div class="qm-cover" id="neCover"></div>
          <div class="qm-song-info">
            <div class="qm-song-name" id="neName"></div>
            <div class="qm-song-sub" id="neSub"></div>
            <span class="mm-vip" id="neVip" hidden>VIP</span>
          </div>
        </div>

        <audio id="neAudio" class="mm-audio" controls preload="metadata"></audio>

        <div class="qm-toolbar">
          <label class="qm-switch" title="控制歌词行前是否显示播放时间">
            <input type="checkbox" id="neShowTime" checked />
            <span class="qm-switch-track"><span class="qm-switch-thumb"></span></span>
            <span class="qm-switch-label">显示播放时间</span>
          </label>
          <div class="qm-toolbar-right">
            <button class="tool-btn" id="neCoverBtn">封面下载</button>
            <button class="tool-btn" id="neCopyBtn">复制歌词</button>
            <button class="tool-btn primary" id="neDownloadBtn">下载 TXT</button>
          </div>
        </div>

        <div id="neLyric" class="qm-lyric"></div>
        <div class="mm-src" id="neSrc" hidden></div>
      </div>
    </div>`;

  var keywordEl = container.querySelector('#neKeyword');
  var searchBtn = container.querySelector('#neSearchBtn');
  var statusEl = container.querySelector('#neStatus');
  var resultsEl = container.querySelector('#neResults');
  var detailEl = container.querySelector('#neDetail');
  var coverEl = container.querySelector('#neCover');
  var nameEl = container.querySelector('#neName');
  var subEl = container.querySelector('#neSub');
  var vipEl = container.querySelector('#neVip');
  var audioEl = container.querySelector('#neAudio');
  var showTimeEl = container.querySelector('#neShowTime');
  var copyBtn = container.querySelector('#neCopyBtn');
  var downloadBtn = container.querySelector('#neDownloadBtn');
  var coverBtn = container.querySelector('#neCoverBtn');
  var lyricEl = container.querySelector('#neLyric');
  var srcEl = container.querySelector('#neSrc');

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

  function singerText(singers) {
    if (Array.isArray(singers) && singers.length) {
      return singers
        .map(function (s) {
          return s && s.name ? s.name : '';
        })
        .filter(Boolean)
        .join('/');
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

  function requestDetail(keyword, n) {
    return request({ name: keyword, n: n }).then(function (json) {
      if (
        json.code !== 0 ||
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

  /* ================================ 歌词获取（网易云无歌词，直接兜底 QQ） ================================ */

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

    fetchQqLrc(
      state.current && state.current.name,
      state.current && singerText(state.current.singers)
    )
      .then(function (res) {
        if (res && typeof res.text === 'string') {
          applyLrc(res.text, res.source);
        } else {
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
        '歌词来源：网易云未提供歌词，已自动使用 QQ 同曲歌词（音频仍为网易云）';
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
    setStatus('该歌曲暂无歌词内容（网易云未提供，QQ 也未找到同曲）', 'warn');
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
      img.src = song.picurl || '';
      img.addEventListener('error', function () {
        img.classList.add('is-broken');
      });

      var info = document.createElement('div');
      info.className = 'qm-result-info';
      var name = document.createElement('div');
      name.className = 'qm-result-name';
      name.textContent = song.name || '未知歌曲';
      var sub = document.createElement('div');
      sub.className = 'qm-result-sub';
      sub.textContent = singerText(song.singers);
      info.appendChild(name);
      info.appendChild(sub);

      card.appendChild(img);
      card.appendChild(info);

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
    var song = (d && d.name) || (state.current && state.current.name) || '未知歌曲';
    var singer = (d && singerText(d.singers)) || (state.current && singerText(state.current.singers)) || '';
    nameEl.textContent = song;
    subEl.textContent = singer;

    if (d && d.picurl) {
      coverEl.innerHTML = '';
      var img = document.createElement('img');
      img.referrerPolicy = 'no-referrer';
      img.alt = '';
      img.src = d.picurl;
      img.addEventListener('error', function () {
        coverEl.classList.add('is-broken');
      });
      coverEl.classList.remove('is-broken');
      coverEl.appendChild(img);
    }

    // 网易云 pay 字段表示是否付费/VIP 歌曲
    vipEl.hidden = !(d && d.pay === true);
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
        '<div class="tool-empty"><div class="tool-empty-icon">🎼</div><h3>该歌曲暂无歌词</h3><p>网易云未提供歌词，且未找到 QQ 同曲歌词。</p></div>';
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

  /* ================================ 播放 ================================ */

  function applyAudio(d) {
    var url = d && d.url;
    if (!url) {
      audioEl.removeAttribute('src');
      audioEl.load();
      return;
    }
    // 网易云音频是 http 直链（带鉴权 token），升级为 https 规避混合内容（实测 https 同样可用）
    url = url.replace(/^http:/, 'https:');
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

    request({ name: kw, limit: 10 })
      .then(function (json) {
        searchBtn.disabled = false;
        searchBtn.textContent = '搜索';
        if (json.code !== 0 || !Array.isArray(json.data) || !json.data.length) {
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
    detailEl.hidden = false;
    renderHead(item);
    audioEl.removeAttribute('src');
    audioEl.load();
    lyricEl.innerHTML = '<div class="qm-loading">正在准备播放…</div>';
    srcEl.hidden = true;
    setStatus('正在获取「' + (item.name || '') + '」的播放链接…', 'info');

    requestDetail(state.keyword, state.n)
      .then(function (d) {
        state.detail = d;
        renderHead(d);
        applyAudio(d);
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
    parts.push('歌曲：' + (d.name || (state.current && state.current.name) || '未知歌曲'));
    var ar = singerText(d.singers) || (state.current && singerText(state.current.singers)) || '';
    if (ar) parts.push('歌手：' + ar);
    parts.push('歌词来源：QQ 同曲兜底（网易云未提供）');
    parts.push('音频来源：网易云音乐 (OIAPI)');
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
    var name = [singerText(d.singers) || '', (d.name || '歌词')]
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

  // 网易云封面 CDN 已开放 CORS，可直接 blob 下载；失败则新标签打开兜底
  function downloadCover() {
    var url = state.detail && state.detail.picurl;
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
        var name = [singerText(d.singers) || '', (d.name || 'cover')]
          .filter(Boolean)
          .join(' - ')
          .replace(/[\\/:*?"<>|]/g, '_')
          .trim() || 'cover';
        var ext = /png/i.test(blob.type) ? 'png' : /webp/i.test(blob.type) ? 'webp' : 'jpg';
        downloadBlob(blob, name + '.' + ext);
        setStatus('封面已下载', 'ok');
      })
      .catch(function () {
        window.open(url, '_blank');
        window.DaibaoTools.toast('已在新标签打开封面，请右键图片「图片另存为」');
        setStatus('封面下载受限，已在新标签打开，请手动保存', 'warn');
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
      requestDetail(state.keyword, state.n)
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
