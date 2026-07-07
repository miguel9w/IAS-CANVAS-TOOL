function Widget({ appBus }) {
  const [n, setN] = React.useState(5);
  const size = 24;

  const cells = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const idx = r * n + c;
      const ring = Math.min(r, c, n - 1 - r, n - 1 - c);
      const hue = (ring * 30 + 190) % 360;
      cells.push(
        <div key={idx} style={{
          width: size, height: size,
          background: `hsl(${hue}, 70%, ${50 + ring * 5}%)`,
          borderRadius: '3px',
          transition: 'all 0.2s',
          boxShadow: '0 0 2px rgba(0,0,0,0.3)'
        }} />
      );
    }
  }

  const oddSum = [];
  for (let i = 1; i <= n; i++) oddSum.push(2 * i - 1);

  const s = {
    wrap: {
      background: '#0B1120', color: '#e2e8f0', fontFamily: 'system-ui,sans-serif',
      padding: '16px', height: '100%', display: 'flex', flexDirection: 'column',
      borderRadius: '8px', border: '1px solid rgba(34, 211, 238, 0.15)',
      boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
    },
    h: { fontSize: '18px', fontWeight: 700, margin: '0 0 8px', color: '#22d3ee' },
    row: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
    grid: {
      display: 'grid',
      gridTemplateColumns: `repeat(${n}, ${size}px)`,
      gridTemplateRows: `repeat(${n}, ${size}px)`,
      gap: '2px',
      justifyContent: 'center',
      marginBottom: '12px'
    },
    info: { fontSize: '13px', lineHeight: 1.6, textAlign: 'center', padding: '8px', background: '#0f172a', borderRadius: '6px' },
    accent: { color: '#22d3ee', fontWeight: 700 },
    slider: { flex: 1, accentColor: '#22d3ee', cursor: 'pointer' },
    label: { fontSize: '12px', color: '#94a3b8', minWidth: '50px' },
    val: { fontSize: '24px', fontWeight: 700, color: '#22d3ee', minWidth: '40px', textAlign: 'right' },
    mathRow: { display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' },
    odd: { background: 'rgba(34, 211, 238, 0.1)', padding: '2px 6px', borderRadius: '4px', color: '#22d3ee', fontWeight: 700 }
  };

  return (
    <div style={s.wrap}>
      <div style={s.h}>n² · Números Quadrados</div>
      <div style={s.row}>
        <span style={s.label}>n =</span>
        <input type="range" min="1" max="12" value={n} style={s.slider}
          onChange={e => setN(Number(e.target.value))} />
        <span style={s.val}>{n}² = {n * n}</span>
      </div>
      <div style={s.grid}>
        {cells}
      </div>
      <div style={s.info}>
        <div style={s.mathRow}>
          {oddSum.map((v, i) => (
            <span key={i} style={s.odd}>{v}</span>
          ))}
          <span style={{ color: '#e2e8f0' }}>= <strong style={{ color: '#22d3ee' }}>{n * n}</strong></span>
        </div>
        <div>
          {n}² = {oddSum.join(' + ')} = <span style={s.accent}>{n * n}</span>
        </div>
        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
          A soma dos {n} primeiros números ímpares é igual a {n}²
        </div>
      </div>
    </div>
  );
}