function Widget({ appBus }) {
  const canvasRef = React.useRef(null);
  const [P, setP] = React.useState(1.0); // atm
  const [V, setV] = React.useState(22.4); // L
  const [T, setT] = React.useState(273); // K
  const [running, setRunning] = React.useState(true);
  const [resetKey, setResetKey] = React.useState(0);
  const particlesRef = React.useRef(null);
  const animRef = React.useRef(null);
  const [pistonY, setPistonY] = React.useState(0.6);

  const n = 1; // moles

  React.useEffect(() => {
    // PV = nRT relationship
    const R = 0.082057;
    const computedV = (n * R * T) / P;
    // Only adjust V if we're not in manual mode — just display the relationship
    const vFrac = Math.min(0.85, Math.max(0.2, V / 80));
    setPistonY(1 - vFrac);
  }, [P, V, T]);

  function initParticles() {
    const count = 40;
    const particles = [];
    const pY = 1 - Math.min(0.85, Math.max(0.2, V / 80));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: 0.1 + Math.random() * 0.8,
        y: 0.05 + Math.random() * (pY - 0.1),
        vx: (Math.random() - 0.5) * 0.004,
        vy: (Math.random() - 0.5) * 0.004,
      });
    }
    return particles;
  }

  React.useEffect(() => {
    particlesRef.current = initParticles();
  }, [resetKey, V]);

  React.useEffect(() => {
    if (!particlesRef.current) {
      particlesRef.current = initParticles();
    }
  }, []);

  React.useEffect(() => {
    if (!running) {
      if (animRef.current) clearInterval(animRef.current);
      return;
    }

    animRef.current = setInterval(() => {
      const particles = particlesRef.current;
      if (!particles) return;

      const pY = pistonY;
      const speedScale = Math.sqrt(T / 273);
      const dt = 0.4;

      for (const p of particles) {
        p.vx += (Math.random() - 0.5) * 0.0015 * speedScale;
        p.vy += (Math.random() - 0.5) * 0.0015 * speedScale;

        // Damping
        p.vx *= 0.98;
        p.vy *= 0.98;

        const maxSpeed = 0.01 * speedScale;
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > maxSpeed) {
          p.vx = (p.vx / speed) * maxSpeed;
          p.vy = (p.vy / speed) * maxSpeed;
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Walls
        if (p.x < 0.05) { p.x = 0.05; p.vx = Math.abs(p.vx) * 0.9; }
        if (p.x > 0.95) { p.x = 0.95; p.vx = -Math.abs(p.vx) * 0.9; }
        if (p.y < 0.03) { p.y = 0.03; p.vy = Math.abs(p.vy) * 0.9; }
        if (p.y > pY - 0.03) { p.y = pY - 0.03; p.vy = -Math.abs(p.vy) * 0.9; }

        // Pressure from particle-wall collisions (visual: bounce speed proportional to P)
        if (Math.abs(p.x - 0.05) < 0.01 || Math.abs(p.x - 0.95) < 0.01) {
          p.vx *= Math.min(1.3, 0.8 + P * 0.2);
        }
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

      const margin = 50;
      const chamberW = W - 2 * margin;
      const chamberH = H - 2 * margin;
      const pistonPos = margin + pY * chamberH;

      // Chamber background (filled area)
      ctx.fillStyle = 'rgba(34, 211, 238, 0.03)';
      ctx.fillRect(margin, margin, chamberW, pistonPos - margin);

      // Pressure color overlay
      const intensity = Math.min(1, P / 5);
      ctx.fillStyle = `rgba(239, 68, 68, ${intensity * 0.05})`;
      ctx.fillRect(margin, margin, chamberW, pistonPos - margin);

      // Chamber walls
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(margin, margin, chamberW, chamberH);

      // Piston
      const gradPiston = ctx.createLinearGradient(0, pistonPos - 8, 0, pistonPos + 8);
      gradPiston.addColorStop(0, '#475569');
      gradPiston.addColorStop(0.5, '#64748b');
      gradPiston.addColorStop(1, '#334155');

      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 10;
      ctx.fillStyle = gradPiston;
      ctx.beginPath();
      ctx.roundRect(margin + 2, pistonPos - 6, chamberW - 4, 12, 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(margin + 2, pistonPos - 6, chamberW - 4, 12, 2);
      ctx.stroke();

      // Piston rod
      ctx.fillStyle = '#334155';
      ctx.fillRect(W / 2 - 4, pistonPos + 8, 8, margin - 20);
      ctx.fillStyle = '#475569';
      ctx.fillRect(W / 2 - 10, H - margin + 4, 20, 8);

      // Particles
      for (const p of particles) {
        const sx = margin + p.x * chamberW;
        const sy = margin + p.y * chamberH;
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const brightness = Math.min(1, spd * 200);
        const alpha = 0.3 + brightness * 0.7;

        ctx.shadowColor = `hsla(190, 80%, 60%, ${alpha * 0.5})`;
        ctx.shadowBlur = 3 + brightness * 6;
        ctx.beginPath();
        ctx.arc(sx, sy, 2.5 + brightness * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(190, 80%, ${55 + brightness * 25}%, ${alpha})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Pressure arrows on walls
      const numArrows = Math.floor(P * 3);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      for (let i = 0; i < Math.min(numArrows, 12); i++) {
        const ay = margin + ((i + 0.5) / 12) * (pistonPos - margin);
        // Left wall arrow
        ctx.beginPath();
        ctx.moveTo(margin + 12, ay);
        ctx.lineTo(margin + 6, ay - 3);
        ctx.lineTo(margin + 6, ay + 3);
        ctx.closePath();
        ctx.fill();
        // Right wall arrow
        ctx.beginPath();
        ctx.moveTo(margin + chamberW - 12, ay);
        ctx.lineTo(margin + chamberW - 6, ay - 3);
        ctx.lineTo(margin + chamberW - 6, ay + 3);
        ctx.closePath();
        ctx.fill();
      }

      // Labels
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';

      // Gas law display
      ctx.fillStyle = '#22d3ee';
      ctx.font = '12px monospace';
      ctx.fillText('Ideal Gas Law: PV = nRT', W / 2, 18);

      ctx.fillStyle = '#64748b';
      ctx.font = '11px monospace';
      ctx.fillText(`P = ${P.toFixed(2)} atm · V = ${V.toFixed(1)} L · T = ${T} K`, W / 2, 36);

      // nRT computation
      const R = 0.082057;
      const nRT = n * R * T;
      const pv = P * V;
      ctx.fillStyle = nRT > 0 ? '#34d399' : '#64748b';
      ctx.font = '10px monospace';
      ctx.fillText(`PV = ${pv.toFixed(3)}  |  nRT = ${nRT.toFixed(3)}  ${Math.abs(pv - nRT) < 0.5 ? '✓' : ''}`, W / 2, 54);

      // Volume indicator on piston
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.font = '9px monospace';
      ctx.fillText(`V = ${V.toFixed(1)} L`, W - margin - 8, pistonPos - 14);
    }, 25);

    return () => clearInterval(animRef.current);
  }, [running, P, V, T, pistonY]);

  const containerStyle = {
    background: 'linear-gradient(135deg, #0B1120 0%, #111827 100%)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid rgba(34, 211, 238, 0.15)',
    boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
  };

  const labelStyle = { color: '#94a3b8', fontFamily: 'monospace', fontSize: '11px', marginBottom: '2px' };
  const valueStyle = { fontWeight: 'bold', fontFamily: 'monospace', fontSize: '13px' };

  function sliderGroup(label, value, setter, min, max, step, color, display) {
    return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: '100px' } },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between' } },
        React.createElement('span', { style: labelStyle }, label),
        React.createElement('span', { style: { ...valueStyle, color } }, display || value),
      ),
      React.createElement('input', {
        type: 'range', min, max, step: step || 0.01, value,
        onChange: (e) => setter(parseFloat(e.target.value)),
        style: { width: '100%', accentColor: color || '#22d3ee', height: '3px' },
      }),
    );
  }

  return React.createElement('div', { style: containerStyle },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px', flexWrap: 'wrap' } },
      React.createElement('span', { style: { color: '#22d3ee', fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold' } },
        '🧪 Ideal Gas Law'),
      React.createElement('button', {
        onClick: () => setRunning(!running),
        style: {
          background: running ? 'rgba(34, 211, 238, 0.15)' : 'rgba(255,255,255,0.03)',
          color: running ? '#22d3ee' : '#64748b',
          border: `1px solid ${running ? 'rgba(34, 211, 238, 0.3)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: '6px',
          padding: '8px 20px',
          cursor: 'pointer',
          fontFamily: 'monospace',
          fontSize: '12px',
        },
      }, running ? '⏸ PAUSE' : '▶ PLAY'),
      React.createElement('button', {
        onClick: () => { setRunning(false); setResetKey(k => k + 1); setTimeout(() => setRunning(true), 50); },
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
      ref: canvasRef,
      width: 700,
      height: 420,
      style: { width: '100%', height: 'auto', borderRadius: '8px', display: 'block', background: '#0B1120', border: '1px solid rgba(255,255,255,0.04)' },
    }),
    React.createElement('div', { style: { marginTop: '14px', display: 'flex', gap: '12px', flexWrap: 'wrap' } },
      sliderGroup('Pressure (atm)', P, setP, 0.1, 5, 0.05, '#ef4444', `${P.toFixed(2)} atm`),
      sliderGroup('Volume (L)', V, setV, 2, 80, 0.5, '#22d3ee', `${V.toFixed(1)} L`),
      sliderGroup('Temperature (K)', T, setT, 50, 600, 5, '#fbbf24', `${T} K`),
    ),
    React.createElement('div', { style: { marginTop: '8px', display: 'flex', justifyContent: 'center', gap: '16px', color: '#64748b', fontFamily: 'monospace', fontSize: '10px' } },
      React.createElement('span', null, 'n = 1 mol · R = 0.08206 L·atm/(mol·K)'),
    ),
  );
}
