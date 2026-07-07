function Widget({ appBus }) {
  const canvasRef = React.useRef(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [lastPos, setLastPos] = React.useState(null);
  const [size, setSize] = React.useState({ w: 400, h: 300 });
  const ctxRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ctxRef.current = canvas.getContext('2d');
    const ctx = ctxRef.current;
    ctx.fillStyle = '#0B1120';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvasRef.current.width / rect.width),
      y: (e.clientY - rect.top) * (canvasRef.current.height / rect.height),
    };
  };

  const startDraw = (e) => {
    const pos = getPos(e);
    setIsDrawing(true);
    setLastPos(pos);
    const ctx = ctxRef.current;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = '#bb86fc';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    const ctx = ctxRef.current;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setLastPos(pos);
  };

  const stopDraw = () => {
    setIsDrawing(false);
    setLastPos(null);
  };

  const clear = () => {
    const ctx = ctxRef.current;
    ctx.fillStyle = '#0B1120';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif', color: '#e2e8f0', background: '#0B1120', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
      <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#bb86fc' }}>
        BLANK CANVAS
      </div>
      <div style={{
        background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden',
        border: '1px solid rgba(148, 163, 184, 0.08)', marginBottom: '8px',
      }}>
        <canvas ref={canvasRef} width={size.w} height={size.h}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
          style={{ display: 'block', width: '100%', cursor: 'crosshair', touchAction: 'none' }} />
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '11px', color: '#888' }}>
          {size.w} × {size.h} · draw on canvas
        </div>
        <button onClick={clear} style={{
          padding: '6px 14px', background: '#f44336', border: 'none', borderRadius: '4px',
          color: '#121212', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer',
        }}>Clear</button>
      </div>
    </div>
  );
}
