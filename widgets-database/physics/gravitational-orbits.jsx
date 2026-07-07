function Widget({ appBus }) {
  const canvasRef = React.useRef(null);
  const [running, setRunning] = React.useState(false);
  const [resetKey, setResetKey] = React.useState(0);
  const bodiesRef = React.useRef(null);
  const trailRef = React.useRef([]);
  const animRef = React.useRef(null);

  const [masses, setMasses] = React.useState([1, 0.5, 0.3, 0.2]);
  const bodyColors = ['#22d3ee', '#f472b6', '#fbbf24', '#34d399', '#a78bfa'];

  function initBodies() {
    const G = 2;
    const bodies = [
      { x: 0.5, y: 0.45, vx: 0, vy: 0, m: masses[0] },
      { x: 0.35, y: 0.5, vx: 0, vy: -0.5, m: masses[1] },
      { x: 0.65, y: 0.5, vx: 0, vy: 0.45, m: masses[2] },
      { x: 0.5, y: 0.68, vx: 0.5, vy: 0, m: masses[3] },
    ];
    return bodies;
  }

  React.useEffect(() => {
    const bodies = initBodies();
    bodiesRef.current = bodies;
    trailRef.current = bodies.map(() => []);
  }, [resetKey]);

  // Re-init when masses change and not running
  React.useEffect(() => {
    if (!running) {
      const bodies = initBodies();
      bodiesRef.current = bodies;
      trailRef.current = bodies.map(() => []);
    }
  }, [masses]);

  // Leapfrog integration
  function simulate(dt) {
    const bodies = bodiesRef.current;
    if (!bodies || bodies.length < 2) return;

    const n = bodies.length;
    const G = 2;

    // Kick: half step velocity
    for (let i = 0; i < n; i++) {
      let ax = 0, ay = 0;
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const dx = bodies[j].x - bodies[i].x;
        const dy = bodies[j].y - bodies[i].y;
        const r2 = dx * dx + dy * dy;
        if (r2 < 0.0001) continue;
        const r = Math.sqrt(r2);
        const f = G * bodies[j].m / (r2 * r);
        ax += f * dx;
        ay += f * dy;
      }
      bodies[i].vx += 0.5 * dt * ax / bodies[i].m;
      bodies[i].vy += 0.5 * dt * ay / bodies[i].m;
    }

    // Drift: full step position
    for (let i = 0; i < n; i++) {
      bodies[i].x += dt * bodies[i].vx;
      bodies[i].y += dt * bodies[i].vy;
      // soft boundary
      if (bodies[i].x < 0.02 || bodies[i].x > 0.98) bodies[i].vx *= -0.5;
      if (bodies[i].y < 0.02 || bodies[i].y > 0.98) bodies[i].vy *= -0.5;
      bodies[i].x = Math.max(0.02, Math.min(0.98, bodies[i].x));
      bodies[i].y = Math.max(0.02, Math.min(0.98, bodies[i].y));
    }

    // Kick: remaining half step velocity
    for (let i = 0; i < n; i++) {
      let ax = 0, ay = 0;
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const dx = bodies[j].x - bodies[i].x;
        const dy = bodies[j].y - bodies[i].y;
        const r2 = dx * dx + dy * dy;
        if (r2 < 0.0001) continue;
        const r = Math.sqrt(r2);
        const f = G * bodies[j].m / (r2 * r);
        ax += f * dx;
        ay += f * dy;
      }
      bodies[i].vx += 0.5 * dt * ax / bodies[i].m;
      bodies[i].vy += 0.5 * dt * ay / bodies[i].m;
    }

    // Record trails (downsample)
    for (let i = 0; i < n; i++) {
      const trail = trailRef.current[i];
      if (trail) {
        trail.push({ x: bodies[i].x, y: bodies[i].y });
        if (trail.length > 300) trail.shift();
      }
    }
  }

  React.useEffect(() => {
    if (!running) {
      if (animRef.current) clearInterval(animRef.current);
      return;
    }

    animRef.current = setInterval(() => {
      if (!bodiesRef.current) return;
      for (let step = 0; step < 3; step++) {
        simulate(0.008);
      }

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);
      const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.7);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#0B1120');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // grid dots
      ctx.fillStyle = 'rgba(148, 163, 184, 0.03)';
      for (let gx = 0; gx < W; gx += 40) {
        for (let gy = 0; gy < H; gy += 40) {
          ctx.beginPath();
          ctx.arc(gx, gy, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw trails
      const trails = trailRef.current;
      for (let bi = 0; bi < trails.length && bi < bodyColors.length; bi++) {
        const trail = trails[bi];
        if (trail.length < 2) continue;
        for (let i = 1; i < trail.length; i++) {
          const alpha = i / trail.length;
          ctx.strokeStyle = bodyColors[bi] + Math.floor(alpha * 180).toString(16).padStart(2, '0');
          ctx.lineWidth = 1.2 * alpha;
          ctx.beginPath();
          ctx.moveTo(trail[i - 1].x * W, trail[i - 1].y * H);
          ctx.lineTo(trail[i].x * W, trail[i].y * H);
          ctx.stroke();
        }
      }

      // Draw bodies
      const bodies = bodiesRef.current;
      for (let bi = 0; bi < bodies.length && bi < bodyColors.length; bi++) {
        const b = bodies[bi];
        const bx = b.x * W;
        const by = b.y * H;
        const radius = 6 + b.m * 8;

        ctx.shadowColor = bodyColors[bi];
        ctx.shadowBlur = 20;
        const gradB = ctx.createRadialGradient(bx - radius * 0.3, by - radius * 0.3, 0, bx, by, radius);
        gradB.addColorStop(0, bodyColors[bi]);
        gradB.addColorStop(1, bodyColors[bi] + '80');
        ctx.beginPath();
        ctx.arc(bx, by, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradB;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = bodyColors[bi] + '44';
        ctx.lineWidth = 1;
        ctx.stroke();

        // small label (mass)
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.m.toFixed(1), bx, by + 1);
      }

      // energy readout
      let ke = 0, pe = 0;
      for (let i = 0; i < bodies.length; i++) {
        ke += 0.5 * bodies[i].m * (bodies[i].vx * bodies[i].vx + bodies[i].vy * bodies[i].vy);
        for (let j = i + 1; j < bodies.length; j++) {
          const dx = bodies[j].x - bodies[i].x;
          const dy = bodies[j].y - bodies[i].y;
          const r = Math.sqrt(dx * dx + dy * dy);
          if (r > 0.001) pe -= 2 * bodies[i].m * bodies[j].m / r;
        }
      }
      ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`KE: ${ke.toFixed(2)}  PE: ${pe.toFixed(2)}  E: ${(ke + pe).toFixed(2)}`, 10, 10);
    }, 16);

    return () => clearInterval(animRef.current);
  }, [running, masses]);

  function setMass(index, value) {
    const newMasses = [...masses];
    newMasses[index] = value;
    setMasses(newMasses);
  }

  const containerStyle = {
    background: 'linear-gradient(135deg, #0B1120 0%, #111827 100%)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid rgba(34, 211, 238, 0.15)',
    boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
  };

  const labelStyle = { color: '#94a3b8', fontFamily: 'monospace', fontSize: '10px', marginBottom: '1px' };
  const valueStyle = { fontWeight: 'bold', fontFamily: 'monospace', fontSize: '12px' };

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
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px', flexWrap: 'wrap' } },
      React.createElement('span', { style: { color: '#22d3ee', fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold' } },
        '🌌 Gravitational Orbits'),
      React.createElement('button', { onClick: () => setRunning(!running), style: btnStyle(running) },
        running ? '⏸ STOP' : '▶ START'),
      React.createElement('button', {
        onClick: () => { setRunning(false); setResetKey(k => k + 1); },
        style: { ...btnStyle(false), border: '1px solid rgba(255,255,255,0.08)' },
      }, '↺ RESET'),
    ),
    React.createElement('canvas', {
      ref: canvasRef,
      width: 700,
      height: 440,
      style: { width: '100%', height: 'auto', borderRadius: '8px', display: 'block', background: '#0B1120', border: '1px solid rgba(255,255,255,0.04)' },
    }),
    React.createElement('div', { style: { marginTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' } },
      masses.map((m, i) =>
        React.createElement('div', { key: i, style: { display: 'flex', flexDirection: 'column', gap: '1px', flex: 1, minWidth: '70px' } },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between' } },
            React.createElement('span', { style: { ...labelStyle, color: bodyColors[i] } }, `Body ${i + 1} M`),
            React.createElement('span', { style: { ...valueStyle, color: bodyColors[i] } }, m.toFixed(1)),
          ),
          React.createElement('input', {
            type: 'range',
            min: 0.1,
            max: 3,
            step: 0.05,
            value: m,
            onChange: (e) => setMass(i, parseFloat(e.target.value)),
            style: { width: '100%', accentColor: bodyColors[i], height: '3px' },
          }),
        )
      ),
    ),
  );
}
