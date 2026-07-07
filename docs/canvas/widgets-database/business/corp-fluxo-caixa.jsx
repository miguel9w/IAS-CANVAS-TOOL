function Widget({ appBus }) {
  var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef;
  var data = useState(null);
  var canvasRef = useRef(null);
  var mesesVisiveis = useState(12);

  useEffect(function () {
    return appBus.on('corp:fluxo', function (d) { data[1](d); });
  }, []);

  useEffect(function () {
    var cv = canvasRef.current;
    if (!cv || !data[0]) return;
    var ctx = cv.getContext('2d');
    var W = cv.width, H = cv.height;
    ctx.clearRect(0, 0, W, H);

    var maxM = Math.min(mesesVisiveis[0], data[0].meses.length);
    var meses = data[0].meses.slice(-maxM);
    var entradas = data[0].entradas.slice(-maxM);
    var saidas = data[0].saidas.slice(-maxM);

    var maxVal = Math.max.apply(null, entradas) * 1.15;
    var m = { l: 52, r: 16, t: 28, b: 34 };
    var pw = W - m.l - m.r, ph = H - m.t - m.b;
    var n = meses.length - 1 || 1;

    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 0.5;
    for (var g = 0; g <= 4; g++) {
      var gy = m.t + ph - g / 4 * ph;
      ctx.beginPath(); ctx.moveTo(m.l, gy); ctx.lineTo(W - m.r, gy); ctx.stroke();
      ctx.fillStyle = '#475569'; ctx.font = '9px monospace'; ctx.textAlign = 'right';
      ctx.fillText((g / 4 * maxVal).toFixed(0), m.l - 6, gy + 3);
    }

    function drawLine(pts, color, fill) {
      ctx.beginPath();
      for (var i = 0; i < pts.length; i++) {
        var px = m.l + i / n * pw;
        var py = m.t + ph - pts[i] / maxVal * ph;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();

      for (var i = 0; i < pts.length; i++) {
        var px = m.l + i / n * pw;
        var py = m.t + ph - pts[i] / maxVal * ph;
        ctx.beginPath(); ctx.arc(px, py, 3, 0, 2 * Math.PI);
        ctx.fillStyle = color; ctx.fill();
      }
    }

    drawLine(entradas, '#6ee7b7');
    drawLine(saidas, '#f87171');

    for (var i = 0; i < meses.length; i++) {
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText(meses[i], m.l + i / n * pw, H - 4);
    }

    ctx.fillStyle = '#6ee7b7'; ctx.font = '10px monospace'; ctx.textAlign = 'left';
    ctx.fillText('Entradas', 6, 14);
    ctx.fillStyle = '#f87171';
    ctx.fillText('Saidas', 76, 14);
  });

  var d = data[0];
  if (!d) {
    return React.createElement('div', { style: { padding: 20, textAlign: 'center', color: '#475569', fontFamily: 'monospace', fontSize: 12 } },
      'Aguardando dados...\nUse "Dados Corporativos" ou "CSV Corporativo"');
  }

  var totalEnt = d.entradas.reduce(function(a,b){return a+b;}, 0);
  var totalSai = d.saidas.reduce(function(a,b){return a+b;}, 0);
  var saldo = totalEnt - totalSai;

  return React.createElement('div', { style: { padding: 10, fontFamily: 'monospace' } },
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 } },
      React.createElement('span', { style: { color: '#fcd34d', fontWeight: 700, fontSize: 13 } }, 'Fluxo de Caixa'),
      React.createElement('select', { value: mesesVisiveis[0], onChange: function(e){mesesVisiveis[1](Number(e.target.value));}, style: { background: '#0B1120', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 6, padding: '3px 8px', fontSize: 10, fontFamily: 'monospace' } },
        React.createElement('option', { value: 3 }, '3 meses'),
        React.createElement('option', { value: 6 }, '6 meses'),
        React.createElement('option', { value: 12 }, '12 meses')
      )
    ),
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 8 } },
      React.createElement(kpiCard, { label: 'Total Entradas', value: 'R$ ' + totalEnt.toLocaleString(), color: '#6ee7b7' }),
      React.createElement(kpiCard, { label: 'Total Saidas', value: 'R$ ' + totalSai.toLocaleString(), color: '#f87171' }),
      React.createElement(kpiCard, { label: 'Saldo', value: 'R$ ' + saldo.toLocaleString(), color: saldo >= 0 ? '#6ee7b7' : '#f87171' })
    ),
    React.createElement('canvas', { ref: canvasRef, width: 430, height: 240, style: { width: '100%', height: 'auto', borderRadius: 8, background: '#0B1120', border: '1px solid #1e293b' } })
  );
}

function kpiCard(_ref) {
  return React.createElement('div', { style: { background: '#0f172a', borderRadius: 8, padding: '6px 10px', border: '1px solid #1e293b' } },
    React.createElement('div', { style: { color: '#64748b', fontSize: 9, marginBottom: 2 } }, _ref.label),
    React.createElement('div', { style: { color: _ref.color, fontSize: 15, fontWeight: 700 } }, _ref.value)
  );
}
