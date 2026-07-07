function Widget({ appBus }) {
  const [r, setR] = React.useState(100);
  const [g, setG] = React.useState(180);
  const [b, setB] = React.useState(255);
  const [h, setH] = React.useState(210);
  const [s, setS] = React.useState(100);
  const [l, setL] = React.useState(70);
  const [hex, setHex] = React.useState('#64b4ff');
  const [copied, setCopied] = React.useState('');

  function rgbToHsl(r2, g2, b2) {
    const rn = r2 / 255, gn = g2 / 255, bn = b2 / 255;
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
    let h2 = 0, s2 = 0, l2 = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s2 = l2 > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === rn) h2 = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
      else if (max === gn) h2 = ((bn - rn) / d + 2) * 60;
      else h2 = ((rn - gn) / d + 4) * 60;
    }
    return { h: Math.round(h2), s: Math.round(s2 * 100), l: Math.round(l2 * 100) };
  }

  function hslToRgb(h2, s2, l2) {
    s2 /= 100; l2 /= 100;
    const c = (1 - Math.abs(2 * l2 - 1)) * s2;
    const x = c * (1 - Math.abs((h2 / 60) % 2 - 1));
    const m = l2 - c / 2;
    let rn = 0, gn = 0, bn = 0;
    if (h2 < 60) { rn = c; gn = x; }
    else if (h2 < 120) { rn = x; gn = c; }
    else if (h2 < 180) { gn = c; bn = x; }
    else if (h2 < 240) { gn = x; bn = c; }
    else if (h2 < 300) { rn = x; bn = c; }
    else { rn = c; bn = x; }
    return {
      r: Math.round((rn + m) * 255),
      g: Math.round((gn + m) * 255),
      b: Math.round((bn + m) * 255)
    };
  }

  function fromRgb(r2, g2, b2) {
    setR(r2); setG(g2); setB(b2);
    const hsl = rgbToHsl(r2, g2, b2);
    setH(hsl.h); setS(hsl.s); setL(hsl.l);
    setHex('#' + [r2, g2, b2].map(v => String(v).padStart(3, '0')).map(v => {
      const hx = Number(v).toString(16);
      return hx.length === 1 ? '0' + hx : hx;
    }).join(''));
  }

  function fromHsl(h2, s2, l2) {
    setH(h2); setS(s2); setL(l2);
    const rgb = hslToRgb(h2, s2, l2);
    fromRgb(rgb.r, rgb.g, rgb.b);
  }

  function fromHex(hx) {
    setHex(hx);
    const match = hx.match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    if (match) {
      fromRgb(parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16));
    }
  }

  function copy(type) {
    const val = type === 'hex' ? hex : `rgb(${r}, ${g}, ${b})`;
    navigator.clipboard.writeText(val).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(''), 1500);
    });
  }

  const color = `rgb(${r}, ${g}, ${b})`;
  const containerStyle = {
    background: '#0B1120', padding: '16px', borderRadius: '8px',
    fontFamily: 'monospace', color: '#e2e8f0', height: '100%', boxSizing: 'border-box',
    border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
  };
  const sliderRow = (label, val, setter, min, max) => (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
        <span style={{ color: '#94a3b8' }}>{label}</span>
        <span>{val}</span>
      </div>
      <input type="range" min={min} max={max} value={val}
        onChange={e => setter(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#22d3ee' }} />
    </div>
  );

  return (
    <div style={containerStyle}>
      <div style={{
        height: '60px', borderRadius: '8px', marginBottom: '12px',
        background: color, border: '1px solid #334155'
      }} />
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <div style={{ flex: 1, fontSize: '12px' }}>
          <span style={{ color: '#64748b' }}>Hex: </span>
          <input value={hex} onChange={e => fromHex(e.target.value)}
            style={{ background: '#1e293b', color: '#22d3ee', border: '1px solid #334155', borderRadius: '3px', padding: '2px 6px', fontFamily: 'monospace', fontSize: '12px', width: '80px', outline: 'none' }} />
          <button onClick={() => copy('hex')} style={{ marginLeft: '4px', background: 'transparent', border: 'none', color: copied === 'hex' ? '#10b981' : '#64748b', cursor: 'pointer', fontSize: '12px' }}>
            {copied === 'hex' ? '✓' : '📋'}
          </button>
        </div>
        <div style={{ flex: 1, fontSize: '12px' }}>
          <span style={{ color: '#64748b' }}>RGB: </span>
          <span style={{ color: '#e2e8f0' }}>{r}, {g}, {b}</span>
          <button onClick={() => copy('rgb')} style={{ marginLeft: '4px', background: 'transparent', border: 'none', color: copied === 'rgb' ? '#10b981' : '#64748b', cursor: 'pointer', fontSize: '12px' }}>
            {copied === 'rgb' ? '✓' : '📋'}
          </button>
        </div>
      </div>
      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>RGB</div>
      {sliderRow('R', r, v => fromRgb(v, g, b), 0, 255)}
      {sliderRow('G', g, v => fromRgb(r, v, b), 0, 255)}
      {sliderRow('B', b, v => fromRgb(r, g, v), 0, 255)}
      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', marginTop: '8px' }}>HSL</div>
      {sliderRow('H', h, v => fromHsl(v, s, l), 0, 360)}
      {sliderRow('S', s, v => fromHsl(h, v, l), 0, 100)}
      {sliderRow('L', l, v => fromHsl(h, s, v), 0, 100)}
    </div>
  );
}
