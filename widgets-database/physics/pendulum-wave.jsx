function Widget({ appBus }) {
  const canvasRef = React.useRef(null);
  const [running, setRunning] = React.useState(true);
  const [resetKey, setResetKey] = React.useState(0);
  const stateRef = React.useRef(null);
  const animRef = React.useRef(null);
  const NUM = 15;
  const pendColors = [];

  for (let i = 0; i < NUM; i++) {
    const hue = 190 + (i / NUM) * 140;
    pendColors.push(`hsl(${hue}, 80%, 60%)`);
  }

  function initPendulums() {
    const pends = [];
    for (let i = 0; i < NUM; i++) {
      const length = 60 + i * 8;
      pends.push({
        length,
        theta: Math.PI * 0.5,
        omega: 0,
      });
    }
    return pends;
  }

  React.useEffect(() => {
    stateRef.current = initPendulums();
  }, [resetKey]);

  React.useEffect(() => {
    if (!running) {
      if (animRef.current) clearInterval(animRef.current);
      return;
    }

    const g = 3;

    animRef.current = setInterval(() => {
      const pends = stateRef.current;
      if (!pends) return;
      const dt = 0.03;

      // Verlet-ish integration
      for (let i = 0; i < NUM; i++) {
        const p = pends[i];
        const alpha = -(g / p.length) * Math.sin(p.theta);
        p.omega += alpha * dt;
        p.theta += p.omega * dt;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#0a0f1e');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // title
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Pendulum Wave — 15 Coupled Oscillators', W / 2, 20);

      const pivotY = 60;
      const spacing = (W - 40) / (NUM - 1);

      // Draw wave connecting pendulum bobs
      ctx.beginPath();
      for (let i = 0; i < NUM; i++) {
        const px = 20 + i * spacing;
        const p = pends[i];
        const bx = px + p.length * Math.sin(p.theta);
        const by = pivotY + p.length * Math.cos(p.theta);
        if (i === 0) ctx.moveTo(bx, by);
        else ctx.lineTo(bx, by);
      }
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.15)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.05)';
      ctx.lineWidth = 8;
      ctx.stroke();

      // Draw each pendulum
      for (let i = 0; i < NUM; i++) {
        const px = 20 + i * spacing;
        const p = pends[i];
        const bx = px + p.length * Math.sin(p.theta);
        const by = pivotY + p.length * Math.cos(p.theta);

        // rod
        ctx.strokeStyle = pendColors[i] + '44';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(px, pivotY);
        ctx.lineTo(bx, by);
        ctx.stroke();

        // glow
        ctx.shadowColor = pendColors[i];
        ctx.shadowBlur = 12;
        const gradB = ctx.createRadialGradient(bx - 3, by - 3, 0, bx, by, 6);
        gradB.addColorStop(0, pendColors[i]);
        gradB.addColorStop(1, pendColors[i] + '40');
        ctx.beginPath();
        ctx.arc(bx, by, 5, 0, Math.PI * 2);
        ctx.fillStyle = gradB;
        ctx.fill();
        ctx.shadowBlur = 0;

        // pivot dot
        ctx.beginPath();
        ctx.arc(px, pivotY, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
        ctx.fill();
      }

      // bottom labels
      ctx.fillStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('shorter — faster', 60, H - 12);
      ctx.fillText('longer — slower', W - 60, H - 12);

      // wave visualization below
      const yStart = H * 0.6;
      const yEnd = H - 30;
      const waveH = yEnd - yStart;

      ctx.fillStyle = 'rgba(148, 163, 184, 0.05)';
      ctx.fillRect(20, yStart, W - 40, waveH);

      const energyScale = 0.03;
      ctx.beginPath();
      for (let i = 0; i < NUM; i++) {
        const p = pends[i];
        const x = 20 + i * spacing;
        const displacement = p.theta * energyScale * waveH * 10;
        const y = yStart + waveH / 2 + displacement;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
      ctx.font = '9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('angular displacement', 24, yStart + 12);
    }, 16);

    return () => clearInterval(animRef.current);
  }, [running]);

  const containerStyle = {
    background: 'linear-gradient(135deg, #0B1120 0%, #111827 100%)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid rgba(34, 211, 238, 0.15)',
    boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
  };

  const btnStyle = (active) => ({
    background: active ? 'rgba(34, 211, 238, 0.15)' : 'rgba(255,255,255,0.03)',
    color: active ? '#22d3ee' : '#64748b',
    border: `1px solid ${active ? 'rgba(34, 211, 238, 0.3)' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: '6px',
    padding: '8px 20px',
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: '12px',
  });

  return React.createElement('div', { style: containerStyle },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' } },
      React.createElement('span', { style: { color: '#22d3ee', fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold' } },
        '〰 Pendulum Wave'),
      React.createElement('button', { onClick: () => setRunning(!running), style: btnStyle(running) },
        running ? '⏸ PAUSE' : '▶ PLAY'),
      React.createElement('button', {
        onClick: () => { setRunning(false); setResetKey(k => k + 1); setTimeout(() => setRunning(true), 50); },
        style: { ...btnStyle(false), border: '1px solid rgba(255,255,255,0.08)' },
      }, '↺ RESET'),
    ),
    React.createElement('canvas', {
      ref: canvasRef,
      width: 700,
      height: 380,
      style: { width: '100%', height: 'auto', borderRadius: '8px', display: 'block', background: '#0B1120', border: '1px solid rgba(255,255,255,0.04)' },
    }),
    React.createElement('div', { style: { marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '20px', color: '#64748b', fontFamily: 'monospace', fontSize: '10px' } },
      React.createElement('span', null, `${NUM} pendulums · increasing length · released simultaneously`),
    ),
  );
}
