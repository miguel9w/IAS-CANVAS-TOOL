function Widget({ appBus }) {
  var [time, setTime] = React.useState(new Date());
  var [is24h, setIs24h] = React.useState(true);

  React.useEffect(function() {
    var interval = setInterval(function() { setTime(new Date()); }, 1000);
    return function() { clearInterval(interval); };
  }, []);

  var h = time.getHours();
  var m = time.getMinutes();
  var s = time.getSeconds();
  var ampm = h >= 12 ? 'PM' : 'AM';
  var dispH = is24h ? h : (h % 12 || 12);
  var pad = function(n) { return n < 10 ? '0' + n : '' + n; };

  var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  var dateStr = days[time.getDay()] + ', ' + months[time.getMonth()] + ' ' + time.getDate() + ', ' + time.getFullYear();

  return (
    <div style={{
      background: '#0B1120', color: '#e2e8f0', fontFamily: "'Segoe UI',system-ui,sans-serif",
      padding: '20px', borderRadius: '12px', height: '100%', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px',
      border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
    }}>
      <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>
        Digital Clock
      </h2>
      <div style={{
        fontSize: '56px', fontWeight: 300, letterSpacing: '4px',
        fontVariantNumeric: 'tabular-nums', color: '#e2e8f0',
        textShadow: '0 0 20px rgba(74,158,255,0.3)'
      }}>
        {pad(dispH)}<span style={{ color: '#4a9eff', opacity: s % 2 === 0 ? 1 : 0.2 }}>:</span>{pad(m)}<span style={{ color: '#4a9eff', opacity: s % 2 === 0 ? 1 : 0.2 }}>:</span>{pad(s)}
        {!is24h && <span style={{ fontSize: '16px', color: '#94a3b8', marginLeft: '8px', letterSpacing: '1px' }}>{ampm}</span>}
      </div>
      <div style={{ fontSize: '13px', color: '#94a3b8' }}>{dateStr}</div>
      <button onClick={function() { setIs24h(!is24h); }}
        style={{
          padding: '6px 16px', background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)',
          borderRadius: '6px', color: '#4a9eff', cursor: 'pointer', fontSize: '12px'
        }}>
        {is24h ? 'Switch to 12h' : 'Switch to 24h'}
      </button>
    </div>
  );
}
