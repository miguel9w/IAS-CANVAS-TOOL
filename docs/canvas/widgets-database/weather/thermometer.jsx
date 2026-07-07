function Widget({ appBus }) {
  const [temp, setTemp] = React.useState(22);
  const [unit, setUnit] = React.useState('C');

  const displayTemp = unit === 'C' ? temp : Math.round(temp * 9 / 5 + 32);
  const displayUnit = unit === 'C' ? '°C' : '°F';

  const pct = ((temp + 20) / 70) * 100;
  const clampedPct = Math.max(2, Math.min(98, pct));

  const getColor = () => {
    if (temp <= 0) return '#2196f3';
    if (temp <= 15) return '#4caf50';
    if (temp <= 25) return '#ff9800';
    if (temp <= 35) return '#ff5722';
    return '#f44336';
  };

  const getIcon = () => {
    if (temp <= -5) return '❄️';
    if (temp <= 5) return '🌨️';
    if (temp <= 15) return '🌬️';
    if (temp <= 22) return '🌤️';
    if (temp <= 30) return '☀️';
    if (temp <= 40) return '🔥';
    return '🥵';
  };

  const toggleUnit = () => setUnit(u => u === 'C' ? 'F' : 'C');

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif', color: '#e2e8f0', textAlign: 'center', background: '#0B1120', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
      <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#bb86fc' }}>
        THERMOMETER
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', alignItems: 'flex-end', marginBottom: '8px' }}>
        <div style={{ position: 'relative', width: '32px', height: '160px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(148, 163, 184, 0.08)', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: `${clampedPct}%`,
            background: `linear-gradient(to top, ${getColor()}, ${getColor()}88)`,
            transition: 'height 0.3s, background 0.3s',
            borderRadius: '0 0 16px 16px',
          }}>
            <div style={{
              position: 'absolute', top: '-4px', left: '-4px', right: '-4px', height: '10px',
              background: getColor(), borderRadius: '5px',
              boxShadow: `0 0 10px ${getColor()}`,
            }} />
          </div>
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '40px', fontWeight: 'bold', lineHeight: 1 }}>
            {displayTemp}{displayUnit}
          </div>
          <div style={{ fontSize: '28px', marginTop: '4px' }}>{getIcon()}</div>
        </div>
      </div>
      <div style={{ marginBottom: '8px' }}>
        <div style={{ color: '#888', fontSize: '11px', marginBottom: '2px' }}>
          -20°C {'—'} 50°C
        </div>
        <input type="range" min="-20" max="50" value={temp}
          onChange={e => setTemp(parseInt(e.target.value))}
          style={{ width: '80%', accentColor: getColor() }} />
      </div>
      <button onClick={toggleUnit} style={{
        padding: '6px 16px', background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)',
        borderRadius: '4px', color: '#e2e8f0', cursor: 'pointer', fontSize: '12px',
      }}>Switch to °{unit === 'C' ? 'F' : 'C'}</button>
    </div>
  );
}
