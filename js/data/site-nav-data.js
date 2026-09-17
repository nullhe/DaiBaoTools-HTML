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
    { id: 'cat_dev',    name: '开发' },
    { id: 'cat_open',    name: '开放平台' },
    { id: 'cat_tool',   name: '工具' },
    { id: 'cat_mail',   name: '邮箱' },
    { id: 'cat_ai_tool',   name: 'AI' },
    { id: 'cat_wangpan',   name: '网盘' },
    { id: 'cat_fun',    name: '娱乐' }
  ],
  sites: [

    { id: 's_baidu',      catId: 'cat_common', name: '百度',          url: 'https://www.baidu.com',            icon: 'assets/icons/baidu.ico',          intro: '全球最大中文搜索引擎' },
    { id: 's_github',     catId: 'cat_common', name: 'GitHub',        url: 'https://github.com',               icon: 'assets/icons/github.svg',         intro: '全球最大代码托管平台' },
    { id: 's_bilibili',   catId: 'cat_common', name: '哔哩哔哩',      url: 'https://www.bilibili.com',         icon: 'assets/icons/bilibili.ico',       intro: '国内知名视频弹幕网站' },

    { id: 's_mdn',        catId: 'cat_dev',    name: 'MDN Web Docs',  url: 'https://developer.mozilla.org',    icon: 'assets/icons/mdn.ico',            intro: 'Web 技术权威文档' },
    { id: 's_so',         catId: 'cat_dev',    name: 'Stack Overflow', url: 'https://stackoverflow.com',        icon: 'assets/icons/stackoverflow.ico',  intro: '程序员问答社区' },
    { id: 's_pgyer',         catId: 'cat_dev',    name: '蒲公英', url: 'https://www.pgyer.com',        icon: 'assets/icons/pgyer.ico',  intro: '内侧App托管分发平台' },
    { id: 's_runoob',         catId: 'cat_dev',    name: '菜鸟教程', url: 'https://www.runoob.com',        icon: 'assets/icons/runoob.png',  intro: '基础编程技术教程' },

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
    { id: 's_foxmail',         catId: 'cat_mail',    name: 'Foxmail', url: 'https://www.foxmail.com',        icon: 'assets/icons/foxmail.ico',  intro: '电子邮件客户端软件' },

    { id: 's_webicon',         catId: 'cat_tool',    name: 'Webicon', url: 'https://webicon.cc',        icon: 'assets/icons/webicon.jpg',  intro: '获取任意网站的 图标' },

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

    { id: 's_pixiv',         catId: 'cat_fun',    name: 'Pixiv', url: 'https://www.pixiv.net',        icon: 'assets/icons/pixiv.png',  intro: 'Pixiv' },
    { id: 's_sankaku',         catId: 'cat_fun',    name: 'Sankaku Complex', url: 'https://www.sankakucomplex.com',        icon: 'assets/icons/sankaku.png',  intro: 'Sankaku Complex' },
    { id: 's_pica',         catId: 'cat_fun',    name: 'Pica', url: 'https://pica.fanjugou10.top',        icon: 'assets/icons/pica.png',  intro: '哔咔漫书' }


  ]
};
