function Widget({ appBus }) {
  var data = React.useState(null);
  var xCol = React.useState('');
  var yCol = React.useState('');
  var canvasRef = React.useRef(null);

  React.useEffect(function () {
    return appBus.on('csv-data', function (d) {
      data[1](d);
      if (d.headers.length >= 2) { xCol[1](d.headers[0]); yCol[1](d.headers[1]); }
    });
  }, []);

  React.useEffect(function () {
    var cv = canvasRef.current;
    if (!cv || !data[0] || !xCol[0] || !yCol[0]) return;
    var ctx = cv.getContext('2d');
    var W = cv.width, H = cv.height;
    ctx.clearRect(0, 0, W, H);

    var headers = data[0].headers;
    var rows = data[0].rows;
    var xi = headers.indexOf(xCol[0]);
    var yi = headers.indexOf(yCol[0]);
    if (xi < 0 || yi < 0) return;

    var labels = [];
    var vals = [];
    for (var i = 0; i < rows.length; i++) {
      labels.push(String(rows[i][xi]));
      vals.push(typeof rows[i][yi] === 'number' ? rows[i][yi] : 0);
    }
    var max = Math.max.apply(null, vals) || 1;
    var m = { l: 50, r: 16, t: 24, b: 32 };
    var pw = W - m.l - m.r;
    var ph = H - m.t - m.b;
    var bw = Math.min(40, pw / labels.length * 0.6);
    var gap = pw / labels.length;

    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 0.5;
    for (var g = 0; g <= 4; g++) {
      var gy = m.t + ph - g / 4 * ph;
      ctx.beginPath(); ctx.moveTo(m.l, gy); ctx.lineTo(W - m.r, gy); ctx.stroke();
      ctx.fillStyle = '#475569'; ctx.font = '9px monospace'; ctx.textAlign = 'right';
      ctx.fillText((g / 4 * max).toFixed(0), m.l - 6, gy + 3);
    }
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(m.l, m.t); ctx.lineTo(m.l, m.t + ph);
    ctx.lineTo(W - m.r, m.t + ph); ctx.stroke();

    var colors = ['#818cf8', '#6ee7b7', '#f472b6', '#fcd34d', '#fb923c', '#a78bfa'];
    for (var i = 0; i < labels.length; i++) {
      var bx = m.l + i * gap + (gap - bw) / 2;
      var bh = vals[i] / max * ph;
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(bx, m.t + ph - bh, bw, bh);
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText(labels[i], m.l + i * gap + gap / 2, H - 6);
      ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
      ctx.fillText(vals[i], m.l + i * gap + gap / 2, m.t + ph - bh - 4);
    }

    ctx.fillStyle = '#a5b4fc'; ctx.font = '10px monospace'; ctx.textAlign = 'left';
    ctx.fillText(yCol[0], 6, 14);
  });

  if (!data[0]) {
    return React.createElement('div', { style: { padding: 20, textAlign: 'center', color: '#475569', fontFamily: 'monospace', fontSize: 12 } },
      'Aguardando dados CSV...\nCole e parseie no widget "CSV - Dados"');
  }

  return React.createElement('div', { style: { padding: 10, fontFamily: 'monospace' } },
    React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 6 } },
      React.createElement('select', {
        value: xCol[0], onChange: function (e) { xCol[1](e.target.value); },
        style: { flex: 1, background: '#0B1120', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 6, padding: '3px 6px', fontSize: 11, fontFamily: 'monospace' }
      }, data[0].headers.map(function (h) {
        return React.createElement('option', { key: h, value: h }, 'X: ' + h);
      })),
      React.createElement('select', {
        value: yCol[0], onChange: function (e) { yCol[1](e.target.value); },
        style: { flex: 1, background: '#0B1120', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 6, padding: '3px 6px', fontSize: 11, fontFamily: 'monospace' }
      }, data[0].headers.map(function (h) {
        return React.createElement('option', { key: h, value: h }, 'Y: ' + h);
      }))
    ),
    React.createElement('canvas', {
      ref: canvasRef, width: 430, height: 290,
      style: { width: '100%', height: 'auto', borderRadius: 8, background: '#0B1120', border: '1px solid #1e293b' }
    })
  );
}