function Widget({ appBus }) {
  const [points, setPoints] = React.useState(() => {
    const pts = [];
    for (let i = 0; i < 20; i++) {
      let x = Math.random() * 2 - 1, y = Math.random() * 2 - 1;
      let label = x > y ? 1 : -1;
      if (Math.random() < 0.1) label = -label;
      pts.push({ x, y, label });
    }
    return pts;
  });
  const [nextLabel, setNextLabel] = React.useState(1);
  const [weights, setWeights] = React.useState([Math.random()-0.5, Math.random()-0.5, Math.random()-0.5]);
  const [bias, setBias] = React.useState(Math.random()-0.5);
  const [trained, setTrained] = React.useState(false);
  const [epoch, setEpoch] = React.useState(0);
  const [accuracy, setAccuracy] = React.useState(0);
  const [training, setTraining] = React.useState(false);
  const [animFrame, setAnimFrame] = React.useState(null);
  const canvasRef = React.useRef(null);
  const lr = 0.1;

  const computeAccuracy = React.useCallback((w, b) => {
    if (points.length === 0) return 0;
    let correct = 0;
    for (const p of points) {
      const score = w[0] * p.x + w[1] * p.y + b;
      const pred = score >= 0 ? 1 : -1;
      if (pred === p.label) correct++;
    }
    return correct / points.length;
  }, [points]);

  const trainStep = React.useCallback(() => {
    setPoints(prevPoints => {
      setTraining(true);
      let w = [...weights];
      let b = bias;
      let acc = 0;
      let anyMistake = true;
      let ep = 0;
      const maxEpochs = 50;

      const step = () => {
        if (ep >= maxEpochs || !anyMistake) {
          setTraining(false);
          setWeights(w);
          setBias(b);
          setAccuracy(computeAccuracy(w, b));
          setTrained(true);
          return;
        }
        anyMistake = false;
        for (const p of prevPoints) {
          const score = w[0] * p.x + w[1] * p.y + b;
          const pred = score >= 0 ? 1 : -1;
          if (pred !== p.label) {
            anyMistake = true;
            w[0] += lr * p.label * p.x;
            w[1] += lr * p.label * p.y;
            b += lr * p.label;
          }
        }
        ep++;
        acc = computeAccuracy(w, b);
        setWeights([...w]);
        setBias(b);
        setEpoch(ep);
        setAccuracy(acc);
        if (anyMistake && ep < maxEpochs) {
          setAnimFrame(requestAnimationFrame(step));
        } else {
          setTraining(false);
          setTrained(true);
        }
      };
      step();
      return prevPoints;
    });
  }, [weights, bias, computeAccuracy]);

  React.useEffect(() => {
    return () => { if (animFrame) cancelAnimationFrame(animFrame); };
  }, [animFrame]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = 400;
    const H = canvas.height = 400;
    const pad = 40;
    const plotW = W - pad * 2;
    const plotH = H - pad * 2;

    const toScreen = (x, y) => [pad + (x + 1) / 2 * plotW, pad + (1 - (y + 1) / 2) * plotH];

    ctx.fillStyle = '#0B1120';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, pad); ctx.lineTo(pad, H - pad);
    ctx.moveTo(pad, H - pad); ctx.lineTo(W - pad, H - pad);
    ctx.stroke();

    for (let i = -10; i <= 10; i++) {
      const v = i / 10;
      const [sx, sy] = toScreen(v, 0);
      ctx.strokeStyle = '#0f172a';
      ctx.beginPath(); ctx.moveTo(sx, pad); ctx.lineTo(sx, H - pad); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pad, sy); ctx.lineTo(W - pad, sy); ctx.stroke();
    }

    if (trained || training) {
      const w = weights, b = bias;
      let x1 = -1, y1 = 0, x2 = 1, y2 = 0;
      if (Math.abs(w[1]) > 0.001) {
        y1 = -(w[0] * x1 + b) / w[1];
        y2 = -(w[0] * x2 + b) / w[1];
      } else if (Math.abs(w[0]) > 0.001) {
        x1 = -b / w[0]; y1 = -1;
        x2 = -b / w[0]; y2 = 1;
      }
      if (y1 < -1) { x1 = -(b + w[1] * -1) / w[0]; y1 = -1; }
      if (y1 > 1) { x1 = -(b + w[1] * 1) / w[0]; y1 = 1; }
      if (y2 < -1) { x2 = -(b + w[1] * -1) / w[0]; y2 = -1; }
      if (y2 > 1) { x2 = -(b + w[1] * 1) / w[0]; y2 = 1; }

      const [sx1, sy1] = toScreen(x1, y1);
      const [sx2, sy2] = toScreen(x2, y2);

      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(sx1, sy1);
      ctx.lineTo(sx2, sy2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(0, 229, 255, 0.08)';
      ctx.beginPath();
      const sideX1 = w[1] > 0 ? -1 : 1;
      ctx.moveTo(...toScreen(sideX1, -1));
      ctx.lineTo(...toScreen(x1, y1));
      ctx.lineTo(...toScreen(x2, y2));
      ctx.lineTo(...toScreen(sideX1, 1));
      ctx.closePath();
      ctx.fill();
    }

    for (const p of points) {
      const [sx, sy] = toScreen(p.x, p.y);
      ctx.beginPath();
      ctx.arc(sx, sy, 6, 0, Math.PI * 2);
      ctx.fillStyle = p.label === 1 ? '#ff4081' : '#00e5ff';
      ctx.fill();
      ctx.strokeStyle = p.label === 1 ? '#ff6f9c' : '#4dd0ff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }, [points, weights, bias, trained, training]);

  const handleCanvasClick = React.useCallback((e) => {
    if (training) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const pad = 40;
    const W = 400, H = 400;
    const plotW = W - pad * 2;
    const plotH = H - pad * 2;
    const x = (mx - pad) / plotW * 2 - 1;
    const y = 1 - (my - pad) / plotH * 2;
    if (x < -1 || x > 1 || y < -1 || y > 1) return;
    setPoints(prev => [...prev, { x, y, label: nextLabel }]);
    setTrained(false);
  }, [nextLabel, training]);

  const reset = React.useCallback(() => {
    if (animFrame) cancelAnimationFrame(animFrame);
    const pts = [];
    for (let i = 0; i < 20; i++) {
      let x = Math.random() * 2 - 1, y = Math.random() * 2 - 1;
      let label = x > y ? 1 : -1;
      if (Math.random() < 0.1) label = -label;
      pts.push({ x, y, label });
    }
    setPoints(pts);
    setWeights([Math.random()-0.5, Math.random()-0.5, Math.random()-0.5]);
    setBias(Math.random()-0.5);
    setTrained(false);
    setEpoch(0);
    setAccuracy(0);
    setTraining(false);
  }, [animFrame]);

  const s = {
    container: { background: '#0B1120', color: '#e2e8f0', fontFamily: 'monospace', padding: '16px', borderRadius: '8px', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' },
    header: { fontSize: '16px', fontWeight: 'bold', color: '#00e5ff', marginBottom: '12px' },
    row: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
    canvas: { borderRadius: '4px', border: '1px solid #0f172a', cursor: training ? 'wait' : 'crosshair' },
    panel: { flex: 1, minWidth: '200px' },
    label: { color: '#8899bb', fontSize: '12px', marginBottom: '4px' },
    value: { color: '#e2e8f0', fontSize: '14px', marginBottom: '8px' },
    btn: { background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(148, 163, 184, 0.08)', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', margin: '4px' },
    btnActive: { background: '#00e5ff', color: '#0B1120', border: '1px solid #00e5ff', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', margin: '4px' },
    badge: { display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', margin: '2px' },
    help: { color: '#556688', fontSize: '11px', marginTop: '8px' },
  };

  return (
    <div style={s.container}>
      <div style={s.header}>Perceptron Learning Demo</div>
      <div style={s.row}>
        <div>
          <canvas ref={canvasRef} width={400} height={400} style={s.canvas} onClick={handleCanvasClick} />
          <div style={s.help}>Click canvas to add points</div>
        </div>
        <div style={s.panel}>
          <div style={s.label}>Next point color</div>
          <div style={{ marginBottom: '8px' }}>
            <button style={nextLabel === 1 ? {...s.btnActive, background: '#ff4081', borderColor: '#ff4081'} : s.btn}
              onClick={() => setNextLabel(1)}>Red (+1)</button>
            <button style={nextLabel === -1 ? {...s.btnActive, background: '#00e5ff', borderColor: '#00e5ff'} : s.btn}
              onClick={() => setNextLabel(-1)}>Blue (-1)</button>
          </div>
          <div style={s.label}>Weights</div>
          <div style={s.value}>w₁ = {weights[0].toFixed(3)} &nbsp; w₂ = {weights[1].toFixed(3)}</div>
          <div style={s.label}>Bias</div>
          <div style={s.value}>b = {bias.toFixed(3)}</div>
          <div style={s.label}>Training</div>
          <div style={s.value}>Epoch: {epoch} &nbsp; Accuracy: {(accuracy * 100).toFixed(1)}%</div>
          <div style={s.label}>Points</div>
          <div style={s.value}>
            <span style={{...s.badge, background: 'rgba(255,64,129,0.2)', color: '#ff4081'}}>
              Red: {points.filter(p => p.label === 1).length}
            </span>
            <span style={{...s.badge, background: 'rgba(0,229,255,0.2)', color: '#00e5ff', marginLeft: '6px'}}>
              Blue: {points.filter(p => p.label === -1).length}
            </span>
          </div>
          <div style={{ marginTop: '12px' }}>
            <button style={s.btn} onClick={trainStep} disabled={training || points.length === 0}>
              {training ? 'Training...' : 'Train'}
            </button>
            <button style={s.btn} onClick={reset}>Reset</button>
          </div>
        </div>
      </div>
    </div>
  );
}
