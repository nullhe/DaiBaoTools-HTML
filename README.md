# 呆宝工具箱

一个**零依赖、零构建、双击即用**的本地单页工具集合。纯 HTML + CSS + 原生 JavaScript 实现，不引入任何框架、CDN 或第三方库，所有计算全部在浏览器本地完成，数据不出本机。

![无依赖](https://img.shields.io/badge/dependencies-0-brightgreen)
![原生实现](https://img.shields.io/badge/vanilla-HTML%2FCSS%2FJS-orange)
![无需构建](https://img.shields.io/badge/build-none-blue)

点击体验：[点击进入体验](https://nullhe.github.io/DaiBaoTools-HTML)

---

## 快速开始

### 方式一：双击打开（推荐）

直接双击项目根目录下的 **`index.html`** 即可使用，**不需要安装任何东西，也不需要启动服务器**。

> 本项目刻意避开了 ES Module（`type="module"` + `import`）。因为 `file://` 协议下页面 origin 为 `null`，模块脚本会被浏览器同源策略拦截导致白屏。全部脚本改用普通 `<script>` 顺序加载 + 全局命名空间，从而在 `file://` 下也能正常运行。

### 方式二：本地服务器

如果你更习惯用 HTTP 方式访问：

```bash
# Python 3
python -m http.server 8080

# Node.js
npx serve .
```

然后浏览器访问 `http://localhost:8080`。

### 方式三：GitHub Pages

仓库 Settings → Pages → Source 选择分支与根目录即可发布，访问 `https://<用户名>.github.io/DaiBaoTools-HTML/`。

---

## 功能一览

共 **7 个分类、25 个工具**，顶部导航切换分类、二级导航切换工具，部分工具内含页内三级子菜单，全程无刷新。

> 📌 **联网说明**：除纯本地工具外，以下工具需访问第三方接口 [OIAPI](https://www.oiapi.net)：**歌词下载**（QQ Music 歌词、酷狗歌词）、**在线音乐**（咪咕音乐、酷我音乐、网易云音乐）、**趣味测算**（你是小猪、五行穿衣、答案之书、塔罗牌）、**热点资讯**（历史上的今天、头条 / 抖音 / 微博 / 知乎热搜、澎湃新闻）、**休闲娱乐**（漂流瓶）、**图册表情**（王者英雄、小米壁纸、360壁纸、Loveanimer壁纸、Pximg、米游社原神COS）。这些接口已开启跨域（`Access-Control-Allow-Origin: *`），双击 `index.html`（`file://`）直接调用也正常，无需本地服务器。

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
| **随机数生成** | 使用 `crypto.getRandomValues`（优于 `Math.random`），支持整数 / 小数、指定范围、是否去重 |
| **颜色选择器** | HEX / RGB / HSL 三向实时同步，取色与一键复制 |

### 🖼️ 图片工具

| 工具 | 说明 |
|------|------|
| **图标处理** | 功能页内含左侧竖直子菜单，子功能可扩展注册。当前包含**图标排列**：批量选择本地图片（支持拖入），自动排列成图标墙；每行个数、行数（固定 / 自动）、卡片间距、圆角、图标留白、适配方式（contain / cover）均可调，支持分批追加与单张移除 |

### 🎵 音乐音频

音乐音频含两个二级工具，每个二级工具再含页内左侧子菜单（三级菜单）。

**歌词下载**（页内子菜单：QQ Music 歌词 / 酷狗歌词）

| 工具 | 说明 |
|------|------|
| **QQ Music 歌词** | 通过 [OIAPI](https://www.oiapi.net/doc/id/121.html) 搜索歌曲并获取歌词，按时间轴排列成歌词瀑布流；**显示播放时间**开关（默认开启）控制每行前是否显示时间轴；自动识别「作词 / 作曲 / 编曲」等制作信息行并弱化展示；支持**下载 TXT**（带 BOM 与 CRLF，Windows 记事本打开不乱码，文件名 `歌手 - 歌名.txt`）与一键复制；可选 LRC / QRC / KSC 三种格式，后两者按原始内容展示；支持**封面下载** |
| **酷狗歌词** | 通过 [OIAPI](https://www.oiapi.net/doc/id/11.html) 的 `Kggc` 接口实现：搜索歌曲 → 在结果列表中选取某首 → 按序号获取 LRC 歌词，瀑布流展示；与 QQ Music 歌词共用同一套交互（时间开关、TXT 下载、复制、LRC/QRC/KSC 格式）；酷狗接口不返回封面，结果卡片以音符占位 |

**在线音乐**（页内子菜单：咪咕音乐 / 酷我音乐 / 网易云音乐）

搜索歌曲 → 在线试听 → 歌词滚动同步 → 可下载。三家接口均不返回歌词，已自动兜底使用 QQ 同曲歌词（音频仍来自对应平台）。

| 工具 | 说明 |
|------|------|
| **咪咕音乐** | 通过 [OIAPI](https://www.oiapi.net/doc/id/157.html) 搜索并获取播放直链，歌词随播放进度滚动；音频直链统一升级 HTTPS 规避混合内容 |
| **酷我音乐** | 通过 [OIAPI](https://www.oiapi.net/doc/id/79.html) 搜索并播放，支持多档音质切换（无损 / 高品 / 标准），封面支持下载 |
| **网易云音乐** | 通过 [OIAPI](https://www.oiapi.net/doc/id/8.html) 搜索并播放，提供单一音质直链（接口不返回音质列表） |

### 🧩 其他分类

| 工具 | 说明 |
|------|------|
| **趣味测算** | 二级工具，页内子菜单含四个趣味占卜：**你是小猪**（RollPig 接口随机趣味答案 + 分析）、**五行穿衣**（每日五行与宜忌穿衣颜色建议）、**答案之书**（翻牌给出一个答案，中英文）、**塔罗牌**（四张牌阵：过去 / 问题局面 / 解决方法 / 切牌，含正逆位与牌面解读）。均通过 [OIAPI](https://www.oiapi.net) 获取数据 |

**热点资讯**（页内子菜单：历史上的今天 / 头条热搜 / 抖音热搜 / 微博热搜 / 知乎热搜 / 澎湃新闻）

通过 [OIAPI](https://www.oiapi.net) 实时抓取各平台热榜，进入即自动加载，支持「刷新」与「加载更多」翻页，文案经 `textContent` 渲染防注入。

| 工具 | 说明 |
|------|------|
| **历史上的今天** | 通过 [OIAPI](https://www.oiapi.net/doc/id/155.html) 获取当日历史事件、名人诞辰、逝者与节日，含焦点事件与分栏列表 |
| **头条热搜** | 通过 [OIAPI](https://www.oiapi.net/doc/id/131.html) 的 TouTiao 接口获取头条热搜榜（含热度与封面） |
| **抖音热搜** | 通过 [OIAPI](https://www.oiapi.net/doc/id/132.html) 的 DouYinHot 接口获取抖音热搜榜（仅标题，无外链） |
| **微博热搜** | 通过 [OIAPI](https://www.oiapi.net/doc/id/133.html) 的 WeiBoHot 接口获取微博热搜榜（含外链） |
| **知乎热搜** | 通过 [OIAPI](https://www.oiapi.net/doc/id/134.html) 的 ZhiHuHot 接口获取知乎热搜榜（仅标题，无外链） |
| **澎湃新闻** | 通过 [OIAPI](https://www.oiapi.net/doc/id/117.html) 的 HotNews 接口获取澎湃新闻热榜（含标题、外链、封面与发布时间） |

**休闲娱乐**（页内子菜单：漂流瓶）

| 工具 | 说明 |
|------|------|
| **漂流瓶** | 通过 [OIAPI](https://www.oiapi.net/doc/id/128.html) 的 DriftBottle 接口随机捞取一个他人投放的漂流瓶（昵称 + 内容 + 时间 + 回复），支持「捞一个」与「再捞一个」。接口的 send / reply 为服务端空操作（返回他人随机瓶），故仅做随机读取，不伪造投放 |

**图册表情**（页内子菜单：王者英雄 / 小米壁纸 / 360壁纸 / Loveanimer壁纸 / Pximg / 米游社原神COS）

壁纸与图集类工具，图片经第三方图床直链加载（部分图床有防盗链限制，见「已知限制」）；卡片点击均弹灯箱看大图（灯箱挂载于 `document.body`，规避动效层 `transform` 导致的 `fixed` 定位偏移）。

| 工具 | 说明 |
|------|------|
| **王者英雄** | 通过 [OIAPI](https://www.oiapi.net/doc/id/66.html) 的 Honor 接口展示单个英雄资料：定位 / 分路 / 技能 / 皮肤 / 背景故事 / 台词 |
| **小米壁纸** | 通过 [OIAPI](https://www.oiapi.net/doc/id/96.html) 的 XiaoMiWallpaper 接口，按 17 个分类（热销榜 / 新品榜 / 游戏 / 风景 …）浏览壁纸，瀑布流 + 灯箱预览；其中「热门IP」「系统壁纸」上游返回 `-500`，已优雅跳过 |
| **360壁纸** | 通过 [OIAPI](https://www.oiapi.net/doc/id/67.html) 的 Wallpaper360 接口，16 个分类（4K专区 / 美女模特 / 风景 / 动漫 …）+ 瀑布流 + 灯箱 |
| **Loveanimer壁纸** | 通过 [OIAPI](https://www.oiapi.net/doc/id/41.html) 的 Loveanimer 接口，竖屏 / 横屏 + 14 类动漫壁纸；「美女」「动漫」两类上游 `-2` 失效（加 `n` 也救不回），已优雅提示「上游可能暂时下线」；视频类 CDN 实测 502 故仅做图片 |
| **Pximg** | 通过 [OIAPI](https://www.oiapi.net/doc/id/22.html) 的 Pximg 接口随机获取 Pixiv 作品，**默认不显示内容，需勾选「可能存在 R18 内容，请确认后再查询」后才可手动查询**，点击「查询一张」拉取一张随机作品（R18 作品显示红色徽标） |
| **米游社原神COS** | 通过 [OIAPI](https://www.oiapi.net/doc/id/148.html) 的 MihoyoCos 接口展示米游社原神 COS 信息流（作者头像 / 昵称 / 相对时间 / 标题 / 正文 / 多图），点击图片灯箱预览 |

---

## 目录结构

```
呆宝工具箱/
├── index.html                  # 单页应用入口（双击即可打开）
├── README.md
├── LICENSE
├── assets/
│   └── logo.png                 # 站点图标 / favicon
├── css/
│   ├── style.css                # 全局样式 + 通用工具组件样式
│   └── motion.css               # 交互动效层：微交互 / 转场 / 反馈 / 质感
└── js/
    ├── app.js                   # 应用主入口：分类导航、工具切换、渲染调度
    ├── motion.js                # 交互动效层：水波纹 / 数字滚动 / 指示条 / 主题
    ├── click-effect.js          # 全局鼠标点击特效（原生实现，可开关）
    └── tools/                   # 各工具模块，一个文件一个工具
        ├── shared.js            # 共用小工具：复制文本、轻提示
        # 财务工具
        ├── vat-calculator.js
        ├── tax-calculator.js
        # 开发工具
        ├── json-formatter.js
        ├── base64-tool.js
        ├── timestamp-tool.js
        ├── regex-tester.js
        ├── url-codec.js
        ├── jwt-parser.js
        ├── text-diff.js
        # 办公工具
        ├── word-count.js
        ├── case-convert.js
        ├── text-process.js
        ├── password-generator.js
        # 生活工具
        ├── date-calculator.js
        ├── bmi-calculator.js
        ├── unit-converter.js
        ├── random-generator.js
        ├── color-picker.js
        # 图片工具
        ├── icon-tool.js         # 图标处理外壳（页内竖直子菜单）
        ├── icon-arrange.js      # 图标处理 · 图标排列子功能
        # 音乐音频
        ├── music-tool.js        # 音乐音频外壳 · 歌词下载
        ├── qqmusic-lyric.js     # 歌词下载 · QQ Music 歌词
        ├── kugou-lyric.js       # 歌词下载 · 酷狗歌词
        ├── online-music-tool.js # 在线音乐外壳
        ├── migumusic.js         # 在线音乐 · 咪咕音乐
        ├── kuwo-music.js        # 在线音乐 · 酷我音乐
        ├── netease-music.js     # 在线音乐 · 网易云音乐
        # 其他分类 · 趣味测算
        ├── fun-calc-tool.js     # 趣味测算外壳
        ├── roll-pig.js          # 你是小猪
        ├── five-element-dressing.js # 五行穿衣
        ├── answer-book.js       # 答案之书
        ├── tarot.js             # 塔罗牌
        # 其他分类 · 热点资讯
        ├── hotnews-tool.js      # 热点资讯外壳
        ├── history-today.js     # 历史上的今天
        ├── toutiao-hotsearch.js # 头条热搜
        ├── douyin-hotsearch.js  # 抖音热搜
        ├── weibo-hotsearch.js   # 微博热搜
        ├── zhihu-hotsearch.js   # 知乎热搜
        ├── penpai-news.js       # 澎湃新闻
        # 其他分类 · 休闲娱乐
        ├── leisure-tool.js      # 休闲娱乐外壳
        ├── drift-bottle.js      # 漂流瓶
        # 其他分类 · 图册表情
        ├── gallery-tool.js      # 图册表情外壳
        ├── wangzhe-hero.js      # 王者英雄
        ├── xiaomi-wallpaper.js  # 小米壁纸
        ├── wallpaper360.js      # 360壁纸
        ├── loveanimer-wallpaper.js # Loveanimer壁纸
        ├── pximg-wallpaper.js   # Pximg
        └── genshin-cos.js       # 米游社原神COS
```

---

## 鼠标点击特效

点击页面任意位置，光标处会冒出一个文字，向上飘升并淡出。

- 词库默认使用「富强 民主 和谐 文明 自由 平等 公正 法治 爱国 敬业 诚信 友善」，按顺序循环
- 原生实现，动画走 CSS Animation，不占用 JS 主线程；`pointer-events: none`，不挡任何点击
- **顶部导航栏右侧的 ✨ 按钮可随时开关**，状态存 localStorage，下次打开自动恢复
- 在输入框 / 文本域 / 下拉框内点击不会触发，避免干扰录入

自定义改 `js/click-effect.js` 顶部的 `CONFIG`：

| 配置 | 说明 |
|------|------|
| `words` | 冒出来的文字数组 |
| `colors` | 候选配色，每次随机取一个 |
| `duration` / `rise` | 动画时长（ms）/ 上飘距离（px） |
| `minFontSize` / `maxFontSize` | 随机字号范围 |
| `maxAlive` | 同屏文字上限，防止狂点堆积 |
| `skipFormFields` | 是否在表单元素内跳过，设 `false` 则全页面都触发 |

> 改动 `duration` 时，需同步修改 `css/style.css` 中 `.click-effect-item` 的 `animation-duration`。

---

## 交互动效层

动效全部集中在 `css/motion.css` + `js/motion.js`，**与业务样式解耦**，删掉这两个文件即可回到朴素版本。强度档位：克制（位移 2px、时长 120–260ms、缓动带轻微超调）。

| 层次 | 内容 |
|------|------|
| 微交互 | 按钮 hover 抬升 / active 回弹（`cubic-bezier(.34,1.4,.64,1)`）、点击水波纹、输入框焦点光环、导航图标 hover 微动、滑块 thumb 放大 |
| 转场入场 | 工具切换淡入上移、导航**滑动指示条**、卡片错峰入场（间隔 40ms）、首屏三段依次入场 |
| 数据反馈 | 结果数字滚动（含实时输入豁免）、复制按钮打勾闪光、校验失败抖动（`DaibaoMotion.shake`）、统计卡 3D 倾斜（±4°） |
| 质感氛围 | 顶栏毛玻璃 + 滚动加深阴影、跟随光标柔光、**深色模式**、自定义滚动条 |

### 深色模式

顶部 🌙 按钮切换，状态存 localStorage。实现方式是**只覆盖 CSS 变量**（`html[data-theme='dark']`），不改动任何结构，因此新增工具自动适配。为防刷新闪白，`index.html` 的 `<head>` 里有一段同步脚本，在内容渲染前就打上 `data-theme`。

### 几个实现约定

- **只动 `transform` / `opacity`**，不碰尺寸类属性，避免触发重排
- **`prefers-reduced-motion` 全量降级**：系统开启「减少动态效果」时所有动画自动关闭
- 工具内容由 `app.js` 动态重建，所有增强统一走 `DaibaoMotion.onContentChange(container)` 重新挂载
- 数字滚动会判断变化频率：间隔小于 160ms 视为实时输入（如字数统计），跳过动画，避免打字时数字乱跳

### 关掉动效

删除 `index.html` 里 `css/motion.css` 与 `js/motion.js` 两行即可，`app.js` 中的钩子已做存在性判断，不会报错。

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

**2. 注册到导航**：在 `js/app.js` 的 `categories` 中加一条，并在 `index.html` 里引入脚本（注意放在 `app.js` 之前）。

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
- **壁纸 / 图集类工具依赖第三方图床**，且需联网。当前内置的小米壁纸（`ts.market.mi-img.com`）、360壁纸（`pN.qhimg.com`）、Loveanimer（`cdn.pixabay.com`）、Pximg（`i.pixiv.re`）、米游社原神COS（`upload-bbs.miyoushe.com`）图床均可正常加载；若某图床启用 Referer 防盗链（如早期 Cosplay 模块的 `wa.lmgmi.com` 仅放行自身 Referer），浏览器 `<img>` 无法伪造 Referer，图片会加载失败，该模块已移除。

---

## 隐私

绝大多数工具的计算均在浏览器本地完成，**不上传任何本地数据，不使用 Cookie 或本地追踪**。仅「歌词下载 / 在线音乐 / 趣味测算 / 热点资讯 / 休闲娱乐 / 图册表情」部分工具会向第三方接口 [OIAPI](https://www.oiapi.net) 发起只读 GET 请求以获取内容，请求仅携带检索关键词、不上传你的任何文件或隐私数据。其余工具断网状态下同样可以正常使用。

---

## 许可证

[MIT](LICENSE) — 可自由使用、修改和分发。
