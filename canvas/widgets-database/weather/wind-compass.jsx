function Widget({ appBus }) {
  const [direction, setDirection] = React.useState(180);
  const [speed, setSpeed] = React.useState(15);

  const cardinals = [
    { deg: 0, label: 'N' }, { deg: 45, label: 'NE' }, { deg: 90, label: 'E' },
    { deg: 135, label: 'SE' }, { deg: 180, label: 'S' }, { deg: 225, label: 'SW' },
    { deg: 270, label: 'W' }, { deg: 315, label: 'NW' },
  ];

  const getCardinal = (deg) => {
    const idx = Math.round(deg / 45) % 8;
    return cardinals[idx].label;
  };

  const getBeaufort = (knots) => {
    if (knots < 1) return { force: 0, desc: 'Calm' };
    if (knots < 4) return { force: 1, desc: 'Light air' };
    if (knots < 7) return { force: 2, desc: 'Light breeze' };
    if (knots < 11) return { force: 3, desc: 'Gentle breeze' };
    if (knots < 17) return { force: 4, desc: 'Moderate breeze' };
    if (knots < 22) return { force: 5, desc: 'Fresh breeze' };
    if (knots < 28) return { force: 6, desc: 'Strong breeze' };
    if (knots < 34) return { force: 7, desc: 'Near gale' };
    if (knots < 41) return { force: 8, desc: 'Gale' };
    if (knots < 48) return { force: 9, desc: 'Strong gale' };
    if (knots < 56) return { force: 10, desc: 'Storm' };
    return { force: 11, desc: 'Violent storm' };
  };

  const beaufort = getBeaufort(speed);
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 12;

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif', color: '#e2e8f0', textAlign: 'center', background: '#0B1120', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
      <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#bb86fc' }}>
        WIND COMPASS
      </div>
      <svg width={size} height={size} style={{ display: 'block', margin: '0 auto 8px' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1" />
        {cardinals.map(c => {
          const angle = (c.deg - 90) * Math.PI / 180;
          const x1 = cx + (r - 14) * Math.cos(angle);
          const y1 = cy + (r - 14) * Math.sin(angle);
          const x2 = cx + r * Math.cos(angle);
          const y2 = cy + r * Math.sin(angle);
          return (
            <g key={c.deg}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1" />
              <text x={cx + (r + 10) * Math.cos(angle)} y={cy + (r + 10) * Math.sin(angle)}
                textAnchor="middle" dominantBaseline="central"
                fill={direction === c.deg ? '#bb86fc' : '#888'} fontSize="10"
                fontWeight={direction === c.deg ? 'bold' : 'normal'}>
                {c.label}
              </text>
            </g>
          );
        })}
        <line x1={cx} y1={cy} x2={cx} y2={cy - r + 16}
          stroke="#888" strokeWidth="1" strokeDasharray="3,2" />
        <g transform={`rotate(${direction}, ${cx}, ${cy})`}>
          <polygon points={`${cx},${cy - r + 4} ${cx - 8},${cy + 8} ${cx + 8},${cy + 8}`}
            fill="#f44336" />
          <polygon points={`${cx},${cy + r - 4} ${cx - 8},${cy - 8} ${cx + 8},${cy - 8}`}
            fill="#888" />
          <circle cx={cx} cy={cy} r="4" fill="#121212" />
        </g>
        <circle cx={cx} cy={cy} r="3" fill="#bb86fc" />
      </svg>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e2e8f0' }}>
        {direction}° {getCardinal(direction)}
      </div>
      <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>
        {speed} kn · F{beaufort.force} {beaufort.desc}
      </div>
      <div style={{ marginBottom: '4px' }}>
        <div style={{ color: '#888', fontSize: '10px', marginBottom: '2px' }}>Direction</div>
        <input type="range" min="0" max="360" value={direction}
          onChange={e => setDirection(parseInt(e.target.value))}
          style={{ width: '80%', accentColor: '#bb86fc' }} />
      </div>
      <div>
        <div style={{ color: '#888', fontSize: '10px', marginBottom: '2px' }}>Speed (knots)</div>
        <input type="range" min="0" max="60" value={speed}
          onChange={e => setSpeed(parseInt(e.target.value))}
          style={{ width: '80%', accentColor: '#bb86fc' }} />
      </div>
    </div>
  );
}
