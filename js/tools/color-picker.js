/* 颜色选择器 */
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createColorPicker = function (container) {
  container.innerHTML = `
    <div class="tool-wrap">
      <div class="tool-head">
        <div class="tool-title">颜色选择器</div>
        <div class="tool-subtitle">HEX、RGB、HSL 互相转换</div>
      </div>
      <div class="tool-cols">
        <div class="tool-col">
          <div class="tool-panel-title">取色</div>
          <div class="tool-colorbox" id="cpPreview"></div>
          <div class="tool-field">
            <span class="tool-label">拖动取色</span>
            <input class="tool-input" type="color" id="cpNative" value="#3B82F6" style="height:48px;padding:2px">
          </div>
          <div class="tool-field">
            <span class="tool-label">HEX</span>
            <input class="tool-input" id="cpHex" value="#3B82F6" maxlength="7">
          </div>
        </div>

        <div class="tool-col">
          <div class="tool-panel-title">数值</div>
          <div class="tool-inline">
            <div class="tool-field" style="flex:1">
              <span class="tool-label">R</span>
              <input class="tool-input" type="number" id="cpR" min="0" max="255" step="1">
            </div>
            <div class="tool-field" style="flex:1">
              <span class="tool-label">G</span>
              <input class="tool-input" type="number" id="cpG" min="0" max="255" step="1">
            </div>
            <div class="tool-field" style="flex:1">
              <span class="tool-label">B</span>
              <input class="tool-input" type="number" id="cpB" min="0" max="255" step="1">
            </div>
          </div>
          <div class="tool-field">
            <span class="tool-label">HSL</span>
            <div class="tool-output plain" id="cpHsl" style="min-height:auto">-</div>
          </div>
          <div class="tool-btn-row">
            <button class="tool-btn" id="cpCopyHex">复制 HEX</button>
            <button class="tool-btn" id="cpCopyRgb">复制 RGB</button>
            <button class="tool-btn" id="cpCopyHsl">复制 HSL</button>
          </div>
          <p class="tool-hint">修改上方任意一项，其余数值会同步更新。</p>
        </div>
      </div>
    </div>`;

  var preview = container.querySelector('#cpPreview');
  var native = container.querySelector('#cpNative');
  var hexEl = container.querySelector('#cpHex');
  var rEl = container.querySelector('#cpR');
  var gEl = container.querySelector('#cpG');
  var bEl = container.querySelector('#cpB');
  var hslEl = container.querySelector('#cpHsl');

  function hexToRgb(hex) {
    var h = String(hex).replace('#', '').trim();
    if (h.length === 3) {
      h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    }
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16)
    };
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b]
      .map(function (v) {
        var n = Math.max(0, Math.min(255, Math.round(v)));
        return ('0' + n.toString(16)).slice(-2);
      })
      .join('')
      .toUpperCase();
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var h = 0, s = 0;
    var l = (max + min) / 2;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) {
        h = (g - b) / d + (g < b ? 6 : 0);
      } else if (max === g) {
        h = (b - r) / d + 2;
      } else {
        h = (r - g) / d + 4;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  function applyRgb(rgb) {
    var hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    var hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    preview.style.background = hex;
    native.value = hex.toLowerCase();
    hexEl.value = hex;
    rEl.value = rgb.r;
    gEl.value = rgb.g;
    bEl.value = rgb.b;
    hslEl.textContent = 'hsl(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%)';
    return { hex: hex, hsl: hsl };
  }

  var current = { hex: '#3B82F6', hsl: null };

  function syncFromRgbInputs() {
    var r = parseInt(rEl.value, 10);
    var g = parseInt(gEl.value, 10);
    var b = parseInt(bEl.value, 10);
    if ([r, g, b].some(function (v) { return !isFinite(v); })) return;
    current = applyRgb({ r: r, g: g, b: b });
  }

  native.addEventListener('input', function () {
    var rgb = hexToRgb(native.value);
    if (rgb) current = applyRgb(rgb);
  });

  hexEl.addEventListener('input', function () {
    var rgb = hexToRgb(hexEl.value);
    if (rgb) current = applyRgb(rgb);
  });

  [rEl, gEl, bEl].forEach(function (el) {
    el.addEventListener('input', syncFromRgbInputs);
  });

  container.querySelector('#cpCopyHex').onclick = function () {
    DaibaoTools.copyText(current.hex);
    DaibaoTools.toast('已复制 ' + current.hex);
  };
  container.querySelector('#cpCopyRgb').onclick = function () {
    var t = 'rgb(' + rEl.value + ', ' + gEl.value + ', ' + bEl.value + ')';
    DaibaoTools.copyText(t);
    DaibaoTools.toast('已复制 ' + t);
  };
  container.querySelector('#cpCopyHsl').onclick = function () {
    DaibaoTools.copyText(hslEl.textContent);
    DaibaoTools.toast('已复制 ' + hslEl.textContent);
  };

  current = applyRgb({ r: 59, g: 130, b: 246 });
};
