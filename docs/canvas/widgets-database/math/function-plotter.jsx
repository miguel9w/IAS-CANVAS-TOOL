function Widget({ appBus }) {
  const [expr, setExpr] = React.useState('Math.sin(x)');
  const [xMin, setXMin] = React.useState(-6);
  const [xMax, setXMax] = React.useState(6);
  const canvasRef = React.useRef(null);
  const [error, setError] = React.useState('');

  const evaluate = (x) => {
    try { return Function('x', `"use strict"; return (${expr});`)(x); } catch { return NaN; }
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

    const pad = { l: 50, r: 20, t: 20, b: 40 };
    const plotW = w - pad.l - pad.r;
    const plotH = h - pad.t - pad.b;

    const toScreenX = (x) => pad.l + ((x - xMin) / (xMax - xMin)) * plotW;
    const toScreenY = (y) => pad.t + plotH / 2 - (y / 6) * (plotH / 2);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const yZero = toScreenY(0);
    ctx.moveTo(pad.l, yZero); ctx.lineTo(w - pad.r, yZero);
    const xZero = toScreenX(0);
    if (xZero >= pad.l && xZero <= w - pad.r) {
      ctx.moveTo(xZero, pad.t); ctx.lineTo(xZero, h - pad.b);
    }
    ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = Math.ceil(xMin); i <= Math.floor(xMax); i++) {
      const sx = toScreenX(i);
      if (sx >= pad.l && sx <= w - pad.r) {
        ctx.fillText(i, sx, yZero + 5);
        ctx.beginPath(); ctx.moveTo(sx, yZero - 3); ctx.lineTo(sx, yZero + 3); ctx.stroke();
      }
    }
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = -5; i <= 5; i++) {
      if (i === 0) continue;
      const sy = toScreenY(i);
      if (sy >= pad.t && sy <= h - pad.b) {
        ctx.fillText(i, pad.l - 8, sy);
        ctx.beginPath(); ctx.moveTo(pad.l, sy); ctx.lineTo(pad.l + 4, sy); ctx.stroke();
      }
    }

    ctx.save();
    ctx.beginPath();
    ctx.rect(pad.l, pad.t, plotW, plotH);
    ctx.clip();

    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const steps = plotW;
    let started = false;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y = evaluate(x);
      if (!isFinite(y)) { started = false; continue; }
      const sx = toScreenX(x), sy = toScreenY(y);
      if (!started) { ctx.moveTo(sx, sy); started = true; } else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.arc(toScreenX(0), toScreenY(evaluate(0)), 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('x', w - pad.r - 5, yZero + 18);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('y', pad.l - 5, pad.t);
  }, [expr, xMin, xMax]);

  return (
    <div style={{ width: '100%', height: '100%', background: '#0B1120', color: '#e2e8f0', display: 'flex', flexDirection: 'column', fontFamily: 'ui-monospace, monospace', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ color: '#6366f1', fontWeight: 600, fontSize: 13 }}>f(x) =</span>
        <input value={expr} onChange={e => { setExpr(e.target.value); setError(''); }}
          style={{ flex: 1, minWidth: 150, background: '#1e293b', border: error ? '1px solid #ef4444' : '1px solid #334155', borderRadius: 6, padding: '6px 10px', color: '#e2e8f0', fontSize: 13, fontFamily: 'monospace' }} />
        <label style={{ fontSize: 12, color: '#94a3b8' }}>x min: <input type="range" min={-10} max={9} step={0.5} value={xMin} onChange={e => setXMin(Number(e.target.value))} style={{ width: 80, accentColor: '#6366f1' }} /></label>
        <label style={{ fontSize: 12, color: '#94a3b8' }}>x max: <input type="range" min={-9} max={10} step={0.5} value={xMax} onChange={e => setXMax(Number(e.target.value))} style={{ width: 80, accentColor: '#6366f1' }} /></label>
      </div>
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        {error && <div style={{ position: 'absolute', bottom: 8, left: 8, color: '#ef4444', fontSize: 12, background: 'rgba(239,68,68,0.1)', padding: '4px 10px', borderRadius: 4 }}>{error}</div>}
      </div>
    </div>
  );
}
