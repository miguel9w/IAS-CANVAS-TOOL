function Widget({ appBus }) {
  var useState = React.useState;
  var raw = useState('');
  var parsed = useState(null);

  var SAMPLE = '[METAS]\nnome,atual,target,unidade\nReceita Anual,1835000,2000000,R$\nNovos Clientes,312,500,clientes\nSatisfacao,87,95,%\n---\n[VENDAS]\nmes,receita,custo\nJan/2026,120000,80000\nFev/2026,135000,85000\nMar/2026,142000,88000\n---\n[FLUXO]\nmes,entradas,saidas\nJan,150000,120000\nFev,160000,125000\nMar,172000,130000\n---\n[PRECOS]\nproduto,anterior,atual,historico\nNotebook Pro X,5200,5500,"4500,4700,4600,5000,5200,5500"\nMonitor UW,2000,1950,"2200,2150,2100,2050,2000,1950"\nTeclado Mec,480,500,"350,380,420,450,480,500"';

  function parseSectionCSV(text) {
    var lines = text.trim().split('\n').filter(function(l){return l.trim();});
    if (lines.length < 2) return null;
    var headers = lines[0].split(',').map(function(h){return h.trim();});
    var rows = [];
    for (var i = 1; i < lines.length; i++) {
      var vals = lines[i].split(',');
      var row = {};
      for (var j = 0; j < headers.length; j++) {
        var v = (vals[j]||'').trim();
        var n = parseFloat(v);
        row[headers[j]] = (isNaN(n) || v === '' ? v : n);
      }
      rows.push(row);
    }
    return { headers: headers, rows: rows };
  }

  function smartParse(v) {
    if (typeof v === 'string' && v.indexOf(',') >= 0) {
      var parts = v.split(',').map(function(p){return parseFloat(p.trim());});
      if (parts.every(function(p){return !isNaN(p);})) return parts;
    }
    return v;
  }

  function handleParse() {
    var text = raw[0];
    var sections = text.split('---\n').map(function(s){return s.trim();}).filter(function(s){return s;});
    var result = { vendas: null, metas: null, fluxo: null, precos: null };

    for (var si = 0; si < sections.length; si++) {
      var sec = sections[si];
      var lines = sec.split('\n');
      var headerLine = lines[0].trim();
      var match = headerLine.match(/^\[(\w+)\]$/);
      if (!match) continue;
      var secName = match[1].toLowerCase();
      var csvText = lines.slice(1).join('\n');
      var data = parseSectionCSV(csvText);
      if (!data) continue;

      if (secName === 'metas') {
        result.metas = data.rows.map(function(r){
          return { nome: r.nome || '', atual: r.atual || 0, target: r.target || 0, unidade: r.unidade || '' };
        });
      } else if (secName === 'vendas') {
        result.vendas = { meses: [], receitas: [], custos: [], meta: data.rows[0] && data.rows[0].meta || 0 };
        for (var i = 0; i < data.rows.length; i++) {
          result.vendas.meses.push(String(data.rows[i].mes || ''));
          result.vendas.receitas.push(typeof data.rows[i].receita === 'number' ? data.rows[i].receita : 0);
          result.vendas.custos.push(typeof data.rows[i].custo === 'number' ? data.rows[i].custo : 0);
        }
      } else if (secName === 'fluxo') {
        result.fluxo = { meses: [], entradas: [], saidas: [] };
        for (var i = 0; i < data.rows.length; i++) {
          result.fluxo.meses.push(String(data.rows[i].mes || ''));
          result.fluxo.entradas.push(typeof data.rows[i].entradas === 'number' ? data.rows[i].entradas : 0);
          result.fluxo.saidas.push(typeof data.rows[i].saidas === 'number' ? data.rows[i].saidas : 0);
        }
      } else if (secName === 'precos') {
        result.precos = data.rows.map(function(r){
          var hist = smartParse(r.historico);
          return { produto: String(r.produto || ''), historico: Array.isArray(hist) ? hist : [], atual: r.atual || 0, anterior: r.anterior || 0 };
        });
      }
    }

    if (!result.vendas || !result.metas || !result.fluxo || !result.precos) {
      alert('Formato: use secoes [VENDAS] [METAS] [FLUXO] [PRECOS] separadas por "---"');
      return;
    }
    parsed[1](result);
    appBus.emit('corp:data', result);
    appBus.emit('corp:vendas', result.vendas);
    appBus.emit('corp:metas', result.metas);
    appBus.emit('corp:fluxo', result.fluxo);
    appBus.emit('corp:precos', result.precos);
  }

  var s = {
    outer: { padding: 12, fontFamily: 'monospace', height: '100%', display: 'flex', flexDirection: 'column', gap: 8 },
    textarea: { width: '100%', flex: 1, minHeight: 160, background: '#0B1120', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 8, padding: 10, fontSize: 11, fontFamily: 'monospace', resize: 'vertical', lineHeight: 1.5 },
    btn: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 18px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }
  };

  return React.createElement('div', { style: s.outer },
    React.createElement('div', { style: { display: 'flex', gap: 6, alignItems: 'center' } },
      React.createElement('span', { style: { color: '#fcd34d', fontWeight: 700, fontSize: 13 } }, 'Dados Corporativos (CSV)'),
      parsed[0] ? React.createElement('span', { style: { color: '#6ee7b7', fontSize: 10 } }, 'Vendas: ' + (parsed[0].vendas.meses.length) + 'm · Metas: ' + parsed[0].metas.length + ' · Produtos: ' + parsed[0].precos.length) : null
    ),
    React.createElement('textarea', { value: raw[0], onChange: function(e){raw[1](e.target.value);}, style: s.textarea, placeholder: '[METAS]\nnome,atual,target,unidade\nReceita,500,1000,R$\n---\n[VENDAS]\nmes,receita,custo\nJan,120000,80000\n---\n[FLUXO]\nmes,entradas,saidas\nJan,150000,120000\n---\n[PRECOS]\nproduto,anterior,atual,historico\nProduto,100,120,"100,110,120"' }),
    React.createElement('div', { style: { display: 'flex', gap: 6 } },
      React.createElement('button', { onClick: handleParse, style: s.btn }, 'Parse CSV \u25b6'),
      React.createElement('button', { onClick: function(){raw[1](SAMPLE);}, style: { background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: 6, padding: '5px 14px', fontSize: 10, cursor: 'pointer' } }, 'Exemplo')
    ),
    parsed[0] ? React.createElement('div', { style: { background: '#0f172a', borderRadius: 6, padding: 8, fontSize: 10, color: '#94a3b8', lineHeight: 1.6 } },
      'Vendas: ' + parsed[0].vendas.meses.length + ' meses\nMetas: ' + parsed[0].metas.length + ' indicadores\nFluxo: ' + parsed[0].fluxo.meses.length + ' meses\nPrecos: ' + parsed[0].precos.length + ' produtos'
    ) : null
  );
}
