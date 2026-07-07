function Widget({ appBus }) {
  var data = React.useState(null);
  var xCol = React.useState('');
  var yCols = React.useState([]);
  var canvasRef = React.useRef(null);

  React.useEffect(function () {
    return appBus.on('csv-data', function (d) {
      data[1](d);
      if (d.headers.length >= 2) {
        xCol[1](d.headers[0]);
        yCols[1]([d.headers[1]]);
      }
    });
  }, []);

  function toggleY(h) {
    var cur = yCols[0];
    if (h === xCol[0]) return;
    var idx = cur.indexOf(h);
    if (idx >= 0) yCols[1](cur.filter(function (c) { return c !== h; }));
    else if (cur.length < 4) yCols[1]([].concat(cur, [h]));
  }

  React.useEffect(function () {
    var cv = canvasRef.current;
    if (!cv || !data[0] || !xCol[0] || yCols[0].length === 0) return;
    var ctx = cv.getContext('2d');
    var W = cv.width, H = cv.height;
    ctx.clearRect(0, 0, W, H);

    var headers = data[0].headers;
    var rows = data[0].rows;
    var xi = headers.indexOf(xCol[0]);
    if (xi < 0) return;

    var series = [];
    var allMax = 0;
    for (var s = 0; s < yCols[0].length; s++) {
      var yi = headers.indexOf(yCols[0][s]);
      if (yi < 0) continue;
      var pts = [];
      for (var i = 0; i < rows.length; i++) {
        var v = typeof rows[i][yi] === 'number' ? rows[i][yi] : 0;
        pts.push(v);
        if (v > allMax) allMax = v;
      }
      series.push({ label: yCols[0][s], yi: yi, pts: pts });
    }
    if (series.length === 0) return;
    allMax = allMax || 1;

    var m = { l: 48, r: 16, t: 24, b: 32 };
    var pw = W - m.l - m.r;
    var ph = H - m.t - m.b;
    var n = rows.length - 1 || 1;

    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 0.5;
    for (var g = 0; g <= 4; g++) {
      var gy = m.t + ph - g / 4 * ph;
      ctx.beginPath(); ctx.moveTo(m.l, gy); ctx.lineTo(W - m.r, gy); ctx.stroke();
      ctx.fillStyle = '#475569'; ctx.font = '9px monospace'; ctx.textAlign = 'right';
      ctx.fillText((g / 4 * allMax).toFixed(0), m.l - 6, gy + 3);
    }
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(m.l, m.t); ctx.lineTo(m.l, m.t + ph);
    ctx.lineTo(W - m.r, m.t + ph); ctx.stroke();

    var colors = ['#818cf8', '#6ee7b7', '#f472b6', '#fcd34d'];
    var dashes = [[], [6, 3], [2, 3], [10, 4]];
    for (var s = 0; s < series.length; s++) {
      var p = series[s];
      ctx.beginPath();
      ctx.strokeStyle = colors[s % colors.length];
      ctx.lineWidth = 2;
      ctx.setLineDash(dashes[s % dashes.length]);
      for (var i = 0; i < p.pts.length; i++) {
        var px = m.l + i / n * pw;
        var py = m.t + ph - p.pts[i] / allMax * ph;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      for (var i = 0; i < p.pts.length; i++) {
        var px = m.l + i / n * pw;
        var py = m.t + ph - p.pts[i] / allMax * ph;
        ctx.beginPath(); ctx.arc(px, py, 3, 0, 2 * Math.PI);
        ctx.fillStyle = colors[s % colors.length];
        ctx.fill();
      }
    }

    for (var i = 0; i < rows.length; i++) {
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText(String(rows[i][xi]), m.l + i / n * pw, H - 6);
    }
    ctx.fillStyle = '#a5b4fc'; ctx.font = '10px monospace'; ctx.textAlign = 'left';
    ctx.fillText(xCol[0], 6, 14);

    ctx.textAlign = 'right';
    var legX = W - 12;
    var legY = m.t + 2;
    for (var s = 0; s < series.length; s++) {
      ctx.fillStyle = colors[s % colors.length];
      ctx.fillRect(legX - 36, legY + (s * 12), 10, 2);
      ctx.font = '9px monospace'; ctx.textAlign = 'right';
      ctx.fillText(series[s].label, legX - 4, legY + (s * 12) + 3);
    }
  });

  if (!data[0]) {
    return React.createElement('div', { style: { padding: 20, textAlign: 'center', color: '#475569', fontFamily: 'monospace', fontSize: 12 } },
      'Aguardando dados CSV...\nCole e parseie no widget "CSV - Dados"');
  }

  return React.createElement('div', { style: { padding: 10, fontFamily: 'monospace' } },
    React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' } },
      React.createElement('select', {
        value: xCol[0], onChange: function (e) { xCol[1](e.target.value); },
        style: { flex: 1, background: '#0B1120', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 6, padding: '3px 6px', fontSize: 11, fontFamily: 'monospace' }
      }, data[0].headers.map(function (h) {
        return React.createElement('option', { key: h, value: h }, 'Eixo X: ' + h);
      }))
    ),
    React.createElement('div', { style: { display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 } },
      data[0].headers.map(function (h) {
        if (h === xCol[0]) return null;
        var active = yCols[0].indexOf(h) >= 0;
        return React.createElement('button', {
          key: h, onClick: function () { toggleY(h); },
          style: { background: active ? 'rgba(99,102,241,0.2)' : 'transparent', color: active ? '#818cf8' : '#64748b', border: '1px solid ' + (active ? 'rgba(99,102,241,0.4)' : '#334155'), borderRadius: 4, padding: '2px 8px', fontSize: 10, cursor: 'pointer', fontFamily: 'monospace' }
        }, (active ? '\u2713 ' : '') + h);
      })
    ),
    React.createElement('canvas', {
      ref: canvasRef, width: 430, height: 280,
      style: { width: '100%', height: 'auto', borderRadius: 8, background: '#0B1120', border: '1px solid #1e293b' }
    })
  );
}