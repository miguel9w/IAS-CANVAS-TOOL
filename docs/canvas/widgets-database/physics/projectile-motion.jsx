function Widget({ appBus }) {
  const canvasRef = React.useRef(null);
  const [angle, setAngle] = React.useState(45);
  const [velocity, setVelocity] = React.useState(30);
  const [gravity, setGravity] = React.useState(9.81);
  const [launch, setLaunch] = React.useState(false);
  const animRef = React.useRef(null);
  const projRef = React.useRef(null);

  function calcTrajectory(theta, v0, g) {
    const rad = theta * Math.PI / 180;
    const vx = v0 * Math.cos(rad);
    const vy = v0 * Math.sin(rad);
    const tFlight = 2 * vy / g;
    const maxH = (vy * vy) / (2 * g);
    const range = vx * tFlight;
    const pts = [];
    const steps = 200;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * tFlight;
      const x = vx * t;
      const y = vy * t - 0.5 * g * t * t;
      pts.push({ x, y, t });
    }
    return { pts, tFlight, maxH, range, vx, vy };
  }

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const pad = 50;
    const drawW = W - 2 * pad;
    const drawH = H - 2 * pad;

    const { pts, tFlight, maxH, range } = calcTrajectory(angle, velocity, gravity);

    // scale to fit
    const scaleX = range > 0 ? drawW / (range * 1.15) : drawW;
    const scaleY = maxH > 0 ? drawH / (maxH * 1.35) : drawH;
    const originY = H - pad;

    function worldToScreen(wx, wy) {
      return { sx: pad + wx * scaleX, sy: originY - wy * scaleY };
    }

    ctx.clearRect(0, 0, W, H);
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#0a0f1e');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // grid
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
    ctx.lineWidth = 0.5;
    const gridSize = range > 0 ? range / 10 : 5;
    for (let gx = 0; gx <= range * 1.15; gx += gridSize) {
      const pos = worldToScreen(gx, 0);
      ctx.beginPath();
      ctx.moveTo(pos.sx, pad);
      ctx.lineTo(pos.sx, H - pad);
      ctx.stroke();
    }
    for (let gy = 0; gy <= maxH * 1.35; gy += maxH / 6 || 1) {
      const pos = worldToScreen(0, gy);
      ctx.beginPath();
      ctx.moveTo(pad, pos.sy);
      ctx.lineTo(W - pad, pos.sy);
      ctx.stroke();
    }

    // axes
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pad, pad);
    ctx.lineTo(pad, H - pad);
    ctx.lineTo(W - pad, H - pad);
    ctx.stroke();

    // axis labels
    ctx.fillStyle = '#64748b';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Range (m)', pad + drawW / 2, H - 12);
    ctx.save();
    ctx.translate(14, pad + drawH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Height (m)', 0, 0);
    ctx.restore();

    // trajectory line (full theoretical)
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const { sx, sy } = worldToScreen(pts[i].x, pts[i].y);
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    const gradTraj = ctx.createLinearGradient(0, 0, W, 0);
    gradTraj.addColorStop(0, '#22d3ee');
    gradTraj.addColorStop(0.5, '#2dd4bf');
    gradTraj.addColorStop(1, '#a78bfa');
    ctx.strokeStyle = gradTraj;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // glow
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.2)';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // fill under trajectory
    ctx.beginPath();
    ctx.moveTo(pad, H - pad);
    for (let i = 0; i < pts.length; i++) {
      const { sx, sy } = worldToScreen(pts[i].x, pts[i].y);
      ctx.lineTo(sx, sy);
    }
    ctx.lineTo(pad + range * scaleX, H - pad);
    ctx.closePath();
    ctx.fillStyle = 'rgba(34, 211, 238, 0.06)';
    ctx.fill();

    // projectile (animated position)
    if (projRef.current) {
      const { sx, sy } = worldToScreen(projRef.current.x, projRef.current.y);
      const gradBall = ctx.createRadialGradient(sx - 3, sy - 3, 0, sx, sy, 8);
      gradBall.addColorStop(0, '#fbbf24');
      gradBall.addColorStop(1, '#d97706');
      ctx.beginPath();
      ctx.arc(sx, sy, 6, 0, Math.PI * 2);
      ctx.fillStyle = gradBall;
      ctx.fill();
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(sx, sy, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(251, 191, 36, 0.8)';
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // labels
    ctx.fillStyle = '#475569';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`θ = ${angle}°`, pad + 8, pad + 18);
    ctx.fillText(`v₀ = ${velocity} m/s`, pad + 8, pad + 34);
    ctx.fillText(`g = ${gravity} m/s²`, pad + 8, pad + 50);

    ctx.fillStyle = '#22d3ee';
    ctx.fillText(`Range: ${range.toFixed(1)} m`, pad + 8, pad + 74);
    ctx.fillStyle = '#2dd4bf';
    ctx.fillText(`Max Height: ${maxH.toFixed(1)} m`, pad + 8, pad + 90);
    ctx.fillStyle = '#a78bfa';
    ctx.fillText(`Time of Flight: ${tFlight.toFixed(2)} s`, pad + 8, pad + 106);
  }, [angle, velocity, gravity, launch]);

  const { pts, tFlight } = calcTrajectory(angle, velocity, gravity);

  React.useEffect(() => {
    if (!launch) {
      projRef.current = null;
      if (animRef.current) clearInterval(animRef.current);
      return;
    }
    const startTime = Date.now();
    animRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const t = Math.min(elapsed, tFlight);
      const idx = Math.floor((t / tFlight) * pts.length);
      const p = pts[Math.min(idx, pts.length - 1)];
      projRef.current = { x: p.x, y: p.y };
      if (t >= tFlight) {
        setLaunch(false);
      }
    }, 16);
    return () => clearInterval(animRef.current);
  }, [launch, tFlight]);

  const containerStyle = {
    background: 'linear-gradient(135deg, #0B1120 0%, #111827 100%)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid rgba(34, 211, 238, 0.15)',
    boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
  };

  const labelStyle = { color: '#94a3b8', fontFamily: 'monospace', fontSize: '11px', marginBottom: '2px' };
  const valueStyle = { color: '#22d3ee', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '13px' };

  function sliderGroup(label, value, setter, min, max, step, color, unit) {
    return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: '80px' } },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between' } },
        React.createElement('span', { style: labelStyle }, label),
        React.createElement('span', { style: { ...valueStyle, color } }, `${value}${unit || ''}`),
      ),
      React.createElement('input', {
        type: 'range',
        min,
        max,
        step: step || 1,
        value,
        onChange: (e) => setter(parseFloat(e.target.value)),
        style: { width: '100%', accentColor: color || '#22d3ee', height: '3px' },
      }),
    );
  }

  return React.createElement('div', { style: containerStyle },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px', flexWrap: 'wrap' } },
      React.createElement('span', { style: { color: '#22d3ee', fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold' } },
        '🎯 Projectile Motion'),
      React.createElement('button', {
        onClick: () => setLaunch(true),
        style: {
          background: 'rgba(34, 211, 238, 0.15)',
          color: '#22d3ee',
          border: '1px solid rgba(34, 211, 238, 0.3)',
          borderRadius: '6px',
          padding: '8px 20px',
          cursor: 'pointer',
          fontFamily: 'monospace',
          fontSize: '12px',
        },
      }, '🚀 LAUNCH'),
      React.createElement('button', {
        onClick: () => { setLaunch(false); projRef.current = null; },
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
      height: 380,
      style: { width: '100%', height: 'auto', borderRadius: '8px', display: 'block', background: '#0a0f1e', border: '1px solid rgba(255,255,255,0.04)' },
    }),
    React.createElement('div', { style: { marginTop: '14px', display: 'flex', gap: '12px', flexWrap: 'wrap' } },
      sliderGroup('Angle', angle, setAngle, 1, 89, 1, '#22d3ee', '°'),
      sliderGroup('Velocity', velocity, setVelocity, 5, 60, 0.5, '#2dd4bf', ' m/s'),
      sliderGroup('Gravity', gravity, setGravity, 1, 30, 0.1, '#f472b6', ' m/s²'),
    ),
  );
}
