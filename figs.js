/* ══════════════════════════════════════════════════════════════
   디지털논리회로 마스터 — 그림 모음 (그림12 · 2026-09-30)
   공용 그리기 도우미 links/fig.js 를 쓴다. index.html 의 배우기 카드와 수업 슬라이드가 함께 부른다.

   한 칸의 모양
     키: { cap:'캡션 한 줄', cards:['배우기 카드 제목'…], draw:function(){ … } }
       cards — content.js 의 LEARN 카드 제목(t)과 **똑같이**. 그 카드 제목 바로 아래에 그림이 나온다
       슬라이드는 content.js 의 SLIDES 에 fig:'키' 로 붙인다
     순서 = 한 카드에 그림이 여럿일 때 나오는 순서.

   그림 내용은 content.js 의 배우기 카드 본문을 옮긴 것이고, 모양은 교과서
   『디지털 논리 회로』로 확인했다(따라 그리지 않고 새로 짬). 입력 전압 범위(2.0 V · 0.8 V)는
   교과서 그림 Ⅰ-6 의 값, 카운터·링 카운터의 하강 에지는 교과서 그림 Ⅶ-12 · Ⅶ-20 대로다.
   "값은 예시" 라고 캡션에 적은 그림의 숫자는 개념을 보여 주려고 고른 것이다.

   정답 이름표 — 수업 슬라이드는 끝에 퀴즈가 나오고 그림이 계속 떠 있으므로, 퀴즈·빈칸의 답이 되는 글자는
   ans:true 로 그렸다. 슬라이드는 FIG.svgOf(키,{labels:false}) 로 불러 ? 로 가린다(배우기 카드는 다 보인다).

   게이트 · 플립플롭 기호는 fig.js 에 없어 이 파일 안의 작은 도우미(gate · ff)로 그린다.
   ══════════════════════════════════════════════════════════════ */
var FIGS = (function () {
  var F = window.FIG;
  if (!F) return {};
  var C = F.C;
  var t = F.t, line = F.line, box = F.box, arrow = F.arrow;

  /* ── 작은 도우미 ─────────────────────────── */
  function W(pts, o) { o = o || {}; return F.poly(pts, { c: o.c || C.ink, w: o.w || 1.8, dash: o.dash }); }
  function dot(x, y, c) { return '<circle cx="' + x + '" cy="' + y + '" r="3.4" fill="' + (c || C.ink) + '"/>'; }
  function bub(x, y, o) {
    o = o || {};
    return '<circle cx="' + x + '" cy="' + y + '" r="' + (o.r || 4.5) + '" fill="#fff" stroke="' + (o.c || C.ink) + '" stroke-width="1.8"/>';
  }
  /* 아래 첨자 글자 — 예: sb(10,20,'Q','A') → Q_A */
  function sb(x, y, base, sub, o) {
    o = o || {};
    var size = o.size || 16, ss = Math.max(13, Math.round(size * 0.8)), dy = Math.round(size * 0.32);
    var an = o.a === 'm' ? 'middle' : (o.a === 'e' ? 'end' : 'start');
    return '<text x="' + x + '" y="' + y + '" font-size="' + size + '" fill="' + (o.c || C.ink) + '" text-anchor="' + an +
      '" dominant-baseline="middle"' + (o.b ? ' font-weight="700"' : '') +
      (o.halo === false ? '' : ' paint-order="stroke" stroke="#fff" stroke-width="4" stroke-linejoin="round"') + '>' +
      base + '<tspan font-size="' + ss + '" dy="' + dy + '">' + sub + '</tspan>' +
      (o.tail ? '<tspan font-size="' + size + '" dy="' + (-dy) + '">' + o.tail + '</tspan>' : '') + '</text>';
  }
  /* 곡선 화살표 (x1,y1) → 조절점 (cx,cy) → (x2,y2) */
  function carrow(x1, y1, cx, cy, x2, y2, o) {
    o = o || {};
    var c = o.c || C.ink, ang = Math.atan2(y2 - cy, x2 - cx), hs = 10;
    var bx = x2 - Math.cos(ang) * hs * 0.7, by = y2 - Math.sin(ang) * hs * 0.7;
    var a1 = ang + Math.PI * 0.85, a2 = ang - Math.PI * 0.85;
    return F.path('M' + x1 + ',' + y1 + ' Q' + cx + ',' + cy + ' ' + bx + ',' + by, { c: c, w: o.w || 2, dash: o.dash }) +
      '<polygon points="' + x2 + ',' + y2 + ' ' + (x2 + hs * Math.cos(a1)) + ',' + (y2 + hs * Math.sin(a1)) + ' ' +
      (x2 + hs * Math.cos(a2)) + ',' + (y2 + hs * Math.sin(a2)) + '" fill="' + c + '"/>';
  }
  /* 사각 파형 — xs 에서 값이 바뀐다 */
  function wave(xs, v0, x0, x1, yH, yL, o) {
    o = o || {};
    var v = v0, d = 'M' + x0 + ',' + (v ? yH : yL);
    xs.forEach(function (x) { d += ' H' + x; v = !v; d += ' V' + (v ? yH : yL); });
    return F.path(d + ' H' + x1, { c: o.c || C.ink, w: o.w || 2.4 });
  }
  function xorMark(cx, cy, r, c) {
    c = c || C.orange;
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#fff" stroke="' + c + '" stroke-width="2"/>' +
      line(cx - r, cy, cx + r, cy, { c: c, w: 2 }) + line(cx, cy - r, cx, cy + r, { c: c, w: 2 });
  }

  /* 논리 게이트 기호 — (x, y) = 몸통 왼쪽 끝 · 가운데 높이
     돌려주는 것: { s: SVG, i: [[입력 끝점]…], o: [출력 끝점] } */
  var GT = { and: ['and', 0, 0], nand: ['and', 1, 0], or: ['or', 0, 0], nor: ['or', 1, 0],
    xor: ['or', 0, 1], xnor: ['or', 1, 1], not: ['tri', 1, 0], buf: ['tri', 0, 0] };
  function gate(type, x, y, o) {
    o = o || {};
    var k = GT[type], shp = k[0], neg = k[1], xo = k[2];
    var h = o.h || (shp === 'tri' ? 34 : 40), w = o.w || (shp === 'tri' ? 32 : 50);
    var n = o.n || (shp === 'tri' ? 1 : 2), c = o.c || C.ink, fill = o.fill || '#fff';
    var top = y - h / 2, bot = y + h / 2, st = '" fill="' + fill + '" stroke="' + c + '" stroke-width="2" stroke-linejoin="round"/>';
    var offs = o.ys || (n === 1 ? [0] : (n === 2 ? [-h / 4, h / 4] : [-h / 3, 0, h / 3]));
    var s = '', ins = [], ox, cx;
    if (shp === 'and') {
      var r = h / 2, fx = x + w - r;
      s += '<path d="M' + x + ',' + top + ' H' + fx + ' A' + r + ',' + r + ' 0 0 1 ' + fx + ',' + bot + ' H' + x + ' Z' + st;
      ox = x + w; cx = x + (w - r) / 2 + 7;
      offs.forEach(function (d) { ins.push([x, y + d]); });
    } else if (shp === 'or') {
      var bx = x + (xo ? 8 : 0), k2 = 0.3 * h;
      s += '<path d="M' + bx + ',' + top + ' Q' + (bx + w * 0.62) + ',' + top + ' ' + (bx + w) + ',' + y +
        ' Q' + (bx + w * 0.62) + ',' + bot + ' ' + bx + ',' + bot + ' Q' + (bx + k2) + ',' + y + ' ' + bx + ',' + top + ' Z' + st;
      if (xo) s += '<path d="M' + x + ',' + top + ' Q' + (x + k2) + ',' + y + ' ' + x + ',' + bot + '" fill="none" stroke="' + c + '" stroke-width="2"/>';
      ox = bx + w; cx = bx + w * 0.46;
      offs.forEach(function (d) { var u = (d + h / 2) / h; ins.push([x + 2 * u * (1 - u) * k2, y + d]); });
    } else {
      s += '<path d="M' + x + ',' + top + ' L' + (x + w) + ',' + y + ' L' + x + ',' + bot + ' Z' + st;
      ox = x + w; ins.push([x, y]);
    }
    if (neg) { s += bub(ox + 4.5, y, { c: c }); ox += 9; }
    if (shp !== 'tri' && o.label !== false)
      s += t(cx, y + 0.5, o.label || type.toUpperCase(), { size: 13, a: 'm', c: C.sub, halo: false, b: 1, ans: o.ans });
    return { s: s, i: ins, o: [ox, y] };
  }

  /* 플립플롭 네모 — l:[[이름, 위에서 거리, 'c'(클록)|'n'(하강 에지 클록)]] · r:[[이름, 거리]] · top/bot: 비동기 입력
     돌려주는 것: { s, p: { 핀이름: [끝점] } } */
  function ff(x, y, w, h, o) {
    o = o || {};
    var s = box(x, y, w, h, { fill: o.fill || C.blueL, c: o.c || C.blue, r: 6, w: 1.8 }), p = {};
    (o.l || []).forEach(function (a) {
      var nm = a[0], yy = y + a[1], k = a[2];
      if (k) s += F.poly([[x, yy - 7], [x + 10, yy], [x, yy + 7]], { c: C.ink, w: 1.6 });
      if (k === 'n') { s += bub(x - 5, yy) + line(x - 10, yy, x - 22, yy, { w: 1.8 }); p[nm] = [x - 22, yy]; }
      else { s += line(x, yy, x - 16, yy, { w: 1.8 }); p[nm] = [x - 16, yy]; }
      s += t(x + (k ? 14 : 6), yy, nm, { size: 14, a: 's', halo: false });
    });
    (o.r || []).forEach(function (a) {
      var yy = y + a[1];
      s += line(x + w, yy, x + w + 16, yy, { w: 1.8 }); p[a[0]] = [x + w + 16, yy];
      s += t(x + w - 6, yy, a[0], { size: 14, a: 'e', halo: false });
    });
    var mx = x + w / 2;
    if (o.top) { s += bub(mx, y - 5) + line(mx, y - 10, mx, y - 26, { w: 1.8 }); p[o.top] = [mx, y - 26]; s += t(mx, y + 12, o.top, { size: 13, a: 'm', halo: false }); }
    if (o.bot) { s += bub(mx, y + h + 5) + line(mx, y + h + 10, mx, y + h + 26, { w: 1.8 }); p[o.bot] = [mx, y + h + 26]; s += t(mx, y + h - 12, o.bot, { size: 13, a: 'm', halo: false }); }
    if (o.name) {
      var ny = y + h / 2 + (o.ny || 0);
      s += (o.name.length === 2 && typeof o.name !== 'string') ? sb(mx, ny, o.name[0], o.name[1], { size: 15, b: 1, a: 'm', c: o.c || C.blue, halo: false })
        : t(mx, ny, o.name, { size: 15, b: 1, a: 'm', c: o.c || C.blue, halo: false });
    }
    return { s: s, p: p };
  }

  /* 3변수 카노 맵 — vals: 2줄 × 4칸 글자, groups: [{r:[0,1], c:[1,2], col, fill}] */
  var KX = 150, KY = 84, KW = 64, KH = 48, BCS = ['00', '01', '11', '10'], BCV = [0, 1, 3, 2];
  function kx(ci) { return KX + KW * (ci + 0.5); }
  function ky(ri) { return KY + KH * (ri + 0.5); }
  function kmap(vals, groups, o) {
    o = o || {};
    var s = line(KX - 58, KY - 42, KX, KY, { w: 1.2, c: C.sub }) +
      t(KX - 42, KY - 10, 'A', { size: 16, b: 1, a: 'm' }) + t(KX - 6, KY - 32, 'BC', { size: 16, b: 1, a: 'e' });
    BCS.forEach(function (b, i) { s += t(kx(i), KY - 16, b, { size: 16, b: 1, a: 'm', c: (o.hot || []).indexOf(i) >= 0 ? C.red : C.ink }); });
    s += t(KX - 26, ky(0), '0', { size: 16, b: 1, a: 'm' }) + t(KX - 26, ky(1), '1', { size: 16, b: 1, a: 'm' });
    s += box(KX, KY, KW * 4, KH * 2, { fill: '#fff', r: 0, w: 1.8 });
    for (var i = 1; i < 4; i++) s += line(KX + KW * i, KY, KX + KW * i, KY + KH * 2, { w: 1.2, c: C.line });
    s += line(KX, KY + KH, KX + KW * 4, KY + KH, { w: 1.2, c: C.line });
    (groups || []).forEach(function (g) {
      var x1 = KX + KW * g.c[0] + 6, x2 = KX + KW * (g.c[1] + 1) - 6, y1 = KY + KH * g.r[0] + 6, y2 = KY + KH * (g.r[1] + 1) - 6;
      if (g.open === 'l') x1 -= 12;
      if (g.open === 'r') x2 += 12;
      s += '<rect x="' + x1 + '" y="' + y1 + '" width="' + (x2 - x1) + '" height="' + (y2 - y1) + '" rx="18" fill="' + g.fill +
        '" fill-opacity=".6" stroke="' + g.col + '" stroke-width="2.4"' + (g.open ? ' stroke-dasharray="7 4"' : '') + '/>';
    });
    for (var r = 0; r < 2; r++) for (var ci = 0; ci < 4; ci++) {
      var v = vals[r][ci];
      if (o.mnum !== false) s += t(KX + KW * ci + 6, KY + KH * r + 11, 'm' + (r * 4 + BCV[ci]), { size: 13, c: C.sub, halo: false });
      s += t(kx(ci), ky(r) + 2, v, { size: 21, b: 1, a: 'm', c: v === '×' ? C.orange : C.ink, halo: false });
    }
    return s;
  }

  return {

  /* ─────────── Ⅰ. 디지털 시스템과 정보의 표현 ─────────── */
  'wave-ad': { cards: ['아날로그 신호와 디지털 신호'],
    cap: '아날로그는 끊김 없이 이어지는 값, 디지털은 0과 1처럼 끊어진 값',
    draw: function () {
      var s = t(24, 26, '아날로그 —', { b: 1, c: C.blue }) + t(112, 26, '연속적인 값', { b: 1, c: C.blue, ans: 1 });
      s += F.path('M30,92 C70,40 110,40 150,78 S220,126 260,96 S330,34 370,56 S430,110 450,86', { c: C.blue, w: 3 });
      s += t(24, 138, '디지털 —', { b: 1, c: C.green }) + t(96, 138, '불연속(이산)적인 값', { b: 1, c: C.green, ans: 1 });
      s += wave([90, 150, 190, 270, 330, 390], 0, 30, 450, 166, 206, { c: C.green, w: 3 });
      s += t(462, 166, '1', { a: 'm', size: 15, b: 1, c: C.sub }) + t(462, 206, '0', { a: 'm', size: 15, b: 1, c: C.sub });
      s += arrow(30, 230, 420, 230, { c: C.sub, w: 1.2, head: 8 }) + t(428, 230, '시간', { size: 13, c: C.sub });
      return F.svg(480, 246, s);
    } },

  'volt-level': { cards: ['디지털 정보의 표현 — 전압·비트·A/D 변환'],
    cap: '디지털 시스템의 입출력 전압 — 입력 쪽 범위가 더 넓어 잡음이 섞여도 같은 값으로 읽는다',
    draw: function () {
      var X = function (v) { return 90 + v * 72; }, s = '';
      var rows = [['출력 신호', 44, 0.4, 2.7], ['입력 신호', 112, 0.8, 2.0]];
      rows.forEach(function (r) {
        var y = r[1];
        s += t(80, y + 20, r[0], { a: 'e', b: 1, size: 15 });
        s += box(X(0), y, X(r[2]) - X(0), 40, { fill: C.grayL, c: C.sub, r: 4, w: 1.6 });
        s += box(X(r[3]), y, X(5) - X(r[3]), 40, { fill: C.blueL, c: C.blue, r: 4, w: 1.6 });
        s += t((X(r[3]) + X(5)) / 2, y + 20, 'high (1)', { a: 'm', b: 1, c: C.blue, halo: false });
        s += t((X(0) + X(r[2])) / 2, y + 20, r[2] > 0.5 ? 'low' : '0', { a: 'm', b: 1, size: 14, c: C.sub, halo: false });
      });
      s += line(X(0), 188, X(5) + 6, 188, { w: 1.6 });
      [[0, '0'], [0.4, '0.4'], [0.8, '0.8'], [2.0, '2.0'], [2.7, '2.7'], [5, '5 V']].forEach(function (v) {
        s += line(X(v[0]), 182, X(v[0]), 194, { w: 1.4 }) + t(X(v[0]), 206, v[1], { a: 'm', size: 13, c: C.sub });
      });
      [0.4, 0.8, 2.0, 2.7].forEach(function (v) { s += line(X(v), 90, X(v), 182, { c: C.line, w: 1, dash: '4 4' }); });
      s += t(282, 234, '입력 범위가 출력보다 넓다 →', { a: 'e', size: 14, b: 1, c: C.orange }) + t(290, 234, '잡음에 대처하기 위해서', { size: 14, b: 1, c: C.orange, ans: 1 });
      return F.svg(480, 252, s);
    } },

  'ad-convert': { cards: ['디지털 정보의 표현 — 전압·비트·A/D 변환'],
    cap: 'A/D 변환 3단계 — 표본화 → 양자화 → 부호화 (값은 예시)',
    draw: function () {
      var s = '', us = [0.08, 0.24, 0.4, 0.56, 0.72, 0.88];
      function L(u) { return 3.6 + 2.9 * Math.sin(2 * Math.PI * u * 0.95 + 0.4); }
      function Y(l) { return 214 - l * 19; }
      var titles = [['① 표본화', '일정한 시간 간격으로'], ['② 양자화', '레벨을 정수 값으로'], ['③ 부호화', '0과 1의 2진 데이터로']];
      [10, 167, 324].forEach(function (px, i) {
        s += t(px + 73, 22, titles[i][0], { a: 'm', b: 1, c: i === 2 ? C.blue : C.ink });
        s += t(px + 73, 44, titles[i][1], { a: 'm', size: 13, c: C.sub });
      });
      function curve(px, dash) {
        var d = '';
        for (var k = 0; k <= 40; k++) { var u = k / 40; d += (k ? ' L' : 'M') + (px + 12 + u * 126).toFixed(1) + ',' + Y(L(u)).toFixed(1); }
        return F.path(d, { c: dash ? C.grayM : C.blue, w: dash ? 1.6 : 2.4, dash: dash ? '5 4' : null });
      }
      /* ① */
      s += line(22, 214, 150, 214, { c: C.sub, w: 1.2 }) + curve(10);
      us.forEach(function (u) { var x = 22 + u * 126; s += line(x, 214, x, Y(L(u)), { c: C.orange, w: 1.6 }) + dot(x, Y(L(u)), C.orange); });
      /* ② */
      for (var l = 0; l <= 7; l++) {
        s += line(179, Y(l), 307, Y(l), { c: C.edge, w: 1 });
        s += t(172, Y(l), String(l), { a: 'e', size: 13, c: C.sub, halo: false });
      }
      s += curve(167, true);
      var q = us.map(function (u) { return Math.round(L(u)); });
      us.forEach(function (u, i) { var x = 179 + u * 126; s += box(x - 5, Y(q[i]), 10, 214 - Y(q[i]), { fill: C.blueL, c: C.blue, r: 1, w: 1.2 }); });
      /* ③ */
      q.forEach(function (v, i) {
        var y = 76 + i * 25;
        s += t(350, y, String(v), { a: 'm', b: 1, c: C.orange }) + t(368, y, '→', { a: 'm', size: 14, c: C.sub }) +
          t(410, y, ('00' + v.toString(2)).slice(-3), { a: 'm', b: 1, c: C.blue, size: 17 });
      });
      s += arrow(150, 132, 166, 132, { w: 1.6, head: 8, c: C.sub }) + arrow(310, 132, 326, 132, { w: 1.6, head: 8, c: C.sub });
      return F.svg(480, 232, s);
    } },

  fanout: { cards: ['디지털 집적 회로 — SSI부터 UVLSI까지'],
    cap: '팬 아웃 — 한 출력이 안정적으로 구동할 수 있는 입력의 최대 개수 (TTL 은 적고 CMOS 는 많다)',
    draw: function () {
      var g0 = gate('and', 30, 118), s = g0.s;
      s += W([[16, g0.i[0][1]], g0.i[0]]) + W([[16, g0.i[1][1]], g0.i[1]]);
      s += W([g0.o, [120, 118]]) + dot(120, 118, C.orange);
      s += t(56, 158, '출력 1개', { a: 'm', b: 1, c: C.orange });
      [46, 94, 142, 190].forEach(function (y) {
        var g = gate('buf', 196, y, { h: 30, w: 30 });
        s += g.s + W([[120, 118], [150, 118], [150, y], g.i[0]], { c: C.orange, w: 2 }) + W([g.o, [244, y]]);
      });
      s += line(150, 46, 150, 190, { c: C.orange, w: 2 });
      s += t(214, 222, '입력 여러 개', { a: 'm', b: 1, c: C.orange });
      s += t(272, 58, '팬 아웃 (fan-out)', { b: 1, size: 17, c: C.blue });
      s += t(272, 90, '한 출력이 안정적으로', { size: 14 }) + t(272, 112, '구동할 수 있는 입력의', { size: 14 }) + t(272, 134, '최대 개수', { size: 14, b: 1, ans: 1 });
      s += box(270, 158, 190, 58, { fill: C.grayL, c: C.edge, r: 8, w: 1.2 });
      s += t(284, 176, 'TTL — 적다', { size: 14 }) + t(284, 200, 'CMOS — 많다', { size: 14, b: 1, c: C.blue });
      return F.svg(480, 240, s);
    } },

  tpd: { cards: ['디지털 집적 회로 — SSI부터 UVLSI까지'],
    cap: '전달 지연 시간 — 입력 신호가 바뀐 뒤 출력이 반응하기까지 걸리는 시간',
    draw: function () {
      var s = t(66, 60, '입력', { a: 'e', b: 1 }) + t(66, 140, '출력', { a: 'e', b: 1 });
      s += wave([160, 300], 0, 80, 450, 42, 80);
      s += wave([196, 336], 0, 80, 450, 122, 160, { c: C.blue });
      s += line(160, 32, 160, 184, { c: C.red, w: 1.2, dash: '5 4' }) + line(196, 32, 196, 184, { c: C.red, w: 1.2, dash: '5 4' });
      s += line(300, 32, 300, 172, { c: C.line, w: 1, dash: '5 4' }) + line(336, 32, 336, 172, { c: C.line, w: 1, dash: '5 4' });
      s += arrow(160, 184, 196, 184, { c: C.red, w: 1.4, head: 8, both: true });
      s += t(178, 206, '전달 지연 시간', { a: 'm', b: 1, c: C.red, size: 15 });
      s += t(452, 206, 'TTL 약 10 ns · CMOS 약 100 ns', { a: 'e', size: 13, c: C.sub });
      return F.svg(480, 226, s);
    } },

  'div-rem': { cards: ['수의 체계와 진수의 변환'],
    cap: '10진수 → 2진수 — 2로 계속 나누고 나머지를 거꾸로 읽는다 (숫자는 예시)',
    draw: function () {
      var s = '', q = [13, 6, 3, 1], rem = [1, 0, 1, 1];
      q.forEach(function (v, i) {
        var y = 44 + i * 40;
        s += t(56, y, '2', { a: 'm', b: 1, size: 18 }) + line(70, y - 16, 70, y + 16, { w: 1.6 }) + line(70, y + 16, 150, y + 16, { w: 1.6 });
        s += t(110, y, String(v), { a: 'm', b: 1, size: 19 });
      });
      s += t(110, 204, '0', { a: 'm', b: 1, size: 19 });
      rem.forEach(function (r, i) {
        var y = 84 + i * 40;
        s += t(158, y, '…', { size: 16, c: C.sub }) + t(186, y, String(r), { a: 'm', b: 1, size: 19, c: C.orange });
      });
      s += arrow(212, 210, 212, 76, { c: C.orange, w: 2.2 });
      s += t(226, 132, '나머지를', { b: 1, c: C.orange, size: 15 }) + t(226, 154, '아래에서 위로', { b: 1, c: C.orange, size: 15 });
      s += t(380, 76, '(13)₁₀', { a: 'm', b: 1, size: 22 });
      s += arrow(380, 96, 380, 136, { c: C.sub, w: 2 });
      s += t(380, 160, '(1101)₂', { a: 'm', b: 1, size: 24, c: C.blue });
      return F.svg(480, 226, s);
    } },

  'bit-group': { cards: ['수의 체계와 진수의 변환'],
    cap: '2진수 → 8진수는 3자리씩, 16진수는 4자리씩 — 소수점에서부터 묶고 모자라면 0을 채운다',
    draw: function () {
      var s = t(240, 22, '(100101110.011)₂', { a: 'm', b: 1, size: 17 });
      function row(y, groups, pads, digits, bw) {
        var x = 34, out = '';
        groups.forEach(function (gp, i) {
          if (gp === '.') { out += t(x + 6, y + 4, '.', { a: 'm', b: 1, size: 24 }) + t(x + 6, y + 52, '.', { a: 'm', b: 1, size: 22, c: C.blue }); x += 14; return; }
          out += box(x, y - 16, bw, 32, { fill: C.grayL, c: C.line, r: 6, w: 1.2 });
          for (var k = 0; k < gp.length; k++) {
            var padded = pads[i] && ((pads[i] > 0 && k < pads[i]) || (pads[i] < 0 && k >= gp.length + pads[i]));
            out += t(x + bw / (gp.length + 1) * (k + 1), y, gp[k], { a: 'm', b: 1, size: 17, c: padded ? C.orange : C.ink, halo: false });
          }
          out += arrow(x + bw / 2, y + 18, x + bw / 2, y + 36, { w: 1.4, head: 7, c: C.sub });
          out += t(x + bw / 2, y + 50, digits[i], { a: 'm', b: 1, size: 20, c: C.blue });
          x += bw + 8;
        });
        return out;
      }
      s += row(62, ['100', '101', '110', '.', '011'], [0, 0, 0, 0, 0], ['4', '5', '6', '', '3'], 50);
      s += row(158, ['0001', '0010', '1110', '.', '0110'], [3, 0, 0, 0, -1], ['1', '2', 'E', '', '6'], 62);
      s += t(330, 62, '3자리씩 (8 = 2³)', { size: 14 }) + t(330, 112, '(456.3)₈', { b: 1, size: 19, c: C.blue });
      s += t(330, 158, '4자리씩 (16 = 2⁴)', { size: 14 }) + t(330, 208, '(12E.6)₁₆', { b: 1, size: 19, c: C.blue });
      s += t(330, 184, '주황 0 = 채운 자리', { size: 13, c: C.orange });
      return F.svg(480, 232, s);
    } },

  complement: { cards: ['2진수의 연산과 보수'],
    cap: '1의 보수는 0과 1을 뒤집고, 2의 보수는 거기에 1을 더한다 (숫자는 예시)',
    draw: function () {
      var s = '', rows = [['원래 수', '0110', C.grayL, C.line], ['1의 보수', '1001', C.orangeL, C.orange], ['2의 보수', '1010', C.blueL, C.blue]];
      rows.forEach(function (r, i) {
        var y = 40 + i * 84;
        s += t(112, y, r[0], { a: 'e', b: 1 });
        for (var k = 0; k < 4; k++) s += box(128 + k * 44, y - 18, 38, 36, { fill: r[2], c: r[3], r: 6, w: 1.6, label: r[1][k], size: 19 });
      });
      for (var k = 0; k < 4; k++) s += arrow(147 + k * 44, 62, 147 + k * 44, 100, { c: C.orange, w: 1.6, head: 8 });
      s += t(318, 82, '0 ↔ 1 뒤집기', { b: 1, c: C.orange, size: 15 });
      s += arrow(147 + 3 * 44, 146, 147 + 3 * 44, 184, { c: C.blue, w: 1.6, head: 8 });
      s += t(318, 166, '+ 1', { b: 1, c: C.blue, size: 20 });
      s += t(240, 252, '컴퓨터는 뺄셈을 보수를 이용한 덧셈으로 처리한다', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 268, s);
    } },

  'bcd-digits': { cards: ['디지털 코드 — BCD·3초과·그레이·패리티'],
    cap: 'BCD(8421) 코드 — 10진수 한 자리마다 4비트 2진수로 (386 → 0011 1000 0110)',
    draw: function () {
      var s = '', d = ['3', '8', '6'], c = ['0011', '1000', '0110'];
      [100, 240, 380].forEach(function (x, i) {
        s += t(x, 34, d[i], { a: 'm', b: 1, size: 30 });
        s += arrow(x, 54, x, 82, { w: 1.6, head: 8, c: C.sub });
        s += box(x - 56, 88, 112, 44, { fill: C.blueL, c: C.blue, r: 8, w: 1.6 });
        for (var k = 0; k < 4; k++) {
          var bx = x - 36 + k * 24;
          s += t(bx, 111, c[i][k], { a: 'm', b: 1, size: 21, c: C.blue, halo: false });
          s += t(bx, 150, ['8', '4', '2', '1'][k], { a: 'm', size: 13, c: C.sub });
        }
      });
      s += t(290, 172, '작은 숫자 8 · 4 · 2 · 1 =', { a: 'e', size: 13, c: C.sub }) + t(296, 172, '자리마다의 가중치', { size: 13, c: C.sub, ans: 1 });
      s += t(240, 200, '1010 ~ 1111 여섯 개는 쓰지 않는다 (10개만 사용)', { a: 'm', size: 14, c: C.orange, b: 1 });
      return F.svg(480, 220, s);
    } },

  'gray-conv': { cards: ['디지털 코드 — BCD·3초과·그레이·패리티'],
    cap: '2진 → 그레이 코드 — 맨 앞은 그대로, 나머지는 이웃한 두 비트를 비교(같으면 0, 다르면 1) (숫자는 예시)',
    draw: function () {
      var s = '', b = '1011', g = '1110', xs = [120, 200, 280, 360];
      s += t(84, 56, '2진', { a: 'e', b: 1 }) + t(84, 206, '그레이', { a: 'e', b: 1, c: C.blue });
      xs.forEach(function (x, i) {
        s += box(x - 22, 36, 44, 40, { fill: C.grayL, c: C.line, r: 6, w: 1.4, label: b[i], size: 20 });
        s += box(x - 22, 186, 44, 40, { fill: C.blueL, c: C.blue, r: 6, w: 1.6, label: g[i], size: 20 });
      });
      s += arrow(120, 78, 120, 184, { c: C.sub, w: 1.8 }) + t(108, 130, '그대로', { a: 'e', size: 13, c: C.sub });
      for (var i = 1; i < 4; i++) {
        var cx = xs[i] - 40;
        s += line(xs[i - 1] + 8, 78, cx - 7, 120, { w: 1.6 }) + line(xs[i] - 8, 78, cx + 7, 120, { w: 1.6 });
        s += xorMark(cx, 131, 11) + arrow(cx + 4, 143, xs[i] - 6, 184, { w: 1.6, head: 8 });
      }
      s += t(412, 124, '같으면 0', { a: 'm', size: 14, b: 1, c: C.orange }) + t(412, 146, '다르면 1', { a: 'm', size: 14, b: 1, c: C.orange });
      return F.svg(480, 244, s);
    } },

  /* ─────────── Ⅱ. 논리 회로 소자 ─────────── */
  'switch-andor': { cards: ['불 대수의 공리와 기본 정리'],
    cap: 'AND 는 직렬 스위치(둘 다 닫혀야 켜짐), OR 는 병렬 스위치(하나만 닫혀도 켜짐)',
    draw: function () {
      var s = line(240, 16, 240, 250, { c: C.edge, w: 1.4, dash: '6 5' });
      function batt(x, y) {
        return line(x, y - 22, x, y - 7, { w: 1.8 }) + line(x - 13, y - 7, x + 13, y - 7, { w: 2.2 }) +
          line(x - 7, y + 3, x + 7, y + 3, { w: 3 }) + line(x, y + 3, x, y + 22, { w: 1.8 });
      }
      function sw(x1, y, x2, nm) {
        return dot(x1, y) + dot(x2, y) + line(x1, y, x2 - 4, y - 16, { w: 2.2, c: C.blue }) + t((x1 + x2) / 2, y - 26, nm, { a: 'm', b: 1, c: C.blue });
      }
      function lamp(x, y) {
        return '<circle cx="' + x + '" cy="' + y + '" r="14" fill="' + C.yellowL + '" stroke="' + C.ink + '" stroke-width="1.8"/>' +
          line(x - 9, y - 9, x + 9, y + 9, { w: 1.4 }) + line(x - 9, y + 9, x + 9, y - 9, { w: 1.4 }) + t(x + 22, y, 'Y', { b: 1 });
      }
      /* AND */
      s += t(120, 26, 'AND — 직렬', { a: 'm', b: 1, size: 17 }) + t(120, 48, 'Y = A · B', { a: 'm', b: 1, c: C.blue, size: 15 });
      var c1 = W([[40, 108], [40, 86], [70, 86]]) + sw(70, 86, 104, 'A') + W([[104, 86], [124, 86]]) + sw(124, 86, 158, 'B');
      c1 += W([[158, 86], [196, 86], [196, 112]]) + lamp(196, 126) + W([[196, 140], [196, 176], [40, 176], [40, 152]]) + batt(40, 130);
      s += F.g(c1, { y: 20 });
      s += t(120, 226, '둘 다 닫혀야 켜진다', { a: 'm', size: 14, b: 1 }) + t(120, 246, '1·1 = 1, 나머지는 0', { a: 'm', size: 13, c: C.sub });
      /* OR */
      s += t(360, 26, 'OR — 병렬', { a: 'm', b: 1, size: 17 }) + t(360, 48, 'Y = A + B', { a: 'm', b: 1, c: C.blue, size: 15 });
      var c2 = W([[274, 108], [274, 100], [306, 100]]) + W([[306, 82], [306, 120]]);
      c2 += W([[306, 82], [322, 82]]) + sw(322, 82, 356, 'A') + W([[356, 82], [376, 82]]);
      c2 += W([[306, 120], [322, 120]]) + sw(322, 120, 356, 'B') + W([[356, 120], [376, 120]]);
      c2 += W([[376, 82], [376, 120]]) + W([[376, 100], [430, 100], [430, 112]]) + lamp(430, 126);
      c2 += W([[430, 140], [430, 176], [274, 176], [274, 152]]) + batt(274, 130);
      s += F.g(c2, { y: 20 });
      s += t(360, 226, '하나만 닫혀도 켜진다', { a: 'm', size: 14, b: 1 }) + t(360, 246, '0+0 = 0, 나머지는 1', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 262, s);
    } },

  demorgan: { cards: ['불 대수의 기본 법칙'],
    cap: '드모르간의 법칙 — NAND 는 입력을 반전한 OR, NOR 는 입력을 반전한 AND 와 같다',
    draw: function () {
      var s = '';
      [[62, 'nand', 'or', '(A · B)′ = A′ + B′'], [168, 'nor', 'and', '(A + B)′ = A′ · B′']].forEach(function (r) {
        var y = r[0], g1 = gate(r[1], 60, y), g2 = gate(r[2], 280, y);
        s += t(24, g1.i[0][1], 'A', { a: 'm', b: 1 }) + t(24, g1.i[1][1], 'B', { a: 'm', b: 1 });
        s += W([[34, g1.i[0][1]], g1.i[0]]) + W([[34, g1.i[1][1]], g1.i[1]]) + g1.s + W([g1.o, [150, y]]) + t(158, y, 'Y', { b: 1 });
        s += t(206, y, '=', { a: 'm', b: 1, size: 26, c: C.sub });
        s += t(236, g2.i[0][1], 'A', { a: 'm', b: 1 }) + t(236, g2.i[1][1], 'B', { a: 'm', b: 1 });
        g2.i.forEach(function (p) { s += W([[246, p[1]], [p[0] - 9, p[1]]]) + bub(p[0] - 4.5, p[1], { c: C.orange }); });
        s += g2.s + W([g2.o, [360, y]]) + t(368, y, 'Y', { b: 1 });
        s += t(240, y + 40, r[3], { a: 'm', b: 1, c: C.blue, size: 17 });
      });
      s += t(420, 20, '○ = 반전', { a: 'm', size: 13, c: C.orange, b: 1 });
      return F.svg(480, 236, s);
    } },

  'sop-pos': { cards: ['논리곱의 합(SOP)과 논리합의 곱(POS)'],
    cap: 'SOP 는 출력이 1인 줄의 최소항을 OR 로, POS 는 출력이 0인 줄의 최대항을 AND 로 연결한다',
    draw: function () {
      var s = '', Y = [0, 1, 1, 0, 1, 0, 0, 1], cx = [42, 72, 102, 138];
      ['A', 'B', 'C', 'Y'].forEach(function (h, i) { s += t(cx[i], 30, h, { a: 'm', b: 1 }); });
      s += line(24, 44, 190, 44, { w: 1.4 }) + line(120, 18, 120, 262, { c: C.line, w: 1.2 });
      for (var i = 0; i < 8; i++) {
        var y = 60 + i * 26, one = Y[i] === 1;
        s += box(24, y - 12, 166, 24, { fill: one ? C.blueL : C.orangeL, c: 'none', r: 4, w: 0 });
        [i >> 2 & 1, i >> 1 & 1, i & 1, Y[i]].forEach(function (v, k) {
          s += t(cx[k], y, String(v), { a: 'm', size: 15, b: k === 3, c: k === 3 ? (one ? C.blue : C.orange) : C.ink, halo: false });
        });
        s += t(174, y, (one ? 'm' : 'M') + '₀₁₂₃₄₅₆₇'[i], { a: 'm', size: 14, b: 1, c: one ? C.blue : C.orange, halo: false });
      }
      s += box(226, 34, 240, 96, { fill: C.blueL, c: C.blue, r: 10, w: 1.6 });
      s += t(240, 58, 'SOP (논리곱의 합)', { b: 1, c: C.blue, halo: false });
      s += t(240, 82, '출력 1인 줄의 최소항을 OR', { size: 13, halo: false, ans: 1 });
      s += t(240, 108, 'Y = m₁ + m₂ + m₄ + m₇', { b: 1, size: 16, halo: false });
      s += box(226, 158, 240, 96, { fill: C.orangeL, c: C.orange, r: 10, w: 1.6 });
      s += t(240, 182, 'POS (논리합의 곱)', { b: 1, c: C.orange, halo: false });
      s += t(240, 206, '출력 0인 줄의 최대항을 AND', { size: 13, halo: false, ans: 1 });
      s += t(240, 232, 'Y = M₀ · M₃ · M₅ · M₆', { b: 1, size: 16, halo: false });
      s += arrow(196, 86, 224, 86, { c: C.blue, w: 1.8, head: 8 }) + arrow(196, 206, 224, 206, { c: C.orange, w: 1.8, head: 8 });
      return F.svg(480, 276, s);
    } },

  tristate: { cards: ['3상태 버퍼 게이트'],
    cap: '3상태 버퍼 — S = 0 이면 입력이 그대로 나가고, S = 1 이면 끊겨 출력이 하이 임피던스(Hi-Z)',
    draw: function () {
      var s = line(240, 14, 240, 226, { c: C.edge, w: 1.4, dash: '6 5' });
      [[0, 120, C.green], [1, 360, C.red]].forEach(function (r) {
        var on = r[0] === 0, cx = r[1], g = gate('buf', cx - 26, 104, { h: 46, w: 50 });
        s += t(cx, 24, 'S = ' + r[0], { a: 'm', b: 1, size: 17 });
        s += W([[cx - 80, 104], g.i[0]]) + t(cx - 90, 104, 'A', { a: 'e', b: 1 }) + g.s;
        s += bub(cx - 1, 86) + W([[cx - 1, 81.5], [cx - 1, 56]]) + t(cx + 8, 60, 'S', { b: 1, size: 15 });
        s += on ? W([g.o, [cx + 76, 104]]) : W([g.o, [cx + 76, 104]], { c: C.grayM, dash: '5 5' });
        s += t(cx + 84, 104, 'Y', { b: 1, c: on ? C.ink : C.grayM });
        s += t(cx, 148, on ? 'Y = A (보통 버퍼)' : 'Y = 하이 임피던스', { a: 'm', b: 1, c: r[2], size: 15, ans: !on });
        /* 스위치 비유 */
        s += dot(cx - 40, 190) + dot(cx + 40, 190) + W([[cx - 76, 190], [cx - 40, 190]]) + W([[cx + 40, 190], [cx + 76, 190]]);
        s += on ? line(cx - 40, 190, cx + 40, 190, { c: C.green, w: 2.6 }) : line(cx - 40, 190, cx + 30, 164, { c: C.red, w: 2.6 });
        s += t(cx, 216, on ? '연결 — 입력이 출력으로' : '끊김 — 입력과 출력이 차단', { a: 'm', size: 13, c: C.sub, ans: !on });
      });
      return F.svg(480, 232, s);
    } },

  /* ─────────── Ⅲ. 논리 회로 설계 ─────────── */
  simplify: { cards: ['논리식 간소화의 필요성과 방법'],
    cap: '간소화 — A + A·B 는 흡수 법칙으로 A 가 되어 게이트가 모두 사라진다',
    draw: function () {
      var s = t(120, 24, '간소화 전', { a: 'm', b: 1 }) + t(120, 46, 'Y = A + A·B', { a: 'm', b: 1, c: C.sub, size: 15 });
      var ga = gate('and', 64, 132), go = gate('or', 150, 96);
      s += t(18, 86, 'A', { a: 'm', b: 1 }) + t(18, 142, 'B', { a: 'm', b: 1 });
      s += W([[28, 86], go.i[0]]) + dot(44, 86) + W([[44, 86], [44, ga.i[0][1]], ga.i[0]]) + W([[28, 142], ga.i[1]]);
      s += ga.s + go.s + W([ga.o, [130, 132], [130, go.i[1][1]], go.i[1]]) + W([go.o, [224, 96]]) + t(230, 96, 'Y', { b: 1 });
      s += t(120, 182, '게이트 2개', { a: 'm', b: 1, c: C.red, size: 15 });
      s += arrow(246, 110, 282, 110, { c: C.green, w: 3, head: 14 });
      s += t(380, 24, '간소화 후', { a: 'm', b: 1, c: C.green }) + t(380, 46, 'Y = A', { a: 'm', b: 1, c: C.green, size: 15 });
      s += t(304, 110, 'A', { a: 'm', b: 1 }) + W([[316, 110], [440, 110]], { w: 2.4 }) + t(448, 110, 'Y', { b: 1 });
      s += t(380, 182, '게이트 0개 — 선 하나', { a: 'm', b: 1, c: C.green, size: 15 });
      s += t(240, 216, '흡수 법칙 : A + A·B = A·(1 + B) = A', { a: 'm', size: 14, c: C.sub });
      return F.svg(480, 234, s);
    } },

  'kmap-gray': { cards: ['카노 맵의 작성 원리'],
    cap: '카노 맵 — 축은 그레이 코드 순서(00·01·11·10), 인접한 1을 묶어 변하지 않는 변수만 남긴다',
    draw: function () {
      var s = kmap([['1', '1', '0', '0'], ['0', '1', '1', '0']],
        [{ r: [0, 0], c: [0, 1], col: C.blue, fill: C.blueL }, { r: [1, 1], c: [1, 2], col: C.green, fill: C.greenL }], { hot: [2, 3] });
      s += t(214, 22, '01 → 11 → 10 :', { a: 'e', b: 1, size: 14, c: C.red }) + t(222, 22, '이웃 칸은 한 비트만 다르다', { b: 1, size: 14, c: C.red, ans: 1 });
      s += t(440, ky(0), 'A′B′', { a: 'm', b: 1, c: C.blue, size: 17 }) + t(440, ky(1), 'AC', { a: 'm', b: 1, c: C.green, size: 17 });
      s += t(240, 214, 'Y =', { a: 'e', b: 1, size: 18 }) + t(248, 214, 'A′B′', { b: 1, size: 18, c: C.blue }) +
        t(300, 214, '+', { a: 'm', b: 1, size: 18 }) + t(312, 214, 'AC', { b: 1, size: 18, c: C.green });
      return F.svg(480, 236, s);
    } },

  'kmap-wrap': { cards: ['카노 맵 — 묶을 때 주의할 점'],
    cap: '카노 맵의 왼쪽 끝과 오른쪽 끝은 이어진 것으로 보아 한 묶음으로 묶을 수 있다',
    draw: function () {
      var s = kmap([['1', '0', '0', '1'], ['1', '0', '0', '1']],
        [{ r: [0, 1], c: [0, 0], col: C.blue, fill: C.blueL, open: 'l' }, { r: [0, 1], c: [3, 3], col: C.blue, fill: C.blueL, open: 'r' }]);
      s += carrow(kx(3), 192, 280, 234, kx(0) + 8, 194, { c: C.orange, dash: '6 4' });
      s += t(280, 244, '양 끝은 이어져 있다', { a: 'm', b: 1, size: 14, c: C.orange });
      s += t(240, 22, '4개 묶음 — C = 0 만 변하지 않는다', { a: 'm', b: 1, size: 14 });
      s += t(460, 244, 'Y = C′', { a: 'e', b: 1, size: 18, c: C.blue });
      return F.svg(480, 260, s);
    } },

  'kmap-dc': { cards: ['임의 상태(don’t care condition)'],
    cap: '임의 상태(×) — 1로 보고 묶으면 더 크게 묶일 때만 함께 묶는다',
    draw: function () {
      var s = kmap([['1', '1', '×', '0'], ['0', '1', '×', '×']],
        [{ r: [0, 1], c: [1, 2], col: C.orange, fill: C.orangeL }, { r: [0, 0], c: [0, 1], col: C.blue, fill: C.blueL }]);
      s += t(240, 22, '× 를 1로 보면 4개 묶음이 된다', { a: 'm', b: 1, size: 14, c: C.orange });
      s += t(440, ky(0), 'A′B′', { a: 'm', b: 1, c: C.blue, size: 17 }) + t(440, ky(1), 'C', { a: 'm', b: 1, c: C.orange, size: 17 });
      s += t(240, 214, 'Y =', { a: 'e', b: 1, size: 18 }) + t(248, 214, 'A′B′', { b: 1, size: 18, c: C.blue }) +
        t(300, 214, '+', { a: 'm', b: 1, size: 18 }) + t(312, 214, 'C', { b: 1, size: 18, c: C.orange });
      s += t(240, 240, '도움이 안 되는 m₆ 의 × 는 묶지 않는다', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 256, s);
    } },

  'comb-seq': { cards: ['조합 논리 회로 설계 5단계', '조합 논리 회로의 개요', '순서 논리 회로의 구성과 클록 펄스'],
    cap: '조합 논리 회로는 기억 소자가 없고, 순서 논리 회로는 기억 소자(플립플롭)의 출력이 되먹임된다',
    draw: function () {
      var s = t(20, 22, '조합 논리 회로', { b: 1, size: 17, c: C.blue });
      s += arrow(40, 66, 148, 66) + t(60, 52, '입력', { size: 14, c: C.sub });
      s += box(150, 42, 170, 48, { fill: C.blueL, c: C.blue, label: '게이트의 조합' });
      s += arrow(320, 66, 430, 66) + t(360, 52, '출력', { size: 14, c: C.sub });
      s += t(235, 108, '기억 소자 없음 — 입력이 정해지면 바로 출력', { a: 'm', size: 13, c: C.sub, ans: 1 });
      s += line(16, 126, 464, 126, { c: C.edge, w: 1.4, dash: '6 5' });
      s += t(20, 148, '순서 논리 회로', { b: 1, size: 17, c: C.orange });
      s += arrow(40, 188, 148, 188) + t(60, 174, '입력', { size: 14, c: C.sub });
      s += box(150, 164, 170, 48, { fill: C.blueL, c: C.blue, label: '조합 논리 회로' });
      s += arrow(320, 188, 430, 188) + t(360, 174, '출력', { size: 14, c: C.sub });
      s += box(150, 232, 170, 42, { fill: C.orangeL, c: C.orange, label: '기억 소자 (플립플롭)', size: 15 });
      s += F.route([[320, 202], [352, 202], [352, 253], [322, 253]], { c: C.orange, w: 2 });
      s += F.route([[150, 253], [116, 253], [116, 200], [148, 200]], { c: C.orange, w: 2 });
      s += t(108, 232, '되먹임', { a: 'e', b: 1, size: 14, c: C.orange });
      return F.svg(480, 290, s);
    } },

  impl: { cards: ['논리식·진리표로부터 회로 구현'],
    cap: 'Y = A·B·C + D·E — AND 가 OR 보다 먼저이므로 AND 를 먼저 만들고 OR 로 모은다',
    draw: function () {
      var s = '', g3 = gate('and', 90, 64, { n: 3, h: 50 }), g2 = gate('and', 90, 162), go = gate('or', 250, 112);
      ['A', 'B', 'C'].forEach(function (nm, i) { s += t(32, g3.i[i][1], nm, { a: 'm', b: 1 }) + W([[42, g3.i[i][1]], g3.i[i]]); });
      ['D', 'E'].forEach(function (nm, i) { s += t(32, g2.i[i][1], nm, { a: 'm', b: 1 }) + W([[42, g2.i[i][1]], g2.i[i]]); });
      s += g3.s + g2.s + go.s;
      s += W([g3.o, [210, 64], [210, go.i[0][1]], go.i[0]]) + W([g2.o, [210, 162], [210, go.i[1][1]], go.i[1]]);
      s += t(172, 50, 'A·B·C', { a: 'm', b: 1, size: 14, c: C.blue }) + t(172, 148, 'D·E', { a: 'm', b: 1, size: 14, c: C.blue });
      s += W([go.o, [330, 112]]) + t(338, 112, 'Y', { b: 1, size: 18 });
      s += t(90, 212, '① AND 먼저', { b: 1, size: 14, c: C.blue }) + t(250, 212, '② 그다음 OR', { b: 1, size: 14, c: C.green });
      return F.svg(480, 232, s);
    } },

  /* ─────────── Ⅳ. 조합 논리 회로 설계 ─────────── */
  'half-adder': { cards: ['반가산기(half adder)'],
    cap: '반가산기 — XOR 게이트 1개(합 S)와 AND 게이트 1개(자리 올림수 C)',
    draw: function () {
      var s = '', gx = gate('xor', 190, 64, { ans: 1 }), ga = gate('and', 190, 160, { ans: 1 });
      s += t(30, gx.i[0][1], 'A', { a: 'm', b: 1 }) + t(30, gx.i[1][1], 'B', { a: 'm', b: 1 });
      s += W([[40, gx.i[0][1]], gx.i[0]]) + W([[40, gx.i[1][1]], gx.i[1]]);
      s += dot(100, gx.i[0][1]) + W([[100, gx.i[0][1]], [100, ga.i[0][1]], ga.i[0]]);
      s += dot(130, gx.i[1][1]) + W([[130, gx.i[1][1]], [130, ga.i[1][1]], ga.i[1]]);
      s += gx.s + ga.s + W([gx.o, [320, 64]]) + W([ga.o, [320, 160]]);
      s += t(330, 56, 'S', { b: 1, size: 19, c: C.blue }) + t(350, 57, '합', { size: 14 }) + t(330, 82, 'S = A ⊕ B', { size: 14, c: C.sub });
      s += t(330, 152, 'C', { b: 1, size: 19, c: C.orange }) + t(350, 153, '자리 올림수', { size: 14 }) + t(330, 178, 'C = A · B', { size: 14, c: C.sub });
      return F.svg(480, 208, s);
    } },

  'full-adder': { cards: ['전가산기(full adder)'],
    cap: '전가산기 — 반가산기 2개와 OR 게이트 1개 (A, B, 아래 자리 올림수 Cᵢ 를 더한다)',
    draw: function () {
      var s = '', x1 = gate('xor', 90, 60), a1 = gate('and', 90, 212), x2 = gate('xor', 236, 70), a2 = gate('and', 236, 140), go = gate('or', 350, 176, { ans: 1 });
      s += box(76, 30, 94, 208, { fill: 'none', c: C.blue, r: 10, w: 1.4, dash: '6 4' }) + t(123, 22, '반가산기 ①', { a: 'm', b: 1, size: 13, c: C.blue, ans: 1 });
      s += box(222, 40, 94, 128, { fill: 'none', c: C.blue, r: 10, w: 1.4, dash: '6 4' }) + t(269, 32, '반가산기 ②', { a: 'm', b: 1, size: 13, c: C.blue, ans: 1 });
      s += t(22, x1.i[0][1], 'A', { a: 'm', b: 1 }) + t(22, x1.i[1][1], 'B', { a: 'm', b: 1 }) + sb(22, 130, 'C', 'i', { a: 'm', b: 1 });
      s += W([[32, x1.i[0][1]], x1.i[0]]) + W([[32, x1.i[1][1]], x1.i[1]]);
      s += dot(50, x1.i[0][1]) + W([[50, x1.i[0][1]], [50, a1.i[0][1]], a1.i[0]]);
      s += dot(62, x1.i[1][1]) + W([[62, x1.i[1][1]], [62, a1.i[1][1]], a1.i[1]]);
      s += W([[34, 130], [200, 130], [200, a2.i[0][1]], a2.i[0]]) + dot(200, 130) + W([[200, 130], [200, x2.i[1][1]], x2.i[1]]);
      s += W([x1.o, [180, 60], [180, x2.i[0][1]], x2.i[0]]) + dot(180, x2.i[0][1]) + W([[180, x2.i[0][1]], [180, a2.i[1][1]], a2.i[1]]);
      s += x1.s + a1.s + x2.s + a2.s + go.s;
      s += W([a2.o, [330, 140], [330, go.i[0][1]], go.i[0]]) + W([a1.o, [330, 212], [330, go.i[1][1]], go.i[1]]);
      s += W([x2.o, [420, 70]]) + W([go.o, [420, 176]]);
      s += t(428, 70, 'S', { b: 1, size: 19, c: C.blue }) + t(428, 94, '합', { size: 13, c: C.sub });
      s += sb(428, 176, 'C', 'o', { b: 1, size: 19, c: C.orange }) + t(428, 200, '올림수', { size: 13, c: C.sub });
      return F.svg(480, 252, s);
    } },

  'half-sub': { cards: ['반감산기와 전감산기'],
    cap: '반감산기 — 차 D = A ⊕ B, 빌림수 bₒ = A′·B (반가산기와 달리 A 를 반전해 AND)',
    draw: function () {
      var s = '', gx = gate('xor', 196, 56), gn = gate('not', 108, 146, { h: 30, w: 30 }), ga = gate('and', 196, 156);
      s += t(30, gx.i[0][1], 'A', { a: 'm', b: 1 }) + t(30, gx.i[1][1], 'B', { a: 'm', b: 1 });
      s += W([[40, gx.i[0][1]], gx.i[0]]) + W([[40, gx.i[1][1]], gx.i[1]]);
      s += dot(80, gx.i[0][1]) + W([[80, gx.i[0][1]], [80, 146], gn.i[0]]);
      s += gn.s + W([gn.o, [170, 146], [170, ga.i[0][1]], ga.i[0]]) + t(164, 132, 'A′', { a: 'm', b: 1, size: 14, c: C.orange, ans: 1 });
      s += dot(176, gx.i[1][1]) + W([[176, gx.i[1][1]], [176, ga.i[1][1] - 0.01], [176, ga.i[1][1]], ga.i[1]]);
      s += gx.s + ga.s + W([gx.o, [320, 56]]) + W([ga.o, [320, 156]]);
      s += t(330, 48, 'D', { b: 1, size: 19, c: C.blue }) + t(350, 49, '차', { size: 14 }) + t(330, 74, 'D = A ⊕ B', { size: 14, c: C.sub });
      s += sb(330, 148, 'b', 'o', { b: 1, size: 19, c: C.orange }) + t(352, 149, '빌림수', { size: 14 }) + t(330, 174, '= A′ · B', { size: 14, c: C.sub, ans: 1 });
      s += gn.s.length ? t(118, 188, '반가산기와 다른 곳 — A 를 반전', { a: 'm', size: 13, b: 1, c: C.orange, ans: 1 }) : '';
      s += box(98, 124, 56, 44, { fill: 'none', c: C.orange, r: 8, w: 1.6, dash: '5 4' });
      return F.svg(480, 208, s);
    } },

  'par-adder': { cards: ['병렬 가산기'],
    cap: '4비트 병렬 가산기 — 반가산기 1개 + 전가산기 3개, 아래 자리의 올림수가 다음 자리로 넘어간다',
    draw: function () {
      var s = '', xs = [60, 170, 280, 390];
      xs.forEach(function (x, i) {
        var bit = 3 - i, half = bit === 0;
        s += box(x, 76, 80, 56, { fill: half ? C.orangeL : C.blueL, c: half ? C.orange : C.blue, r: 8, w: 1.8, label: half ? '반가산기' : '전가산기', size: 15, ans: 1 });
        s += arrow(x + 24, 38, x + 24, 74, { w: 1.6, head: 8 }) + arrow(x + 56, 38, x + 56, 74, { w: 1.6, head: 8 });
        s += sb(x + 24, 26, 'A', String(bit), { a: 'm', b: 1, size: 15 }) + sb(x + 56, 26, 'B', String(bit), { a: 'm', b: 1, size: 15 });
        s += arrow(x + 40, 134, x + 40, 164, { w: 1.6, head: 8, c: C.blue }) + sb(x + 40, 178, 'S', String(bit), { a: 'm', b: 1, size: 15, c: C.blue });
        var cx = x - 30;
        s += arrow(x, 104, x - 28, 104, { c: C.orange, w: 2, head: 9 });
        s += sb(x - 15, 90, 'C', String(bit + 1), { a: 'm', b: 1, size: 14, c: C.orange });
      });
      s += t(240, 212, '첫째 자리는 아래 올림수가 없어 반가산기 · IC 7483', { a: 'm', size: 13, c: C.sub, ans: 1 });
      return F.svg(480, 226, s);
    } },

  'bcd-adder': { cards: ['BCD 가산기'],
    cap: 'BCD 가산기 — 4비트 가산기의 합이 9보다 크면 보정 회로(K₅ = 1)가 0110 을 더해 준다',
    draw: function () {
      var s = box(120, 48, 220, 50, { fill: C.blueL, c: C.blue, r: 8, w: 1.8, label: '4비트 병렬 가산기 ①', size: 15 });
      s += arrow(180, 22, 180, 46, { w: 1.6, head: 8 }) + arrow(290, 22, 290, 46, { w: 1.6, head: 8 });
      s += t(172, 16, 'A₄A₃A₂A₁', { a: 'e', size: 14, b: 1 }) + t(298, 16, 'B₄B₃B₂B₁', { size: 14, b: 1 });
      s += arrow(390, 73, 342, 73, { w: 1.6, head: 8 }) + t(398, 73, 'K₁', { size: 14, b: 1 });
      s += box(14, 128, 174, 64, { fill: C.orangeL, c: C.orange, r: 8, w: 1.8 });
      s += t(101, 150, '보정 회로', { a: 'm', b: 1, c: C.orange, halo: false }) + t(101, 174, 'K₅ = C₅ + S₄S₃ + S₄S₂', { a: 'm', size: 13, b: 1, halo: false });
      s += F.route([[120, 73], [70, 73], [70, 126]], { c: C.ink, w: 1.6, head: 8 }) + t(92, 62, 'C₅', { a: 'm', size: 14, b: 1 });
      s += arrow(290, 100, 290, 224, { w: 1.6, head: 8 }) + t(298, 206, 'S₄S₃S₂S₁', { size: 14, b: 1 });
      s += dot(290, 160) + arrow(290, 160, 190, 160, { w: 1.6, head: 8 }) + t(240, 150, 'S₄ S₃ S₂', { a: 'm', size: 13, b: 1, c: C.sub });
      s += box(180, 226, 220, 50, { fill: C.blueL, c: C.blue, r: 8, w: 1.8, label: '4비트 병렬 가산기 ②', size: 15 });
      s += W([[101, 194], [101, 251]], { c: C.orange, w: 2 }) + dot(101, 251, C.orange) + arrow(101, 251, 178, 251, { c: C.orange, w: 2, head: 9 });
      s += t(140, 238, '0 K₅ K₅ 0', { a: 'm', size: 13, b: 1, c: C.orange, ans: 1 });
      s += arrow(101, 251, 101, 296, { c: C.orange, w: 2, head: 9 }) + t(110, 292, 'K₅ (10의 자리)', { size: 13, b: 1, c: C.orange });
      s += arrow(290, 278, 290, 300, { w: 1.6, head: 8, c: C.blue }) + t(300, 294, 'Z₄Z₃Z₂Z₁', { size: 14, b: 1, c: C.blue });
      return F.svg(480, 312, s);
    } },

  /* ─────────── Ⅴ. 조합 논리 회로 응용 ─────────── */
  enc42: { cards: ['인코더(부호기)'],
    cap: '4×2 인코더 — Y₀ = D₁ + D₃ , Y₁ = D₂ + D₃ (OR 게이트 2개, D₀ 는 쓰이지 않는다)',
    draw: function () {
      var s = '', rx = [70, 116, 162, 208], g0 = gate('or', 290, 80), g1 = gate('or', 290, 164);
      ['0', '1', '2', '3'].forEach(function (k, i) {
        s += sb(rx[i], 24, 'D', k, { a: 'm', b: 1, c: i ? C.ink : C.sub });
        s += line(rx[i], 38, rx[i], i ? 196 : 120, { w: 1.8, c: i ? C.ink : C.grayM, dash: i ? null : '5 4' });
      });
      s += t(70, 138, '연결 없음', { a: 'm', size: 13, c: C.sub });
      s += dot(rx[1], g0.i[0][1]) + W([[rx[1], g0.i[0][1]], g0.i[0]]);
      s += dot(rx[3], g0.i[1][1]) + W([[rx[3], g0.i[1][1]], g0.i[1]]);
      s += dot(rx[2], g1.i[0][1]) + W([[rx[2], g1.i[0][1]], g1.i[0]]);
      s += dot(rx[3], g1.i[1][1]) + W([[rx[3], g1.i[1][1]], g1.i[1]]);
      s += g0.s + g1.s + W([g0.o, [360, 80]]) + W([g1.o, [360, 164]]);
      s += sb(368, 72, 'Y', '0', { b: 1, size: 18, c: C.blue }) + t(368, 98, 'D₁ + D₃', { size: 14, c: C.sub });
      s += sb(368, 156, 'Y', '1', { b: 1, size: 18, c: C.blue }) + t(368, 182, 'D₂ + D₃', { size: 14, c: C.sub });
      s += t(240, 222, '입력 4개 중 하나만 1 → 2비트 2진수로', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 238, s);
    } },

  dec24: { cards: ['디코더(해독기)', '2×4 디코더와 3×8 디코더의 진리표'],
    cap: '2×4 디코더 — NOT 2개와 AND 4개, 출력 하나하나가 그 자리의 최소항이다',
    draw: function () {
      var s = '', RA = 60, RAn = 132, RB = 176, RBn = 248;
      var na = gate('not', 76, 40, { h: 28, w: 28 }), nb = gate('not', 192, 84, { h: 28, w: 28 });
      s += t(18, 40, 'A', { a: 'm', b: 1 }) + W([[28, 40], na.i[0]]) + dot(RA, 40) + na.s + W([na.o, [RAn, 40], [RAn, 262]]);
      s += t(18, 84, 'B', { a: 'm', b: 1 }) + W([[28, 84], nb.i[0]]) + dot(RB, 84) + nb.s + W([nb.o, [RBn, 84], [RBn, 262]]);
      s += W([[RA, 40], [RA, 262]]) + W([[RB, 84], [RB, 262]]);
      [['A', RA], ['A′', RAn], ['B', RB], ['B′', RBn]].forEach(function (r) { s += t(r[1], 276, r[0], { a: 'm', b: 1, size: 14, c: C.sub }); });
      var ands = [[RAn, RBn, 'A′B′'], [RAn, RB, 'A′B'], [RA, RBn, 'AB′'], [RA, RB, 'AB']];
      ands.forEach(function (a, i) {
        var y = 124 + i * 40, g = gate('and', 310, y, { h: 30, w: 40, label: false });
        s += dot(a[0], g.i[0][1]) + W([[a[0], g.i[0][1]], g.i[0]]) + dot(a[1], g.i[1][1]) + W([[a[1], g.i[1][1]], g.i[1]]);
        s += g.s + W([g.o, [380, y]]) + sb(388, y, 'Y', String(i), { b: 1, c: C.blue, tail: ' = ' + a[2], size: 15 });
      });
      return F.svg(480, 290, s);
    } },

  mux: { cards: ['멀티플렉서(MUX)'],
    cap: '4×1 멀티플렉서 — 선택 입력 S₁S₀ 가 데이터 입력 4개 중 하나를 골라 출력으로 보낸다',
    draw: function () {
      var s = F.poly([[170, 30], [270, 64], [270, 176], [170, 210]], { close: 1, fill: C.grayL, w: 2 });
      [60, 100, 140, 180].forEach(function (y, i) {
        var on = i === 2;
        s += W([[70, y], [182, y]], { c: on ? C.blue : C.ink, w: on ? 2.6 : 1.8 }) + dot(182, y, on ? C.blue : C.ink);
        s += sb(60, y, 'D', String(i), { a: 'e', b: 1, c: on ? C.blue : C.ink });
      });
      s += line(252, 120, 184, 140, { c: C.blue, w: 3 }) + dot(252, 120, C.blue);
      s += W([[252, 120], [360, 120]], { c: C.blue, w: 2.6 }) + t(368, 120, 'Y', { b: 1, size: 18, c: C.blue });
      s += t(220, 70, 'MUX', { a: 'm', b: 1, size: 14, c: C.sub, halo: false });
      s += W([[204, 199], [204, 228]]) + W([[238, 187], [238, 228]]);
      s += sb(196, 240, 'S', '1', { a: 'e', b: 1, size: 15, tail: ' = 1' }) + sb(246, 240, 'S', '0', { b: 1, size: 15, tail: ' = 0' });
      s += t(300, 170, 'S₁S₀ = 10', { b: 1, size: 15, c: C.blue }) + t(300, 192, '→ D₂ 가 Y 로 나간다', { size: 14, c: C.blue });
      s += t(300, 48, '데이터 선택기', { b: 1, size: 15 }) + t(300, 70, '입력 4 · 선택 2 · 출력 1', { size: 13, c: C.sub });
      return F.svg(480, 256, s);
    } },

  demux: { cards: ['디멀티플렉서(DEMUX)'],
    cap: '1×4 디멀티플렉서 — 입력 1개를 선택 입력 S₁S₀ 가 가리키는 출력 하나로 보낸다',
    draw: function () {
      var s = F.poly([[170, 64], [270, 30], [270, 210], [170, 176]], { close: 1, fill: C.grayL, w: 2 });
      s += t(60, 120, 'D', { a: 'e', b: 1, c: C.blue, size: 18 }) + W([[70, 120], [188, 120]], { c: C.blue, w: 2.6 }) + dot(188, 120, C.blue);
      s += line(188, 120, 256, 100, { c: C.blue, w: 3 });
      [60, 100, 140, 180].forEach(function (y, i) {
        var on = i === 1;
        s += dot(258, y, on ? C.blue : C.ink) + W([[258, y], [360, y]], { c: on ? C.blue : C.ink, w: on ? 2.6 : 1.8 });
        s += sb(368, y, 'Y', String(i), { b: 1, c: on ? C.blue : C.ink });
      });
      s += t(220, 70, 'DEMUX', { a: 'm', b: 1, size: 13, c: C.sub, halo: false });
      s += W([[204, 187], [204, 228]]) + W([[238, 199], [238, 228]]);
      s += sb(196, 240, 'S', '1', { a: 'e', b: 1, size: 15, tail: ' = 0' }) + sb(246, 240, 'S', '0', { b: 1, size: 15, tail: ' = 1' });
      s += t(20, 170, 'S₁S₀ = 01', { b: 1, size: 15, c: C.blue }) + t(20, 192, '→ D 가 Y₁ 로', { size: 14, c: C.blue });
      s += t(20, 40, '분배기', { b: 1, size: 15 }) + t(20, 62, '입력 1 · 선택 2', { size: 13, c: C.sub }) + t(20, 80, '출력 4', { size: 13, c: C.sub });
      return F.svg(480, 256, s);
    } },

  'half-comp': { cards: ['비교기'],
    cap: '반비교기 — 1비트 A, B 를 견주어 H(A &gt; B) · L(A &lt; B) · NE(A ≠ B) · E(A = B) 를 낸다',
    draw: function () {
      var s = '', RA = 50, RB = 76, RAn = 170, RBn = 200;
      var na = gate('not', 100, 30, { h: 26, w: 26 }), nb = gate('not', 120, 64, { h: 26, w: 26 });
      s += t(16, 30, 'A', { a: 'm', b: 1 }) + W([[26, 30], na.i[0]]) + dot(RA, 30) + na.s + W([na.o, [RAn, 30], [RAn, 262]]);
      s += t(16, 64, 'B', { a: 'm', b: 1 }) + W([[26, 64], nb.i[0]]) + dot(RB, 64) + nb.s + W([nb.o, [RBn, 64], [RBn, 262]]);
      s += W([[RA, 30], [RA, 262]]) + W([[RB, 64], [RB, 262]]);
      [['A', RA], ['B', RB], ['A′', RAn], ['B′', RBn]].forEach(function (r) { s += t(r[1], 276, r[0], { a: 'm', b: 1, size: 14, c: C.sub }); });
      var rows = [['and', RA, RBn, 'H', '(A > B)'], ['and', RAn, RB, 'L', '(A < B)'], ['xor', RA, RB, 'NE', '(A ≠ B)'], ['xnor', RA, RB, 'E', '(A = B)']];
      rows.forEach(function (r, i) {
        var y = 104 + i * 46, g = gate(r[0], 280, y, { h: 32, w: 44, label: false });
        s += dot(r[1], g.i[0][1]) + W([[r[1], g.i[0][1]], g.i[0]]) + dot(r[2], g.i[1][1]) + W([[r[2], g.i[1][1]], g.i[1]]);
        s += g.s + W([g.o, [372, y]]) + t(378, y - 9, r[3], { b: 1, size: 16, c: C.blue }) + t(378, y + 11, r[4], { size: 13, c: C.sub });
        s += t(236, y - 23, ['A·B′', 'A′·B', 'A ⊕ B', '(A ⊕ B)′'][i], { a: 'm', size: 13, c: C.sub, b: 1, ans: 1 });
      });
      return F.svg(480, 290, s);
    } },

  'gray-circ': { cards: ['코드 변환기', '코드 변환기의 논리식'],
    cap: '2진 → 그레이는 이웃한 두 비트의 XOR, 그레이 → 2진은 윗비트부터 차례로 XOR 를 이어 간다',
    draw: function () {
      var s = t(20, 18, '2진수 → 그레이 코드', { b: 1, c: C.blue }) + t(460, 18, '이웃한 두 비트의 XOR', { a: 'e', size: 13, c: C.sub });
      var BY = [40, 76, 112, 148], names = ['3', '2', '1', '0'];
      names.forEach(function (k, i) { s += sb(30, BY[i], 'B', k, { a: 'm', b: 1 }); });
      s += W([[42, BY[0]], [400, BY[0]]]) + sb(408, BY[0], 'G', '3', { b: 1, c: C.blue });
      for (var i = 0; i < 3; i++) {
        var gy = BY[i + 1] - 7, g = gate('xor', 200, gy, { h: 28, w: 40, label: false }), tx = i === 0 ? 150 : 160;
        s += dot(tx, BY[i]) + W([[tx, BY[i]], [tx, g.i[0][1]], g.i[0]]) + W([[42, BY[i + 1]], g.i[1]]);
        s += g.s + W([g.o, [400, gy]]) + sb(408, gy, 'G', names[i + 1], { b: 1, c: C.blue });
      }
      s += line(16, 168, 464, 168, { c: C.edge, w: 1.4, dash: '6 5' });
      s += t(20, 188, '그레이 코드 → 2진수', { b: 1, c: C.green }) + t(460, 188, '위 비트를 하나씩 더 XOR', { a: 'e', size: 13, c: C.sub });
      var GY = [212, 246, 280, 314];
      names.forEach(function (k, i) { s += sb(30, GY[i], 'G', k, { a: 'm', b: 1 }); });
      s += W([[42, GY[0]], [400, GY[0]]]) + sb(408, GY[0], 'B', '3', { b: 1, c: C.green });
      var prevY = GY[0], prevX = 130;
      for (var j = 0; j < 3; j++) {
        var x = 150 + j * 80, y = GY[j + 1] - 7, gg = gate('xor', x, y, { h: 28, w: 40, label: false });
        s += dot(prevX, prevY) + W([[prevX, prevY], [prevX, gg.i[0][1]], gg.i[0]]);
        s += W([[42, GY[j + 1]], gg.i[1]]);
        s += gg.s + W([gg.o, [400, y]]) + sb(408, y, 'B', names[j + 1], { b: 1, c: C.green });
        prevY = y; prevX = gg.o[0] + 16;
      }
      return F.svg(480, 332, s);
    } },

  /* ─────────── Ⅵ. 순서 논리 회로 설계 ─────────── */
  'wave-clk': { cards: ['순서 논리 회로의 구성과 클록 펄스'],
    cap: '클록 펄스 — 0에서 1로 올라가는 곳이 상승 에지, 1에서 0으로 내려가는 곳이 하강 에지',
    draw: function () {
      var s = wave([90, 160, 230, 300, 370, 440], 0, 40, 460, 80, 150, { w: 2.8 });
      s += t(26, 80, '1', { a: 'm', size: 14, b: 1, c: C.sub }) + t(26, 150, '0', { a: 'm', size: 14, b: 1, c: C.sub });
      s += line(230, 60, 230, 160, { c: C.red, w: 1.4, dash: '5 4' }) + line(300, 60, 300, 160, { c: C.blue, w: 1.4, dash: '5 4' });
      s += arrow(222, 138, 222, 92, { c: C.red, w: 2, head: 9 }) + arrow(308, 92, 308, 138, { c: C.blue, w: 2, head: 9 });
      s += t(224, 44, '상승 에지 (0 → 1)', { a: 'e', b: 1, size: 14, c: C.red, ans: 1 });
      s += t(306, 44, '하강 에지 (1 → 0)', { b: 1, size: 14, c: C.blue, ans: 1 });
      s += F.dim(230, 104, 300, 104, '폭', { c: C.green, ans: 1 });
      s += arrow(90, 178, 230, 178, { c: C.sub, w: 1.4, head: 8, both: true }) + t(160, 196, '주기', { a: 'm', b: 1, size: 14, c: C.sub, ans: 1 });
      return F.svg(480, 214, s);
    } },

  'rs-nor': { cards: ['RS 래치 — NOR 게이트'],
    cap: 'NOR 게이트 RS 래치 — 두 NOR 의 출력이 서로의 입력으로 되먹임된다 (R = S = 1 은 금지)',
    draw: function () {
      var s = '', g1 = gate('nor', 190, 70), g2 = gate('nor', 190, 166);
      s += t(30, g1.i[0][1], 'R', { a: 'm', b: 1, size: 18 }) + W([[42, g1.i[0][1]], g1.i[0]]);
      s += t(30, g2.i[1][1], 'S', { a: 'm', b: 1, size: 18 }) + W([[42, g2.i[1][1]], g2.i[1]]);
      s += g1.s + g2.s + W([g1.o, [380, 70]]) + W([g2.o, [380, 166]]);
      s += t(390, 70, 'Q', { b: 1, size: 18 }) + t(390, 166, 'Q′', { b: 1, size: 18 });
      s += dot(300, 70, C.orange) + W([[300, 70], [300, 112], [160, 112], [160, g2.i[0][1]], g2.i[0]], { c: C.orange, w: 2 });
      s += dot(320, 166, C.orange) + W([[320, 166], [320, 126], [172, 126], [172, g1.i[1][1]], g1.i[1]], { c: C.orange, w: 2 });
      s += t(330, 119, '되먹임', { b: 1, size: 13, c: C.orange });
      s += t(240, 212, '세트 S = 1 → Q = 1 · 리셋 R = 1 → Q = 0 · 둘 다 0 → 불변', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 228, s);
    } },

  'ff-symbols': { cards: ['플립플롭의 특성과 종류', 'JK 플립플롭'],
    cap: '플립플롭 4종의 논리 기호 — 모두 1비트를 기억하고, 입력과 클록(CP)에 따라 Q 가 정해진다',
    draw: function () {
      var s = '', defs = [['RS', [['S', 22], ['CP', 48, 'c'], ['R', 74]], '세트·리셋'], ['JK', [['J', 22], ['CP', 48, 'c'], ['K', 74]], '+ 반전(토글)'],
        ['D', [['D', 22], ['CP', 48, 'c']], '입력을 지연'], ['T', [['T', 22], ['CP', 48, 'c']], '클록마다 반전']];
      defs.forEach(function (d, i) {
        var x = 38 + i * 116, f = ff(x, 30, 64, 96, { l: d[1], r: [['Q', 22], ['Q′', 74]] });
        s += f.s + t(x + 32, 152, d[0], { a: 'm', b: 1, size: 18, c: C.blue }) + t(x + 32, 176, d[2], { a: 'm', size: 13, c: C.sub, ans: 1 });
      });
      return F.svg(480, 194, s);
    } },

  'toggle-wave': { cards: ['JK 플립플롭', 'D 플립플롭과 T 플립플롭'],
    cap: 'J = K = 1 (T = 1) — 클록이 올라갈 때마다 Q 가 0 ↔ 1 로 뒤집힌다(토글)',
    draw: function () {
      var edges = [100, 160, 220, 280, 340, 400], xs = [], s = '';
      edges.forEach(function (e) { xs.push(e, e + 30); });
      s += t(80, 22, '조건 : J = K = 1 (T 플립플롭은 T = 1)', { b: 1, size: 15 });
      s += t(64, 64, 'CP', { a: 'e', b: 1 }) + wave(xs, 0, 72, 450, 48, 80);
      s += t(64, 132, 'Q', { a: 'e', b: 1, c: C.blue }) + wave(edges, 0, 72, 450, 116, 148, { c: C.blue, w: 2.8 });
      edges.forEach(function (e) { s += line(e, 44, e, 156, { c: C.red, w: 1, dash: '4 4' }); });
      s += t(240, 184, '빨간 점선 = 상승 에지 — 그때마다 Q 가 반전된다', { a: 'm', size: 13, c: C.sub, ans: 1 });
      return F.svg(480, 200, s);
    } },

  'd-t-jk': { cards: ['D 플립플롭과 T 플립플롭'],
    cap: 'JK 로 만드는 D·T 플립플롭 — D 는 K 앞에 NOT 을 넣고, T 는 J 와 K 를 하나로 묶는다',
    draw: function () {
      var s = line(240, 14, 240, 226, { c: C.edge, w: 1.4, dash: '6 5' });
      var f1 = ff(130, 40, 66, 108, { l: [['J', 22], ['CP', 54, 'c'], ['K', 86]], r: [['Q', 22], ['Q′', 86]] });
      var gn = gate('not', 62, 126, { h: 26, w: 26 });
      s += f1.s + t(22, 62, 'D', { a: 'm', b: 1, size: 18, c: C.orange }) + W([[32, 62], f1.p.J]) + dot(44, 62, C.orange);
      s += W([[44, 62], [44, 126], gn.i[0]], { c: C.orange, w: 2 }) + gn.s + W([gn.o, f1.p.K]);
      s += t(94, 94, 'CP', { a: 'e', size: 14 }) + W([[98, 94], f1.p.CP]);
      s += t(120, 188, 'D 플립플롭', { a: 'm', b: 1, c: C.blue, size: 17, ans: 1 }) + t(120, 212, 'J 와 K 에 늘 반대 값', { a: 'm', size: 13, c: C.sub });
      var f2 = ff(360, 40, 66, 108, { l: [['J', 22], ['CP', 54, 'c'], ['K', 86]], r: [['Q', 22], ['Q′', 86]] });
      s += f2.s + t(262, 62, 'T', { a: 'm', b: 1, size: 18, c: C.orange }) + W([[272, 62], f2.p.J]) + dot(290, 62, C.orange);
      s += W([[290, 62], [290, 126], f2.p.K], { c: C.orange, w: 2 });
      s += t(322, 94, 'CP', { a: 'e', size: 14 }) + W([[326, 94], f2.p.CP]);
      s += t(360, 188, 'T 플립플롭', { a: 'm', b: 1, c: C.blue, size: 17, ans: 1 }) + t(360, 212, 'J 와 K 에 늘 같은 값', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 228, s);
    } },

  'rs-nand': { cards: ['RS 래치 — NAND 게이트'],
    cap: 'NAND 게이트 RS 래치 — 입력이 0 일 때 작동한다 (S = R = 0 은 금지, NOR 래치와 반대)',
    draw: function () {
      var s = '', g1 = gate('nand', 190, 70), g2 = gate('nand', 190, 166);
      s += t(30, g1.i[0][1], 'S', { a: 'm', b: 1, size: 18 }) + W([[42, g1.i[0][1]], g1.i[0]]);
      s += t(30, g2.i[1][1], 'R', { a: 'm', b: 1, size: 18 }) + W([[42, g2.i[1][1]], g2.i[1]]);
      s += g1.s + g2.s + W([g1.o, [380, 70]]) + W([g2.o, [380, 166]]);
      s += t(390, 70, 'Q', { b: 1, size: 18 }) + t(390, 166, 'Q′', { b: 1, size: 18 });
      s += dot(300, 70, C.orange) + W([[300, 70], [300, 112], [160, 112], [160, g2.i[0][1]], g2.i[0]], { c: C.orange, w: 2 });
      s += dot(320, 166, C.orange) + W([[320, 166], [320, 126], [172, 126], [172, g1.i[1][1]], g1.i[1]], { c: C.orange, w: 2 });
      s += t(330, 119, '되먹임', { b: 1, size: 13, c: C.orange });
      s += t(240, 212, '세트 S = 0 → Q = 1 · 리셋 R = 0 → Q = 0 · 둘 다 1 → 불변', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 228, s);
    } },

  'clk-rs': { cards: ['클록형 RS 래치 — 래치와 플립플롭의 갈림길'],
    cap: '클록형 RS 래치(RS 플립플롭) — R, S 를 클록 펄스와 AND 로 묶어 클록이 있을 때만 작동한다',
    draw: function () {
      var s = '', a1 = gate('and', 100, 70, { ans: 1 }), a2 = gate('and', 100, 170, { ans: 1 }), n1 = gate('nor', 250, 80), n2 = gate('nor', 250, 160);
      s += box(236, 40, 190, 160, { fill: 'none', c: C.sub, r: 10, w: 1.2, dash: '6 4' }) + t(420, 30, 'RS 래치', { a: 'e', size: 13, b: 1, c: C.sub });
      s += t(24, a1.i[0][1], 'R', { a: 'm', b: 1, size: 17 }) + W([[34, a1.i[0][1]], a1.i[0]]);
      s += t(24, a2.i[1][1], 'S', { a: 'm', b: 1, size: 17 }) + W([[34, a2.i[1][1]], a2.i[1]]);
      s += t(24, 120, 'CP', { a: 'm', b: 1, size: 15, c: C.blue }) + W([[38, 120], [70, 120]], { c: C.blue, w: 2.2 }) + dot(70, 120, C.blue);
      s += W([[70, 120], [70, a1.i[1][1]], a1.i[1]], { c: C.blue, w: 2.2 }) + W([[70, 120], [70, a2.i[0][1]], a2.i[0]], { c: C.blue, w: 2.2 });
      s += a1.s + a2.s + n1.s + n2.s;
      s += W([a1.o, [200, a1.o[1]], [200, n1.i[0][1]], n1.i[0]]) + W([a2.o, [200, a2.o[1]], [200, n2.i[1][1]], n2.i[1]]);
      s += W([n1.o, [460, 80]]) + W([n2.o, [460, 160]]) + t(440, 66, 'Q', { b: 1, size: 17 }) + t(440, 146, 'Q′', { b: 1, size: 17 });
      s += dot(350, 80, C.orange) + W([[350, 80], [350, 112], [222, 112], [222, n2.i[0][1]], n2.i[0]], { c: C.orange, w: 2 });
      s += dot(372, 160, C.orange) + W([[372, 160], [372, 126], [232, 126], [232, n1.i[1][1]], n1.i[1]], { c: C.orange, w: 2 });
      s += t(240, 222, 'CP = 0 이면 AND 출력이 0 → R, S 가 바뀌어도 Q 는 그대로', { a: 'm', size: 13, c: C.sub, ans: 1 });
      return F.svg(480, 238, s);
    } },

  'clk-edge': { cards: ['클록형 RS 래치 — 래치와 플립플롭의 갈림길'],
    cap: '클록 단자에 동그라미가 없으면 상승 에지, 있으면 하강 에지에 작동한다',
    draw: function () {
      var s = line(240, 14, 240, 214, { c: C.edge, w: 1.4, dash: '6 5' });
      [[120, 'c', '상승 에지', C.red], [360, 'n', '하강 에지', C.blue]].forEach(function (d) {
        var x = d[0] - 32, f = ff(x, 34, 64, 84, { l: [['S', 18], ['CP', 42, d[1]], ['R', 66]], r: [['Q', 18], ['Q′', 66]] });
        s += t(d[0], 20, d[1] === 'c' ? '동그라미 없음' : '동그라미 있음', { a: 'm', size: 13, c: C.sub }) + f.s;
        s += t(d[0], 144, d[2], { a: 'm', b: 1, size: 17, c: d[3] });
        var px = d[0] - 70;
        s += wave([px + 40, px + 100], 0, px, px + 140, 166, 198, { w: 2.2 });
        s += d[1] === 'c' ? arrow(px + 40, 204, px + 40, 160, { c: d[3], w: 2.4, head: 10 }) : arrow(px + 100, 160, px + 100, 204, { c: d[3], w: 2.4, head: 10 });
      });
      return F.svg(480, 220, s);
    } },

  'pr-clr': { cards: ['비동기 입력 — 프리셋과 클리어'],
    cap: '비동기 입력 — 프리셋(PR)·클리어(CLR)는 0 일 때 작동하고 클록과 관계없이 Q 를 정한다',
    draw: function () {
      var f = ff(180, 66, 90, 116, { l: [['J', 26], ['CP', 58, 'c'], ['K', 90]], r: [['Q', 26], ['Q′', 90]], top: 'PR', bot: 'CLR' });
      var s = f.s + W([[124, 92], f.p.J]) + W([[124, 124], f.p.CP]) + W([[124, 156], f.p.K]);
      s += t(116, 92, 'J', { a: 'e', b: 1 }) + t(116, 124, 'CP', { a: 'e', b: 1 }) + t(116, 156, 'K', { a: 'e', b: 1 });
      s += t(225, 30, 'PR', { a: 'm', b: 1, c: C.red }) + t(225, 222, 'CLR', { a: 'm', b: 1, c: C.blue });
      s += t(300, 36, 'PR = 0 → 무조건 Q = 1', { b: 1, size: 14, c: C.red });
      s += t(300, 216, 'CLR = 0 → 무조건 Q = 0', { b: 1, size: 14, c: C.blue });
      s += F.callout(231, 60, 300, 72, '○ = 0 일 때 작동', { size: 13, c: C.orange, tc: C.orange, b: 1, ans: 1 });
      s += t(240, 250, '둘 다 1 → 클록에 따라 동작 · 둘 다 0 → 사용 금지', { a: 'm', size: 13, c: C.sub, ans: 1 });
      return F.svg(480, 266, s);
    } },

  'moore-mealy': { cards: ['동기 순서 논리 회로의 해석 — 상태표와 상태도'],
    cap: '상태도의 출력 표시 — 무어 머신은 상태(동그라미) 안에, 밀리 머신은 선 위에 「입력/출력」으로 (상태·값은 예시)',
    draw: function () {
      var s = line(240, 14, 240, 214, { c: C.edge, w: 1.4, dash: '6 5' });
      s += t(120, 24, '무어 머신 (Moore)', { a: 'm', b: 1 }) + t(120, 46, '출력 = 현재 상태만의 함수', { a: 'm', size: 13, c: C.sub });
      s += t(360, 24, '밀리 머신 (Mealy)', { a: 'm', b: 1 }) + t(360, 46, '출력 = 현재 상태 + 입력', { a: 'm', size: 13, c: C.sub });
      function st(cx, name, out) {
        return F.circle(cx, 130, 34, { fill: C.blueL, c: C.blue, w: 2 }) +
          sb(cx, out ? 120 : 130, name[0], name[1], { a: 'm', b: 1, size: 17, halo: false }) +
          (out ? t(cx, 144, out, { a: 'm', size: 14, b: 1, c: C.orange, halo: false }) : '');
      }
      s += st(66, ['S', '0'], '/ 0') + st(176, ['S', '1'], '/ 1');
      s += carrow(92, 108, 121, 76, 150, 108, { c: C.ink }) + t(121, 80, '1', { a: 'm', b: 1, size: 15 });
      s += carrow(150, 152, 121, 184, 92, 152, { c: C.ink }) + t(121, 184, '1', { a: 'm', b: 1, size: 15 });
      s += st(306, ['S', '0']) + st(416, ['S', '1']);
      s += carrow(332, 108, 361, 76, 390, 108, { c: C.ink }) + t(361, 78, '1/0', { a: 'm', b: 1, size: 15, c: C.orange });
      s += carrow(390, 152, 361, 184, 332, 152, { c: C.ink }) + t(361, 186, '1/1', { a: 'm', b: 1, size: 15, c: C.orange });
      s += t(240, 214, '주황 글자 = 출력이 적히는 자리', { a: 'm', size: 13, c: C.orange });
      return F.svg(480, 230, s);
    } },

  /* ─────────── Ⅶ. 순서 논리 회로 응용 ─────────── */
  reg4: { cards: ['레지스터'],
    cap: '4비트 레지스터 — 플립플롭 1개가 1비트, 4개가 나란히 4비트를 기억하고 클록은 함께 받는다',
    draw: function () {
      var s = '', xs = [48, 156, 264, 372];
      xs.forEach(function (x, i) {
        var bit = String(3 - i);
        s += box(x, 60, 64, 76, { fill: C.blueL, c: C.blue, r: 6, w: 1.8 });
        s += t(x + 32, 76, 'D', { a: 'm', size: 14, halo: false }) + t(x + 32, 122, 'Q', { a: 'm', size: 14, halo: false });
        s += F.poly([[x, 104], [x + 10, 111], [x, 118]], { c: C.ink, w: 1.6 });
        s += arrow(x + 32, 26, x + 32, 58, { w: 1.6, head: 8 }) + sb(x + 40, 26, 'D', bit, { b: 1, size: 15 });
        s += arrow(x + 32, 138, x + 32, 168, { w: 1.6, head: 8, c: C.blue }) + sb(x + 40, 162, 'Q', bit, { b: 1, size: 15, c: C.blue });
        s += dot(x - 16, 196, C.orange) + W([[x - 16, 196], [x - 16, 111], [x, 111]], { c: C.orange, w: 2 });
      });
      s += W([[20, 196], [356, 196]], { c: C.orange, w: 2.4 }) + t(20, 214, 'CP (모든 플립플롭에 공통)', { b: 1, size: 13, c: C.orange });
      return F.svg(480, 228, s);
    } },

  'shift-rot': { cards: ['시프트 레지스터와 순환 레지스터', '레지스터'],
    cap: '오른쪽으로 1번 옮기기 — 시프트는 밀려난 값이 사라지고, 순환은 밀려난 값이 처음 자리로 돌아온다',
    draw: function () {
      var s = '', X = [150, 198, 246, 294];
      function cells(y, vals, fills) {
        var o = '';
        vals.forEach(function (v, i) { o += box(X[i], y - 20, 44, 40, { fill: fills[i] || C.grayL, c: C.line, r: 6, w: 1.4, label: v, size: 19 }); });
        return o;
      }
      function shifts(y1, y2) { var o = ''; for (var i = 0; i < 3; i++) o += arrow(X[i] + 26, y1 + 22, X[i + 1] + 16, y2 - 22, { w: 1.4, head: 7, c: C.sub }); return o; }
      s += t(20, 50, '시프트', { b: 1, size: 17, c: C.blue }) + t(20, 72, '(오른쪽)', { size: 13, c: C.sub });
      s += t(142, 50, '처음', { a: 'e', size: 13, c: C.sub }) + cells(50, ['4', '3', '2', '1'], []);
      s += t(142, 118, '1번 뒤', { a: 'e', size: 13, c: C.sub }) + cells(118, ['새', '4', '3', '2'], [C.greenL]);
      s += shifts(50, 118);
      s += arrow(X[3] + 30, 72, 372, 104, { c: C.red, w: 1.8, head: 9 }) + t(380, 106, '1 삭제', { b: 1, size: 15, c: C.red, ans: 1 });
      s += t(380, 132, '새 값 기록', { size: 13, c: C.green, b: 1 });
      s += line(16, 152, 464, 152, { c: C.edge, w: 1.4, dash: '6 5' });
      s += t(20, 186, '순환', { b: 1, size: 17, c: C.orange }) + t(20, 208, '(오른쪽)', { size: 13, c: C.sub });
      s += t(142, 186, '처음', { a: 'e', size: 13, c: C.sub }) + cells(186, ['4', '3', '2', '1'], [0, 0, 0, C.orangeL]);
      s += t(124, 254, '1번 뒤', { a: 'e', size: 13, c: C.sub }) + cells(254, ['1', '4', '3', '2'], [C.orangeL]);
      s += shifts(186, 254);
      s += F.route([[X[3] + 44, 186], [370, 186], [370, 220], [136, 220], [136, 254], [148, 254]], { c: C.orange, w: 2.2, head: 9 });
      s += t(380, 206, '1 이 처음', { b: 1, size: 14, c: C.orange, ans: 1 }) + t(380, 226, '자리로', { b: 1, size: 14, c: C.orange, ans: 1 });
      return F.svg(480, 284, s);
    } },

  sipo4: { cards: ['직렬 레지스터와 병렬 레지스터'],
    cap: '데이터가 들어오고 나가는 방식에 따른 레지스터 4가지 — 한 줄로(직렬) 또는 한꺼번에(병렬)',
    draw: function () {
      var s = line(240, 10, 240, 290, { c: C.edge, w: 1.4, dash: '6 5' }) + line(10, 150, 470, 150, { c: C.edge, w: 1.4, dash: '6 5' });
      var P = [[0, 0, 's', 's', '직렬 입력 → 직렬 출력', '통신용 모뎀'], [240, 0, 'p', 's', '병렬 입력 → 직렬 출력', '송신 · 멀티플렉서 필요'],
        [0, 150, 's', 'p', '직렬 입력 → 병렬 출력', '수신'], [240, 150, 'p', 'p', '병렬 입력 → 병렬 출력', '병렬 데이터 통신']];
      P.forEach(function (p) {
        var px = p[0], py = p[1], x0 = px + 56;
        s += t(px + 120, py + 20, p[4], { a: 'm', b: 1, size: 14 });
        for (var i = 0; i < 4; i++) s += box(x0 + i * 32, py + 58, 30, 30, { fill: C.blueL, c: C.blue, r: 4, w: 1.4 });
        if (p[2] === 's') s += arrow(px + 12, py + 73, x0 - 2, py + 73, { c: C.orange, w: 2, head: 8 });
        else for (var j = 0; j < 4; j++) s += arrow(x0 + 15 + j * 32, py + 34, x0 + 15 + j * 32, py + 56, { c: C.orange, w: 1.6, head: 7 });
        if (p[3] === 's') s += arrow(x0 + 128, py + 73, px + 228, py + 73, { c: C.green, w: 2, head: 8 });
        else for (var k = 0; k < 4; k++) s += arrow(x0 + 15 + k * 32, py + 90, x0 + 15 + k * 32, py + 112, { c: C.green, w: 1.6, head: 7 });
        s += t(px + 120, py + 134, p[5], { a: 'm', size: 13, c: p[2] === 'p' && p[3] === 's' ? C.red : C.sub, b: p[2] === 'p' && p[3] === 's', ans: 1 });
      });
      return F.svg(480, 296, s);
    } },

  ripple: { cards: ['비동기식 카운터 — 상향과 하향'],
    cap: '비동기식(리플) 3비트 상향 카운터 — 첫 플립플롭에만 CP, 나머지는 앞 플립플롭의 Q 를 클록으로 받는다',
    draw: function () {
      var s = '', xs = [70, 216, 362], nm = ['A', 'B', 'C'], outs = [];
      xs.forEach(function (x, i) {
        var f = ff(x, 70, 84, 100, { l: [['J', 22], ['CP', 50, 'n'], ['K', 78]], r: [['Q', 22], ['Q′', 78]], name: ['F', nm[i]], ny: -26 });
        s += f.s + t(f.p.J[0] - 4, f.p.J[1], '1', { a: 'e', b: 1, size: 15, c: C.sub }) + t(f.p.K[0] - 4, f.p.K[1], '1', { a: 'e', b: 1, size: 15, c: C.sub });
        outs.push(f.p);
        if (i === 0) s += t(20, 106, 'CP', { b: 1, size: 15, c: C.blue }) + W([[20, 120], f.p.CP], { c: C.blue, w: 2.2 });
      });
      [0, 1].forEach(function (i) {
        var q = outs[i].Q, vx = q[0] + 16, cp = outs[i + 1].CP;
        s += W([q, [vx, q[1]], [vx, cp[1]], cp], { c: C.orange, w: 2.2 }) + dot(vx, q[1], C.orange) + arrow(vx, q[1], vx, 44, { c: C.orange, w: 2, head: 9 });
        s += sb(vx, 30, 'Q', nm[i], { a: 'm', b: 1, size: 15, tail: i === 0 ? ' (LSB)' : '' });
      });
      var qc = outs[2].Q;
      s += W([qc, [qc[0] + 4, qc[1]]]) + arrow(qc[0] + 4, qc[1], qc[0] + 4, 44, { w: 2, head: 9 }) + sb(qc[0] + 6, 30, 'Q', 'C', { a: 'e', b: 1, size: 15, tail: ' (MSB)' });
      s += t(240, 206, 'J = K = 1 · 하강 에지 · 앞 단의 Q → 다음 단의 CP', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 224, s);
    } },

  'ripple-wave': { cards: ['비동기식 카운터 — 상향과 하향'],
    cap: '3비트 상향 카운터의 파형 — CP 가 내려갈 때마다 1씩 늘어 000 → 111 → 다시 000',
    draw: function () {
      var s = '', P = 48, x0 = 70, fe = [];
      for (var k = 0; k < 8; k++) fe.push(x0 + P * k + 36);
      var cpx = [];
      for (var j = 0; j < 8; j++) cpx.push(x0 + P * j + 12, x0 + P * j + 36);
      s += t(58, 42, 'CP', { a: 'e', b: 1 }) + wave(cpx, 0, x0, 460, 30, 54);
      fe.forEach(function (x) { s += line(x, 24, x, 206, { c: C.line, w: 1, dash: '4 4' }); });
      [['A', 0, 96], ['B', 1, 140], ['C', 2, 184]].forEach(function (r) {
        var bit = r[1], xs = [], prev = 0;
        for (var n = 1; n <= 8; n++) { var v = (n % 8) >> bit & 1; if (v !== prev) { xs.push(fe[n - 1]); prev = v; } }
        s += sb(52, r[2], 'Q', r[0], { a: 'e', b: 1, c: C.blue }) + wave(xs, 0, x0, 460, r[2] - 12, r[2] + 12, { c: C.blue, w: 2.4 });
      });
      for (var c = 0; c <= 8; c++) {
        var xa = c === 0 ? x0 : fe[c - 1], xb = c === 8 ? 460 : fe[c], v = c % 8;
        if (xb - xa < 30) continue;
        s += t((xa + xb) / 2, 226, ('00' + v.toString(2)).slice(-3), { a: 'm', size: 13, b: 1, c: C.orange });
      }
      s += t(58, 226, '세기', { a: 'e', size: 13, b: 1, c: C.orange });
      return F.svg(480, 240, s);
    } },

  ring5: { cards: ['동기식 카운터와 링 카운터'],
    cap: '동기식 5진 링 카운터 — D 플립플롭 5개, 클록은 모두 동시에, 마지막 Q 가 처음 D 로 돌아간다',
    draw: function () {
      var s = '', xs = [40, 128, 216, 304, 392], nm = ['A', 'B', 'C', 'D', 'E'];
      s += F.route([[464, 92], [464, 30], [24, 30], [24, 92], [36, 92]], { c: C.orange, w: 2.2, head: 8 });
      s += t(244, 20, '마지막 Q → 처음 D', { a: 'm', size: 13, b: 1, c: C.orange });
      xs.forEach(function (x, i) {
        var f = ff(x, 70, 56, 76, { l: [['D', 22], ['CP', 56, 'n']], r: [['Q', 22]], name: ['F', nm[i]], ny: -2 });
        s += f.s + sb(x + 72, 56, 'Q', nm[i], { a: 'm', b: 1, size: 14, c: C.blue });
        s += t(x + 28, 162, i === 0 ? '1' : '0', { a: 'm', b: 1, size: 16, c: i === 0 ? C.orange : C.sub });
        s += dot(x - 26, 190, C.blue) + W([[x - 26, 190], [x - 26, 126], f.p.CP], { c: C.blue, w: 2 });
      });
      s += W([[18, 190], [366, 190]], { c: C.blue, w: 2.4 }) + t(18, 208, 'CP (동시에)', { b: 1, size: 13, c: C.blue });
      s += t(460, 162, '← 처음 값', { a: 'e', size: 13, c: C.sub });
      s += t(460, 208, '1 이 한 칸씩 옮겨 간다', { a: 'e', size: 13, b: 1, c: C.orange, ans: 1 });
      return F.svg(480, 222, s);
    } }

  };
})();
