/**
 * DOGTI 真实计数器 —— Cloudflare Worker + D1
 *
 * 只记录"完成了一次测试 + 狗狗类型"，不存 IP、不存作答。
 * 接口：
 *   GET  /stats  -> { total, types: { HHLH: 12, ... } }
 *   POST /hit    body: {"t":"HHLH"}  -> 同上（total 即本次的序号）
 *
 * 需要的绑定（在 Cloudflare 后台设置）：
 *   D1 数据库，变量名 DB（先在 D1 控制台执行 schema.sql）
 *   环境变量 ALLOWED_ORIGIN，例如 https://zhouzhouwen.github.io （多个用英文逗号隔开）
 */
const TYPES = ['HHHH', 'HHHL', 'HHLH', 'HHLL', 'HLHH', 'HLHL', 'HLLH', 'HLLL',
  'LHHH', 'LHHL', 'LHLH', 'LHLL', 'LLHH', 'LLHL', 'LLLH', 'LLLL'];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsHeaders(request, env);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    try {
      if (url.pathname === '/stats' && request.method === 'GET') {
        return json(await readAll(env), cors, 'public, max-age=60');
      }
      if (url.pathname === '/hit' && request.method === 'POST') {
        let t = '';
        try { t = (JSON.parse(await request.text()) || {}).t; } catch (e) { /* 忽略 */ }
        if (!TYPES.includes(t)) return json({ error: 'bad type' }, cors, 'no-store', 400);
        await env.DB.prepare('INSERT INTO counts (t, n) VALUES (?1, 1) ON CONFLICT(t) DO UPDATE SET n = n + 1').bind(t).run();
        return json(await readAll(env), cors, 'no-store');
      }
      return json({ ok: true, name: 'dogti-counter' }, cors, 'no-store');
    } catch (e) {
      return json({ error: 'server' }, cors, 'no-store', 500);
    }
  }
};

async function readAll(env) {
  const { results } = await env.DB.prepare('SELECT t, n FROM counts').all();
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
