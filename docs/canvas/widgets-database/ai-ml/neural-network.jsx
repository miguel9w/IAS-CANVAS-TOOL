function Widget({ appBus }) {
  const [hiddenCount, setHiddenCount] = React.useState(6);
  const [inputs, setInputs] = React.useState([1, 0, 1]);
  const [animating, setAnimating] = React.useState(false);
  const [activeLayer, setActiveLayer] = React.useState(-1);
  const [signalIntensity, setSignalIntensity] = React.useState(0);
  const canvasRef = React.useRef(null);
  const animRef = React.useRef(null);

  const inputLabels = ['X₁', 'X₂', 'Bias'];
  const outputLabels = ['Y₁', 'Y₂'];

  const weights = React.useMemo(() => {
    const w = [];
    for (let i = 0; i < 3; i++) {
      w[i] = [];
      for (let j = 0; j < hiddenCount; j++) {
        w[i][j] = Math.random() * 2 - 1;
      }
    }
    w[1] = [];
    for (let i = 0; i < hiddenCount; i++) {
      w[1][i] = [];
      for (let j = 0; j < 2; j++) {
        w[1][i][j] = Math.random() * 2 - 1;
      }
    }
    return w;
  }, [hiddenCount]);

  const forwardPass = React.useCallback(() => {
    const hidden = [];
    for (let j = 0; j < hiddenCount; j++) {
      let sum = 0;
      for (let i = 0; i < 3; i++) {
        sum += inputs[i] * weights[0][i][j];
      }
      hidden[j] = Math.tanh(sum);
    }
    const output = [];
    for (let j = 0; j < 2; j++) {
      let sum = 0;
      for (let i = 0; i < hiddenCount; i++) {
        sum += hidden[i] * weights[1][i][j];
      }
      output[j] = Math.tanh(sum);
    }
    return { hidden, output };
  }, [hiddenCount, inputs, weights]);

  const animateForward = React.useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setAnimating(true);
    setActiveLayer(0);
    setSignalIntensity(0);
    let step = 0;
    const totalSteps = 60;
    const run = () => {
      step++;
      const progress = step / totalSteps;
      if (progress < 0.33) {
        setActiveLayer(0);
        setSignalIntensity(progress / 0.33);
      } else if (progress < 0.66) {
        setActiveLayer(1);
        setSignalIntensity((progress - 0.33) / 0.33);
      } else if (progress < 1) {
        setActiveLayer(2);
        setSignalIntensity((progress - 0.66) / 0.34);
      } else {
        setActiveLayer(2);
        setSignalIntensity(1);
        setAnimating(false);
        return;
      }
      animRef.current = requestAnimationFrame(run);
    };
    run();
  }, []);

  React.useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = 500;
    const H = canvas.height = 360;
    const pad = { left: 80, right: 80, top: 50, bottom: 50 };
    const layerX = [pad.left, W / 2, W - pad.right];

    const result = forwardPass();

    ctx.fillStyle = '#0B1120';
    ctx.fillRect(0, 0, W, H);

    ctx.font = '11px monospace';
    ctx.textAlign = 'center';

    const drawLayerNodes = (x, count, labels, activations, layerIdx) => {
      const spacing = Math.min(50, (H - pad.top - pad.bottom) / (count + 1));
      const startY = (H - spacing * (count - 1)) / 2;
      const isActive = activeLayer === layerIdx || (layerIdx < activeLayer);

      for (let i = 0; i < count; i++) {
        const y = startY + i * spacing;
        const radius = layerIdx === 1 ? 18 : 14;
        const activation = activations ? activations[i] : 0;

        let glow = 0;
        if (isActive && layerIdx === activeLayer) {
          glow = Math.abs(activation) * signalIntensity;
        } else if (activeLayer > layerIdx) {
          glow = Math.abs(activation) * 0.3;
        }

        if (glow > 0.05) {
          const grad = ctx.createRadialGradient(x, y, 0, x, y, radius + glow * 20);
          const hue = activation >= 0 ? 190 : 340;
          grad.addColorStop(0, `hsla(${hue}, 100%, 70%, ${glow * 0.4})`);
          grad.addColorStop(1, `hsla(${hue}, 100%, 70%, 0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, radius + glow * 20, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        const baseColor = activation >= 0 ? '#00e5ff' : '#ff4081';
        const alpha = isActive ? Math.max(0.4, Math.min(1, 0.4 + glow * 0.6)) : 0.3;
        ctx.fillStyle = isActive ? baseColor : '#0f172a';
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = isActive ? baseColor : 'rgba(148, 163, 184, 0.08)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (labels && i < labels.length) {
          ctx.fillStyle = isActive ? '#8899bb' : '#3a4a5a';
          ctx.textAlign = layerIdx === 0 ? 'right' : (layerIdx === 2 ? 'left' : 'center');
          const lx = layerIdx === 0 ? x - radius - 8 : (layerIdx === 2 ? x + radius + 8 : x);
          ctx.fillText(labels[i], lx, y + 4);
        } else if (layerIdx === 1) {
          ctx.fillStyle = isActive ? 'rgba(136,153,187,0.6)' : 'rgba(58,74,90,0.6)';
          ctx.textAlign = 'center';
          ctx.fillText((activation || 0).toFixed(2), x, y + 4);
        }
      }
      return { startY, spacing };
    };

    const inputSpacing = drawLayerNodes(layerX[0], 3, inputLabels, inputs, 0);
    const hiddenPositions = drawLayerNodes(layerX[1], hiddenCount, null, result.hidden, 1);
    const outputSpacing = drawLayerNodes(layerX[2], 2, outputLabels, result.output, 2);

    const drawEdges = (fromX, fromY, fromCount, fromSpacing, toX, toY, toCount, toSpacing, useColors = false, weightMatrix = null, fromLayer = 0) => {
      for (let i = 0; i < fromCount; i++) {
        for (let j = 0; j < toCount; j++) {
          const y1 = fromY + i * fromSpacing;
          const y2 = toY + j * toSpacing;
          const w = weightMatrix ? (weightMatrix[i] ? weightMatrix[i][j] || 0 : 0) : (Math.random() - 0.5);

          let alpha = 0.05;
          if (activeLayer === fromLayer) {
            const act = inputs[i] || 0;
            alpha = Math.max(0.05, Math.abs(act) * signalIntensity * 0.25);
          } else if (activeLayer > fromLayer) {
            alpha = 0.1;
          }

          ctx.beginPath();
          ctx.moveTo(fromX, y1);
          ctx.lineTo(toX, y2);
          ctx.strokeStyle = w > 0 ? `rgba(0,229,255,${alpha})` : `rgba(255,64,129,${alpha})`;
          ctx.lineWidth = Math.max(0.5, Math.abs(w) * 2);
          ctx.stroke();
        }
      }
    };

    const inputStartY = inputSpacing.startY;
    const hiddenStartY = hiddenPositions.startY;
    const outputStartY = outputSpacing.startY;

    drawEdges(layerX[0], inputStartY, 3, inputSpacing.spacing, layerX[1], hiddenStartY, hiddenCount, hiddenPositions.spacing, true, null, 0);
    drawEdges(layerX[1], hiddenStartY, hiddenCount, hiddenPositions.spacing, layerX[2], outputStartY, 2, outputSpacing.spacing, true, null, 1);

    ctx.fillStyle = '#8899bb';
    ctx.textAlign = 'center';
    ctx.font = '11px monospace';
    ctx.fillText('Input', layerX[0], 22);
    ctx.fillText('Hidden', layerX[1], 22);
    ctx.fillText('Output', layerX[2], 22);

    ctx.fillStyle = '#00e5ff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Y₁ = ${result.output[0].toFixed(3)}`, W - 10, 110);
    ctx.fillText(`Y₂ = ${result.output[1].toFixed(3)}`, W - 10, 130);
  }, [hiddenCount, inputs, forwardPass, activeLayer, signalIntensity]);

  const toggleInput = React.useCallback((idx) => {
    setInputs(prev => {
      const next = [...prev];
      next[idx] = next[idx] ? 0 : 1;
      return next;
    });
  }, []);

  const s = {
    container: { background: '#0B1120', color: '#e2e8f0', fontFamily: 'monospace', padding: '16px', borderRadius: '8px', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' },
    header: { fontSize: '16px', fontWeight: 'bold', color: '#00e5ff', marginBottom: '12px' },
    controls: { display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' },
    canvas: { borderRadius: '4px', border: '1px solid #0f172a', display: 'block' },
    btn: { background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(148, 163, 184, 0.08)', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' },
    btnOn: { background: '#00e5ff', color: '#0B1120', border: '1px solid #00e5ff', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' },
    label: { color: '#8899bb', fontSize: '11px' },
    slider: { width: '100px', accentColor: '#00e5ff' },
  };

  return (
    <div style={s.container}>
      <div style={s.header}>Neural Network Visualizer</div>
      <div style={s.controls}>
        <span style={s.label}>Inputs:</span>
        <button style={inputs[0] ? s.btnOn : s.btn} onClick={() => toggleInput(0)}>X₁</button>
        <button style={inputs[1] ? s.btnOn : s.btn} onClick={() => toggleInput(1)}>X₂</button>
        <button style={inputs[2] ? s.btnOn : s.btn} onClick={() => toggleInput(2)}>Bias</button>
        <span style={{...s.label, marginLeft: '12px'}}>Hidden neurons:</span>
        <input type="range" min={2} max={16} value={hiddenCount}
          onChange={e => setHiddenCount(Number(e.target.value))}
          style={s.slider} />
        <span style={{color:'#e2e8f0',fontSize:'12px'}}>{hiddenCount}</span>
        <button style={s.btn} onClick={animateForward} disabled={animating}>
          {animating ? 'Animating...' : 'Forward Pass'}
        </button>
      </div>
      <canvas ref={canvasRef} width={500} height={360} style={s.canvas} />
    </div>
  );
}
