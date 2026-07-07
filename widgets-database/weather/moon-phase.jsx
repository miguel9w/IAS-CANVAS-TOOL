function Widget({ appBus }) {
  const [day, setDay] = React.useState(7.4);

  const phaseNames = [
    { start: 0, end: 0.5, name: 'New Moon' },
    { start: 0.5, end: 6.5, name: 'Waxing Crescent' },
    { start: 6.5, end: 8, name: 'First Quarter' },
    { start: 8, end: 13.5, name: 'Waxing Gibbous' },
    { start: 13.5, end: 15.5, name: 'Full Moon' },
    { start: 15.5, end: 21, name: 'Waning Gibbous' },
    { start: 21, end: 22.5, name: 'Last Quarter' },
    { start: 22.5, end: 29, name: 'Waning Crescent' },
    { start: 29, end: 29.5, name: 'New Moon' },
  ];

  const getPhaseName = (d) => {
    const p = phaseNames.find(p => d >= p.start && d < p.end);
    return p ? p.name : 'New Moon';
  };

  const illumination = 50 * (1 - Math.cos(2 * Math.PI * day / 29.5));

  const renderMoon = () => {
    const progress = day / 29.5;
    const angle = 2 * Math.PI * progress;
    const shadowWidth = Math.abs(Math.sin(angle));
    const isWaxing = Math.sin(angle) >= 0;

    const r = 50;
    const cx = 60;
    const cy = 60;

    return (
      <svg width="120" height="120" style={{ display: 'block', margin: '0 auto' }}>
        <defs>
          <radialGradient id="moonGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fffdea" />
            <stop offset="100%" stopColor="#e8e0c8" />
          </radialGradient>
          <clipPath id="moonClip">
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
        </defs>
        <circle cx={cx} cy={cy} r={r + 2} fill="none" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={r} fill="url(#moonGrad)" />
        <g clipPath="url(#moonClip)">
          {isWaxing ? (
            <rect x={cx} y={0} width={r * shadowWidth + 1} height="120" fill="#121212" />
          ) : (
            <rect x={cx - r * shadowWidth} y={0} width={r * shadowWidth + 1} height="120" fill="#121212" />
          )}
          {Math.abs(illumination - 50) < 3 && (
            <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#444" strokeWidth="0.5" />
          )}
        </g>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
      </svg>
    );
  };

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif', color: '#e2e8f0', textAlign: 'center', background: '#0B1120', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
      <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#bb86fc' }}>
        MOON PHASE
      </div>
      {renderMoon()}
      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#e2e8f0', marginTop: '8px' }}>
        {getPhaseName(day)}
      </div>
      <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
        Day {day.toFixed(1)} of 29.5
      </div>
      <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
        Illumination: {Math.round(illumination)}%
      </div>
      <input type="range" min="0" max="29.5" step="0.1" value={day}
        onChange={e => setDay(parseFloat(e.target.value))}
        style={{ width: '80%', accentColor: '#bb86fc' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#555', width: '80%', margin: '2px auto 0' }}>
        <span>🌑</span><span>🌓</span><span>🌕</span><span>🌗</span><span>🌑</span>
      </div>
    </div>
  );
}
