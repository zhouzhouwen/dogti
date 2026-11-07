/* DOGTI 主程序 */
(function () {
  'use strict';
  var D = window.DOGTI_DATA, C = window.DOGTI_CONFIG || {}, Art = window.DogArt;
  var DIMS = D.dims, ITEMS = D.items, N_ITEMS = ITEMS.length;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------- 小工具 ---------------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem('dogti:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('dogti:' + k, JSON.stringify(v)); } catch (e) { } },
    sget: function (k, d) { try { var v = sessionStorage.getItem('dogti:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    sset: function (k, v) { try { sessionStorage.setItem('dogti:' + k, JSON.stringify(v)); } catch (e) { } }
  };
  var toastTimer;
  function toast(msg, ms) {
    var t = $('#toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('on'); }, ms || 2200);
  }
  var PAW = '<svg viewBox="0 0 40 40" width="26" height="26"><g fill="FILL" stroke="#2b211c" stroke-width="2.6"><ellipse cx="20" cy="27" rx="9" ry="7.5"/><ellipse cx="9" cy="17" rx="4" ry="5"/><ellipse cx="16" cy="10" rx="4" ry="5"/><ellipse cx="24" cy="10" rx="4" ry="5"/><ellipse cx="31" cy="17" rx="4" ry="5"/></g></svg>';
  function confetti(n, colors) {
    var fx = $('#fx'); colors = colors || ['#ffd65c', '#ff8fb3', '#79dcc8', '#a99bff', '#ff9b4a'];
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for (var i = 0; i < (n || 24); i++) {
      var el = document.createElement('i');
      el.innerHTML = PAW.replace('FILL', colors[i % colors.length]);
      el.style.left = (Math.random() * 100) + 'vw';
      el.style.animationDuration = (1.6 + Math.random() * 1.6) + 's';
      el.style.animationDelay = (Math.random() * 0.5) + 's';
      el.style.transform = 'scale(' + (0.7 + Math.random() * 0.7) + ')';
      fx.appendChild(el);
      setTimeout((function (e) { return function () { e.remove(); }; })(el), 4200);
    }
  }
  function copyText(txt) {
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = txt; ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
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
  var isWeChat = /MicroMessenger/i.test(navigator.userAgent);
  function baseUrl() { return C.siteUrl || (location.origin + location.pathname); }

  /* ---------------- 弹层 ---------------- */
  function openSheet(html, onOpen) {
    $('#sheetBody').innerHTML = html; $('#sheet').hidden = false;
    document.body.style.overflow = 'hidden';
    if (onOpen) onOpen($('#sheetBody'));
  }
  function closeSheet() { $('#sheet').hidden = true; document.body.style.overflow = ''; }
  document.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) closeSheet(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(); });

  /* ---------------- 计分 ---------------- */
  function typeOf(code) { return D.types[code]; }
  function flip(code, which) {
    var s = code.split('');
    which.split('').forEach(function (k) { var i = 'EANO'.indexOf(k); s[i] = s[i] === 'H' ? 'L' : 'H'; });
    return s.join('');
  }
  function compute(ans) {
    var sums = { E: 0, A: 0, N: 0, O: 0 }, max = { E: 0, A: 0, N: 0, O: 0 }, neutral = 0;
    ITEMS.forEach(function (it, i) { var v = ans[i] - 3; if (v === 0) neutral++; sums[it.d] += it.k * v; max[it.d] += 2; });
    var pct = {}, code = '';
    DIMS.forEach(function (d) {
      var k = d.key, s = sums[k];
      pct[k] = Math.round((s + max[k]) / (2 * max[k]) * 100);
      var pole = s > 0 ? 'H' : s < 0 ? 'L' : null;
      if (!pole) { // 平分：按该维度题目顺序，取第一道有倾向的作答决定
        for (var i = 0; i < N_ITEMS && !pole; i++) {
          if (ITEMS[i].d === k && ans[i] !== 3) pole = ITEMS[i].k * (ans[i] - 3) > 0 ? 'H' : 'L';
        }
        pole = pole || 'H';
      }
      code += pole;
    });
    var near = DIMS.filter(function (d) { return Math.abs(sums[d.key]) <= 1; })
      .sort(function (a, b) { return Math.abs(sums[a.key]) - Math.abs(sums[b.key]); });
    var altDim = near.length ? near[0].key : null;
    return {
      code: code, sums: sums, pct: pct, neutral: neutral,
      alt: altDim ? flip(code, altDim) : null, altDim: altDim,
      hidden: neutral >= D.hidden.minNeutral,
      shiny: Math.random() < (C.shinyRate || 0.02),
      ts: Date.now()
    };
  }
  function bucket(p) { return p <= 20 ? 0 : p <= 41 ? 1 : p <= 58 ? 2 : p <= 79 ? 3 : 4; }
  function dimByKey(k) { for (var i = 0; i < DIMS.length; i++) if (DIMS[i].key === k) return DIMS[i]; }
  function codeChars(code) { return code.split('').map(function (c, i) { return c === 'H' ? DIMS[i].hi : DIMS[i].lo; }); }

  /* ---------------- 好友邀请（配对） ---------------- */
  var inviter = null;
  (function parseInvite() {
    try {
      var q = new URLSearchParams(location.search), f = q.get('f');
      if (f) {
        var m = /^([HL]{4})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(f);
        if (m && typeOf(m[1])) {
          inviter = { code: m[1], pct: { E: +m[2], A: +m[3], N: +m[4], O: +m[5] }, name: (q.get('n') || '').slice(0, 12) };
          store.sset('inviter', inviter);
        }
      } else inviter = store.sget('inviter', null);
    } catch (e) { }
  })();
  function inviteUrl(res, name) {
    var p = res.pct, f = [res.code, p.E, p.A, p.N, p.O].join('.');
    return baseUrl() + '?f=' + f + (name ? '&n=' + encodeURIComponent(name) : '');
  }
  function relation(a, b) {
    if (a === b) return 'same';
    if (flip(a, 'EN') === b) return 'best';
    if (flip(a, 'AO') === b) return 'rival';
    var m = 0; for (var i = 0; i < 4; i++) if (a[i] === b[i]) m++;
    return 'm' + m;
  }

  /* ---------------- 真实计数（可选） ---------------- */
  var CNT = ((C.counter && C.counter.api) || '').replace(/\/+$/, '');
  function api(path, body) {
    if (!CNT || !window.fetch) return Promise.resolve(null);
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 3500);
    var opt = { signal: ctrl ? ctrl.signal : undefined };
    if (body) { opt.method = 'POST'; opt.headers = { 'Content-Type': 'text/plain;charset=UTF-8' }; opt.body = JSON.stringify(body); }
    return fetch(CNT + path, opt).then(function (r) { clearTimeout(timer); return r.ok ? r.json() : null; })
      .catch(function () { clearTimeout(timer); return null; });
  }

  /* ---------------- 路由 ---------------- */
  var SCREENS = ['home', 'quiz', 'loading', 'result', 'gallery', 'about'];
  function show(name) {
    SCREENS.forEach(function (s) { var el = $('#s-' + s); if (el) el.classList.toggle('on', s === name); });
    window.scrollTo(0, 0);
  }
  var lastRoute = '', lastRouteT = 0;
  function route() {
    var h = (location.hash || '').replace('#', ''), now = Date.now();
    if (h === lastRoute && now - lastRouteT < 120) return; // popstate 与 hashchange 可能连续触发
    lastRoute = h; lastRouteT = now;
    if (!$('#sheet').hidden) closeSheet();
    if (h === 'quiz') { if (!Q.ans) startQuiz(true); else { show('quiz'); renderQ(false); } }
    else if (h === 'result') { var r = store.get('last', null); if (r && typeOf(r.code)) { renderResult(r); show('result'); } else go('home', true); }
    else if (h === 'gallery') { renderGallery(); show('gallery'); }
    else if (h === 'about') { renderAbout(); show('about'); }
    else { renderHome(); show('home'); }
  }
  function go(name, replace) {
    var url = location.pathname + location.search + (name === 'home' ? '' : '#' + name);
    if (replace) history.replaceState(null, '', url); else history.pushState(null, '', url);
    lastRoute = ''; route();
  }
  window.addEventListener('popstate', route);
  window.addEventListener('hashchange', route);

  /* ---------------- 首页 ---------------- */
  var petCount = 0;
  var PET_LINES = ['汪？', '再摸一下～', '摸摸头，烦恼都没啦', '尾巴已经摇成螺旋桨了', '你是不是很喜欢小狗', '我要开始撒娇了哦'];
  function renderHome() {
    var hd = $('#heroDogs');
    if (!hd.children.length) {
      hd.innerHTML = Art.svg('golden', { cls: 'dog-l' }) + Art.svg('shiba', { cls: 'dog-main', title: '摸摸我' }) + Art.svg('husky', { cls: 'dog-r' });
      $('.dog-main', hd).addEventListener('click', petDog);
      var keys = Object.keys(D.types).map(function (c) { return D.types[c].dog; });
      var row = keys.map(function (k) { return Art.svg(k); }).join('');
      $('#marquee').innerHTML = row + row;
    }
    var ib = $('#inviteBanner');
    if (inviter) {
      var t = typeOf(inviter.code);
      ib.innerHTML = (inviter.name ? '「' + esc(inviter.name) + '」' : '你的朋友') + '测出来是 <b>' + esc(t.breed) + '</b>，邀请你也来测一测<br><span class="muted">测完就能看到你们是什么组合 →</span>';
      ib.hidden = false;
    } else ib.hidden = true;
    var a = C.author || {};
    var al = $('#authorLine');
    if (a.name) {
      al.innerHTML = (a.avatar ? '<img src="' + esc(a.avatar) + '" alt="">' : '') + '<span>作者：@' + esc(a.name) + '<br><span class="muted" style="font-weight:600;font-size:13px">抖音 / 小红书同名，测完来找我玩</span></span>';
      al.hidden = false;
    }
    var last = store.get('last', null), lr = $('#lastResult');
    if (last && typeOf(last.code)) {
      var lt = last.hidden ? D.hidden : typeOf(last.code);
      lr.innerHTML = '你上次测出：<a href="#result">' + esc(lt.breed) + ' · ' + esc(lt.nick) + '</a>';
      lr.hidden = false;
    }
    if (CNT && !renderHome.statsLoaded) {
      renderHome.statsLoaded = true;
      api('/stats').then(function (s) {
        if (!s || typeof s.total !== 'number') return;
        var sp = $('#socialProof'), c = C.counter;
        if (s.total < (c.showFrom || 1000)) sp.innerHTML = '新鲜上线 · 前 ' + (c.badgeLimit || 1000) + ' 位完成测试的人会获得「初代汪」徽章';
        else sp.innerHTML = '已完成 <b>' + s.total.toLocaleString('zh-CN') + '</b> 次狗格鉴定';
      });
    }
  }
  function petDog(e) {
    petCount++;
    var dog = e.currentTarget, b = $('#petBubble');
    dog.style.transition = 'transform .15s'; dog.style.transform = 'rotate(' + (petCount % 2 ? 8 : -8) + 'deg) scale(1.06)';
    setTimeout(function () { dog.style.transform = ''; }, 160);
    if (petCount === 7) {
      b.textContent = '我们是好朋友了！'; confetti(28);
      toast('解锁彩蛋：你和小狗成为了好朋友');
    } else b.textContent = PET_LINES[(petCount - 1) % PET_LINES.length];
    b.hidden = false; b.style.animation = 'none'; void b.offsetWidth; b.style.animation = '';
    clearTimeout(petDog.t); petDog.t = setTimeout(function () { b.hidden = true; }, 1500);
  }

  /* ---------------- 答题 ---------------- */
  var Q = { i: 0, ans: null, times: [], last: 0, fastWarned: false };
  function startQuiz(replace) {
    Q.i = 0; Q.ans = new Array(N_ITEMS).fill(0); Q.times = []; Q.last = Date.now(); Q.fastWarned = false;
    track('quiz', 'start');
    if (replace) { history.replaceState(null, '', location.pathname + location.search + '#quiz'); show('quiz'); renderQ(false); }
    else go('quiz');
  }
  function pawIcon(v) {
    var s = [14, 17, 20, 23, 27][v - 1];
    var fill = ['#c9d8ff', '#dcd4ff', '#f1ece4', '#ffd3b0', '#ffb7cd'][v - 1];
    return '<svg viewBox="0 0 40 40" width="' + s + '" height="' + s + '"><g fill="' + fill + '" stroke="#2b211c" stroke-width="3"><ellipse cx="20" cy="27" rx="9" ry="7.5"/><ellipse cx="9" cy="17" rx="4" ry="5"/><ellipse cx="16" cy="10" rx="4" ry="5"/><ellipse cx="24" cy="10" rx="4" ry="5"/><ellipse cx="31" cy="17" rx="4" ry="5"/></g></svg>';
  }
  function renderQ(animate) {
    var it = ITEMS[Q.i];
    $('#qNum').textContent = Q.i + 1;
    $('#qTag').textContent = it.tag;
    $('#qText').textContent = it.t;
    var pct = Q.i / N_ITEMS * 100;
    $('#pFill').style.width = pct + '%';
    $('#pRunner').style.left = Math.max(4, pct) + '%';
    if (!$('#pRunner').firstChild) {
      $('#pRunner').innerHTML = Art.svg('corgi');
      $('#pGoal').innerHTML = '<svg viewBox="0 0 40 40" width="34" height="34"><path d="M8 22a5 5 0 1 1 5-5h14a5 5 0 1 1 5 5 5 5 0 1 1-5 5H13a5 5 0 1 1-5-5z" fill="#fff7e8" stroke="#2b211c" stroke-width="2.6" stroke-linejoin="round"/></svg>';
    }
    var opts = $('#opts');
    opts.innerHTML = D.scale.map(function (lab, j) {
      var v = j + 1;
      return '<button class="opt' + (Q.ans[Q.i] === v ? ' sel' : '') + '" data-v="' + v + '"><span class="paw">' + pawIcon(v) + '</span>' + lab + '</button>';
    }).join('');
    if (animate) { var c = $('#qCard'); c.classList.remove('swap'); void c.offsetWidth; c.classList.add('swap'); }
    $('#qBack').setAttribute('aria-label', Q.i === 0 ? '返回首页' : '上一题');
  }
  var answering = false;
  function answer(v) {
    if (answering) return;
    answering = true;
    var now = Date.now(); Q.times.push(now - Q.last); Q.last = now;
    Q.ans[Q.i] = v;
    $$('.opt', $('#opts')).forEach(function (b) { b.classList.toggle('sel', +b.dataset.v === v); });
    var recent = Q.times.slice(-5);
    if (!Q.fastWarned && recent.length === 5 && recent.every(function (t) { return t < 650; })) {
      Q.fastWarned = true; toast('慢一点嘛，狗狗都看不清你的答案啦～');
    }
    setTimeout(function () {
      answering = false;
      if (Q.i === 11 && !Q.halfShown) { Q.halfShown = true; toast('过半啦！奖励你一根小骨头'); }
      if (Q.i < N_ITEMS - 1) { Q.i++; renderQ(true); }
      else finish();
    }, 230);
  }
  $('#opts').addEventListener('click', function (e) { var b = e.target.closest('.opt'); if (b) answer(+b.dataset.v); });
  document.addEventListener('keydown', function (e) {
    if (!$('#s-quiz').classList.contains('on')) return;
    if (/^[1-5]$/.test(e.key)) answer(+e.key);
    if (e.key === 'Backspace' || e.key === 'ArrowLeft') $('#qBack').click();
  });
  $('#qBack').addEventListener('click', function () {
    if (Q.i === 0) { go('home'); return; }
    Q.i--; renderQ(true);
  });
  $('#startBtn').addEventListener('click', function () { startQuiz(false); });

  var LD_TEXT = ['正在嗅嗅你的答案…', '正在比对 16 种狗狗的性格档案…', '正在给你的狗格盖章…'];
  function finish() {
    var res = compute(Q.ans);
    Q.ans = null;
    store.set('last', res);
    if (res.hidden) store.set('foundHidden', true);
    $('#ldDog').innerHTML = Art.svg('dachshund');
    show('loading');
    var k = 0, lt = $('#ldText'); lt.textContent = LD_TEXT[0];
    var iv = setInterval(function () { k++; if (k < LD_TEXT.length) lt.textContent = LD_TEXT[k]; }, 650);
    track('quiz', 'finish', res.hidden ? 'hidden' : res.code);
    setTimeout(function () {
      clearInterval(iv);
      history.replaceState(null, '', location.pathname + location.search + '#result');
      renderResult(res); show('result');
      setTimeout(function () { confetti(res.shiny ? 40 : 22, res.shiny ? ['#ffe066', '#fff3a8', '#ffd65c', '#ffffff'] : null); }, 300);
      if (res.shiny) setTimeout(function () { toast('天哪！你抽中了 1/50 的闪光款'); }, 900);
      countHit(res);
    }, 1950);
  }
  function countHit(res) {
    if (!CNT || res.counted) return;
    res.counted = true; store.set('last', res);
    api('/hit', { t: res.code }).then(function (r) {
      if (!r || typeof r.total !== 'number') return;
      res.ordinal = r.total; res.typeCount = r.types ? r.types[res.code] : null; res.totalAtHit = r.total;
      store.set('last', res);
      if ($('#s-result').classList.contains('on')) renderBadges(res);
    });
  }

  /* ---------------- 结果页 ---------------- */
  function barHTML(d, p, other) {
    var b = bucket(p);
    return '<div class="bar-row"><div class="bar-top"><span>' + esc(d.loLabel) + '</span><b>' + esc(d.name) + ' ' + p + '%</b><span>' + esc(d.hiLabel) + '</span></div>' +
      '<div class="bar"><i style="background:' + d.color + '" data-w="' + p + '"></i></div>' +
      (other === false ? '' : '<p>' + esc(D.dimText[d.key][b]) + '</p>') + '</div>';
  }
  function renderBadges(res) {
    var el = $('#rBadges'); if (!el) return;
    var h = '';
    if (res.shiny) h += '<span class="badge badge-gold">✦ 闪光款 · 1/50</span>';
    if (res.hidden) h += '<span class="badge badge-rare">隐藏款</span>';
    var c = C.counter || {};
    if (res.ordinal && res.ordinal <= (c.badgeLimit || 1000)) h += '<span class="badge badge-og">初代汪 · 第 ' + res.ordinal + ' 位</span>';
    else if (res.ordinal) h += '<span class="badge">你是第 ' + res.ordinal.toLocaleString('zh-CN') + ' 位鉴定者</span>';
    if (res.typeCount && res.totalAtHit >= (c.rarityFrom || 2000)) {
      var share = res.typeCount / res.totalAtHit * 100;
      h += '<span class="badge">同款占比 ' + share.toFixed(1) + '%' + (share < 4 ? ' · 稀有' : '') + '</span>';
    }
    el.innerHTML = h; el.hidden = !h;
  }
  function renderResult(res) {
    var t = typeOf(res.code), H = res.hidden ? D.hidden : null, shown = H || t;
    var el = $('#s-result');
    var chars = codeChars(res.code);
    var html = '';
    html += '<nav class="topbar"><a href="#home" class="back-link">‹ 首页</a><span class="mini-logo">DOGTI</span><span class="topbar-links"><a href="#gallery">图鉴</a></span></nav>';
    html += '<div class="r-hero card' + (res.shiny ? ' shiny' : '') + '" style="--tbg:' + shown.bg + ';--tac:' + shown.ac + '">' +
      '<span class="r-kicker">' + (H ? '你触发了隐藏款' : '你的狗格是') + '</span>' +
      '<div class="r-dog" id="rDog">' + Art.svg(shown.dog, { shiny: res.shiny, title: shown.breed }) + '</div>' +
      '<div class="r-code">' + (H ? '<span>?</span><span>?</span><span>?</span><span>?</span>' : chars.map(function (c) { return '<span>' + c + '</span>'; }).join('')) + '</div>' +
      '<h1 class="r-breed">' + esc(shown.breed) + '</h1>' +
      '<div class="r-nick">' + esc(shown.nick) + '</div>' +
      '<p class="r-tagline">' + esc(shown.tagline) + '</p>' +
      '<div class="r-badges" id="rBadges" hidden></div>';
    if (H) {
      html += '<p class="r-also">你有 <b>' + res.neutral + '</b> 题选了"说不好"——要么你是真正的端水大师，要么你今天有点困。凭第一直觉再测一次，答案会更清楚。<br>现在离你最近的是 <b>' + esc(t.breed) + ' · ' + esc(t.nick) + '</b></p>';
    } else if (res.alt) {
      var at = typeOf(res.alt), ad = dimByKey(res.altDim);
      html += '<p class="r-also">你主要是' + esc(t.breed) + '，也有点像 <b>' + esc(at.breed) + '</b>（在「' + ad.name + '」上你刚好处在中间）</p>';
    }
    html += '</div>';

    // 四维
    html += '<div class="card rsec" style="--tbg:' + t.bg + '"><h3 class="sec-title">你的四维狗格</h3><div class="bars">' +
      DIMS.map(function (d) { return barHTML(d, res.pct[d.key]); }).join('') + '</div></div>';
    // 解读
    html += '<div class="card rsec desc" style="--tbg:' + t.bg + '"><h3 class="sec-title">' + (H ? '最接近的狗格：' + esc(t.breed) : '狗格解读') + '</h3>' +
      t.desc.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
      '<div class="tags">' + t.tags.map(function (g) { return '<span>#' + esc(g) + '</span>'; }).join('') + '</div></div>';
    html += '<div class="two rsec"><div class="card"><h4>高光时刻</h4><ul>' + t.pros.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="card"><h4>狗生 bug</h4><ul>' + t.cons.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div></div>';
    html += '<div class="card rsec tips"><h3 class="sec-title">相处指南</h3><ul>' + t.tips.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
    html += '<div class="card rsec quote" style="--tbg:' + t.bg + '">"' + esc(t.quote) + '"<small>—— ' + esc(t.breed) + '的狗生格言</small></div>';
    // 配对
    var best = flip(res.code, 'EN'), rival = flip(res.code, 'AO');
    html += '<div class="card rsec"><h3 class="sec-title">狗狗社交圈</h3><div class="match">' +
      matchCard(best, '天选拍档', '#ffd65c') + matchCard(rival, '欢喜冤家', '#ff8fb3') + '</div></div>';
    // 好友配对结果
    if (inviter) html += pairHTML(res);
    // 分享
    html += '<div class="card rsec share-box"><h3 class="sec-title">晒出你的狗格</h3>' +
      '<p>生成专属狗格卡，发朋友圈 / 小红书 / 抖音；或者把邀请链接发给朋友，测完能看到你们的组合。</p>' +
      '<input id="nickInput" maxlength="12" placeholder="你的昵称（选填，朋友会看到）">' +
      '<button class="btn btn-big" id="mkCard" style="margin-top:12px">生成我的狗格卡</button>' +
      '<div class="btn-row"><button class="btn btn-white" id="cpInvite">复制邀请链接</button><button class="btn btn-mint" id="cpText">复制结果文案</button></div></div>';
    // 作者 + 打赏
    html += followHTML();
    // 再测 / 图鉴
    html += '<div class="btn-row rsec"><button class="btn btn-white" id="retake">再测一次</button><a class="btn btn-pink" href="#gallery" style="text-decoration:none">看 16 种图鉴</a></div>';
    // 参考文献（最后一页）
    html += '<details class="card rsec refs-mini"><summary>科学依据与参考文献</summary>' +
      '<p style="font-size:13px;margin:10px 0 0">4 个维度来自对狗和人的人格比较研究（Gosling 等，2003），题目改写自公有领域 IPIP 题库。<a href="#about">查看完整说明 →</a></p><ol>' +
      D.refs.map(function (r) { return '<li>' + esc(r.cite) + (r.doi ? ' <a href="https://doi.org/' + r.doi + '" target="_blank" rel="noopener">doi:' + r.doi + '</a>' : '') + '</li>'; }).join('') +
      '</ol></details>';
    html += '<p class="disclaimer">DOGTI 仅供娱乐，不是心理诊断。犬种只是比喻：品种只能解释狗狗个体行为差异的约 9%（Morrill 等，2022）。</p>';
    el.innerHTML = html;
    el.style.setProperty('--tbg', t.bg);

    renderBadges(res);
    setTimeout(function () { $$('.bar i', el).forEach(function (i) { i.style.width = i.dataset.w + '%'; }); }, 120);

    // 彩蛋：点小狗说话
    var lines = H ? ['我是谁？我在哪？', '我既是柴犬，又是金毛。', '再测一次，就能把我看清楚。'] : t.lines;
    var li = 0;
    $('#rDog').addEventListener('click', function () {
      var rd = this, old = $('.r-bubble', rd); if (old) old.remove();
      var b = document.createElement('div'); b.className = 'r-bubble'; b.textContent = lines[li++ % lines.length];
      rd.appendChild(b); rd.classList.remove('wiggle'); void rd.offsetWidth; rd.classList.add('wiggle');
      setTimeout(function () { b.remove(); }, 1800);
    });
    $$('.match-card', el).forEach(function (m) { m.addEventListener('click', function () { openType(m.dataset.code); }); });
    $('#mkCard').addEventListener('click', function () { openShare(res); });
    $('#cpInvite').addEventListener('click', function () {
      var u = inviteUrl(res, $('#nickInput').value.trim());
      copyText(u).then(function (ok) { toast(ok ? '邀请链接已复制，发给朋友吧！' : '复制失败，请手动复制地址栏'); });
      track('share', 'invite');
    });
    $('#cpText').addEventListener('click', function () {
      copyText(shareText(res, $('#nickInput').value.trim())).then(function (ok) { toast(ok ? '文案已复制，去粘贴吧～' : '复制失败了，换个浏览器试试'); });
      track('share', 'text');
    });
    $('#retake').addEventListener('click', function () { startQuiz(false); });
  }
  function shareText(res, name) {
    var t = res.hidden ? D.hidden : typeOf(res.code);
    var code = res.hidden ? '隐藏款' : codeChars(res.code).join('');
    return '我在 DOGTI 测出来是「' + t.breed + ' · ' + t.nick + '」（' + code + '）！' + t.tagline + '。你是哪种小狗？测完看看我们是什么组合 → ' + inviteUrl(res, name);
  }
  function matchCard(code, label, color) {
    var t = typeOf(code);
    return '<div class="match-card" data-code="' + code + '" style="background:' + t.bg + '"><span class="tag" style="background:' + color + '">' + label + '</span>' +
      Art.svg(t.dog) + '<b>' + esc(t.breed) + '</b><em>' + esc(t.nick) + '</em></div>';
  }
  function pairHTML(res) {
    var a = res.code, b = inviter.code, ta = typeOf(a), tb = typeOf(b);
    var rel = relation(a, b), P = D.pairs[rel];
    var same = [], diff = [];
    DIMS.forEach(function (d, i) { (a[i] === b[i] ? same : diff).push(d.name); });
    var text = P.text.replace('{diff}', diff.join('、')).replace('{same}', same.join('、'));
    var md = 0; DIMS.forEach(function (d) { md += Math.abs(res.pct[d.key] - inviter.pct[d.key]); });
    var score = Math.max(1, Math.round(100 - md / 4));
    var who = inviter.name ? esc(inviter.name) : 'TA';
    var rows = DIMS.map(function (d) {
      var p1 = res.pct[d.key], p2 = inviter.pct[d.key];
      return '<div class="bar-row"><div class="bar-top"><span>' + esc(d.loLabel) + '</span><b>' + d.name + '</b><span>' + esc(d.hiLabel) + '</span></div>' +
        '<div class="bar" style="overflow:visible"><span style="position:absolute;top:50%;left:' + p2 + '%;transform:translate(-50%,-50%);width:22px;height:22px;border:2.5px solid #2b211c;border-radius:50%;background:#fff;font-size:10px;font-weight:800;line-height:17px;text-align:center">TA</span>' +
        '<span style="position:absolute;top:50%;left:' + p1 + '%;transform:translate(-50%,-50%);width:22px;height:22px;border:2.5px solid #2b211c;border-radius:50%;background:' + d.color + ';font-size:10px;font-weight:800;line-height:17px;text-align:center;color:#fff">你</span></div></div>';
    }).join('');
    return '<div class="card rsec pair"><h3 class="sec-title">你和' + who + '的组合</h3>' +
      '<div class="pair-dogs">' + Art.svg(ta.dog) + '<span class="x">×</span>' + Art.svg(tb.dog) + '</div>' +
      '<p class="pair-who">你：' + esc(ta.breed) + ' · ' + who + '：' + esc(tb.breed) + '</p>' +
      '<div class="pair-name">' + P.name + '</div><p class="pair-score">默契值 <b>' + score + '</b> 分</p>' +
      '<p style="font-size:15px">' + esc(text) + '</p><div class="bars" style="margin-top:8px">' + rows + '</div></div>';
  }
  function followHTML() {
    var a = C.author || {}, tp = C.tip || {};
    if (!a.name && !tp.wechat && !tp.alipay) return '';
    var h = '<div class="card rsec follow">';
    if (a.name) {
      h += '<h3>觉得准，就关注我吧</h3><p>作者 @' + esc(a.name) + '（抖音 / 小红书同名）</p><p>下一期出什么测试，评论区你说了算！</p><div class="ids">' +
        (a.douyinId ? '<span class="chip">抖音号 ' + esc(a.douyinId) + '</span>' : '') + (a.xhsId ? '<span class="chip">小红书号 ' + esc(a.xhsId) + '</span>' : '') + '</div>';
    }
    if (tp.wechat || tp.alipay) {
      h += '<p style="margin-top:12px;font-weight:800">' + esc(tp.title || '请作者吃根小骨头') + '</p><div class="tip-qr">' +
        (tp.wechat ? '<figure><img src="' + esc(tp.wechat) + '" alt="微信收款码"><figcaption>微信</figcaption></figure>' : '') +
        (tp.alipay ? '<figure><img src="' + esc(tp.alipay) + '" alt="支付宝收款码"><figcaption>支付宝</figcaption></figure>' : '') + '</div>';
    }
    return h + '</div>';
  }

  /* ---------------- 分享图 ---------------- */
  function loadScript(src) {
    return new Promise(function (ok, no) { var s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
  }
  function svgImage(svgStr, size) {
    return new Promise(function (ok, no) {
      var img = new Image();
      img.onload = function () { ok(img); }; img.onerror = no;
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr.replace('<svg ', '<svg width="' + size + '" height="' + size + '" '));
    });
  }
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function wrap(ctx, text, maxW) {
    var lines = [], line = '';
    for (var i = 0; i < text.length; i++) {
      var test = line + text[i];
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = text[i]; } else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }
  var FD = '"DOGTI Latin", "DOGTI Display", "PingFang SC", "Microsoft YaHei", sans-serif';
  var FB = '-apple-system, "PingFang SC", "HarmonyOS Sans SC", "Microsoft YaHei", sans-serif';
  function drawCard(res, opt) {
    var t = typeOf(res.code), H = res.hidden ? D.hidden : null, shown = H || t;
    var W = 1080, Hh = 1440, INK = '#2b211c';
    var cv = document.createElement('canvas'); cv.width = W; cv.height = Hh;
    var ctx = cv.getContext('2d');
    var fontsReady = (document.fonts && document.fonts.load) ? Promise.race([
      Promise.all([document.fonts.load('80px "DOGTI Display"', shown.breed + shown.nick + '扫码测测你是哪种小狗跑躺贴酷敏稳探守'), document.fonts.load('80px "DOGTI Latin"', 'DOGTI No.0123456789'), document.fonts.ready]),
      new Promise(function (r) { setTimeout(r, 1500); })]) : Promise.resolve();
    var qrReady = opt.qr ? (window.qrcode ? Promise.resolve() : loadScript('assets/qrcode.min.js').catch(function () { })) : Promise.resolve();
    return Promise.all([fontsReady, qrReady, svgImage(Art.svg(shown.dog, { shiny: res.shiny }), 600)]).then(function (arr) {
      var img = arr[2];
      // 背景
      ctx.fillStyle = shown.bg; ctx.fillRect(0, 0, W, Hh);
      ctx.fillStyle = 'rgba(43,33,28,.08)';
      for (var y = 12; y < Hh; y += 36) for (var x = 12 + ((y / 36) % 2) * 18; x < W; x += 36) { ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 7); ctx.fill(); }
      // 页眉
      ctx.fillStyle = INK; ctx.textBaseline = 'alphabetic';
      ctx.font = '60px ' + FD; ctx.textAlign = 'left'; ctx.fillText('DOGTI', 64, 92);
      ctx.font = '700 30px ' + FB; ctx.textAlign = 'right'; ctx.fillText('狗格鉴定书 · ' + new Date(res.ts).toLocaleDateString('zh-CN'), W - 64, 88);
      // 主卡片
      var cx = 60, cy = 128, cw = 960, ch = 1110;
      ctx.fillStyle = INK; rr(ctx, cx + 14, cy + 14, cw, ch, 50); ctx.fill();
      ctx.fillStyle = '#fffdf8'; rr(ctx, cx, cy, cw, ch, 50); ctx.fill();
      ctx.lineWidth = 7; ctx.strokeStyle = res.shiny ? '#e0a800' : INK; rr(ctx, cx, cy, cw, ch, 50); ctx.stroke();
      if (res.shiny) { ctx.lineWidth = 3; ctx.strokeStyle = INK; rr(ctx, cx - 4, cy - 4, cw + 8, ch + 8, 54); ctx.stroke(); }
      // 标签
      ctx.font = '800 30px ' + FB; ctx.textAlign = 'center';
      var kick = H ? '我触发了隐藏款' : '我的狗格是', kw = ctx.measureText(kick).width + 56;
      ctx.fillStyle = shown.bg; rr(ctx, W / 2 - kw / 2, 162, kw, 54, 27); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
      ctx.fillStyle = INK; ctx.fillText(kick, W / 2, 200);
      // 小狗
      ctx.drawImage(img, W / 2 - 230, 222, 460, 460);
      // 类型码
      var chars = H ? ['?', '?', '?', '?'] : codeChars(res.code), bw = 74, gap = 16, sx = W / 2 - (bw * 4 + gap * 3) / 2;
      chars.forEach(function (c, i) {
        var bx = sx + i * (bw + gap), by = 690;
        ctx.fillStyle = INK; rr(ctx, bx + 4, by + 4, bw, bw, 18); ctx.fill();
        ctx.fillStyle = '#fff'; rr(ctx, bx, by, bw, bw, 18); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
        ctx.fillStyle = INK; ctx.font = '46px ' + FD; ctx.textAlign = 'center'; ctx.fillText(c, bx + bw / 2, by + 54);
      });
      // 品种 + 昵称
      ctx.font = '104px ' + FD; ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText(shown.breed, W / 2, 878);
      ctx.font = '50px ' + FD; var nw = ctx.measureText(shown.nick).width + 70;
      ctx.fillStyle = INK; rr(ctx, W / 2 - nw / 2 + 5, 906, nw, 78, 39); ctx.fill();
      ctx.fillStyle = shown.ac; rr(ctx, W / 2 - nw / 2, 900, nw, 78, 39); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
      ctx.fillStyle = INK; ctx.fillText(shown.nick, W / 2 + 3, 958); ctx.fillStyle = '#fff'; ctx.fillText(shown.nick, W / 2, 955);
      // 标语
      ctx.font = '800 36px ' + FB; ctx.fillStyle = '#4a3c34';
      wrap(ctx, shown.tagline, 820).slice(0, 2).forEach(function (l, i) { ctx.fillText(l, W / 2, 1040 + i * 48); });
      // 四维条
      var by0 = H ? 1110 : 1100;
      DIMS.forEach(function (d, i) {
        var col = i % 2, row = Math.floor(i / 2), bx = 110 + col * 440, yy = by0 + row * 62, p = res.pct[d.key];
        ctx.font = '30px ' + FD; ctx.textAlign = 'left'; ctx.fillStyle = INK; ctx.fillText(d.name, bx, yy + 26);
        var tx = bx + 82, tw = 250;
        ctx.fillStyle = '#fff'; rr(ctx, tx, yy, tw, 30, 15); ctx.fill();
        ctx.save(); rr(ctx, tx, yy, tw, 30, 15); ctx.clip(); ctx.fillStyle = d.color; ctx.fillRect(tx, yy, tw * p / 100, 30); ctx.restore();
        ctx.lineWidth = 4; ctx.strokeStyle = INK; rr(ctx, tx, yy, tw, 30, 15); ctx.stroke();
        ctx.font = '800 26px ' + FB; ctx.fillStyle = INK; ctx.fillText(p + '%', tx + tw + 12, yy + 25);
      });
      // 角标
      var stamps = [];
      if (res.shiny) stamps.push(['闪光款', '#ffd45c']);
      if (H) stamps.push(['隐藏款', '#a99bff']);
      var c = C.counter || {};
      if (res.ordinal && res.ordinal <= (c.badgeLimit || 1000)) stamps.push(['初代汪 No.' + res.ordinal, '#79dcc8']);
      stamps.forEach(function (s, i) {
        ctx.save(); ctx.translate(i % 2 ? 190 : W - 190, 300 + Math.floor(i / 2) * 110); ctx.rotate(i % 2 ? -0.2 : 0.2);
        ctx.font = '38px ' + FD; var sw = ctx.measureText(s[0]).width + 50;
        ctx.fillStyle = s[1]; rr(ctx, -sw / 2, -36, sw, 72, 20); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
        ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText(s[0], 0, 13); ctx.restore();
      });
      // 页脚
      var a = C.author || {};
      var url = inviteUrl(res, opt.name);
      ctx.textAlign = 'left';
      if (opt.qr && window.qrcode) {
        var qr = window.qrcode(0, 'M'); qr.addData(url); qr.make();
        var n = qr.getModuleCount(), qs = 156, qx = 64, qy = 1262, cell = qs / n;
        ctx.fillStyle = INK; rr(ctx, qx - 8, qy - 8, qs + 22, qs + 22, 18); ctx.fill();
        ctx.fillStyle = '#fff'; rr(ctx, qx - 12, qy - 12, qs + 24, qs + 24, 18); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
        ctx.fillStyle = INK;
        for (var r = 0; r < n; r++) for (var q = 0; q < n; q++) if (qr.isDark(r, q)) ctx.fillRect(qx + q * cell, qy + r * cell, Math.ceil(cell), Math.ceil(cell));
        ctx.font = '46px ' + FD; ctx.fillText('扫码测测你是哪种小狗', 266, 1310);
        ctx.font = '700 28px ' + FB; ctx.fillStyle = '#4a3c34';
        ctx.fillText('测完看看我们是什么组合', 266, 1358);
        ctx.fillText(a.name ? 'DOGTI · 抖音/小红书 @' + a.name : 'DOGTI · 16 种小狗等你认领', 266, 1400);
      } else {
        ctx.textAlign = 'center'; ctx.font = '46px ' + FD; ctx.fillStyle = INK;
        ctx.fillText('DOGTI 狗格测试 · 16 种小狗', W / 2, 1322);
        ctx.font = '700 30px ' + FB; ctx.fillStyle = '#4a3c34';
        ctx.fillText(a.name ? '测试入口见 @' + a.name + '（抖音 / 小红书同名）' : '你是哪种小狗？评论区报出你的狗种', W / 2, 1376);
      }
      return cv.toDataURL('image/png');
    });
  }
  function openShare(res) {
    track('share', 'card');
    var name = ($('#nickInput') && $('#nickInput').value.trim()) || '';
    openSheet('<h3 class="sec-title">你的狗格卡</h3><div id="cardWrap" style="min-height:200px;display:flex;align-items:center;justify-content:center"><p class="muted">正在画画…</p></div>' +
      '<label class="toggle"><input type="checkbox" id="qrToggle" checked> 带二维码（发微信用；发小红书/抖音可以去掉）</label>' +
      '<p class="share-tip">' + (isWeChat ? '长按图片，保存或发送给朋友' : '长按图片保存，或点下面的按钮') + '</p>' +
      '<div class="btn-row" id="shareBtns"' + (isWeChat ? ' hidden' : '') + '><button class="btn btn-white" id="dlBtn">保存图片</button><button class="btn btn-mint" id="sysShare">分享给朋友</button></div>',
      function (body) {
        var current = '';
        function paint() {
          var qrOn = $('#qrToggle', body).checked;
          drawCard(res, { qr: qrOn, name: name }).then(function (url) {
            current = url;
            $('#cardWrap', body).innerHTML = '<img class="share-img" src="' + url + '" alt="我的狗格卡">';
          }).catch(function () { $('#cardWrap', body).innerHTML = '<p>生成失败了，截个屏也可以哦</p>'; });
        }
        paint();
        $('#qrToggle', body).addEventListener('change', paint);
        var dl = $('#dlBtn', body);
        if (dl) dl.addEventListener('click', function () {
          if (!current) return;
          var a = document.createElement('a'); a.href = current; a.download = 'DOGTI-' + (res.hidden ? 'hidden' : res.code) + '.png';
          document.body.appendChild(a); a.click(); a.remove(); track('share', 'download');
        });
        var ss = $('#sysShare', body);
        if (ss) ss.addEventListener('click', function () {
          if (!current) return;
          fetch(current).then(function (r) { return r.blob(); }).then(function (blob) {
            var file = new File([blob], 'DOGTI.png', { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) return navigator.share({ files: [file], text: shareText(res, name) });
            if (navigator.share) return navigator.share({ title: 'DOGTI 狗格测试', text: shareText(res, name), url: inviteUrl(res, name) });
            return copyText(shareText(res, name)).then(function () { toast('已复制分享文案～'); });
          }).catch(function () { });
          track('share', 'system');
        });
      });
  }

  /* ---------------- 图鉴 ---------------- */
  function renderGallery() {
    var last = store.get('last', null), me = last && !last.hidden ? last.code : null;
    var codes = Object.keys(D.types);
    $('#legend').innerHTML = DIMS.map(function (d) { return '<span>' + d.hi + ' / ' + d.lo + '：' + d.name + '</span>'; }).join('');
    var found = store.get('foundHidden', false);
    $('#gallery').innerHTML = codes.map(function (c) {
      var t = D.types[c];
      return '<div class="g-card' + (c === me ? ' me' : '') + '" data-code="' + c + '" style="--tbg:' + t.bg + '">' + Art.svg(t.dog) +
        '<b>' + esc(t.breed) + '</b><em>' + esc(t.nick) + '</em><span class="code">' + codeChars(c).join('') + '</span></div>';
    }).join('') +
      '<div class="g-card' + (found ? '' : ' locked') + '" data-code="hidden" style="--tbg:' + D.hidden.bg + '">' + Art.svg('mystery') +
      '<b>' + (found ? D.hidden.breed : '？？？') + '</b><em>' + (found ? D.hidden.nick : '隐藏款 · 还没被你发现') + '</em><span class="code">????</span></div>';
    $$('.g-card', $('#gallery')).forEach(function (g) { g.addEventListener('click', function () { openType(g.dataset.code); }); });
  }
  function openType(code) {
    if (code === 'hidden') {
      var found = store.get('foundHidden', false);
      openSheet('<div style="text-align:center">' + Art.svg('mystery', { cls: 'big' }).replace('<svg ', '<svg width="180" height="180" ') +
        '<h3 class="page-title">' + (found ? D.hidden.breed + ' · ' + D.hidden.nick : '隐藏款') + '</h3><p>' +
        (found ? esc(D.hidden.tagline) + '。恭喜你找到了它！' : '有一种特别的答题方式能召唤它……提示：它很会端水。') + '</p></div>');
      return;
    }
    var t = typeOf(code); if (!t) return;
    var best = typeOf(flip(code, 'EN')), rival = typeOf(flip(code, 'AO'));
    openSheet('<div style="text-align:center;background:' + t.bg + ';border:2.5px solid #2b211c;border-radius:20px;padding:10px 12px 16px">' +
      Art.svg(t.dog).replace('<svg ', '<svg width="170" height="170" ') +
      '<div class="r-code" style="display:flex;justify-content:center">' + codeChars(code).map(function (c) { return '<span>' + c + '</span>'; }).join('') + '</div>' +
      '<h3 class="r-breed" style="font-size:38px">' + esc(t.breed) + '</h3><div class="r-nick" style="--tac:' + t.ac + '">' + esc(t.nick) + '</div>' +
      '<p class="r-tagline">' + esc(t.tagline) + '</p></div>' +
      '<div class="desc" style="margin-top:14px">' + t.desc.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>' +
      '<div class="tags" style="--tbg:' + t.bg + '">' + t.tags.map(function (g) { return '<span>#' + esc(g) + '</span>'; }).join('') + '</div>' +
      '<p style="margin-top:14px;font-size:14px"><b>天选拍档：</b>' + esc(best.breed) + ' · ' + esc(best.nick) + '<br><b>欢喜冤家：</b>' + esc(rival.breed) + ' · ' + esc(rival.nick) + '</p>' +
      '<button class="btn" data-close onclick="location.hash=\'quiz\'">测测我是不是' + esc(t.breed) + '</button>');
  }

  /* ---------------- 科学依据 ---------------- */
  function renderAbout() {
    var el = $('#s-about'); if (el.dataset.done) return; el.dataset.done = '1';
    el.className += ' about';
    el.innerHTML = '<nav class="topbar"><a href="#home" class="back-link">‹ 返回</a><span class="mini-logo">科学依据</span><span class="topbar-links"></span></nav>' +
      '<h2 class="page-title">DOGTI 是怎么设计的</h2><p class="page-sub">好玩第一，但每一步都有出处</p>' +
      '<div class="card"><h3>人和狗共有 4 个性格维度</h3><p>心理学家 Gosling 等（2003）比较了狗和人的人格评价，发现狗的 4 个性格维度，正好对应人类"大五人格"中的 4 个：</p><div class="dim-grid">' +
      DIMS.map(function (d) { return '<div><b>' + d.name + '（' + d.hi + '/' + d.lo + '）</b>' + esc(d.sci) + '<br><span class="muted">' + esc(d.hiLabel) + ' ↔ ' + esc(d.loLabel) + '</span></div>'; }).join('') +
      '</div><p>每个维度分高低两极，2⁴ = <b>16 种小狗</b>。</p></div>' +
      '<div class="card fun-fact"><h3>冷知识：为什么没有"自律"？</h3><p>人类的大五人格里还有一项"尽责性"（自律、靠谱、有计划）。但在跨物种研究里，单独的尽责性维度只在黑猩猩身上出现过，狗狗没有（Gosling & John, 1999）。所以，测不出自律不是你的错，是狗的锅。</p></div>' +
      '<div class="card"><h3>题目和计分</h3><ul>' +
      '<li>24 道题改写自公有领域的 IPIP 大五题库，每个维度 6 题。</li>' +
      '<li>每个维度一半正向题、一半反向题，抵消"什么都说是"的作答习惯。</li>' +
      '<li>"完全不像我"到"完全就是我"的五点量表（Likert, 1932）；研究显示 5～6 档已接近最优（Simms 等, 2019）。</li>' +
      '<li>人格更像连续的光谱，而不是非黑即白的类型（Haslam 等, 2012）。所以我们先算连续分数，再展示成类型；如果你刚好在中间，结果页会告诉你"也有点像谁"。</li>' +
      '<li>解读文字和你的分数挂钩，避免"说谁都准"的巴纳姆效应（Forer, 1949）。</li></ul></div>' +
      '<div class="card"><h3>犬种只是比喻</h3><p>一项调查了 18,385 只狗的研究发现，品种只能解释个体狗狗行为差异的约 9%（Morrill 等, 2022）。所以"你是柴犬"只是好玩的比喻，你家狗狗的性格主要看它自己。</p></div>' +
      '<div class="card" id="privacy"><h3>隐私说明</h3><p>你的每一道作答只在你的手机里计算，不会上传。网站可能使用匿名访问统计；如果开启了计数，只会发送"完成了一次测试 + 你的狗狗类型"，不含任何个人信息。结果保存在你自己的浏览器里，清除浏览器数据即可删除。</p></div>' +
      '<div class="card"><h3>参考文献</h3><ol class="refs">' +
      D.refs.map(function (r) {
        return '<li><span class="cite">' + esc(r.cite) + (r.doi ? ' <a href="https://doi.org/' + r.doi + '" target="_blank" rel="noopener">https://doi.org/' + r.doi + '</a>' : '') + '</span><span class="note">' + esc(r.note) + '</span></li>';
      }).join('') + '</ol></div>' +
      '<div class="card"><h3>版权与致谢</h3><p>DOGTI 的题目文案、16 只小狗插画均为原创，转载请注明出处。标题字体：站酷庆科黄油体（SIL OFL 1.1）；二维码生成：qrcode-generator（MIT）。</p><p class="muted">本测试仅供娱乐，不构成任何心理学诊断或建议。</p></div>' +
      '<button class="btn btn-big" id="aboutStart">开始测试</button>';
    $('#aboutStart').addEventListener('click', function () { startQuiz(false); });
  }
  document.addEventListener('click', function (e) {
    var g = e.target.closest('[data-goto]');
    if (g) { setTimeout(function () { var t = document.getElementById(g.dataset.goto); if (t) t.scrollIntoView({ behavior: 'smooth' }); }, 80); }
  });

  /* ---------------- 统计 & 启动 ---------------- */
  if (C.baiduTongjiId) {
    window._hmt = window._hmt || [];
    var hm = document.createElement('script'); hm.src = 'https://hm.baidu.com/hm.js?' + C.baiduTongjiId; hm.async = true;
    document.head.appendChild(hm);
  }
  try {
    console.log('%c  ∪･ω･∪  汪！你在看源码？\n  DOGTI 原创性格测试，欢迎来抖音/小红书找作者玩。', 'font-size:14px;color:#e8711f;font-weight:bold');
  } catch (e) { }
  window.__dogti = { compute: compute, relation: relation, flip: flip }; // 便于自检
  route();
})();
