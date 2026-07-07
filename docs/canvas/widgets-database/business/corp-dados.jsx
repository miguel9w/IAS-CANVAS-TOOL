function Widget({ appBus }) {
  var useState = React.useState;
  var raw = useState(JSON.stringify({
    vendas: { meses: ["Jan/2026","Fev/2026","Mar/2026","Abr/2026","Mai/2026","Jun/2026","Jul/2026","Ago/2026","Set/2026","Out/2026","Nov/2026","Dez/2026"], receitas: [120000,135000,142000,138000,155000,162000,148000,170000,165000,180000,190000,210000], custos: [80000,85000,88000,82000,92000,95000,90000,98000,94000,105000,110000,120000], meta: 2000000 },
    metas: [{ nome:"Receita Anual", atual:1835000, target:2000000, unidade:"R$" }, { nome:"Novos Clientes", atual:312, target:500, unidade:"clientes" }, { nome:"Satisfacao", atual:87, target:95, unidade:"%" }, { nome:"Produtos Lancados", atual:3, target:6, unidade:"produtos" }, { nome:"Economia Custos", atual:42000, target:100000, unidade:"R$" }],
    fluxo: { meses:["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"], entradas:[150000,160000,172000,165000,180000,195000,188000,200000,210000,195000,220000,240000], saidas:[120000,125000,130000,118000,140000,145000,138000,150000,148000,155000,160000,170000] },
    precos: [{ produto:"Notebook Pro X", historico:[4500,4700,4600,5000,5200,5500], atual:5500, anterior:5200 }, { produto:"Monitor UltraWide", historico:[2200,2150,2100,2050,2000,1950], atual:1950, anterior:2000 }, { produto:"Teclado Mecânico", historico:[350,380,420,450,480,500], atual:500, anterior:480 }, { produto:"Mouse Wireless", historico:[180,175,190,185,200,210], atual:210, anterior:200 }, { produto:"Webcam 4K", historico:[600,580,550,520,500,480], atual:480, anterior:500 }, { produto:"SSD 1TB", historico:[450,420,400,380,350,320], atual:320, anterior:350 }, { produto:"Hub USB-C", historico:[250,260,270,280,290,300], atual:300, anterior:290 }, { produto:"Fone ANC", historico:[800,780,750,720,700,680], atual:680, anterior:700 }]
  }, null, 2));
  var parsed = useState(null);

  function handleParse() {
    try {
      var d = JSON.parse(raw[0]);
      if (!d.vendas || !d.metas || !d.fluxo || !d.precos) { alert("JSON deve conter: vendas, metas, fluxo, precos"); return; }
      parsed[1](d);
      appBus.emit('corp:data', d);
      appBus.emit('corp:vendas', d.vendas);
      appBus.emit('corp:metas', d.metas);
      appBus.emit('corp:fluxo', d.fluxo);
      appBus.emit('corp:precos', d.precos);
    } catch (e) { alert("JSON invalido: " + e.message); }
  }

  var s = {
    outer: { padding: 12, fontFamily: 'monospace', height: '100%', display: 'flex', flexDirection: 'column', gap: 8 },
    textarea: { width: '100%', flex: 1, minHeight: 160, background: '#0B1120', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 8, padding: 10, fontSize: 11, fontFamily: 'monospace', resize: 'vertical', lineHeight: 1.5 },
    btn: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 18px', fontSize: 11, fontWeight: 600, cursor: 'pointer' },
    summary: { color: '#6ee7b7', fontSize: 10 }
  };

  return React.createElement('div', { style: s.outer },
    React.createElement('div', { style: { display: 'flex', gap: 6, alignItems: 'center' } },
      React.createElement('span', { style: { color: '#818cf8', fontWeight: 700, fontSize: 13 } }, 'Dados Corporativos (JSON)'),
      parsed[0] ? React.createElement('span', { style: s.summary }, 'Vendas: ' + parsed[0].vendas.meses.length + 'm · Metas: ' + parsed[0].metas.length + ' · Produtos: ' + parsed[0].precos.length) : null
    ),
    React.createElement('textarea', { value: raw[0], onChange: function (e) { raw[1](e.target.value); }, style: s.textarea }),
    React.createElement('div', { style: { display: 'flex', gap: 6 } },
      React.createElement('button', { onClick: handleParse, style: s.btn }, 'Carregar \u25b6'),
      React.createElement('button', { onClick: function () { raw[1](JSON.stringify({ vendas: { meses: ["Jan/2026","Fev/2026","Mar/2026"], receitas: [120000,135000,142000], custos: [80000,85000,88000], meta: 2000000 }, metas: [{ nome:"Exemplo", atual:500, target:1000, unidade:"R$" }], fluxo: { meses:["Jan","Fev","Mar"], entradas:[150000,160000,172000], saidas:[120000,125000,130000] }, precos: [{ produto:"Exemplo", historico:[100,110,120], atual:120, anterior:110 }] }, null, 2)); }, style: { background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: 6, padding: '5px 14px', fontSize: 10, cursor: 'pointer' } }, 'Exemplo')
    ),
    parsed[0] ? React.createElement('div', { style: { background: '#0f172a', borderRadius: 6, padding: 8, fontSize: 10, color: '#94a3b8', lineHeight: 1.6 } },
      'Vendas: ' + parsed[0].vendas.meses.length + ' meses · Receita ' + parsed[0].vendas.receitas.reduce(function(a,b){return a+b;},0).toLocaleString() + '\nMetas: ' + parsed[0].metas.length + ' indicadores\nFluxo: ' + parsed[0].fluxo.meses.length + ' meses · Saldo ' + (parsed[0].fluxo.entradas.reduce(function(a,b){return a+b;},0) - parsed[0].fluxo.saidas.reduce(function(a,b){return a+b;},0)).toLocaleString() + '\nPrecos: ' + parsed[0].precos.length + ' produtos'
    ) : null
  );
}
