function Widget({ appBus }) {
  const [xExpr, setXExpr] = React.useState('Math.cos(t)');
  const [yExpr, setYExpr] = React.useState('Math.sin(t)');
  const [tMin, setTMin] = React.useState(0);
  const [tMax, setTMax] = React.useState(Math.PI * 2);
  const [animProgress, setAnimProgress] = React.useState(0);
  const [speed, setSpeed] = React.useState(0.5);
  const canvasRef = React.useRef(null);
  const frameRef = React.useRef(null);

  const evaluate = (expr, t) => {
    try { return Function('t', '"use strict"; return (' + expr + ');')(t); } catch { return 0; }
  };

  const getCurvePoints = (steps) => {
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const t = tMin + (i / steps) * (tMax - tMin);
      const x = evaluate(xExpr, t), y = evaluate(yExpr, t);
      if (isFinite(x) && isFinite(y)) pts.push({ x, y, t });
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

    const pts = getCurvePoints(2000);
    if (pts.length < 2) return;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of pts) { if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x; if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y; }
    const rangeX = maxX - minX || 1, rangeY = maxY - minY || 1;
    const range = Math.max(rangeX, rangeY) * 0.55;

    const cx = w / 2, cy = h / 2;
    const scale = Math.min(w, h) * 0.4;
    const toSX = (x) => cx + ((x - (minX + maxX) / 2) / range) * scale;
    const toSY = (y) => cy - ((y - (minY + maxY) / 2) / range) * scale;

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(w, cy);
    ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
    ctx.stroke();
    ctx.setLineDash([]);

    const drawTo = Math.floor((animProgress / 100) * pts.length);

    if (drawTo > 0) {
      const gradient = ctx.createLinearGradient(0, 0, w, 0);
      gradient.addColorStop(0, '#6366f1');
      gradient.addColorStop(1, '#a855f7');
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(toSX(pts[0].x), toSY(pts[0].y));
      for (let i = 1; i < drawTo && i < pts.length; i++) {
        ctx.lineTo(toSX(pts[i].x), toSY(pts[i].y));
      }
      ctx.stroke();

      if (drawTo > 1 && drawTo < pts.length) {
        const p = pts[Math.min(drawTo, pts.length - 1)];
        const sx = toSX(p.x), sy = toSY(p.y);
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(sx, sy, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#6366f1';
        ctx.font = '11px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`t = ${p.t.toFixed(2)}`, sx + 8, sy - 4);
        ctx.fillText(`(${p.x.toFixed(2)}, ${p.y.toFixed(2)})`, sx + 8, sy + 8);
      }
    }

    ctx.fillStyle = '#475569';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`t ∈ [${tMin.toFixed(1)}, ${tMax.toFixed(1)}]`, 12, h - 8);

    let animTimer;
    if (drawTo >= pts.length) {
      animTimer = setTimeout(() => setAnimProgress(0), 500);
    }
    return () => clearTimeout(animTimer);
  }, [xExpr, yExpr, tMin, tMax, animProgress]);

  React.useEffect(() => {
    if (speed === 0) return;
    const interval = 50;
    const step = speed * 0.3;
    const id = setInterval(() => {
      setAnimProgress(p => {
        const next = p + step;
        return next >= 100 ? 100 : next;
      });
    }, interval);
    frameRef.current = id;
    return () => clearInterval(id);
  }, [speed, xExpr, yExpr, tMin, tMax]);

  return (
    <div style={{ width: '100%', height: '100%', background: '#0B1120', color: '#e2e8f0', display: 'flex', flexDirection: 'column', fontFamily: 'ui-monospace, monospace', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #1e293b', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ color: '#6366f1', fontSize: 12 }}>x(t)=</span>
        <input value={xExpr} onChange={e => setXExpr(e.target.value)} style={{ width: 120, background: '#1e293b', border: '1px solid #334155', borderRadius: 6, padding: '4px 8px', color: '#e2e8f0', fontSize: 12, fontFamily: 'monospace' }} />
        <span style={{ color: '#a855f7', fontSize: 12 }}>y(t)=</span>
        <input value={yExpr} onChange={e => setYExpr(e.target.value)} style={{ width: 120, background: '#1e293b', border: '1px solid #334155', borderRadius: 6, padding: '4px 8px', color: '#e2e8f0', fontSize: 12, fontFamily: 'monospace' }} />
        <label style={{ fontSize: 11, color: '#94a3b8' }}>t min: <input type="range" min={-10} max={10} step={0.5} value={tMin} onChange={e => setTMin(Number(e.target.value))} style={{ width: 60, accentColor: '#6366f1' }} /></label>
        <label style={{ fontSize: 11, color: '#94a3b8' }}>t max: <input type="range" min={-10} max={10} step={0.5} value={tMax} onChange={e => setTMax(Number(e.target.value))} style={{ width: 60, accentColor: '#6366f1' }} /></label>
        <div style={{ flex: 1 }} />
        <button onClick={() => setAnimProgress(0)} style={{ background: 'transparent', border: '1px solid #6366f1', color: '#6366f1', borderRadius: 6, padding: '3px 12px', fontSize: 11, cursor: 'pointer' }}>
          ↺ Reset
        </button>
        <label style={{ fontSize: 11, color: '#94a3b8' }}>
          Speed: <input type="range" min={0} max={2} step={0.1} value={speed} onChange={e => setSpeed(Number(e.target.value))} style={{ width: 60, accentColor: '#6366f1', verticalAlign: 'middle' }} />
        </label>
      </div>
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        <div style={{ position: 'absolute', bottom: 8, right: 12, color: '#475569', fontSize: 10, fontFamily: 'monospace' }}>
          {Math.round(animProgress)}%
        </div>
      </div>
    </div>
  );
}
