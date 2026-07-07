function Widget({ appBus }) {
  const [waveform, setWaveform] = React.useState('square');
  const [harmonics, setHarmonics] = React.useState(10);
  const [animPhase, setAnimPhase] = React.useState(0);
  const canvasRef = React.useRef(null);
  const frameRef = React.useRef(null);

  const waveConfigs = {
    square: { label: 'Square', coeff: (k) => 4 / (Math.PI * (2 * k - 1)), freq: (k) => 2 * k - 1 },
    sawtooth: { label: 'Sawtooth', coeff: (k) => 2 * Math.pow(-1, k + 1) / (Math.PI * k), freq: (k) => k },
    triangle: { label: 'Triangle', coeff: (k) => 8 * Math.pow(-1, k) / (Math.PI * Math.PI * (2 * k - 1) * (2 * k - 1)), freq: (k) => 2 * k - 1 }
  };

  const getWave = (t, n, cfg) => {
    let sum = 0;
    for (let k = 1; k <= n; k++) sum += cfg.coeff(k) * Math.sin(cfg.freq(k) * t);
    return sum;
  };

  const getPartial = (t, k, cfg) => cfg.coeff(k) * Math.sin(cfg.freq(k) * t);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * devicePixelRatio;
    const H = canvas.height = canvas.offsetHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    const w = canvas.offsetWidth, h = canvas.offsetHeight;

    ctx.clearRect(0, 0, w, h);

    const cfg = waveConfigs[waveform];

    const pad = 50;
    const plotW = w - pad * 2, plotH = h - pad * 2;
    const midY = pad + plotH / 2;

    const sx = (t) => pad + ((t + Math.PI) / (Math.PI * 2)) * plotW;
    const sy = (v) => midY - (v / 2) * (plotH / 2);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, midY); ctx.lineTo(w - pad, midY);
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.rect(pad, pad, plotW, plotH);
    ctx.clip();

    const colors = ['#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#6366f1','#a855f7','#ec4899','#78716c','#14b8a6'];

    for (let k = 1; k <= Math.min(harmonics, 10); k++) {
      ctx.strokeStyle = colors[(k - 1) % colors.length] + '40';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= plotW; i++) {
        const t = -Math.PI + (i / plotW) * Math.PI * 2;
        const v = getPartial(t + animPhase, k, cfg);
        i === 0 ? ctx.moveTo(sx(t), sy(v)) : ctx.lineTo(sx(t), sy(v));
      }
      ctx.stroke();
    }

    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= plotW; i++) {
      const t = -Math.PI + (i / plotW) * Math.PI * 2;
      const v = getWave(t, harmonics, cfg);
      i === 0 ? ctx.moveTo(sx(t), sy(v)) : ctx.lineTo(sx(t), sy(v));
    }
    ctx.stroke();

    ctx.restore();

    ctx.fillStyle = '#475569';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('−π', pad, midY + 6);
    ctx.fillText('π', w - pad, midY + 6);

    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`N = ${harmonics}`, pad + 8, pad + plotH - 6);

    frameRef.current = requestAnimationFrame(() => setAnimPhase(p => (p + 0.02) % (Math.PI * 2)));
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [waveform, harmonics, animPhase]);

  return (
    <div style={{ width: '100%', height: '100%', background: '#0B1120', color: '#e2e8f0', display: 'flex', flexDirection: 'column', fontFamily: 'ui-monospace, monospace', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #1e293b', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ color: '#94a3b8', fontSize: 12 }}>Waveform:</span>
        {Object.entries(waveConfigs).map(([key, cfg]) => (
          <button key={key} onClick={() => setWaveform(key)}
            style={{ background: waveform === key ? '#6366f1' : 'transparent', border: '1px solid ' + (waveform === key ? '#6366f1' : '#334155'), color: waveform === key ? '#fff' : '#94a3b8', borderRadius: 6, padding: '4px 14px', fontSize: 12, cursor: 'pointer' }}>
            {cfg.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <label style={{ fontSize: 12, color: '#94a3b8' }}>
          Harmonics: <span style={{ color: '#6366f1', fontWeight: 600 }}>{harmonics}</span>
          <input type="range" min={1} max={50} value={harmonics} onChange={e => setHarmonics(Number(e.target.value))} style={{ width: 120, accentColor: '#6366f1', marginLeft: 6, verticalAlign: 'middle' }} />
        </label>
      </div>
      <canvas ref={canvasRef} style={{ flex: 1, width: '100%', display: 'block', minHeight: 0 }} />
    </div>
  );
}
