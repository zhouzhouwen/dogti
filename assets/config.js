/* ================================================================
 * 配置文件 —— 二维码、收款码、计数、统计、"更多测试"都只改这一个文件
 * ================================================================ */
window.TI_CONFIG = {
  // 网站正式地址（用于分享链接和二维码）。留空 = 自动使用当前网址
  siteUrl: 'https://zhouzhouwen.github.io/dogti/',

  // 关注二维码（已去掉姓名、头像等个人信息）。留空 = 不显示
  follow: { douyin: 'assets/img/follow-douyin.png', xhs: 'assets/img/follow-xhs.png' },

  // 打赏收款码（重新生成的干净二维码，不含姓名）。都留空 = 不显示打赏区
  tip: { wechat: 'assets/img/tip-wechat.png', alipay: 'assets/img/tip-alipay.png' },

  // 计数：api = Cloudflare Worker + D1 计数器（三个测试共用，记录完成次数和类型，见 dogti 的 worker/README.md）
  //       busuanzi = 免费的「不蒜子」打开次数；Worker 连不上（如部分大陆网络）或完成数还少时，自动改用它
  counter: {
    busuanzi: true,
    busuanziFrom: 50,    // 打开次数达到这个数之后才显示数字，之前显示"新鲜上线"
    api: 'https://ti-counter.philzhouwen.workers.dev',
    showFrom: 30,        // 完成次数达到这个数之后，首页才显示"已有 N 人测过"，之前显示打开次数
    badgeLimit: 1000,    // 前 N 位完成测试的人获得「初代」徽章
    rarityFrom: 2000     // 累计达到这个数之后，结果页显示"同款占比"
  },

  // "来看看其他测试吧"（自己会自动隐藏）
  more: [
    { id: 'dogti', url: 'https://zhouzhouwen.github.io/dogti/', bg: '#ffe9a8', icon: 'assets/img/more/dogti-icon.png', qr: 'assets/img/more/dogti-qr.png',
      name: { zh: 'DOGTI 狗格测试', en: 'DOGTI · Which Dog Are You?' }, desc: { zh: '测测你是哪种性格的小狗', en: '16 original dogs. Which one is you?' } },
    { id: 'mati', url: 'https://zhouzhouwen.github.io/mati/', bg: '#dcebff', icon: 'assets/img/more/mati-icon.png', qr: 'assets/img/more/mati-qr.png',
      name: { zh: 'MATI 马格测试', en: 'MATI · Which Horse Are You?' }, desc: { zh: '2026 马年限定：上班的你是哪匹马？', en: 'Year of the Horse edition: which horse are you at work?' } },
    { id: 'cityti', url: 'https://zhouzhouwen.github.io/cityti/', bg: '#e3f2df', icon: 'assets/img/more/cityti-icon.png', qr: 'assets/img/more/cityti-qr.png',
      name: { zh: 'CITYTI 城格测试', en: 'CITYTI · Your Soul City' }, desc: { zh: '你的灵魂属于哪座城市？', en: 'Which Chinese city is your soulmate?' } }
  ],

  // 百度统计站点 ID（hm.js? 后面那串）。留空 = 不加载
  baiduTongjiId: '',

  // 闪光款出现概率（纯外观彩蛋，不影响结果）
  shinyRate: 1 / 50
};
