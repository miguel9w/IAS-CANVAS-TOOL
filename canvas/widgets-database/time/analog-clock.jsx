function Widget({ appBus }) {
  var [time, setTime] = React.useState(new Date());

  React.useEffect(function() {
    var interval = setInterval(function() { setTime(new Date()); }, 1000);
    return function() { clearInterval(interval); };
  }, []);

  var h = time.getHours() % 12;
  var m = time.getMinutes();
  var s = time.getSeconds();
  var ms = time.getMilliseconds();

  var secAngle = (s + ms / 1000) * 6 - 90;
  var minAngle = (m + s / 60) * 6 - 90;
  var hrAngle = (h + m / 60) * 30 - 90;

  var numerals = ['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'];
  var cx = 150, cy = 150, r = 130;

  return (
    <div style={{
      background: '#0B1120', color: '#e2e8f0', fontFamily: "'Segoe UI',system-ui,sans-serif",
      padding: '20px', borderRadius: '12px', height: '100%', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
      border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
    }}>
      <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>
        Analog Clock
      </h2>
      <svg width="300" height="300" viewBox="0 0 300 300">
        <circle cx={cx} cy={cy} r={r} fill="#0f172a" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="2" />
        <circle cx={cx} cy={cy} r={6} fill="#e2e8f0" />
        {numerals.map(function(num, i) {
          var angle = i * 30 - 60;
          var rad = angle * Math.PI / 180;
          var x = cx + (r - 18) * Math.cos(rad);
          var y = cy + (r - 18) * Math.sin(rad);
          return (
            <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="central"
              fill="#e2e8f0" fontSize="14" fontWeight="bold" fontFamily="serif">
              {num}
            </text>
          );
        })}
        {[0,1,2,3,4,5,6,7,8,9,10,11].map(function(i) {
          var angle = i * 30 - 60;
          var rad = angle * Math.PI / 180;
          var x1 = cx + (r - 4) * Math.cos(rad);
          var y1 = cy + (r - 4) * Math.sin(rad);
          var x2 = cx + (r - 12) * Math.cos(rad);
          var y2 = cy + (r - 12) * Math.sin(rad);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4a4a6a" strokeWidth="1" />
          );
        })}
        <line x1={cx} y1={cy} x2={cx + 55 * Math.cos(hrAngle * Math.PI / 180)}
          y2={cy + 55 * Math.sin(hrAngle * Math.PI / 180)}
          stroke="#4a9eff" strokeWidth="5" strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={cx + 80 * Math.cos(minAngle * Math.PI / 180)}
          y2={cy + 80 * Math.sin(minAngle * Math.PI / 180)}
          stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={cx + 100 * Math.cos(secAngle * Math.PI / 180)}
          y2={cy + 100 * Math.sin(secAngle * Math.PI / 180)}
          stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={4} fill="#ef4444" />
      </svg>
      <div style={{ fontSize: '13px', color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>
        {time.toLocaleTimeString('en-US', { hour12: false })}
      </div>
    </div>
  );
}
