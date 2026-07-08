function Widget({ appBus }) {
  var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef;
  var data = useState(null);
  var tableRef = useRef(null);

  useEffect(function () {
    return appBus.on('corp:precos', function (d) { data[1](d); });
  }, []);

  useEffect(function () {
    if (!data[0] || !tableRef.current) return;
    var cvs = tableRef.current.querySelectorAll('canvas');
    data[0].forEach(function(p, idx) {
      var cv = cvs[idx];
      if (!cv || !p.historico || p.historico.length < 2) return;
      var ctx = cv.getContext('2d');
      var W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H);
      var vals = p.historico;
      var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
      var range = max - min || 1;
      var n = vals.length - 1 || 1;
      ctx.beginPath(); ctx.strokeStyle = vals[vals.length-1] >= vals[0] ? '#6ee7b7' : '#f87171'; ctx.lineWidth = 1.5;
      for (var i = 0; i < vals.length; i++) {
        var px = i / n * W, py = H - (vals[i] - min) / range * H;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.beginPath(); ctx.arc(W - 2, H - (vals[vals.length-1] - min) / range * H, 2, 0, 2 * Math.PI);
      ctx.fillStyle = vals[vals.length-1] >= vals[0] ? '#6ee7b7' : '#f87171'; ctx.fill();
    });
  });

  if (!data[0]) {
    return React.createElement('div', { style: { padding: 20, textAlign: 'center', color: '#475569', fontFamily: 'monospace', fontSize: 12 } },
      'Aguardando dados...\nUse "Dados Corporativos" ou "CSV Corporativo"');
  }

  return React.createElement('div', { style: { padding: 10, fontFamily: 'monospace' } },
    React.createElement('div', { style: { color: '#f472b6', fontWeight: 700, fontSize: 13, marginBottom: 8 } }, 'Monitor de Precos'),
    React.createElement('div', { ref: tableRef, style: { overflow: 'auto', maxHeight: 340, border: '1px solid #1e293b', borderRadius: 8 } },
      React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 11 } },
        React.createElement('thead', { style: { background: '#0E1420' } },
          React.createElement('tr', null,
            React.createElement('th', { style: { padding: '6px 10px', color: '#818cf8', borderBottom: '1px solid #1e293b', textAlign: 'left' } }, 'Produto'),
            React.createElement('th', { style: { padding: '6px 10px', color: '#818cf8', borderBottom: '1px solid #1e293b', textAlign: 'right' } }, 'Atual'),
            React.createElement('th', { style: { padding: '6px 10px', color: '#818cf8', borderBottom: '1px solid #1e293b', textAlign: 'right' } }, 'Anterior'),
            React.createElement('th', { style: { padding: '6px 10px', color: '#818cf8', borderBottom: '1px solid #1e293b', textAlign: 'right' } }, 'Var. R$'),
            React.createElement('th', { style: { padding: '6px 10px', color: '#818cf8', borderBottom: '1px solid #1e293b', textAlign: 'right' } }, 'Var. %'),
            React.createElement('th', { style: { padding: '6px 10px', color: '#818cf8', borderBottom: '1px solid #1e293b', textAlign: 'center' } }, 'Tendencia')
          )
        ),
        React.createElement('tbody', null,
          data[0].map(function(p, i) {
            var diff = p.atual - p.anterior;
            var perc = p.anterior > 0 ? (diff / p.anterior * 100).toFixed(1) : '-';
            var isUp = diff >= 0;
            var color = isUp ? '#6ee7b7' : '#f87171';
            var hist = p.historico || [];
            return React.createElement('tr', { key: i, style: { background: i % 2 ? 'transparent' : 'rgba(255,255,255,0.02)' } },
              React.createElement('td', { style: { padding: '5px 10px', color: '#e2e8f0', borderBottom: '1px solid #0f172a', fontWeight: 500 } }, p.produto),
              React.createElement('td', { style: { padding: '5px 10px', color: '#e2e8f0', borderBottom: '1px solid #0f172a', textAlign: 'right', fontWeight: 700 } }, 'R$ ' + p.atual.toLocaleString()),
              React.createElement('td', { style: { padding: '5px 10px', color: '#94a3b8', borderBottom: '1px solid #0f172a', textAlign: 'right' } }, 'R$ ' + p.anterior.toLocaleString()),
              React.createElement('td', { style: { padding: '5px 10px', color: color, borderBottom: '1px solid #0f172a', textAlign: 'right', fontWeight: 600 } }, (isUp ? '+' : '') + diff.toLocaleString()),
              React.createElement('td', { style: { padding: '5px 10px', color: color, borderBottom: '1px solid #0f172a', textAlign: 'right', fontWeight: 600 } }, (isUp ? '+' : '') + perc + '%'),
              React.createElement('td', { style: { padding: '5px 10px', borderBottom: '1px solid #0f172a', textAlign: 'center' } },
                React.createElement('canvas', { width: 50, height: 20, style: { display: 'inline-block', verticalAlign: 'middle' } })
              )
            );
          })
        )
      )
    ),
    React.createElement('div', { style: { color: '#64748b', fontSize: 9, marginTop: 6 } },
      data[0].length + ' produtos monitorados'
    )
  );
}
