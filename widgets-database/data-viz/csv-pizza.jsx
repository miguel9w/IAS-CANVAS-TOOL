function Widget({ appBus }) {
  var data = React.useState(null);
  var catCol = React.useState('');
  var valCol = React.useState('');
  var canvasRef = React.useRef(null);

  React.useEffect(function () {
    return appBus.on('csv-data', function (d) {
      data[1](d);
      if (d.headers.length >= 2) { catCol[1](d.headers[0]); valCol[1](d.headers[d.headers.length - 1]); }
    });
  }, []);

  React.useEffect(function () {
    var cv = canvasRef.current;
    if (!cv || !data[0] || !catCol[0] || !valCol[0]) return;
    var ctx = cv.getContext('2d');
    var W = cv.width, H = cv.height;
    ctx.clearRect(0, 0, W, H);

    var headers = data[0].headers;
    var rows = data[0].rows;
    var ci = headers.indexOf(catCol[0]);
    var vi = headers.indexOf(valCol[0]);
    if (ci < 0 || vi < 0) return;

    var labels = [];
    var vals = [];
    for (var i = 0; i < rows.length; i++) {
      labels.push(String(rows[i][ci]));
      vals.push(typeof rows[i][vi] === 'number' ? rows[i][vi] : 0);
    }
    var total = 0;
    for (var i = 0; i < vals.length; i++) total += vals[i];
    if (total === 0) return;

    var cx = 140, cy = H / 2, r = Math.min(cx - 10, H / 2 - 16);
    var colors = ['#818cf8','#6ee7b7','#f472b6','#fcd34d','#fb923c','#a78bfa','#34d399','#f87171','#e879f9','#c084fc'];
    var startA = -Math.PI / 2;

    for (var i = 0; i < vals.length; i++) {
      var sliceA = (vals[i] / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startA, startA + sliceA);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      var midA = startA + sliceA / 2;
      if (sliceA > 0.08) {
        var px = cx + Math.cos(midA) * r * 0.65;
        var py = cy + Math.sin(midA) * r * 0.65;
        ctx.fillStyle = '#0B1120';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((vals[i] / total * 100).toFixed(1) + '%', px, py);
      }
      startA += sliceA;
    }

    var legX = 280, legY = 14;
    for (var i = 0; i < labels.length; i++) {
      var ly = legY + i * 18;
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(legX, ly, 10, 10);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(labels[i] + ' (' + vals[i].toLocaleString() + ')', legX + 16, ly + 9);
    }

    ctx.fillStyle = '#a5b4fc';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(valCol[0], 6, 6);
  });

  if (!data[0]) {
    return React.createElement('div', { style: { padding: 20, textAlign: 'center', color: '#475569', fontFamily: 'monospace', fontSize: 12 } },
      'Aguardando dados CSV...\nCole e parseie no widget "CSV - Dados"');
  }

  return React.createElement('div', { style: { padding: 10, fontFamily: 'monospace' } },
    React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 6 } },
      React.createElement('select', {
        value: catCol[0], onChange: function (e) { catCol[1](e.target.value); },
        style: { flex: 1, background: '#0B1120', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 6, padding: '3px 6px', fontSize: 11, fontFamily: 'monospace' }
      }, data[0].headers.map(function (h) {
        return React.createElement('option', { key: h, value: h }, 'R\u00f3tulo: ' + h);
      })),
      React.createElement('select', {
        value: valCol[0], onChange: function (e) { valCol[1](e.target.value); },
        style: { flex: 1, background: '#0B1120', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 6, padding: '3px 6px', fontSize: 11, fontFamily: 'monospace' }
      }, data[0].headers.map(function (h) {
        return React.createElement('option', { key: h, value: h }, 'Valor: ' + h);
      }))
    ),
    React.createElement('canvas', {
      ref: canvasRef, width: 430, height: 300,
      style: { width: '100%', height: 'auto', borderRadius: 8, background: '#0B1120', border: '1px solid #1e293b' }
    })
  );
}