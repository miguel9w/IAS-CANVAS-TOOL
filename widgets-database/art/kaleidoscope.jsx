function Widget({ appBus }) {
  const canvasRef = React.useRef(null);
  const [symmetry, setSymmetry] = React.useState(6);
  const [animating, setAnimating] = React.useState(true);
  const [hue, setHue] = React.useState(0);
  const animRef = React.useRef(null);
  const points = React.useRef([]);
  const mousePos = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.width = c.parentElement.clientWidth;
    c.height = c.parentElement.clientHeight;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, c.width, c.height);
  }, []);

  const drawKaleidoscope = React.useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    const cx = c.width / 2;
    const cy = c.height / 2;

    ctx.fillStyle = `rgba(15,15,26,${animating ? 0.08 : 0.15})`;
    ctx.fillRect(0, 0, c.width, c.height);

    const m = mousePos.current;
    const dx = m.x - cx;
    const dy = m.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    if (dist < 5) return;

    const sliceAngle = (2 * Math.PI) / symmetry;
    const radius = Math.min(c.width, c.height) * 0.4;
    const particleCount = Math.max(1, Math.floor(dist / 8));

    for (let p = 0; p < particleCount; p++) {
      const t = animating ? (Date.now() / 1000 + p) : 0;
      const wobble = Math.sin(t * 2 + p) * 0.3 + 0.5;
      const r = dist * wobble * 0.8;
      const a = angle + (animating ? Math.sin(t + p * 0.5) * 0.2 : 0);
      const hueVal = (hue + p * 30 + (animating ? t * 50 : 0)) % 360;
      const sat = 70 + Math.sin(t + p) * 20;
      const lit = 50 + Math.sin(t * 0.5 + p) * 20;

      for (let i = 0; i < symmetry; i++) {
        const theta = a + sliceAngle * i;
        const x = cx + Math.cos(theta) * r;
        const y = cy + Math.sin(theta) * r;

        ctx.fillStyle = `hsl(${hueVal},${sat}%,${lit}%)`;
        const sz = Math.max(2, Math.min(8, 6 * wobble));
        ctx.beginPath();
        ctx.arc(x, y, sz, 0, Math.PI * 2);
        ctx.fill();

        const theta2 = -a + sliceAngle * i;
        const x2 = cx + Math.cos(theta2) * r;
        const y2 = cy + Math.sin(theta2) * r;
        ctx.beginPath();
        ctx.arc(x2, y2, sz, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (animating) setHue(h => (h + 0.5) % 360);

    animRef.current = requestAnimationFrame(drawKaleidoscope);
  }, [symmetry, animating, hue]);

  React.useEffect(() => {
    if (animating) {
      animRef.current = requestAnimationFrame(drawKaleidoscope);
    }
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [animating, drawKaleidoscope]);

  const handleMouseMove = (e) => {
    const c = canvasRef.current;
    const r = c.getBoundingClientRect();
    mousePos.current = { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const clearCanvas = () => {
    const c = canvasRef.current;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, c.width, c.height);
  };

  const s = {
    wrap: { background: '#0B1120', color: '#e2e8f0', fontFamily: 'system-ui,sans-serif', padding: '12px', height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '8px', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' },
    h: { fontSize: '18px', fontWeight: 700, margin: '0 0 8px', color: '#7c83ff' },
    toolbar: { display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap', alignItems: 'center' },
    label: { fontSize: '11px', color: '#888' },
    select: { background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '4px', color: '#e2e8f0', padding: '4px 8px', fontSize: '11px', cursor: 'pointer', outline: 'none' },
    toggleBtn: (active) => ({ background: active ? '#7c83ff' : '#0f172a', border: '1px solid ' + (active ? '#7c83ff' : 'rgba(148, 163, 184, 0.08)'), borderRadius: '4px', color: '#94a3b8', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }),
    clearBtn: { background: '#f87171', border: 'none', borderRadius: '4px', color: '#fff', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' },
    canvas: { flex: 1, borderRadius: '6px', overflow: 'hidden', cursor: 'none' },
  };

  return (
    <div style={s.wrap}>
      <div style={s.h}>🌀 Kaleidoscope</div>
      <div style={s.toolbar}>
        <span style={s.label}>Fold:</span>
        <select style={s.select} value={symmetry} onChange={e => setSymmetry(Number(e.target.value))}>
          {[4,6,8,10,12].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <button style={s.toggleBtn(animating)} onClick={() => setAnimating(!animating)}>{animating ? 'Anim On' : 'Anim Off'}</button>
        <button style={s.clearBtn} onClick={clearCanvas}>Clear</button>
      </div>
      <canvas ref={canvasRef} style={s.canvas} onMouseMove={handleMouseMove} />
    </div>
  );
}
