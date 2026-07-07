function Widget({ appBus }) {
  var [initial, setInitial] = React.useState(1000);
  var [monthly, setMonthly] = React.useState(200);
  var [rate, setRate] = React.useState(8);
  var [years, setYears] = React.useState(10);
  var [freq, setFreq] = React.useState(12);

  var n = freq * years;
  var r = rate / 100 / freq;
  var fv = initial * Math.pow(1 + r, n);
  var fvMonthly = monthly * ((Math.pow(1 + r, n) - 1) / r) * (freq > 0 ? 1 : 0);
  if (!isFinite(fvMonthly)) fvMonthly = 0;
  var total = fv + fvMonthly;
  var contr = initial + monthly * years * 12;
  var earned = total - contr;

  var barData = [
    { label: 'Contributions', value: contr, color: '#4a9eff' },
    { label: 'Interest', value: earned, color: '#34d399' }
  ];
  var maxVal = Math.max(contr, earned, 1);

  return (
    <div style={{
      background: '#0B1120', color: '#e2e8f0', fontFamily: "'Segoe UI',system-ui,sans-serif",
      padding: '20px', borderRadius: '12px', height: '100%', boxSizing: 'border-box',
      overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '16px',
      border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
    }}>
      <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fff' }}>
        Compound Interest
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {[
          { l: 'Initial', v: initial, s: setInitial },
          { l: 'Monthly', v: monthly, s: setMonthly },
        ].map(function(inp, i) {
          return (
            <label key={i} style={{ fontSize: '12px', color: '#888' }}>
              {inp.l}
              <input type="number" value={inp.v}
                onChange={function(e) { inp.s(Number(e.target.value)); }}
                style={{
                  width: '100%', padding: '6px 8px', marginTop: '4px',
                  background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '6px',
                  color: '#e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                }} />
            </label>
          );
        })}
        <label style={{ fontSize: '12px', color: '#888' }}>
          Rate (%)
          <input type="number" value={rate}
            onChange={function(e) { setRate(Number(e.target.value)); }}
            style={{
              width: '100%', padding: '6px 8px', marginTop: '4px',
              background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '6px',
              color: '#e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
            }} />
        </label>
        <label style={{ fontSize: '12px', color: '#888' }}>
          Years
          <input type="number" value={years}
            onChange={function(e) { setYears(Number(e.target.value)); }}
            style={{
              width: '100%', padding: '6px 8px', marginTop: '4px',
              background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '6px',
              color: '#e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
            }} />
        </label>
      </div>
      <div style={{ fontSize: '12px', color: '#888' }}>
        Compound
        <select value={freq}
          onChange={function(e) { setFreq(Number(e.target.value)); }}
          style={{
            width: '100%', padding: '6px 8px', marginTop: '4px',
            background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '6px',
            color: '#e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
          }}>
          <option value={1}>Yearly</option>
          <option value={2}>Semi-annually</option>
          <option value={4}>Quarterly</option>
          <option value={12}>Monthly</option>
          <option value={365}>Daily</option>
        </select>
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px',
        background: '#0f172a', borderRadius: '8px', padding: '12px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#888' }}>Final</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#34d399' }}>
            ${total.toLocaleString('en-US', {minimumFractionDigits:2,maxFractionDigits:2})}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#888' }}>Contributions</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#4a9eff' }}>
            ${contr.toLocaleString('en-US', {minimumFractionDigits:2,maxFractionDigits:2})}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#888' }}>Interest</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#f59e0b' }}>
            ${earned.toLocaleString('en-US', {minimumFractionDigits:2,maxFractionDigits:2})}
          </div>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '100px' }}>
        <div style={{ fontSize: '12px', color: '#888' }}>Breakdown</div>
        {barData.map(function(b) {
          var pct = (b.value / maxVal) * 100;
          return (
            <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '80px', fontSize: '11px', color: '#aaa', flexShrink: 0 }}>{b.label}</div>
              <div style={{
                flex: 1, height: '20px', background: '#0f172a', borderRadius: '4px', overflow: 'hidden'
              }}>
                <div style={{
                  width: pct + '%', height: '100%', background: b.color,
                  borderRadius: '4px', transition: 'width 0.3s'
                }} />
              </div>
              <div style={{ fontSize: '11px', color: '#e2e8f0', minWidth: '60px', textAlign: 'right' }}>
                ${b.value.toLocaleString('en-US', {minimumFractionDigits:0})}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
