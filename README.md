# DOGTI 狗格测试

测测你是哪种性格的小狗。24 道题 · 16 种原创小狗 · 有隐藏款。

线上地址：https://zhouzhouwen.github.io/dogti/

## 只需要改一个文件：`assets/config.js`

| 想做的事 | 改哪里 |
| --- | --- |
| 显示你的抖音/小红书账号 | `author.name`（同名账号）、`douyinId`、`xhsId` |
| 放收款码 | 把图片放进 `assets/img/`，在 `tip.wechat` / `tip.alipay` 填路径 |
| 开启真实计数 | 按 `worker/README.md` 部署后，填 `counter.api` |
| 百度统计 | 注册后把站点 ID 填进 `baiduTongjiId` |

题目、16 种狗狗的文案、参考文献都在 `assets/data.js`。小狗插画是纯代码画的，在 `assets/dogs.js`。

## 本地预览

在这个文件夹里打开终端，运行：

```bash
python3 -m http.server 8000
```

然后浏览器打开 http://localhost:8000 。（直接双击 index.html 也能看，只是标题字体可能加载不出来。）

## 更新上线

改完文件后，把改动的文件上传到 GitHub 仓库 `zhouzhouwen/dogti`（网页上直接拖拽上传即可），1～2 分钟后自动生效。

## 目录

```
index.html            页面骨架
assets/config.js      账号、收款码、计数、统计（只改这里）
assets/data.js        题库、16 种类型文案、参考文献
assets/dogs.js        16+1 只原创小狗（SVG）
assets/app.js         答题、计分、结果页、分享图、好友配对、彩蛋
assets/style.css      样式
assets/qrcode.min.js  二维码生成（qrcode-generator，MIT）
assets/fonts/         标题字体子集（站酷庆科黄油体、Fredoka，均为 SIL OFL 1.1）
assets/img/           图标、分享封面
worker/               可选的真实计数器（Cloudflare Worker + D1）
```

## 版权

题目文案与小狗插画为原创作品，保留所有权利；转载请注明出处。
字体与二维码库的许可证见对应文件。
