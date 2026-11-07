# DOGTI 狗格测试

测测你是哪种性格的小狗。28 道题 · 16 种原创小狗 · 4 张隐藏款 · 10 张彩蛋卡 · 中文 / English。

姐妹测试：[MATI 马格测试](https://zhouzhouwen.github.io/mati/) · [CITYTI 城格测试](https://zhouzhouwen.github.io/cityti/)（三个站共用同一套引擎 `assets/app.js` + `assets/style.css`）

线上地址：https://zhouzhouwen.github.io/dogti/

## 常改的地方

| 想做的事 | 改哪里 |
| --- | --- |
| 关注二维码、收款码 | `assets/config.js` 的 `follow`、`tip`（图片放在 `assets/img/`） |
| “来看看其他测试吧” | `assets/config.js` 的 `more`（三个站互相推荐，图标和二维码在 `assets/img/more/`） |
| 首页访客人数 | `assets/config.js` 的 `counter.busuanzi`（默认开启，用免费的「不蒜子」统计真实访客） |
| 完成次数 / 初代汪徽章 / 同款占比 | 按 `worker/README.md` 部署 Cloudflare Worker 后，填 `counter.api` |
| 百度统计 | `assets/config.js` 的 `baiduTongjiId` |
| 题目、16 种狗狗文案、组合、隐藏款、彩蛋、界面文字 | `assets/lang-zh.js`（中文）、`assets/lang-en.js`（英文） |
| 计分规则、隐藏款触发条件、默契值 | `assets/core.js` |
| 小狗插画（纯代码 SVG） | `assets/dogs.js` |

## 本地预览

在这个文件夹里打开终端，运行：

```bash
python3 -m http.server 8000
```

然后浏览器打开 http://localhost:8000 。

## 更新上线

改完文件后，把改动的文件上传到 GitHub 仓库 `zhouzhouwen/dogti`（网页上直接拖拽上传即可），1～2 分钟后自动生效。

## 目录

```
index.html            页面骨架
assets/config.js      二维码、收款码、计数、统计
assets/core.js        维度、题目计分方向、16 种类型、隐藏款与彩蛋规则、参考文献
assets/lang-zh.js     中文语言包（按需加载）
assets/lang-en.js     英文语言包（按需加载）
assets/dogs.js        16 + 14 只原创小狗（SVG），每只都能摸
assets/app.js         答题、计分、结果页、组合、图鉴、分享图、彩蛋
assets/style.css      样式（系统字体：苹方 / SF）
assets/qrcode.min.js  二维码生成（qrcode-generator，MIT）
assets/img/           图标、分享封面、关注码、收款码
worker/               可选的完成次数计数器（Cloudflare Worker + D1）
```

## 版权

题目文案与小狗插画为原创作品，保留所有权利；转载请注明出处。
