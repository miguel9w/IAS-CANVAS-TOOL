function Widget({ appBus }) {
  const canvasRef = React.useRef(null);
  const histCanvasRef = React.useRef(null);
  const [temperature, setTemperature] = React.useState(300);
  const [numParticles, setNumParticles] = React.useState(80);
  const [running, setRunning] = React.useState(true);
  const [resetKey, setResetKey] = React.useState(0);
  const particlesRef = React.useRef(null);
  const animRef = React.useRef(null);

  const containerW = 1;
  const containerH = 1;
  const wallMargin = 0.05;

  function initParticles() {
    const particles = [];
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: wallMargin + Math.random() * (containerW - 2 * wallMargin),
        y: wallMargin + Math.random() * (containerH - 2 * wallMargin),
        vx: (Math.random() - 0.5) * 0.005,
        vy: (Math.random() - 0.5) * 0.005,
        radius: 2 + Math.random() * 2,
        hue: 190 + Math.random() * 140,
      });
    }
    return particles;
  }

  React.useEffect(() => {
    particlesRef.current = initParticles();
  }, [resetKey, numParticles]);

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

      const kBT = temperature / 300;
      const dt = 0.5;

      // Update positions (brownian-ish motion)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        // Random force proportional to temperature
        p.vx += (Math.random() - 0.5) * 0.002 * kBT;
        p.vy += (Math.random() - 0.5) * 0.002 * kBT;

        // Damping
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Temperature scaling on velocity magnitude
        const speedScale = Math.sqrt(kBT);
        const clampSpeed = 0.008 * speedScale;
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > clampSpeed) {
          p.vx = (p.vx / speed) * clampSpeed;
          p.vy = (p.vy / speed) * clampSpeed;
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Wall collisions
        if (p.x < wallMargin) { p.x = wallMargin; p.vx = Math.abs(p.vx) * 0.9; }
        if (p.x > containerW - wallMargin) { p.x = containerW - wallMargin; p.vx = -Math.abs(p.vx) * 0.9; }
        if (p.y < wallMargin) { p.y = wallMargin; p.vy = Math.abs(p.vy) * 0.9; }
        if (p.y > containerH - wallMargin) { p.y = containerH - wallMargin; p.vy = -Math.abs(p.vy) * 0.9; }
      }

      const canvas = canvasRef.current;
      const hCanvas = histCanvasRef.current;
      if (!canvas || !hCanvas) return;
      const ctx = canvas.getContext('2d');
      const hctx = hCanvas.getContext('2d');
      const W = canvas.width;
      const H = canvas.height;
      const hW = hCanvas.width;
      const hH = hCanvas.height;

      // Draw main canvas
      ctx.clearRect(0, 0, W, H);
      const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.6);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#0B1120');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      const margin = 40;
      const drawW = W - 2 * margin;
      const drawH = H - 2 * margin;

      // Container
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(margin, margin, drawW, drawH);

      // glow on container
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 8;
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.05)';
      ctx.lineWidth = 1;
      ctx.strokeRect(margin, margin, drawW, drawH);
      ctx.shadowBlur = 0;

      // Particles
      for (const p of particles) {
        const sx = margin + p.x * drawW;
        const sy = margin + p.y * drawH;
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const brightness = Math.min(1, speed * 200);
        const alpha = 0.4 + brightness * 0.6;

        ctx.shadowColor = `hsl(${p.hue}, 80%, 60%)`;
        ctx.shadowBlur = 4 + brightness * 10;
        ctx.beginPath();
        ctx.arc(sx, sy, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, ${50 + brightness * 30}%, ${alpha})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Info overlay
      ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Particles: ${particles.length} · T: ${temperature}K`, 10, 16);
      ctx.fillText(`kB T ∝ v̄²`, 10, 32);

      // Speed histogram
      const speeds = particles.map(p => Math.sqrt(p.vx * p.vx + p.vy * p.vy));
      const maxSpeed = Math.max(...speeds, 0.001);
      const bins = 20;

      hctx.clearRect(0, 0, hW, hH);
      const hGrad = hctx.createLinearGradient(0, 0, 0, hH);
      hGrad.addColorStop(0, '#0a0f1e');
      hGrad.addColorStop(1, '#0f172a');
      hctx.fillStyle = hGrad;
      hctx.fillRect(0, 0, hW, hH);

      const hPad = 30;
      const hDrawW = hW - 2 * hPad;
      const hDrawH = hH - 2 * hPad;

      const histogram = new Array(bins).fill(0);
      for (const s of speeds) {
        const idx = Math.min(bins - 1, Math.floor((s / (maxSpeed * 1.1)) * bins));
        histogram[idx]++;
      }
      const maxCount = Math.max(...histogram, 1);

      // Draw histogram
      const barW = hDrawW / bins;
      for (let i = 0; i < bins; i++) {
        const barH = (histogram[i] / maxCount) * hDrawH;
        const bx = hPad + i * barW;
        const by = hH - hPad - barH;
        const hue = 190 + (i / bins) * 140;
        hctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.7)`;
        hctx.fillRect(bx + 1, by, barW - 2, barH);
      }

      // Maxwell-Boltzmann fit curve
      const a = 2 / (maxSpeed * 1.1);
      hctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
      hctx.lineWidth = 1.5;
      hctx.beginPath();
      for (let i = 0; i < hDrawW; i++) {
        const v = (i / hDrawW) * maxSpeed * 1.1;
        const mb = a * a * a * v * v * Math.exp(-(v * v) / (2 * a * a));
        const my = hH - hPad - (mb / (0.5)) * hDrawH;
        if (i === 0) hctx.moveTo(hPad + i, my);
        else hctx.lineTo(hPad + i, my);
      }
      hctx.stroke();

      hctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
      hctx.font = '9px monospace';
      hctx.textAlign = 'left';
      hctx.fillText('Speed Distribution', hPad + 4, hPad + 10);
      hctx.fillText('Maxwell-Boltzmann fit', hPad + 4, hPad + 22);
    }, 30);

    return () => clearInterval(animRef.current);
  }, [running, temperature, numParticles]);

  const containerStyle = {
    background: 'linear-gradient(135deg, #0B1120 0%, #111827 100%)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid rgba(34, 211, 238, 0.15)',
    boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
  };

  const labelStyle = { color: '#94a3b8', fontFamily: 'monospace', fontSize: '11px', marginBottom: '2px' };
  const valueStyle = { color: '#fbbf24', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '13px' };

  return React.createElement('div', { style: containerStyle },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px', flexWrap: 'wrap' } },
      React.createElement('span', { style: { color: '#fbbf24', fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold' } },
        '🟤 Brownian Motion'),
      React.createElement('button', {
        onClick: () => setRunning(!running),
        style: {
          background: running ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255,255,255,0.03)',
          color: running ? '#fbbf24' : '#64748b',
          border: `1px solid ${running ? 'rgba(251, 191, 36, 0.3)' : 'rgba(255,255,255,0.08)'}`,
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
    React.createElement('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap' } },
      React.createElement('div', { style: { flex: '2', minWidth: '300px' } },
        React.createElement('canvas', {
          ref: canvasRef,
          width: 500,
          height: 420,
          style: { width: '100%', height: 'auto', borderRadius: '8px', display: 'block', background: '#0B1120', border: '1px solid rgba(255,255,255,0.04)' },
        }),
      ),
      React.createElement('div', { style: { flex: '1', minWidth: '200px' } },
        React.createElement('canvas', {
          ref: histCanvasRef,
          width: 300,
          height: 420,
          style: { width: '100%', height: 'auto', borderRadius: '8px', display: 'block', background: '#0B1120', border: '1px solid rgba(255,255,255,0.04)' },
        }),
      ),
    ),
    React.createElement('div', { style: { marginTop: '14px', display: 'flex', gap: '12px', flexWrap: 'wrap' } },
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 2, minWidth: '150px' } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between' } },
          React.createElement('span', { style: labelStyle }, 'Temperature'),
          React.createElement('span', { style: valueStyle }, `${temperature} K`),
        ),
        React.createElement('input', {
          type: 'range', min: 50, max: 800, step: 10, value: temperature,
          onChange: (e) => setTemperature(parseInt(e.target.value)),
          style: { width: '100%', accentColor: '#fbbf24', height: '3px' },
        }),
      ),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: '100px' } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between' } },
          React.createElement('span', { style: labelStyle }, 'Particles'),
          React.createElement('span', { style: valueStyle }, numParticles),
        ),
        React.createElement('input', {
          type: 'range', min: 20, max: 200, step: 5, value: numParticles,
          onChange: (e) => setNumParticles(parseInt(e.target.value)),
          style: { width: '100%', accentColor: '#22d3ee', height: '3px' },
        }),
      ),
    ),
  );
}
