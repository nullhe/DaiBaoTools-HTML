# 呆宝工具箱

一个**零依赖、零构建、双击即用**的本地单页工具集合。纯 HTML + CSS + 原生 JavaScript 实现，不引入任何框架、CDN 或第三方库，所有计算全部在浏览器本地完成，数据不出本机。

![无依赖](https://img.shields.io/badge/dependencies-0-brightgreen)
![原生实现](https://img.shields.io/badge/vanilla-HTML%2FCSS%2FJS-orange)
![无需构建](https://img.shields.io/badge/build-none-blue)

---

## 快速开始

### 方式一：双击打开（推荐）

直接双击项目根目录下的 **`首页.html`** 即可使用，**不需要安装任何东西，也不需要启动服务器**。

> 本项目刻意避开了 ES Module（`type="module"` + `import`）。因为 `file://` 协议下页面 origin 为 `null`，模块脚本会被浏览器同源策略拦截导致白屏。全部脚本改用普通 `<script>` 顺序加载 + 全局命名空间，从而在 `file://` 下也能正常运行。

### 方式二：本地服务器

如果你更习惯用 HTTP 方式访问：

```bash
# Python 3
python -m http.server 8080

# Node.js
npx serve .
```

然后浏览器访问 `http://localhost:8080/首页.html`。

### 方式三：GitHub Pages

仓库 Settings → Pages → Source 选择分支与根目录即可发布。

> ⚠️ Pages 默认入口为 `index.html`。若需 Pages 直接命中首页，请把 `首页.html` 改名（或复制一份）为 `index.html`，否则需要访问 `https://<用户名>.github.io/DaiBaoTools-HTML/首页.html`。

---

## 功能一览

共 **18 个工具**，按 5 个分类组织，顶部导航切换分类、二级导航切换工具，全程无刷新。

### 💰 财务工具

| 工具 | 说明 |
|------|------|
| **增值税计算器** | 按含税销售额与适用税率，计算销项税额、不含税销售额、价税合计；税率 13% / 9% / 6% / 5% / 3% / 0% 可选，实时校验与结果展示 |
| **个税计算器** | 工资薪金所得**累计预扣预缴法**。支持三险一金、六项专项附加扣除（子女教育、婴幼儿照护、继续教育、房贷利息、住房租金、赡养老人）勾选累加，含**年终奖单独计税**，输出全年 12 个月明细表与税负率 |

### 💻 开发工具

| 工具 | 说明 |
|------|------|
| **JSON 格式化** | 格式化 / 压缩 / 校验，缩进 2 / 4 / Tab 可选，语法错误定位 |
| **Base64 编解码** | UTF-8 安全，中文不乱码；大文本分块处理避免卡死 |
| **时间戳转换** | 当前秒 / 毫秒时间戳、秒毫秒互转、日期时间 ↔ 时间戳 |
| **正则测试器** | 实时匹配高亮、捕获分组明细、替换预览（支持 `$1`）、9 个常用预设，flags 可视化勾选 |
| **URL 编解码** | `encodeURI(Component)` / `decodeURI(Component)` 四合一，查询串 ↔ 可编辑参数表双向生成，URL 结构分解 |
| **JWT 解析** | 解码 Header / Payload，标准声明（`iss`/`sub`/`aud`/`exp`/`iat`/`nbf`/`jti`）转本地时间，有效期状态判断 |
| **文本对比** | 逐行 LCS 差异比对，并排高亮新增 / 删除 / 修改，支持忽略空白 / 大小写 / 空行，「仅显示差异」开关，可导出差异报告 |

### 📄 办公工具

| 工具 | 说明 |
|------|------|
| **字数统计** | 字符、去空白字符、中文、英文单词、数字、行数、段落数、UTF-8 字节数实时统计 |
| **大小写转换** | 全大写、全小写、首字母大写、驼峰、帕斯卡、下划线、短横线 |
| **文本批量处理** | 12 种行操作（去空行 / 去重 / 排序 / 反转 / 打乱 …）+ 正则查找替换 + 关键字行过滤 + 批量加前后缀，支持 60 步撤销与操作日志 |
| **密码生成器** | 基于 `crypto.getRandomValues` 的密码学安全随机源，**拒绝采样消除取模偏差**；长度、字符集、排除易混字符、每类至少一个、字符不重复，按信息熵（bit）评估强度 |

### 🏠 生活工具

| 工具 | 说明 |
|------|------|
| **日期计算器** | 两日期间隔（天数 + 约合年月日）、日期推算 ±天 / 周 / 月 / 年 |
| **BMI 计算器** | 中国成人标准分级（偏瘦 / 正常 / 超重 / 肥胖），给出健康体重范围 |
| **单位换算** | 长度、质量、面积、体积、温度、速度、时间、数据存储、功率共 9 大类双向实时换算；数据存储同时提供 1024 与 1000 两套进制；温度为非线性换算，单独处理 |

### 🧩 其他工具

| 工具 | 说明 |
|------|------|
| **随机数生成** | 使用 `crypto.getRandomValues`（优于 `Math.random`），支持整数 / 小数、指定范围、是否去重 |
| **颜色选择器** | HEX / RGB / HSL 三向实时同步，取色与一键复制 |

---

## 目录结构

```
呆宝工具箱/
├── 首页.html                    # 单页应用入口（双击即可打开）
├── README.md
├── assets/
│   └── logo.png                 # 站点图标 / favicon
├── css/
│   └── style.css                # 全局样式 + 通用工具组件样式
└── js/
    ├── app.js                   # 应用主入口：分类导航、工具切换、渲染调度
    └── tools/                   # 各工具模块，一个文件一个工具
        ├── shared.js            # 共用小工具：复制文本、轻提示
        ├── vat-calculator.js
        ├── tax-calculator.js
        ├── json-formatter.js
        ├── base64-tool.js
        ├── timestamp-tool.js
        ├── regex-tester.js
        ├── url-codec.js
        ├── jwt-parser.js
        ├── text-diff.js
        ├── word-count.js
        ├── case-convert.js
        ├── text-process.js
        ├── password-generator.js
        ├── date-calculator.js
        ├── bmi-calculator.js
        ├── unit-converter.js
        ├── random-generator.js
        └── color-picker.js
```

---

## 添加新工具

项目没有构建步骤，扩展只需要两步。

**1. 新建 `js/tools/你的工具.js`**，在全局命名空间下挂一个工厂函数：

```js
window.DaibaoTools = window.DaibaoTools || {};

window.DaibaoTools.createMyTool = function (container) {
  container.innerHTML = `
    <div class="tool-wrap">
      <div class="tool-head">
        <div class="tool-title">我的工具</div>
        <div class="tool-subtitle">一句话说明</div>
      </div>
      <div class="tool-cols">
        <div class="tool-col">
          <div class="tool-panel-title">输入</div>
          <input class="tool-input" type="text" id="myInput" placeholder="…">
          <div class="tool-btn-row">
            <button class="tool-btn primary" id="myRun">执行</button>
          </div>
          <div class="tool-error" id="myError"></div>
        </div>
        <div class="tool-col">
          <div class="tool-panel-title">结果</div>
          <div class="tool-output" id="myOutput"></div>
        </div>
      </div>
    </div>`;

  var input = container.querySelector('#myInput');
  var output = container.querySelector('#myOutput');
  var errorEl = container.querySelector('#myError');

  container.querySelector('#myRun').onclick = function () {
    errorEl.textContent = '';
    if (!input.value.trim()) {
      errorEl.textContent = '请输入内容';
      return;
    }
    output.textContent = input.value; // 你的处理逻辑
  };
};
```

**2. 注册到导航**：在 `js/app.js` 的 `categories` 中加一条，并在 `首页.html` 里引入脚本（注意放在 `app.js` 之前）。

```js
{
  key: 'other',
  name: '其他分类',
  icon: '🧩',
  tools: [
    { key: 'random', name: '随机数生成', factory: DaibaoTools.createRandomGenerator },
    { key: 'my-tool', name: '我的工具', factory: DaibaoTools.createMyTool },  // 新增
  ],
},
```

```html
<script src="js/tools/my-tool.js"></script>
<script src="js/app.js"></script>
```

### 复用样式

`css/style.css` 内置了一套通用工具类，新工具直接套用即可保持视觉一致：

| 类名 | 用途 |
|------|------|
| `.tool-wrap` / `.tool-head` / `.tool-title` / `.tool-subtitle` | 页面骨架与标题 |
| `.tool-cols` / `.tool-col` | 左右两栏（768px 以下自动单列） |
| `.tool-field` / `.tool-label` / `.tool-input` / `.tool-select` / `.tool-textarea` | 表单元素 |
| `.tool-btn` / `.primary` / `.accent` / `.small` | 按钮（主色 / 强调色 / 小号） |
| `.tool-check` / `.tool-range` | 复选框、滑块 |
| `.tool-output` / `.plain` | 结果区（等宽字体 / 普通字体） |
| `.tool-stats` / `.tool-stat` / `.tool-stat-num` | 统计卡片网格 |
| `.tool-table-wrap` / `.tool-table` / `.table-input` | 表格（表头吸顶、行内可编辑） |
| `.tool-error` / `.tool-hint` | 错误提示、说明文字 |
| `.tool-badge` / `.ok` / `.warn` / `.bad` | 状态徽章 |

---

## 浏览器兼容

| 浏览器 | 支持情况 |
|--------|---------|
| Chrome / Edge（最新版） | ✅ 完全支持 |
| Firefox（最新版） | ✅ 完全支持 |
| Safari（最新版） | ✅ 完全支持 |
| IE | ❌ 不支持（使用了 ES6+ 语法与 `crypto.getRandomValues`） |

建议使用 Chrome 或 Edge 最新版。项目使用了 `crypto.getRandomValues`、`TextEncoder/TextDecoder`、`URL` 等现代 API。

---

## 已知限制

- **JWT 解析不校验签名**。验签需要密钥，且不应该在前端进行。页面展示的一切内容都只是 Token 中**声称**的信息，不能作为身份或授权的判断依据。
- **文本对比**使用 LCS 动态规划，单侧超过 2000 行时仅比对前 2000 行。
- **个税计算器**结果为估算值，大病医疗等按年度汇算的扣除项不在月度预扣中体现，实际以税务机关汇算清缴为准。

---

## 隐私

所有计算均在浏览器本地完成，**没有任何网络请求，不上传任何数据，不使用 Cookie 或本地追踪**。断网状态下同样可以正常使用。

---

## 许可证

[MIT](LICENSE) — 可自由使用、修改和分发。
