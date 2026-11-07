# DOGTI 真实计数器（可选）

不开计数器，网站也能正常用：首页显示"原创 · 免费 · 不用登录"，不显示人数。
开了以后，首页会显示真实的鉴定次数，结果页会出现「初代汪」徽章和"同款占比"。

## 先知道两件事

1. **大陆访问**：`*.workers.dev` 在中国大陆可能连不上。连不上时网站照常出结果，只是这次不计数，所以数字会偏少。
   想让大陆用户也能计数，需要给 Worker 绑一个自己的域名（Worker → 设置 → 域和路由 → 添加自定义域）。
2. **免费额度**：Workers 免费档每天 10 万次请求，D1 免费档每天 10 万行写入；超额后当天的计数请求会失败，网站不受影响。
   每完成一次测试约用 1 次请求 + 1 行写入，打开首页约用 1 次请求。额度以 Cloudflare 官方页面为准：
   https://developers.cloudflare.com/workers/platform/pricing/ ， https://developers.cloudflare.com/d1/platform/pricing/

## 部署步骤（Cloudflare 后台，约 5 分钟）

1. 打开 dash.cloudflare.com，用已有账号登录即可，不用重新注册。
2. **建数据库**：左侧「存储和数据库 → D1」→ 创建数据库，名字填 `dogti`。
   进入数据库的「控制台」，粘贴 `schema.sql` 里的内容并执行。
3. **建 Worker**：左侧「Workers 和 Pages」→ 创建 → 从 Hello World 模板创建，名字填 `dogti-counter` → 部署。
4. **绑定数据库**：进入这个 Worker →「设置 → 绑定」→ 添加 → D1 数据库，变量名填 `DB`，选择 `dogti`。
5. **设置来源**：「设置 → 变量和机密」→ 添加文本变量 `ALLOWED_ORIGIN`，值填 `https://zhouzhouwen.github.io`。
6. **粘贴代码**：点「编辑代码」，把 `counter-worker.js` 全部内容替换进去 → 部署。
7. 在浏览器打开 `https://dogti-counter.你的子域.workers.dev/stats`，看到 `{"total":0,"types":{}}` 就成功了。
8. 把这个地址（不带 `/stats`）填进网站的 `assets/config.js` → `counter.api`，重新上传网站。

## 隐私

计数器只收到一个类型代码（例如 `HHLH`），不记录 IP、不记录作答、不设置 Cookie。
