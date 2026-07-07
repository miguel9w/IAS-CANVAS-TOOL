function Widget({ appBus }) {
  const [circleR, setCircleR] = React.useState(30);
  const [rectW, setRectW] = React.useState(50);
  const [rectH, setRectH] = React.useState(30);
  const [pathQ, setPathQ] = React.useState(30);

  return (
    <div style={{ background: '#0B1120', color: '#e2e8f0', fontFamily: 'monospace', height: '100%', padding: '16px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>SVG Drawing</h2>
      <svg viewBox="0 0 200 140" style={{ width: '100%', height: '140px', background: '#131c31', borderRadius: '8px', border: '1px solid #1e2d4a', marginBottom: '12px' }}>
        <circle cx="50" cy="70" r={circleR} fill="#3b82f6" opacity="0.6" stroke="#60a5fa" strokeWidth="2" />
        <rect x={120 - rectW / 2} y={70 - rectH / 2} width={rectW} height={rectH} rx="4" fill="#8b5cf6" opacity="0.6" stroke="#a78bfa" strokeWidth="2" />
        <path d={'M 170 110 Q ' + (170 - pathQ) + ' ' + (70 + pathQ) + ' 170 30'} fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
        <circle cx="170" cy="30" r="3" fill="#22c55e" />
        <circle cx="170" cy="110" r="3" fill="#22c55e" />
        <circle cx={170 - pathQ} cy="70" r="3" fill="#22c55e" opacity="0.5" />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '2px' }}><span>Circle Radius: {circleR}</span><span style={{ color: '#3b82f6' }}>circle</span></div>
          <input type="range" min="5" max="60" value={circleR} onChange={e => setCircleR(Number(e.target.value))} style={{ width: '100%', accentColor: '#3b82f6' }} />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '2px' }}><span>Rect Width: {rectW}</span><span style={{ color: '#8b5cf6' }}>rect</span></div>
          <input type="range" min="10" max="100" value={rectW} onChange={e => setRectW(Number(e.target.value))} style={{ width: '100%', accentColor: '#8b5cf6' }} />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '2px' }}><span>Rect Height: {rectH}</span><span style={{ color: '#8b5cf6' }}>rect</span></div>
          <input type="range" min="10" max="100" value={rectH} onChange={e => setRectH(Number(e.target.value))} style={{ width: '100%', accentColor: '#8b5cf6' }} />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '2px' }}><span>Path Curve: {pathQ}</span><span style={{ color: '#22c55e' }}>path (quadratic)</span></div>
          <input type="range" min="0" max="80" value={pathQ} onChange={e => setPathQ(Number(e.target.value))} style={{ width: '100%', accentColor: '#22c55e' }} />
        </div>
      </div>
    </div>
  );
}
