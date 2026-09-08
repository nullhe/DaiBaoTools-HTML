/* 酷狗歌词：通过 OIAPI 的 Kggc 接口搜索歌曲、获取歌词，瀑布流展示并支持 TXT 下载 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createKugouLyric = function (container) {
  var API = 'https://www.oiapi.net/api/Kggc';

  // 当前状态
  var state = {
    keyword: '',
    results: [], // 搜索返回的歌曲列表 [{name, singer, music, hash}]
    current: null, // 当前选中的歌曲对象
    n: 0, // 取词序号（从 1 开始）
    lines: [], // 解析后的歌词行 [{time, text}]
    meta: {}, // ti / ar / al / by / offset
    raw: '', // 原始歌词文本
    format: 'lrc',
    showTime: true,
    parsed: true, // 是否成功按 LRC 解析（krc/ksc 为 false）
  };

  container.innerHTML = `
    <div class="tool-card">
      <div class="tool-section">
        <h3 class="tool-section-title">搜索歌曲</h3>
        <p class="tool-quiet">数据来源 OIAPI 的「酷狗歌词」接口，歌词版权归原作者所有，仅供个人学习使用。</p>
      </div>

      <div class="qm-search">
        <input type="text" class="tool-input" id="kgKeyword" placeholder="输入歌名或歌手，例如：周杰伦 / 晴天" />
        <select class="tool-select qm-format" id="kgFormat" title="歌词格式">
          <option value="lrc">LRC（整行时间轴）</option>
          <option value="krc">KRC（逐字，原始内容）</option>
          <option value="ksc">KSC（原始内容）</option>
        </select>
        <button class="tool-btn primary" id="kgSearchBtn">搜索</button>
      </div>

      <div id="kgStatus" class="qm-status" hidden></div>
      <div id="kgResults" class="qm-results" hidden></div>

      <div id="kgLyricWrap" class="qm-lyric-wrap" hidden>
        <div class="qm-song-head">
          <div class="qm-cover is-broken" id="kgCover"></div>
          <div class="qm-song-info">
            <div class="qm-song-name" id="kgSongName"></div>
            <div class="qm-song-sub" id="kgSongSub"></div>
          </div>
        </div>

        <div class="qm-toolbar">
          <label class="qm-switch" title="控制歌词行前是否显示播放时间">
            <input type="checkbox" id="kgShowTime" checked />
            <span class="qm-switch-track"><span class="qm-switch-thumb"></span></span>
            <span class="qm-switch-label">显示播放时间</span>
          </label>
          <div class="qm-toolbar-right">
            <button class="tool-btn" id="kgCopyBtn">复制歌词</button>
            <button class="tool-btn primary" id="kgDownloadBtn">下载 TXT</button>
          </div>
        </div>

        <div id="kgLyricBody" class="qm-lyric"></div>
      </div>
    </div>`;

  var keywordEl = container.querySelector('#kgKeyword');
  var formatEl = container.querySelector('#kgFormat');
  var searchBtn = container.querySelector('#kgSearchBtn');
  var statusEl = container.querySelector('#kgStatus');
  var resultsEl = container.querySelector('#kgResults');
  var wrapEl = container.querySelector('#kgLyricWrap');
  var coverEl = container.querySelector('#kgCover');
  var songNameEl = container.querySelector('#kgSongName');
  var songSubEl = container.querySelector('#kgSongSub');
  var showTimeEl = container.querySelector('#kgShowTime');
  var copyBtn = container.querySelector('#kgCopyBtn');
  var downloadBtn = container.querySelector('#kgDownloadBtn');
  var lyricBodyEl = container.querySelector('#kgLyricBody');

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

  function singers(song) {
    if (!song) return '';
    return song.singer || '';
  }

  function songTitle(song) {
    if (!song) return '未知歌曲';
    return song.music || song.name || '未知歌曲';
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

  function hintForNetwork() {
    if (location.protocol === 'file:') {
      return '（若浏览器拦截了跨域请求，请用本地服务器方式打开本项目）';
    }
    return '';
  }

  /* ================================ LRC 解析 ================================ */

  var TIME_TAG = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g;

  function parseLrc(text) {
    var lines = String(text || '').split(/\r?\n/);
    var meta = {};
    var out = [];

    lines.forEach(function (line) {
      var trimmed = line.trim();
      if (!trimmed) return;

      // 元数据标签 [ti:xxx] [ar:xxx] [al:xxx] [by:xxx] [offset:0]
      var metaMatch = trimmed.match(/^\[(ti|ar|al|by|offset):(.*)\]$/i);
      if (metaMatch) {
        meta[metaMatch[1].toLowerCase()] = metaMatch[2];
        return;
      }

      // 收集本行所有时间标签
      var times = [];
      var m;
      TIME_TAG.lastIndex = 0;
      while ((m = TIME_TAG.exec(trimmed)) !== null) {
        times.push({
          mm: parseInt(m[1], 10),
          ss: parseInt(m[2], 10),
          cs: m[3] ? parseInt(m[3], 10) : 0,
          raw: m[0],
        });
      }

      if (!times.length) return;

      // 去掉所有时间标签后剩下的就是歌词文本
      var content = trimmed.replace(TIME_TAG, '').trim();

      times.forEach(function (t) {
        out.push({
          time: t,
          text: content,
          sortKey: t.mm * 60000 + t.ss * 1000 + t.cs,
        });
      });
    });

    out.sort(function (a, b) {
      return a.sortKey - b.sortKey;
    });

    return { meta: meta, lines: out };
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

  // 制作信息行（作词/作曲/编曲等），展示时弱化
  var CREDIT_RE = /^(作?词|作?曲|编曲|制作人|监制|录音|混音|母带|合声|和声|吉他|贝斯|鼓|键盘|弦乐|OP|SP|出品|发行)[:：]/;

  function isCredit(text) {
    return CREDIT_RE.test(String(text || '').trim());
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

      var cover = document.createElement('div');
      cover.className = 'qm-result-cover is-note';
      cover.textContent = '🎵';

      var info = document.createElement('div');
      info.className = 'qm-result-info';

      var name = document.createElement('div');
      name.className = 'qm-result-name';
      name.textContent = songTitle(song);

      var sub = document.createElement('div');
      sub.className = 'qm-result-sub';
      sub.textContent = singers(song);

      info.appendChild(name);
      info.appendChild(sub);

      var idx = document.createElement('div');
      idx.className = 'qm-result-dur';
      idx.textContent = '#' + (i + 1);

      card.appendChild(cover);
      card.appendChild(info);
      card.appendChild(idx);

      function pick() {
        fetchLyric(song, i);
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

  function renderLyric() {
    lyricBodyEl.innerHTML = '';

    if (!state.parsed) {
      // krc / ksc 等非 LRC 格式：原样展示，避免错误解析
      var pre = document.createElement('pre');
      pre.className = 'qm-raw';
      pre.textContent = state.raw;
      lyricBodyEl.appendChild(pre);
      return;
    }

    if (!state.lines.length) {
      var empty = document.createElement('div');
      empty.className = 'tool-empty';
      empty.innerHTML =
        '<div class="tool-empty-icon">🎼</div><h3>该歌曲暂无歌词</h3><p>可能为纯音乐，或接口未提供歌词内容。</p>';
      lyricBodyEl.appendChild(empty);
      return;
    }

    var showTime = state.showTime;
    var frag = document.createDocumentFragment();

    state.lines.forEach(function (line) {
      if (!line.text) return; // 空行不占位

      var row = document.createElement('div');
      row.className = 'qm-line' + (isCredit(line.text) ? ' is-credit' : '');

      if (showTime) {
        var time = document.createElement('span');
        time.className = 'qm-line-time';
        time.textContent = fmtTimeTag(line.time);
        row.appendChild(time);
      }

      var text = document.createElement('span');
      text.className = 'qm-line-text';
      text.textContent = line.text; // 用 textContent，避免第三方内容注入
      row.appendChild(text);

      frag.appendChild(row);
    });

    lyricBodyEl.appendChild(frag);
  }

  function renderSongHead() {
    var song = state.current;
    if (!song) return;
    coverEl.classList.add('is-broken'); // 酷狗接口无封面，统一显示音符占位
    songNameEl.textContent = songTitle(song);
    songSubEl.textContent = singers(song);
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

        // 搜索模式：data 为数组；取词模式：data 为对象。需先排除取词误判。
        if (json.code !== 1 || !Array.isArray(json.data) || !json.data.length) {
          setStatus('没有找到相关歌曲，换个关键词试试', 'warn');
          resultsEl.hidden = true;
          return;
        }

        state.results = json.data;
        renderResults();
        setStatus('共找到 ' + json.data.length + ' 首相关歌曲，点击任一首获取歌词', 'ok');
      })
      .catch(function (err) {
        searchBtn.disabled = false;
        searchBtn.textContent = '搜索';
        setStatus('请求失败：' + err.message + hintForNetwork(), 'error');
      });
  }

  function fetchLyric(song, index) {
    state.current = song;
    state.n = index + 1; // 接口 n 从 1 开始
    state.format = formatEl.value;
    wrapEl.hidden = false;
    renderSongHead();
    lyricBodyEl.innerHTML = '<div class="qm-loading">正在获取歌词…</div>';
    setStatus('正在获取「' + songTitle(song) + '」的歌词…', 'info');

    request({ msg: state.keyword, n: state.n, format: state.format })
      .then(function (json) {
        if (json.code !== 1) {
          lyricBodyEl.innerHTML = '';
          setStatus('获取歌词失败：' + (json.message || '未知错误'), 'error');
          state.lines = [];
          state.parsed = true;
          state.raw = '';
          renderLyric();
          return;
        }

        // 取词模式下 data 为对象（含 content/base64）；若越界或异常则退化为搜索数组
        var d = json.data;
        var content = '';
        if (d && typeof d === 'object' && !Array.isArray(d)) {
          content = d.content || '';
          if (!content && d.base64) {
            try {
              content = decodeURIComponent(escape(window.atob(d.base64)));
            } catch (e) {
              content = '';
            }
          }
        }
        // 兜底：直接用 message（取词模式下 message 即歌词正文）
        if (!content && typeof json.message === 'string' && /\[0?\d:\d{2}/.test(json.message)) {
          content = json.message;
        }

        state.raw = content;

        var parsed = parseLrc(content);
        state.meta = parsed.meta;
        state.lines = parsed.lines;
        state.parsed = state.lines.length > 0;

        renderLyric();

        if (state.parsed) {
          setStatus('已获取歌词，共 ' + state.lines.length + ' 句', 'ok');
        } else if (state.raw) {
          setStatus('当前格式无法按行解析，已原样展示原始歌词内容', 'warn');
        } else {
          setStatus('该歌曲暂无歌词内容', 'warn');
        }
      })
      .catch(function (err) {
        lyricBodyEl.innerHTML = '';
        setStatus('请求失败：' + err.message + hintForNetwork(), 'error');
      });
  }

  /* ================================ 导出 ================================ */

  function buildText() {
    var song = state.current || {};
    var parts = [];

    parts.push('歌曲：' + (songTitle(song) || state.meta.ti || '未知歌曲'));
    var ar = singers(song) || state.meta.ar || '';
    if (ar) parts.push('歌手：' + ar);
    if (song.music && state.meta.al) parts.push('专辑：' + state.meta.al);
    parts.push('歌词格式：' + String(state.format).toUpperCase());
    parts.push('来源：OIAPI 酷狗歌词接口');
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

    // Windows 记事本用 CRLF，并加 BOM 防止中文乱码
    return '﻿' + parts.join('\r\n');
  }

  function download() {
    if (!state.raw && !state.lines.length) {
      setStatus('还没有歌词内容可以下载', 'warn');
      return;
    }
    var song = state.current || {};
    var name = [singers(song) || state.meta.ar || '', songTitle(song) || state.meta.ti || '歌词']
      .filter(Boolean)
      .join(' - ');
    name = name.replace(/[\\/:*?"<>|]/g, '_').trim() || '歌词';

    var blob = new Blob([buildText()], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);

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

  /* ================================ 事件绑定 ================================ */

  searchBtn.addEventListener('click', search);
  keywordEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') search();
  });
  downloadBtn.addEventListener('click', download);
  copyBtn.addEventListener('click', copyLyric);
  showTimeEl.addEventListener('change', function () {
    state.showTime = showTimeEl.checked;
    renderLyric();
  });
  formatEl.addEventListener('change', function () {
    if (state.current) fetchLyric(state.current, state.n - 1);
  });
};
