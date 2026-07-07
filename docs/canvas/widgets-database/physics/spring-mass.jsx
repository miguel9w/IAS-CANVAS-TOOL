function Widget({ appBus }) {
  const animCanvasRef = React.useRef(null);
  const graphCanvasRef = React.useRef(null);
  const [mass, setMass] = React.useState(1);
  const [springK, setSpringK] = React.useState(5);
  const [damping, setDamping] = React.useState(0.3);
  const [running, setRunning] = React.useState(false);
  const [resetKey, setResetKey] = React.useState(0);
  const stateRef = React.useRef(null);
  const historyRef = React.useRef([]);
  const animRef = React.useRef(null);

  function initSim() {
    return { x: 100, v: 0 };
  }

  React.useEffect(() => {
    stateRef.current = initSim();
    historyRef.current = [];
  }, [resetKey, mass, springK, damping]);

  React.useEffect(() => {
    if (!running) {
      if (animRef.current) clearInterval(animRef.current);
      return;
    }

    animRef.current = setInterval(() => {
      const dt = 0.008;
      const s = stateRef.current;
      if (!s) return;

      const k = springK * 0.5;
      const c = damping * 2;
      const m = mass * 2;

      // RK4
      const f = (x, v) => (-k * x - c * v) / m;
      const k1v = f(s.x, s.v);
      const k1x = s.v;
      const k2v = f(s.x + 0.5 * dt * k1x, s.v + 0.5 * dt * k1v);
      const k2x = s.v + 0.5 * dt * k1v;
      const k3v = f(s.x + 0.5 * dt * k2x, s.v + 0.5 * dt * k2v);
      const k3x = s.v + 0.5 * dt * k2v;
      const k4v = f(s.x + dt * k3x, s.v + dt * k3v);
      const k4x = s.v + dt * k3v;

      const newX = s.x + (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
      const newV = s.v + (dt / 6) * (k1v + 2 * k2v + 2 * k3v + k4v);
      stateRef.current = { x: newX, v: newV };

      historyRef.current.push({ x: newX, t: Date.now() });
      if (historyRef.current.length > 400) historyRef.current.shift();

      // draw animation
      const ac = animCanvasRef.current;
      const gc = graphCanvasRef.current;
      if (!ac || !gc) return;

      // -- Animation canvas --
      const actx = ac.getContext('2d');
      const AW = ac.width;
      const AH = ac.height;
      actx.clearRect(0, 0, AW, AH);

      const grad = actx.createLinearGradient(0, 0, 0, AH);
      grad.addColorStop(0, '#0a0f1e');
      grad.addColorStop(1, '#0f172a');
      actx.fillStyle = grad;
      actx.fillRect(0, 0, AW, AH);

      const cx = AW * 0.3;
      const cy = AH / 2;
      const wallX = 40;
      const disp = newX * 1.5;
      const massX = cx + Math.max(disp, -cx + 60);

      // wall
      actx.fillStyle = '#334155';
      actx.fillRect(wallX - 4, cy - 60, 8, 120);
      actx.fillStyle = '#475569';
      actx.fillRect(wallX - 2, cy - 50, 4, 100);

      // spring coils
      const coils = 12;
      const springStart = wallX + 6;
      const springEnd = massX - 20;
      const springLen = springEnd - springStart;
      const coilAmp = 16;
      actx.strokeStyle = '#22d3ee';
      actx.lineWidth = 2;
      actx.beginPath();
      actx.moveTo(springStart, cy);
      for (let i = 0; i <= coils * 2; i++) {
        const t = i / (coils * 2);
        const sx = springStart + springLen * t;
        const sy = cy + Math.sin(t * Math.PI * coils * 2) * coilAmp * (1 - Math.abs(newX) / 150);
        if (i === 0) actx.moveTo(sx, sy);
        else actx.lineTo(sx, sy);
      }
      actx.stroke();

      // glow on spring
      actx.shadowColor = '#22d3ee';
      actx.shadowBlur = 10;
      actx.strokeStyle = 'rgba(34, 211, 238, 0.15)';
      actx.lineWidth = 4;
      actx.stroke();
      actx.shadowBlur = 0;

      // mass block
      const mSize = 30 + mass * 8;
      const gradM = actx.createLinearGradient(massX - mSize / 2, cy - mSize / 2, massX + mSize / 2, cy + mSize / 2);
      gradM.addColorStop(0, '#2dd4bf');
      gradM.addColorStop(1, '#0d9488');
      actx.fillStyle = gradM;
      const bx = massX - mSize / 2;
      const by = cy - mSize / 2;
      actx.shadowColor = '#2dd4bf';
      actx.shadowBlur = 15;
      actx.beginPath();
      actx.roundRect(bx, by, mSize, mSize, 4);
      actx.fill();
      actx.shadowBlur = 0;
      actx.strokeStyle = 'rgba(45, 212, 191, 0.4)';
      actx.lineWidth = 1;
      actx.beginPath();
      actx.roundRect(bx, by, mSize, mSize, 4);
      actx.stroke();

      // mass label
      actx.fillStyle = 'rgba(255,255,255,0.8)';
      actx.font = '10px monospace';
      actx.textAlign = 'center';
      actx.fillText(`${mass.toFixed(1)} kg`, massX, cy + 4);

      // floor
      actx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      actx.lineWidth = 1;
      actx.setLineDash([4, 4]);
      actx.beginPath();
      actx.moveTo(wallX, cy + 55);
      actx.lineTo(AW - 20, cy + 55);
      actx.stroke();
      actx.setLineDash([]);

      // track
      actx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
      actx.lineWidth = 1;
      actx.beginPath();
      actx.moveTo(wallX, cy + 53);
      actx.lineTo(AW - 20, cy + 53);
      actx.stroke();

      // info
      actx.fillStyle = '#475569';
      actx.font = '11px monospace';
      actx.textAlign = 'left';
      actx.fillText(`x = ${newX.toFixed(2)} m`, 10, 20);
      actx.fillText(`v = ${newV.toFixed(2)} m/s`, 10, 38);

      // equilibrium marker
      actx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
      actx.setLineDash([3, 6]);
      actx.beginPath();
      actx.moveTo(cx, cy - 40);
      actx.lineTo(cx, cy + 40);
      actx.stroke();
      actx.setLineDash([]);

      // direction arrow
      if (Math.abs(newV) > 0.5) {
        actx.fillStyle = newV > 0 ? 'rgba(34, 211, 238, 0.4)' : 'rgba(244, 114, 182, 0.4)';
        const arrowX = newV > 0 ? massX + mSize / 2 + 10 : massX - mSize / 2 - 10;
        actx.beginPath();
        actx.moveTo(arrowX + (newV > 0 ? 8 : -8), cy);
        actx.lineTo(arrowX, cy - 5);
        actx.lineTo(arrowX, cy + 5);
        actx.closePath();
        actx.fill();
      }

      // -- Graph canvas --
      const gctx = gc.getContext('2d');
      const GW = gc.width;
      const GH = gc.height;
      gctx.clearRect(0, 0, GW, GH);

      const gradG = gctx.createLinearGradient(0, 0, 0, GH);
      gradG.addColorStop(0, '#0a0f1e');
      gradG.addColorStop(1, '#0f172a');
      gctx.fillStyle = gradG;
      gctx.fillRect(0, 0, GW, GH);

      const gPad = 20;
      const gW = GW - 2 * gPad;
      const gH = GH - 2 * gPad;
      const gMidY = gPad + gH / 2;

      // grid
      gctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
      gctx.lineWidth = 0.5;
      for (let i = 0; i <= 4; i++) {
        const gy = gPad + (i / 4) * gH;
        gctx.beginPath();
        gctx.moveTo(gPad, gy);
        gctx.lineTo(GW - gPad, gy);
        gctx.stroke();
      }

      // zero line
      gctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      gctx.lineWidth = 1;
      gctx.beginPath();
      gctx.moveTo(gPad, gMidY);
      gctx.lineTo(GW - gPad, gMidY);
      gctx.stroke();

      // label
      gctx.fillStyle = '#64748b';
      gctx.font = '10px monospace';
      gctx.textAlign = 'left';
      gctx.fillText('Position vs Time', gPad + 4, gPad + 12);

      // plot
      const hist = historyRef.current;
      if (hist.length > 1) {
        const xMin = Math.min(...hist.map(h => h.x));
        const xMax = Math.max(...hist.map(h => h.x));
        const xRange = Math.max(Math.abs(xMax - xMin), 10);
        const xScale = gH / xRange * 0.8;

        gctx.beginPath();
        for (let i = 0; i < hist.length; i++) {
          const gx = gPad + gW - (hist.length - i) * (gW / 400);
          const gy = gMidY - hist[i].x * xScale;
          if (i === 0) gctx.moveTo(gx, gy);
          else gctx.lineTo(gx, gy);
        }
        gctx.strokeStyle = '#22d3ee';
        gctx.lineWidth = 1.5;
        gctx.stroke();

        // glow
        gctx.shadowColor = '#22d3ee';
        gctx.shadowBlur = 8;
        gctx.strokeStyle = 'rgba(34, 211, 238, 0.2)';
        gctx.lineWidth = 3;
        gctx.stroke();
        gctx.shadowBlur = 0;
      }

      // energy bar
      const ke = 0.5 * mass * 2 * newV * newV;
      const pe = 0.5 * springK * 0.5 * newX * newX;
      const total = Math.max(ke + pe, 0.01);
      const keFrac = ke / total;
      const peFrac = pe / total;
      const barW = 120;
      const barH = 8;
      const barX = GW - gPad - barW;
      const barY = gPad + 4;

      gctx.fillStyle = 'rgba(255,255,255,0.05)';
      gctx.beginPath();
      gctx.roundRect(barX, barY, barW, barH, 4);
      gctx.fill();

      if (keFrac > 0) {
        gctx.fillStyle = '#f472b6';
        gctx.beginPath();
        gctx.roundRect(barX, barY, barW * keFrac, barH, 4);
        gctx.fill();
      }
      if (peFrac > 0) {
        gctx.fillStyle = '#2dd4bf';
        gctx.beginPath();
        gctx.roundRect(barX + barW * keFrac, barY, barW * peFrac, barH, 4);
        gctx.fill();
      }
      gctx.fillStyle = '#64748b';
      gctx.font = '9px monospace';
      gctx.textAlign = 'right';
      gctx.fillText('KE  PE', GW - gPad - 4, barY - 4);
    }, 16);

    return () => clearInterval(animRef.current);
  }, [running, mass, springK, damping]);

  const containerStyle = {
    background: 'linear-gradient(135deg, #0B1120 0%, #111827 100%)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid rgba(45, 212, 191, 0.15)',
    boxShadow: '0 0 40px rgba(45, 212, 191, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
  };

  const labelStyle = { color: '#94a3b8', fontFamily: 'monospace', fontSize: '11px', marginBottom: '2px' };
  const valueStyle = { color: '#2dd4bf', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '13px' };

  function sliderGroup(label, value, setter, min, max, step, color) {
    return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: '80px' } },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between' } },
        React.createElement('span', { style: labelStyle }, label),
        React.createElement('span', { style: { ...valueStyle, color } }, value),
      ),
      React.createElement('input', {
        type: 'range',
        min,
        max,
        step: step || 0.1,
        value,
        onChange: (e) => setter(parseFloat(e.target.value)),
        style: { width: '100%', accentColor: color || '#2dd4bf', height: '3px' },
      }),
    );
  }

  return React.createElement('div', { style: containerStyle },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px', flexWrap: 'wrap' } },
      React.createElement('span', { style: { color: '#2dd4bf', fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold' } },
        '🔧 Spring-Mass System'),
      React.createElement('button', {
        onClick: () => setRunning(!running),
        style: {
          background: running ? 'rgba(45, 212, 191, 0.15)' : 'rgba(45, 212, 191, 0.05)',
          color: running ? '#2dd4bf' : '#64748b',
          border: `1px solid ${running ? 'rgba(45, 212, 191, 0.3)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: '6px',
          padding: '8px 20px',
          cursor: 'pointer',
          fontFamily: 'monospace',
          fontSize: '12px',
        },
      }, running ? '⏸ PAUSE' : '▶ START'),
      React.createElement('button', {
        onClick: () => { setRunning(false); setResetKey(k => k + 1); },
        style: {
          background: 'rgba(255,255,255,0.03)',
          color: '#64748b',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '6px',
          padding: '8px 20px',
          cursor: 'pointer',
          fontFamily: 'monospace',
          fontSize: '12px',
        },
      }, '↺ RESET'),
    ),
    React.createElement('canvas', {
      ref: animCanvasRef,
      width: 700,
      height: 180,
      style: { width: '100%', height: 'auto', borderRadius: '8px 8px 0 0', display: 'block', background: '#0a0f1e', border: '1px solid rgba(255,255,255,0.04)' },
    }),
    React.createElement('canvas', {
      ref: graphCanvasRef,
      width: 700,
      height: 160,
      style: { width: '100%', height: 'auto', borderRadius: '0 0 8px 8px', display: 'block', background: '#0a0f1e', borderLeft: '1px solid rgba(255,255,255,0.04)', borderRight: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' },
    }),
    React.createElement('div', { style: { marginTop: '14px', display: 'flex', gap: '12px', flexWrap: 'wrap' } },
      sliderGroup('Mass', mass.toFixed(1), setMass, 0.1, 5, 0.1, '#2dd4bf'),
      sliderGroup('Spring k', springK.toFixed(1), setSpringK, 0.5, 15, 0.1, '#22d3ee'),
      sliderGroup('Damping', damping.toFixed(2), setDamping, 0, 2, 0.01, '#f472b6'),
    ),
  );
}
