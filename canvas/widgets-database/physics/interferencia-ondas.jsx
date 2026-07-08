function Widget({ appBus }) {
  var t = React.useState(0);
  var a1 = React.useState(1); var a2 = React.useState(1);
  var f1 = React.useState(2); var f2 = React.useState(3);
  var running = React.useState(true);

  React.useEffect(function () {
    if (!running[0]) return;
    var id = setInterval(function () { t[1](function (p) { return p + 0.04; }); }, 40);
    return function () { clearInterval(id); };
  });

  var canvasRef = React.useRef(null);
  var W = 480, H = 260, pts = 400;

  React.useEffect(function () {
    var cv = canvasRef.current;
    if (!cv) return;
    var ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, W, H);
    var tv = t[0];
    var margin = { l: 50, r: 20, t: 20, b: 30 };
    var plotW = W - margin.l - margin.r;
    var plotH = H - margin.t - margin.b;
    var amp = Math.max(a1[0] + a2[0], 0.1);

    function wave(x, A, freq, phase) {
      return A * Math.sin(2 * Math.PI * freq * x - 2 * Math.PI * tv + phase);
    }

    function toPixel(x, y) {
      return { px: margin.l + x * plotW, py: margin.t + plotH / 2 - y / amp * plotH / 2 };
    }

    // grade
    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 0.5;
    for (var g = 0; g <= 4; g++) {
      var gx = margin.l + g / 4 * plotW;
      ctx.beginPath(); ctx.moveTo(gx, margin.t); ctx.lineTo(gx, margin.t + plotH); ctx.stroke();
      ctx.fillStyle = '#475569'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
      ctx.fillText((g / 4).toFixed(1), gx, H - 6);
    }
    ctx.beginPath(); ctx.moveTo(margin.l, margin.t + plotH / 2);
    ctx.lineTo(W - margin.r, margin.t + plotH / 2); ctx.stroke();

    // onda 1
    ctx.beginPath(); ctx.strokeStyle = '#818cf8'; ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    for (var i = 0; i <= pts; i++) {
      var x = i / pts;
      var y1 = wave(x, a1[0], f1[0], 0);
      var p = toPixel(x, y1);
      i === 0 ? ctx.moveTo(p.px, p.py) : ctx.lineTo(p.px, p.py);
    }
    ctx.stroke();

    // onda 2
    ctx.beginPath(); ctx.strokeStyle = '#f472b6'; ctx.lineWidth = 1.5;
    for (var i = 0; i <= pts; i++) {
      var x = i / pts;
      var y2 = wave(x, a2[0], f2[0], 0);
      var p = toPixel(x, y2);
      i === 0 ? ctx.moveTo(p.px, p.py) : ctx.lineTo(p.px, p.py);
    }
    ctx.stroke();

    // interferencia
    ctx.beginPath(); ctx.strokeStyle = '#6ee7b7'; ctx.lineWidth = 2.5;
    ctx.setLineDash([]);
    for (var i = 0; i <= pts; i++) {
      var x = i / pts;
      var y1 = wave(x, a1[0], f1[0], 0);
      var y2 = wave(x, a2[0], f2[0], Math.PI);
      var p = toPixel(x, y1 + y2);
      i === 0 ? ctx.moveTo(p.px, p.py) : ctx.lineTo(p.px, p.py);
    }
    ctx.stroke();

    // labels
    ctx.setLineDash([]);
    ctx.fillStyle = '#818cf8'; ctx.font = '10px monospace'; ctx.textAlign = 'left';
    ctx.fillText('Onda 1', 6, 18);
    ctx.fillStyle = '#f472b6'; ctx.fillText('Onda 2', 6, 34);
    ctx.fillStyle = '#6ee7b7'; ctx.fillText('Interfer\u00eancia', 6, 50);
    ctx.fillStyle = '#94a3b8'; ctx.textAlign = 'center';
    ctx.fillText('posi\u00e7\u00e3o (x)', W / 2, H - 4);
    ctx.textAlign = 'right';
    ctx.fillText('t = ' + tv.toFixed(1) + 's', W - 10, 18);
  });

  return React.createElement('div', { style: { padding: 12, fontFamily: 'monospace' } },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 } },
      React.createElement('span', { style: { color: '#818cf8', fontSize: 11 } }, 'Onda 1'),
      React.createElement('input', { type: 'range', min: 0.1, max: 2, step: 0.1, value: a1[0],
        onChange: function (e) { a1[1](parseFloat(e.target.value)); },
        style: { flex: 1, accentColor: '#818cf8', height: 3 } }),
      React.createElement('span', { style: { color: '#818cf8', fontSize: 11, minWidth: 24 } }, 'A=' + a1[0].toFixed(1)),
      React.createElement('input', { type: 'range', min: 0.5, max: 6, step: 0.5, value: f1[0],
        onChange: function (e) { f1[1](parseFloat(e.target.value)); },
        style: { flex: 1, accentColor: '#818cf8', height: 3 } }),
      React.createElement('span', { style: { color: '#818cf8', fontSize: 11, minWidth: 20 } }, 'f=' + f1[0].toFixed(1))
    ),
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 } },
      React.createElement('span', { style: { color: '#f472b6', fontSize: 11 } }, 'Onda 2'),
      React.createElement('input', { type: 'range', min: 0.1, max: 2, step: 0.1, value: a2[0],
        onChange: function (e) { a2[1](parseFloat(e.target.value)); },
        style: { flex: 1, accentColor: '#f472b6', height: 3 } }),
      React.createElement('span', { style: { color: '#f472b6', fontSize: 11, minWidth: 24 } }, 'A=' + a2[0].toFixed(1)),
      React.createElement('input', { type: 'range', min: 0.5, max: 6, step: 0.5, value: f2[0],
        onChange: function (e) { f2[1](parseFloat(e.target.value)); },
        style: { flex: 1, accentColor: '#f472b6', height: 3 } }),
      React.createElement('span', { style: { color: '#f472b6', fontSize: 11, minWidth: 20 } }, 'f=' + f2[0].toFixed(1))
    ),
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 } },
      React.createElement('button', {
        onClick: function () { running[1](function (p) { return !p; }); },
        style: { background: running[0] ? '#ef4444' : '#22c55e', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 14px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }
      }, running[0] ? 'Pausar' : 'Play'),
      React.createElement('button', {
        onClick: function () { t[1](0); },
        style: { background: '#475569', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 14px', fontSize: 11, cursor: 'pointer' }
      }, 'Reset')
    ),
    React.createElement('canvas', {
      ref: canvasRef, width: W, height: H,
      style: { width: '100%', height: 'auto', borderRadius: 8, background: '#0B1120', border: '1px solid #1e293b' }
    })
  );
}