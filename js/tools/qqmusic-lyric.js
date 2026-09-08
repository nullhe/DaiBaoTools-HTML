/* QQ Music 歌词：通过 OIAPI 搜索歌曲、获取歌词，瀑布流展示并支持 TXT 下载 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createQqMusicLyric = function (container) {
  var API = 'https://www.oiapi.net/api/QQMusicLyric';

  // 当前状态
  var state = {
    keyword: '',
    results: [],
    current: null, // 当前歌曲对象
    lines: [], // 解析后的歌词行 [{time, text}]
    meta: {}, // ti / ar / al / by / offset
    raw: '', // 原始歌词文本
    format: 'lrc',
    showTime: true,
    parsed: true, // 是否成功按 LRC 解析（qrc/ksc 为 false）
  };

  container.innerHTML = `
    <div class="tool-card">
      <div class="tool-section">
        <h3 class="tool-section-title">搜索歌曲</h3>
        <p class="tool-quiet">数据来源 OIAPI 的「QQ Music 歌词」接口，歌词版权归原作者所有，仅供个人学习使用。</p>
      </div>

      <div class="qm-search">
        <input type="text" class="tool-input" id="qmKeyword" placeholder="输入歌名或歌手，例如：周杰伦 / 晴天" />
        <select class="tool-select qm-format" id="qmFormat" title="歌词格式">
          <option value="lrc">LRC（整行时间轴）</option>
          <option value="qrc">QRC（逐字，原始内容）</option>
          <option value="ksc">KSC（原始内容）</option>
        </select>
        <button class="tool-btn primary" id="qmSearchBtn">搜索</button>
      </div>

      <div id="qmStatus" class="qm-status" hidden></div>
      <div id="qmResults" class="qm-results" hidden></div>

      <div id="qmLyricWrap" class="qm-lyric-wrap" hidden>
        <div class="qm-song-head">
          <div class="qm-cover" id="qmCover"></div>
          <div class="qm-song-info">
            <div class="qm-song-name" id="qmSongName"></div>
            <div class="qm-song-sub" id="qmSongSub"></div>
          </div>
        </div>

        <div class="qm-toolbar">
          <label class="qm-switch" title="控制歌词行前是否显示播放时间">
            <input type="checkbox" id="qmShowTime" checked />
            <span class="qm-switch-track"><span class="qm-switch-thumb"></span></span>
            <span class="qm-switch-label">显示播放时间</span>
          </label>
          <div class="qm-toolbar-right">
            <button class="tool-btn" id="qmCoverBtn">封面下载</button>
            <button class="tool-btn" id="qmCopyBtn">复制歌词</button>
            <button class="tool-btn primary" id="qmDownloadBtn">下载 TXT</button>
          </div>
        </div>

        <div id="qmLyricBody" class="qm-lyric"></div>
      </div>
    </div>`;

  var keywordEl = container.querySelector('#qmKeyword');
  var formatEl = container.querySelector('#qmFormat');
  var searchBtn = container.querySelector('#qmSearchBtn');
  var statusEl = container.querySelector('#qmStatus');
  var resultsEl = container.querySelector('#qmResults');
  var wrapEl = container.querySelector('#qmLyricWrap');
  var coverEl = container.querySelector('#qmCover');
  var songNameEl = container.querySelector('#qmSongName');
  var songSubEl = container.querySelector('#qmSongSub');
  var showTimeEl = container.querySelector('#qmShowTime');
  var copyBtn = container.querySelector('#qmCopyBtn');
  var coverBtn = container.querySelector('#qmCoverBtn');
  var downloadBtn = container.querySelector('#qmDownloadBtn');
  var lyricBodyEl = container.querySelector('#qmLyricBody');

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

  // 接口返回的 image 字段缺少 ".jpg"（形如 ...ClKGjpg），直接拼会更可靠
  function coverUrl(song) {
    if (song && song.album_mid) {
      return 'https://y.gtimg.cn/music/photo_new/T002R300x300M000' + song.album_mid + '.jpg';
    }
    var raw = (song && song.image) || '';
    if (!raw) return '';
    return raw.replace(/\?.*$/, '').replace(/(jpg|png|jpeg)$/i, '.$1');
  }

  function fmtDuration(sec) {
    var s = parseInt(sec, 10);
    if (!isFinite(s) || s < 0) return '';
    var m = Math.floor(s / 60);
    var ss = s % 60;
    return m + ':' + (ss < 10 ? '0' + ss : ss);
  }

  function singers(song) {
    return Array.isArray(song.singer) ? song.singer.join(' / ') : song.singer || '';
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
          // 换算到百分秒，用于按时间排序
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

      var img = document.createElement('img');
      img.className = 'qm-result-cover';
      img.loading = 'lazy';
      img.referrerPolicy = 'no-referrer';
      img.alt = '';
      img.src = coverUrl(song);
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
      var parts = [singers(song), song.album].filter(Boolean);
      sub.textContent = parts.join(' · ');

      info.appendChild(name);
      info.appendChild(sub);

      var dur = document.createElement('div');
      dur.className = 'qm-result-dur';
      dur.textContent = fmtDuration(song.duration);

      card.appendChild(img);
      card.appendChild(info);
      card.appendChild(dur);

      function pick() {
        fetchLyric(song);
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
      // qrc / ksc 等非 LRC 格式：原样展示，避免错误解析
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

    coverEl.innerHTML = '';
    var img = document.createElement('img');
    img.referrerPolicy = 'no-referrer';
    img.alt = '';
    img.src = coverUrl(song);
    img.addEventListener('error', function () {
      coverEl.classList.add('is-broken');
    });
    coverEl.classList.remove('is-broken');
    coverEl.appendChild(img);

    songNameEl.textContent = song.name || '未知歌曲';
    var sub = [singers(song), song.album, fmtDuration(song.duration)].filter(Boolean);
    songSubEl.textContent = sub.join(' · ');
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

    request({ keyword: kw, limit: 20 })
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
        setStatus('共找到 ' + json.data.length + ' 首歌曲，点击任一首获取歌词', 'ok');
      })
      .catch(function (err) {
        searchBtn.disabled = false;
        searchBtn.textContent = '搜索';
        setStatus('请求失败：' + err.message + hintForNetwork(), 'error');
      });
  }

  function hintForNetwork() {
    if (location.protocol === 'file:') {
      return '（若浏览器拦截了跨域请求，请用本地服务器方式打开本项目）';
    }
    return '';
  }

  function fetchLyric(song) {
    state.current = song;
    state.format = formatEl.value;
    wrapEl.hidden = false;
    renderSongHead();
    lyricBodyEl.innerHTML = '<div class="qm-loading">正在获取歌词…</div>';
    setStatus('正在获取「' + (song.name || '') + '」的歌词…', 'info');

    request({ id: song.mid, format: state.format })
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

        // 文档写的字段是 conteng，实际是 content；两者都兼容
        var content = (json.data && (json.data.content || json.data.conteng)) || '';
        if (!content && json.data && json.data.base64) {
          try {
            content = decodeURIComponent(escape(window.atob(json.data.base64)));
          } catch (e) {
            content = '';
          }
        }

        state.raw = content;

        var parsed = parseLrc(content);
        state.meta = parsed.meta;
        state.lines = parsed.lines;
        state.parsed = state.lines.length > 0;

        renderLyric();

        if (state.parsed) {
          setStatus(
            '已获取歌词，共 ' + state.lines.length + ' 句' + (json.data && json.data.cache ? '（接口缓存）' : ''),
            'ok'
          );
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

    parts.push('歌曲：' + (song.name || state.meta.ti || '未知歌曲'));
    var ar = singers(song) || state.meta.ar || '';
    if (ar) parts.push('歌手：' + ar);
    var al = song.album || state.meta.al || '';
    if (al) parts.push('专辑：' + al);
    if (song.duration) parts.push('时长：' + fmtDuration(song.duration));
    parts.push('歌词格式：' + String(state.format).toUpperCase());
    parts.push('来源：OIAPI QQ Music 歌词接口');
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
    return '\ufeff' + parts.join('\r\n');
  }

  function download() {
    if (!state.raw && !state.lines.length) {
      setStatus('还没有歌词内容可以下载', 'warn');
      return;
    }
    var song = state.current || {};
    var name = [singers(song) || state.meta.ar || '', song.name || state.meta.ti || '歌词']
      .filter(Boolean)
      .join(' - ');
    // 去除文件名非法字符
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

  function downloadCover() {
    var song = state.current;
    if (!song) {
      setStatus('请先选择一首歌曲再下载封面', 'warn');
      return;
    }
    var url = coverUrl(song);
    if (!url) {
      setStatus('该歌曲没有可用的封面图片', 'warn');
      return;
    }
    // 优先 fetch 为 blob 直接下载（需要 CDN 开放 CORS）
    fetch(encodeURI(url))
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.blob();
      })
      .then(function (blob) {
        var s = state.current || {};
        var name = [(singers(s) || state.meta.ar || ''), (s.name || state.meta.ti || 'cover')]
          .filter(Boolean)
          .join(' - ')
          .replace(/[\\/:*?"<>|]/g, '_')
          .trim() || 'cover';
        var a = document.createElement('a');
        var objUrl = URL.createObjectURL(blob);
        a.href = objUrl;
        a.download = name + '.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.setTimeout(function () {
          URL.revokeObjectURL(objUrl);
        }, 1000);
        setStatus('封面已下载：' + name + '.jpg', 'ok');
      })
      .catch(function () {
        // 封面 CDN 无 CORS 头时 fetch 被拦，降级为 new tab 供手动另存
        window.open(url, '_blank');
        if (window.DaibaoTools && window.DaibaoTools.toast) {
          window.DaibaoTools.toast('封面受跨域限制无法直接下载，已在新标签打开，请右键图片「图片另存为」');
        }
        setStatus('封面受跨域限制无法直接下载，已在新标签打开，请手动保存', 'warn');
      });
  }

  /* ================================ 事件绑定 ================================ */

  searchBtn.addEventListener('click', search);
  keywordEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') search();
  });
  downloadBtn.addEventListener('click', download);
  coverBtn.addEventListener('click', downloadCover);
  copyBtn.addEventListener('click', copyLyric);
  showTimeEl.addEventListener('change', function () {
    state.showTime = showTimeEl.checked;
    renderLyric();
  });
  formatEl.addEventListener('change', function () {
    if (state.current) fetchLyric(state.current);
  });
};
