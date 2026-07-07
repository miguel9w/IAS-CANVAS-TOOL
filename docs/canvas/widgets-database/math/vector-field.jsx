function Widget({ appBus }) {
  const [preset, setPreset] = React.useState('vortex');
  const [density, setDensity] = React.useState(15);
  const [showStreamlines, setShowStreamlines] = React.useState(true);
  const canvasRef = React.useRef(null);
  const [mousedown, setMousedown] = React.useState(null);

  const fieldFns = {
    vortex: (x, y) => ({ u: -y, v: x }),
    source: (x, y) => {
      const r = Math.sqrt(x * x + y * y) || 0.001;
      return { u: x / r, v: y / r };
    },
    saddle: (x, y) => ({ u: x, v: -y }),
    dipole: (x, y) => {
      const r2 = x * x + y * y || 0.001;
      const factor = -1 / (r2 * r2);
      return { u: factor * (x * x - y * y), v: factor * (2 * x * y) };
    }
  };

  const integrate = (x0, y0, steps, dt, field) => {
    const pts = [{ x: x0, y: y0 }];
    let x = x0, y = y0;
    for (let i = 0; i < steps; i++) {
      const k1 = field(x, y);
      const k2 = field(x + k1.u * dt / 2, y + k1.v * dt / 2);
      const k3 = field(x + k2.u * dt / 2, y + k2.v * dt / 2);
      const k4 = field(x + k3.u * dt, y + k3.v * dt);
      x += (k1.u + 2 * k2.u + 2 * k3.u + k4.u) * dt / 6;
      y += (k1.v + 2 * k2.v + 2 * k3.v + k4.v) * dt / 6;
      const r = Math.sqrt(x * x + y * y);
      if (r > 5 || !isFinite(x) || !isFinite(y)) break;
      pts.push({ x, y });
    }
    return pts;
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * devicePixelRatio;
    const H = canvas.height = canvas.offsetHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    const w = canvas.offsetWidth, h = canvas.offsetHeight;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0B1120';
    ctx.fillRect(0, 0, w, h);

    const field = fieldFns[preset];
    const cx = w / 2, cy = h / 2;
    const range = 4;
    const scale = Math.min(w, h) * 0.45;
    const toWorld = (sx, sy) => ({ x: (sx - cx) / scale * range, y: -(sy - cy) / scale * range });
    const toScreen = (wx, wy) => ({ x: cx + (wx / range) * scale, y: cy - (wy / range) * scale });

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(w, cy);
    ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
    ctx.stroke();

    const n = density;
    const spacing = scale * 2 / n;

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const sx = cx - scale + i * spacing + spacing / 2;
        const sy = cy - scale + j * spacing + spacing / 2;
        const wPos = toWorld(sx, sy);
        const f = field(wPos.x, wPos.y);
        const mag = Math.sqrt(f.u * f.u + f.v * f.v) || 0.001;
        const len = Math.min(spacing * 0.6, mag * 0.4);

        const nx = f.u / mag, ny = f.v / mag;
        const ex = sx + nx * len, ey = sy - ny * len;

        const intensity = Math.min(1, mag / 3);
        ctx.strokeStyle = `rgba(99, 102, 241, ${0.15 + intensity * 0.6})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        const angle = Math.atan2(-ny, nx);
        const arrowSize = 4;
        ctx.fillStyle = `rgba(99, 102, 241, ${0.2 + intensity * 0.7})`;
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - arrowSize * Math.cos(angle - 0.5), ey - arrowSize * Math.sin(angle - 0.5));
        ctx.lineTo(ex - arrowSize * Math.cos(angle + 0.5), ey - arrowSize * Math.sin(angle + 0.5));
        ctx.closePath();
        ctx.fill();
      }
    }

    if (showStreamlines) {
      const seeds = [];
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        seeds.push({ x: 0.5 * Math.cos(angle), y: 0.5 * Math.sin(angle) });
      }
      seeds.push({ x: 0, y: 0 });
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
        seeds.push({ x: 1.2 * Math.cos(angle), y: 1.2 * Math.sin(angle) });
      }

      for (const seed of seeds) {
        const pts = integrate(seed.x, seed.y, 200, 0.02, field);

        ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let k = 0; k < pts.length; k++) {
          const sp = toScreen(pts[k].x, pts[k].y);
          if (sp.x < -10 || sp.x > w + 10 || sp.y < -10 || sp.y > h + 10) break;
          k === 0 ? ctx.moveTo(sp.x, sp.y) : ctx.lineTo(sp.x, sp.y);
        }
        ctx.stroke();

        const negPts = integrate(seed.x, seed.y, 200, -0.02, field);
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let k = 0; k < negPts.length; k++) {
          const sp = toScreen(negPts[k].x, negPts[k].y);
          if (sp.x < -10 || sp.x > w + 10 || sp.y < -10 || sp.y > h + 10) break;
          k === 0 ? ctx.moveTo(sp.x, sp.y) : ctx.lineTo(sp.x, sp.y);
        }
        ctx.stroke();
      }
    }

    ctx.fillStyle = '#475569';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText('Click to place perturbation', 12, h - 8);
  }, [preset, density, showStreamlines]);

  const handleClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
  };

  return (
    <div style={{ width: '100%', height: '100%', background: '#0B1120', color: '#e2e8f0', display: 'flex', flexDirection: 'column', fontFamily: 'ui-monospace, monospace', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #1e293b', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ color: '#94a3b8', fontSize: 12 }}>Field:</span>
        {Object.keys(fieldFns).map(key => (
          <button key={key} onClick={() => setPreset(key)}
            style={{ background: preset === key ? '#6366f1' : 'transparent', border: '1px solid ' + (preset === key ? '#6366f1' : '#334155'), color: preset === key ? '#fff' : '#94a3b8', borderRadius: 6, padding: '3px 12px', fontSize: 11, cursor: 'pointer', textTransform: 'capitalize' }}>
            {key}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <label style={{ fontSize: 11, color: '#94a3b8' }}>
          Density: <input type="range" min={8} max={30} value={density} onChange={e => setDensity(Number(e.target.value))} style={{ width: 80, accentColor: '#6366f1', verticalAlign: 'middle' }} />
        </label>
        <label style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
          <input type="checkbox" checked={showStreamlines} onChange={e => setShowStreamlines(e.target.checked)} style={{ accentColor: '#6366f1' }} />
          Streamlines
        </label>
      </div>
      <canvas ref={canvasRef} style={{ flex: 1, width: '100%', display: 'block', minHeight: 0, cursor: 'crosshair' }} onClick={handleClick} />
    </div>
  );
}
