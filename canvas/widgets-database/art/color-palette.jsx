function Widget({ appBus }) {
  const [baseColor, setBaseColor] = React.useState('#7c83ff');
  const [mode, setMode] = React.useState('analogous');
  const [locked, setLocked] = React.useState([false, false, false, false, false]);

  const hexToHsl = (hex) => {
    const r = parseInt(hex.slice(1,3),16)/255;
    const g = parseInt(hex.slice(3,5),16)/255;
    const b = parseInt(hex.slice(5,7),16)/255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h=0,s=0,l=(max+min)/2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d/(2-max-min) : d/(max+min);
      switch (max) {
        case r: h = ((g-b)/d+(g<b?6:0))/6; break;
        case g: h = ((b-r)/d+2)/6; break;
        case b: h = ((r-g)/d+4)/6; break;
      }
    }
    return { h: h*360, s: s*100, l: l*100 };
  };

  const hslToHex = (h, s, l) => {
    s/=100; l/=100;
    const a = s * Math.min(l, 1-l);
    const f = (n) => {
      const k = (n + h/30) % 12;
      const color = l - a * Math.max(Math.min(k-3,9-k,1),-1);
      return Math.round(255 * Math.max(0, Math.min(1, color)));
    };
    return `#${f(0).toString(16).padStart(2,'0')}${f(8).toString(16).padStart(2,'0')}${f(4).toString(16).padStart(2,'0')}`;
  };

  const generatePalette = () => {
    const hsl = hexToHsl(baseColor);
    let colors = [];

    switch (mode) {
      case 'analogous':
        colors = [-30, -15, 0, 15, 30].map(d => hslToHex(hsl.h + d, hsl.s, hsl.l));
        break;
      case 'complementary':
        colors = [0, 180].flatMap(d => [hslToHex(hsl.h + d, hsl.s, hsl.l), hslToHex(hsl.h + d, Math.max(0, hsl.s - 20), Math.min(100, hsl.l + 10))]);
        if (colors.length < 5) colors.push(hslToHex(hsl.h, hsl.s, 50));
        colors = colors.slice(0,5);
        break;
      case 'triadic':
        colors = [0, 120, 240].flatMap(d => [hslToHex(hsl.h + d, hsl.s, hsl.l), hslToHex(hsl.h + d, hsl.s - 10, hsl.l - 10)]);
        colors = colors.slice(0,5);
        break;
      case 'monochromatic':
        colors = [-20, -10, 0, 10, 20].map(d => hslToHex(hsl.h, hsl.s, hsl.l + d));
        break;
      default:
        colors = ['#fff','#ccc','#999','#666','#333'];
    }
    return colors.map((c, i) => locked[i] ? baseColor : c);
  };

  const palette = generatePalette();

  const setColorAt = (index, color) => {
    if (index === 0) setBaseColor(color);
  };

  const toggleLock = (index) => {
    const l = [...locked];
    l[index] = !l[index];
    setLocked(l);
  };

  const copyColor = (color) => {
    navigator.clipboard?.writeText(color);
  };

  const s = {
    wrap: { background: '#0B1120', color: '#e2e8f0', fontFamily: 'system-ui,sans-serif', padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '8px', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' },
    h: { fontSize: '18px', fontWeight: 700, margin: '0 0 12px', color: '#7c83ff' },
    row: { display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center', flexWrap: 'wrap' },
    label: { fontSize: '12px', color: '#94a3b8' },
    colorInp: { width: '36px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: 0, background: 'transparent' },
    select: { background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '6px', color: '#e2e8f0', padding: '6px 10px', fontSize: '12px', cursor: 'pointer', outline: 'none' },
    palette: { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' },
    swatchWrap: { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' },
    swatch: (c) => ({ width: '80px', height: '80px', borderRadius: '10px', background: c, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '6px', cursor: 'pointer', position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', transition: 'transform 0.2s' }),
    hexLabel: { fontSize: '11px', fontFamily: 'monospace', background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '4px', color: '#fff' },
    lockBtn: (locked) => ({ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: '3px', color: locked ? '#fbbf24' : 'rgba(255,255,255,0.5)', fontSize: '10px', cursor: 'pointer', padding: '2px 4px' }),
    modeRow: { display: 'flex', gap: '4px', flexWrap: 'wrap' },
    modeBtn: (active) => ({ background: active ? '#7c83ff' : '#0f172a', border: '1px solid ' + (active ? '#7c83ff' : 'rgba(148, 163, 184, 0.08)'), borderRadius: '4px', color: active ? '#0B1120' : '#94a3b8', padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }),
  };

  return (
    <div style={s.wrap}>
      <div style={s.h}>🎨 Color Palette</div>
      <div style={s.row}>
        <span style={s.label}>Base:</span>
        <input type="color" style={s.colorInp} value={baseColor} onChange={e => setBaseColor(e.target.value)} />
      </div>
      <div style={s.modeRow}>
        {['analogous','complementary','triadic','monochromatic'].map(m => (
          <button key={m} style={s.modeBtn(mode === m)} onClick={() => setMode(m)}>
            {m.charAt(0).toUpperCase()+m.slice(1)}
          </button>
        ))}
      </div>
      <div style={s.palette}>
        <div style={s.swatchWrap}>
          {palette.map((c, i) => (
            <div key={i} style={s.swatch(c)} onClick={() => copyColor(c)} title="Click to copy">
              <button style={s.lockBtn(locked[i])} onClick={e => { e.stopPropagation(); toggleLock(i); }}>
                {locked[i] ? '🔒' : '🔓'}
              </button>
              <span style={s.hexLabel}>{c}</span>
            </div>
          ))}
        </div>
        <div style={{textAlign:'center',fontSize:'11px',color:'#94a3b8',marginTop:'8px'}}>Click a swatch to copy hex</div>
      </div>
    </div>
  );
}
