function Widget({ appBus }) {
  const canvasRef = React.useRef(null);
  const [charges, setCharges] = React.useState([
    { x: 0.3, y: 0.5, q: 1 },
    { x: 0.7, y: 0.5, q: -1 },
  ]);
  const [polarity, setPolarity] = React.useState(1);
  const [showField, setShowField] = React.useState(true);
  const [showPotential, setShowPotential] = React.useState(true);
  const dragRef = React.useRef(null);

  // Coulomb constant (scaled for visualization)
  const k = 0.015;

  function eField(px, py, charges) {
    let ex = 0, ey = 0;
    for (const c of charges) {
      const dx = px - c.x;
      const dy = py - c.y;
      const r2 = dx * dx + dy * dy;
      if (r2 < 0.0001) continue;
      const r = Math.sqrt(r2);
      ex += k * c.q * dx / (r * r2);
      ey += k * c.q * dy / (r * r2);
    }
    return { ex, ey };
  }

  function potential(px, py, charges) {
    let v = 0;
    for (const c of charges) {
      const dx = px - c.x;
      const dy = py - c.y;
      const r = Math.sqrt(dx * dx + dy * dy);
      if (r < 0.001) return 0;
      v += k * c.q / r;
    }
    return v;
  }

  React.useEffect(() => {
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

    // Potential color map
    if (showPotential && charges.length > 0) {
      const imageData = ctx.createImageData(W, H);
      const data = imageData.data;

      let vMin = Infinity, vMax = -Infinity;
      const vGrid = [];
      for (let py = 0; py < H; py += 2) {
        for (let px = 0; px < W; px += 2) {
          const nx = px / W;
          const ny = py / H;
          const v = potential(nx, ny, charges);
          vGrid.push({ px, py, v });
          if (v < vMin) vMin = v;
          if (v > vMax) vMax = v;
        }
      }

      const vRange = Math.max(vMax - vMin, 0.001);

      for (const { px, py, v } of vGrid) {
        const t = (v - vMin) / vRange;
        let r, g, b;
        if (t < 0.25) {
          const s = t / 0.25;
          r = Math.floor(15 * (1 - s) + 59 * s);
          g = Math.floor(15 * (1 - s) + 130 * s);
          b = Math.floor(140 * (1 - s) + 246 * s);
        } else if (t < 0.5) {
          const s = (t - 0.25) / 0.25;
          r = Math.floor(59 * (1 - s) + 236 * s);
          g = Math.floor(130 * (1 - s) + 72 * s);
          b = Math.floor(246 * (1 - s) + 153 * s);
        } else if (t < 0.75) {
          const s = (t - 0.5) / 0.25;
          r = Math.floor(236 * (1 - s) + 244 * s);
          g = Math.floor(72 * (1 - s) + 114 * s);
          b = Math.floor(153 * (1 - s) + 182 * s);
        } else {
          const s = (t - 0.75) / 0.25;
          r = Math.floor(244 * (1 - s) + 250 * s);
          g = Math.floor(114 * (1 - s) + 128 * s);
          b = Math.floor(182 * (1 - s) + 128 * s);
        }
        for (let dy = 0; dy < 2 && py + dy < H; dy++) {
          for (let dx = 0; dx < 2 && px + dx < W; dx++) {
            const idx = ((py + dy) * W + (px + dx)) * 4;
            data[idx] = Math.min(255, r);
            data[idx + 1] = Math.min(255, g);
            data[idx + 2] = Math.min(255, b);
            data[idx + 3] = 180;
          }
        }
      }
      ctx.putImageData(imageData, 0, 0);
    }

    // Field lines
    if (showField) {
      const startPoints = [];
      for (const c of charges) {
        if (c.q > 0) {
          for (let a = 0; a < 16; a++) {
            const angle = (a / 16) * Math.PI * 2;
            startPoints.push({ x: c.x + 0.02 * Math.cos(angle), y: c.y + 0.02 * Math.sin(angle) });
          }
        } else {
          for (let a = 0; a < 16; a++) {
            const angle = (a / 16) * Math.PI * 2 + 0.1;
            startPoints.push({ x: c.x + 0.02 * Math.cos(angle), y: c.y + 0.02 * Math.sin(angle) });
          }
        }
      }

      const step = 0.008;
      const maxSteps = 200;

      for (const sp of startPoints) {
        let px = sp.x, py = sp.y;
        ctx.beginPath();
        ctx.moveTo(px * W, py * H);

        for (let i = 0; i < maxSteps; i++) {
          const field = eField(px, py, charges);
          const mag = Math.sqrt(field.ex * field.ex + field.ey * field.ey);
          if (mag < 0.0001) break;
          const dx = field.ex / mag * step;
          const dy = field.ey / mag * step;
          px += dx;
          py += dy;

          // check bounds
          if (px < 0 || px > 1 || py < 0 || py > 1) break;

          // check if near a charge
          let tooClose = false;
          for (const c of charges) {
            if (Math.sqrt((px - c.x) ** 2 + (py - c.y) ** 2) < 0.02) {
              tooClose = true;
              break;
            }
          }
          if (tooClose) break;

          ctx.lineTo(px * W, py * H);

          // arrow every 30 steps
          if (i % 30 === 29 && mag > 0.01) {
            const angle = Math.atan2(dy, dx);
            const ax = px * W;
            const ay = py * H;
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
            ctx.lineWidth = 0.8;
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(ax + 5 * Math.cos(angle), ay + 5 * Math.sin(angle));
            ctx.lineTo(ax + 3 * Math.cos(angle + 2.5), ay + 3 * Math.sin(angle + 2.5));
            ctx.lineTo(ax + 3 * Math.cos(angle - 2.5), ay + 3 * Math.sin(angle - 2.5));
            ctx.closePath();
            ctx.fillStyle = 'rgba(148, 163, 184, 0.2)';
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(px * W, py * H);
          }
        }
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    // Draw charges
    for (const c of charges) {
      const cx = c.x * W;
      const cy = c.y * H;
      const r = 14;

      // glow
      const glowColor = c.q > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)';
      ctx.shadowColor = c.q > 0 ? '#ef4444' : '#3b82f6';
      ctx.shadowBlur = 25;

      const gradC = ctx.createRadialGradient(cx - 3, cy - 3, 0, cx, cy, r);
      if (c.q > 0) {
        gradC.addColorStop(0, '#fca5a5');
        gradC.addColorStop(1, '#dc2626');
      } else {
        gradC.addColorStop(0, '#93c5fd');
        gradC.addColorStop(1, '#2563eb');
      }
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = gradC;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = c.q > 0 ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // sign
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.q > 0 ? '+' : '−', cx, cy);
    }

    // instructions
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Click to place charge · Toggle polarity below', 10, H - 8);
  }, [charges, polarity, showField, showPotential]);

  function handleClick(e) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setCharges([...charges, { x, y, q: polarity }]);
  }

  function clearCharges() {
    setCharges([]);
  }

  const containerStyle = {
    background: 'linear-gradient(135deg, #0B1120 0%, #111827 100%)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid rgba(147, 197, 253, 0.15)',
    boxShadow: '0 0 40px rgba(147, 197, 253, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
  };

  const btnStyle = (active, color = '#3b82f6') => ({
    background: active ? `${color}22` : 'rgba(255,255,255,0.03)',
    color: active ? color : '#64748b',
    border: `1px solid ${active ? `${color}44` : 'rgba(255,255,255,0.08)'}`,
    borderRadius: '6px',
    padding: '6px 14px',
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: '11px',
    transition: 'all 0.2s',
  });

  return React.createElement('div', { style: containerStyle },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' } },
      React.createElement('span', { style: { color: '#93c5fd', fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold' } },
        '⚡ Electric Field'),
      React.createElement('div', { style: { display: 'flex', gap: '4px' } },
        React.createElement('button', { onClick: () => setPolarity(1), style: btnStyle(polarity === 1, '#ef4444') }, '+ Positive'),
        React.createElement('button', { onClick: () => setPolarity(-1), style: btnStyle(polarity === -1, '#3b82f6') }, '− Negative'),
      ),
      React.createElement('div', { style: { display: 'flex', gap: '4px', marginLeft: 'auto' } },
        React.createElement('button', { onClick: () => setShowField(!showField), style: btnStyle(showField, '#64748b') }, 'Field Lines'),
        React.createElement('button', { onClick: () => setShowPotential(!showPotential), style: btnStyle(showPotential, '#8b5cf6') }, 'Potential'),
        React.createElement('button', { onClick: clearCharges, style: { ...btnStyle(false), border: '1px solid rgba(255,255,255,0.08)' } }, 'Clear'),
      ),
    ),
    React.createElement('canvas', {
      ref: canvasRef,
      width: 700,
      height: 420,
      onClick: handleClick,
      style: {
        width: '100%',
        height: 'auto',
        borderRadius: '8px',
        display: 'block',
        background: '#0B1120',
        border: '1px solid rgba(255,255,255,0.04)',
        cursor: 'crosshair',
      },
    }),
    React.createElement('div', { style: { marginTop: '8px', display: 'flex', gap: '16px', justifyContent: 'center' } },
      React.createElement('span', { style: { color: '#64748b', fontFamily: 'monospace', fontSize: '10px' } },
        `Charges: ${charges.length} · `,
        React.createElement('span', { style: { color: '#ef4444' } }, '+'.repeat(charges.filter(c => c.q > 0).length)),
        ' ',
        React.createElement('span', { style: { color: '#3b82f6' } }, '−'.repeat(charges.filter(c => c.q < 0).length)),
      ),
    ),
  );
}
