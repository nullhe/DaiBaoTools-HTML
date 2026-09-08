/* 图标排列：批量选择本地图片，按可调行列自动排列成图标墙 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createIconArrange = function (container) {
  container.innerHTML = `
    <div class="tool-wrap">
      <div class="tool-head">
        <div class="tool-title">图标排列</div>
        <div class="tool-subtitle">批量选择本地图片，自动排列成图标墙，横竖个数自由调整</div>
      </div>

      <div class="iw-toolbar">
        <label class="tool-btn primary iw-file-label">
          📁 批量选择图片
          <input type="file" id="iwFile" accept="image/*" multiple hidden>
        </label>
        <button class="tool-btn" id="iwClear">清空全部</button>
        <span class="tool-hint" id="iwStat">尚未选择图片</span>
      </div>

      <div class="iw-controls">
        <div class="iw-ctrl">
          <label class="tool-label" for="iwCols">每行个数：<strong id="iwColsText">10</strong></label>
          <input class="tool-range" type="range" id="iwCols" min="1" max="16" value="10">
        </div>
        <div class="iw-ctrl">
          <label class="tool-label" for="iwRows">行数：<strong id="iwRowsText">自动</strong></label>
          <input class="tool-range" type="range" id="iwRows" min="0" max="10" value="0">
          <div class="tool-hint">0 = 自动（按图片数量撑满）</div>
        </div>
        <div class="iw-ctrl">
          <label class="tool-label" for="iwGap">卡片间距：<strong id="iwGapText">14</strong> px</label>
          <input class="tool-range" type="range" id="iwGap" min="0" max="40" value="14">
        </div>
        <div class="iw-ctrl">
          <label class="tool-label" for="iwRadius">卡片圆角：<strong id="iwRadiusText">18</strong> px</label>
          <input class="tool-range" type="range" id="iwRadius" min="0" max="40" value="18">
        </div>
        <div class="iw-ctrl">
          <label class="tool-label" for="iwFit">图片适配</label>
          <select class="tool-select" id="iwFit">
            <option value="contain" selected>完整显示（contain）</option>
            <option value="cover">填满裁切（cover）</option>
          </select>
        </div>
        <div class="iw-ctrl">
          <label class="tool-label" for="iwPad">图标留白：<strong id="iwPadText">15</strong>%</label>
          <input class="tool-range" type="range" id="iwPad" min="0" max="35" value="15">
        </div>
      </div>

      <div class="tool-error" id="iwError"></div>

      <div class="iw-wall" id="iwWall"></div>

      <p class="tool-hint">
        · 选择即<strong>追加</strong>，可多次分批选择；鼠标移到卡片上点 <strong>×</strong> 可移除单张。<br>
        · 图片仅在浏览器本地读取（blob），<strong>不会上传</strong>；刷新页面后需重新选择。<br>
        · 固定行数时按顺序只显示「每行个数 × 行数」张，多出的图片不计入显示。
      </p>
    </div>`;

  var fileInput = container.querySelector('#iwFile');
  var wall = container.querySelector('#iwWall');
  var statEl = container.querySelector('#iwStat');
  var errorEl = container.querySelector('#iwError');

  var images = []; // { url, name }

  // ---------- 控件 ----------
  var colsEl = container.querySelector('#iwCols');
  var rowsEl = container.querySelector('#iwRows');
  var gapEl = container.querySelector('#iwGap');
  var radiusEl = container.querySelector('#iwRadius');
  var padEl = container.querySelector('#iwPad');
  var fitEl = container.querySelector('#iwFit');

  function cols() {
    return parseInt(colsEl.value, 10);
  }

  function rowsFixed() {
    return parseInt(rowsEl.value, 10); // 0 = 自动
  }

  function visibleCount() {
    var fixed = rowsFixed();
    if (!fixed) return images.length;
    return Math.min(images.length, cols() * fixed);
  }

  function syncLabels() {
    container.querySelector('#iwColsText').textContent = cols();
    container.querySelector('#iwRowsText').textContent = rowsFixed() ? rowsFixed() + ' 行' : '自动';
    container.querySelector('#iwGapText').textContent = gapEl.value;
    container.querySelector('#iwRadiusText').textContent = radiusEl.value;
    container.querySelector('#iwPadText').textContent = padEl.value;
  }

  // ---------- 渲染 ----------
  function render() {
    syncLabels();
    errorEl.textContent = '';

    if (!images.length) {
      wall.innerHTML = '<div class="iw-empty">选择图片后自动排列在这里</div>';
      wall.style.gridTemplateColumns = '';
      wall.style.gap = '';
      statEl.textContent = '尚未选择图片';
      return;
    }

    var show = visibleCount();
    var c = cols();
    wall.style.gridTemplateColumns = 'repeat(' + c + ', 1fr)';
    wall.style.gap = gapEl.value + 'px';

    var radius = radiusEl.value + 'px';
    var pad = padEl.value + '%';

    var html = '';
    for (var i = 0; i < show; i++) {
      var img = images[i];
      html +=
        '<div class="iw-card" style="border-radius:' + radius + '" title="' + esc(img.name) + '">' +
        '<img src="' + img.url + '" alt="" style="object-fit:' + fitEl.value + ';padding:' + pad + '">' +
        '<button class="iw-remove" data-i="' + i + '" title="移除这张">×</button>' +
        '</div>';
    }
    wall.innerHTML = html;

    wall.querySelectorAll('.iw-remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        removeAt(parseInt(btn.dataset.i, 10));
      });
    });

    var suffix = '';
    if (rowsFixed() && images.length > show) {
      suffix = '，另有 ' + (images.length - show) + ' 张未显示（增大行数或改为自动）';
    }
    statEl.textContent = '已选 ' + images.length + ' 张，当前显示 ' + show + ' 张（' + c + ' 列 × ' + (rowsFixed() || Math.ceil(images.length / c)) + ' 行）' + suffix;
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function removeAt(i) {
    if (i < 0 || i >= images.length) return;
    try {
      URL.revokeObjectURL(images[i].url);
    } catch (e) {}
    images.splice(i, 1);
    render();
  }

  function addFiles(fileList) {
    errorEl.textContent = '';
    var added = 0;
    for (var i = 0; i < fileList.length; i++) {
      var f = fileList[i];
      if (!/^image\//.test(f.type)) {
        errorEl.textContent = '已跳过非图片文件：' + f.name;
        continue;
      }
      images.push({ url: URL.createObjectURL(f), name: f.name });
      added++;
    }
    if (!added && !errorEl.textContent) {
      errorEl.textContent = '没有可添加的图片';
    }
    render();
  }

  fileInput.addEventListener('change', function () {
    if (fileInput.files && fileInput.files.length) {
      addFiles(fileInput.files);
      fileInput.value = ''; // 允许再次选择同一批文件
    }
  });

  container.querySelector('#iwClear').addEventListener('click', function () {
    images.forEach(function (img) {
      try {
        URL.revokeObjectURL(img.url);
      } catch (e) {}
    });
    images = [];
    render();
    DaibaoTools.toast('已清空');
  });

  // 拖拽图片文件到页面直接追加
  wall.addEventListener('dragover', function (e) {
    e.preventDefault();
    wall.classList.add('iw-dragover');
  });
  wall.addEventListener('dragleave', function () {
    wall.classList.remove('iw-dragover');
  });
  wall.addEventListener('drop', function (e) {
    e.preventDefault();
    wall.classList.remove('iw-dragover');
    if (e.dataTransfer && e.dataTransfer.files.length) {
      addFiles(e.dataTransfer.files);
    }
  });

  [colsEl, rowsEl, gapEl, radiusEl, padEl].forEach(function (el) {
    el.addEventListener('input', render);
  });
  fitEl.addEventListener('change', render);

  render();
};
