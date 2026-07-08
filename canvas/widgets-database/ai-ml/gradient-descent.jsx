function Widget({ appBus }) {
  const [lr, setLr] = React.useState(0.1);
  const [optType, setOptType] = React.useState('sgd');
  const [startPt, setStartPt] = React.useState(null);
  const [path, setPath] = React.useState([]);
  const [running, setRunning] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [finalLoss, setFinalLoss] = React.useState(0);
  const [stepCount, setStepCount] = React.useState(0);
  const animRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  const lossFn = React.useCallback((x, y) => {
    const a = x - 0.5, b = y - 0.5;
    return a * a + 2 * b * b + 0.3 * Math.sin(3 * a) * Math.cos(3 * b);
  }, []);

  const gradient = React.useCallback((x, y) => {
    const a = x - 0.5, b = y - 0.5;
    const eps = 1e-6;
    const dx = (lossFn(x + eps, y) - lossFn(x - eps, y)) / (2 * eps);
    const dy = (lossFn(x, y + eps) - lossFn(x, y - eps)) / (2 * eps);
    return { dx, dy };
  }, [lossFn]);

  const momentumVal = 0.9;

  const takeStep = React.useCallback((pos, vel) => {
    const { dx, dy } = gradient(pos.x, pos.y);
    let newPos, newVel;
    if (optType === 'sgd') {
      newPos = { x: pos.x - lr * dx, y: pos.y - lr * dy };
      newVel = null;
    } else {
      const nx = vel.x * momentumVal - lr * dx;
      const ny = vel.y * momentumVal - lr * dy;
      newVel = { x: nx, y: ny };
      newPos = { x: pos.x + nx, y: pos.y + ny };
    }
    return { pos: newPos, vel: newVel };
  }, [lr, optType, gradient]);

  const startOptimization = React.useCallback(() => {
    if (!startPt) return;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setRunning(true);
    setDone(false);
    setPath([startPt]);
    setStepCount(0);

    let pos = { ...startPt };
    let vel = { x: 0, y: 0 };
    let steps = 0;
    const maxSteps = 200;
    let prevLoss = lossFn(pos.x, pos.y);

    const step = () => {
      if (steps >= maxSteps) {
        setRunning(false);
        setDone(true);
        setFinalLoss(lossFn(pos.x, pos.y));
        return;
      }

      const result = takeStep(pos, vel);
      pos = result.pos;
      vel = result.vel;
      steps++;

      pos.x = Math.max(-1, Math.min(2, pos.x));
      pos.y = Math.max(-1, Math.min(2, pos.y));

      const curLoss = lossFn(pos.x, pos.y);
      setFinalLoss(curLoss);
      setStepCount(steps);

      setPath(prev => [...prev, { x: pos.x, y: pos.y }]);

      if (Math.abs(prevLoss - curLoss) < 1e-8) {
        setRunning(false);
        setDone(true);
        return;
      }
      prevLoss = curLoss;
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
  }, [startPt, takeStep, lossFn]);

  React.useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = 450;
    const H = canvas.height = 450;
    const pad = 35;
    const plotW = W - pad * 2;
    const plotH = H - pad * 2;

    const toScreen = (x, y) => [pad + (x + 1) / 3 * plotW, pad + (1 - (y + 1) / 3) * plotH];

    ctx.fillStyle = '#0B1120';
    ctx.fillRect(0, 0, W, H);

    const res = 4;
    const imgData = ctx.createImageData(plotW, plotH);
    for (let px = 0; px < plotW; px += res) {
      for (let py = 0; py < plotH; py += res) {
        const x = (px / plotW) * 3 - 1;
        const y = 1 - (py / plotH) * 3;
        const loss = lossFn(x, y);
        const norm = Math.max(0, Math.min(1, (loss - 0.1) / 2.5));
        const r = Math.floor(8 + norm * 20);
        const g = Math.floor(10 + norm * 30);
        const b = Math.floor(16 + norm * 60);
        for (let dy = 0; dy < res && py + dy < plotH; dy++) {
          for (let dx = 0; dx < res && px + dx < plotW; dx++) {
            const idx = ((py + dy) * plotW + (px + dx)) * 4;
            imgData.data[idx] = r;
            imgData.data[idx+1] = g;
            imgData.data[idx+2] = b;
            imgData.data[idx+3] = 255;
          }
        }
      }
    }
    ctx.putImageData(imgData, pad, pad);

    const contourLevels = [0.05, 0.15, 0.3, 0.5, 0.8, 1.2, 1.8];
    for (const level of contourLevels) {
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
      ctx.lineWidth = 0.5;
      for (let px = 0; px < plotW; px++) {
        for (let py = 0; py < plotH; py++) {
          const x = (px / plotW) * 3 - 1;
          const y = 1 - (py / plotH) * 3;
          const loss = lossFn(x, y);
          if (Math.abs(loss - level) < 0.025) {
            const [sx, sy] = [pad + px, pad + py];
            ctx.beginPath();
            ctx.arc(sx, sy, 0.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, pad); ctx.lineTo(pad, H - pad);
    ctx.moveTo(pad, H - pad); ctx.lineTo(W - pad, H - pad);
    ctx.stroke();

    ctx.fillStyle = '#3a4a5a';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 3; i++) {
      const x = (i / 3) * 3 - 1;
      const [sx] = toScreen(x, 0);
      ctx.fillText(x.toFixed(1), sx, H - pad + 14);
    }
    ctx.textAlign = 'right';
    for (let i = 0; i <= 3; i++) {
      const y = 1 - (i / 3) * 3;
      const [, sy] = toScreen(0, y);
      ctx.fillText(y.toFixed(1), pad - 6, sy + 4);
    }

    if (path.length > 0) {
      ctx.beginPath();
      for (let i = 0; i < path.length; i++) {
        const [sx, sy] = toScreen(path[i].x, path[i].y);
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.strokeStyle = '#ff4081';
      ctx.lineWidth = 2;
      ctx.stroke();

      for (let i = 0; i < path.length; i++) {
        const [sx, sy] = toScreen(path[i].x, path[i].y);
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fillStyle = i === path.length - 1 ? '#ffeb3b' : 'rgba(255,64,129,0.5)';
        ctx.fill();
        if (i === path.length - 1) {
          ctx.strokeStyle = '#ffeb3b';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }

    ctx.fillStyle = '#556688';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Click to set start point', 8, 14);
  }, [lossFn, path, startPt]);

  const handleCanvasClick = React.useCallback((e) => {
    if (running) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const pad = 35;
    const W = 450, H = 450;
    const plotW = W - pad * 2;
    const plotH = H - pad * 2;
    const x = (mx - pad) / plotW * 3 - 1;
    const y = 1 - (my - pad) / plotH * 3;
    if (x < -1 || x > 2 || y < -1 || y > 2) return;
    setStartPt({ x, y });
    setPath([]);
    setDone(false);
    setFinalLoss(0);
    setStepCount(0);
  }, [running]);

  const s = {
    container: { background: '#0B1120', color: '#e2e8f0', fontFamily: 'monospace', padding: '16px', borderRadius: '8px', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' },
    header: { fontSize: '16px', fontWeight: 'bold', color: '#00e5ff', marginBottom: '12px' },
    row: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
    canvas: { borderRadius: '4px', border: '1px solid #0f172a', cursor: running ? 'wait' : 'crosshair' },
    panel: { flex: 1, minWidth: '180px' },
    label: { color: '#8899bb', fontSize: '11px', marginBottom: '4px' },
    value: { color: '#e2e8f0', fontSize: '13px', marginBottom: '6px' },
    btn: { background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(148, 163, 184, 0.08)', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', margin: '3px' },
    btnActive: { background: '#00e5ff', color: '#0B1120', border: '1px solid #00e5ff', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', margin: '3px' },
    slider: { width: '120px', accentColor: '#00e5ff' },
  };

  return (
    <div style={s.container}>
      <div style={s.header}>Gradient Descent on Loss Surface</div>
      <div style={s.row}>
        <div>
          <canvas ref={canvasRef} width={450} height={450} style={s.canvas} onClick={handleCanvasClick} />
        </div>
        <div style={s.panel}>
          <div style={s.label}>Optimizer</div>
          <div style={{ marginBottom: '10px' }}>
            <button style={optType === 'sgd' ? s.btnActive : s.btn} onClick={() => setOptType('sgd')}>SGD</button>
            <button style={optType === 'momentum' ? s.btnActive : s.btn} onClick={() => setOptType('momentum')}>Momentum</button>
          </div>
          <div style={s.label}>Learning rate</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <input type="range" min={0.01} max={0.5} step={0.01} value={lr}
              onChange={e => setLr(Number(e.target.value))}
              style={s.slider} />
            <span style={{color:'#00e5ff', fontWeight:'bold', fontSize:'14px'}}>{lr.toFixed(2)}</span>
          </div>
          <button style={s.btn} onClick={startOptimization} disabled={running || !startPt}>
            {running ? 'Running...' : 'Optimize'}
          </button>
          <div style={{ marginTop: '12px' }}>
            <div style={s.label}>Start point</div>
            <div style={s.value}>{startPt ? `(${startPt.x.toFixed(2)}, ${startPt.y.toFixed(2)})` : 'Click canvas'}</div>
            <div style={s.label}>Steps taken</div>
            <div style={{...s.value, fontSize:'18px', fontWeight:'bold', color:'#00e5ff'}}>{stepCount}</div>
            <div style={s.label}>Final loss</div>
            <div style={{...s.value, color: finalLoss < 0.2 ? '#76ff03' : '#ffeb3b'}}>
              {finalLoss.toFixed(6)}
            </div>
            <div style={s.label}>Status</div>
            <div style={{...s.value, color: done ? '#76ff03' : (running ? '#ffeb3b' : '#8899bb')}}>
              {done ? 'Converged' : (running ? 'Running' : (startPt ? 'Ready' : 'Click canvas to start'))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
