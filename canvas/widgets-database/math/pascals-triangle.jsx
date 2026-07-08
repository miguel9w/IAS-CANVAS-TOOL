function Widget({ appBus }) {
  const [depth, setDepth] = React.useState(10);
  const [evenOdd, setEvenOdd] = React.useState(false);
  const canvasRef = React.useRef(null);

  const buildTriangle = (n) => {
    const rows = [];
    for (let i = 0; i < n; i++) {
      rows[i] = [];
      for (let j = 0; j <= i; j++) {
        if (j === 0 || j === i) rows[i][j] = 1;
        else rows[i][j] = rows[i - 1][j - 1] + rows[i - 1][j];
      }
    }
    return rows;
  };

  const getMaxVal = (rows) => {
    let max = 0;
    for (const row of rows) for (const v of row) if (v > max) max = v;
    return max;
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

    const rows = buildTriangle(depth);
    const maxVal = getMaxVal(rows);

    const cellSize = Math.min((w - 40) / (depth * 2 - 1), (h - 40) / depth, 28);
    const totalW = (depth * 2 - 1) * cellSize;
    const totalH = depth * cellSize;
    const ox = (w - totalW) / 2, oy = (h - totalH) / 2;

    const getColor = (val) => {
      if (evenOdd) return val % 2 === 0 ? '#6366f1' : '#ef4444';
      const t = maxVal === 0 ? 0 : Math.log(val + 1) / Math.log(maxVal + 1);
      const r = Math.round(30 + t * 180);
      const g = Math.round(50 + (1 - Math.abs(t - 0.5) * 2) * 120);
      const b = Math.round(200 - t * 150);
      return `rgb(${r},${g},${b})`;
    };

    const getTextColor = (val) => {
      if (evenOdd) return '#fff';
      const t = maxVal === 0 ? 0 : Math.log(val + 1) / Math.log(maxVal + 1);
      return t > 0.4 ? '#fff' : '#94a3b8';
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowWidth = row.length * cellSize;
      const startX = ox + (totalW - rowWidth) / 2;
      for (let j = 0; j < row.length; j++) {
        const x = startX + j * cellSize;
        const y = oy + i * cellSize;
        const val = row[j];

        ctx.fillStyle = getColor(val);
        ctx.fillRect(x, y, cellSize, cellSize);

        if (evenOdd) {
          ctx.fillStyle = val % 2 === 0 ? 'rgba(99,102,241,0.15)' : 'rgba(239,68,68,0.15)';
          ctx.fillRect(x, y, cellSize, cellSize);
        }

        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, cellSize, cellSize);

        if (cellSize >= 16) {
          ctx.fillStyle = getTextColor(val);
          ctx.font = `bold ${Math.max(7, Math.min(12, cellSize * 0.45))}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(val.toString(), x + cellSize / 2, y + cellSize / 2);
        }
      }
    }

    ctx.fillStyle = '#475569';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`Depth: ${depth}`, 12, h - 8);
  }, [depth, evenOdd]);

  return (
    <div style={{ width: '100%', height: '100%', background: '#0B1120', color: '#e2e8f0', display: 'flex', flexDirection: 'column', fontFamily: 'ui-monospace, monospace', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #1e293b', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ fontSize: 12, color: '#94a3b8' }}>
          Depth: <span style={{ color: '#6366f1', fontWeight: 600 }}>{depth}</span>
          <input type="range" min={1} max={20} value={depth} onChange={e => setDepth(Number(e.target.value))} style={{ width: 120, accentColor: '#6366f1', marginLeft: 6, verticalAlign: 'middle' }} />
        </label>
        <div style={{ flex: 1 }} />
        <label style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
          <input type="checkbox" checked={evenOdd} onChange={e => setEvenOdd(e.target.checked)} style={{ accentColor: '#6366f1' }} />
          Even/Odd
        </label>
      </div>
      <canvas ref={canvasRef} style={{ flex: 1, width: '100%', display: 'block', minHeight: 0 }} />
    </div>
  );
}
