/* DOGTI 原创小狗插画（纯代码绘制的 SVG，无外部素材）
 * DogArt.svg(key, {size, cls, shiny}) -> SVG 字符串
 * 画风：粗描边 + 扁平色 + 腮红 + 趴在边上的两只小爪
 */
(function () {
  'use strict';
  var INK = '#3a2a22';
  var SW = 5;
  var PINK = '#ffb3c1';
  var BLUSH = '#ff9aae';
  var uid = 0;

  function a(attrs) {
    var s = '';
    for (var k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) s += ' ' + k + '="' + attrs[k] + '"';
    return s;
  }
  function E(cx, cy, rx, ry, fill, extra) {
    return '<ellipse' + a(Object.assign({ cx: cx, cy: cy, rx: rx, ry: ry, fill: fill }, extra || {})) + '/>';
  }
  function P(d, fill, extra) {
    return '<path' + a(Object.assign({ d: d, fill: fill || 'none' }, extra || {})) + '/>';
  }
  var OL = { stroke: INK, 'stroke-width': SW, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
  function ol(w) { return { stroke: INK, 'stroke-width': w || SW, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }; }
  // 左右镜像（以 x=100 为轴）
  function mirror(inner) { return '<g transform="matrix(-1 0 0 1 200 0)">' + inner + '</g>'; }
  function pair(inner) { return inner + mirror(inner); }

  // 云朵/蓬松轮廓
  function cloud(cx, cy, rx, ry, n, amp, phase) {
    phase = phase || 0;
    var d = '', i, t0, t1, tm, x0, y0, x1, y1, xc, yc;
    for (i = 0; i <= n; i++) {
      t1 = phase + (Math.PI * 2 * i) / n;
      x1 = cx + rx * Math.cos(t1); y1 = cy + ry * Math.sin(t1);
      if (i === 0) { d += 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1); }
      else {
        t0 = phase + (Math.PI * 2 * (i - 1)) / n; tm = (t0 + t1) / 2;
        xc = cx + rx * (1 + amp * 2.2) * Math.cos(tm); yc = cy + ry * (1 + amp * 2.2) * Math.sin(tm);
        d += ' Q' + xc.toFixed(1) + ' ' + yc.toFixed(1) + ' ' + x1.toFixed(1) + ' ' + y1.toFixed(1);
      }
    }
    return d + 'Z';
  }

  /* ---------- 五官 ---------- */
  var EY = 108, EXL = 72, EXR = 128;
  function eyes(kind, o) {
    o = o || {};
    var y = o.y || EY, xl = o.xl || EXL, xr = o.xr || (200 - (o.xl || EXL)), s = '', ink = o.ink || '#2a1d17';
    function dot(x, rx, ry) {
      return E(x, y, rx, ry, ink) + E(x + rx * 0.3, y - ry * 0.38, rx * 0.36, ry * 0.3, '#fff') + E(x - rx * 0.3, y + ry * 0.4, rx * 0.16, ry * 0.13, '#fff');
    }
    if (kind === 'dot') s = dot(xl, 6.5, 8) + dot(xr, 6.5, 8);
    else if (kind === 'big') s = dot(xl, 8.5, 10.5) + dot(xr, 8.5, 10.5);
    else if (kind === 'small') s = dot(xl, 5.5, 6.8) + dot(xr, 5.5, 6.8);
    else if (kind === 'happy') {
      s = P('M' + (xl - 9) + ' ' + (y + 3) + ' Q' + xl + ' ' + (y - 9) + ' ' + (xl + 9) + ' ' + (y + 3), 'none', ol(4.6)) +
          P('M' + (xr - 9) + ' ' + (y + 3) + ' Q' + xr + ' ' + (y - 9) + ' ' + (xr + 9) + ' ' + (y + 3), 'none', ol(4.6));
    } else if (kind === 'closed') {
      s = P('M' + (xl - 9) + ' ' + (y - 1) + ' Q' + xl + ' ' + (y + 7) + ' ' + (xl + 9) + ' ' + (y - 1), 'none', ol(4.4)) +
          P('M' + (xr - 9) + ' ' + (y - 1) + ' Q' + xr + ' ' + (y + 7) + ' ' + (xr + 9) + ' ' + (y - 1), 'none', ol(4.4));
    } else if (kind === 'side' || kind === 'sleepy') {
      var shift = kind === 'side' ? 3 : 0, fur = o.fur || '#fff';
      [xl, xr].forEach(function (x) {
        s += E(x + shift, y + 1, 6.5, 7.5, ink) + E(x + shift + 2.2, y - 1.5, 2, 1.8, '#fff');
        s += P('M' + (x - 10) + ' ' + (y - 9) + ' L' + (x + 10) + ' ' + (y - 9) + ' L' + (x + 10) + ' ' + (y + (kind === 'side' ? 0 : 1.5)) + ' L' + (x - 10) + ' ' + (y + (kind === 'side' ? 0 : 1.5)) + 'Z', fur);
        s += P('M' + (x - 8.5) + ' ' + (y + (kind === 'side' ? 0 : 1.5)) + ' L' + (x + 8.5) + ' ' + (y + (kind === 'side' ? 0 : 1.5)), 'none', ol(4));
      });
    } else if (kind === 'blue') {
      [[xl, 7.5, 9], [xr, 6.5, 8]].forEach(function (e, i) {
        var x = e[0];
        s += E(x, y, e[1], e[2], '#7cc6ff', ol(3)) + E(x + (i ? 1.5 : -1.5), y + 1, e[1] * 0.48, e[2] * 0.5, ink) + E(x + 2, y - 3, 2.2, 2, '#fff');
      });
    }
    return '<g class="d-eyes">' + s + '</g>';
  }
  function nose(x, y, sc) {
    sc = sc || 1;
    var w = 9 * sc, h = 6 * sc;
    return P('M' + (x - w) + ' ' + (y - h * 0.6) + ' Q' + x + ' ' + (y - h * 1.6) + ' ' + (x + w) + ' ' + (y - h * 0.6) +
      ' Q' + (x + w * 0.9) + ' ' + (y + h * 0.9) + ' ' + x + ' ' + (y + h) + ' Q' + (x - w * 0.9) + ' ' + (y + h * 0.9) + ' ' + (x - w) + ' ' + (y - h * 0.6) + 'Z', '#2a1d17', ol(2)) +
      E(x - 3 * sc, y - 3.2 * sc, 3 * sc, 1.6 * sc, '#fff', { opacity: 0.75 });
  }
  function mouth(kind, x, y, o) {
    o = o || {};
    var s = '';
    var w = 'M' + x + ' ' + (y + 5) + ' L' + x + ' ' + (y + 9) + ' M' + (x - 10) + ' ' + (y + 9) + ' Q' + (x - 5) + ' ' + (y + 15.5) + ' ' + x + ' ' + (y + 9) + ' Q' + (x + 5) + ' ' + (y + 15.5) + ' ' + (x + 10) + ' ' + (y + 9);
    if (kind === 'w') s = P(w, 'none', ol(3.8));
    else if (kind === 'tongue' || kind === 'blue') {
      var tc = kind === 'blue' ? '#6b62b8' : '#ff7d96';
      var len = kind === 'blue' ? 18 : 25;
      s = P('M' + (x - 6.5) + ' ' + (y + 11) + ' Q' + (x - 7.5) + ' ' + (y + len) + ' ' + x + ' ' + (y + len) + ' Q' + (x + 7.5) + ' ' + (y + len) + ' ' + (x + 6.5) + ' ' + (y + 11) + 'Z', tc, ol(3.4)) +
        P('M' + x + ' ' + (y + 13) + ' L' + x + ' ' + (y + len - 6), 'none', { stroke: 'rgba(0,0,0,.18)', 'stroke-width': 2.4, 'stroke-linecap': 'round' }) +
        P(w, 'none', ol(3.8));
    } else if (kind === 'open') {
      s = P('M' + (x - 14) + ' ' + (y + 8) + ' Q' + x + ' ' + (y + 14) + ' ' + (x + 14) + ' ' + (y + 8) + ' Q' + (x + 13) + ' ' + (y + 30) + ' ' + x + ' ' + (y + 30) + ' Q' + (x - 13) + ' ' + (y + 30) + ' ' + (x - 14) + ' ' + (y + 8) + 'Z', '#8e3b46', ol(3.6)) +
        P('M' + (x - 9) + ' ' + (y + 25) + ' Q' + x + ' ' + (y + 15) + ' ' + (x + 9) + ' ' + (y + 25) + ' Q' + x + ' ' + (y + 31) + ' ' + (x - 9) + ' ' + (y + 25) + 'Z', '#ff8fa3') +
        P('M' + x + ' ' + (y + 5) + ' L' + x + ' ' + (y + 11), 'none', ol(3.6));
    } else if (kind === 'smirk') {
      s = P('M' + x + ' ' + (y + 5) + ' L' + x + ' ' + (y + 9) + ' M' + (x - 9) + ' ' + (y + 11) + ' Q' + (x - 4) + ' ' + (y + 14) + ' ' + x + ' ' + (y + 9) + ' Q' + (x + 6) + ' ' + (y + 15) + ' ' + (x + 12) + ' ' + (y + 6), 'none', ol(3.8));
    } else if (kind === 'small') {
      s = P('M' + x + ' ' + (y + 5) + ' L' + x + ' ' + (y + 8) + ' M' + (x - 7) + ' ' + (y + 8) + ' Q' + (x - 3.5) + ' ' + (y + 13) + ' ' + x + ' ' + (y + 8) + ' Q' + (x + 3.5) + ' ' + (y + 13) + ' ' + (x + 7) + ' ' + (y + 8), 'none', ol(3.6));
    } else if (kind === 'o') {
      s = P('M' + x + ' ' + (y + 5) + ' L' + x + ' ' + (y + 8), 'none', ol(3.6)) + E(x, y + 14, 5, 6, '#8e3b46', ol(3.4));
    }
    return '<g class="d-mouth">' + s + '</g>';
  }
  function blush(o) {
    o = o || {};
    var y = o.y || 126, dx = o.dx || 44, rx = o.rx || 11;
    return E(100 - dx, y, rx, rx * 0.6, BLUSH, { opacity: o.op || 0.6 }) + E(100 + dx, y, rx, rx * 0.6, BLUSH, { opacity: o.op || 0.6 });
  }
  function paws(fill, o) {
    o = o || {};
    var y = o.y || 168, dx = o.dx || 30, s = '';
    [100 - dx, 100 + dx].forEach(function (x) {
      s += E(x, y, 17, 12.5, fill, OL) +
        P('M' + (x - 5) + ' ' + (y + 4) + ' L' + (x - 5) + ' ' + (y + 10) + ' M' + (x + 5) + ' ' + (y + 4) + ' L' + (x + 5) + ' ' + (y + 10), 'none', ol(3));
    });
    return '<g class="d-paws">' + s + '</g>';
  }

  /* ---------- 耳朵（左耳，右耳镜像） ---------- */
  function earPointy(fill, inner, o) {
    o = o || {};
    var t = o.t || 0; // 尖端外倾
    return P('M38 92 Q32 50 ' + (44 - t) + ' 26 Q' + (50 - t) + ' 16 ' + (60 - t * 0.4) + ' 22 Q80 36 92 58 Z', fill, OL) +
      (inner ? P('M48 80 Q44 54 ' + (51 - t) + ' 38 Q' + (55 - t) + ' 33 ' + (59 - t * 0.4) + ' 37 Q72 48 80 62 Z', inner) : '');
  }
  function earSmallPointy(fill, inner) {
    return P('M44 82 Q40 58 50 42 Q56 34 64 40 Q78 50 86 64 Z', fill, OL) +
      (inner ? P('M52 74 Q50 58 55 50 Q59 46 63 50 Q72 57 76 66 Z', inner) : '');
  }
  function earBig(fill, inner) { // 柯基大耳
    return P('M40 96 Q24 52 34 20 Q40 8 52 14 Q80 34 94 58 Z', fill, OL) +
      (inner ? P('M50 84 Q40 54 44 32 Q47 25 54 29 Q72 44 82 62 Z', inner) : '');
  }
  function earHuge(fill, inner) { // 吉娃娃
    return P('M50 92 Q6 72 6 26 Q6 14 18 16 Q62 26 88 62 Z', fill, OL) +
      (inner ? P('M52 80 Q20 66 18 34 Q19 27 26 29 Q56 38 76 62 Z', inner) : '');
  }
  function earBat(fill, inner) { // 法斗
    return P('M44 88 Q20 56 26 26 Q30 10 48 14 Q72 22 86 58 Z', fill, OL) +
      (inner ? P('M50 78 Q34 56 37 34 Q40 24 50 26 Q66 32 76 58 Z', inner) : '');
  }
  function earTipped(fill, fold) { // 边牧折耳
    return P('M40 92 Q34 58 46 38 Q52 28 62 32 Q80 44 92 60 Z', fill, OL) +
      P('M46 38 Q52 28 62 32 Q66 34 68 38 Q60 50 48 52 Q42 46 46 38 Z', fold, ol(4));
  }
  function earFlop(fill, o) { // 垂耳（画在头前）
    o = o || {};
    var L = o.long ? 30 : 0;
    return P('M54 58 Q30 54 22 82 Q14 ' + (112 + L * 0.6) + ' 24 ' + (132 + L) + ' Q32 ' + (146 + L) + ' 46 ' + (138 + L) + ' Q58 ' + (126 + L * 0.5) + ' 60 98 Q62 72 54 58 Z', fill, OL);
  }
  function earTiny(fill, inner) {
    return P('M50 74 Q46 52 56 44 Q66 42 76 56 Z', fill, OL) + (inner ? P('M55 66 Q53 54 58 50 Q64 50 68 57 Z', inner) : '');
  }

  /* ---------- 配饰 ---------- */
  function star(x, y, r, fill) {
    var d = 'M' + x + ' ' + (y - r) + ' Q' + (x + r * 0.22) + ' ' + (y - r * 0.22) + ' ' + (x + r) + ' ' + y + ' Q' + (x + r * 0.22) + ' ' + (y + r * 0.22) + ' ' + x + ' ' + (y + r) + ' Q' + (x - r * 0.22) + ' ' + (y + r * 0.22) + ' ' + (x - r) + ' ' + y + ' Q' + (x - r * 0.22) + ' ' + (y - r * 0.22) + ' ' + x + ' ' + (y - r) + 'Z';
    return P(d, fill || '#ffd54a', ol(3));
  }
  function heart(x, y, s, fill) {
    var d = 'M' + x + ' ' + (y + 9 * s) + ' C' + (x - 14 * s) + ' ' + (y - 1 * s) + ' ' + (x - 9 * s) + ' ' + (y - 12 * s) + ' ' + x + ' ' + (y - 5 * s) +
      ' C' + (x + 9 * s) + ' ' + (y - 12 * s) + ' ' + (x + 14 * s) + ' ' + (y - 1 * s) + ' ' + x + ' ' + (y + 9 * s) + 'Z';
    return P(d, fill || '#ff6f91', ol(3));
  }
  var ACC = {
    sparkles: function () { return '<g class="d-acc">' + star(166, 40, 11) + star(182, 66, 6.5) + star(26, 52, 7) + '</g>'; },
    heart: function () { return '<g class="d-acc">' + heart(170, 44, 1.25) + heart(186, 72, 0.6, '#ff9db5') + '</g>'; },
    bubble: function () {
      return '<g class="d-acc">' + P('M150 18 h34 a10 10 0 0 1 10 10 v14 a10 10 0 0 1 -10 10 h-20 l-10 9 l2 -9 h-6 a10 10 0 0 1 -10 -10 v-14 a10 10 0 0 1 10 -10z', '#fff', ol(3.5)) +
        E(159, 35, 3, 3, INK) + E(169, 35, 3, 3, INK) + E(179, 35, 3, 3, INK) + '</g>';
    },
    anger: function () {
      return '<g class="d-acc">' + P('M160 40 Q166 40 166 34 M172 34 Q172 40 178 40 M178 46 Q172 46 172 52 M166 52 Q166 46 160 46', 'none', { stroke: '#ff4d5e', 'stroke-width': 4, 'stroke-linecap': 'round' }) + '</g>';
    },
    zzz: function () {
      return '<g class="d-acc">' + P('M150 30 h12 l-12 13 h12 M168 14 h9 l-9 10 h9 M182 2 h6 l-6 7 h6', 'none', { stroke: '#7d8cff', 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }) + '</g>';
    },
    glasses: function () {
      return '<g class="d-acc">' + E(EXL, EY, 15, 14, 'rgba(255,255,255,.22)', { stroke: '#ffd25e', 'stroke-width': 4 }) + E(EXR, EY, 15, 14, 'rgba(255,255,255,.22)', { stroke: '#ffd25e', 'stroke-width': 4 }) +
        P('M87 106 Q100 99 113 106', 'none', { stroke: '#ffd25e', 'stroke-width': 4, 'stroke-linecap': 'round' }) + '</g>';
    },
    sweat: function () {
      return '<g class="d-acc">' + P('M168 54 Q160 68 164 74 Q168 80 174 74 Q178 68 168 54Z', '#9fd8ff', ol(3)) + '</g>';
    },
    bow: function () {
      return '<g class="d-acc">' + P('M100 44 L80 32 Q74 44 80 56 Z', '#ff8fb1', ol(3.5)) + P('M100 44 L120 32 Q126 44 120 56 Z', '#ff8fb1', ol(3.5)) + E(100, 44, 6, 6, '#ff6f9a', ol(3.5)) + '</g>';
    },
    scarf: function () {
      return '<g class="d-acc">' + P('M48 140 Q100 166 152 140 L156 154 Q100 182 44 154 Z', '#e8534a', ol(4)) +
        P('M128 158 L136 186 L150 180 L142 154 Z', '#e8534a', ol(4)) + P('M70 150 L74 162 M92 154 L94 167 M114 154 L113 166', 'none', { stroke: 'rgba(255,255,255,.55)', 'stroke-width': 2.6, 'stroke-linecap': 'round' }) + '</g>';
    },
    bandana: function () {
      return '<g class="d-acc">' + P('M58 146 Q100 166 142 146 L100 184 Z', '#e8534a', ol(4)) + E(100, 166, 3, 3, '#fff') + E(86, 156, 2.6, 2.6, '#fff') + E(114, 156, 2.6, 2.6, '#fff') + E(100, 154, 2.2, 2.2, '#fff') + '</g>';
    },
    magnifier: function () {
      return '<g class="d-acc">' + P('M168 156 L184 178', 'none', { stroke: INK, 'stroke-width': 8, 'stroke-linecap': 'round' }) + P('M168 156 L184 178', 'none', { stroke: '#b5835a', 'stroke-width': 4, 'stroke-linecap': 'round' }) +
        E(158, 142, 15, 15, 'rgba(190,230,255,.6)', ol(4.5)) + P('M150 136 Q153 131 159 131', 'none', { stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round' }) + '</g>';
    },
    bone: function () {
      return '<g class="d-acc" transform="rotate(-18 168 176)">' + P('M152 172 a6 6 0 1 1 6 -6 h20 a6 6 0 1 1 6 6 a6 6 0 1 1 -6 6 h-20 a6 6 0 1 1 -6 -6z', '#fff7e8', ol(3.5)) + '</g>';
    },
    feather: function () {
      return '<g class="d-acc" transform="rotate(28 160 40)">' + P('M160 18 Q176 34 162 64 Q148 36 160 18Z', '#fff', ol(3.2)) + P('M160 26 L161 62', 'none', ol(2.4)) + '</g>';
    },
    beret: function () {
      return '<g class="d-acc">' + P('M80 34 Q104 10 136 24 Q146 30 140 38 Q116 46 84 42 Q74 40 80 34Z', '#d6455d', ol(4)) + P('M110 18 L112 10', 'none', ol(4)) + '</g>';
    },
    star: function () { return '<g class="d-acc">' + star(168, 36, 13, '#ffe066') + star(30, 46, 6, '#ffe066') + '</g>'; },
    question: function () {
      return '<g class="d-acc">' + P('M160 26 Q160 14 172 14 Q184 14 184 25 Q184 33 174 36 L174 42', 'none', ol(5)) + E(174, 52, 3.4, 3.4, INK) + '</g>';
    }
  };

  /* ---------- 16 + 1 只小狗 ---------- */
  var DOGS = {
    golden: function (id) {
      var fur = '#f3b655', dark = '#df9433';
      return P('M58 54 Q100 34 142 54 Q170 72 168 106 Q166 148 128 160 Q100 166 72 160 Q34 148 32 106 Q30 72 58 54Z', fur, OL) +
        P('M88 50 Q92 38 100 44 Q106 36 112 48', 'none', ol(4)) +
        E(100, 132, 30, 21, '#fbd795') +
        earFlop(dark) + mirror(earFlop(dark)) +
        eyes('happy') + nose(100, 121) + mouth('tongue', 100, 122) + blush() + paws(fur) + ACC.sparkles();
    },
    corgi: function (id) {
      var fur = '#f3a24e';
      return earBig(fur, '#ffd7c2') + mirror(earBig(fur, '#ffd7c2')) +
        clipHead(id, 'M34 106 Q34 52 100 50 Q166 52 166 106 Q166 160 100 162 Q34 160 34 106Z', fur,
          P('M93 48 Q100 44 107 48 L109 92 Q132 100 140 126 Q138 160 100 166 Q62 160 60 126 Q68 100 91 92 Z', '#fff8ef')) +
        eyes('dot') + nose(100, 121) + mouth('tongue', 100, 122) + blush() + paws('#fff8ef') + ACC.bone();
    },
    samoyed: function (id) {
      var fur = '#fffdf9';
      return earSmallPointy(fur, '#ffc9d3') + mirror(earSmallPointy(fur, '#ffc9d3')) +
        P(cloud(100, 106, 66, 56, 18, 0.03, 0.17), fur, OL) +
        eyes('happy') + nose(100, 118) + mouth('open', 100, 119) + blush({ op: 0.75 }) + paws(fur) + ACC.bubble();
    },
    bichon: function (id) {
      var fur = '#fffefb';
      return P(cloud(100, 102, 72, 64, 14, 0.045, 0.2), fur, OL) +
        P(cloud(100, 128, 30, 22, 9, 0.05, 0.3), '#fff6ec', { stroke: 'rgba(58,42,34,.15)', 'stroke-width': 2 }) +
        eyes('big') + nose(100, 121) + mouth('small', 100, 122) + blush({ op: 0.75 }) + paws(fur) + ACC.heart();
    },
    husky: function (id) {
      var fur = '#6c7488';
      return earPointy(fur, '#f4f1ee') + mirror(earPointy(fur, '#f4f1ee')) +
        clipHead(id, 'M34 106 Q34 50 100 48 Q166 50 166 106 Q166 160 100 162 Q34 160 34 106Z', fur,
          P('M100 92 Q108 74 120 88 Q146 84 162 104 Q172 150 100 168 Q28 150 38 104 Q54 84 80 88 Q92 74 100 92Z', '#f6f4f1') +
          E(73, 88, 8, 5, '#f6f4f1') + E(127, 88, 8, 5, '#f6f4f1')) +
        eyes('blue') + nose(100, 121) + mouth('tongue', 100, 122) + blush({ op: 0.45 }) + paws('#f6f4f1') + ACC.feather();
    },
    tianyuan: function (id) {
      var fur = '#e8b464';
      return earPointy(fur, '#f9dcae', { t: 6 }) + mirror(earPointy(fur, '#f9dcae', { t: 6 })) +
        P('M34 106 Q34 52 100 50 Q166 52 166 106 Q166 160 100 162 Q34 160 34 106Z', fur, OL) +
        E(100, 132, 31, 22, '#fbe7c2') +
        eyes('dot') + nose(100, 121) + mouth('w', 100, 122) + blush() + paws(fur) + ACC.bandana();
    },
    collie: function (id) {
      var fur = '#3f4352';
      return earTipped(fur, '#2f323e') + mirror(earTipped(fur, '#2f323e')) +
        clipHead(id, 'M36 106 Q36 50 100 48 Q164 50 164 106 Q164 160 100 162 Q36 160 36 106Z', fur,
          P('M94 46 Q100 42 106 46 L110 94 Q132 104 136 132 Q132 166 100 168 Q68 166 64 132 Q68 104 90 94 Z', '#fbfaf7')) +
        eyes('dot', { ink: '#141217' }) + E(EXL + 2, EY - 3, 2.6, 2.4, '#fff') + E(EXR + 2, EY - 3, 2.6, 2.4, '#fff') +
        nose(100, 121) + mouth('w', 100, 122) + blush({ op: 0.5 }) + paws('#fbfaf7') + ACC.glasses() + ACC.sweat();
    },
    chihuahua: function (id) {
      var fur = '#f2c68c';
      return earHuge(fur, '#ffc2c8') + mirror(earHuge(fur, '#ffc2c8')) +
        P('M40 108 Q38 56 100 54 Q162 56 160 108 Q158 158 100 160 Q42 158 40 108Z', fur, OL) +
        E(100, 132, 26, 18, '#f9dfb8') +
        eyes('big', { y: 106 }) + nose(100, 121, 0.85) + mouth('small', 100, 122) + blush() + paws(fur) + ACC.anger();
    },
    labrador: function (id) {
      var fur = '#8d5c3c', dark = '#71472d';
      return P('M34 106 Q34 52 100 50 Q166 52 166 106 Q166 160 100 162 Q34 160 34 106Z', fur, OL) +
        E(100, 132, 30, 21, '#a8764f') +
        earFlop(dark) + mirror(earFlop(dark)) +
        eyes('dot', { ink: '#1c120d' }) + nose(100, 121) + mouth('w', 100, 122) + blush({ op: 0.5 }) + paws(fur) + ACC.star();
    },
    frenchie: function (id) {
      var fur = '#efd0a4';
      return earBat(fur, '#ffbfc8') + mirror(earBat(fur, '#ffbfc8')) +
        P('M30 110 Q30 58 100 56 Q170 58 170 110 Q170 158 100 160 Q30 158 30 110Z', fur, OL) +
        E(100, 128, 34, 24, '#b88d69') +
        P('M90 74 Q100 70 110 74 M86 82 Q100 77 114 82', 'none', { stroke: 'rgba(58,42,34,.55)', 'stroke-width': 3, 'stroke-linecap': 'round' }) +
        eyes('closed', { y: 106, xl: 68 }) + nose(100, 119, 1.15) + mouth('w', 100, 121) + blush({ dx: 48 }) + paws(fur) + ACC.zzz();
    },
    poodle: function (id) {
      var fur = '#e9a26c', dark = '#d98a55';
      return P(cloud(100, 54, 42, 26, 9, 0.06, 0.4), fur, OL) +
        P('M36 106 Q36 54 100 52 Q164 54 164 106 Q164 160 100 162 Q36 160 36 106Z', fur, OL) +
        E(100, 132, 28, 20, '#f6c49a') +
        P(cloud(36, 118, 22, 32, 8, 0.07, 0.3), dark, OL) + P(cloud(164, 118, 22, 32, 8, 0.07, 0.3), dark, OL) +
        eyes('big') + nose(100, 121) + mouth('small', 100, 122) + blush() + paws(fur) + ACC.beret();
    },
    maltese: function (id) {
      var fur = '#fffdf8';
      var hair = 'M100 50 Q58 44 42 78 Q28 112 30 148 Q32 178 52 180 Q68 178 64 150 Q38 98 100 58 Z';
      return P('M40 110 Q40 56 100 54 Q160 56 160 110 Q160 158 100 160 Q40 158 40 110Z', '#fff8f1', OL) +
        E(100, 130, 26, 18, '#fffdfa') +
        P(hair, fur, OL) + mirror(P(hair, fur, OL)) +
        P('M48 96 Q44 120 46 146 M152 96 Q156 120 154 146', 'none', { stroke: 'rgba(58,42,34,.18)', 'stroke-width': 2.5, 'stroke-linecap': 'round' }) +
        eyes('big', { xl: 76 }) + nose(100, 121, 0.9) + mouth('small', 100, 122) + blush({ dx: 38, op: 0.75 }) + paws(fur, { dx: 24 }) + ACC.bow();
    },
    shiba: function (id) {
      var fur = '#ee9a47';
      return earSmallPointy(fur, '#fff1df') + mirror(earSmallPointy(fur, '#fff1df')) +
        clipHead(id, 'M32 108 Q32 54 100 52 Q168 54 168 108 Q168 160 100 162 Q32 160 32 108Z', fur,
          E(100, 140, 46, 28, '#fff4e4') + E(66, 128, 24, 20, '#fff4e4') + E(134, 128, 24, 20, '#fff4e4') +
          E(77, 90, 7, 4.5, '#fff4e4') + E(123, 90, 7, 4.5, '#fff4e4')) +
        eyes('side', { fur: fur, y: 106 }) + nose(100, 121) + mouth('smirk', 100, 122) + blush({ op: 0.5 }) + paws('#fff4e4');
    },
    chow: function (id) {
      var fur = '#d98a4a';
      return P(cloud(100, 106, 80, 70, 16, 0.05, 0.1), '#cf7d3d', OL) +
        earTiny(fur, null) + mirror(earTiny(fur, null)) +
        E(100, 110, 56, 48, '#e7a15f') +
        E(100, 130, 30, 20, '#f0b77c') +
        eyes('sleepy', { fur: '#e7a15f', y: 106, xl: 76 }) + nose(100, 121) + mouth('blue', 100, 122) + blush({ dx: 40, op: 0.45 }) + paws('#cf7d3d') ;
    },
    dachshund: function (id) {
      var fur = '#c9733f', dark = '#a85a2e';
      return P('M38 104 Q38 52 100 50 Q162 52 162 104 Q162 158 100 162 Q38 158 38 104Z', fur, OL) +
        E(100, 132, 30, 22, '#de935d') +
        earFlop(dark, { long: true }) + mirror(earFlop(dark, { long: true })) +
        eyes('dot', { ink: '#1f140e' }) + nose(100, 121) + mouth('w', 100, 122) + blush({ op: 0.5 }) + paws(fur) + ACC.magnifier();
    },
    akita: function (id) {
      var fur = '#e9a66e';
      var ear = P('M40 84 Q36 60 46 46 Q54 38 64 44 Q78 54 84 66 Z', fur, OL) + P('M48 76 Q46 62 52 54 Q56 50 62 54 Q70 60 74 68 Z', '#fff3e3');
      return ear + mirror(ear) +
        clipHead(id, 'M28 110 Q28 54 100 52 Q172 54 172 110 Q172 160 100 162 Q28 160 28 110Z', fur,
          E(100, 140, 52, 30, '#fff3e3') + E(62, 126, 26, 22, '#fff3e3') + E(138, 126, 26, 22, '#fff3e3') +
          E(76, 92, 7.5, 4.5, '#fff3e3') + E(124, 92, 7.5, 4.5, '#fff3e3')) +
        eyes('small', { y: 108, xl: 74 }) + nose(100, 121) + mouth('small', 100, 122) + blush({ op: 0.55 }) + ACC.scarf() + paws('#fff3e3');
    },
    mystery: function (id) { // 隐藏款：薛定谔的小狗
      var fur = '#ece7ff';
      return earPointy(fur, '#d8cfff') + earFlop('#c9bdf7').replace('<path', '<path transform="matrix(-1 0 0 1 200 0)"') +
        P('M34 106 Q34 52 100 50 Q166 52 166 106 Q166 160 100 162 Q34 160 34 106Z', fur, OL) +
        P('M100 50 L100 162', 'none', { stroke: 'rgba(58,42,34,.25)', 'stroke-width': 3, 'stroke-dasharray': '6 7' }) +
        E(100, 132, 30, 21, '#f8f5ff') +
        eyes('dot') + nose(100, 121) + mouth('o', 100, 122) + blush() + paws(fur) + ACC.question();
    }
  };

  // 带花纹的头：用 clipPath 把花纹裁在头里
  var _curId = 0;
  function clipHead(id, d, fill, marks) {
    var cid = 'dclip' + id;
    return '<defs><clipPath id="' + cid + '"><path d="' + d + '"/></clipPath></defs>' +
      P(d, fill) + '<g clip-path="url(#' + cid + ')">' + marks + '</g>' + P(d, 'none', OL);
  }

  var SHINY = function () {
    return '<g class="d-shiny">' + star(24, 30, 9, '#fff3a8') + star(178, 112, 7, '#fff3a8') + star(36, 150, 6, '#fff3a8') + '</g>';
  };

  function svg(key, opts) {
    opts = opts || {};
    var f = DOGS[key] || DOGS.mystery;
    var id = ++uid;
    var size = opts.size ? ' width="' + opts.size + '" height="' + opts.size + '"' : '';
    var title = opts.title ? '<title>' + opts.title + '</title>' : '';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"' + size + ' class="dog dog-' + key + (opts.cls ? ' ' + opts.cls : '') + '" role="img">' + title +
      '<g class="d-body">' + f(id) + '</g>' + (opts.shiny ? SHINY() : '') + '</svg>';
  }

  window.DogArt = { svg: svg, keys: Object.keys(DOGS) };
})();
