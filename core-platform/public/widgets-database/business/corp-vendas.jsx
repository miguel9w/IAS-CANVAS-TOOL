function Widget({ appBus }) {
  var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef;
  var data = useState(null);
  var mesesVisiveis = useState(12);
  var canvasRef = useRef(null);

  useEffect(function () {
    return appBus.on('corp:vendas', function (d) { data[1](d); });
  }, []);

  useEffect(function () {
    var cv = canvasRef.current;
    if (!cv || !data[0]) return;
    var ctx = cv.getContext('2d');
    var W = cv.width, H = cv.height;
    ctx.clearRect(0, 0, W, H);

    var maxMeses = Math.min(mesesVisiveis[0], data[0].meses.length);
    var meses = data[0].meses.slice(-maxMeses);
    var receitas = data[0].receitas.slice(-maxMeses);
    var custos = data[0].custos.slice(-maxMeses);

    var maxVal = Math.max.apply(null, receitas) * 1.15;
    var m = { l: 52, r: 16, t: 28, b: 34 };
    var pw = W - m.l - m.r, ph = H - m.t - m.b;
    var bw = Math.min(30, pw / meses.length * 0.35);
    var gap = pw / meses.length;

    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 0.5;
    for (var g = 0; g <= 4; g++) {
      var gy = m.t + ph - g / 4 * ph;
      ctx.beginPath(); ctx.moveTo(m.l, gy); ctx.lineTo(W - m.r, gy); ctx.stroke();
      ctx.fillStyle = '#475569'; ctx.font = '9px monospace'; ctx.textAlign = 'right';
      ctx.fillText((g / 4 * maxVal).toFixed(0), m.l - 6, gy + 3);
    }

    for (var i = 0; i < meses.length; i++) {
      var cx = m.l + i * gap + gap / 2;
      var bhR = receitas[i] / maxVal * ph;
      var bhC = custos[i] / maxVal * ph;
      ctx.fillStyle = '#818cf8';
      ctx.fillRect(cx - bw, m.t + ph - bhR, bw, bhR);
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(cx, m.t + ph - bhC, bw * 0.6, bhC);
      ctx.fillStyle = '#94a3b8'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText(meses[i].slice(0,3), cx, H - 4);
    }

    ctx.fillStyle = '#a5b4fc'; ctx.font = '10px monospace'; ctx.textAlign = 'left';
    ctx.fillText('Receita', 6, 14);
    ctx.fillStyle = '#f9a8d4';
    ctx.fillText('Custo', 66, 14);
  });

  var d = data[0];
  var receitaTotal = d ? d.receitas.reduce(function(a,b){return a+b;},0) : 0;
  var custoTotal = d ? d.custos.reduce(function(a,b){return a+b;},0) : 0;
  var ticket = d ? (receitaTotal / d.receitas.length) : 0;
  var cresc = d && d.receitas.length >= 2 ? ((d.receitas[d.receitas.length-1] / d.receitas[d.receitas.length-2] - 1) * 100).toFixed(1) : '-';
  var metaPerc = d && d.meta ? (receitaTotal / d.meta * 100).toFixed(1) : '-';

  if (!d) {
    return React.createElement('div', { style: { padding: 20, textAlign: 'center', color: '#475569', fontFamily: 'monospace', fontSize: 12 } },
      'Aguardando dados...\nUse "Dados Corporativos" ou "CSV Corporativo"');
  }

  return React.createElement('div', { style: { padding: 10, fontFamily: 'monospace' } },
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 } },
      React.createElement('span', { style: { color: '#818cf8', fontWeight: 700, fontSize: 13 } }, 'Vendas'),
      React.createElement('select', { value: mesesVisiveis[0], onChange: function(e){mesesVisiveis[1](Number(e.target.value));}, style: { background: '#0B1120', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 6, padding: '3px 8px', fontSize: 10, fontFamily: 'monospace' } },
        React.createElement('option', { value: 3 }, '3 meses'),
        React.createElement('option', { value: 6 }, '6 meses'),
        React.createElement('option', { value: 12 }, '12 meses')
      )
    ),
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 8 } },
      React.createElement(kpiCard, { label: 'Receita Total', value: 'R$ ' + receitaTotal.toLocaleString(), color: '#818cf8' }),
      React.createElement(kpiCard, { label: 'Ticket Medio', value: 'R$ ' + ticket.toFixed(0), color: '#6ee7b7' }),
      React.createElement(kpiCard, { label: 'Crescimento', value: cresc + '%', color: parseFloat(cresc) >= 0 ? '#6ee7b7' : '#f87171' })
    ),
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 } },
      React.createElement(kpiCard, { label: 'Custos Totais', value: 'R$ ' + custoTotal.toLocaleString(), color: '#f472b6' }),
      React.createElement(kpiCard, { label: 'Meta Atingida', value: metaPerc + '%', color: parseFloat(metaPerc) >= 100 ? '#6ee7b7' : '#fcd34d' })
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
