function Widget({ appBus }) {
  const [circleR, setCircleR] = React.useState(30);
  const [rectW, setRectW] = React.useState(60);
  const [rectH, setRectH] = React.useState(40);
  const [strokeW, setStrokeW] = React.useState(2);
  const [rotation, setRotation] = React.useState(0);
  const [opacity, setOpacity] = React.useState(0.8);
  const [colorIdx, setColorIdx] = React.useState(0);

  const colors = ['#bb86fc', '#4caf50', '#2196f3', '#ff9800', '#f44336', '#00bcd4'];
  const color = colors[colorIdx % colors.length];

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif', color: '#e2e8f0', background: '#0B1120', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
      <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#bb86fc' }}>
        SVG PLAYGROUND
      </div>
      <div style={{
        background: '#0B1120', borderRadius: '8px', padding: '12px',
        marginBottom: '12px', border: '1px solid rgba(148, 163, 184, 0.08)',
      }}>
        <svg width="100%" height="180" viewBox="0 0 300 180" style={{ display: 'block' }}>
          <rect x="10" y="10" width="280" height="160" rx="8"
            fill="none" stroke="#222" strokeWidth="1" />
          <g transform={`rotate(${rotation}, 150, 90)`}>
            <circle cx="80" cy="90" r={circleR}
              fill={`${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`}
              stroke={color} strokeWidth={strokeW} />
            <rect x={180 - rectW / 2} y={90 - rectH / 2} width={rectW} height={rectH} rx="4"
              fill={`${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`}
              stroke={color} strokeWidth={strokeW} />
            <path d={`M 150 50 Q ${180 + (colorIdx * 10)} ${40 + (strokeW * 5)} 210 90 Q ${180 + (colorIdx * 10)} ${140 - (strokeW * 5)} 150 130`}
              fill="none" stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
          </g>
        </svg>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        {[
          { label: 'Circle R', val: circleR, set: setCircleR, min: 5, max: 60 },
          { label: 'Rect W', val: rectW, set: setRectW, min: 10, max: 120 },
          { label: 'Rect H', val: rectH, set: setRectH, min: 10, max: 80 },
          { label: 'Stroke', val: strokeW, set: setStrokeW, min: 0.5, max: 10, step: 0.5 },
          { label: 'Rotate', val: rotation, set: setRotation, min: 0, max: 360 },
          { label: 'Opacity', val: opacity, set: setOpacity, min: 0.1, max: 1, step: 0.1 },
        ].map(s => (
          <div key={s.label} style={{ marginBottom: '4px' }}>
            <div style={{ fontSize: '10px', color: '#888', marginBottom: '1px' }}>
              {s.label}: {s.val}
            </div>
            <input type="range" min={s.min} max={s.max} step={s.step || 1}
              value={s.val} onChange={e => s.set(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#bb86fc' }} />
          </div>
        ))}
      </div>
      <button onClick={() => setColorIdx(i => i + 1)} style={{
        width: '100%', marginTop: '6px', padding: '6px',
        background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)',
        borderRadius: '4px', color: '#e2e8f0', fontSize: '11px',
        cursor: 'pointer',
      }}>Cycle Color ({color})</button>
    </div>
  );
}
