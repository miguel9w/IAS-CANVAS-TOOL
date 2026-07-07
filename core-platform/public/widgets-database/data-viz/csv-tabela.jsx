function Widget({ appBus }) {
  var raw = React.useState('');
  var parsed = React.useState(null);

  function parseCSV(text) {
    var lines = text.trim().split('\n').filter(function (l) { return l.trim(); });
    if (lines.length < 2) return null;
    var headers = lines[0].split(',').map(function (h) { return h.trim(); });
    var rows = [];
    for (var i = 1; i < lines.length; i++) {
      var vals = lines[i].split(',');
      var row = [];
      for (var j = 0; j < headers.length; j++) {
        var v = (vals[j] || '').trim();
        var n = parseFloat(v);
        row.push(isNaN(n) || v === '' ? v : n);
      }
      rows.push(row);
    }
    return { headers: headers, rows: rows };
  }

  function handleParse() {
    var data = parseCSV(raw[0]);
    if (!data) return alert('CSV deve ter cabeçalho + pelo menos 1 linha');
    parsed[1](data);
    appBus.emit('csv-data', data);
  }

  return React.createElement('div', { style: { padding: 10, fontFamily: 'monospace' } },
    React.createElement('textarea', {
      value: raw[0],
      onChange: function (e) { raw[1](e.target.value); },
      placeholder: 'mes,vendas,custos\nJan,12000,8000\nFev,15000,9000\nMar,18000,9500',
      rows: 6,
      style: { width: '100%', background: '#0B1120', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 8, padding: 10, fontSize: 12, fontFamily: 'monospace', resize: 'vertical' }
    }),
    React.createElement('div', { style: { display: 'flex', gap: 6, margin: '6px 0' } },
      React.createElement('button', {
        onClick: handleParse,
        style: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 18px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }
      }, 'Parse CSV \u25b6'),
      React.createElement('span', { style: { color: '#475569', fontSize: 9, lineHeight: '26px' } },
        'Headers: ' + (parsed[0] ? parsed[0].headers.length + ' colunas · ' + parsed[0].rows.length + ' linhas' : '-'))
    ),
    parsed[0] ? React.createElement('div', { style: { maxHeight: 220, overflow: 'auto', border: '1px solid #1e293b', borderRadius: 8 } },
      React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 11 } },
        React.createElement('thead', { style: { background: '#0E1420' } },
          React.createElement('tr', null,
            parsed[0].headers.map(function (h, i) {
              return React.createElement('th', { key: i, style: { padding: '5px 8px', textAlign: 'left', color: '#818cf8', borderBottom: '1px solid #1e293b', whiteSpace: 'nowrap' } }, h);
            })
          )
        ),
        React.createElement('tbody', null,
          parsed[0].rows.slice(0, 20).map(function (row, ri) {
            return React.createElement('tr', { key: ri, style: { background: ri % 2 ? 'transparent' : 'rgba(255,255,255,0.02)' } },
              row.map(function (v, ci) {
                return React.createElement('td', { key: ci, style: { padding: '4px 8px', color: typeof v === 'number' ? '#6ee7b7' : '#94a3b8', borderBottom: '1px solid #0f172a' } },
                  typeof v === 'number' ? v.toLocaleString() : v);
              })
            );
          })
        )
      )
    ) : null
  );
}