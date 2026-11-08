# 真实计数器（Cloudflare Worker + D1，三个测试共用）

DOGTI、MATI、CITYTI 共用一个计数器，已经部署在你的 Cloudflare 账号里：

| 项目 | 值 |
| --- | --- |
| Worker 名称 | `ti-counter` |
| 地址 | https://ti-counter.philzhouwen.workers.dev |
| D1 数据库 | `ti-counter`（表 `counts`，结构见 `schema.sql`） |
| 绑定 | D1 → 变量名 `DB`；文本变量 `ALLOWED_ORIGIN = https://zhouzhouwen.github.io` |

三个网站的 `assets/config.js` 里 `counter.api` 已经填好这个地址。

## 它做什么

- 每完成一次测试，记一笔「哪个测试 + 测出的类型代码」（例如 `mati / HHLH`）。不记录 IP、不记录作答、不设 Cookie。
- 首页：完成次数达到 `counter.showFrom`（默认 30）后，显示「已有 N … 来报到」；之前显示不蒜子的打开次数。
- 结果页：前 1000 位显示「初代 · 第 N 位」徽章；累计 2000 次后显示「同款占比」。

## 先知道两件事

1. **大陆访问**：`*.workers.dev` 在中国大陆部分网络连不上。连不上时网站照常出结果，首页自动改用不蒜子的打开次数，只是这次完成不计数。
   想让大陆用户也稳定计数，需要买一个自己的域名，在 Worker →「设置 → 域和路由」里绑定自定义域，再把新地址填进三个站的 `counter.api`。
2. **免费额度**：Workers 免费档每天 10 万次请求，D1 免费档每天 10 万行写入。超额后当天的计数请求会失败，网站不受影响。
   额度以 Cloudflare 官方页面为准：https://developers.cloudflare.com/workers/platform/pricing/ ， https://developers.cloudflare.com/d1/platform/pricing/

## 接口

```
GET  /stats?s=dogti                      -> { "total": 12, "types": { "HHLH": 3, ... } }
POST /hit   body {"s":"mati","t":"HHLH"}  -> 同上（total 即本次的序号）
```

## 查看 / 清零数据

Cloudflare 后台 → 存储和数据库 → D1 → `ti-counter` → 控制台：

```sql
SELECT site, SUM(n) FROM counts GROUP BY site;   -- 每个测试的完成次数
SELECT * FROM counts WHERE site = 'mati';        -- MATI 各类型的人数
DELETE FROM counts;                              -- 全部清零（慎用）
```

## 改代码

Worker →「编辑代码」，把 `counter-worker.js` 全部内容粘贴进去 → 部署。以后要加新测试，把站点 id 加进代码里的 `SITES` 数组即可。
