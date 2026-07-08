function Widget({ appBus }) {
  var [target, setTarget] = React.useState(function() {
    var d = new Date();
    d.setHours(d.getHours() + 1);
    return d.toISOString().slice(0, 16);
  });
  var [label, setLabel] = React.useState('1 Hour');
  var [now, setNow] = React.useState(Date.now());

  React.useEffect(function() {
    var interval = setInterval(function() { setNow(Date.now()); }, 200);
    return function() { clearInterval(interval); };
  }, []);

  var targetMs = new Date(target).getTime();
  var diff = Math.max(0, targetMs - now);
  var totalSec = Math.floor(diff / 1000);
  var days = Math.floor(totalSec / 86400);
  var hours = Math.floor((totalSec % 86400) / 3600);
  var mins = Math.floor((totalSec % 3600) / 60);
  var secs = totalSec % 60;

  var presets = [
    { l: '1 min', t: function() { var d = new Date(); d.setMinutes(d.getMinutes() + 1); return d.toISOString().slice(0, 16); }, lb: '1 Minute' },
    { l: '5 min', t: function() { var d = new Date(); d.setMinutes(d.getMinutes() + 5); return d.toISOString().slice(0, 16); }, lb: '5 Minutes' },
    { l: '1 hr', t: function() { var d = new Date(); d.setHours(d.getHours() + 1); return d.toISOString().slice(0, 16); }, lb: '1 Hour' },
    { l: '24 hr', t: function() { var d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 16); }, lb: '24 Hours' },
  ];

  var totalMs = targetMs - (targetMs - 86400000);
  var maxDuration = 86400000;
  var pct = Math.min(100, (1 - diff / maxDuration) * 100);

  return (
    <div style={{
      background: '#0B1120', color: '#e2e8f0', fontFamily: "'Segoe UI',system-ui,sans-serif",
      padding: '20px', borderRadius: '12px', height: '100%', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px',
      border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
    }}>
      <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fff' }}>
        Countdown
      </h2>
      {diff <= 0 ? (
        <div style={{
          fontSize: '32px', fontWeight: 700, color: '#34d399',
          animation: 'none'
        }}>
          TIME'S UP!
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            {[
              { v: days, l: 'Days' },
              { v: hours, l: 'Hours' },
              { v: mins, l: 'Min' },
              { v: secs, l: 'Sec' }
            ].map(function(unit, i) {
              return (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '36px', fontWeight: 700, color: '#e2e8f0',
                    fontVariantNumeric: 'tabular-nums',
                    background: '#0f172a', borderRadius: '8px',
                    padding: '8px 12px', minWidth: '50px'
                  }}>
                    {unit.v < 10 ? '0' + unit.v : unit.v}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{unit.l}</div>
                </div>
              );
            })}
          </div>
          <div style={{ width: '100%', height: '8px', background: '#0f172a', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: pct + '%', height: '100%', background: '#4a9eff',
              borderRadius: '4px', transition: 'width 0.3s'
            }} />
          </div>
        </>
      )}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {presets.map(function(p) {
          return (
            <button key={p.l} onClick={function() {
              setTarget(p.t());
              setLabel(p.lb);
            }}
              style={{
                padding: '5px 12px', background: label === p.lb ? '#22d3ee' : '#0f172a',
                border: '1px solid ' + (label === p.lb ? '#4a9eff' : 'rgba(148, 163, 184, 0.08)'),
                borderRadius: '6px', color: label === p.lb ? '#0B1120' : '#94a3b8',
                cursor: 'pointer', fontSize: '12px'
              }}>
              {p.l}
            </button>
          );
        })}
      </div>
      <label style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
        Custom target
        <input type="datetime-local" value={target}
          onChange={function(e) { setTarget(e.target.value); setLabel('Custom'); }}
          style={{
            display: 'block', marginTop: '4px', padding: '6px 8px',
            background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '6px',
            color: '#e2e8f0', fontSize: '12px', outline: 'none', boxSizing: 'border-box'
          }} />
      </label>
    </div>
  );
}
