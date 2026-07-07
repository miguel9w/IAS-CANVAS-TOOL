function Widget({ appBus }) {
  const [n, setN] = React.useState(1);
  const [showProb, setShowProb] = React.useState(false);
  const [time, setTime] = React.useState(0);
  const canvasRef = React.useRef(null);
  const animRef = React.useRef(null);
  const L = 1;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const padding = 50;
    const plotW = W - 2 * padding;
    const plotH = H - 2 * padding;
    const midY = padding + plotH / 2;

    const dx = L / plotW;

    const waveColors = ['#22d3ee', '#2dd4bf', '#a78bfa', '#f472b6', '#fbbf24', '#34d399', '#60a5fa', '#fb923c', '#c084fc', '#e879f9'];

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#0a0f1e');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // title
      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Particle in Infinite Square Well — n = ${n}`, W / 2, 24);

      // grid
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= plotW; x += plotW / 10) {
        ctx.beginPath();
        ctx.moveTo(padding + x, padding);
        ctx.lineTo(padding + x, padding + plotH);
        ctx.stroke();
      }
      for (let y = 0; y <= plotH; y += plotH / 8) {
        ctx.beginPath();
        ctx.moveTo(padding, padding + y);
        ctx.lineTo(padding + plotW, padding + y);
        ctx.stroke();
      }

      // walls
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, padding + plotH);
      ctx.moveTo(padding + plotW, padding);
      ctx.lineTo(padding + plotW, padding + plotH);
      ctx.stroke();

      // axes
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, midY);
      ctx.lineTo(padding + plotW, midY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, padding + plotH);
      ctx.stroke();

      // axis labels
      ctx.fillStyle = '#64748b';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('x', padding + plotW + 16, midY + 4);
      ctx.textAlign = 'right';
      ctx.fillText(showProb ? '|ψ|²' : 'ψ', padding - 8, padding - 6);

      // compute wavefunction
      const scale = showProb ? plotH * 0.85 : plotH * 0.4;
      const norm = Math.sqrt(2 / L);

      ctx.beginPath();
      let first = true;
      for (let px = 0; px <= plotW; px++) {
        const x = (px / plotW) * L;
        const psi = norm * Math.sin(n * Math.PI * x / L);
        const energy = n * n * Math.PI * Math.PI / (2 * L * L); // ħ=m=1
        const phase = energy * time;
        const psiRe = psi * Math.cos(phase);
        const psiIm = psi * Math.sin(phase);
        const prob = psi * psi;

        const val = showProb ? prob : psiRe;
        const y = midY - val * scale;

        if (first) {
          ctx.moveTo(padding + px, y);
          first = false;
        } else {
          ctx.lineTo(padding + px, y);
        }
      }
      ctx.strokeStyle = waveColors[(n - 1) % waveColors.length];
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // fill under curve for probability
      if (showProb) {
        ctx.beginPath();
        ctx.moveTo(padding, midY);
        for (let px = 0; px <= plotW; px++) {
          const x = (px / plotW) * L;
          const psi = norm * Math.sin(n * Math.PI * x / L);
          const prob = psi * psi;
          const y = midY - prob * scale;
          ctx.lineTo(padding + px, y);
        }
        ctx.lineTo(padding + plotW, midY);
        ctx.closePath();
        ctx.fillStyle = waveColors[(n - 1) % waveColors.length] + '30';
        ctx.fill();
      }

      // probability density as color overlay
      if (!showProb) {
        const imageData = ctx.getImageData(0, 0, W, H);
        const data = imageData.data;
        const wallLeft = padding;
        const wallRight = padding + plotW;
        for (let px = wallLeft; px < wallRight; px++) {
          const x = ((px - padding) / plotW) * L;
          const psi = norm * Math.sin(n * Math.PI * x / L);
          const prob = psi * psi;
          const alpha = Math.min(prob * 8, 1);
          for (let py = padding; py < padding + plotH; py++) {
            const idx = (py * W + px) * 4;
            const c = waveColors[(n - 1) % waveColors.length];
            const r = parseInt(c.slice(1, 3), 16);
            const g = parseInt(c.slice(3, 5), 16);
            const b = parseInt(c.slice(5, 7), 16);
            data[idx] = data[idx] * (1 - alpha * 0.3) + r * alpha * 0.3;
            data[idx + 1] = data[idx + 1] * (1 - alpha * 0.3) + g * alpha * 0.3;
            data[idx + 2] = data[idx + 2] * (1 - alpha * 0.3) + b * alpha * 0.3;
          }
        }
        ctx.putImageData(imageData, 0, 0);
      }

      // energy labels
      ctx.fillStyle = '#475569';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Eₙ ∝ n² = ${n * n}`, padding + 6, padding + plotH - 8);

      if (n > 0) {
        const nodes = n - 1;
        ctx.fillText(`Nodes: ${nodes}`, padding + 6, padding + plotH - 22);
      }
    }

    draw();
  }, [n, showProb, time]);

  React.useEffect(() => {
    animRef.current = setInterval(() => {
      setTime(t => t + 0.02);
    }, 16);
    return () => clearInterval(animRef.current);
  }, []);

  const containerStyle = {
    background: 'linear-gradient(135deg, #0B1120 0%, #111827 100%)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid rgba(34, 211, 238, 0.15)',
    boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
  };

  const labelStyle = {
    color: '#94a3b8',
    fontFamily: 'monospace',
    fontSize: '12px',
    marginBottom: '6px',
  };

  const valueStyle = {
    color: '#22d3ee',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  };

  const toggleStyle = (active) => ({
    background: active ? 'rgba(34, 211, 238, 0.15)' : 'rgba(255,255,255,0.03)',
    color: active ? '#22d3ee' : '#64748b',
    border: `1px solid ${active ? 'rgba(34, 211, 238, 0.3)' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: '6px',
    padding: '6px 14px',
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: '11px',
    transition: 'all 0.2s',
  });

  return React.createElement('div', { style: containerStyle },
    React.createElement('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '16px',
        flexWrap: 'wrap',
      }
    },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        React.createElement('span', { style: labelStyle }, 'Quantum State n ='),
        React.createElement('span', { style: { ...valueStyle, fontSize: '18px', minWidth: '24px', textAlign: 'center' } }, n),
      ),
      React.createElement('input', {
        type: 'range',
        min: 1,
        max: 10,
        value: n,
        onChange: (e) => setN(parseInt(e.target.value)),
        style: {
          flex: '1',
          minWidth: '120px',
          accentColor: '#22d3ee',
          height: '4px',
        },
      }),
      React.createElement('div', { style: { display: 'flex', gap: '6px', marginLeft: 'auto' } },
        React.createElement('button', {
          onClick: () => setShowProb(false),
          style: toggleStyle(!showProb),
        }, 'ψ (wave)'),
        React.createElement('button', {
          onClick: () => setShowProb(true),
          style: toggleStyle(showProb),
        }, '|ψ|² (density)'),
      ),
    ),
    React.createElement('canvas', {
      ref: canvasRef,
      width: 700,
      height: 360,
      style: {
        width: '100%',
        height: 'auto',
        borderRadius: '8px',
        background: '#0a0f1e',
        border: '1px solid rgba(255,255,255,0.04)',
        display: 'block',
      },
    }),
    React.createElement('div', {
      style: {
        marginTop: '12px',
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
      },
    },
      React.createElement('div', { style: { ...labelStyle, fontSize: '11px', opacity: 0.6 } },
        'ψₙ(x) = √(2/L) · sin(nπx/L) · e^(−iEₙt/ħ)'),
    ),
  );
}
