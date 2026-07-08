function Widget({ appBus }) {
  const [maxNum, setMaxNum] = React.useState(500);
  const [mode, setMode] = React.useState('spiral');
  const canvasRef = React.useRef(null);

  const isPrime = (n) => {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    const sqrt = Math.sqrt(n);
    for (let i = 3; i <= sqrt; i += 2) if (n % i === 0) return false;
    return true;
  };

  const getPrimes = (limit) => {
    const primes = [];
    for (let i = 2; i <= limit; i++) if (isPrime(i)) primes.push(i);
    return primes;
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * devicePixelRatio;
    const H = canvas.height = canvas.offsetHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    const w = canvas.offsetWidth, h = canvas.offsetHeight;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0B1120';
    ctx.fillRect(0, 0, w, h);

    const primes = getPrimes(maxNum);
    const primeSet = new Set(primes);

    const cx = w / 2, cy = h / 2;

    if (mode === 'spiral') {
      const maxR = Math.min(cx, cy) * 0.9;
      const totalAngle = Math.sqrt(maxNum) * 2 * Math.PI;
      const angleStep = totalAngle / maxNum;

      for (let i = 1; i <= maxNum; i++) {
        const frac = i / maxNum;
        const r = frac * maxR;
        const angle = angleStep * i - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        const size = Math.max(1.5, 3 - frac * 2);

        if (primeSet.has(i)) {
          const hue = (i * 47) % 360;
          ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
          ctx.beginPath();
          ctx.arc(x, y, size + 1, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = `rgba(100, 116, 139, ${0.2 + frac * 0.15})`;
          ctx.beginPath();
          ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.strokeStyle = 'rgba(99,102,241,0.15)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let i = 0; i <= maxNum; i += Math.max(1, Math.floor(maxNum / 100))) {
        const frac = i / maxNum;
        const r = frac * maxR;
        const angle = angleStep * i - Math.PI / 2;
        const x = cx + r * Math.cos(angle), y = cy + r * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    } else {
      const cols = Math.ceil(Math.sqrt(maxNum));
      const rows = Math.ceil(maxNum / cols);
      const cellW = (w - 40) / cols;
      const cellH = (h - 40) / rows;
      const size = Math.min(cellW, cellH) * 0.6;

      for (let i = 1; i <= maxNum; i++) {
        const row = Math.floor((i - 1) / cols);
        const col = (i - 1) % cols;
        const x = 20 + col * cellW + cellW / 2;
        const y = 20 + row * cellH + cellH / 2;

        if (primeSet.has(i)) {
          const hue = (i * 47) % 360;
          ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
          ctx.beginPath();
          ctx.arc(x, y, Math.max(2, size * 0.8), 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(226,232,240,0.6)';
          ctx.font = `${Math.max(6, Math.min(10, size * 0.5))}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(i, x + size + 4, y);
        } else {
          ctx.fillStyle = `rgba(71,85,105,0.3)`;
          ctx.beginPath();
          ctx.arc(x, y, Math.max(1, size * 0.25), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.fillStyle = '#475569';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`Primes: ${primes.length} of ${maxNum}`, 12, h - 8);
  }, [maxNum, mode]);

  return (
    <div style={{ width: '100%', height: '100%', background: '#0B1120', color: '#e2e8f0', display: 'flex', flexDirection: 'column', fontFamily: 'ui-monospace, monospace', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #1e293b', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ fontSize: 12, color: '#94a3b8' }}>
          Range: <span style={{ color: '#6366f1', fontWeight: 600 }}>{maxNum}</span>
          <input type="range" min={100} max={10000} step={100} value={maxNum} onChange={e => setMaxNum(Number(e.target.value))} style={{ width: 140, accentColor: '#6366f1', marginLeft: 6, verticalAlign: 'middle' }} />
        </label>
        <div style={{ flex: 1 }} />
        {['spiral','grid'].map(m => (
          <button key={m} onClick={() => setMode(m)}
            style={{ background: mode === m ? '#6366f1' : 'transparent', border: '1px solid ' + (mode === m ? '#6366f1' : '#334155'), color: mode === m ? '#fff' : '#94a3b8', borderRadius: 6, padding: '4px 14px', fontSize: 12, cursor: 'pointer', textTransform: 'capitalize' }}>
            {m}
          </button>
        ))}
      </div>
      <canvas ref={canvasRef} style={{ flex: 1, width: '100%', display: 'block', minHeight: 0 }} />
    </div>
  );
}
