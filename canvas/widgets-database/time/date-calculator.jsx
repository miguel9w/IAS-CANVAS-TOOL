function Widget({ appBus }) {
  var [mode, setMode] = React.useState('duration');
  var [startDate, setStartDate] = React.useState(function() {
    var d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  var [endDate, setEndDate] = React.useState(new Date().toISOString().slice(0, 10));
  var [addDays, setAddDays] = React.useState(30);
  var [addResult, setAddResult] = React.useState('');

  React.useEffect(function() {
    if (mode === 'duration' && startDate && endDate) {
    } else if (mode === 'add' && startDate) {
      var d = new Date(startDate);
      d.setDate(d.getDate() + Number(addDays));
      setAddResult(d.toDateString());
    }
  }, [mode, startDate, endDate, addDays]);

  var diffMs = new Date(endDate) - new Date(startDate);
  var diffDays = Math.floor(diffMs / 86400000);
  var diffWeeks = Math.floor(diffDays / 7);
  var diffMonths = Math.floor(diffDays / 30.44);
  var diffYears = Math.floor(diffDays / 365.25);
  var isNeg = diffDays < 0;

  return (
    <div style={{
      background: '#0B1120', color: '#e2e8f0', fontFamily: "'Segoe UI',system-ui,sans-serif",
      padding: '20px', borderRadius: '12px', height: '100%', boxSizing: 'border-box',
      overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '16px',
      border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
    }}>
      <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fff' }}>
        Date Calculator
      </h2>
      <div style={{ display: 'flex', gap: '4px' }}>
        {['duration', 'add'].map(function(m) {
          return (
            <button key={m} onClick={function() { setMode(m); }}
              style={{
                flex: 1, padding: '6px 12px', background: mode === m ? '#22d3ee' : '#0f172a',
                border: '1px solid ' + (mode === m ? '#4a9eff' : 'rgba(148, 163, 184, 0.08)'),
                borderRadius: '6px', color: mode === m ? '#0B1120' : '#94a3b8',
                cursor: 'pointer', fontSize: '12px', textTransform: 'capitalize'
              }}>
              {m === 'duration' ? 'Duration' : 'Add Days'}
            </button>
          );
        })}
      </div>

      {mode === 'duration' ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8' }}>
              Start
              <input type="date" value={startDate}
                onChange={function(e) { setStartDate(e.target.value); }}
                style={{
                  width: '100%', padding: '8px', marginTop: '4px',
                  background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '6px',
                  color: '#e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                }} />
            </label>
            <label style={{ fontSize: '12px', color: '#94a3b8' }}>
              End
              <input type="date" value={endDate}
                onChange={function(e) { setEndDate(e.target.value); }}
                style={{
                  width: '100%', padding: '8px', marginTop: '4px',
                  background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '6px',
                  color: '#e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                }} />
            </label>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px',
            background: '#0f172a', borderRadius: '8px', padding: '12px'
          }}>
            {[
              { l: 'Days', v: Math.abs(diffDays) },
              { l: 'Weeks', v: Math.abs(diffWeeks) },
              { l: 'Months (approx)', v: Math.abs(diffMonths) },
              { l: 'Years (approx)', v: Math.abs(diffYears) },
            ].map(function(item) {
              return (
                <div key={item.l} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#e2e8f0' }}>
                    {item.v}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{item.l}</div>
                </div>
              );
            })}
          </div>
          {isNeg && (
            <div style={{ fontSize: '11px', color: '#f59e0b', textAlign: 'center' }}>
              End date is before start date
            </div>
          )}
        </>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8' }}>
              Start Date
              <input type="date" value={startDate}
                onChange={function(e) { setStartDate(e.target.value); }}
                style={{
                  width: '100%', padding: '8px', marginTop: '4px',
                  background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '6px',
                  color: '#e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                }} />
            </label>
            <label style={{ fontSize: '12px', color: '#94a3b8' }}>
              Days to Add
              <input type="number" value={addDays}
                onChange={function(e) { setAddDays(Number(e.target.value)); }}
                style={{
                  width: '100%', padding: '8px', marginTop: '4px',
                  background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '6px',
                  color: '#e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                }} />
            </label>
          </div>
          <div style={{
            background: '#0f172a', borderRadius: '8px', padding: '16px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              {new Date(startDate).toDateString()} + {addDays} days =
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#34d399', marginTop: '4px' }}>
              {addResult}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
