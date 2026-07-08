function Widget({ appBus }) {
  const [expr, setExpr] = React.useState('Math.sin(Math.sqrt(x*x+y*y))');
  const [autoRotate, setAutoRotate] = React.useState(true);
  const [rotation, setRotation] = React.useState(0);
  const canvasRef = React.useRef(null);
  const frameRef = React.useRef(null);

  const evaluate = (x, y) => {
    try { return Function('x', 'y', '"use strict"; return (' + expr + ');')(x, y); } catch { return 0; }
  };

  const project = (x, y, z, angleX, angleY) => {
    const cosA = Math.cos(angleX), sinA = Math.sin(angleX);
    const cosB = Math.cos(angleY), sinB = Math.sin(angleY);
    let x1 = x, y1 = y * cosA - z * sinA, z1 = y * sinA + z * cosA;
    let x2 = x1 * cosB + z1 * sinB, y2 = y1, z2 = -x1 * sinB + z1 * cosB;
    return { x: x2, y: y2, z: z2 };
  };

  const getColor = (z, maxZ) => {
    const t = maxZ === 0 ? 0.5 : (z / maxZ + 1) / 2;
    const r = Math.round(100 + t * 155);
    const g = Math.round(50 + (1 - Math.abs(t - 0.5) * 2) * 150);
    const b = Math.round(200 - t * 150);
    return `rgb(${r},${g},${b})`;
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

    const angleY = autoRotate ? rotation : rotation;
    const angleX = 0.5;
    const scale = Math.min(w, h) * 0.35;
    const cx = w / 2, cy = h / 2;

    const res = 30;
    const range = 4;
    const step = (range * 2) / res;

    const vertices = [];
    let maxZ = 0;
    for (let i = 0; i <= res; i++) {
      for (let j = 0; j <= res; j++) {
        const x = -range + i * step, y = -range + j * step;
        const z = evaluate(x, y);
        if (isFinite(z) && Math.abs(z) > maxZ) maxZ = Math.abs(z);
        const p = project(x, y, z * 0.7, angleX, angleY);
        vertices.push({ px: cx + p.x * scale, py: cy - p.y * scale, z: z, x, y });
      }
    }
    maxZ = Math.max(maxZ, 0.01);

    const idx = (i, j) => i * (res + 1) + j;

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < res; i++) {
      for (let j = 0; j < res; j++) {
        const a = vertices[idx(i, j)], b = vertices[idx(i + 1, j)], c = vertices[idx(i + 1, j + 1)], d = vertices[idx(i, j + 1)];
        const avgZ = (a.z + b.z + c.z + d.z) / 4;
        const fill = getColor(avgZ, maxZ);

        ctx.beginPath();
        ctx.moveTo(a.px, a.py);
        ctx.lineTo(b.px, b.py);
        ctx.lineTo(c.px, c.py);
        ctx.lineTo(d.px, d.py);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.stroke();
      }
    }

    ctx.strokeStyle = 'rgba(99,102,241,0.4)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= res; i++) {
      ctx.beginPath();
      for (let j = 0; j <= res; j++) {
        const v = vertices[idx(i, j)];
        j === 0 ? ctx.moveTo(v.px, v.py) : ctx.lineTo(v.px, v.py);
      }
      ctx.stroke();
    }
    for (let j = 0; j <= res; j++) {
      ctx.beginPath();
      for (let i = 0; i <= res; i++) {
        const v = vertices[idx(i, j)];
        i === 0 ? ctx.moveTo(v.px, v.py) : ctx.lineTo(v.px, v.py);
      }
      ctx.stroke();
    }

    ctx.fillStyle = '#475569';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('x', cx + 10, cy + 5);
    ctx.textBaseline = 'bottom';
    ctx.fillText('y', cx - 10, cy - 10);

    if (autoRotate) {
      frameRef.current = requestAnimationFrame(() => setRotation(r => (r + 0.015) % (Math.PI * 2)));
    }
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [expr, rotation, autoRotate]);

  return (
    <div style={{ width: '100%', height: '100%', background: '#0B1120', color: '#e2e8f0', display: 'flex', flexDirection: 'column', fontFamily: 'ui-monospace, monospace', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #1e293b', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ color: '#6366f1', fontWeight: 600, fontSize: 13 }}>f(x,y) =</span>
        <input value={expr} onChange={e => setExpr(e.target.value)}
          style={{ flex: 1, minWidth: 160, background: '#1e293b', border: '1px solid #334155', borderRadius: 6, padding: '6px 10px', color: '#e2e8f0', fontSize: 13, fontFamily: 'monospace' }} />
        <label style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
          <input type="checkbox" checked={autoRotate} onChange={e => setAutoRotate(e.target.checked)} style={{ accentColor: '#6366f1' }} />
          Auto-rotate
        </label>
        {!autoRotate && <input type="range" min={0} max={360} value={rotation * 57.3} onChange={e => setRotation(e.target.value / 57.3)} style={{ width: 80, accentColor: '#6366f1' }} />}
      </div>
      <canvas ref={canvasRef} style={{ flex: 1, width: '100%', display: 'block', minHeight: 0 }} />
    </div>
  );
}
