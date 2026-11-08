/**
 * DOGTI / MATI / CITYTI 共用的真实计数器 —— Cloudflare Worker + D1
 *
 * 只记录"哪个测试 + 测出的类型代码"，不存 IP、不存作答、不设 Cookie。
 * 接口：
 *   GET  /stats?s=dogti                   -> { total, types: { HHLH: 12, ... } }
 *   POST /hit   body: {"s":"dogti","t":"HHLH"} -> 同上（total 即本次的序号）
 *
 * 需要的绑定（Cloudflare 后台 → Worker → 设置）：
 *   D1 数据库，变量名 DB（先在 D1 控制台执行 schema.sql）
 *   文本变量 ALLOWED_ORIGIN = https://zhouzhouwen.github.io （多个用英文逗号隔开）
 */
const SITES = ['dogti', 'mati', 'cityti'];
const TYPES = ['HHHH', 'HHHL', 'HHLH', 'HHLL', 'HLHH', 'HLHL', 'HLLH', 'HLLL',
  'LHHH', 'LHHL', 'LHLH', 'LHLL', 'LLHH', 'LLHL', 'LLLH', 'LLLL'];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsHeaders(request, env);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    try {
      if (url.pathname === '/stats' && request.method === 'GET') {
        const s = url.searchParams.get('s') || 'dogti';
        if (!SITES.includes(s)) return json({ error: 'bad site' }, cors, 'no-store', 400);
        return json(await readAll(env, s), cors, 'public, max-age=30');
      }
      if (url.pathname === '/hit' && request.method === 'POST') {
        let body = {};
        try { body = JSON.parse(await request.text()) || {}; } catch (e) { /* 忽略 */ }
        const s = body.s || 'dogti', t = body.t;
        if (!SITES.includes(s) || !TYPES.includes(t)) return json({ error: 'bad request' }, cors, 'no-store', 400);
        await env.DB.prepare('INSERT INTO counts (site, t, n) VALUES (?1, ?2, 1) ON CONFLICT(site, t) DO UPDATE SET n = n + 1').bind(s, t).run();
        return json(await readAll(env, s), cors, 'no-store');
      }
      return json({ ok: true, name: 'ti-counter', sites: SITES }, cors, 'no-store');
    } catch (e) {
      return json({ error: 'server' }, cors, 'no-store', 500);
    }
  }
};

async function readAll(env, site) {
  const { results } = await env.DB.prepare('SELECT t, n FROM counts WHERE site = ?1').bind(site).all();
  const types = {};
  let total = 0;
  for (const r of results) { types[r.t] = r.n; total += r.n; }
  return { total, types };
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = String(env.ALLOWED_ORIGIN || '*').split(',').map(s => s.trim()).filter(Boolean);
  const allow = allowed.includes('*') ? '*' : (allowed.includes(origin) ? origin : allowed[0]);
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}

function json(obj, cors, cache, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': cache }, cors)
  });
}
