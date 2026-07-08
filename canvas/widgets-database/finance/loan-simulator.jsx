function Widget({ appBus }) {
  var [amount, setAmount] = React.useState(30000);
  var [apr, setApr] = React.useState(6.5);
  var [term, setTerm] = React.useState(60);

  var monthlyRate = apr / 100 / 12;
  var monthlyPmt = amount * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
  if (!isFinite(monthlyPmt)) monthlyPmt = 0;
  var totalPaid = monthlyPmt * term;
  var totalInterest = totalPaid - amount;
  var principalPct = (amount / totalPaid) * 100;
  var interestPct = (totalInterest / totalPaid) * 100;

  var schedule = [];
  var bal = amount;
  for (var m = 1; m <= term; m++) {
    var ip = bal * monthlyRate;
    var pp = monthlyPmt - ip;
    bal -= pp;
    if (bal < 0) bal = 0;
    schedule.push({ m: m, pmt: monthlyPmt, principal: pp, interest: ip, balance: bal });
  }

  return (
    <div style={{
      background: '#0B1120', color: '#e2e8f0', fontFamily: "'Segoe UI',system-ui,sans-serif",
      padding: '20px', borderRadius: '12px', height: '100%', boxSizing: 'border-box',
      overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '16px',
      border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
    }}>
      <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fff' }}>
        Loan Simulator
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
        {[
          { l: 'Amount', v: amount, s: setAmount },
          { l: 'APR %', v: apr, s: setApr },
          { l: 'Term (mo)', v: term, s: setTerm },
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
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px',
        background: '#0f172a', borderRadius: '8px', padding: '12px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#888' }}>Monthly</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#f59e0b' }}>
            ${monthlyPmt.toFixed(2)}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#888' }}>Total Interest</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#ef4444' }}>
            ${totalInterest.toFixed(2)}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#888' }}>Total Paid</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0' }}>
            ${totalPaid.toFixed(2)}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '4px', height: '80px', alignItems: 'flex-end', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '120px' }}>
          <div style={{ fontSize: '10px', color: '#4a9eff' }}>{principalPct.toFixed(0)}%</div>
          <div style={{
            width: '60px', height: Math.max(principalPct * 0.8, 4) + 'px',
            background: '#4a9eff', borderRadius: '4px 4px 0 0', transition: 'height 0.3s'
          }} />
          <div style={{ fontSize: '10px', color: '#888' }}>Principal</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '120px' }}>
          <div style={{ fontSize: '10px', color: '#ef4444' }}>{interestPct.toFixed(0)}%</div>
          <div style={{
            width: '60px', height: Math.max(interestPct * 0.8, 4) + 'px',
            background: '#ef4444', borderRadius: '4px 4px 0 0', transition: 'height 0.3s'
          }} />
          <div style={{ fontSize: '10px', color: '#888' }}>Interest</div>
        </div>
      </div>
      <div style={{ fontSize: '12px', color: '#888' }}>Amortization Table</div>
      <div style={{ overflow: 'auto', maxHeight: '200px', fontSize: '11px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: '#888', position: 'sticky', top: 0, background: '#0B1120' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left' }}>#</th>
              <th style={{ padding: '4px 6px', textAlign: 'right' }}>Payment</th>
              <th style={{ padding: '4px 6px', textAlign: 'right' }}>Principal</th>
              <th style={{ padding: '4px 6px', textAlign: 'right' }}>Interest</th>
              <th style={{ padding: '4px 6px', textAlign: 'right' }}>Balance</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map(function(r) {
              return (
                <tr key={r.m} style={{ borderTop: '1px solid rgba(148, 163, 184, 0.08)' }}>
                  <td style={{ padding: '4px 6px', color: '#666' }}>{r.m}</td>
                  <td style={{ padding: '4px 6px', textAlign: 'right' }}>${r.pmt.toFixed(2)}</td>
                  <td style={{ padding: '4px 6px', textAlign: 'right', color: '#4a9eff' }}>${r.principal.toFixed(2)}</td>
                  <td style={{ padding: '4px 6px', textAlign: 'right', color: '#ef4444' }}>${r.interest.toFixed(2)}</td>
                  <td style={{ padding: '4px 6px', textAlign: 'right' }}>${r.balance.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
