function Widget({ appBus }) {
  var useState = React.useState, useEffect = React.useEffect;
  var metas = useState(null);
  var orderBy = useState('progresso');

  useEffect(function () {
    return appBus.on('corp:metas', function (d) { metas[1](d); });
  }, []);

  if (!metas[0]) {
    return React.createElement('div', { style: { padding: 20, textAlign: 'center', color: '#475569', fontFamily: 'monospace', fontSize: 12 } },
      'Aguardando dados...\nUse "Dados Corporativos" ou "CSV Corporativo"');
  }

  var lista = [].concat(metas[0]);
  if (orderBy[0] === 'progresso') lista.sort(function(a,b){ return (a.atual/a.target) - (b.atual/b.target); });
  else if (orderBy[0] === 'nome') lista.sort(function(a,b){ return a.nome.localeCompare(b.nome); });

  return React.createElement('div', { style: { padding: 12, fontFamily: 'monospace' } },
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 } },
      React.createElement('span', { style: { color: '#6ee7b7', fontWeight: 700, fontSize: 13 } }, 'Metas'),
      React.createElement('select', { value: orderBy[0], onChange: function(e){orderBy[1](e.target.value);}, style: { background: '#0B1120', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 6, padding: '3px 8px', fontSize: 10, fontFamily: 'monospace' } },
        React.createElement('option', { value: 'progresso' }, 'Ordenar: Progresso'),
        React.createElement('option', { value: 'nome' }, 'Ordenar: Nome')
      )
    ),
    lista.map(function(m, i) {
      var perc = m.target > 0 ? Math.min(m.atual / m.target * 100, 100) : 0;
      var status = perc >= 80 ? '#6ee7b7' : perc >= 50 ? '#fcd34d' : '#f87171';
      var label = m.unidade === 'R$' ? 'R$ ' + m.atual.toLocaleString() + ' / R$ ' + m.target.toLocaleString()
        : m.unidade === '%' ? m.atual + '% / ' + m.target + '%'
        : m.atual.toLocaleString() + ' / ' + m.target.toLocaleString() + ' ' + m.unidade;
      return React.createElement('div', { key: i, style: { background: '#0f172a', borderRadius: 8, padding: '8px 12px', marginBottom: 6, border: '1px solid #1e293b' } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 4 } },
          React.createElement('span', { style: { color: '#e2e8f0', fontSize: 12, fontWeight: 600 } }, m.nome),
          React.createElement('span', { style: { color: status, fontSize: 12, fontWeight: 700 } }, perc.toFixed(0) + '%')
        ),
        React.createElement('div', { style: { height: 8, background: '#0B1120', borderRadius: 4, marginBottom: 4, overflow: 'hidden' } },
          React.createElement('div', { style: { height: '100%', width: perc + '%', background: status, borderRadius: 4, transition: 'width 0.3s' } })
        ),
        React.createElement('div', { style: { color: '#64748b', fontSize: 10 } }, label)
      );
    })
  );
}
