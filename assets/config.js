/* ================================================================
 * DOGTI 配置文件 —— 账号、收款码、计数接口、统计都只改这一个文件
 * 改完保存，重新上传到 GitHub 即可生效
 * ================================================================ */
window.DOGTI_CONFIG = {
  // 网站正式地址（用于分享链接和二维码）。留空 = 自动使用当前网址
  siteUrl: 'https://zhouzhouwen.github.io/dogti/',

  // 作者信息：抖音/小红书同名账号。name 留空时，首页和结果页不显示作者卡片
  author: {
    name: '',            // 例如：'周周的小狗研究所'
    douyinId: '',        // 抖音号，例如：'dogti2026'（选填）
    xhsId: '',           // 小红书号（选填）
    avatar: ''           // 头像图片路径，例如：'assets/img/avatar.jpg'（选填）
  },

  // 打赏/收款码图片（放进 assets/img/ 后填路径）。都留空 = 不显示打赏区
  tip: {
    title: '请作者吃根小骨头',
    wechat: '',          // 例如：'assets/img/tip-wechat.png'
    alipay: ''           // 例如：'assets/img/tip-alipay.png'
  },

  // 真实计数接口（Cloudflare Worker，见 worker/README.md）。留空 = 不显示人数
  counter: {
    api: '',             // 例如：'https://dogti-counter.你的子域.workers.dev'
    showFrom: 1000,      // 累计达到这个数之前，首页显示"新上线"而不是人数
    badgeLimit: 1000,    // 前 N 位完成测试的人获得「初代汪」徽章
    rarityFrom: 2000     // 累计达到这个数之后，结果页显示"你的同款占比"
  },

  // 百度统计站点 ID（hm.js? 后面那串）。留空 = 不加载
  baiduTongjiId: '',

  // 闪光款出现概率（纯外观彩蛋，不影响结果）
  shinyRate: 1 / 50
};
