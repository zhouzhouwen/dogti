/* TI 测试引擎（DOGTI / MATI / CITYTI 共用） —— 中 / 英双语
 * 站点差异全部来自：TI_CORE（规则与元数据）、TI_LANG（文案）、TI_ART（插画）、TI_CONFIG（账号与计数）
 */
(function () {
  'use strict';
  var CORE = window.TI_CORE, C = window.TI_CONFIG || {}, Art = window.TI_ART, SITE = CORE.site;
  var R = CORE.rules, ITEMS = CORE.items, N_ITEMS = ITEMS.length;
  var TK = CORE.typeDims;                    // 决定类型的 4 个维度
  var MD = CORE.modDim;                      // 第 5 维（只决定"款"）
  var DIMS = CORE.dims;
  var DIMC = {}; DIMS.forEach(function (d) { DIMC[d.key] = d.color; });
  var L = null, LANG = 'zh';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ================= 小工具 ================= */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmt(s, v) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return v && v[k] != null ? v[k] : m; }); }
  function t(k, v) { var s = L.ui[k]; if (s == null) s = k; return v ? fmt(s, v) : s; }
  function colon() { return LANG === 'zh' ? '：' : ': '; }
  function paren(s) { return LANG === 'zh' ? '（' + s + '）' : ' (' + s + ')'; }
  var mem = {}, smem = {};
  var store = { // 浏览器存储不可用时退回内存
    get: function (k, d) { k = SITE.id + ':' + k; try { var v = localStorage.getItem(k); if (v != null) return JSON.parse(v); } catch (e) { } return k in mem ? mem[k] : d; },
    set: function (k, v) { k = SITE.id + ':' + k; mem[k] = v; try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } },
    del: function (k) { k = SITE.id + ':' + k; delete mem[k]; try { localStorage.removeItem(k); } catch (e) { } },
    sget: function (k, d) { k = SITE.id + ':' + k; try { var v = sessionStorage.getItem(k); if (v != null) return JSON.parse(v); } catch (e) { } return k in smem ? smem[k] : d; },
    sset: function (k, v) { k = SITE.id + ':' + k; smem[k] = v; try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  };
  var toastQ = [], toastBusy = false, toastTimer = null;
  function toast(msg, ms, urgent) {
    if (urgent) { toastQ = []; clearTimeout(toastTimer); toastBusy = false; }
    if (toastQ.length && toastQ[toastQ.length - 1][0] === msg) return;
    if (toastQ.length >= 3) toastQ.shift();
    toastQ.push([msg, ms || 2200]); if (!toastBusy) nextToast();
  }
  function nextToast() {
    var it = toastQ.shift(); var el = $('#toast');
    if (!it) { toastBusy = false; return; }
    toastBusy = true; el.textContent = it[0]; el.classList.add('on');
    toastTimer = setTimeout(function () { el.classList.remove('on'); toastTimer = setTimeout(nextToast, 240); }, it[1]);
  }
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ICONS = (Art && Art.icons) || {};
  var PAW = CORE.particle || ICONS.particle || '<svg viewBox="0 0 40 40" width="26" height="26"><g fill="FILL" stroke="#2b211c" stroke-width="2.6"><ellipse cx="20" cy="27" rx="9" ry="7.5"/><ellipse cx="9" cy="17" rx="4" ry="5"/><ellipse cx="16" cy="10" rx="4" ry="5"/><ellipse cx="24" cy="10" rx="4" ry="5"/><ellipse cx="31" cy="17" rx="4" ry="5"/></g></svg>';
  var HEART = '<svg viewBox="0 0 40 40" width="22" height="22"><path d="M20 34C4 24 6 10 14 9c3 0 5 2 6 4 1-2 3-4 6-4 8 1 10 15-6 25z" fill="FILL" stroke="#2b211c" stroke-width="2.6" stroke-linejoin="round"/></svg>';
  function confetti(n, colors) {
    if (reduced) return;
    var fx = $('#fx'); colors = colors || ['#ffd65c', '#ff8fb3', '#79dcc8', '#a99bff', '#ff9b4a'];
    for (var i = 0; i < (n || 20); i++) {
      var el = document.createElement('i');
      el.innerHTML = PAW.replace(/FILL/g, colors[i % colors.length]);
      el.style.left = (Math.random() * 100) + 'vw';
      el.style.animationDuration = (1.5 + Math.random() * 1.4) + 's';
      el.style.animationDelay = (Math.random() * 0.4) + 's';
      el.style.transform = 'scale(' + (0.7 + Math.random() * 0.6) + ')';
      fx.appendChild(el);
      setTimeout(function (e) { e.remove(); }, 3800, el);
    }
  }
  function floaties(x, y, n) {
    if (reduced) return;
    for (var i = 0; i < (n || 3); i++) {
      var el = document.createElement('i'); el.className = 'floaty';
      el.innerHTML = (i % 2 ? PAW : HEART).replace(/FILL/g, ['#ff8fb3', '#ffd65c', '#79dcc8'][i % 3]);
      el.style.left = (x - 11 + (Math.random() * 40 - 20)) + 'px'; el.style.top = (y - 11) + 'px';
      el.style.animationDelay = (i * 0.08) + 's';
      document.body.appendChild(el);
      setTimeout(function (e) { e.remove(); }, 1300, el);
    }
  }
  function copyText(txt) {
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = txt; ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.opacity = '0'; ta.style.top = '0'; document.body.appendChild(ta); ta.select();
      try { ta.setSelectionRange(0, txt.length); } catch (e) { }
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) { }
      ta.remove(); return ok;
    }
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(txt).then(function () { return true; }, function () { return fallback(); });
    }
    return Promise.resolve(fallback());
  }
  function track(a, b, c) { if (window._hmt) window._hmt.push(['_trackEvent', a, b || '', c || '']); }
  var UA = navigator.userAgent;
  var isWeChat = /MicroMessenger/i.test(UA);
  var inApp = isWeChat || /QQ\/|Weibo|aweme|BytedanceWebview|XiaoHongShu|DingTalk|AlipayClient|Lark|baiduboxapp/i.test(UA);
  var noQrDefault = /aweme|BytedanceWebview|XiaoHongShu/i.test(UA);
  function baseUrl() { return C.siteUrl || (location.origin + location.pathname); }
  function endPunct(s) { return /[。！？!?.…~～」”"）)]$/.test(s); }

  /* ================= 数据访问 ================= */
  var CODES = Object.keys(CORE.types);
  var BY_ART = {}; CODES.forEach(function (c) { BY_ART[CORE.types[c].art] = c; });
  function TY(code) { var m = CORE.types[code]; return m ? Object.assign({ code: code }, m, L.types[code]) : null; }
  function HID(id) { return Object.assign({ id: id }, CORE.hidden[id], L.hidden[id]); }
  function EGG(id) { return Object.assign({ id: id }, CORE.eggs[id], L.eggs[id]); }
  function DL(k) { return L.dims[k]; }
  function codeChars(code, c) {
    var a = code.split('').map(function (p, i) { var d = DL(TK[i]); return p === 'H' ? d.hi : d.lo; });
    if (c) a.push(c === 'H' ? DL(MD).hi : DL(MD).lo);
    return a;
  }
  function codeStr(code, c) { var a = codeChars(code, c); var mod = c ? a.pop() : ''; return a.join('') + (mod ? (LANG === 'zh' ? '·' + mod : '-' + mod) : ''); }
  function modLabel(c) { return c === 'H' ? DL(MD).modHi : DL(MD).modLo; }
  function flip(code, k) { var i = TK.indexOf(k), s = code.split(''); s[i] = s[i] === 'H' ? 'L' : 'H'; return s.join(''); }
  function maskOf(a, b) { var m = ''; for (var i = 0; i < 4; i++) m += a[i] === b[i] ? '0' : '1'; return m; }
  function applyMask(a, m) { var s = ''; for (var i = 0; i < 4; i++) s += m[i] === '1' ? (a[i] === 'H' ? 'L' : 'H') : a[i]; return s; }
  function art(key, o) { return Art.svg(key, o); }

  /* ================= 计分 ================= */
  function compute(ans, meta) {
    var sums = {}, max = {};
    DIMS.forEach(function (d) { sums[d.key] = 0; max[d.key] = 0; });
    var neutral = 0, agree = 0, disagree = 0, extreme = 0;
    ITEMS.forEach(function (it, i) {
      var a = ans[i], v = a - 3;
      if (a === 3) neutral++; if (a >= 4) agree++; if (a <= 2) disagree++; if (a === 1 || a === 5) extreme++;
      sums[it.d] += it.k * v; max[it.d] += 2;
    });
    var pct = {}, poles = {};
    DIMS.forEach(function (d) {
      var k = d.key, s = sums[k];
      pct[k] = Math.round((s + max[k]) / (2 * max[k]) * 100);
      var pole = s > 0 ? 'H' : s < 0 ? 'L' : null;
      if (!pole) { // 平分：取该维度第一道有倾向的作答
        for (var i = 0; i < N_ITEMS && !pole; i++) if (ITEMS[i].d === k && ans[i] !== 3) pole = ITEMS[i].k * (ans[i] - 3) > 0 ? 'H' : 'L';
        pole = pole || 'H';
      }
      poles[k] = pole;
    });
    var code = TK.map(function (k) { return poles[k]; }).join('');
    var near = TK.filter(function (k) { return Math.abs(sums[k]) <= 1; }).sort(function (a, b) { return Math.abs(sums[a]) - Math.abs(sums[b]); });
    // 隐藏款看作答方式：按 hiddenOrder 的顺序，第一个达到门槛的生效（core.js 里没有的隐藏款不会触发）
    var tally = { mystery: [neutral, R.mysteryNeutral], echo: [agree, R.echoAgree], rebel: [disagree, R.rebelDisagree], diode: [extreme, R.diodeExtreme] };
    var hidden = null, counts = {};
    CORE.hiddenOrder.forEach(function (h) { var x = tally[h]; if (!x) return; counts[h] = x[0]; if (!hidden && x[1] && x[0] >= x[1]) hidden = h; });
    return {
      v: 2, code: code, c: poles[MD], sums: sums, pct: pct,
      alt: near.length ? flip(code, near[0]) : null, altDim: near.length ? near[0] : null,
      hidden: hidden, hiddenN: hidden ? counts[hidden] : 0,
      shiny: Math.random() < (C.shinyRate || 0.02), ts: Date.now(), dur: meta ? meta.dur : 0
    };
  }
  function bucket(p) { return p <= 20 ? 0 : p <= 41 ? 1 : p <= 58 ? 2 : p <= 79 ? 3 : 4; }

  /* ================= 组合 ================= */
  function pairScore(a, b) {
    var key = [a, b].sort().join(''), h = 7;
    for (var i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 1009;
    return Math.max(60, Math.min(99, CORE.rel[maskOf(a, b)] + (h % 5) - 2));
  }
  function cpName(a, b) { var ta = TY(a), tb = TY(b); return a === b ? t('cpSame', { a: ta.short }) : t('cp', { a: ta.short, b: tb.short }); }

  /* ================= 好友邀请 ================= */
  var inviter = null;
  function clamp(n) { n = +n; return isNaN(n) ? 50 : Math.max(0, Math.min(100, n)); }
  function parseInvite() {
    try {
      var q = new URLSearchParams(location.search), f = q.get('f');
      if (f) {
        var m = /^([HL]{4})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(f);
        if (m && CORE.types[m[1]]) {
          var hid = q.get('h');
          inviter = { code: m[1], pct: {}, name: (q.get('n') || '').slice(0, 12), hidden: CORE.hidden[hid] ? hid : null };
          TK.forEach(function (k, i) { inviter.pct[k] = clamp(m[i + 2]); });
          store.sset('inviter', inviter); addMet(m[1], true);
        }
      } else inviter = store.sget('inviter', null);
      // 去掉地址栏里别人的邀请参数，免得被原样转发
      if (q.has('f') || q.has('n') || q.has('h')) history.replaceState(null, '', location.pathname + '?l=' + (q.get('l') || LANG) + location.hash);
    } catch (e) { }
  }
  function inviteUrl(res, name, forQr) {
    if (!res) return baseUrl() + (forQr ? '' : '?l=' + LANG);
    var p = res.pct, f = [res.code].concat(TK.map(function (k) { return p[k]; })).join('.');
    var u = baseUrl() + '?f=' + f;
    if (res.hidden) u += '&h=' + res.hidden;
    if (!forQr) { if (name) u += '&n=' + encodeURIComponent(name); u += '&l=' + LANG; }
    return u;
  }
  function addMet(code, byFriend) { var m = store.get('met', {}); if (!m[code] || (!byFriend && m[code] === 'f')) { m[code] = byFriend ? (m[code] || 'f') : 'y'; store.set('met', m); } }
  function lastRes() {
    var r = store.get('last', null); if (!(r && r.v === 2 && CORE.types[r.code])) return null;
    if (r.hidden && !CORE.hidden[r.hidden]) r.hidden = null; // 已下线的隐藏款按普通类型显示
    return r;
  }

  /* ================= 计数（不蒜子访客 / 可选 Worker） ================= */
  var CNT = ((C.counter && C.counter.api) || '').replace(/\/+$/, '');
  var CBASE = Math.max(0, Math.floor(+((C.counter || {}).base) || 0)); // 人数起点：显示 = 起点 + 真实完成次数
  var REAL = false; try { REAL = new URLSearchParams(location.search).get('real') === '1'; } catch (e) { } // 网址加 ?real=1 看真实数字
  function api(path, body) {
    if (!CNT || !window.fetch) return Promise.resolve(null);
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 3500);
    var opt = { signal: ctrl ? ctrl.signal : undefined };
    if (body) { opt.method = 'POST'; opt.headers = { 'Content-Type': 'text/plain;charset=UTF-8' }; opt.body = JSON.stringify(body); }
    path += (path.indexOf('?') < 0 ? '?' : '&') + 's=' + encodeURIComponent(SITE.id);
    return fetch(CNT + path, opt).then(function (r) { clearTimeout(timer); return r.ok ? r.json() : null; }).catch(function () { clearTimeout(timer); return null; });
  }
  var stats = null, bsz = null, bszWait = null;
  function busuanzi(cb) {
    if (bsz) return cb(bsz);
    if (bszWait) { bszWait.push(cb); return; }
    bszWait = [cb];
    var name = 'BusuanziCallback_' + Math.floor(Math.random() * 1e9), s = document.createElement('script');
    window[name] = function (d) { bsz = d; bszWait.forEach(function (f) { try { f(d); } catch (e) { } }); try { delete window[name]; } catch (e) { window[name] = undefined; } s.remove(); };
    s.referrerPolicy = 'no-referrer-when-downgrade';
    s.src = 'https://busuanzi.ibruce.info/busuanzi?jsonpCallback=' + name; s.async = true;
    s.onerror = function () { s.remove(); };
    document.head.appendChild(s);
  }

  /* ================= 彩蛋 & 摸摸 ================= */
  function eggsGot() { return store.get('eggs', {}); }
  function unlockEgg(id, silent) {
    var eg = eggsGot(); if (eg[id]) return false;
    eg[id] = Date.now(); store.set('eggs', eg); track('egg', id);
    if (!silent) { toast(EGG(id).unlock, 2600); confetti(16); }
    return true;
  }
  var lineIdx = {}, mainPets = 0;
  function artLines(key) {
    var code = BY_ART[key];
    if (code) return L.types[code].lines;
    var hf = store.get('hiddenFound', {}), eg = eggsGot();
    for (var h in CORE.hidden) if (CORE.hidden[h].art === key) return hf[h] ? [L.hidden[h].tagline, L.hidden[h].nick] : L.ui.petLines;
    for (var e in CORE.eggs) if (CORE.eggs[e].art === key) return eg[e] ? [L.eggs[e].nick, L.eggs[e].name] : L.ui.petLines;
    return L.ui.petLines;
  }
  function playReact(svg, cls) {
    cls = cls || 'r-' + ((Art.react && Art.react[svg.getAttribute('data-art')]) || 'pop');
    svg.classList.remove(svg._rc || cls); void svg.getBoundingClientRect(); svg.classList.add(cls); svg._rc = cls;
    clearTimeout(svg._rt); svg._rt = setTimeout(function () { svg.classList.remove(cls); }, 950);
  }
  var combo = { el: null, n: 0, t: 0 };
  function reactArt(svg, ev) {
    var key = svg.getAttribute('data-art'), now = Date.now();
    if (combo.el === svg && now - combo.t < 700) combo.n++; else combo.n = 1;
    combo.el = svg; combo.t = now;
    var superHit = combo.n >= 5 && L.ui.petSuper && L.ui.petSuper.length;
    playReact(svg, superHit ? 'r-super' : null);
    var lines = artLines(key), text;
    if (superHit) {
      combo.n = 0;
      text = L.ui.petSuper[Math.floor(Math.random() * L.ui.petSuper.length)];
      if (ev && ev.clientX) floaties(ev.clientX, ev.clientY, 9); else confetti(12);
    } else if (svg.classList.contains('art-main')) {
      mainPets++;
      if (mainPets === 3) { text = t('petFriend'); confetti(24); toast(t('petToast'), 2400, true); }
      else text = L.ui.petLines[(mainPets - 1) % L.ui.petLines.length];
    } else {
      lineIdx[key] = ((lineIdx[key] == null ? Math.floor(Math.random() * lines.length) - 1 : lineIdx[key]) + 1) % lines.length;
      text = lines[lineIdx[key]];
    }
    bubbleAt(svg, text);
    if (!superHit && ev && ev.clientX) floaties(ev.clientX, ev.clientY, 3);
    var pets = store.get('pets', 0) + 1; store.set('pets', pets); sessPets++;
    if (pets >= R.petterTaps) unlockEgg(CORE.petEgg);
    else if (!eggDone(CORE.petEgg) && (pets === 1 || pets === 10 || pets === 20 || pets === 26) && L.ui.hintPetMore) toast(t('hintPetMore', { n: R.petterTaps - pets, egg: EGG(CORE.petEgg).name }), 2200);
  }
  // 首页的角色每隔几秒自己动一下，提示“可以摸”
  setInterval(function () {
    if (reduced || current !== 'home' || document.hidden) return;
    var arts = $$('#s-home .hero-art svg.art');
    if (!arts.length) return;
    var a = arts[Math.floor(Math.random() * arts.length)]; playReact(a);
    idleTick++;
    if (idleTick % 2 === 0 && !sessPets && !eggDone(CORE.petEgg)) hintAt(a, t('hintPet'));
  }, 6500);
  var idleTick = 0;
  // 彩蛋提示：在可以点的地方自己冒出来
  function hintAt(el, text, ms) {
    if (!el || !text || !document.body.contains(el)) return;
    var r = el.getBoundingClientRect(), below = r.top < 110;
    var b = document.createElement('div'); b.className = 'pop-bubble hint-bubble' + (below ? ' below' : ''); b.textContent = text;
    b.style.left = '0px'; b.style.top = '0px'; document.body.appendChild(b);
    var vw = document.documentElement.clientWidth, w = Math.min(b.offsetWidth, vw - 16), cx = r.left + r.width / 2;
    cx = Math.max(8 + w / 2, Math.min(vw - 8 - w / 2, cx));
    b.style.left = (cx + window.scrollX) + 'px'; b.style.top = ((below ? r.bottom + 8 : r.top - 4) + window.scrollY) + 'px';
    setTimeout(function () { b.remove(); }, ms || 2800);
  }
  function eggDone(id) { return !id || !CORE.eggs[id] || !!eggsGot()[id]; }
  var sessPets = 0, langHinted = false;
  function homeHints() {
    if (current !== 'home') return;
    if (!eggDone(CORE.petEgg) && !sessPets) hintAt($('#s-home .hero-art .art-main'), t('hintPet'));
    var lg = CORE.eggTriggers.lang;
    if (lg && !eggDone(lg) && !langHinted) { langHinted = true; setTimeout(function () { if (current === 'home') hintAt($('#s-home .lang-btn'), t('hintLang'), 3200); }, 3400); }
  }
  function bubbleAt(el, text) {
    if (el._bubble) el._bubble.remove();
    var r = el.getBoundingClientRect(), b = document.createElement('div');
    b.className = 'pop-bubble'; b.textContent = text;
    document.body.appendChild(b);
    var vw = document.documentElement.clientWidth, w = b.offsetWidth, cx = r.left + r.width / 2;
    cx = Math.max(8 + w / 2, Math.min(vw - 8 - w / 2, cx));
    b.style.left = (cx + window.scrollX) + 'px';
    b.style.top = (r.top + window.scrollY + Math.min(14, r.height * 0.08)) + 'px';
    el._bubble = b;
    setTimeout(function () { b.remove(); if (el._bubble === b) el._bubble = null; }, 1700);
  }
  document.addEventListener('click', function (e) {
    var d = e.target.closest ? e.target.closest('svg.art') : null;
    if (d && !d.closest('[data-noreact]')) reactArt(d, e);
  }, true);

  /* ================= 弹层（支持返回键关闭） ================= */
  var sheetPushed = false, ignorePop = false;
  function openSheet(html, onOpen) {
    $('#sheetBody').innerHTML = html; $('#sheet').hidden = false; document.body.style.overflow = 'hidden';
    $('.sheet-panel').scrollTop = 0;
    if (!sheetPushed) { try { history.pushState({ tiSheet: 1 }, '', location.href); sheetPushed = true; } catch (e) { } }
    if (onOpen) onOpen($('#sheetBody'));
  }
  function closeSheet(fromPop) {
    if ($('#sheet').hidden) return;
    $('#sheet').hidden = true; document.body.style.overflow = '';
    if (sheetPushed) { sheetPushed = false; if (!fromPop) { ignorePop = true; history.back(); } }
  }
  document.addEventListener('click', function (e) {
    var c = e.target.closest('[data-close]');
    if (!c) return;
    var href = c.getAttribute('href');
    if (href && href.charAt(0) === '#') { e.preventDefault(); $('#sheet').hidden = true; document.body.style.overflow = ''; var wasPushed = sheetPushed; sheetPushed = false; if (wasPushed) history.replaceState(null, '', location.pathname + location.search + href); else history.pushState(null, '', location.pathname + location.search + href); lastRoute = ''; route(true); return; }
    closeSheet();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(); });

  /* ================= 路由 ================= */
  var SCREENS = ['home', 'quiz', 'loading', 'result', 'gallery', 'about', 'pair'];
  var lastRoute = null, lastRouteT = 0, current = '';
  function show(name) {
    current = name;
    SCREENS.forEach(function (s) { var el = $('#s-' + s); if (el) el.classList.toggle('on', s === name); });
    $$('.pop-bubble').forEach(function (b) { b.remove(); });
    window.scrollTo(0, 0);
  }
  function route(force) {
    var h = (location.hash || '').replace('#', ''), now = Date.now();
    if (!force && h === lastRoute && now - lastRouteT < 150) return;
    lastRoute = h; lastRouteT = now;
    if (!$('#sheet').hidden) { $('#sheet').hidden = true; document.body.style.overflow = ''; sheetPushed = false; }
    var parts = h.split('/');
    document.title = t('siteTitle');
    if (parts[0] === 'quiz') { if (!Q.ans) startQuiz(true); else { renderQuizShell(); show('quiz'); renderQ(false); } }
    else if (parts[0] === 'result') { var r = lastRes(); if (r) { renderResult(r); show('result'); } else go('home', true); }
    else if (parts[0] === 'gallery') { renderGallery(); show('gallery'); }
    else if (parts[0] === 'about') { renderAbout(); show('about'); }
    else if (parts[0] === 'pair') { renderPair(parts[1] || ''); show('pair'); }
    else { renderHome(); show('home'); }
    checkMore();
  }
  function go(name, replace) {
    var url = location.pathname + location.search + (name === 'home' ? '' : '#' + name);
    if (replace) history.replaceState(null, '', url); else history.pushState(null, '', url);
    route(true);
  }
  window.addEventListener('popstate', function () {
    if (ignorePop) { ignorePop = false; return; }
    if (sheetPushed && !$('#sheet').hidden) { closeSheet(true); return; }
    route();
  });
  window.addEventListener('hashchange', function () { route(); });

  function topbar(o) {
    o = o || {};
    var left = o.back ? '<a href="#' + (o.back === true ? 'home' : o.back) + '" class="back-link">' + (o.backText || t('back')) + '</a>' : '<span class="mini-logo">' + SITE.name + '</span>';
    var links = o.links ? '<a href="#gallery">' + t('navGallery') + '</a><a href="#about">' + t('navAbout') + '</a>' : '';
    return '<nav class="topbar">' + left + (o.title ? '<span class="topbar-title">' + o.title + '</span>' : '') +
      '<span class="topbar-links">' + links + '<button class="lang-btn" type="button">' + t('langBtn') + '</button></span></nav>';
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest('.lang-btn')) { e.preventDefault(); switchLang(LANG === 'zh' ? 'en' : 'zh'); }
  });

  /* ================= 首页 ================= */
  function renderHome() {
    var el = $('#s-home'), last = lastRes();
    var html = topbar({ links: true });
    if (inviter) {
      var it = inviter.hidden ? HID(inviter.hidden) : TY(inviter.code);
      var tgt = last ? '#pair/' + last.code + '-' + inviter.code : '#quiz';
      html += '<a class="invite-banner" href="' + tgt + '">' + art(it.art, { cls: 'inv-art' }) + '<span>' + (inviter.name ? t('inviteNamed', { name: esc(inviter.name), breed: esc(it.breed) }) : t('inviteAnon', { breed: esc(it.breed) })) +
        '<br><span class="muted">' + (last ? t('inviteSeen') : t('inviteSub')) + '</span></span></a>';
      document.title = inviter.name ? t('titleInvite', { name: inviter.name }) : t('siteTitle');
    }
    html += '<div class="hero card"><span class="hero-badge">' + t('heroBadge') + '</span>' +
      '<h1 class="logo" aria-label="' + SITE.name + '">' + SITE.name.split('').map(function (ch) { return '<span>' + ch + '</span>'; }).join('') + '</h1>' +
      '<p class="hero-sub">' + t('heroSub') + '</p><div class="hero-art">' +
      art(SITE.hero[0], { cls: 'art-l' }) + art(SITE.hero[1], { cls: 'art-main' }) + art(SITE.hero[2], { cls: 'art-r' }) + '</div></div>';
    // 第一行：题数、时长、类型数；第二行：隐藏款、彩蛋
    var chip = function (c, i) { return '<span class="chip' + (i >= 3 ? ' chip-hot' : '') + '">' + c + '</span>'; };
    html += '<p class="sell">' + t('sell') + '</p><div class="chips">' + L.ui.chips.slice(0, 3).map(chip).join('') + '</div>' +
      (L.ui.chips.length > 3 ? '<div class="chips chips-2">' + L.ui.chips.slice(3).map(function (c, i) { return chip(c, i + 3); }).join('') + '</div>' : '');
    var prog = store.get('progress', null);
    if (prog && prog.ans && prog.i > 0 && Date.now() - prog.t < 864e5) {
      html += '<button class="btn btn-big" id="resumeBtn">' + t('resume', { i: prog.i + 1, n: N_ITEMS }) + '</button><button class="btn btn-white btn-sm" id="startBtn">' + t('restart') + '</button>';
    } else html += '<button class="btn btn-big" id="startBtn">' + t('start') + ' <span class="arrow">→</span></button>';
    html += '<p class="social-proof" id="socialProof">' + proofJoin('') + '</p>';
    if (last) {
      var lt = last.hidden ? HID(last.hidden) : TY(last.code);
      html += '<p class="last-result">' + t('lastResult') + '<a href="#result">' + esc(lt.breed) + ' · ' + esc(lt.nick) + '</a></p>';
    }
    var row = CODES.map(function (c) { return art(CORE.types[c].art); }).join('');
    html += '<div class="marquee"><div class="marquee-track">' + row + row + '</div></div>';
    html += comboEntry(SITE.combo);
    html += '<div class="card home-info"><p>' + t('homeInfo1') + '</p><p class="muted">' + t('homeInfo2') + '</p><p class="muted">' + t('homeInfo3') + '</p></div>';
    html += moreHTML() + followHTML();
    html += '<footer class="foot"><a href="#about">' + t('footAbout') + '</a></footer>';
    el.innerHTML = html;
    $('#startBtn').addEventListener('click', function () { store.del('progress'); startQuiz(false); });
    var rb = $('#resumeBtn'); if (rb) rb.addEventListener('click', function () { resumeQuiz(); });
    $$('.logo span', el).forEach(function (s) {
      s.addEventListener('click', function () {
        s.classList.remove('hop'); void s.offsetWidth; s.classList.add('hop');
        var n = store.sget('logoTaps', 0) + 1; store.sset('logoTaps', n);
        if (n === 5) { toast(L.ui.logoLines[1], 2000, true); confetti(14); }
      });
    });
    paintCount();
    setTimeout(homeHints, 1300);
  }
  function proofJoin(x) { var b = L.ui.proofBase || ''; return [x, b].filter(Boolean).join(' · '); }
  function paintCount() {
    var cfg = C.counter || {}, loc = LANG === 'zh' ? 'zh-CN' : 'en-US';
    function put(html) { var sp = $('#socialProof'); if (sp) sp.innerHTML = proofJoin(html); }
    function gotStats(s) { if (!s || typeof s.total !== 'number') return false; stats = s; store.set('cnt', s.total); return true; }
    if (REAL) { // 只给自己看：真实完成次数 + 不蒜子打开次数
      var showReal = function () {
        var n = stats ? stats.total : '?', pv = bsz && +bsz.page_pv;
        put((LANG === 'zh' ? '真实完成 <b>' + n + '</b> 次' : 'Real finishes: <b>' + n + '</b>') + (pv ? ' · ' + t('proofViews', { n: pv.toLocaleString(loc) }) : ''));
      };
      showReal();
      if (cfg.busuanzi) busuanzi(showReal);
      if (CNT && !stats) api('/stats').then(function (s) { gotStats(s); showReal(); });
      return;
    }
    if (CBASE) { // 先用起点 + 上次拿到的真实数立刻显示，计数器连不上也有数字
      var showN = function (n) { put(t('proofCount', { n: (CBASE + n).toLocaleString(loc) })); };
      showN(stats ? stats.total : +store.get('cnt', 0) || 0);
      if (cfg.busuanzi) busuanzi(function () { }); // 打开次数照常统计，只在 ?real=1 里显示
      if (CNT && !stats) api('/stats').then(function (s) { if (gotStats(s)) showN(s.total); });
      return;
    }
    function viaBsz() { // 不蒜子：真实打开次数（Worker 连不上或数量还少时用）
      if (!cfg.busuanzi) return;
      busuanzi(function (d) {
        var sp = $('#socialProof'), n = d && +d.page_pv; if (!sp || !n) return;
        sp.innerHTML = proofJoin(n >= (cfg.busuanziFrom || 0) ? t('proofViews', { n: n.toLocaleString(loc) }) : t('proofNew'));
      });
    }
    if (!CNT) { viaBsz(); return; }
    var paint = function (s) {
      if (!s || typeof s.total !== 'number') { viaBsz(); return; }
      stats = s;
      var sp = $('#socialProof');
      if (s.total >= (cfg.showFrom || 0)) { if (sp) sp.innerHTML = proofJoin(t('proofCount', { n: s.total.toLocaleString(loc) })); }
      else viaBsz();
    };
    if (stats) paint(stats); else api('/stats').then(paint);
  }
  function comboEntry(keys) {
    return '<a class="card combo-entry" href="#pair">' + art(keys[0], { cls: 'mini' }) + art(keys[1], { cls: 'mini' }) +
      '<span><b>' + t('comboEntry') + '</b><br><span class="muted">' + t('comboEntrySub') + '</span></span><span class="go">→</span></a>';
  }
  function followHTML() {
    var f = C.follow || {}, tp = C.tip || {}, h = '';
    if (f.douyin || f.xhs) {
      h += '<div class="card follow"><h3>' + t('followTitle') + '</h3><p class="muted">' + t('followSub') + '</p><div class="qr-row">' +
        (f.douyin ? '<figure><img src="' + esc(f.douyin) + '" alt="' + t('douyin') + '" loading="lazy"><figcaption>' + t('douyin') + '<small>' + t('douyinHint') + '</small></figcaption></figure>' : '') +
        (f.xhs ? '<figure><img src="' + esc(f.xhs) + '" alt="' + t('xhs') + '" loading="lazy"><figcaption>' + t('xhs') + '<small>' + t('xhsHint') + '</small></figcaption></figure>' : '') + '</div></div>';
    }
    if (tp.wechat || (tp.alipay && !isWeChat)) {
      h += '<details class="card tip" open><summary>' + t('tipTitle') + '</summary><div class="qr-row">' +
        (tp.wechat ? '<figure><img src="' + esc(tp.wechat) + '" alt="' + t('wechatPay') + '" loading="lazy"><figcaption>' + t('wechatPay') + '</figcaption></figure>' : '') +
        (tp.alipay && !isWeChat ? '<figure><img src="' + esc(tp.alipay) + '" alt="' + t('alipay') + '" loading="lazy"><figcaption>' + t('alipay') + '</figcaption></figure>' : '') + '</div></details>';
    }
    return h;
  }
  function moreHTML() {
    var list = (C.more || []).filter(function (m) { return m.id !== SITE.id; });
    if (!list.length) return '';
    return '<div class="card more"><h3 class="sec-title">' + t('moreTitle') + '</h3><p class="muted small" style="margin:-6px 0 10px">' + t('moreSub') + '</p><div class="more-list">' +
      list.map(function (m) {
        return '<a class="more-item" data-mu="' + esc(m.url) + '" href="' + esc(m.url + '?l=' + LANG) + '" style="--tbg:' + m.bg + '">' + (m.icon ? '<img class="more-icon" src="' + esc(m.icon) + '" alt="">' : '') +
          '<span class="more-text"><b>' + esc(m.name[LANG] || m.name.zh) + '</b><em>' + esc(m.desc[LANG] || m.desc.zh) + '</em></span>' +
          (m.qr ? '<img class="more-qr" src="' + esc(m.qr) + '" alt="QR">' : '') + '</a>';
      }).join('') + '</div><p class="muted small center">' + t('moreQrHint') + '</p></div>';
  }

  // 推荐的其他测试还没上线（同域 404）就先藏起来，上线后自动出现
  var moreAlive = store.sget('moreAlive', {});
  function hideMore(a) { var box = a.closest('.more'); a.parentNode.removeChild(a); if (box && !box.querySelector('.more-item')) box.parentNode.removeChild(box); }
  function checkMore() {
    $$('.more-item[data-mu]').forEach(function (a) {
      var u = a.getAttribute('data-mu'), same = false;
      if (moreAlive[u] === false) { hideMore(a); return; }
      if (moreAlive[u] === true || a._chk) return;
      a._chk = 1;
      try { same = new URL(u, location.href).origin === location.origin; } catch (e) { }
      if (!same || !window.fetch) return;
      fetch(u, { method: 'HEAD', cache: 'no-store' }).then(function (r) {
        moreAlive[u] = r.ok; store.sset('moreAlive', moreAlive);
        if (!r.ok) $$('.more-item[data-mu="' + u + '"]').forEach(hideMore);
      }).catch(function () { });
    });
  }

  /* ================= 答题 ================= */
  var Q = { i: 0, ans: null, times: [], last: 0, start: 0 };
  function startQuiz(replace) {
    Q.i = 0; Q.ans = new Array(N_ITEMS).fill(0); Q.times = []; Q.last = Q.start = Date.now(); Q.fastWarned = Q.halfShown = Q.lastShown = false; Q.streak = 0;
    track('quiz', 'start'); renderQuizShell();
    if (replace) { history.replaceState(null, '', location.pathname + location.search + '#quiz'); lastRoute = 'quiz'; show('quiz'); renderQ(false); }
    else go('quiz');
  }
  function resumeQuiz() {
    var p = store.get('progress', null);
    if (!p || !p.ans || p.ans.length !== N_ITEMS) { startQuiz(false); return; }
    Q.ans = p.ans.slice(); Q.i = Math.min(p.i, N_ITEMS - 1); Q.times = []; Q.last = Date.now(); Q.start = Date.now() - (p.el || 0); Q.fastWarned = Q.halfShown = Q.lastShown = false; Q.streak = 0;
    renderQuizShell(); go('quiz');
  }
  function renderQuizShell() {
    var el = $('#s-quiz');
    if (el.getAttribute('data-rl') === LANG) return;
    el.setAttribute('data-rl', LANG);
    el.innerHTML = '<div class="qhead"><button class="iconbtn" id="qBack" type="button" aria-label="back">‹</button><div class="qcount"><b id="qNum">1</b><span>/ ' + N_ITEMS + '</span></div><button class="lang-btn" type="button">' + t('langBtn') + '</button></div>' +
      '<div class="progress"><div class="ptrack"><div class="pfill" id="pFill"></div></div><div class="prunner" id="pRunner">' + art(SITE.runner) + '</div>' +
      '<div class="pgoal" id="pGoal">' + (CORE.goalIcon || ICONS.goal || '') + '</div></div>' +
      '<div class="qcard card" id="qCard"><span class="chip qtag" id="qTag"></span><p class="qtext" id="qText"></p></div>' +
      '<div class="opts" id="opts"></div><p class="qhint">' + t('qHint') + '</p>';
    $('#opts').addEventListener('click', function (e) { var b = e.target.closest('.opt'); if (b) answer(+b.dataset.v); });
    $('#qBack').addEventListener('click', function () { if (Q.i === 0) { go('home'); return; } Q.i--; renderQ(true); });
    $('#pGoal').addEventListener('click', function (e) {
      var g = this; g.classList.remove('wig'); void g.offsetWidth; g.classList.add('wig');
      goalTaps++; if (e.clientX) floaties(e.clientX, e.clientY, 2);
      if (goalTaps >= 3 && CORE.eggTriggers.goal) unlockEgg(CORE.eggTriggers.goal);
    });
  }
  var goalTaps = 0;
  function pawIcon(v) {
    var s = [14, 17, 20, 23, 27][v - 1], fill = ['#c9d8ff', '#dcd4ff', '#f1ece4', '#ffd3b0', '#ffb7cd'][v - 1];
    return (CORE.optIcon || PAW).replace(/FILL/g, fill).replace(/width="\d+" height="\d+"/, 'width="' + s + '" height="' + s + '"');
  }
  function renderQ(animate) {
    if (!Q.ans) return;
    $('#qNum').textContent = Q.i + 1;
    $('#qTag').textContent = L.tags[Q.i];
    $('#qText').textContent = L.items[Q.i];
    var pct = Q.i / N_ITEMS * 100;
    $('#pFill').style.width = pct + '%';
    $('#pRunner').style.left = Math.max(4, pct) + '%';
    $('#opts').innerHTML = L.scale.map(function (lab, j) {
      var v = j + 1;
      return '<button class="opt' + (Q.ans[Q.i] === v ? ' sel' : '') + '" type="button" data-v="' + v + '"><span class="paw">' + pawIcon(v) + '</span>' + esc(lab) + '</button>';
    }).join('');
    if (animate) { var c = $('#qCard'); c.classList.remove('swap'); void c.offsetWidth; c.classList.add('swap'); }
    var g = CORE.eggTriggers.goal;
    if ((Q.i === 0 || Q.i === 9) && g && !eggDone(g) && L.ui.hintGoal) setTimeout(function () { if (current === 'quiz') hintAt($('#pGoal'), t('hintGoal'), 2600); }, 700);
  }
  var answering = false;
  function answer(v) {
    if (answering || !Q.ans) return;
    answering = true;
    var now = Date.now(); Q.times.push(now - Q.last); Q.last = now;
    Q.ans[Q.i] = v;
    Q.streak = v === 5 ? Q.streak + 1 : 0;
    $$('.opt', $('#opts')).forEach(function (b) { b.classList.toggle('sel', +b.dataset.v === v); });
    var recent = Q.times.slice(-5);
    if (!Q.fastWarned && recent.length === 5 && recent.every(function (x) { return x < 650; })) { Q.fastWarned = true; toast(t('toastFast')); }
    if (Q.streak === 4) toast(t('toastStreak'));
    store.set('progress', { ans: Q.ans, i: Math.min(Q.i + 1, N_ITEMS - 1), t: now, el: now - Q.start });
    setTimeout(function () {
      answering = false;
      if (!Q.ans) return;
      if (Q.i === Math.floor(N_ITEMS / 2) - 1 && !Q.halfShown) { Q.halfShown = true; toast(t('toastHalf')); }
      if (Q.i < N_ITEMS - 1) { Q.i++; renderQ(true); if (Q.i === N_ITEMS - 1 && !Q.lastShown) { Q.lastShown = true; toast(t('toastLast'), 1500); } }
      else finish();
    }, 230);
  }
  document.addEventListener('keydown', function (e) {
    if (current !== 'quiz') return;
    if (/^[1-5]$/.test(e.key)) answer(+e.key);
    if (e.key === 'Backspace' || e.key === 'ArrowLeft') { var b = $('#qBack'); if (b) b.click(); }
  });

  function finish() {
    var res = compute(Q.ans, { dur: Date.now() - Q.start });
    Q.ans = null; store.del('progress');
    toastQ = [];
    var runs = store.get('runs', 0) + 1; store.set('runs', runs);
    var hr = new Date().getHours(), newEggs = [];
    function egg(id, cond) { if (cond && CORE.eggs[id] && unlockEgg(id, true)) newEggs.push(id); }
    var E = CORE.eggTriggers;
    egg(E.speed, res.dur > 0 && res.dur < R.speedMs);
    egg(E.sloth, res.dur > R.slothMs);
    egg(E.night, hr < 5);
    egg(E.early, hr >= 5 && hr < 8);
    egg(E.again, runs >= R.againRuns);
    egg(E.twin, inviter && inviter.code === res.code);
    egg(E.shiny, res.shiny);
    var dow = new Date().getDay();
    egg(E.work, dow >= 1 && dow <= 5 && hr >= 9 && hr < 18);
    egg(E.weekend, dow === 0 || dow === 6);
    res.newEggs = newEggs;
    if (res.hidden) { var hf = store.get('hiddenFound', {}); res.hiddenNew = !hf[res.hidden]; if (!hf[res.hidden]) { hf[res.hidden] = Date.now(); store.set('hiddenFound', hf); } }
    addMet(res.code);
    store.set('last', res);
    var ld = $('#s-loading');
    ld.innerHTML = '<div class="loading"><div class="ld-art">' + art(SITE.loader) + '</div><p class="ld-text" id="ldText">' + L.ui.ld[0] + '</p><div class="ld-bar"><i></i></div></div>';
    show('loading');
    var k = 0, lt = $('#ldText');
    var iv = setInterval(function () { k++; if (k < L.ui.ld.length) lt.textContent = L.ui.ld[k]; }, 650);
    track('quiz', 'finish', res.hidden || res.code);
    setTimeout(function () {
      clearInterval(iv);
      if ((location.hash || '') !== '#quiz') return; // 用户中途离开了：结果已保存，不强行跳转
      history.replaceState(null, '', location.pathname + location.search + '#result'); lastRoute = 'result';
      renderResult(res); show('result');
      setTimeout(function () { confetti(res.shiny ? 34 : 18, res.shiny ? ['#ffe066', '#fff3a8', '#ffd65c', '#ffffff'] : null); }, 300);
      if (res.shiny) toast(t('toastShiny'), 2600);
      if (res.hidden && res.hiddenNew) toast(HID(res.hidden).unlock, 2600);
      newEggs.forEach(function (id) { if (id !== E.shiny) toast(EGG(id).unlock, 2400); });
      res.newEggsShown = newEggs; res.newEggs = []; store.set('last', res);
      countHit(res);
    }, 1950);
  }
  function countHit(res) {
    if (!CNT || res.counted) return;
    res.counted = true; store.set('last', res);
    api('/hit', { s: SITE.id, t: res.code }).then(function (r) {
      if (!r || typeof r.total !== 'number') return;
      res.ordinal = r.total; res.typeCount = r.types ? r.types[res.code] : null; res.totalAtHit = r.total; stats = r;
      store.set('last', res); store.set('cnt', r.total);
      if (current === 'result') renderBadges(res);
    });
  }

  /* ================= 结果页 ================= */
  function barHTML(k, p, withText) {
    var d = DL(k);
    return '<div class="bar-row"><div class="bar-top"><span>' + esc(d.loLabel) + '</span><b>' + esc(d.name) + ' ' + p + '%</b><span>' + esc(d.hiLabel) + '</span></div>' +
      '<div class="bar"><i style="background:' + DIMC[k] + '" data-w="' + p + '"></i></div>' + (withText ? '<p>' + esc(L.dimText[k][bucket(p)]) + '</p>' : '') + '</div>';
  }
  function shownOrd(res) { return res.ordinal ? res.ordinal + CBASE : 0; } // 和首页人数同一套数字
  function renderBadges(res) {
    var el = $('#rBadges'); if (!el) return;
    var h = '', c = C.counter || {}, ord = shownOrd(res);
    if (res.shiny) h += '<span class="badge badge-gold">' + t('badgeShiny') + '</span>';
    if (res.hidden) h += '<span class="badge badge-rare">' + t('badgeHidden') + '</span>';
    if (ord && ord <= (c.badgeLimit || 1000)) h += '<span class="badge badge-og">' + t('badgeOG', { n: ord }) + '</span>';
    else if (ord) h += '<span class="badge">' + t('badgeNth', { n: ord.toLocaleString(LANG === 'zh' ? 'zh-CN' : 'en-US') }) + '</span>';
    if (res.typeCount && res.totalAtHit >= (c.rarityFrom || 2000)) { var share = res.typeCount / res.totalAtHit * 100; h += '<span class="badge">' + t('badgeRare', { p: share.toFixed(1) }) + (share < 4 ? t('rare') : '') + '</span>'; }
    el.innerHTML = h; el.hidden = !h;
  }
  function eggTipsHTML() {
    if (!L.ui.tipsTitle) return '';
    var eg = eggsGot(), hf = store.get('hiddenFound', {}), todo = [];
    CORE.eggOrder.forEach(function (id) { if (!eg[id]) todo.push(EGG(id)); });
    CORE.hiddenOrder.forEach(function (h) { if (!hf[h]) todo.push(HID(h)); });
    var total = CORE.eggOrder.length + CORE.hiddenOrder.length, got = total - todo.length;
    if (!todo.length) return '';
    todo.sort(function () { return Math.random() - 0.5; });
    return '<div class="card rsec egg-tips"><h3 class="sec-title">' + t('tipsTitle') + '</h3><p class="muted small" style="margin:-6px 0 8px">' + t('tipsProgress', { a: got, b: total }) + '</p><ul class="tip-list">' +
      todo.slice(0, 4).map(function (x) { return '<li style="--tbg:' + x.bg + '">' + art(x.art, { cls: 'tip-art' }) + '<span>' + esc(x.hint) + '</span></li>'; }).join('') +
      '</ul><a class="more-link" href="#gallery">' + t('tipsMore') + '</a></div>';
  }
  function list(arr) { return '<ul>' + arr.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'; }
  function shown(res) { return res.hidden ? HID(res.hidden) : TY(res.code); }
  function renderResult(res) {
    var ty = TY(res.code), H = res.hidden ? HID(res.hidden) : null, S = H || ty;
    var el = $('#s-result'), chars = codeChars(res.code, res.c);
    document.title = t('titleResult', { breed: S.breed, nick: S.nick });
    var html = topbar({ back: 'home', backText: t('home'), title: SITE.name });
    // —— 主卡片（可截图）
    html += '<div class="r-hero card' + (res.shiny ? ' shiny' : '') + '" style="--tbg:' + S.bg + ';--tac:' + S.ac + '">' +
      '<span class="r-kicker">' + (H ? t('kickerHidden') : t('kicker')) + '</span>' +
      '<div class="r-art">' + art(S.art, { shiny: res.shiny }) + '</div>' +
      '<div class="r-code">' + (H ? '<span>?</span><span>?</span><span>?</span><span>?</span>' : chars.map(function (c, i) { return '<span' + (i === 4 ? ' class="mod"' : '') + '>' + esc(c) + '</span>'; }).join('')) + '</div>' +
      '<h1 class="r-breed">' + esc(S.breed) + '</h1><div class="r-nick">' + esc(S.nick) + '</div><p class="r-tagline">' + esc(S.tagline) + '</p>';
    if (!H) html += '<p class="r-mod"><b>' + esc(modLabel(res.c)) + '</b> · ' + esc(res.c === 'H' ? ty.cHi : ty.cLo) + '</p>';
    html += '<div class="r-badges" id="rBadges" hidden></div>';
    if (H) html += '<p class="r-also">' + esc(fmt(H.desc, { n: res.hiddenN })) + '<br>' + t('hiddenNearest', { b: esc(ty.breed + ' · ' + ty.nick) }) + '</p>';
    else if (res.alt) html += '<p class="r-also">' + t('also', { a: esc(ty.breed), b: esc(TY(res.alt).breed), dim: esc(DL(res.altDim).name) }) + '</p>';
    html += '<p class="hero-foot">' + t('heroFoot') + '</p></div>';
    // —— 立刻能分享
    html += '<div class="act-row"><button class="btn" id="mkCard" type="button">' + t('actShare') + '</button><button class="btn btn-mint" id="cpInvite" type="button">' + t('actInvite') + '</button></div>';
    if (inviter) html += pairBlockHTML(res.code, inviter.code, { compact: true, pa: res.pct, pb: inviter.pct, nameB: inviter.name });
    if (res.newEggsShown && res.newEggsShown.length) {
      html += '<div class="card rsec new-eggs"><h3 class="sec-title">' + t('newEggs') + '</h3><div class="egg-row">' +
        res.newEggsShown.map(function (id) { var e = EGG(id); return '<div class="egg-mini" style="--tbg:' + e.bg + '">' + art(e.art) + '<b>' + esc(e.name) + '</b><em>' + esc(e.nick) + '</em></div>'; }).join('') + '</div></div>';
      res.newEggsShown = []; store.set('last', res);
    }
    if (H && H.why) html += '<div class="card rsec why-card" style="--tbg:' + H.bg + '"><h3 class="sec-title">' + t('whyTitle') + '</h3><p>' + esc(H.why) + '</p><a class="more-link" href="#about" data-goto="hiddenWhy">' + t('whyMore') + '</a></div>';
    html += '<div class="card rsec desc" style="--tbg:' + ty.bg + '"><h3 class="sec-title">' + (H ? t('secDescNearest', { b: esc(ty.breed) }) : t('secDesc')) + '</h3>' +
      ty.desc.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '<div class="tags">' + ty.tags.map(function (g) { return '<span>#' + esc(g) + '</span>'; }).join('') + '</div></div>';
    html += '<div class="card rsec"><h3 class="sec-title">' + t('secSkills') + '</h3><div class="skills">' +
      ty.skills.map(function (s) { var m = /^(.*?)\s*(Lv\.\s*\S+)$/.exec(s); return '<div class="skill"><span>' + esc(m ? m[1] : s) + '</span><b>' + esc(m ? m[2] : '') + '</b></div>'; }).join('') + '</div></div>';
    html += '<div class="card rsec quote" style="--tbg:' + ty.bg + '">' + (LANG === 'zh' ? '“' : '"') + esc(ty.quote) + (LANG === 'zh' ? '”' : '"') + '<small>' + t('quoteBy', { b: esc(ty.breed) }) + '</small></div>';
    html += '<div class="two rsec"><div class="card"><h4>' + t('secPros') + '</h4>' + list(ty.pros) + '</div><div class="card"><h4>' + t('secCons') + '</h4>' + list(ty.cons) + '</div></div>';
    html += '<div class="card rsec"><h3 class="sec-title">' + t('secCircle') + '</h3><p class="muted small" style="margin:-6px 0 10px">' + t('circleSub') + '</p><div class="circle">' +
      CORE.circle.map(function (m) { var o = applyMask(res.code, m), to = TY(o); return '<a class="circle-card" href="#pair/' + res.code + '-' + o + '" style="--tbg:' + to.bg + '"><span class="tag">' + esc(L.rel[m].name) + '</span>' + art(to.art) + '<b>' + esc(to.breed) + '</b><em>' + t('pairScore') + ' ' + pairScore(res.code, o) + '</em></a>'; }).join('') +
      '</div><button class="btn btn-white btn-sm" id="rankBtn" type="button">' + t('rankBtn') + '</button></div>';
    html += '<div class="card rsec"><h3 class="sec-title">' + t('secDims') + '</h3><div class="bars">' + TK.map(function (k) { return barHTML(k, res.pct[k], true); }).join('') +
      '<div class="dim-human"><span class="chip">' + t('dimHuman') + '</span>' + barHTML(MD, res.pct[MD], true) + '<p class="muted small">' + t('dimHumanNote') + '</p></div></div></div>';
    var tabs = ['love', 'work', 'friends', 'stress', 'recharge', 'weekend'];
    html += '<div class="card rsec life"><h3 class="sec-title">' + t('secLife') + '</h3><div class="tabbar">' +
      tabs.map(function (k, i) { return '<button class="tab' + (i === 0 ? ' on' : '') + '" type="button" data-tab="' + k + '">' + L.ui.tabs[k] + '</button>'; }).join('') +
      '</div><p class="tab-body" id="tabBody">' + esc(ty.love) + '</p></div>';
    html += '<div class="card rsec growth" style="--tbg:' + ty.bg + '"><h3 class="sec-title">' + t('secGrowth') + '</h3><p>' + esc(ty.growth) + '</p></div>';
    html += '<div class="card rsec manual"><h3 class="sec-title">' + t('secManual', { b: esc(ty.breed) }) + '</h3><div class="two-in"><div><h4>✅ ' + t('manualDo') + '</h4>' + list(ty.tips) + '</div><div><h4>⛔ ' + t('manualDont') + '</h4>' + list(ty.peeves) + '</div></div>' +
      '<button class="btn btn-white btn-sm" id="cpManual" type="button">' + t('copyManual') + '</button></div>';
    html += eggTipsHTML();
    html += '<div class="card rsec share-box"><h3 class="sec-title">' + t('secShare') + '</h3><p>' + t('shareDesc') + '</p>' +
      '<input id="nickInput" maxlength="12" placeholder="' + esc(t('nickPh')) + '" value="' + esc(store.sget('nick', '')) + '">' +
      '<button class="btn btn-big" id="mkCard2" type="button" style="margin-top:12px">' + t('mkCard') + '</button>' +
      '<div class="btn-row"><button class="btn btn-white" id="cpInvite2" type="button">' + t('cpInvite') + '</button><button class="btn btn-mint" id="cpText" type="button">' + t('cpText') + '</button></div></div>';
    html += moreHTML() + followHTML();
    html += '<div class="btn-row rsec"><button class="btn btn-white" id="retake" type="button">' + t('retake') + '</button><a class="btn btn-pink" href="#gallery">' + t('seeAll') + '</a></div>';
    html += '<details class="card rsec refs-mini"><summary>' + t('refsTitle') + '</summary><p class="small">' + t('refsIntro') + ' <a href="#about">' + t('refsMore') + '</a></p><ol>' +
      CORE.refs.map(function (r) { return '<li>' + esc(r.cite) + (r.doi ? ' <a href="https://doi.org/' + r.doi + '" target="_blank" rel="noopener">doi:' + r.doi + '</a>' : '') + '</li>'; }).join('') + '</ol></details>';
    el.innerHTML = html;
    renderBadges(res);
    if (!eggDone(CORE.petEgg) && !store.sget('resHint', 0)) { store.sset('resHint', 1); setTimeout(function () { if (current === 'result' && window.scrollY < 200) hintAt($('#s-result .r-art .art'), t('hintPet')); }, 2600); }
    setTimeout(function () { $$('.bar i', el).forEach(function (i) { i.style.width = i.dataset.w + '%'; }); }, 120);
    $$('.tab', el).forEach(function (b) { b.addEventListener('click', function () { $$('.tab', el).forEach(function (x) { x.classList.toggle('on', x === b); }); $('#tabBody').textContent = ty[b.dataset.tab]; }); });
    $('#cpManual').addEventListener('click', function () {
      var txt = fmt(L.ui.manualText, { b: ty.breed, tips: ty.tips.map(function (x) { return '✅ ' + x; }).join('\n'), peeves: ty.peeves.map(function (x) { return '⛔ ' + x; }).join('\n'), url: inviteUrl(res, nick()) });
      copyText(txt).then(function (ok) { toast(ok ? t('copiedManual') : t('toastCopyFail'), 2000, true); }); track('share', 'manual');
    });
    $('#rankBtn').addEventListener('click', function () { openRank(res); });
    $('#nickInput').addEventListener('input', function () { store.sset('nick', this.value.trim()); });
    ['#mkCard', '#mkCard2'].forEach(function (id) { $(id).addEventListener('click', function () { openShare({ kind: 'single', res: res }); }); });
    ['#cpInvite', '#cpInvite2'].forEach(function (id) {
      $(id).addEventListener('click', function () { copyText(inviteUrl(res, nick())).then(function (ok) { toast(ok ? t('toastInvite') : t('toastCopyFail'), 2000, true); }); track('share', 'invite'); });
    });
    $('#cpText').addEventListener('click', function () { copyText(shareText(res)).then(function (ok) { toast(ok ? t('toastText') : t('toastCopyFail'), 2000, true); }); track('share', 'text'); });
    $('#retake').addEventListener('click', function () { store.del('progress'); startQuiz(true); });
    var sd = $('#sendDuo');
    if (sd) sd.addEventListener('click', function () {
      var u = inviteUrl(res, nick()) + '#pair/' + inviter.code + '-' + res.code;
      copyText(t('sharePairText', { cp: cpName(inviter.code, res.code), rel: L.rel[maskOf(inviter.code, res.code)].name, score: pairScore(inviter.code, res.code), url: u })).then(function (ok) { toast(ok ? t('toastDuo') : t('toastCopyFail'), 2200, true); });
      track('share', 'duo');
    });
  }
  function nick() { var n = $('#nickInput'); return n ? n.value.trim() : store.sget('nick', ''); }
  function shareText(res) {
    var s = shown(res), tg = s.tagline;
    if (LANG === 'zh') tg = tg.replace(/[。！？!?.…~～]+$/, '');
    else if (!endPunct(tg)) tg += '.';
    return t('shareText', { breed: s.breed, nick: s.nick, code: res.hidden ? '????' : codeStr(res.code, res.c), tagline: tg, url: inviteUrl(res, nick()) });
  }

  /* ================= 组合 ================= */
  function compareRows(a, b, pa, pb, la, lb) {
    return TK.map(function (k, i) {
      var d = DL(k);
      var p1 = pa ? clamp(pa[k]) : (a[i] === 'H' ? 75 : 25), p2 = pb ? clamp(pb[k]) : (b[i] === 'H' ? 75 : 25);
      if (Math.abs(p1 - p2) < 6) { p1 = Math.max(3, p1 - 3); p2 = Math.min(97, p2 + 3); }
      p1 = Math.max(3, Math.min(97, p1)); p2 = Math.max(3, Math.min(97, p2));
      return '<div class="bar-row"><div class="bar-top"><span>' + esc(d.loLabel) + '</span><b>' + esc(d.name) + '</b><span>' + esc(d.hiLabel) + '</span></div>' +
        '<div class="bar dots"><span class="dot b" style="left:' + p2 + '%">' + esc(lb) + '</span><span class="dot a" style="left:' + p1 + '%;background:' + DIMC[k] + '">' + esc(la) + '</span></div></div>';
    }).join('');
  }
  function roleLines(a, b, na, nb) {
    return TK.map(function (k, i) {
      var d = DL(k);
      if (a[i] !== b[i]) return '<li>' + fmt(t('roleLine'), { dim: '<b>' + esc(d.name) + '</b>', a: esc(na), b: esc(nb), ra: esc(a[i] === 'H' ? d.roleHi : d.roleLo), rb: esc(b[i] === 'H' ? d.roleHi : d.roleLo) }) + '</li>';
      return '<li>' + fmt(t('bothLine'), { dim: '<b>' + esc(d.name) + '</b>', both: esc(a[i] === 'H' ? d.bothHi : d.bothLo) }) + '</li>';
    }).join('');
  }
  function pairBlockHTML(a, b, o) {
    o = o || {};
    var ta = TY(a), tb = TY(b), m = maskOf(a, b), rel = L.rel[m], score = pairScore(a, b);
    var who = o.nameB || t('whoDefault');
    var na = o.compact || o.youA ? t('you') : ta.breed, nb = o.compact ? (o.nameB || t('them')) : tb.breed;
    if (a === b && !o.compact && !o.youA) { na = ta.breed + ' A'; nb = tb.breed + ' B'; }
    var h = '<div class="card rsec pair' + (o.compact ? '' : ' full') + '">';
    if (o.compact) h += '<h3 class="sec-title">' + t('secPair', { who: esc(who) }) + '</h3>';
    h += '<div class="pair-art">' + art(ta.art) + '<span class="x">×</span>' + art(tb.art) + '</div><p class="pair-who">' + esc(ta.breed) + ' × ' + esc(tb.breed) + '</p>' +
      '<div class="pair-cp">' + esc(cpName(a, b)) + '</div><div class="pair-name">' + esc(rel.name) + '</div>' +
      '<p class="pair-score">' + t('pairScore') + ' <b>' + score + '</b></p><p class="pair-sum">' + esc(rel.summary) + '</p>';
    if (o.full) h += '<div class="act-row"><button class="btn" id="mkPair" type="button">' + t('mkPairCard') + '</button><button class="btn btn-mint" id="cpPair" type="button">' + t('cpPair') + '</button></div>';
    h += '<h4>' + t('secWho') + '</h4><ul class="roles">' + roleLines(a, b, na, nb) + '</ul>';
    if (!o.compact) {
      h += '<h4>' + t('secDynamic') + '</h4><p>' + esc(rel.dynamic) + '</p><h4>' + t('secFriction') + '</h4><p>' + esc(rel.friction) + '</p>' +
        '<h4>' + t('secStrength') + '</h4><p>' + esc(rel.strength) + '</p><h4>' + t('secTipsPair') + '</h4>' + list(rel.tips) +
        '<h4>' + t('secTogether') + '</h4><div class="tags">' + rel.together.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>';
    }
    var la, lb;
    if (o.compact) { la = t('you'); lb = LANG === 'zh' ? 'TA' : (o.nameB ? o.nameB.slice(0, 4) : t('them')); }
    else if (a === b) { la = 'A'; lb = 'B'; }
    else { la = o.youA ? t('you') : ta.short; lb = tb.short; }
    h += '<h4>' + t('pairCompare') + '</h4><div class="bars">' + compareRows(a, b, o.pa, o.pb, la, lb) + '</div>';
    if (o.compact) h += '<div class="btn-row"><a class="btn btn-white" href="#pair/' + a + '-' + b + '">' + t('pairFull') + '</a><button class="btn btn-pink" id="sendDuo" type="button">' + t('sendDuo') + '</button></div>';
    return h + '</div>';
  }
  function renderPair(arg) {
    var el = $('#s-pair'), last = lastRes(), mine = last ? last.code : null;
    var m = /^([HL]{4})-([HL]{4})$/.exec(arg || '');
    var a = m ? m[1] : (/^[HL]{4}$/.test(arg) ? arg : mine), b = m ? m[2] : null;
    var html = topbar({ back: true, title: t('pairTitle') });
    html += '<h2 class="page-title">' + t('pickTitle') + '</h2><div class="slots">' + slotHTML('A', a, mine) + '<span class="x">×</span>' + slotHTML('B', b, mine) + '</div>';
    if (a && b) {
      var youA = !!(last && a === mine);
      html += pairBlockHTML(a, b, { youA: youA, full: true, pa: youA ? last.pct : null, pb: inviter && inviter.code === b ? inviter.pct : null });
      if (!last) html += '<a class="btn btn-big" href="#quiz">' + t('pairStart') + '</a>';
      else html += '<button class="btn btn-big btn-white" id="invPair" type="button">' + t('invitePair') + '</button>';
      document.title = t('titlePair', { cp: cpName(a, b), score: pairScore(a, b) });
    }
    el.innerHTML = html;
    $$('.slot', el).forEach(function (s) { s.addEventListener('click', function (e) { if (e.target.closest('svg.art') && s.dataset.code) return; openPicker(s.dataset.slot, a, b); }); });
    if (a && b) {
      $('#mkPair').addEventListener('click', function () { openShare({ kind: 'pair', a: a, b: b }); });
      $('#cpPair').addEventListener('click', function () {
        var u = baseUrl() + '?l=' + LANG + '#pair/' + a + '-' + b;
        copyText(t('sharePairText', { cp: cpName(a, b), rel: L.rel[maskOf(a, b)].name, score: pairScore(a, b), url: u })).then(function (ok) { toast(ok ? t('toastPairLink') : t('toastCopyFail'), 2000, true); });
      });
      var ip = $('#invPair'); if (ip) ip.addEventListener('click', function () { copyText(inviteUrl(last, store.sget('nick', ''))).then(function (ok) { toast(ok ? t('toastInvite') : t('toastCopyFail'), 2000, true); }); });
    } else setTimeout(function () { if (current === 'pair' && $('#sheet').hidden) openPicker(!a ? 'A' : 'B', a, b); }, 300);
  }
  function slotHTML(slot, code, mine) {
    var ty = code ? TY(code) : null;
    return '<button class="slot" type="button" data-slot="' + slot + '" data-code="' + (code || '') + '" style="--tbg:' + (ty ? ty.bg : '#fff') + '">' +
      (ty ? art(ty.art) + '<b>' + esc(ty.breed) + '</b><em>' + (code === mine ? t('you') : t('pickOther')) + '</em>' : '<span class="slot-empty">?</span><b>' + (slot === 'A' ? t('pickA') : t('pickB')) + '</b><em>' + t('pickTap') + '</em>') + '</button>';
  }
  function openPicker(slot, a, b) {
    openSheet('<h3 class="sec-title">' + (slot === 'A' ? t('pickA') : t('pickB')) + '</h3><div class="picker">' +
      CODES.map(function (c) { var ty = TY(c); return '<button class="pick" type="button" data-code="' + c + '" style="--tbg:' + ty.bg + '" data-noreact>' + art(ty.art) + '<b>' + esc(ty.breed) + '</b></button>'; }).join('') + '</div>',
      function (body) {
        $$('.pick', body).forEach(function (p) {
          p.addEventListener('click', function () {
            var na = slot === 'A' ? p.dataset.code : a, nb = slot === 'B' ? p.dataset.code : b;
            $('#sheet').hidden = true; document.body.style.overflow = '';
            var url = location.pathname + location.search + '#pair/' + (na && nb ? na + '-' + nb : (na || ''));
            if (sheetPushed) { sheetPushed = false; history.replaceState(null, '', url); } else history.replaceState(null, '', url);
            route(true);
          });
        });
      });
  }
  function openRank(res) {
    var mine = res.code, rows = CODES.map(function (c) { return { c: c, s: pairScore(mine, c) }; }).sort(function (x, y) { return y.s - x.s; });
    openSheet('<h3 class="sec-title">' + t('rankTitle') + '</h3><p class="muted small">' + t('rankSub') + '</p><div class="rank">' +
      rows.map(function (r, i) { var ty = TY(r.c); return '<a class="rank-row" href="#pair/' + mine + '-' + r.c + '" data-close data-noreact><span class="rk">' + (i + 1) + '</span>' + art(ty.art) + '<span class="rn"><b>' + esc(ty.breed) + '</b><em>' + esc(L.rel[maskOf(mine, r.c)].name) + '</em></span><span class="rs">' + r.s + '</span></a>'; }).join('') + '</div>');
  }

  /* ================= 分享图 ================= */
  var FONT = '"PingFang SC", "Hiragino Sans GB", -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", "HarmonyOS Sans SC", "MiSans", "Microsoft YaHei", "Noto Sans CJK SC", system-ui, sans-serif';
  function F(w, s) { return w + ' ' + s + 'px ' + FONT; }
  function loadScript(src) { return new Promise(function (ok, no) { var s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); }); }
  function svgImage(svgStr, size) {
    return new Promise(function (ok, no) {
      var img = new Image(); img.onload = function () { ok(img); }; img.onerror = no;
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr.replace('<svg ', '<svg width="' + size + '" height="' + size + '" '));
    });
  }
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  var NOSTART = '，。、；：！？）」』”’》…—,.;:!?)';
  function wrap(ctx, text, maxW) {
    var words = LANG === 'en' ? text.split(/(\s+)/) : text.split(''), lines = [], line = '';
    words.forEach(function (w) {
      var test = line + w;
      if (ctx.measureText(test).width > maxW && line.trim() && NOSTART.indexOf(w) < 0) { lines.push(line.trim()); line = w.trim() ? w : ''; } else line = test;
    });
    if (line.trim()) lines.push(line.trim());
    return lines;
  }
  function wrapFit(ctx, text, maxW, maxLines, size, weight) {
    var s = size, lines;
    do { ctx.font = F(weight, s); lines = wrap(ctx, text, maxW); s -= 2; } while (lines.length > maxLines && s >= size - 6);
    if (lines.length > maxLines) { lines = lines.slice(0, maxLines); lines[maxLines - 1] = lines[maxLines - 1].replace(/.$/, '…'); }
    return { lines: lines, size: s + 2 };
  }
  function fit(ctx, text, maxW, size, weight) { var s = size; ctx.font = F(weight, s); while (ctx.measureText(text).width > maxW && s > 20) { s -= 2; ctx.font = F(weight, s); } return s; }
  var INK = '#2b211c';
  function dateStr() { return new Date().toLocaleDateString(LANG === 'zh' ? 'zh-CN' : 'en-US', LANG === 'zh' ? undefined : { month: 'short', day: 'numeric', year: 'numeric' }); }
  function cardBase(ctx, W, Hh, bg, header) {
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, Hh);
    ctx.fillStyle = 'rgba(43,33,28,.08)';
    for (var y = 12; y < Hh; y += 36) for (var x = 12 + ((y / 36) % 2) * 18; x < W; x += 36) { ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 7); ctx.fill(); }
    ctx.fillStyle = INK; ctx.textBaseline = 'alphabetic';
    ctx.font = F('900', 58); ctx.textAlign = 'left'; ctx.fillText(SITE.name, 64, 92);
    ctx.font = F('700', 28); ctx.textAlign = 'right'; ctx.fillText(header + ' · ' + dateStr(), W - 64, 88);
    ctx.fillStyle = INK; rr(ctx, 74, 142, 960, 1110, 50); ctx.fill();
    ctx.fillStyle = '#fffdf8'; rr(ctx, 60, 128, 960, 1110, 50); ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = INK; rr(ctx, 60, 128, 960, 1110, 50); ctx.stroke();
  }
  function pill(ctx, text, cx, y, h, fill, font, color) {
    ctx.font = font; var w = ctx.measureText(text).width + h * 0.9;
    ctx.fillStyle = fill; rr(ctx, cx - w / 2, y, w, h, h / 2); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
    ctx.fillStyle = color || INK; ctx.textAlign = 'center'; ctx.fillText(text, cx, y + h * 0.68);
  }
  function chips(ctx, items, cy, bg, maxW) {
    var size = 26, rows;
    function layout() {
      ctx.font = F('800', size); var ws = items.map(function (x) { return ctx.measureText(x).width + 36; });
      rows = [[]]; var cur = 0;
      ws.forEach(function (w, i) { if (cur + w > maxW && rows[rows.length - 1].length) { rows.push([]); cur = 0; } rows[rows.length - 1].push([items[i], w]); cur += w + 12; });
    }
    layout(); while (rows.length > 2 && size > 18) { size -= 2; layout(); }
    rows.slice(0, 2).forEach(function (row, r) {
      var tot = row.reduce(function (s, x) { return s + x[1] + 12; }, -12), x0 = 540 - tot / 2, y = cy + r * (size + 26);
      row.forEach(function (it) {
        ctx.fillStyle = bg; rr(ctx, x0, y, it[1], size + 16, (size + 16) / 2); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
        ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText(it[0], x0 + it[1] / 2, y + size + 2); x0 += it[1] + 12;
      });
    });
  }
  function footer(ctx, W, url, withQr) {
    ctx.textAlign = 'left';
    if (withQr && window.qrcode) {
      var qr = window.qrcode(0, 'L'); qr.addData(url); qr.make();
      var n = qr.getModuleCount(), qs = 168, qx = 60, qy = 1258, cell = qs / n;
      ctx.fillStyle = INK; rr(ctx, qx - 4, qy - 4, qs + 20, qs + 20, 18); ctx.fill();
      ctx.fillStyle = '#fff'; rr(ctx, qx - 10, qy - 10, qs + 20, qs + 20, 18); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
      ctx.fillStyle = INK;
      for (var r = 0; r < n; r++) for (var q = 0; q < n; q++) if (qr.isDark(r, q)) ctx.fillRect(qx + q * cell, qy + r * cell, Math.ceil(cell), Math.ceil(cell));
      fit(ctx, t('scanTitle'), 740, 44, '900'); ctx.fillText(t('scanTitle'), 264, 1312);
      ctx.font = F('600', 28); ctx.fillStyle = '#4a3c34';
      ctx.fillText(t('scanSub'), 264, 1358); ctx.fillText(t('scanSite'), 264, 1400);
    } else {
      ctx.textAlign = 'center'; fit(ctx, t('noQrTitle'), 940, 44, '900'); ctx.fillStyle = INK; ctx.fillText(t('noQrTitle'), W / 2, 1322);
      ctx.font = F('600', 30); ctx.fillStyle = '#4a3c34'; ctx.fillText(t('noQrSub'), W / 2, 1376);
    }
  }
  function prep(withQr, svgs) {
    var q = withQr ? (window.qrcode ? Promise.resolve() : loadScript('assets/qrcode.min.js').catch(function () { })) : Promise.resolve();
    return Promise.all([q].concat(svgs.map(function (s) { return svgImage(s[0], s[1]); })));
  }
  function drawSingle(res, withQr) {
    var ty = TY(res.code), H = res.hidden ? HID(res.hidden) : null, S = H || ty;
    var W = 1080, Hh = 1440, cv = document.createElement('canvas'); cv.width = W; cv.height = Hh;
    var ctx = cv.getContext('2d');
    return prep(withQr, [[art(S.art, { shiny: res.shiny }), 600]]).then(function (arr) {
      cardBase(ctx, W, Hh, S.bg, t('cardHeader'));
      if (res.shiny) { ctx.lineWidth = 8; ctx.strokeStyle = '#e0a800'; rr(ctx, 66, 134, 948, 1098, 46); ctx.stroke(); }
      var nm = nick();
      var kick = H ? t('cardKickerHidden') : (nm ? t('cardKickerNamed', { name: nm }) : t('cardKicker')) + ' · ' + modLabel(res.c);
      pill(ctx, kick, W / 2, 160, 54, S.bg, F('800', 30));
      ctx.drawImage(arr[1], W / 2 - 215, 222, 430, 430);
      var cs = H ? ['?', '?', '?', '?'] : codeChars(res.code, res.c), bw = 70, gap = 14, total = cs.length * bw + (cs.length - 1) * gap, sx = W / 2 - total / 2;
      cs.forEach(function (c, i) {
        var bx = sx + i * (bw + gap), by = 660;
        ctx.fillStyle = INK; rr(ctx, bx + 4, by + 4, bw, bw, 18); ctx.fill();
        ctx.fillStyle = i === 4 ? '#ffe9a8' : '#fff'; rr(ctx, bx, by, bw, bw, 18); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
        ctx.fillStyle = INK; ctx.font = F('800', 40); ctx.textAlign = 'center'; ctx.fillText(c, bx + bw / 2, by + 50);
      });
      ctx.textAlign = 'center'; ctx.fillStyle = INK; fit(ctx, S.breed, 860, 96, '900'); ctx.fillText(S.breed, W / 2, 836);
      ctx.font = F('800', 46); var nw = ctx.measureText(S.nick).width + 70;
      ctx.fillStyle = INK; rr(ctx, W / 2 - nw / 2 + 5, 866, nw, 74, 37); ctx.fill();
      ctx.fillStyle = S.ac; rr(ctx, W / 2 - nw / 2, 860, nw, 74, 37); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.fillText(S.nick, W / 2, 912);
      var tf = wrapFit(ctx, S.tagline, 840, 2, 34, '700'); ctx.fillStyle = '#4a3c34';
      tf.lines.forEach(function (l, i) { ctx.fillText(l, W / 2, 996 + i * (tf.size + 12)); });
      if (!H) chips(ctx, ty.tags.slice(0, 3).map(function (g) { return '#' + g; }), 1050 + (tf.lines.length - 1) * 40, S.bg, 880);
      var y0 = H ? 1060 : 1124 + (tf.lines.length - 1) * 30;
      TK.forEach(function (k, i) {
        var col = i % 2, row = Math.floor(i / 2), bx = 110 + col * 440, yy = y0 + row * 44, p = res.pct[k];
        ctx.font = F('800', 24); ctx.textAlign = 'left'; ctx.fillStyle = INK; ctx.fillText(DL(k).name, bx, yy + 20);
        var lw = LANG === 'zh' ? 62 : 136, tx = bx + lw, tw = 300 - lw;
        ctx.fillStyle = '#fff'; rr(ctx, tx, yy, tw, 24, 12); ctx.fill();
        ctx.save(); rr(ctx, tx, yy, tw, 24, 12); ctx.clip(); ctx.fillStyle = DIMC[k]; ctx.fillRect(tx, yy, tw * p / 100, 24); ctx.restore();
        ctx.lineWidth = 3; ctx.strokeStyle = INK; rr(ctx, tx, yy, tw, 24, 12); ctx.stroke();
        ctx.font = F('800', 22); ctx.fillStyle = INK; ctx.fillText(p + '%', tx + tw + 10, yy + 20);
      });
      var stamps = []; if (res.shiny) stamps.push([t('badgeShiny').replace('✦ ', ''), '#ffd45c']); if (H) stamps.push([t('badgeHidden'), '#a99bff']);
      var c = C.counter || {}, ord = shownOrd(res); if (ord && ord <= (c.badgeLimit || 1000)) stamps.push([t('badgeOG', { n: ord }), '#79dcc8']);
      stamps.forEach(function (s, i) {
        ctx.save(); ctx.translate(i % 2 ? 200 : W - 200, 300 + Math.floor(i / 2) * 110); ctx.rotate(i % 2 ? -0.2 : 0.2);
        ctx.font = F('900', 34); var sw = ctx.measureText(s[0]).width + 46;
        ctx.fillStyle = s[1]; rr(ctx, -sw / 2, -34, sw, 68, 20); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
        ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText(s[0], 0, 12); ctx.restore();
      });
      footer(ctx, W, inviteUrl(res, '', true), withQr);
      return cv.toDataURL('image/png');
    });
  }
  function drawPair(a, b, withQr) {
    var ta = TY(a), tb = TY(b), m = maskOf(a, b), rel = L.rel[m], score = pairScore(a, b);
    var W = 1080, Hh = 1440, cv = document.createElement('canvas'); cv.width = W; cv.height = Hh;
    var ctx = cv.getContext('2d');
    return prep(withQr, [[art(ta.art), 400], [art(tb.art), 400]]).then(function (arr) {
      cardBase(ctx, W, Hh, ta.bg, t('pairCardHeader'));
      pill(ctx, t('pairKicker'), W / 2, 160, 54, tb.bg, F('800', 30));
      ctx.drawImage(arr[1], W / 2 - 400, 236, 340, 340); ctx.drawImage(arr[2], W / 2 + 60, 236, 340, 340);
      ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.font = F('900', 72); ctx.fillText('×', W / 2, 430);
      fit(ctx, ta.breed, 400, 34, '800'); ctx.fillText(ta.breed, W / 2 - 230, 616); fit(ctx, tb.breed, 400, 34, '800'); ctx.fillText(tb.breed, W / 2 + 230, 616);
      fit(ctx, cpName(a, b), 860, 92, '900'); ctx.fillText(cpName(a, b), W / 2, 730);
      pill(ctx, rel.name, W / 2, 760, 74, ta.ac, F('800', 42), '#fff');
      ctx.font = F('800', 34); ctx.fillStyle = INK; ctx.fillText(t('pairScore'), W / 2 - 90, 920);
      ctx.font = F('900', 104); ctx.fillStyle = '#e04f86'; ctx.fillText(String(score), W / 2 + 90, 940);
      var wf = wrapFit(ctx, rel.summary, 840, 4, 30, '600'); ctx.fillStyle = '#4a3c34';
      wf.lines.forEach(function (l, i) { ctx.fillText(l, W / 2, 1000 + i * (wf.size + 12)); });
      chips(ctx, rel.together, 1162, tb.bg, 900);
      var last = lastRes();
      footer(ctx, W, last ? inviteUrl(last, '', true) : baseUrl(), withQr);
      return cv.toDataURL('image/png');
    });
  }
  function openShare(o) {
    track('share', o.kind);
    var qrOn = isWeChat || !noQrDefault;
    openSheet('<h3 class="sec-title">' + (o.kind === 'pair' ? t('pairCardTitle') : t('cardTitle')) + '</h3><div id="cardWrap" class="card-wrap"><p class="muted">' + t('drawing') + '</p></div>' +
      '<label class="toggle"><input type="checkbox" id="qrToggle"' + (qrOn ? ' checked' : '') + '> ' + t('qrToggle') + '</label>' +
      '<p class="share-tip">' + (inApp ? t('longPress') : t('longPressOr')) + '</p>' +
      (inApp ? '' : '<div class="btn-row"><button class="btn btn-white" id="dlBtn" type="button">' + t('save') + '</button><button class="btn btn-mint" id="sysShare" type="button">' + t('sysShare') + '</button></div>'),
      function (body) {
        var cur = '';
        function paint() {
          (o.kind === 'pair' ? drawPair(o.a, o.b, $('#qrToggle', body).checked) : drawSingle(o.res, $('#qrToggle', body).checked)).then(function (url) {
            cur = url; $('#cardWrap', body).innerHTML = '<img class="share-img" src="' + url + '" alt="' + SITE.name + '">';
          }).catch(function () { $('#cardWrap', body).innerHTML = '<p>' + t('failCard') + '</p>'; });
        }
        paint(); $('#qrToggle', body).addEventListener('change', paint);
        var dl = $('#dlBtn', body);
        if (dl) dl.addEventListener('click', function () { if (!cur) return; var a = document.createElement('a'); a.href = cur; a.download = SITE.name + '.png'; document.body.appendChild(a); a.click(); a.remove(); track('share', 'download'); });
        var ss = $('#sysShare', body);
        if (ss) ss.addEventListener('click', function () {
          if (!cur) return;
          var text = o.kind === 'pair' ? t('sharePairText', { cp: cpName(o.a, o.b), rel: L.rel[maskOf(o.a, o.b)].name, score: pairScore(o.a, o.b), url: baseUrl() + '?l=' + LANG + '#pair/' + o.a + '-' + o.b }) : shareText(o.res);
          fetch(cur).then(function (r) { return r.blob(); }).then(function (blob) {
            var file = new File([blob], SITE.name + '.png', { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) return navigator.share({ files: [file], text: text });
            if (navigator.share) return navigator.share({ title: SITE.name, text: text });
            return copyText(text).then(function () { toast(t('toastText'), 2000, true); });
          }).catch(function () { });
          track('share', 'system');
        });
      });
  }

  /* ================= 图鉴 ================= */
  function renderGallery() {
    var el = $('#s-gallery'), last = lastRes(), me = last && !last.hidden ? last.code : null;
    var met = store.get('met', {}), hf = store.get('hiddenFound', {}), eg = eggsGot();
    var nMine = CODES.filter(function (c) { return met[c] === 'y'; }).length;
    var nHid = CORE.hiddenOrder.filter(function (h) { return hf[h]; }).length, nEgg = CORE.eggOrder.filter(function (e) { return eg[e]; }).length;
    var got = nMine + nHid + nEgg, all = CODES.length + CORE.hiddenOrder.length + CORE.eggOrder.length;
    var html = topbar({ back: true, title: t('navGallery') });
    html += '<h2 class="page-title">' + t('galTitle') + '</h2><p class="page-sub">' + t('galSub') + '</p>';
    html += '<div class="progress-card card"><div>' + t('galProgress', { a: got, b: all }) + '</div><div class="pbar2"><i style="width:' + Math.round(got / all * 100) + '%"></i></div></div>';
    html += comboEntry(SITE.combo2);
    html += '<h3 class="gal-h">' + t('galTypes') + ' <span>' + nMine + '/' + CODES.length + '</span></h3><p class="muted small">' + t('galMetHint') + '</p>';
    html += '<div class="legend">' + TK.map(function (k) { var d = DL(k); return '<span>' + d.hi + ' / ' + d.lo + ' · ' + d.name + '</span>'; }).join('') + '</div><div class="gallery">';
    html += CODES.map(function (c) {
      var ty = TY(c), mk = met[c];
      return '<div class="g-card' + (c === me ? ' me' : '') + '" data-code="' + c + '" style="--tbg:' + ty.bg + '"' + (c === me ? ' data-me="' + esc(t('youAreHere')) + '"' : '') + '>' +
        (mk ? '<span class="stamp' + (mk === 'f' ? ' f' : '') + '">' + (mk === 'f' ? t('metFriend') : t('met')) + '</span>' : '') + art(ty.art) +
        '<b>' + esc(ty.breed) + '</b><em>' + esc(ty.nick) + '</em><span class="code">' + codeChars(c).join('') + '</span></div>';
    }).join('') + '</div>';
    // 隐藏款、彩蛋：名字和解锁方法都直接写出来；解锁后盖章、换成昵称
    function specialCard(kind, id) {
      var x = kind === 'hidden' ? HID(id) : EGG(id), ok = kind === 'hidden' ? !!hf[id] : !!eg[id];
      return '<div class="g-card' + (ok ? '' : ' locked') + '" data-' + kind + '="' + id + '" style="--tbg:' + x.bg + '">' + (ok ? '<span class="stamp">' + t('unlocked') + '</span>' : '') + art(x.art) +
        '<b>' + esc(kind === 'hidden' ? x.breed : x.name) + '</b><em>' + esc(ok ? x.nick : howTo(x)) + '</em></div>';
    }
    html += '<h3 class="gal-h">' + t('galHidden') + ' <span>' + nHid + '/' + CORE.hiddenOrder.length + '</span></h3><p class="muted small gal-intro">' + t('galHiddenSub') +
      ' <a class="more-link" href="#about" data-goto="hiddenWhy">' + t('galHiddenWhy') + '</a></p><div class="gallery">';
    html += CORE.hiddenOrder.map(function (h) { return specialCard('hidden', h); }).join('') + '</div>';
    html += '<h3 class="gal-h">' + t('galEggs') + ' <span>' + nEgg + '/' + CORE.eggOrder.length + '</span></h3><p class="muted small gal-intro">' + t('galEggsSub') + '</p><div class="gallery">';
    html += CORE.eggOrder.map(function (id) { return specialCard('egg', id); }).join('') + '</div>';
    html += moreHTML();
    el.innerHTML = html;
    $$('.g-card[data-code]', el).forEach(function (g) { g.addEventListener('click', function (e) { if (e.target.closest('svg.art')) return; openType(g.dataset.code); }); });
    $$('.g-card[data-hidden]', el).forEach(function (g) { g.addEventListener('click', function (e) { if (e.target.closest('svg.art')) return; openSpecial('hidden', g.dataset.hidden); }); });
    $$('.g-card[data-egg]', el).forEach(function (g) { g.addEventListener('click', function (e) { if (e.target.closest('svg.art')) return; openSpecial('egg', g.dataset.egg); }); });
  }
  function howTo(x) { var s = String(x.hint || '').replace(/^(提示[:：]\s*|Hint:\s*)/i, ''); return s.charAt(0).toUpperCase() + s.slice(1); }
  function openSpecial(kind, id) {
    var H = kind === 'hidden', x = H ? HID(id) : EGG(id), ok = H ? !!store.get('hiddenFound', {})[id] : !!eggsGot()[id];
    openSheet('<div class="special' + (ok ? '' : ' locked') + '" style="--tbg:' + x.bg + '">' + art(x.art) +
      '<span class="r-kicker">' + t(H ? 'hiddenLocked' : 'eggLocked') + (ok ? ' · ' + t('unlocked') : '') + '</span>' +
      '<h3 class="page-title">' + esc(H ? x.breed : x.name) + '</h3>' +
      (ok ? '<div class="r-nick" style="--tac:' + x.ac + '">' + esc(x.nick) + '</div><p>' + esc(H ? x.tagline : x.desc) + '</p>' : '') +
      '<p class="how"><b>' + t('howLabel') + '</b>' + esc(howTo(x)) + '</p>' +
      (H ? '<p class="how"><b>' + t('whyLabel') + '</b>' + esc(x.why) + ' <a class="more-link" href="#about" data-goto="hiddenWhy">' + t('whyMore') + '</a></p>' : '<p class="how"><b>' + t('eggNoteLabel') + '</b>' + t('eggNote') + '</p>') +
      '</div>');
  }
  function openType(code) {
    var ty = TY(code); if (!ty) return;
    var best = TY(applyMask(code, CORE.circle[0])), rival = TY(applyMask(code, CORE.circle[2]));
    var last = lastRes(), mine = last ? last.code : null;
    openSheet('<div class="type-head" style="--tbg:' + ty.bg + '">' + art(ty.art) + '<div class="r-code">' + codeChars(code).map(function (c) { return '<span>' + c + '</span>'; }).join('') + '</div>' +
      '<h3 class="r-breed">' + esc(ty.breed) + '</h3><div class="r-nick" style="--tac:' + ty.ac + '">' + esc(ty.nick) + '</div><p class="r-tagline">' + esc(ty.tagline) + '</p></div>' +
      '<div class="desc">' + ty.desc.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>' +
      '<div class="tags" style="--tbg:' + ty.bg + '">' + ty.tags.map(function (g) { return '<span>#' + esc(g) + '</span>'; }).join('') + '</div>' +
      '<div class="two" style="margin-top:14px"><div class="card"><h4>' + t('secPros') + '</h4>' + list(ty.pros.slice(0, 3)) + '</div><div class="card"><h4>' + t('secCons') + '</h4>' + list(ty.cons.slice(0, 2)) + '</div></div>' +
      '<p class="small" style="margin-top:14px"><b>' + t('bestMatch') + colon() + '</b>' + esc(best.breed) + ' · ' + esc(best.nick) + '<br><b>' + t('rival') + colon() + '</b>' + esc(rival.breed) + ' · ' + esc(rival.nick) + '</p>' +
      (mine ? '<a class="btn btn-white" href="#pair/' + mine + '-' + code + '" data-close>' + t('viewDuo') + '</a>' : '') +
      '<a class="btn" href="#quiz" data-close>' + t('tryType', { b: esc(ty.breed) }) + '</a>');
  }

  /* ================= 科学依据 ================= */
  function renderAbout() {
    var el = $('#s-about'); if (el.getAttribute('data-rl') === LANG) return; el.setAttribute('data-rl', LANG);
    var A = L.about;
    el.innerHTML = topbar({ back: true, title: t('navAbout') }) + '<div class="about"><h2 class="page-title">' + A.title + '</h2><p class="page-sub">' + A.sub + '</p>' +
      '<div class="card"><h3>' + A.s1t + '</h3><p>' + A.s1b + '</p><div class="dim-grid">' +
      TK.concat([MD]).map(function (k) { var d = DL(k); return '<div><b>' + d.name + paren(d.hi + ' / ' + d.lo) + '</b>' + esc(d.sci) + '<br><span class="muted">' + esc(d.hiLabel) + ' ↔ ' + esc(d.loLabel) + '</span></div>'; }).join('') +
      '</div><p>' + A.s1f + '</p></div>' +
      '<div class="card fun-fact"><h3>' + A.s2t + '</h3><p>' + A.s2b + '</p></div>' +
      '<div class="card"><h3>' + A.s3t + '</h3><ul>' + A.s3l.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>' +
      '<div class="card"><h3>' + A.s4t + '</h3><p>' + A.s4b + '</p></div>' +
      '<div class="card" id="hiddenWhy"><h3>' + A.s5t + '</h3><p>' + A.s5b + '</p>' + (A.s5l ? '<ul>' + A.s5l.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' : '') + '</div>' +
      '<div class="card" id="privacy"><h3>' + A.pt + '</h3><p>' + A.pb + '</p></div>' +
      '<div class="card"><h3>' + A.rt + '</h3><ol class="refs">' + CORE.refs.map(function (r, i) {
        return '<li><span class="cite">' + esc(r.cite) + (r.doi ? ' <a href="https://doi.org/' + r.doi + '" target="_blank" rel="noopener">https://doi.org/' + r.doi + '</a>' : '') + '</span><span class="note">' + esc(L.refNotes[i]) + '</span></li>';
      }).join('') + '</ol></div>' +
      '<div class="card"><h3>' + A.ct + '</h3><p>' + A.cb + '</p></div>' + moreHTML() +
      '<button class="btn btn-big" id="aboutStart" type="button">' + t('start') + '</button></div>';
    $('#aboutStart').addEventListener('click', function () { startQuiz(false); });
  }
  document.addEventListener('click', function (e) {
    var g = e.target.closest('[data-goto]');
    if (g) setTimeout(function () { var x = document.getElementById(g.dataset.goto); if (x) x.scrollIntoView({ behavior: 'smooth' }); }, 150);
  });

  /* ================= 语言 & 启动 ================= */
  function detectLang() {
    var q = null; try { q = new URLSearchParams(location.search).get('l'); } catch (e) { }
    if (q === 'zh' || q === 'en') return q;
    var s = store.get('lang', null); if (s === 'zh' || s === 'en') return s;
    var n = (navigator.languages && navigator.languages[0]) || navigator.language || 'zh';
    return /^zh/i.test(n) ? 'zh' : 'en';
  }
  function loadLang(l) {
    if (window.TI_LANG && window.TI_LANG[l]) return Promise.resolve();
    return loadScript('assets/lang-' + l + '.js?v=' + SITE.version);
  }
  function applyLang(l) { LANG = l; L = window.TI_LANG[l]; document.documentElement.lang = l === 'zh' ? 'zh-CN' : 'en'; document.title = t('siteTitle'); }
  function switchLang(l) {
    loadLang(l).then(function () {
      applyLang(l); store.set('lang', l);
      if (CORE.eggTriggers.lang) setTimeout(function () { unlockEgg(CORE.eggTriggers.lang); }, 400);
      try { var q = new URLSearchParams(location.search); q.set('l', l); history.replaceState(history.state, '', location.pathname + '?' + q.toString() + location.hash); } catch (e) { }
      $('#s-about').removeAttribute('data-rl'); $('#s-quiz').removeAttribute('data-rl');
      route(true);
    }).catch(function () { });
  }
  if (C.baiduTongjiId) {
    window._hmt = window._hmt || [];
    var hm = document.createElement('script'); hm.src = 'https://hm.baidu.com/hm.js?' + C.baiduTongjiId; hm.async = true; document.head.appendChild(hm);
  }
  try { console.log('%c ' + (CORE.consoleArt || '∪･ω･∪') + '  ' + SITE.name, 'font-size:14px;color:#e8711f;font-weight:bold'); } catch (e) { }
  window.__ti = { compute: compute, pairScore: pairScore, maskOf: maskOf, applyMask: applyMask };
  function boot(l) { applyLang(l); parseInvite(); var sk = $('#skeleton'); if (sk) sk.remove(); route(true); }
  var startLang = detectLang();
  loadLang(startLang).then(function () { boot(startLang); }, function () {
    loadLang('zh').then(function () { boot('zh'); }, function () { var sk = $('#skeleton'); if (sk) sk.classList.add('fail'); });
  });
})();
