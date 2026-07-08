function Widget({ appBus }) {
  const canvasRef = React.useRef(null);
  const trailCanvasRef = React.useRef(null);
  const [running, setRunning] = React.useState(false);
  const [resetKey, setResetKey] = React.useState(0);
  const stateRef = React.useRef(null);
  const animRef = React.useRef(null);
  const trailRef = React.useRef([]);

  // params
  const [m1, setM1] = React.useState(2);
  const [m2, setM2] = React.useState(1.5);
  const [l1, setL1] = React.useState(150);
  const [l2, setL2] = React.useState(120);
  const [g, setG] = React.useState(9.81);

  const gScale = g / 400;

  function initState() {
    return {
      theta1: Math.PI * 0.75 + (Math.random() - 0.5) * 0.05,
      theta2: Math.PI * 0.75 + (Math.random() - 0.5) * 0.05,
      omega1: 0,
      omega2: 0,
    };
  }

  function derivatives(s) {
    const { theta1, theta2, omega1, omega2 } = s;
    const delta = theta2 - theta1;
    const den1 = (2 * m1 + m2 - m2 * Math.cos(2 * delta));
    const a1 = (-gScale * (2 * m1 + m2) * Math.sin(theta1) - m2 * gScale * Math.sin(theta1 - 2 * theta2) - 2 * Math.sin(delta) * m2 * (omega2 * omega2 * l2 + omega1 * omega1 * l1 * Math.cos(delta))) / (l1 * den1);
    const den2 = (2 * m1 + m2 - m2 * Math.cos(2 * delta));
    const a2 = (2 * Math.sin(delta) * (omega1 * omega1 * l1 * (m1 + m2) + gScale * (m1 + m2) * Math.cos(theta1) + omega2 * omega2 * l2 * m2 * Math.cos(delta))) / (l2 * den2);
    return { dtheta1: omega1, dtheta2: omega2, domega1: a1, domega2: a2 };
  }

  function rk4Step(s, dt) {
    const k1 = derivatives(s);
    const s2 = {
      theta1: s.theta1 + 0.5 * dt * k1.dtheta1,
      theta2: s.theta2 + 0.5 * dt * k1.dtheta2,
      omega1: s.omega1 + 0.5 * dt * k1.domega1,
      omega2: s.omega2 + 0.5 * dt * k1.domega2,
    };
    const k2 = derivatives(s2);
    const s3 = {
      theta1: s.theta1 + 0.5 * dt * k2.dtheta1,
      theta2: s.theta2 + 0.5 * dt * k2.dtheta2,
      omega1: s.omega1 + 0.5 * dt * k2.domega1,
      omega2: s.omega2 + 0.5 * dt * k2.domega2,
    };
    const k3 = derivatives(s3);
    const s4 = {
      theta1: s.theta1 + dt * k3.dtheta1,
      theta2: s.theta2 + dt * k3.dtheta2,
      omega1: s.omega1 + dt * k3.domega1,
      omega2: s.omega2 + dt * k3.domega2,
    };
    const k4 = derivatives(s4);
    return {
      theta1: s.theta1 + (dt / 6) * (k1.dtheta1 + 2 * k2.dtheta1 + 2 * k3.dtheta1 + k4.dtheta1),
      theta2: s.theta2 + (dt / 6) * (k1.dtheta2 + 2 * k2.dtheta2 + 2 * k3.dtheta2 + k4.dtheta2),
      omega1: s.omega1 + (dt / 6) * (k1.domega1 + 2 * k2.domega1 + 2 * k3.domega1 + k4.domega1),
      omega2: s.omega2 + (dt / 6) * (k1.domega2 + 2 * k2.domega2 + 2 * k3.domega2 + k4.domega2),
    };
  }

  React.useEffect(() => {
    stateRef.current = initState();
    trailRef.current = [];
    const tCanvas = trailCanvasRef.current;
    if (tCanvas) {
      const tctx = tCanvas.getContext('2d');
      tctx.clearRect(0, 0, tCanvas.width, tCanvas.height);
    }
  }, [resetKey]);

  React.useEffect(() => {
    if (!running) {
      if (animRef.current) clearInterval(animRef.current);
      return;
    }

    let hue = 180;
    animRef.current = setInterval(() => {
      if (!stateRef.current) return;
      const dt = 0.02;
      stateRef.current = rk4Step(stateRef.current, dt);

      const canvas = canvasRef.current;
      const tCanvas = trailCanvasRef.current;
      if (!canvas || !tCanvas) return;
      const ctx = canvas.getContext('2d');
      const tctx = tCanvas.getContext('2d');
      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H * 0.35;

      const s = stateRef.current;

      const x1 = cx + l1 * Math.sin(s.theta1);
      const y1 = cy + l1 * Math.cos(s.theta1);
      const x2 = x1 + l2 * Math.sin(s.theta2);
      const y2 = y1 + l2 * Math.cos(s.theta2);

      // trail
      tctx.globalAlpha = 0.02;
      tctx.fillStyle = '#0B1120';
      tctx.fillRect(0, 0, W, H);
      tctx.globalAlpha = 1;

      trailRef.current.push({ x: x2, y: y2 });
      if (trailRef.current.length > 800) trailRef.current.shift();

      for (let i = 1; i < trailRef.current.length; i++) {
        const alpha = i / trailRef.current.length;
        const h = (hue + i * 0.3) % 360;
        tctx.strokeStyle = `hsla(${h}, 80%, 60%, ${alpha * 0.6})`;
        tctx.lineWidth = 1.5 * alpha;
        tctx.beginPath();
        tctx.moveTo(trailRef.current[i - 1].x, trailRef.current[i - 1].y);
        tctx.lineTo(trailRef.current[i].x, trailRef.current[i].y);
        tctx.stroke();
      }

      // clear main canvas
      ctx.clearRect(0, 0, W, H);

      // draw background
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.6);
      grad.addColorStop(0, '#111827');
      grad.addColorStop(1, '#0B1120');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // draw trail onto main canvas
      ctx.drawImage(tCanvas, 0, 0);

      // pivot
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#475569';
      ctx.fill();

      // rod 1
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x1, y1);
      ctx.stroke();

      // mass 1
      const grad1 = ctx.createRadialGradient(x1 - 4, y1 - 4, 0, x1, y1, m1 * 4);
      grad1.addColorStop(0, '#2dd4bf');
      grad1.addColorStop(1, '#0d9488');
      ctx.beginPath();
      ctx.arc(x1, y1, m1 * 4, 0, Math.PI * 2);
      ctx.fillStyle = grad1;
      ctx.fill();
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // rod 2
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // mass 2
      const grad2 = ctx.createRadialGradient(x2 - 4, y2 - 4, 0, x2, y2, m2 * 4);
      grad2.addColorStop(0, '#f472b6');
      grad2.addColorStop(1, '#be185d');
      ctx.beginPath();
      ctx.arc(x2, y2, m2 * 4, 0, Math.PI * 2);
      ctx.fillStyle = grad2;
      ctx.fill();
      ctx.strokeStyle = 'rgba(244, 114, 182, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // glow effects
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(x1, y1, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(34, 211, 238, 0.6)';
      ctx.fill();
      ctx.shadowColor = '#ec4899';
      ctx.beginPath();
      ctx.arc(x2, y2, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(236, 72, 153, 0.6)';
      ctx.fill();
      ctx.shadowBlur = 0;

      hue = (hue + 0.15) % 360;
    }, 16);

    return () => clearInterval(animRef.current);
  }, [running, m1, m2, l1, l2, g, gScale]);

  function reset() {
    setRunning(false);
    setResetKey(k => k + 1);
  }

  const containerStyle = {
    background: 'linear-gradient(135deg, #0B1120 0%, #111827 100%)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid rgba(244, 114, 182, 0.15)',
    boxShadow: '0 0 40px rgba(244, 114, 182, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
  };

  const labelStyle = { color: '#94a3b8', fontFamily: 'monospace', fontSize: '11px', marginBottom: '2px' };
  const valueStyle = { color: '#f472b6', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '13px' };

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
        style: { width: '100%', accentColor: color || '#f472b6', height: '3px' },
      }),
    );
  }

  const btnStyle = (active) => ({
    background: active ? 'rgba(244, 114, 182, 0.15)' : 'rgba(244, 114, 182, 0.05)',
    color: active ? '#f472b6' : '#64748b',
    border: `1px solid ${active ? 'rgba(244, 114, 182, 0.3)' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: '6px',
    padding: '8px 20px',
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: '12px',
    transition: 'all 0.2s',
  });

  return React.createElement('div', { style: containerStyle },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px', flexWrap: 'wrap' } },
      React.createElement('span', { style: { color: '#f472b6', fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold' } },
        '⚡ Double Pendulum'),
      React.createElement('button', { onClick: () => setRunning(!running), style: btnStyle(running) },
        running ? '⏸ STOP' : '▶ PLAY'),
      React.createElement('button', { onClick: reset, style: { ...btnStyle(false), border: '1px solid rgba(255,255,255,0.08)' } },
        '↺ RESET'),
    ),
    React.createElement('div', { style: { position: 'relative', overflow: 'hidden', borderRadius: '8px' } },
      React.createElement('canvas', {
        ref: canvasRef,
        width: 700,
        height: 480,
        style: { width: '100%', height: 'auto', display: 'block', background: '#0B1120' },
      }),
      React.createElement('canvas', {
        ref: trailCanvasRef,
        width: 700,
        height: 480,
        style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' },
      }),
    ),
    React.createElement('div', { style: { marginTop: '14px', display: 'flex', gap: '12px', flexWrap: 'wrap' } },
      sliderGroup('Mass 1', m1.toFixed(1), setM1, 0.5, 5, 0.1, '#2dd4bf'),
      sliderGroup('Mass 2', m2.toFixed(1), setM2, 0.5, 5, 0.1, '#f472b6'),
      sliderGroup('Length 1', l1.toFixed(0), setL1, 60, 200, 1, '#22d3ee'),
      sliderGroup('Length 2', l2.toFixed(0), setL2, 60, 200, 1, '#a78bfa'),
      sliderGroup('Gravity', g.toFixed(1), setG, 1, 20, 0.1, '#34d399'),
    ),
  );
}
