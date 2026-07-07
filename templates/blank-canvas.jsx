function Widget({ appBus }) {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = w;
    canvas.height = h;

    ctx.fillStyle = '#131c31';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#1e2d4a';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

    ctx.fillStyle = '#3b82f6';
    ctx.font = '12px monospace';
    ctx.fillText('Canvas ready — ' + w + ' x ' + h + 'px', 10, 20);

    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.fillText('Use canvasRef.current.getContext("2d") to draw', 10, 36);
    ctx.fillText('Grid: 30px spacing', 10, 50);
    ctx.fillText('Resize handler: canvas.width = offsetWidth', 10, 64);
  }, []);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = '#131c31';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#3b82f6';
    ctx.font = '12px monospace';
    ctx.fillText('Cleared — ' + w + ' x ' + h + 'px', 10, 20);
  };

  return (
    <div style={{ background: '#0B1120', color: '#e2e8f0', fontFamily: 'monospace', height: '100%', padding: '16px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Blank Canvas</h2>
        <button onClick={clear}
          style={{ background: '#1e2d4a', color: '#e2e8f0', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
          Clear
        </button>
      </div>
      <div style={{ color: '#64748b', fontSize: '10px', marginBottom: '8px' }}>HTML Canvas — use refs and 2D context</div>
      <canvas ref={canvasRef} style={{ flex: 1, borderRadius: '8px', width: '100%', border: '1px solid #1e2d4a' }} />
    </div>
  );
}
