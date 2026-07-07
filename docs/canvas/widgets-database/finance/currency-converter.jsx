function Widget({ appBus }) {
  var rates = {
    USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, CNY: 7.24, INR: 83.1,
    CAD: 1.36, AUD: 1.53, CHF: 0.88, SEK: 10.45, NOK: 10.7, NZD: 1.65,
    KRW: 1325, SGD: 1.34, HKD: 7.82, TRY: 32.1, MXN: 17.2, BRL: 5.05,
    ARS: 870, ZAR: 18.8
  };
  var currencies = Object.keys(rates);

  var [amount, setAmount] = React.useState(100);
  var [from, setFrom] = React.useState('USD');
  var [to, setTo] = React.useState('BRL');

  var convert = function(val, f, t) {
    var inUSD = val / rates[f];
    return inUSD * rates[t];
  };

  var result = convert(amount, from, to);

  var flip = function() {
    var tmp = from;
    setFrom(to);
    setTo(tmp);
  };

  var popularPairs = [
    ['USD', 'BRL'], ['USD', 'EUR'], ['USD', 'GBP'],
    ['EUR', 'USD'], ['BRL', 'USD'], ['USD', 'JPY']
  ];

  return (
    <div style={{
      background: '#0B1120', color: '#e2e8f0', fontFamily: "'Segoe UI',system-ui,sans-serif",
      padding: '20px', borderRadius: '12px', height: '100%', boxSizing: 'border-box',
      overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '16px',
      border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
    }}>
      <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fff' }}>
        Currency Converter
      </h2>
      <div>
        <label style={{ fontSize: '12px', color: '#94a3b8' }}>
          Amount
          <input type="number" value={amount}
            onChange={function(e) { setAmount(Math.max(0, Number(e.target.value))); }}
            style={{
              width: '100%', padding: '8px 10px', marginTop: '4px',
              background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '6px',
              color: '#e2e8f0', fontSize: '16px', outline: 'none', boxSizing: 'border-box'
            }} />
        </label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '12px', color: '#94a3b8' }}>From</label>
          <select value={from}
            onChange={function(e) { setFrom(e.target.value); }}
            style={{
              width: '100%', padding: '8px 10px', marginTop: '4px',
              background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '6px',
              color: '#e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
            }}>
            {currencies.map(function(c) { return <option key={c} value={c}>{c}</option>; })}
          </select>
        </div>
        <button onClick={flip}
          style={{
            marginTop: '16px', padding: '8px 10px', background: '#22d3ee',
            border: 'none', borderRadius: '6px', color: '#0B1120', cursor: 'pointer',
            fontSize: '16px', lineHeight: 1
          }}>
          ⇄
        </button>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '12px', color: '#94a3b8' }}>To</label>
          <select value={to}
            onChange={function(e) { setTo(e.target.value); }}
            style={{
              width: '100%', padding: '8px 10px', marginTop: '4px',
              background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '6px',
              color: '#e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
            }}>
            {currencies.map(function(c) { return <option key={c} value={c}>{c}</option>; })}
          </select>
        </div>
      </div>
      <div style={{
        background: '#0f172a', borderRadius: '8px', padding: '16px', textAlign: 'center'
      }}>
        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
          {amount} {from} =
        </div>
        <div style={{ fontSize: '24px', fontWeight: 700, color: '#34d399' }}>
          {result.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})} {to}
        </div>
        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
          1 {from} = {convert(1, from, to).toFixed(4)} {to}
        </div>
      </div>
      <div>
        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Quick Pairs</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {popularPairs.map(function(pair) {
            var [pf, pt] = pair;
            var v = convert(1, pf, pt);
            return (
              <button key={pf+pt}
                onClick={function() { setFrom(pf); setTo(pt); setAmount(100); }}
                style={{
                  padding: '4px 8px', background: from === pf && to === pt ? '#22d3ee' : '#0f172a',
                  border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '4px', color: from === pf && to === pt ? '#0B1120' : '#94a3b8',
                  fontSize: '11px', cursor: 'pointer'
                }}>
                {pf}/{pt}: {v.toFixed(2)}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ fontSize: '10px', color: '#555', textAlign: 'center' }}>
        Rates may not reflect market — for demo only
      </div>
    </div>
  );
}
