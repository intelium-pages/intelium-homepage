// Cenas e capas SVG compartilhadas pelas páginas do blog e de cases (baixado uma vez, em cache).
(function () {
  var SC = {}, CV = {};
  window.InteliumScene = function (name, pt, R) {
    var ck = name + (pt ? ':pt' : ':en'); if (SC[ck]) return SC[ck];
    const h = R.createElement; let n = 0; const k = () => name + n++;
    const C = { a9: 'var(--color-accent-900)', a8: 'var(--color-accent-800)', a7: 'var(--color-accent-700)', a5: 'var(--color-accent-500)', a3: 'var(--color-accent-300)', a1: 'var(--color-accent-100)', n8: 'var(--color-neutral-800)', n7: 'var(--color-neutral-700)', n6: 'var(--color-neutral-600)', n5: 'var(--color-neutral-500)', n4: 'var(--color-neutral-400)', n3: 'var(--color-neutral-300)', n1: 'var(--color-neutral-100)', bg: 'var(--color-bg)' };
    const tx = (x, y, s, o = {}) => h('text', { key: k(), x, y, textAnchor: o.a || 'middle', style: { fontFamily: 'var(--font-body)', fontSize: o.s || 9, letterSpacing: o.ls || '.08em', fill: o.c || C.n4, fontWeight: o.w || 400 } }, s);
    const box = (x, y, w, hh, o = {}) => h('rect', { key: k(), x, y, width: w, height: hh, rx: o.rx ?? 6, fill: o.f || C.n8, stroke: o.s || C.n6, strokeWidth: o.sw || 1, strokeDasharray: o.d || 'none', opacity: o.o ?? 1 });
    const ln = (d, o = {}) => h('path', { key: k(), d, fill: 'none', stroke: o.s || C.a7, strokeWidth: o.w || 1.2, strokeDasharray: o.d || 'none', opacity: o.o ?? 1, strokeLinecap: 'round' });
    const dot = (path, dur, begin, r = 2.4, c = C.a1) => h('circle', { key: k(), r, fill: c, style: { filter: 'drop-shadow(0 0 4px var(--color-accent))' } }, h('animateMotion', { dur: dur + 's', begin: begin + 's', repeatCount: 'indefinite', path }));
    const pulse = (x, y, r, dur = 2.4) => h('circle', { key: k(), cx: x, cy: y, r, fill: 'none', stroke: C.a5, strokeWidth: 1, style: { transformBox: 'fill-box', transformOrigin: 'center', animation: 'ring ' + dur + 's ease-out infinite' } });
    const kids = [h('defs', { key: 'd' }, h('linearGradient', { id: 'bg' + name, x1: 0, y1: 0, x2: 1, y2: 1 }, h('stop', { offset: 0, stopColor: C.a9 }), h('stop', { offset: 1, stopColor: C.n8 })), h('radialGradient', { id: 'gl' + name }, h('stop', { offset: 0, stopColor: C.a7, stopOpacity: .55 }), h('stop', { offset: 1, stopColor: C.a7, stopOpacity: 0 }))), h('rect', { key: 'b', width: 400, height: 225, fill: 'url(#bg' + name + ')' }), h('circle', { key: 'g', cx: 300, cy: 60, r: 160, fill: 'url(#gl' + name + ')' })];
    const T = (a, b) => pt ? a : b;
    if (name === 'fraud') {
      // stream of card transactions, one flagged
      for (let i = 0; i < 6; i++) { const y = 40 + i * 30, p = 'M-20 ' + y + ' L 230 ' + y; kids.push(ln(p, { s: C.n6, w: 1 }), dot(p, 2.6 + i * .3, -i * .7, 2, i === 3 ? C.a1 : C.a3)); for (let c = 0; c < 4; c++) kids.push(box(20 + c * 52 + (i % 2) * 20, y - 7, 34, 14, { rx: 3, f: C.n8, s: i === 3 && c === 2 ? C.a5 : C.n6 })); }
      kids.push(box(240, 56, 120, 112, { f: C.a9, s: C.a5, rx: 10 }), tx(300, 80, 'FLINK · ML', { c: C.a3 }), tx(300, 96, T('score de risco', 'risk score'), { s: 8, c: C.a3 }));
      for (let i = 0; i < 5; i++) kids.push(h('rect', { key: k(), x: 262 + i * 16, y: 150 - (14 + i * 9), width: 10, height: 14 + i * 9, rx: 2, fill: i === 4 ? C.a1 : C.a5, opacity: .6 + i * .1 }));
      kids.push(h('circle', { key: k(), cx: 300, cy: 190, r: 12, fill: C.bg, stroke: C.a1, strokeWidth: 1.4 }), ln('M294 190 L306 190 M300 184 L300 196', { s: C.a1, w: 1.6 }), h('g', { key: k(), transform: 'rotate(45 300 190)' }, ln('M292 190 L308 190', { s: C.a1, w: 1.6 })), pulse(300, 190, 12), tx(300, 214, T('bloqueado em 40 ms', 'blocked in 40 ms'), { s: 8, c: C.a1 }));
      kids.push(tx(20, 24, T('TRANSAÇÕES AO VIVO', 'LIVE TRANSACTIONS'), { a: 'start' }), tx(380, 24, T('DECISÃO', 'DECISION'), { a: 'end' }));
    }
    if (name === 'retail') {
      kids.push(tx(70, 24, T('LOJA', 'STORE')), tx(200, 24, 'E-COMMERCE'), tx(330, 24, T('ESTOQUE', 'INVENTORY')));
      kids.push(box(30, 36, 80, 56, { rx: 4 }), ln('M30 50 L110 50', { s: C.n6, w: 1 }), box(40, 60, 18, 24, { rx: 2, f: C.a8, s: C.a7 }), box(64, 60, 18, 24, { rx: 2, f: C.a8, s: C.a7 }), box(88, 60, 12, 24, { rx: 2, f: C.n7, s: C.n6 }));
      kids.push(box(160, 36, 80, 56, { rx: 6 }), box(170, 46, 60, 28, { rx: 2, f: C.a9, s: C.a7 }), tx(200, 64, T('carrinho', 'cart'), { s: 8, c: C.a3 }), box(180, 80, 40, 6, { rx: 3, f: C.a5, s: 'none' }));
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) kids.push(box(292 + c * 20, 40 + r * 18, 16, 14, { rx: 2, f: (r * 4 + c) % 5 ? C.a8 : C.n7, s: (r * 4 + c) % 5 ? C.a7 : C.n6 }));
      const hub = 'M70 92 C 70 140, 200 140, 200 160', hub2 = 'M200 92 L200 160', hub3 = 'M330 92 C 330 140, 200 140, 200 160';
      [hub, hub2, hub3].forEach((p, i) => kids.push(ln(p), dot(p, 2 + i * .4, -i * .6)));
      kids.push(box(120, 160, 160, 40, { f: C.a9, s: C.a5, rx: 8 }), tx(200, 178, 'KAFKA · ' + T('EVENTOS', 'EVENTS'), { c: C.a3 }), tx(200, 192, T('estoque, preço e pedido no mesmo segundo', 'stock, price and order in the same second'), { s: 7.5, c: C.a1 }));
      kids.push(tx(200, 216, T('vs. batch às 23h59', 'vs. batch at 11:59 pm'), { s: 8, c: C.n4 }));
    }
    if (name === 'mesh') {
      const D = [[90, 70, T('Vendas', 'Sales')], [310, 70, T('Produção', 'Production')], [90, 170, T('Logística', 'Logistics')], [310, 170, T('Qualidade', 'Quality')]];
      D.forEach(([x, y, l], i) => { kids.push(h('circle', { key: k(), cx: x, cy: y, r: 36, fill: C.a9, stroke: C.a5, strokeWidth: 1 }), tx(x, y - 2, l, { s: 9.5, c: C.a1, ls: '.02em' }), tx(x, y + 12, T('dono dos dados', 'owns its data'), { s: 7, c: C.a3 })); for (let j = 0; j < 3; j++) kids.push(box(x - 22 + j * 16, y + 20, 12, 8, { rx: 1.5, f: C.a8, s: C.a7 })); });
      [[0, 1], [0, 2], [1, 3], [2, 3], [0, 3], [1, 2]].forEach(([a, b], i) => { const p = 'M' + D[a][0] + ' ' + D[a][1] + ' L' + D[b][0] + ' ' + D[b][1]; kids.push(ln(p, { s: C.a7, w: 1, d: i > 3 ? '3 4' : 'none', o: .8 }), dot(p, 3 + i * .3, -i * .5, 2)); });
      kids.push(box(160, 100, 80, 40, { f: C.bg, s: C.a3, rx: 8 }), tx(200, 117, T('CONTRATOS', 'CONTRACTS'), { c: C.a1, s: 8.5 }), tx(200, 130, 'Schema Registry', { s: 7.5, c: C.a3 }));
      kids.push(tx(200, 24, T('SEM SILO CENTRAL · PRODUTOS DE DADOS POR DOMÍNIO', 'NO CENTRAL SILO · DATA PRODUCTS BY DOMAIN'), { s: 8 }));
    }
    if (name === 'genbi') {
      kids.push(box(24, 40, 170, 150, { rx: 8 }), tx(109, 60, 'DASHBOARD', { s: 8 }));
      for (let i = 0; i < 7; i++) kids.push(h('rect', { key: k(), x: 40 + i * 20, y: 150 - (20 + ((i * 37) % 60)), width: 12, height: 20 + ((i * 37) % 60), rx: 2, fill: C.n6 }));
      kids.push(ln('M40 170 L180 170', { s: C.n6, w: 1 }), tx(109, 183, T('ontem', 'yesterday'), { s: 7.5, c: C.n5 }));
      kids.push(ln('M200 115 L226 115', { s: C.a3, w: 1.4 }), ln('M220 109 L226 115 L220 121', { s: C.a3, w: 1.4 }));
      kids.push(box(236, 40, 140, 150, { f: C.a9, s: C.a5, rx: 8 }), tx(306, 60, 'GenBI', { c: C.a1, s: 10, ls: '.04em' }));
      kids.push(box(248, 72, 116, 30, { rx: 15, f: C.bg, s: C.a7 }), tx(306, 91, T('"quanto vendemos agora?"', '"how much did we sell now?"'), { s: 7.5, c: C.a1, ls: 0 }));
      kids.push(box(248, 112, 116, 64, { rx: 6, f: C.a8, s: C.a7 }), tx(306, 134, 'R$ 1.284.930', { s: 14, c: C.a1, w: 500, ls: 0 }), tx(306, 150, T('últimos 60 s · +12% vs. ontem', 'last 60 s · +12% vs. yesterday'), { s: 7.5, c: C.a3, ls: 0 }));
      let w = 'M254 170'; for (let x = 0; x <= 104; x += 8) w += ' L' + (254 + x) + ' ' + (170 - Math.abs(Math.sin(x / 11)) * 8); kids.push(h('path', { key: k(), d: w, fill: 'none', stroke: C.a3, strokeWidth: 1.2, strokeDasharray: '40 200', style: { animation: 'dash 3s linear infinite' } }));
      kids.push(h('circle', { key: k(), cx: 358, cy: 162, r: 3, fill: C.a1 }), pulse(358, 162, 3, 2));
      kids.push(tx(200, 212, T('da pergunta à resposta sobre dados ao vivo', 'from question to answer on live data'), { s: 8 }));
    }
    if (name === 'ibm') {
      kids.push(box(24, 60, 130, 110, { rx: 8 }), tx(89, 80, 'IBM', { c: C.n1, s: 11, w: 500, ls: '.14em' }));
      ['MQ', 'Mainframe', 'Event Streams', 'Cloud Pak'].forEach((s, i) => kids.push(box(36, 90 + i * 18, 106, 13, { rx: 2, f: C.n7, s: C.n6 }), tx(89, 100 + i * 18, s, { s: 7.5, c: C.n3, ls: '.02em' })));
      kids.push(box(246, 60, 130, 110, { f: C.a9, s: C.a5, rx: 8 }), tx(311, 80, 'CONFLUENT', { c: C.a1, s: 11, w: 500, ls: '.14em' }));
      ['Kafka', 'Flink', 'Schema Registry', 'Tableflow'].forEach((s, i) => kids.push(box(258, 90 + i * 18, 106, 13, { rx: 2, f: C.a8, s: C.a7 }), tx(311, 100 + i * 18, s, { s: 7.5, c: C.a1, ls: '.02em' })));
      kids.push(h('path', { key: k(), d: 'M154 115 C 190 115, 210 115, 246 115', fill: 'none', stroke: C.a5, strokeWidth: 2 }), dot('M154 115 L246 115', 1.8, 0), dot('M246 115 L154 115', 1.8, -.9, 2.4, C.a3));
      kids.push(h('path', { key: k(), d: 'M24 44 L376 44', fill: 'none', stroke: C.a7, strokeWidth: 1, strokeDasharray: '4 4' }), box(150, 30, 100, 26, { rx: 13, f: C.bg, s: C.a3 }), tx(200, 47, T('UM GUARDA-CHUVA', 'ONE UMBRELLA'), { s: 8, c: C.a1 }));
      kids.push(tx(200, 200, T('o que muda para quem roda Kafka no Brasil', 'what changes for teams running Kafka in production'), { s: 8 }));
    }
    if (name === 'gov') {
      const p = 'M0 112 L400 112'; kids.push(ln(p, { s: C.a7, w: 1.4 })); for (let i = 0; i < 5; i++) kids.push(dot(p, 4, -i * .8, 2.2));
      [[70, T('qualidade', 'quality'), T('schema válido', 'valid schema')], [200, T('LGPD', 'LGPD'), T('mascaramento', 'masking')], [330, T('auditoria', 'audit'), T('quem acessou', 'who accessed')]].forEach(([x, a, b], i) => {
        kids.push(h('rect', { key: k(), x: x - 30, y: 76, width: 60, height: 72, rx: 8, fill: C.a9, stroke: C.a5, strokeWidth: 1 }), h('path', { key: k(), d: 'M' + (x - 10) + ' 100 L' + (x + 10) + ' 100 L' + (x + 10) + ' 112 Q' + (x + 10) + ' 126 ' + x + ' 130 Q' + (x - 10) + ' 126 ' + (x - 10) + ' 112 Z', fill: C.a8, stroke: C.a3, strokeWidth: 1 }), ln('M' + (x - 5) + ' 113 L' + (x - 1) + ' 117 L' + (x + 6) + ' 108', { s: C.a1, w: 1.5 }), tx(x, 62, a.toUpperCase(), { s: 8, c: C.a3 }), tx(x, 164, b, { s: 7.5, c: C.n3, ls: '.02em' }));
      });
      kids.push(tx(200, 24, T('APLICADA NO FLUXO, NÃO DEPOIS', 'ENFORCED IN THE FLOW, NOT AFTERWARDS'), { s: 8 }), tx(20, 196, T('eventos', 'events'), { a: 'start', s: 8, c: C.n4 }), tx(380, 196, T('consumidores confiáveis', 'trusted consumers'), { a: 'end', s: 8, c: C.a1 }));
    }
    if (name === 'current') {
      kids.push(tx(200, 24, 'CURRENT 2025 · NEW ORLEANS', { s: 8, c: C.a3 }));
      // stage + audience
      kids.push(box(60, 44, 280, 90, { rx: 6, f: C.a9, s: C.a5 }), tx(200, 70, 'KEYNOTE', { c: C.a1, s: 9 }));
      ['Flink', 'Tableflow', 'Agents', 'WarpStream'].forEach((s, i) => kids.push(box(78 + i * 64, 84, 56, 36, { rx: 4, f: C.a8, s: C.a7 }), tx(106 + i * 64, 106, s, { s: 8, c: C.a1, ls: '.02em' })));
      for (let r = 0; r < 3; r++) for (let c = 0; c < 14; c++) kids.push(h('circle', { key: k(), cx: 48 + c * 23.5, cy: 152 + r * 16, r: 4, fill: (r * 14 + c) % 7 === 3 ? C.a5 : C.n6 }));
      const p = 'M200 134 C 200 180, 320 180, 372 200'; kids.push(ln(p, { d: '3 4' }), dot(p, 2.4, 0), box(330, 192, 60, 20, { rx: 10, f: C.bg, s: C.a3 }), tx(360, 205, T('clientes', 'customers'), { s: 7.5, c: C.a1 }));
    }
    if (name === 'delivery') {
      kids.push(tx(200, 24, T('60 MI PEDIDOS/MÊS · 1.200 CIDADES', '60M ORDERS/MONTH · 1,200 CITIES'), { s: 8, c: C.a3 }));
      for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) kids.push(ln('M' + (30 + i * 68) + ' ' + (50 + j * 50) + ' L' + (30 + i * 68 + 50) + ' ' + (50 + j * 50), { s: C.n7, w: 1 }), ln('M' + (30 + i * 68) + ' ' + (50 + j * 50) + ' L' + (30 + i * 68) + ' ' + (50 + j * 50 + 40), { s: C.n7, w: 1 }));
      const pins = [[70, 70], [190, 110], [330, 80], [120, 170], [280, 160]];
      pins.forEach(([x, y], i) => kids.push(h('path', { key: k(), d: 'M' + x + ' ' + y + ' m0 -14 a8 8 0 1 1 0.01 0 M' + x + ' ' + (y - 6) + ' L' + x + ' ' + y, fill: 'none', stroke: i === 1 ? C.a1 : C.a3, strokeWidth: 1.4 }), pulse(x, y - 14, 8, 2.4 + i * .3)));
      [[0, 1], [1, 2], [1, 3], [1, 4]].forEach(([a, c], i) => { const p = 'M' + pins[a][0] + ' ' + pins[a][1] + ' Q ' + (pins[a][0] + pins[c][0]) / 2 + ' ' + (Math.min(pins[a][1], pins[c][1]) - 30) + ' ' + pins[c][0] + ' ' + pins[c][1]; kids.push(ln(p, { d: '3 4', o: .8 }), dot(p, 2.2 + i * .4, -i * .5)); });
      kids.push(box(130, 190, 140, 22, { rx: 11, f: C.a9, s: C.a5 }), tx(200, 204, T('rastreamento ao vivo · ksqlDB', 'live tracking · ksqlDB'), { s: 7.5, c: C.a1 }));
    }
    if (name === 'payments') {
      kids.push(tx(90, 24, T('ANTES · COLCHA DE RETALHOS', 'BEFORE · PATCHWORK'), { s: 8 }), tx(310, 24, T('DEPOIS · PLATAFORMA', 'AFTER · PLATFORM'), { s: 8, c: C.a3 }));
      for (let i = 0; i < 7; i++) kids.push(box(24 + (i % 3) * 46, 44 + Math.floor(i / 3) * 44, 38, 30, { rx: 4, f: C.n8, s: C.n5, d: i % 2 ? '3 3' : 'none' }));
      [[43, 59, 135, 103], [89, 103, 43, 147], [135, 59, 89, 147], [43, 103, 135, 147]].forEach(([a, b2, c, d]) => kids.push(ln('M' + a + ' ' + b2 + ' L' + c + ' ' + d, { s: C.n5, w: 1 })));
      kids.push(ln('M176 100 L222 100', { s: C.a3, w: 1.6 }), ln('M216 94 L222 100 L216 106', { s: C.a3, w: 1.6 }));
      kids.push(box(236, 40, 148, 130, { rx: 10, f: C.a9, s: C.a5 }), tx(310, 60, 'CONFLUENT CLOUD', { c: C.a1, s: 8.5 }));
      [T('cartão', 'card'), 'PIX', T('virtual', 'virtual')].forEach((s, i) => { const y = 78 + i * 26; kids.push(box(248, y, 60, 18, { rx: 9, f: C.a8, s: C.a7 }), tx(278, y + 12, s, { s: 7.5, c: C.a1 }), ln('M308 ' + (y + 9) + ' L344 ' + (y + 9)), dot('M308 ' + (y + 9) + ' L344 ' + (y + 9), 1.6, -i * .4, 2)); });
      kids.push(box(344, 78, 30, 70, { rx: 4, f: C.a8, s: C.a3 }), tx(359, 118, 'SR', { s: 8, c: C.a1 }));
      kids.push(tx(200, 200, T('1.500+ desenvolvedores em uma só plataforma', '1,500+ developers on one platform'), { s: 8 }));
    }
    if (name === 'supply') {
      kids.push(tx(200, 24, T('CADEIA DE SUPRIMENTOS EM TEMPO REAL', 'REAL-TIME SUPPLY CHAIN'), { s: 8 }));
      const st = [[50, T('fornecedor', 'supplier')], [150, T('CD', 'DC')], [250, T('loja', 'store')], [350, T('cliente', 'customer')]];
      st.forEach(([x, l], i) => { kids.push(box(x - 32, 70, 64, 48, { rx: 6, f: i === 2 ? C.a9 : C.n8, s: i === 2 ? C.a5 : C.n6 })); for (let j = 0; j < 3; j++) kids.push(box(x - 22 + j * 15, 80, 11, 11, { rx: 1.5, f: C.a8, s: C.a7 })); kids.push(tx(x, 134, l.toUpperCase(), { s: 7.5 })); if (i) { const p = 'M' + (x - 68) + ' 94 L' + (x - 32) + ' 94'; kids.push(ln(p), dot(p, 1.6, -i * .3)); } });
      let w = 'M30 190'; for (let x = 0; x <= 340; x += 10) w += ' L' + (30 + x) + ' ' + (190 - x * .12 - Math.sin(x / 18) * 6); kids.push(ln(w, { s: C.a3, w: 1.4 }), h('path', { key: k(), d: w, fill: 'none', stroke: C.a1, strokeWidth: 1.6, strokeDasharray: '30 600', style: { animation: 'dash 4s linear infinite' } }), tx(60, 210, T('previsão · 600 bi de linhas', 'forecast · 600B rows'), { s: 7.5, a: 'start', c: C.a3 }));
    }
    if (name === 'scale') {
      kids.push(tx(200, 24, T('10 ANOS DE CRESCIMENTO EM 6 SEMANAS', '10 YEARS OF GROWTH IN 6 WEEKS'), { s: 8, c: C.a3 }));
      ln('M30 190 L370 190', { s: C.n6 }); kids.push(ln('M30 190 L370 190', { s: C.n6, w: 1 }), ln('M30 190 L30 40', { s: C.n6, w: 1 }));
      let g = 'M30 185'; for (let x = 0; x <= 340; x += 10) g += ' L' + (30 + x) + ' ' + (185 - Math.pow(x / 340, 2.6) * 135); kids.push(h('path', { key: k(), d: g + ' L370 190 L30 190 Z', fill: C.a9, opacity: .8 }), ln(g, { s: C.a3, w: 1.6 }));
      for (let i = 0; i < 8; i++) kids.push(h('rect', { key: k(), x: 36 + i * 42, y: 190 - (10 + i * 3), width: 24, height: 10 + i * 3, rx: 2, fill: C.a7, opacity: .7 }));
      kids.push(h('circle', { key: k(), cx: 370, cy: 50, r: 4, fill: C.a1 }), pulse(370, 50, 4, 2), box(262, 36, 100, 22, { rx: 11, f: C.bg, s: C.a3 }), tx(312, 50, T('59 mil locais', '59k locations'), { s: 7.5, c: C.a1 }));
      kids.push(tx(200, 212, T('capacidade elástica sem refazer a arquitetura', 'elastic capacity without redoing the architecture'), { s: 8 }));
    }
    if (name === 'citizens') {
      kids.push(tx(200, 24, T('DE 2 SEMANAS DEPOIS PARA TEMPO REAL', 'FROM 2 WEEKS LATER TO REAL TIME'), { s: 8, c: C.a3 }));
      [T('cartão', 'card'), 'app', 'web', T('agência', 'branch')].forEach((s, i) => { const y = 52 + i * 38, p = 'M84 ' + (y + 10) + ' L196 112'; kids.push(box(24, y, 60, 20, { rx: 10, f: C.n8, s: C.n6 }), tx(54, y + 13, s, { s: 7.5, c: C.n3, ls: '.02em' }), ln(p, { s: C.n6, w: 1 }), dot(p, 1.8 + i * .3, -i * .5, 2)); });
      kids.push(box(196, 84, 92, 56, { f: C.a9, s: C.a5, rx: 10 }), tx(242, 106, T('CONTEXTO', 'CONTEXT'), { c: C.a3, s: 8 }), tx(242, 122, T('+ score', '+ score'), { c: C.a1, s: 8 }));
      const ok = 'M288 100 L340 72', no = 'M288 124 L340 152';
      kids.push(ln(ok), dot(ok, 1.4, 0, 2), ln(no, { s: C.a3 }), dot(no, 1.4, -.7, 2.4, C.a1));
      kids.push(box(340, 60, 46, 24, { rx: 12, f: C.n8, s: C.a7 }), tx(363, 75, T('aprova', 'approve'), { s: 7.5, c: C.a3 }), box(340, 140, 46, 24, { rx: 12, f: C.a8, s: C.a1 }), tx(363, 155, T('bloqueia', 'block'), { s: 7.5, c: C.a1 }), pulse(363, 152, 12));
      kids.push(tx(200, 206, T('−15% falsos positivos · +US$ 1 mi/ano', '−15% false positives · +US$1M/year'), { s: 8 }));
    }
    if (name === 'credit') {
      kids.push(tx(200, 24, T('DO PEDIDO AO CRÉDITO EM 2 MINUTOS', 'FROM REQUEST TO LOAN IN 2 MINUTES'), { s: 8, c: C.a3 }));
      const st = [[60, T('pedido', 'request')], [160, T('eventos', 'events')], [260, 'score'], [350, T('liberado', 'paid out')]];
      st.forEach(([x, l], i) => { kids.push(h('circle', { key: k(), cx: x, cy: 104, r: 26, fill: i === 3 ? C.a8 : C.a9, stroke: i === 3 ? C.a1 : C.a5, strokeWidth: 1 }), tx(x, 108, l, { s: 8, c: C.a1, ls: '.02em' })); if (i) { const p = 'M' + (st[i - 1][0] + 26) + ' 104 L' + (x - 26) + ' 104'; kids.push(ln(p), dot(p, 1.2, -i * .3, 2)); } });
      kids.push(pulse(350, 104, 26, 2.6));
      let a = ''; for (let i = 0; i <= 60; i++) { const t = i / 60 * Math.PI * 2; a += (i ? ' L' : 'M') + (200 + Math.sin(t) * 30).toFixed(1) + ' ' + (176 - Math.cos(t) * 30).toFixed(1); }
      kids.push(h('path', { key: k(), d: a, fill: 'none', stroke: C.n6, strokeWidth: 3 }), h('path', { key: k(), d: a, fill: 'none', stroke: C.a3, strokeWidth: 3, strokeDasharray: '40 200', style: { animation: 'dash 3s linear infinite' } }), tx(200, 180, '2 min', { s: 10, c: C.a1, w: 500, ls: 0 }));
    }
    if (name === 'rail') {
      kids.push(tx(200, 24, T('180 MI EVENTOS EM 24 H · 24 MIL TRENS/DIA', '180M EVENTS IN 24 H · 24K TRAINS/DAY'), { s: 8, c: C.a3 }));
      for (let i = 0; i < 3; i++) { const y = 50 + i * 26, p = 'M-40 ' + y + ' L440 ' + y; kids.push(ln(p, { s: C.n6, w: 1 })); for (let x = 0; x < 400; x += 14) kids.push(ln('M' + x + ' ' + (y - 3) + ' L' + x + ' ' + (y + 3), { s: C.n7, w: 1 })); kids.push(h('rect', { key: k(), x: -60, y: y - 5, width: 54, height: 10, rx: 3, fill: C.a5 }, h('animateTransform', { attributeName: 'transform', type: 'translate', from: '0 0', to: '520 0', dur: (6 + i * 2) + 's', begin: -i * 2 + 's', repeatCount: 'indefinite' }))); }
      kids.push(box(130, 128, 140, 34, { f: C.a9, s: C.a5, rx: 8 }), tx(200, 143, 'RI-PLATTFORM', { c: C.a1, s: 8.5 }), tx(200, 155, 'Kafka Streams', { c: C.a3, s: 7.5 }));
      [[60, T('painel', 'display')], [200, 'DB Navigator'], [340, 'web']].forEach(([x, l], i) => { const p = 'M200 162 Q ' + ((200 + x) / 2) + ' 180 ' + x + ' 190'; kids.push(ln(p, { d: '3 4' }), dot(p, 1.6, -i * .4, 2), box(x - 36, 190, 72, 22, { rx: 11, f: C.bg, s: C.a3 }), tx(x, 204, l, { s: 7.5, c: C.a1, ls: '.02em' })); });
    }
    if (name === 'mobility') {
      kids.push(tx(200, 24, T('35% DE ECONOMIA COM CONFLUENT CLOUD', '35% SAVED WITH CONFLUENT CLOUD'), { s: 8, c: C.a3 }));
      [[90, 112], [310, 112]].forEach(([x, y], j) => { for (let i = 0; i < 4; i++) kids.push(h('circle', { key: k(), cx: x, cy: y, r: 44 - i * 9, fill: i === 3 ? C.bg : 'none', stroke: j ? C.a5 : C.n6, strokeWidth: i ? 1 : 6, strokeDasharray: i === 0 ? '6 3' : 'none' })); });
      kids.push(tx(90, 116, 'self-managed', { s: 7.5, c: C.n4, ls: '.02em' }), tx(310, 116, 'Confluent Cloud', { s: 7.5, c: C.a1, ls: '.02em' }));
      const p = 'M138 112 L262 112'; kids.push(ln(p, { s: C.a3, w: 1.6 }), ln('M256 106 L262 112 L256 118', { s: C.a3, w: 1.6 }), dot(p, 1.6, 0));
      [T('inventário', 'inventory'), 'omnichannel', T('eventos', 'events')].forEach((s, i) => kids.push(box(70 + i * 90, 184, 80, 22, { rx: 11, f: C.a9, s: C.a7 }), tx(110 + i * 90, 198, s, { s: 7.5, c: C.a1, ls: '.02em' })));
    }
    if (name === 'eventmesh') {
      kids.push(tx(200, 24, T('MALHA DE EVENTOS · NUVEM HÍBRIDA', 'EVENT MESH · HYBRID CLOUD'), { s: 8, c: C.a3 }));
      const N = [[70, 70, 'on-prem'], [330, 70, 'AWS'], [70, 170, 'Google Cloud'], [330, 170, 'SaaS']];
      kids.push(h('circle', { key: k(), cx: 200, cy: 120, r: 46, fill: C.a9, stroke: C.a5, strokeWidth: 1 }), h('circle', { key: k(), cx: 200, cy: 120, r: 58, fill: 'none', stroke: C.a7, strokeWidth: 1, strokeDasharray: '3 5' }), tx(200, 116, 'SMART', { c: C.a1, s: 8.5 }), tx(200, 130, 'EVENT MESH', { c: C.a1, s: 8.5 }));
      N.forEach(([x, y, l], i) => { const p = 'M' + x + ' ' + y + ' L200 120', q = 'M200 120 L' + x + ' ' + y; kids.push(ln(p, { s: C.a7, w: 1 }), dot(p, 2 + i * .2, -i * .5, 2), dot(q, 2.2 + i * .2, -i * .5 - 1, 1.8, C.a3), box(x - 40, y - 14, 80, 28, { rx: 14, f: C.n8, s: C.a5 }), tx(x, y + 3, l, { s: 8, c: C.a1, ls: '.02em' })); });
      kids.push(tx(200, 212, 'Kafka Connect · ksqlDB', { s: 8 }));
    }
    if (name === 'hospital') {
      kids.push(tx(200, 24, T('PRONTUÁRIO → KAFKA → MODELO → EQUIPE', 'HEALTH RECORD → KAFKA → MODEL → CARE TEAM'), { s: 8, c: C.a3 }));
      kids.push(box(20, 72, 76, 80, { rx: 8 }), tx(58, 92, 'EPIC', { c: C.n1, s: 9, w: 500 }), [T('exame', 'lab'), T('pressão', 'BP'), T('sinais', 'vitals')].map((s, i) => box(30, 100 + i * 16, 56, 12, { rx: 2, f: C.n7, s: C.n6 })), [T('exame', 'lab'), T('pressão', 'BP'), T('sinais', 'vitals')].map((s, i) => tx(58, 109 + i * 16, s, { s: 7, c: C.n3, ls: '.02em' })));
      const p1 = 'M96 112 L150 112'; kids.push(ln(p1), dot(p1, 1.2, 0, 2), dot(p1, 1.2, -.6, 2), tx(123, 104, 'HL7', { s: 7.5, c: C.a3 }));
      for (let i = 0; i < 3; i++) kids.push(box(150, 82 + i * 22, 80, 16, { rx: 3, f: C.a9, s: C.a7 }));
      kids.push(tx(190, 76, 'KAFKA', { s: 8, c: C.a3 }));
      const p2 = 'M230 112 L272 112'; kids.push(ln(p2), dot(p2, 1.2, -.3, 2));
      kids.push(box(272, 86, 64, 52, { rx: 8, f: C.a9, s: C.a5 }), tx(304, 108, T('MODELO', 'MODEL'), { s: 8, c: C.a1 }), tx(304, 122, T('sepse', 'sepsis'), { s: 7.5, c: C.a3 }));
      let w = 'M20 186'; for (let x = 0; x <= 300; x += 4) { const m = x % 60; w += ' L' + (20 + x) + ' ' + (186 - (m > 30 && m < 36 ? (m === 32 ? -22 : 14) : 0)); } kids.push(h('path', { key: k(), d: w, fill: 'none', stroke: C.a3, strokeWidth: 1.4, strokeDasharray: '80 400', style: { animation: 'dash 3s linear infinite' } }), ln(w, { s: C.n7, w: 1, o: .6 }));
      kids.push(h('circle', { key: k(), cx: 362, cy: 112, r: 10, fill: C.a8, stroke: C.a1, strokeWidth: 1.2 }), pulse(362, 112, 10), ln('M336 112 L352 112', { s: C.a1 }), tx(362, 140, T('alerta', 'alert'), { s: 7.5, c: C.a1 }));
    }
    if (name === 'beauty') {
      kids.push(tx(200, 24, T('AUTO-SCALE · MENOS CHAMADAS DE API', 'AUTO-SCALE · FEWER API CALLS'), { s: 8, c: C.a3 }));
      kids.push(tx(80, 50, T('ANTES · POLLING', 'BEFORE · POLLING'), { s: 7.5 }));
      const A = [[40, 70], [120, 70], [40, 140], [120, 140]]; A.forEach(([x, y]) => kids.push(box(x - 22, y - 14, 44, 28, { rx: 4, f: C.n8, s: C.n5 })));
      [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]].forEach(([a, b]) => kids.push(ln('M' + A[a][0] + ' ' + A[a][1] + ' L' + A[b][0] + ' ' + A[b][1], { s: C.n5, w: 1, d: '2 3' })));
      kids.push(ln('M168 105 L210 105', { s: C.a3, w: 1.6 }), ln('M204 99 L210 105 L204 111', { s: C.a3, w: 1.6 }));
      kids.push(tx(305, 50, T('DEPOIS · EVENTOS', 'AFTER · EVENTS'), { s: 7.5, c: C.a3 }), box(226, 92, 158, 26, { rx: 13, f: C.a9, s: C.a5 }), tx(305, 109, 'CONFLUENT', { s: 8, c: C.a1 }));
      [246, 286, 326, 366].forEach((x, i) => { const p = 'M' + x + ' 118 L' + x + ' 150'; kids.push(ln(p, { s: C.a7, w: 1 }), dot(p, 1.4, -i * .3, 2), box(x - 16, 150, 32, 20, { rx: 4, f: C.a8, s: C.a7 })); });
      for (let i = 0; i < 6; i++) kids.push(h('rect', { key: k(), x: 250 + i * 20, y: 196 - (6 + ((i * 13) % 14)), width: 12, height: 6 + ((i * 13) % 14), rx: 2, fill: C.a5, opacity: .7 }));
      kids.push(tx(200, 212, T('dados em movimento entre sistemas e aplicações', 'data in motion between systems and applications'), { s: 8 }));
    }
    if (name === 'ecommerce') {
      kids.push(tx(200, 24, T('CARRINHO · PREÇO · ESTOQUE NO MESMO SEGUNDO', 'CART · PRICE · STOCK IN THE SAME SECOND'), { s: 8, c: C.a3 }));
      [[50, T('clique', 'click')], [50, T('carrinho', 'cart')], [50, 'checkout']].forEach(([x, l], i) => { const y = 60 + i * 44, p = 'M86 ' + y + ' L170 112'; kids.push(box(18, y - 12, 68, 24, { rx: 12, f: C.n8, s: C.n6 }), tx(52, y + 3, l, { s: 7.5, c: C.n3, ls: '.02em' }), ln(p, { s: C.n6, w: 1 }), dot(p, 1.4 + i * .3, -i * .4, 2)); });
      kids.push(box(170, 84, 80, 56, { f: C.a9, s: C.a5, rx: 10 }), tx(210, 106, 'KAFKA', { c: C.a1, s: 8.5 }), tx(210, 120, '+ Flink', { c: C.a3, s: 7.5 }));
      [[T('estoque', 'stock'), 56], [T('preço', 'price'), 112], [T('recomendação', 'recs'), 168]].forEach(([l, y], i) => { const p = 'M250 112 L300 ' + y; kids.push(ln(p), dot(p, 1.2, -i * .3, 2), box(300, y - 12, 82, 24, { rx: 6, f: C.a8, s: C.a7 }), tx(341, y + 3, l, { s: 7.5, c: C.a1, ls: '.02em' })); });
      for (let i = 0; i < 9; i++) kids.push(h('rect', { key: k(), x: 18 + i * 8, y: 206 - (4 + (i === 6 ? 16 : (i * 3) % 8)), width: 5, height: 4 + (i === 6 ? 16 : (i * 3) % 8), rx: 1, fill: i === 6 ? C.a1 : C.a7 }));
      kids.push(tx(96, 206, T('pico de Black Friday absorvido', 'Black Friday peak absorbed'), { a: 'start', s: 7.5 }));
    }
    if (name === 'iot') {
      kids.push(tx(200, 24, T('TELEMETRIA → ANOMALIA → ORDEM DE SERVIÇO', 'TELEMETRY → ANOMALY → WORK ORDER'), { s: 8, c: C.a3 }));
      for (let i = 0; i < 3; i++) { const x = 30 + i * 52; kids.push(box(x, 60, 40, 60, { rx: 4, f: C.n8, s: C.n6 }), h('circle', { key: k(), cx: x + 20, cy: 80, r: 9, fill: 'none', stroke: i === 1 ? C.a1 : C.a5, strokeWidth: 1.2 }), h('g', { key: k(), style: { transformBox: 'fill-box', transformOrigin: 'center', animation: 'spin ' + (3 + i) + 's linear infinite' } }, ln('M' + (x + 20) + ' 71 L' + (x + 20) + ' 89', { s: C.a3 })), box(x + 6, 100, 28, 10, { rx: 2, f: C.a8, s: C.a7 })); if (i === 1) kids.push(pulse(x + 20, 80, 9)); }
      kids.push(tx(100, 136, 'MQTT · OPC-UA', { s: 7.5 }));
      const p = 'M186 90 L226 90'; kids.push(ln(p), dot(p, .9, 0, 2), dot(p, .9, -.45, 2));
      kids.push(box(226, 64, 70, 52, { f: C.a9, s: C.a5, rx: 8 }), tx(261, 86, 'FLINK', { c: C.a1, s: 8.5 }), tx(261, 100, T('janela 5 min', '5-min window'), { c: C.a3, s: 7 }));
      const q = 'M296 90 L330 90'; kids.push(ln(q, { s: C.a3 }), dot(q, 1.2, -.2, 2.4, C.a1), box(330, 74, 54, 32, { rx: 6, f: C.a8, s: C.a1 }), tx(357, 94, 'OS', { c: C.a1, s: 9 }));
      let w = 'M30 190'; for (let x = 0; x <= 340; x += 5) w += ' L' + (30 + x) + ' ' + (190 - Math.sin(x / 9) * 6 - (x > 230 && x < 260 ? (x - 230) * .8 : 0)); kids.push(ln(w, { s: C.n6, w: 1 }), h('path', { key: k(), d: w, fill: 'none', stroke: C.a3, strokeWidth: 1.4, strokeDasharray: '60 400', style: { animation: 'dash 3s linear infinite' } }), tx(30, 212, T('vibração · temperatura · corrente', 'vibration · temperature · current'), { a: 'start', s: 7.5 }));
    }
    if (name === 'fleet') {
      kids.push(tx(200, 24, T('POSIÇÃO A CADA SEGUNDOS · ETA RECALCULADO', 'POSITION EVERY FEW SECONDS · ETA RECOMPUTED'), { s: 8, c: C.a3 }));
      for (let i = 0; i < 5; i++) kids.push(ln('M' + (20 + i * 90) + ' 40 L' + (20 + i * 90) + ' 180', { s: C.n7, w: 1 }), ln('M20 ' + (40 + i * 35) + ' L380 ' + (40 + i * 35), { s: C.n7, w: 1 }));
      const r1 = 'M40 160 L110 160 L110 75 L200 75 L200 110 L330 110 L330 60', r2 = 'M60 60 L60 145 L250 145 L250 75 L360 75';
      kids.push(ln(r1, { s: C.a7, w: 2 }), ln(r2, { s: C.n5, w: 1.4, d: '4 4' }), dot(r1, 6, 0, 3.4), dot(r2, 7, -2, 3, C.a3));
      kids.push(h('circle', { key: k(), cx: 330, cy: 60, r: 6, fill: C.a8, stroke: C.a1, strokeWidth: 1.2 }), pulse(330, 60, 6), box(268, 30, 70, 20, { rx: 10, f: C.bg, s: C.a3 }), tx(303, 43, 'ETA 14:32', { s: 7.5, c: C.a1, ls: '.02em' }));
      kids.push(box(120, 188, 160, 24, { rx: 12, f: C.a9, s: C.a5 }), tx(200, 203, T('Kafka · Flink geoespacial', 'Kafka · geospatial Flink'), { s: 7.5, c: C.a1 }));
    }
    if (name === 'pix') {
      kids.push(tx(200, 24, T('DECISÃO ANTES DA LIQUIDAÇÃO', 'DECISION BEFORE SETTLEMENT'), { s: 8, c: C.a3 }));
      kids.push(box(20, 86, 70, 50, { rx: 8 }), tx(55, 108, T('ordem', 'order'), { s: 8, c: C.n1 }), tx(55, 122, T('PIX', 'instant'), { s: 7.5, c: C.n3 }));
      const p = 'M90 111 L150 111'; kids.push(ln(p), dot(p, 1, 0, 2.2));
      kids.push(box(150, 70, 110, 82, { f: C.a9, s: C.a5, rx: 10 }), tx(205, 90, T('ENRIQUECE', 'ENRICH'), { s: 8, c: C.a3 }));
      [T('dispositivo', 'device'), T('histórico', 'history'), T('destinatário', 'payee')].forEach((s, i) => kids.push(box(162, 98 + i * 16, 86, 12, { rx: 2, f: C.a8, s: C.a7 }), tx(205, 107 + i * 16, s, { s: 7, c: C.a1, ls: '.02em' })));
      const q = 'M260 111 L310 111'; kids.push(ln(q), dot(q, 1, -.3, 2.2));
      kids.push(box(310, 86, 72, 50, { rx: 8, f: C.a8, s: C.a1 }), tx(346, 108, T('liquida', 'settle'), { s: 8, c: C.a1 }), tx(346, 122, T('ou retém', 'or hold'), { s: 7.5, c: C.a3 }));
      let a = ''; for (let i = 0; i <= 40; i++) { const t = i / 40 * Math.PI * 2; a += (i ? ' L' : 'M') + (200 + Math.sin(t) * 18).toFixed(1) + ' ' + (190 - Math.cos(t) * 18).toFixed(1); }
      kids.push(h('path', { key: k(), d: a, fill: 'none', stroke: C.n6, strokeWidth: 2.5 }), h('path', { key: k(), d: a, fill: 'none', stroke: C.a3, strokeWidth: 2.5, strokeDasharray: '20 200', style: { animation: 'dash 2s linear infinite' } }), tx(226, 194, T('< 10 s', '< 10 s'), { a: 'start', s: 8.5, c: C.a1, ls: 0 }));
    }
    if (name === 'claims') {
      kids.push(tx(200, 24, T('DO AVISO DE SINISTRO À DECISÃO', 'FROM FIRST NOTICE OF LOSS TO DECISION'), { s: 8, c: C.a3 }));
      [[T('app', 'app'), 56], [T('telemetria', 'telemetry'), 104], [T('oficina', 'repair shop'), 152]].forEach(([l, y], i) => { const p = 'M96 ' + y + ' L160 104'; kids.push(box(20, y - 12, 76, 24, { rx: 12, f: C.n8, s: C.n6 }), tx(58, y + 3, l, { s: 7.5, c: C.n3, ls: '.02em' }), ln(p, { s: C.n6, w: 1 }), dot(p, 1.4 + i * .2, -i * .4, 2)); });
      kids.push(box(160, 76, 90, 56, { f: C.a9, s: C.a5, rx: 10 }), tx(205, 98, T('SINISTRO', 'CLAIM'), { c: C.a1, s: 8.5 }), tx(205, 112, T('regras + ML', 'rules + ML'), { c: C.a3, s: 7.5 }));
      [[T('aprovação', 'auto-approve'), 64], [T('perito', 'adjuster'), 104], [T('suspeita', 'suspicious'), 144]].forEach(([l, y], i) => { const p = 'M250 104 L296 ' + y; kids.push(ln(p, { s: i === 2 ? C.a3 : C.a7 }), dot(p, 1.2, -i * .3, 2), box(296, y - 12, 86, 24, { rx: 6, f: i === 2 ? C.a8 : C.n8, s: i === 2 ? C.a1 : C.a7 }), tx(339, y + 3, l, { s: 7.5, c: i === 2 ? C.a1 : C.a3, ls: '.02em' })); });
      kids.push(tx(200, 204, T('cliente acompanha cada etapa no app', 'customer follows every step in the app'), { s: 8 }));
    }
    if (name === 'mainframe') {
      kids.push(tx(200, 24, T('LEITURAS SAEM DO MAINFRAME · MIPS CAEM', 'READS LEAVE THE MAINFRAME · MIPS DROP'), { s: 8, c: C.a3 }));
      kids.push(box(20, 52, 90, 130, { rx: 6 }), tx(65, 72, 'MAINFRAME', { s: 8, c: C.n1 }));
      ['DB2', 'IMS', 'VSAM', 'CICS'].forEach((s, i) => kids.push(box(32, 82 + i * 22, 66, 16, { rx: 2, f: C.n7, s: C.n6 }), tx(65, 93 + i * 22, s, { s: 7.5, c: C.n3, ls: '.02em' })));
      const p = 'M110 117 L160 117'; kids.push(ln(p, { s: C.a5, w: 1.6 }), dot(p, 1, 0, 2.2), dot(p, 1, -.5, 2.2), tx(135, 108, 'CDC', { s: 7.5, c: C.a3 }));
      kids.push(box(160, 90, 80, 54, { f: C.a9, s: C.a5, rx: 10 }), tx(200, 113, 'KAFKA', { c: C.a1, s: 8.5 }), tx(200, 127, T('dado vivo', 'live data'), { c: C.a3, s: 7.5 }));
      [['app', 62], ['APIs', 117], ['analytics', 172]].forEach(([l, y], i) => { const q = 'M240 117 L296 ' + y; kids.push(ln(q), dot(q, 1.2, -i * .3, 2), box(296, y - 12, 84, 24, { rx: 6, f: C.a8, s: C.a7 }), tx(338, y + 3, l, { s: 7.5, c: C.a1, ls: '.02em' })); });
      for (let i = 0; i < 6; i++) kids.push(h('rect', { key: k(), x: 36 + i * 11, y: 210 - (22 - i * 3), width: 7, height: 22 - i * 3, rx: 1.5, fill: C.n5 }));
    }
    if (name === 'ontology') {
      kids.push(tx(200, 24, T('7+ ERPs → UMA ONTOLOGIA', '7+ ERPs → ONE ONTOLOGY'), { s: 8, c: C.a3 }));
      for (let i = 0; i < 7; i++) { const y = 44 + i * 23; kids.push(box(18, y, 56, 16, { rx: 3, f: C.n8, s: C.n5, d: i % 2 ? '3 3' : 'none' }), tx(46, y + 11, 'ERP ' + (i + 1), { s: 7, c: C.n3, ls: '.02em' })); const p = 'M74 ' + (y + 8) + ' C 110 ' + (y + 8) + ', 120 112, 150 112'; kids.push(ln(p, { s: C.n6, w: 1 }), dot(p, 1.8 + i * .15, -i * .3, 1.8)); }
      kids.push(h('circle', { key: k(), cx: 210, cy: 112, r: 54, fill: C.a9, stroke: C.a5, strokeWidth: 1 }), tx(210, 92, T('ONTOLOGIA', 'ONTOLOGY'), { s: 8, c: C.a3 }));
      [[186, 112, T('pedido', 'order')], [234, 112, T('fábrica', 'plant')], [210, 138, 'SKU']].forEach(([x, y, l]) => kids.push(box(x - 22, y - 9, 44, 18, { rx: 9, f: C.a8, s: C.a3 }), tx(x, y + 3, l, { s: 7, c: C.a1, ls: '.02em' })));
      kids.push(ln('M196 121 L206 129 M224 121 L214 129', { s: C.a3, w: 1 }));
      [[T('custo', 'COGS'), 72], [T('produção', 'production'), 112], [T('decisão', 'decision'), 152]].forEach(([l, y], i) => { const p = 'M264 112 L300 ' + y; kids.push(ln(p), dot(p, 1.2, -i * .3, 2), box(300, y - 12, 84, 24, { rx: 6, f: C.a8, s: C.a7 }), tx(342, y + 3, l, { s: 7.5, c: C.a1, ls: '.02em' })); });
    }
    if (name === 'elf') {
      kids.push(tx(200, 24, T('3.000+ PEDIDOS · RECOMENDAÇÕES · HUMANO DECIDE', '3,000+ ORDERS · RECOMMENDATIONS · HUMAN DECIDES'), { s: 8, c: C.a3 }));
      for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) kids.push(box(18 + c * 18, 46 + r * 20, 13, 13, { rx: 2, f: (r * 6 + c) % 7 === 2 ? C.a8 : C.n8, s: (r * 6 + c) % 7 === 2 ? C.a3 : C.n6 }));
      const p = 'M128 96 L170 96'; kids.push(ln(p), dot(p, 1, 0, 2), dot(p, 1, -.5, 2));
      kids.push(box(170, 66, 92, 60, { f: C.a9, s: C.a5, rx: 10 }), tx(216, 88, 'AIP · ELF', { c: C.a1, s: 8.5 }), tx(216, 104, T('recomenda', 'recommends'), { c: C.a3, s: 7.5 }));
      const q = 'M262 96 L300 96'; kids.push(ln(q), dot(q, 1.2, -.3, 2));
      kids.push(h('circle', { key: k(), cx: 330, cy: 96, r: 24, fill: C.a8, stroke: C.a1, strokeWidth: 1 }), tx(330, 100, '70%+', { s: 9, c: C.a1, w: 500, ls: 0 }), tx(330, 136, T('aceitas', 'accepted'), { s: 7.5, c: C.a3 }));
      kids.push(box(110, 172, 180, 30, { rx: 15, f: C.bg, s: C.a3 }), tx(200, 191, T('~US$ 40 mil/dia · ~US$ 14 mi/ano', '~US$40k/day · ~US$14M/year'), { s: 8, c: C.a1, ls: '.02em' }));
    }
    if (name === 'factory') {
      kids.push(tx(200, 24, T('11 MIL USUÁRIOS · 175 CASOS DE USO', '11K USERS · 175 USE CASES'), { s: 8, c: C.a3 }));
      kids.push(h('path', { key: k(), d: 'M20 180 L20 110 L60 90 L60 110 L100 90 L100 110 L140 90 L140 180 Z', fill: C.n8, stroke: C.n6, strokeWidth: 1 }), box(108, 60, 14, 32, { rx: 2, f: C.n7, s: C.n6 }));
      for (let i = 0; i < 3; i++) kids.push(box(32 + i * 34, 140, 22, 22, { rx: 3, f: C.a8, s: C.a7 }));
      const lanes = [T('qualidade', 'quality'), T('compras', 'procurement'), T('produção', 'production'), T('finanças', 'finance'), T('tarifas', 'tariffs')];
      lanes.forEach((l, i) => { const y = 50 + i * 30, p = 'M140 135 C 180 135, 190 ' + y + ', 230 ' + y; kids.push(ln(p, { s: C.a7, w: 1 }), dot(p, 1.6 + i * .2, -i * .3, 1.8), box(230, y - 11, 90, 22, { rx: 11, f: C.a9, s: C.a5 }), tx(275, y + 3, l, { s: 7.5, c: C.a1, ls: '.02em' })); });
      kids.push(box(330, 96, 56, 56, { rx: 8, f: C.a8, s: C.a1 }), tx(358, 120, 'US$ 30M+', { s: 8, c: C.a1, w: 500, ls: 0 }), tx(358, 134, T('1º sem/25', 'H1 2025'), { s: 7, c: C.a3 }), pulse(358, 124, 28, 3));
    }
    if (name === 'hospitalops') {
      kids.push(tx(200, 24, T('LEITOS · FILA · EQUIPE EM UMA VISÃO', 'BEDS · QUEUE · STAFF IN ONE VIEW'), { s: 8, c: C.a3 }));
      for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) { const on = (r * 6 + c) % 5 !== 1; kids.push(box(20 + c * 30, 44 + r * 26, 24, 18, { rx: 3, f: on ? C.a8 : C.n8, s: on ? C.a7 : C.a1 })); if (!on) kids.push(pulse(32 + c * 30, 53 + r * 26, 6, 2.6)); }
      kids.push(tx(100, 162, T('leitos ao vivo', 'live beds'), { s: 7.5 }));
      const p = 'M200 92 L240 92'; kids.push(ln(p), dot(p, 1, 0, 2));
      kids.push(box(240, 52, 140, 84, { f: C.a9, s: C.a5, rx: 10 }), tx(310, 72, 'AIP · C3', { c: C.a1, s: 8.5 }));
      [[T('alocação', 'placement'), '−83%'], [T('espera RPA', 'PACU holds'), '−28%'], [T('sepse (internação)', 'sepsis stay'), '−30%']].forEach(([l, v], i) => kids.push(tx(256, 92 + i * 16, l, { a: 'start', s: 7.5, c: C.a3, ls: '.02em' }), tx(368, 92 + i * 16, v, { a: 'end', s: 8, c: C.a1, w: 500, ls: 0 })));
      kids.push(tx(200, 200, T('dados em tempo real orientando o fluxo de pacientes', 'real-time data steering patient flow'), { s: 8 }));
    }
    if (name === 'lenses') {
      kids.push(tx(200, 24, T('SQL SOBRE O TÓPICO · SEM CLI', 'SQL ON THE TOPIC · NO CLI'), { s: 8, c: C.a3 }));
      kids.push(box(20, 40, 360, 160, { rx: 8, f: C.n8, s: C.n6 }), ln('M20 60 L380 60', { s: C.n6, w: 1 }));
      [0, 1, 2].forEach(i => kids.push(h('circle', { key: k(), cx: 34 + i * 10, cy: 50, r: 3, fill: C.n6 })));
      kids.push(box(34, 70, 332, 24, { rx: 4, f: C.bg, s: C.a5 }), tx(44, 86, 'SELECT * FROM vessels WHERE speed > 20', { a: 'start', s: 8, c: C.a1, ls: 0 }));
      kids.push(h('rect', { key: k(), x: 300, y: 76, width: 1.5, height: 12, fill: C.a1, style: { animation: 'ring 1s steps(2) infinite' } }));
      for (let r = 0; r < 4; r++) { const y = 106 + r * 20; kids.push(ln('M34 ' + (y + 14) + ' L366 ' + (y + 14), { s: C.n7, w: 1 })); [60, 150, 240, 320].forEach((x, c) => kids.push(box(x - 24, y + 2, 48 - (r * 7 + c * 5) % 18, 8, { rx: 2, f: r === 1 ? C.a7 : C.n7, s: 'none' }))); }
      kids.push(pulse(360, 128, 4, 2), h('circle', { key: k(), cx: 360, cy: 128, r: 4, fill: C.a1 }));
    }
    if (name === 'devspeed') {
      kids.push(tx(200, 24, T('DO ZERO À PRODUÇÃO EM UM ANO', 'FROM ZERO TO PRODUCTION IN ONE YEAR'), { s: 8, c: C.a3 }));
      kids.push(ln('M30 170 L370 170', { s: C.n6, w: 1 }));
      [T('ideia', 'idea'), T('tópico', 'topic'), 'app', T('produção', 'production')].forEach((l, i) => { const x = 60 + i * 95; kids.push(h('circle', { key: k(), cx: x, cy: 170, r: 6, fill: i === 3 ? C.a1 : C.a5 }), tx(x, 192, l, { s: 7.5, c: i === 3 ? C.a1 : C.n3, ls: '.02em' })); });
      kids.push(h('circle', { key: k(), cx: 345, cy: 170, r: 6, fill: 'none', stroke: C.a1 }), pulse(345, 170, 6));
      kids.push(box(40, 50, 140, 34, { rx: 8, f: C.n8, s: C.n5, d: '3 3' }), tx(110, 71, T('antes', 'before'), { s: 8, c: C.n4 }));
      kids.push(box(220, 50, 14, 34, { rx: 4, f: C.a8, s: C.a1 }), tx(250, 71, '10×', { a: 'start', s: 13, c: C.a1, w: 500, ls: 0 }), tx(290, 71, T('mais rápido', 'faster'), { a: 'start', s: 8, c: C.a3 }));
      kids.push(box(110, 108, 180, 28, { rx: 14, f: C.a9, s: C.a5 }), tx(200, 126, T('600 mil comunicações via Kafka', '600k communications via Kafka'), { s: 7.5, c: C.a1, ls: '.02em' }));
    }
    if (name === 'teams') {
      kids.push(tx(200, 24, T('CENTENAS DE DEVS · AUTOSSERVIÇO', 'HUNDREDS OF DEVS · SELF-SERVICE'), { s: 8, c: C.a3 }));
      kids.push(box(150, 86, 100, 52, { f: C.a9, s: C.a5, rx: 10 }), tx(200, 108, 'KAFKA', { c: C.a1, s: 8.5 }), tx(200, 122, 'Lenses', { c: C.a3, s: 7.5 }));
      for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, x = 200 + Math.cos(a) * 150, y = 112 + Math.sin(a) * 78, p = 'M' + x.toFixed(1) + ' ' + y.toFixed(1) + ' L200 112'; kids.push(ln(p, { s: C.n7, w: 1 }), h('circle', { key: k(), cx: x, cy: y, r: 7, fill: C.n8, stroke: i % 4 === 0 ? C.a3 : C.n5, strokeWidth: 1 })); if (i % 3 === 0) kids.push(dot(p, 1.8 + i * .1, -i * .2, 1.8)); }
      kids.push(tx(200, 214, T('300 horas de engenharia ganhas por dia', '300 engineering hours gained per day'), { s: 8, c: C.a1 }));
    }
    return SC[ck] = h('svg', { viewBox: '0 0 400 225', width: '100%', 'aria-hidden': 'true', style: { position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%' } }, ...kids);;
  };
  window.InteliumCover = function (kind, seed, R) {
    var key = kind + seed; if (CV[key]) return CV[key];
    
    const h = R.createElement, k = seed * 7919, r = n => ((k * (n + 1) * 2654435761) % 1000) / 1000;
    const A = ['var(--color-accent-700)', 'var(--color-accent-500)', 'var(--color-accent-300)', 'var(--color-neutral-600)'];
    const kids = [h('defs', { key: 'd' }, h('linearGradient', { id: 'g' + key, x1: 0, y1: 0, x2: 1, y2: 1 }, h('stop', { offset: 0, stopColor: 'var(--color-accent-900)' }), h('stop', { offset: 1, stopColor: 'var(--color-neutral-800)' }))), h('rect', { key: 'bg', width: 400, height: 225, fill: 'url(#g' + key + ')' })];
    if (kind === 'waves') for (let i = 0; i < 7; i++) { let d = 'M0 ' + (60 + i * 18); for (let x = 0; x <= 400; x += 20) d += ' Q' + (x + 10) + ' ' + (60 + i * 18 + (i % 2 ? -1 : 1) * (14 + 10 * r(i))) + ' ' + (x + 20) + ' ' + (60 + i * 18); kids.push(h('path', { key: 'w' + i, d, fill: 'none', stroke: A[i % 3], strokeWidth: 1.2, opacity: .5 + .07 * i })); }
    if (kind === 'grid') for (let i = 0; i < 48; i++) { const c = i % 8, w = Math.floor(i / 8), on = r(i) > .55; kids.push(h('rect', { key: 'g' + i, x: 24 + c * 46, y: 22 + w * 32, width: 36, height: 22, rx: 3, fill: on ? A[0] : 'none', stroke: on ? A[1] : A[3], strokeWidth: 1 })); }
    if (kind === 'rings') for (let i = 0; i < 9; i++) kids.push(h('circle', { key: 'r' + i, cx: 290, cy: 112, r: 18 + i * 22, fill: 'none', stroke: A[i % 3], strokeWidth: 1, strokeDasharray: i % 2 ? '4 6' : 'none', opacity: .9 - i * .07 }));
    if (kind === 'bars') for (let i = 0; i < 16; i++) { const hh = 30 + 150 * r(i); kids.push(h('rect', { key: 'b' + i, x: 20 + i * 23, y: 205 - hh, width: 14, height: hh, rx: 2, fill: i % 4 === 3 ? A[1] : A[0], opacity: .7 + .3 * r(i + 20) })); }
    if (kind === 'nodes') { const P = []; for (let i = 0; i < 12; i++) P.push([30 + 340 * r(i), 25 + 175 * r(i + 30)]); P.forEach((p, i) => P.forEach((q, j) => { if (j > i && Math.hypot(p[0] - q[0], p[1] - q[1]) < 130) kids.push(h('line', { key: 'l' + i + '_' + j, x1: p[0], y1: p[1], x2: q[0], y2: q[1], stroke: A[0], strokeWidth: 1 })); })); P.forEach((p, i) => kids.push(h('circle', { key: 'n' + i, cx: p[0], cy: p[1], r: i % 3 ? 3 : 6, fill: i % 3 ? A[2] : A[1] }))); }
    if (kind === 'diagonal') for (let i = 0; i < 18; i++) kids.push(h('line', { key: 'd' + i, x1: -60 + i * 30, y1: 225, x2: 40 + i * 30, y2: 0, stroke: i % 5 === 2 ? A[1] : A[0], strokeWidth: i % 5 === 2 ? 2 : 1, opacity: .4 + .6 * r(i) }));
    if (kind === 'dots') for (let i = 0; i < 120; i++) { const c = i % 15, w = Math.floor(i / 15), v = r(i); kids.push(h('circle', { key: 'p' + i, cx: 20 + c * 26, cy: 22 + w * 26, r: 1.5 + 4 * v, fill: v > .8 ? A[2] : A[0], opacity: .5 + .5 * v })); }
    if (kind === 'flow') for (let i = 0; i < 6; i++) kids.push(h('path', { key: 'f' + i, d: 'M0 ' + (30 + i * 33) + ' C 130 ' + (30 + i * 33) + ', 160 ' + (112) + ', 400 ' + (60 + 60 * r(i)), fill: 'none', stroke: A[i % 2], strokeWidth: 1.4, opacity: .55 + .08 * i }));
    return CV[key] = h('svg', { viewBox: '0 0 400 225', width: '100%', 'aria-hidden': 'true', style: { position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%' } }, ...kids);;
  };
})();
