function Widget({ appBus }) {
  const [hiddenSize, setHiddenSize] = React.useState(4);
  const [params, setParams] = React.useState(null);
  const [epoch, setEpoch] = React.useState(0);
  const [loss, setLoss] = React.useState(1);
  const [lossHistory, setLossHistory] = React.useState([]);
  const [training, setTraining] = React.useState(false);
  const [trained, setTrained] = React.useState(false);
  const [accuracy, setAccuracy] = React.useState(0);
  const animRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const lossCanvasRef = React.useRef(null);

  const xorData = [
    { x: 0, y: 0, label: 0 },
    { x: 1, y: 0, label: 1 },
    { x: 0, y: 1, label: 1 },
    { x: 1, y: 1, label: 0 },
  ];

  const initParams = React.useCallback(() => {
    const scale = Math.sqrt(2 / hiddenSize);
    const p = {
      w1: Array.from({length: 2}, () => Array.from({length: hiddenSize}, () => (Math.random() * 2 - 1) * scale)),
      b1: Array.from({length: hiddenSize}, () => 0),
      w2: Array.from({length: hiddenSize}, () => (Math.random() * 2 - 1) * Math.sqrt(2 / hiddenSize)),
      b2: 0,
    };
    return p;
  }, [hiddenSize]);

  const sigmoid = React.useCallback(x => 1 / (1 + Math.exp(-x)), []);
  const sigmoidGrad = React.useCallback(x => x * (1 - x), []);

  const forward = React.useCallback((x, y, p) => {
    const hidden = [];
    const hiddenRaw = [];
    for (let i = 0; i < hiddenSize; i++) {
      const z = x * p.w1[0][i] + y * p.w1[1][i] + p.b1[i];
      hiddenRaw.push(z);
      hidden.push(sigmoid(z));
    }
    let out = p.b2;
    for (let i = 0; i < hiddenSize; i++) {
      out += hidden[i] * p.w2[i];
    }
    const output = sigmoid(out);
    return { hidden, hiddenRaw, output };
  }, [hiddenSize, sigmoid]);

  const trainEpoch = React.useCallback((p) => {
    const newP = {
      w1: p.w1.map(r => [...r]),
      b1: [...p.b1],
      w2: [...p.w2],
      b2: p.b2,
    };
    let totalLoss = 0;
    const lr = 1.5;

    for (const data of xorData) {
      const { hidden, hiddenRaw, output } = forward(data.x, data.y, newP);
      const target = data.label;
      const error = output - target;
      totalLoss += error * error;

      const dOutput = error * sigmoidGrad(output);
      newP.b2 -= lr * dOutput;
      for (let i = 0; i < hiddenSize; i++) {
        newP.w2[i] -= lr * dOutput * hidden[i];
      }

      const dHidden = [];
      for (let i = 0; i < hiddenSize; i++) {
        dHidden[i] = dOutput * newP.w2[i] * sigmoidGrad(hidden[i]);
        newP.b1[i] -= lr * dHidden[i];
        newP.w1[0][i] -= lr * dHidden[i] * data.x;
        newP.w1[1][i] -= lr * dHidden[i] * data.y;
      }
    }
    totalLoss /= xorData.length;
    return { params: newP, loss: totalLoss };
  }, [hiddenSize, forward, sigmoidGrad]);

  const computeAccuracy = React.useCallback((p) => {
    let correct = 0;
    for (const d of xorData) {
      const { output } = forward(d.x, d.y, p);
      const pred = output >= 0.5 ? 1 : 0;
      if (pred === d.label) correct++;
    }
    return correct / xorData.length;
  }, [xorData, forward]);

  const startTraining = React.useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const p = initParams();
    setParams(p);
    setEpoch(0);
    setLoss(1);
    setLossHistory([]);
    setTraining(true);
    setTrained(false);
    let ep = 0;
    let hist = [];

    const step = () => {
      if (ep >= 500) {
        setTraining(false);
        setTrained(true);
        setAccuracy(computeAccuracy(p));
        return;
      }
      const result = trainEpoch(p);
      p.w1 = result.params.w1;
      p.b1 = result.params.b1;
      p.w2 = result.params.w2;
      p.b2 = result.params.b2;
      ep++;
      hist.push(result.loss);
      if (hist.length > 200) hist = hist.slice(-200);

      setEpoch(ep);
      setLoss(result.loss);
      setLossHistory([...hist]);

      if (ep % 2 === 0 || result.loss < 0.01) {
        animRef.current = requestAnimationFrame(step);
      } else {
        animRef.current = requestAnimationFrame(step);
      }
    };
    animRef.current = requestAnimationFrame(step);
  }, [hiddenSize, initParams, trainEpoch, computeAccuracy]);

  React.useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = 380;
    const H = canvas.height = 380;
    const pad = 35;
    const plotW = W - pad * 2;
    const plotH = H - pad * 2;

    ctx.fillStyle = '#0B1120';
    ctx.fillRect(0, 0, W, H);

    const toScreen = (x, y) => [pad + x / 1.2 * plotW, pad + (1 - y / 1.2) * plotH];

    if (params) {
      const res = 3;
      for (let gx = 0; gx < plotW; gx += res) {
        for (let gy = 0; gy < plotH; gy += res) {
          const x = (gx / plotW) * 1.2;
          const y = 1 - (gy / plotH) * 1.2;
          const { output } = forward(x, y, params);
          const [sx, sy] = toScreen(x, y);
          const intensity = Math.max(0, Math.min(1, output));
          ctx.fillStyle = `rgba(255,64,129,${intensity * 0.4})`;
          if (output < 0.5) {
            ctx.fillStyle = `rgba(0,229,255,${(1 - intensity) * 0.4})`;
          }
          ctx.fillRect(sx, sy, res, res);
        }
      }

      const mid = 0.5;
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      const stepSize = 0.02;
      let first = true;
      for (let t = 0; t <= 1.2; t += stepSize) {
        const { output } = forward(t, 0.5 / 1.2 * t + 0.3, params);
        if (Math.abs(output - mid) < 0.05) {
          const [sx, sy] = toScreen(t, 0.5/1.2*t + 0.3);
          if (first) { ctx.moveTo(sx, sy); first = false; }
          else ctx.lineTo(sx, sy);
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    for (const d of xorData) {
      const [sx, sy] = toScreen(d.x * 1.0, d.y * 1.0);
      ctx.beginPath();
      ctx.arc(sx, sy, 12, 0, Math.PI * 2);
      ctx.fillStyle = d.label === 0 ? '#00e5ff' : '#ff4081';
      ctx.fill();
      ctx.strokeStyle = d.label === 0 ? '#4dd0ff' : '#ff6f9c';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#0B1120';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`(${d.x},${d.y})`, sx, sy + 4);
    }

    ctx.fillStyle = '#556688';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('XOR Decision Boundary', 8, 14);
  }, [params, hiddenSize, forward]);

  React.useEffect(() => {
    const canvas = lossCanvasRef.current;
    if (!canvas || lossHistory.length === 0) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = 380;
    const H = canvas.height = 120;

    ctx.fillStyle = '#0B1120';
    ctx.fillRect(0, 0, W, H);

    const pad = 8;
    const plotW = W - pad * 2;
    const plotH = H - pad * 2;
    const maxLoss = Math.max(...lossHistory, 1);

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(pad, pad); ctx.lineTo(pad, H - pad);
    ctx.moveTo(pad, H - pad); ctx.lineTo(W - pad, H - pad);
    ctx.stroke();

    ctx.beginPath();
    for (let i = 0; i < lossHistory.length; i++) {
      const x = pad + (i / Math.max(lossHistory.length - 1, 1)) * plotW;
      const y = (H - pad) - (lossHistory[i] / maxLoss) * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#8899bb';
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Loss: ${loss.toFixed(4)}`, pad + 2, pad + 10);
    ctx.textAlign = 'right';
    ctx.fillText(`Epoch: ${epoch}`, W - pad - 2, pad + 10);
  }, [lossHistory, loss, epoch]);

  const reset = React.useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setParams(null);
    setEpoch(0);
    setLoss(1);
    setLossHistory([]);
    setTraining(false);
    setTrained(false);
    setAccuracy(0);
  }, []);

  const s = {
    container: { background: '#0B1120', color: '#e2e8f0', fontFamily: 'monospace', padding: '16px', borderRadius: '8px', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' },
    header: { fontSize: '16px', fontWeight: 'bold', color: '#00e5ff', marginBottom: '12px' },
    row: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
    canvas: { borderRadius: '4px', border: '1px solid #0f172a' },
    panel: { flex: 1, minWidth: '160px' },
    label: { color: '#8899bb', fontSize: '11px', marginBottom: '4px' },
    value: { color: '#e2e8f0', fontSize: '13px', marginBottom: '6px' },
    btn: { background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(148, 163, 184, 0.08)', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', margin: '3px' },
    slider: { width: '120px', accentColor: '#00e5ff' },
  };

  return (
    <div style={s.container}>
      <div style={s.header}>XOR Problem — 2-Layer Neural Network</div>
      <div style={s.row}>
        <div>
          <canvas ref={canvasRef} width={380} height={380} style={s.canvas} />
          <canvas ref={lossCanvasRef} width={380} height={120} style={{...s.canvas, marginTop: '6px'}} />
        </div>
        <div style={s.panel}>
          <div style={s.label}>Hidden layer size</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <input type="range" min={2} max={16} value={hiddenSize}
              onChange={e => { if (!training) setHiddenSize(Number(e.target.value)); }}
              style={s.slider} />
            <span style={{color:'#00e5ff', fontWeight:'bold', fontSize:'16px'}}>{hiddenSize}</span>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <button style={s.btn} onClick={startTraining} disabled={training}>Train</button>
            <button style={s.btn} onClick={reset}>Reset</button>
          </div>
          <div style={s.label}>Epoch</div>
          <div style={{...s.value, fontSize:'18px', fontWeight:'bold', color:'#00e5ff'}}>{epoch}</div>
          <div style={s.label}>Loss</div>
          <div style={{...s.value, color: loss < 0.1 ? '#76ff03' : (loss < 0.3 ? '#ffeb3b' : '#ff4081')}}>
            {loss.toFixed(6)}
          </div>
          <div style={s.label}>Accuracy</div>
          <div style={{...s.value, color: accuracy >= 1 ? '#76ff03' : '#e2e8f0', fontSize:'16px', fontWeight:'bold'}}>
            {trained ? `${(accuracy * 100).toFixed(0)}%` : '-'}
          </div>
          <div style={s.label}>Status</div>
          <div style={{...s.value, color: training ? '#ffeb3b' : (trained ? '#76ff03' : '#8899bb')}}>
            {training ? 'Training...' : (trained ? 'Trained ✓' : 'Ready')}
          </div>
          <div style={{color:'#556688', fontSize:'10px', marginTop:'8px'}}>
            XOR: 4 corner points.<br/>
            Network learns non-linear decision boundary.<br/>
            Loss chart shown below the boundary plot.
          </div>
        </div>
      </div>
    </div>
  );
}
