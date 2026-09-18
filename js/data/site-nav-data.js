// ============================================================
//  网址导航 · 配置文件
//  本文件由「网址导航」工具（生活工具 → 网址导航）读取并展示。
//  修改内容后保存本文件即可，无需任何构建 / 重启，刷新页面即生效。
//  增删改网站、调整分类，请直接编辑本文件后提交 git，内容即随项目代码同步。
//
//  字段说明：
//    categories: 分类列表，每项 { id, name }
//      - id   分类唯一标识（字母数字即可，供 sites.catId 引用）
//      - name 分类显示名称
//    sites: 网址列表，每项 { id, catId, name, url, icon, intro }
//      - id     网址唯一标识（任意不重复字符串）
//      - catId  归属分类的 id（对应 categories 里的某一项）
//      - name   显示名称
//      - url    网址链接（建议带 https://）
//      - icon   图标地址。优先填「本地相对路径」（相对 index.html 根目录），例如
//               'assets/icons/baidu.ico'（图标文件放在项目 assets/icons/ 目录下，随 git 离线同步）；
//               也可填 http(s) 远程图标；留空 '' 则自动按域名获取 Google favicon，再失败显示名称首字母色块
//      - intro  一句话介绍，可留空 ''
// ============================================================
window.DAIBAO_SITE_NAV = {
  categories: [
    { id: 'cat_common', name: '常用' },
    { id: 'cat_dev',    name: 'IT' },
    { id: 'cat_open',    name: '开放平台' },
    { id: 'cat_img',   name: '图片工具' },
    { id: 'cat_tool',   name: '工具集' },
    { id: 'cat_mail',   name: '邮箱' },
    { id: 'cat_ai_tool',   name: 'AI' },
    { id: 'cat_wangpan',   name: '网盘' },
    { id: 'cat_chuanshu',   name: '传输' },
    { id: 'cat_music',   name: '音乐音频' },
    { id: 'cat_bianmin',   name: '便民' },
    { id: 'cat_ranking',   name: '排行' },
    { id: 'cat_fun',    name: '娱乐' },
    { id: 'cat_acg',    name: 'ACG' }
	
  ],
  sites: [

    { id: 's_baidu',      catId: 'cat_common', name: '百度',          url: 'https://www.baidu.com',            icon: 'assets/icons/baidu.ico',          intro: '全球最大中文搜索引擎' },
    { id: 's_github',     catId: 'cat_common', name: 'GitHub',        url: 'https://github.com',               icon: 'assets/icons/github.svg',         intro: '全球最大代码托管平台' },
    { id: 's_bilibili',   catId: 'cat_common', name: '哔哩哔哩',      url: 'https://www.bilibili.com',         icon: 'assets/icons/bilibili.ico',       intro: '国内知名视频弹幕网站' },

    { id: 's_mdn',        catId: 'cat_dev',    name: 'MDN Web Docs',  url: 'https://developer.mozilla.org',    icon: 'assets/icons/mdn.ico',            intro: 'Web 技术权威文档' },
    { id: 's_so',         catId: 'cat_dev',    name: 'Stack Overflow', url: 'https://stackoverflow.com',        icon: 'assets/icons/stackoverflow.ico',  intro: '程序员问答社区' },
    { id: 's_pgyer',         catId: 'cat_dev',    name: '蒲公英', url: 'https://www.pgyer.com',        icon: 'assets/icons/pgyer.ico',  intro: '内侧App托管分发平台' },
    { id: 's_runoob',         catId: 'cat_dev',    name: '菜鸟教程', url: 'https://www.runoob.com',        icon: 'assets/icons/runoob.png',  intro: '基础编程技术教程' },
    { id: 's_csdn',         catId: 'cat_dev',    name: 'CSDN', url: 'https://www.csdn.net',        icon: 'assets/icons/csdn.ico',  intro: '专业开发者社区' },
    { id: 's_51cto',         catId: 'cat_dev',    name: '51CTO', url: 'https://www.51cto.com',        icon: 'assets/icons/51cto.png',  intro: '数字化人才学习平台和技术社区' },
    { id: 's_cnblogs',         catId: 'cat_dev',    name: '博客园', url: 'https://www.cnblogs.com',        icon: 'assets/icons/cnblogs.png',  intro: '面向开发者的知识分享社区' },
    { id: 's_iteye',         catId: 'cat_dev',    name: 'ITeye', url: 'https://www.iteye.com',        icon: 'assets/icons/iteye.png',  intro: '中文IT技术交流社区' },
    { id: 's_pcbeta',         catId: 'cat_dev',    name: '远景论坛', url: 'https://bbs.pcbeta.com',        icon: 'assets/icons/pcbeta.png',  intro: 'Windows电脑技术网站' },
    { id: 's_how2j',         catId: 'cat_dev',    name: 'How2J', url: 'https://how2j.cn',        icon: 'assets/icons/how2j.ico',  intro: 'Java 自学网' },
    { id: 's_kejiwanjia',         catId: 'cat_dev',    name: '科技玩家', url: 'https://www.kejiwanjia.net',        icon: 'assets/icons/kejiwanjia.png',  intro: '专注科技领域探索软硬件新玩法' },
    { id: 's_itjc8',         catId: 'cat_dev',    name: 'IT教程吧', url: 'https://itjc8.com',        icon: 'assets/icons/itjc8.ico',  intro: '专业程序员论坛-IT学习资源' },
    { id: 's_jyshare_com',         catId: 'cat_dev',    name: '菜鸟工具', url: 'https://www.jyshare.com',        icon: 'assets/icons/c.runoob.com_.png',  intro: '为开发设计人员提供在线工具' },


    { id: 's_gmail',         catId: 'cat_mail',    name: 'Gmail', url: 'https://gmail.google.com',        icon: 'assets/icons/gmail.svg',  intro: '谷歌邮箱-Gamil' },
    { id: 's_wymail_163',         catId: 'cat_mail',    name: '163网易邮箱', url: 'https://mail.163.com',        icon: 'assets/icons/wymail_163.png',  intro: '163网易邮箱' },
    { id: 's_wymail_126',         catId: 'cat_mail',    name: '126网易邮箱', url: 'https://www.126.com',        icon: 'assets/icons/wymail_126.png',  intro: '126网易邮箱' },
    { id: 's_dashi_163',         catId: 'cat_mail',    name: '网易邮箱大师', url: 'https://dashi.163.com',        icon: 'assets/icons/dashi_163.ico',  intro: '邮箱管理‌聚合客户端' },
    { id: 's_qqmail',         catId: 'cat_mail',    name: 'QQ邮箱', url: 'https://mail.qq.com',        icon: 'assets/icons/qqmail.png',  intro: 'QQ邮箱' },
    { id: 's_exmail',         catId: 'cat_mail',    name: '腾讯企业邮箱', url: 'https://exmail.qq.com',        icon: 'assets/icons/exmail.ico',  intro: '腾讯企业邮箱' },
    { id: 's_alimail',         catId: 'cat_mail',    name: '阿里邮箱', url: 'https://mail.aliyun.com',        icon: 'assets/icons/alimail.png',  intro: '阿里邮箱' },
    { id: 's_139mail',         catId: 'cat_mail',    name: '139移动邮箱', url: 'https://mail.10086.cn',        icon: 'assets/icons/139mail.ico',  intro: '139 邮箱（移动）' },
    { id: 's_189mail',         catId: 'cat_mail',    name: '189电信邮箱', url: 'https://webmail30.189.cn',        icon: 'assets/icons/189mail.ico',  intro: '189 邮箱（电信）' },
    { id: 's_sinamail',         catId: 'cat_mail',    name: '新浪邮箱', url: 'https://mail.sina.com.cn',        icon: 'assets/icons/sina.ico',  intro: '新浪邮箱' },
    { id: 's_icloudmail',         catId: 'cat_mail',    name: 'iCloud 邮箱', url: 'https://www.icloud.com/mail',        icon: 'assets/icons/icloudmail.png',  intro: 'Apple 苹果邮箱' },
    { id: 's_tempmail',         catId: 'cat_mail',    name: 'Temp-Mail', url: 'https://temp-mail.org',        icon: 'assets/icons/tempmail.png',  intro: 'Temp-Mail 临时匿名邮箱' },
    { id: 's_10minutemail',         catId: 'cat_mail',    name: '十分钟邮箱', url: 'https://10minutemail.one',        icon: 'assets/icons/10minutemail.ico',  intro: '十分钟临时匿名邮箱' },
    { id: 's_linshiemail',         catId: 'cat_mail',    name: '临时十分钟邮箱', url: 'https://www.linshi-email.com',        icon: 'assets/icons/linshiemail.ico',  intro: '临时十分钟邮箱' },
    { id: 's_linshietempmail',         catId: 'cat_mail',    name: '临时邮箱十秒钟', url: 'https://www.tempmail.vip',        icon: 'assets/icons/linshitempmail.png',  intro: '临时邮箱-十秒钟内收到邮件' },
    { id: 's_foxmail',         catId: 'cat_mail',    name: 'Foxmail', url: 'https://www.foxmail.com',        icon: 'assets/icons/foxmail.ico',  intro: '电子邮件客户端软件' },

    { id: 's_webicon',         catId: 'cat_img',    name: 'Webicon', url: 'https://webicon.cc',        icon: 'assets/icons/webicon.jpg',  intro: '获取任意网站的 图标' },
    { id: 's_ezgif',         catId: 'cat_img',    name: 'Ezgif', url: 'https://ezgif.com',        icon: 'assets/icons/ezgif.ico',  intro: '免费在线动画GIF编辑器' },
    { id: 's_squoosh',         catId: 'cat_img',    name: 'Squoosh', url: 'https://squoosh.app',        icon: 'assets/icons/squoosh.png',  intro: '在线图像压缩工具' },
    { id: 's_tinypng',         catId: 'cat_img',    name: 'TinyPNG', url: 'https://tinypng.com',        icon: 'assets/icons/tinypng.png',  intro: '为网页图像打造的在线图像压缩工具' },
    { id: 's_imagestool',         catId: 'cat_img',    name: 'ImagesTool', url: 'https://imagestool.com',        icon: 'assets/icons/imagestool.png',  intro: '无需上传文件也可在线处理图片' },
    { id: 's_photopea',         catId: 'cat_img',    name: 'Photopea', url: 'https://www.photopea.com',        icon: 'assets/icons/www.photopea.com.png',  intro: 'Photopea 在线ps' },
    { id: 's_ascii2d',         catId: 'cat_img',    name: '二次元画像詳細検索', url: 'https://ascii2d.net',        icon: 'assets/icons/ascii2d.ico',  intro: '以图搜图 | 二次元画像詳細検索' },
    { id: 's_saucenao',         catId: 'cat_img',    name: 'SauceNAO', url: 'https://saucenao.com',        icon: 'assets/icons/saucenao.ico',  intro: '以图搜图 | 反向图像搜索' },
    { id: 's_trace_moe',         catId: 'cat_img',    name: 'trace', url: 'https://trace.moe',        icon: 'assets/icons/trace.moe.webp',  intro: '以图搜图 | 动漫截图搜索' },
    { id: 's_yandex_com',         catId: 'cat_img',    name: 'yandex搜图', url: 'https://yandex.com/images',        icon: 'assets/icons/yandex.com.ico',  intro: '以图搜图 | 在线搜索图片或按图片搜索' },
    { id: 's_soutubot_moe',         catId: 'cat_img',    name: '搜图Bot酱', url: 'https://soutubot.moe',        icon: 'assets/icons/soutubot.moe_.png',  intro: '以图搜图 | 可局部搜图NH内的本子' },
    { id: 's_ai_animedb_cn',         catId: 'cat_img',    name: 'AnimeTrace', url: 'https://ai.animedb.cn',        icon: 'assets/icons/ai.animedb.cn_.png',  intro: '以图搜图 | AI算法通过图片找番' },
    { id: 's_iqdb_org',         catId: 'cat_img',    name: 'iqdb', url: 'https://iqdb.org',        icon: 'assets/icons/iqdb.org.ico',  intro: '以图搜图 | 多服务图像搜索' },
	
    { id: 's_mikutools',         catId: 'cat_tool',    name: 'MikuTools', url: 'https://tools.miku.ac',        icon: 'assets/icons/mikutools.png',  intro: '一站式在线工具合集' },
    { id: 's_bangxiaomang',         catId: 'cat_tool',    name: '帮小忙', url: 'https://tool.browser.qq.com',        icon: 'assets/icons/bangxiaomang.jpg',  intro: '腾讯QQ浏览器在线工具箱' },
    { id: 's_cloudconvert',         catId: 'cat_tool',    name: 'CloudConvert 云转换', url: 'https://cloudconvert.com',        icon: 'assets/icons/cloudconvert.png',  intro: '在线文件格式转换器' },
    { id: 's_aconvert',         catId: 'cat_tool',    name: 'Aconvert', url: 'https://www.aconvert.com',        icon: 'assets/icons/aconvert.ico',  intro: '在线文件格式转换器' },

    { id: 's_workbuddy',  catId: 'cat_ai_tool',   name: 'WorkBuddy',     url: 'https://www.workbuddy.cn',         icon: 'assets/icons/workbuddy.svg',      intro: '智能助手工作台' },
    { id: 's_deepseek',  catId: 'cat_ai_tool',   name: 'DeepSeek',     url: 'https://www.deepseek.com',         icon: 'assets/icons/deepseek.png',      intro: 'DeepSeek | 深度求索' },
    { id: 's_doubao',  catId: 'cat_ai_tool',   name: '豆包',     url: 'https://www.doubao.com',         icon: 'assets/icons/doubao.png',      intro: '豆包 | 字节跳动旗下AI智能助手' },
    { id: 's_chatgpt',  catId: 'cat_ai_tool',   name: 'ChatGPT',     url: 'https://chatgpt.com',         icon: 'assets/icons/chatgpt.png',      intro: ' OpenAI 开发的智能对话助手' },
    { id: 's_kimi',  catId: 'cat_ai_tool',   name: 'Kimi',     url: 'https://www.kimi.com',         icon: 'assets/icons/kimi.png',      intro: ' Kimi（月之暗面）' },
    { id: 's_qianwen',  catId: 'cat_ai_tool',   name: '通义千问',     url: 'https://www.qianwen.com',         icon: 'assets/icons/qianwen.jpg',      intro: ' 通义千问（阿里）' },
    { id: 's_wenxin',  catId: 'cat_ai_tool',   name: '文心一言',     url: 'https://wenxin.baidu.com',         icon: 'assets/icons/wenxin.png',      intro: ' 文心一言（百度）' },
    { id: 's_xfxh',  catId: 'cat_ai_tool',   name: '讯飞星火',     url: 'https://xinghuo.xfyun.cn',         icon: 'assets/icons/xfxh.png',      intro: ' 讯飞星火（科大讯飞）' },
    { id: 's_glm',  catId: 'cat_ai_tool',   name: '智谱清言',     url: 'https://chatglm.cn',         icon: 'assets/icons/glm.png',      intro: ' 智谱清言（GLM）' },
    { id: 's_txhy',  catId: 'cat_ai_tool',   name: '腾讯混元',     url: 'https://aistudio.tencent.com',         icon: 'assets/icons/txhy.png',      intro: ' 腾讯混元（大模型底座）' },
    { id: 's_txyb',  catId: 'cat_ai_tool',   name: '腾讯元宝',     url: 'https://yuanbao.tencent.com/',         icon: 'assets/icons/txyb.png',      intro: ' 腾讯元宝（C 端 AI 助手产品）' },
    { id: 's_mimo',  catId: 'cat_ai_tool',   name: '小米 MIMO',     url: 'https://mimo.mi.com',         icon: 'assets/icons/xiaomi.png',      intro: ' MIMO（小米）' },
    { id: 's_claude',  catId: 'cat_ai_tool',   name: 'Claude',     url: 'https://claude.ai',         icon: 'assets/icons/claude.png',      intro: ' Claude（Anthropic）' },
    { id: 's_gemini',  catId: 'cat_ai_tool',   name: 'Gemini',     url: 'https://gemini.google.com',         icon: 'assets/icons/gemini.png',      intro: ' Gemini（Google）' },
    { id: 's_grok',  catId: 'cat_ai_tool',   name: 'Grok',     url: 'https://grok.com',         icon: 'assets/icons/grok.png',      intro: ' Grok（xAI | 马斯克旗下）' },
    { id: 's_mcopilot',  catId: 'cat_ai_tool',   name: 'Microsoft Copilot',     url: 'https://copilot.com',         icon: 'assets/icons/copilot.ico',      intro: ' 微软公司开发的人工智能助手' },

    { id: 's_baiduwp',  catId: 'cat_wangpan',   name: '百度网盘',     url: 'https://pan.baidu.com',         icon: 'assets/icons/baiduwp.ico',      intro: '百度网盘 ' },
    { id: 's_alipan',  catId: 'cat_wangpan',   name: '阿里云盘',     url: 'https://www.alipan.com',         icon: 'assets/icons/alipan.ico',      intro: '阿里云盘 ' },
    { id: 's_weiyun',  catId: 'cat_wangpan',   name: '腾讯微云',     url: 'https://www.weiyun.com',         icon: 'assets/icons/weiyun.ico',      intro: '腾讯微云 ' },
    { id: 's_115pan',  catId: 'cat_wangpan',   name: '115网盘',     url: 'https://115.com',         icon: 'assets/icons/115.ico',      intro: ' 115网盘' },
    { id: 's_123pan',  catId: 'cat_wangpan',   name: '123云盘',     url: 'https://www.123pan.cn',         icon: 'assets/icons/123pan.ico',      intro: '123云盘 ' },
    { id: 's_quarkpan',  catId: 'cat_wangpan',   name: '夸克网盘',     url: 'https://pan.quark.cn',         icon: 'assets/icons/quark.png',      intro: '夸克网盘 ' },
    { id: 's_189pan',  catId: 'cat_wangpan',   name: '天翼云盘',     url: 'https://cloud.189.cn',         icon: 'assets/icons/189pan.ico',      intro: '天翼云盘 ' },
    { id: 's_ctpan',  catId: 'cat_wangpan',   name: '城通网盘',     url: 'https://www.ctfile.com/',         icon: 'assets/icons/ctpan.png',      intro: '城通网盘 ' },
    { id: 's_lzpan',  catId: 'cat_wangpan',   name: '蓝奏云',     url: 'https://pc.woozooo.com',         icon: 'assets/icons/lzpan.ico',      intro: '蓝奏云 ' },
    { id: 's_jgpan',  catId: 'cat_wangpan',   name: '坚果云',     url: 'https://www.jianguoyun.com',         icon: 'assets/icons/jgpan.ico',      intro: '坚果云 ' },
    { id: 's_gdrive',  catId: 'cat_wangpan',   name: 'Google Drive',     url: 'https://drive.google.com',         icon: 'assets/icons/gdrive.png',      intro: '谷歌云盘 ' },
    { id: 's_pansoso',  catId: 'cat_wangpan',   name: '盘搜搜',     url: 'https://www.pansoso.com',         icon: '',      intro: '盘搜搜 | 网盘搜索 ' },
    { id: 's_maoliyun',  catId: 'cat_wangpan',   name: '猫狸盘搜',     url: 'https://www.maoliyun.com',         icon: 'assets/icons/maoliyun.ico',      intro: '阿里云盘搜索神器 ' },
	
    { id: 's_yunge',  catId: 'cat_chuanshu',   name: '云鸽',     url: 'https://yunge.in',         icon: 'assets/icons/yunge.in.ico',      intro: '免登录在线文件传输助手 ' },
    { id: 's_upfile',  catId: 'cat_chuanshu',   name: '即时传',     url: 'https://upfile.live',         icon: 'assets/icons/upfile.live.png',      intro: '免登录文件链接分享传输 ' },
    { id: 's_gofile',  catId: 'cat_chuanshu',   name: 'Gofile',     url: 'https://gofile.io',         icon: 'assets/icons/gofile.io.png',      intro: '免登录文件上传下载临时分享 ' },
    { id: 's_snapdrop',  catId: 'cat_chuanshu',   name: 'Snapdrop',     url: 'https://pairdrop.net',         icon: 'assets/icons/snapdrop.net_.png',      intro: '免登录P2P文件传输工具 ' },
    { id: 's_toffeeshare',  catId: 'cat_chuanshu',   name: 'ToffeeShare',     url: 'https://toffeeshare.com',         icon: 'assets/icons/toffeeshare.com_.png',      intro: '免登录P2P文件传输 ' },
    { id: 's_uguu',  catId: 'cat_chuanshu',   name: 'Uguu',     url: 'https://uguu.se',         icon: 'assets/icons/uguu.se.ico',      intro: '免登录128MiB-3小时文件传输 ' },

    { id: 's_tbopen',         catId: 'cat_open',    name: '淘宝开放平台', url: 'https://open.taobao.com',        icon: 'assets/icons/tbopen.png',  intro: '淘宝开放平台' },
    { id: 's_alibabaopen',         catId: 'cat_open',    name: '阿里巴巴开放平台', url: 'https://open.1688.com',        icon: 'assets/icons/taobao.png',  intro: '阿里巴巴开放平台' },
    { id: 's_jdopen',         catId: 'cat_open',    name: '京东零售开放平台', url: 'https://open.jd.com',        icon: 'assets/icons/jdopen.png',  intro: '京东零售开放平台' },
    { id: 's_jdlopen',         catId: 'cat_open',    name: '京东物流开放平台', url: 'https://open.jdl.com',        icon: 'assets/icons/jdlopen.png',  intro: '京东物流开放平台' },
    { id: 's_pddopen',         catId: 'cat_open',    name: '拼多多开放平台', url: 'https://open.pdd.com',        icon: 'assets/icons/pddopen.png',  intro: '拼多多开放平台' },
    { id: 's_dyxdopen',         catId: 'cat_open',    name: '抖店开放平台', url: 'https://op.jinritemai.com',        icon: 'assets/icons/dyxdopen.png',  intro: '抖店开放平台' },
    { id: 's_tkopen',         catId: 'cat_open',    name: 'TikTok Shop 开放平台', url: 'https://partner.us.tiktokshop.com',        icon: 'assets/icons/tkopen.png',  intro: 'TikTok Shop 开放平台' },
    { id: 's_ksopen',         catId: 'cat_open',    name: '快手电商开放平台', url: 'https://open.kwaixiaodian.com',        icon: 'assets/icons/ksopen.png',  intro: '快手电商开放平台' },
    { id: 's_xhsopen',         catId: 'cat_open',    name: '小红书电商开放平台', url: 'https://open.xiaohongshu.com',        icon: 'assets/icons/xiaohongshu.ico',  intro: '小红书电商开放平台' },
    { id: 's_vipopen',         catId: 'cat_open',    name: '唯品会开放平台', url: 'https://vop.vip.com',        icon: 'assets/icons/vop.ico',  intro: '唯品会开放平台' },
    { id: 's_dwopen',         catId: 'cat_open',    name: '得物开放平台', url: 'https://open.dewu.com',        icon: 'assets/icons/dwopen.png',  intro: '得物开放平台' },
    { id: 's_poizonopen',         catId: 'cat_open',    name: 'POIZON开放平台', url: 'https://open.poizon.com',        icon: 'assets/icons/poizonopen.png',  intro: 'POIZON（得物跨境）开放平台' },
    { id: 's_wdopen',         catId: 'cat_open',    name: '微店开放平台', url: 'https://open.weidian.com',        icon: 'assets/icons/wdopen.png',  intro: '微店开放平台' },
    { id: 's_hipacopen',         catId: 'cat_open',    name: '海拍客开放平台', url: 'https://open.hipac.cn',        icon: 'assets/icons/hipacopen.png',  intro: '海拍客开放平台' },
    { id: 's_yzopen',         catId: 'cat_open',    name: '有赞云', url: 'https://www.youzanyun.com',        icon: 'assets/icons/yzopen.png',  intro: '有赞云' },
    { id: 's_moguopen',         catId: 'cat_open',    name: '蘑菇街开放平台', url: 'https://openapi.mogu.com',        icon: 'assets/icons/moguopen.png',  intro: '蘑菇街开放平台' },
    { id: 's_lzdopen',         catId: 'cat_open',    name: 'Lazada开放平台', url: 'https://open.lazada.com',        icon: 'assets/icons/lzdopen.png',  intro: 'Lazada（来赞达）开放平台' },
    { id: 's_shopeeopen',         catId: 'cat_open',    name: 'Shopee开放平台', url: 'https://open.shopee.com',        icon: 'assets/icons/shopeeopen.png',  intro: 'Shopee（虾皮）开放平台' },
    { id: 's_aeopen',         catId: 'cat_open',    name: 'AliExpress开放平台', url: 'https://open.aliexpress.com',        icon: 'assets/icons/aeopen.png',  intro: 'AliExpress（全球速卖通）开放平台' },
    { id: 's_sheinopen',         catId: 'cat_open',    name: 'SHEIN开放平台', url: 'https://open.sheincorp.com',        icon: 'assets/icons/sheinopen.png',  intro: 'SHEIN（希音）开放平台' },

    { id: 's_ztoopen',         catId: 'cat_open',    name: '中通开放平台', url: 'https://open.zto.com',        icon: 'assets/icons/ztoopen.png',  intro: '中通开放平台' },
    { id: 's_stoopen',         catId: 'cat_open',    name: '申通开放平台', url: 'https://open.sto.cn',        icon: 'assets/icons/stoopen.png',  intro: '申通开放平台' },
    { id: 's_ytoopen',         catId: 'cat_open',    name: '圆通开放平台', url: 'https://open.yto.net.cn',        icon: 'assets/icons/ytoopen.png',  intro: '圆通开放平台' },
    { id: 's_yundaopen',         catId: 'cat_open',    name: '韵达开放平台', url: 'https://open.yundaex.com',        icon: 'assets/icons/yundaopen.png',  intro: '韵达开放平台' },
    { id: 's_jtopen',         catId: 'cat_open',    name: '极兔速递开放平台', url: 'https://open.jtexpress.com.cn',        icon: 'assets/icons/jtopen.png',  intro: '极兔速递开放平台' },
    { id: 's_sfopen',         catId: 'cat_open',    name: '顺丰开放平台', url: 'https://qiao.sf-express.com',        icon: 'assets/icons/sfopen.png',  intro: '顺丰开放平台' },

    { id: 's_openyyy',         catId: 'cat_music',    name: 'OpenYYY', url: 'https://openyyy.com',        icon: 'assets/icons/openyyy.ico',  intro: '云音乐格式转mp3' },

    { id: 's_gov',         catId: 'cat_bianmin',    name: '中国政府网', url: 'https://www.gov.cn',        icon: 'assets/icons/gov.ico',  intro: '中华人民共和国中央人民政府' },
    { id: 's_bmcx',         catId: 'cat_bianmin',    name: '便民查询网', url: 'https://www.bmcx.com',        icon: 'assets/icons/bmcx.ico',  intro: '免费查询工具大全' },
    { id: 's_wannianli',         catId: 'cat_bianmin',    name: '万年历', url: 'https://www.wannianli123.com',        icon: 'assets/icons/wannianli.ico',  intro: '万年历查询' },
	
    { id: 's_socpk',         catId: 'cat_ranking',    name: '极客湾移动芯片排行', url: 'https://www.socpk.com',        icon: 'assets/icons/socpk_.com_.png',  intro: '极客湾移动芯片排行' },
    { id: 's_mydrivers_gpu',         catId: 'cat_ranking',    name: '桌面显卡性能天梯图', url: 'https://www.mydrivers.com/zhuanti/tianti/gpu/index.html',        icon: 'assets/icons/www.mydrivers.com_.png',  intro: '桌面显卡性能天梯图' },
    { id: 's_mydrivers_gpum',         catId: 'cat_ranking',    name: '笔记本显卡性能天梯图', url: 'https://www.mydrivers.com/zhuanti/tianti/gpum/index.html',        icon: 'assets/icons/www.mydrivers.com_.png',  intro: '笔记本显卡性能天梯图' },
    { id: 's_mydrivers_cpu',         catId: 'cat_ranking',    name: '桌面CPU性能天梯图', url: 'https://www.mydrivers.com/zhuanti/tianti/cpu/index.html',        icon: 'assets/icons/www.mydrivers.com_.png',  intro: '桌面CPU性能天梯图' },
    { id: 's_mydrivers_cpum',         catId: 'cat_ranking',    name: '笔记本CPU性能天梯图', url: 'https://www.mydrivers.com/zhuanti/tianti/cpum/index.html',        icon: 'assets/icons/www.mydrivers.com_.png',  intro: '笔记本CPU性能天梯图' },
    { id: 's_mydrivers_cpup',         catId: 'cat_ranking',    name: '手机CPU性能天梯图', url: 'https://www.mydrivers.com/zhuanti/tianti/01/index.html',        icon: 'assets/icons/www.mydrivers.com_.png',  intro: '手机CPU性能天梯图' },
    { id: 's_mydrivers_camera',         catId: 'cat_ranking',    name: '数码相机天梯图', url: 'https://www.mydrivers.com/zhuanti/tianti/camera/index.html',        icon: 'assets/icons/www.mydrivers.com_.png',  intro: '数码相机天梯图' },
    { id: 's_steamdb_info',         catId: 'cat_ranking',    name: 'SteamDB', url: 'https://steamdb.info',        icon: 'assets/icons/steamdb.info_.png',  intro: 'Steam内容数据库' },
	
    { id: 's_ymnet',         catId: 'cat_fun',    name: '小霸王游戏', url: 'https://www.yikm.net',        icon: 'assets/icons/ymnet.png',  intro: '小霸王游戏' },

    { id: 's_pixiv',         catId: 'cat_acg',    name: 'Pixiv', url: 'https://www.pixiv.net',        icon: 'assets/icons/pixiv.png',  intro: 'Pixiv' },
    { id: 's_sankaku',         catId: 'cat_acg',    name: 'Sankaku Complex', url: 'https://www.sankakucomplex.com',        icon: 'assets/icons/sankaku.png',  intro: 'Sankaku Complex' },
    { id: 's_pica',         catId: 'cat_acg',    name: 'Pica', url: 'https://pica.fanjugou10.top',        icon: 'assets/icons/pica.png',  intro: '哔咔漫书' },
    { id: 's_jmtt',         catId: 'cat_acg',    name: '禁漫天堂', url: 'https://jmcomictt.site',        icon: 'assets/icons/jmtt.ico',  intro: '禁漫天堂发布页' },
    { id: 's_nhentai',         catId: 'cat_acg',    name: 'nhentai', url: 'https://nhentai.net',        icon: 'assets/icons/nhentai.net.ico',  intro: 'nhentai在线本子' },
    { id: 's_nicecat',         catId: 'cat_acg',    name: 'NiceCat', url: 'https://web.nicecat.cc',        icon: 'assets/icons/web.nicecat.cc.png',  intro: '免费看本子平台' },
    { id: 's_schalenetwork',         catId: 'cat_acg',    name: 'SchaleNetwork', url: 'https://gitgud.io/Schale/schale-network',        icon: 'assets/icons/1722120237-koharu.to_.png',  intro: '在线本子' },
    { id: 's_noyacg',         catId: 'cat_acg',    name: 'NoyAcg', url: 'https://noymanga.com',        icon: 'assets/icons/noymanga.png',  intro: '公益免費的本子社區' },
    { id: 's_ssms',         catId: 'cat_acg',    name: '绅士漫画', url: 'https://wnacg01.link',        icon: 'assets/icons/ssms.ico',  intro: '专注分享汉化本子' },
    { id: 's_acgbox',         catId: 'cat_acg',    name: 'ACG盒子', url: 'https://www.acgbox.link',        icon: 'assets/icons/acgbox.jpg',  intro: 'ACG导航 | 专注ACG的导航盒子' },
    { id: 's_cosine',         catId: 'cat_acg',    name: 'Cosine Gallery', url: 'https://pic.cosine.ren',        icon: 'assets/icons/cosine.ico',  intro: '精选 ACG 好图壁纸集' },
    { id: 's_danbooru',         catId: 'cat_acg',    name: 'Danbooru', url: 'https://danbooru.donmai.us',        icon: 'assets/icons/danbooru.donmai.us.ico',  intro: '动漫美图' },
    { id: 's_cycg',         catId: 'cat_acg',    name: '次元茶馆', url: 'https://www.cycg.xyz',        icon: 'assets/icons/cycg.ico',  intro: 'ACG社区 | ACG交流社区' },
    { id: 's_cycgpan',         catId: 'cat_acg',    name: '次元图书馆', url: 'https://pan.cycg.xyz',        icon: 'assets/icons/cycgpan.svg',  intro: 'ACG网盘 | 次元茶馆的后备仓库' },
    { id: 's_sunshineboy',         catId: 'cat_acg',    name: 'SunshineBoy的杂乱仓库', url: 'https://openlist.sunshineboy.top',        icon: 'assets/icons/sunshineboy.png',  intro: 'ACG网盘 | SunshineBoy的杂乱仓库' },
    { id: 's_all2_cc',         catId: 'cat_acg',    name: '樱之空导航', url: 'https://www.all2.cc',        icon: 'assets/icons/all2.cc.png',  intro: 'ACG导航 | 二次元网站导航' },
    { id: 's_acg123_co',         catId: 'cat_acg',    name: '二刺螈导航', url: 'https://www.acg123.co',        icon: 'assets/icons/www.acg123.co.png',  intro: 'ACG导航 | 整合收录二刺螈网站导航' },
    { id: 's_ntr_best',         catId: 'cat_acg',    name: '湿法炼铜', url: 'https://ntr.best',        icon: 'assets/icons/ntr.best.ico',  intro: 'ACG导航 | 二次元网站收集导航' },
    { id: 's_gal123',         catId: 'cat_acg',    name: '绅士导航', url: 'https://www.gal123.com',        icon: 'assets/icons/www.gal123.com.png',  intro: 'ACG导航 | 绅士导航' },
    { id: 's_miaoaaa',         catId: 'cat_acg',    name: 'ACG喵导航', url: 'https://www.miaoaaa.com',        icon: 'assets/icons/www.miaoaaa.com_.png',  intro: 'ACG导航 | 二次元导航网站' },
    { id: 's_srsg_moe',         catId: 'cat_acg',    name: '白鹭学园', url: 'https://srsg.moe',        icon: 'assets/icons/srsg.moe.png',  intro: 'ACG导航 | ACG极客社区' },
    { id: 's_yodhcn_pages',         catId: 'cat_acg',    name: '电解熔融氧化铝', url: 'https://yodhcn.pages.dev',        icon: 'assets/icons/yodhcn.pages.dev_.png',  intro: 'ACG导航 | 导航网站' },
    { id: 's_acgdh_cc',         catId: 'cat_acg',    name: 'ACG动漫导航网', url: 'https://www.acgdh.cc',        icon: 'assets/icons/acgdh.cc.jpg',  intro: 'ACG导航 | ACG动漫导航网' }
	
	
	
	
	
	
	
	


  ]
};
