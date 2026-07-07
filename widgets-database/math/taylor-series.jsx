function Widget({ appBus }) {
  const [func, setFunc] = React.useState('sin');
  const [terms, setTerms] = React.useState(5);
  const canvasRef = React.useRef(null);

  const fns = {
    sin: { f: (x) => Math.sin(x), taylorGen: (n) => {
      return (x) => {
        let sum = 0;
        for (let k = 0; k < n; k++) sum += (k % 2 === 0 ? 1 : -1) * Math.pow(x, 2 * k + 1) / factorial(2 * k + 1);
        return sum;
      };
    }},
    cos: { f: (x) => Math.cos(x), taylorGen: (n) => {
      return (x) => {
        let sum = 0;
        for (let k = 0; k < n; k++) sum += (k % 2 === 0 ? 1 : -1) * Math.pow(x, 2 * k) / factorial(2 * k);
        return sum;
      };
    }},
    exp: { f: (x) => Math.exp(x), taylorGen: (n) => {
      return (x) => { let s = 0; for (let k = 0; k < n; k++) s += Math.pow(x, k) / factorial(k); return s; };
    }},
    ln: { f: (x) => x > 0 ? Math.log(x) : NaN, taylorGen: (n) => {
      return (x) => {
        if (x <= 0) return NaN;
        let s = 0;
        for (let k = 1; k <= n; k++) s += (k % 2 === 0 ? -1 : 1) * Math.pow(x - 1, k) / k;
        return s;
      };
    }}
  };

  const factorial = (n) => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * devicePixelRatio;
    const H = canvas.height = canvas.offsetHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    const w = canvas.offsetWidth, h = canvas.offsetHeight;

    ctx.clearRect(0, 0, w, h);

    const pad = 50;
    const plotW = w - pad * 2, plotH = h - pad * 2;

    const xMin = -4, xMax = 4, yMin = -3, yMax = 3;

    const sx = (x) => pad + ((x - xMin) / (xMax - xMin)) * plotW;
    const sy = (y) => pad + plotH - ((y - yMin) / (yMax - yMin)) * plotH;

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, sy(0)); ctx.lineTo(w - pad, sy(0));
    ctx.moveTo(sx(0), pad); ctx.lineTo(sx(0), h - pad);
    ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = -4; i <= 4; i++) {
      if (i === 0) continue;
      const x = sx(i);
      ctx.fillText(i, x, sy(0) + 4);
      ctx.beginPath(); ctx.moveTo(x, sy(0) - 3); ctx.lineTo(x, sy(0) + 3); ctx.stroke();
    }

    ctx.save();
    ctx.beginPath();
    ctx.rect(pad, pad, plotW, plotH);
    ctx.clip();

    const current = fns[func];
    const approx = current.taylorGen(terms);

    const drawFn = (fn, color, width, dash) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      if (dash) ctx.setLineDash(dash); else ctx.setLineDash([]);
      ctx.beginPath();
      let started = false;
      for (let i = 0; i <= plotW; i++) {
        const x = xMin + (i / plotW) * (xMax - xMin);
        const y = fn(x);
        if (!isFinite(y)) { started = false; continue; }
        if (!started) { ctx.moveTo(sx(x), sy(y)); started = true; } else ctx.lineTo(sx(x), sy(y));
      }
      ctx.stroke();
    };

    drawFn(current.f, '#ef4444', 2.5);
    drawFn(approx, '#6366f1', 2, [6, 3]);

    ctx.restore();

    const legendY = pad + 15;
    ctx.fillStyle = '#ef4444'; ctx.fillRect(w - pad - 140, legendY, 12, 3);
    ctx.fillStyle = '#94a3b8'; ctx.font = '11px monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(func + '(x)', w - pad - 124, legendY + 2);
    ctx.fillStyle = '#6366f1'; ctx.fillRect(w - pad - 140, legendY + 16, 12, 3);
    ctx.fillStyle = '#6366f1'; ctx.fillRect(w - pad - 136, legendY + 14, 4, 6);
    ctx.fillStyle = '#94a3b8'; ctx.font = '11px monospace';
    ctx.fillText(`P${terms}(x)`, w - pad - 124, legendY + 18);
  }, [func, terms]);

  return (
    <div style={{ width: '100%', height: '100%', background: '#0B1120', color: '#e2e8f0', display: 'flex', flexDirection: 'column', fontFamily: 'ui-monospace, monospace', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #1e293b', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ color: '#94a3b8', fontSize: 12 }}>Function:</span>
        {['sin','cos','exp','ln'].map(f => (
          <button key={f} onClick={() => setFunc(f)}
            style={{ background: func === f ? '#6366f1' : 'transparent', border: '1px solid ' + (func === f ? '#6366f1' : '#334155'), color: func === f ? '#fff' : '#94a3b8', borderRadius: 6, padding: '4px 14px', fontSize: 12, cursor: 'pointer' }}>
            {f}(x)
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <label style={{ fontSize: 12, color: '#94a3b8' }}>
          Terms: <span style={{ color: '#6366f1', fontWeight: 600 }}>{terms}</span>
          <input type="range" min={1} max={20} value={terms} onChange={e => setTerms(Number(e.target.value))} style={{ width: 100, accentColor: '#6366f1', marginLeft: 6, verticalAlign: 'middle' }} />
        </label>
      </div>
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>
    </div>
  );
}
