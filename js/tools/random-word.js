/* 英语学习 / 随机英文单词（学习资料 L3），数据来自 OIAPI id/109 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createRandomWord = function createRandomWord(container) {
  container.innerHTML = `
    <div class="rwd-tool">
      <div class="rwd-header">
        <h2 class="rwd-title">🔤 随机英文单词</h2>
        <p class="rwd-subtitle">每次随机给出一个英文单词、中文释义与例句，适合碎片时间背词</p>
      </div>

      <div class="rwd-controls">
        <button class="tool-btn tool-btn-primary" type="button" id="rwdNext">换一个</button>
      </div>

      <div class="rwd-result" id="rwdResult">
        <div class="rwd-loading">正在抽取单词…</div>
      </div>
    </div>
  `;

  var nextBtn = container.querySelector('#rwdNext');
  var result = container.querySelector('#rwdResult');
  var loading = false;

  function str(v) {
    return v == null ? '' : String(v);
  }

  function showError(msg) {
    result.innerHTML = '';
    var box = document.createElement('div');
    box.className = 'tool-empty';
    box.innerHTML = '<div class="tool-empty-icon">⚠️</div>';
    var h = document.createElement('h3');
    h.textContent = '没能拿到单词';
    var p = document.createElement('p');
    p.textContent = msg || '请稍后再试一次';
    box.appendChild(h);
    box.appendChild(p);
    result.appendChild(box);
  }

  function renderWord(d) {
    result.innerHTML = '';

    var card = document.createElement('div');
    card.className = 'rwd-card';

    var wordRow = document.createElement('div');
    wordRow.className = 'rwd-word-row';

    var word = document.createElement('div');
    word.className = 'rwd-word';
    word.textContent = str(d.content) || '—';

    var trans = document.createElement('div');
    trans.className = 'rwd-trans';
    trans.textContent = str(d.trans) || '—';

    wordRow.appendChild(word);
    wordRow.appendChild(trans);

    card.appendChild(wordRow);

    var sentences = Array.isArray(d.sentences) ? d.sentences : [];
    if (sentences.length) {
      var list = document.createElement('div');
      list.className = 'rwd-sentences';

      var label = document.createElement('div');
      label.className = 'rwd-sent-label';
      label.textContent = '例句';
      list.appendChild(label);

      sentences.forEach(function (s) {
        var item = document.createElement('div');
        item.className = 'rwd-sentence';

        var eng = document.createElement('div');
        eng.className = 'rwd-sent-eng';
        eng.textContent = str(s.sContent) || str(s.sContent_eng) || '';

        var cn = document.createElement('div');
        cn.className = 'rwd-sent-cn';
        cn.textContent = str(s.sCn) || '';

        item.appendChild(eng);
        if (cn.textContent) item.appendChild(cn);
        list.appendChild(item);
      });

      card.appendChild(list);
    }

    result.appendChild(card);
  }

  function load() {
    if (loading) return;
    loading = true;
    nextBtn.disabled = true;
    result.innerHTML = '<div class="rwd-loading">正在抽取单词…</div>';

    fetch('https://www.oiapi.net/api/RandEnglishDict?type=json')
      .then(function (resp) {
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        return resp.json();
      })
      .then(function (json) {
        if (json.code !== 1 || !json.data) {
          throw new Error(json.message || '接口未返回有效数据');
        }
        renderWord(json.data);
      })
      .catch(function (err) {
        showError(err.message || '网络或跨域读取失败');
      })
      .finally(function () {
        loading = false;
        nextBtn.disabled = false;
      });
  }

  nextBtn.addEventListener('click', load);

  // 进入即自动抽一个
  load();

  if (window.DaibaoMotion && window.DaibaoMotion.onContentChange) {
    try {
      window.DaibaoMotion.onContentChange(container);
    } catch (e) {
      /* 动效异常不影响功能 */
    }
  }
};
