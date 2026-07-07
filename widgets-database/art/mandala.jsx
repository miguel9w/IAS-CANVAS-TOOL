function Widget({ appBus }) {
  const canvasRef = React.useRef(null);
  const [slices, setSlices] = React.useState(8);
  const [color, setColor] = React.useState('#a78bfa');
  const [brushSize, setBrushSize] = React.useState(2);
  const [drawing, setDrawing] = React.useState(false);
  const lastPos = React.useRef(null);

  React.useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.width = c.parentElement.clientWidth;
    c.height = c.parentElement.clientHeight;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, c.width, c.height);
  }, []);

  const getPos = (e) => {
    const c = canvasRef.current;
    const r = c.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const drawMirrored = (cx, cy, x, y, fn) => {
    const angle = (2 * Math.PI) / slices;
    for (let i = 0; i < slices; i++) {
      const cos = Math.cos(angle * i);
      const sin = Math.sin(angle * i);
      const dx = x - cx;
      const dy = y - cy;
      const rx = dx * cos - dy * sin + cx;
      const ry = dx * sin + dy * cos + cy;
      fn(rx, ry);
      const mx = dx * cos + dy * sin + cx;
      const my = dx * sin - dy * cos + cy;
      fn(mx, my);
    }
  };

  const startDraw = (e) => {
    const pos = getPos(e);
    lastPos.current = pos;
    setDrawing(true);
  };

  const draw = (e) => {
    if (!drawing || !lastPos.current) return;
    const c = canvasRef.current;
    const ctx = c.getContext('2d');
    const pos = getPos(e);
    const cx = c.width / 2;
    const cy = c.height / 2;

    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';

    drawMirrored(cx, cy, lastPos.current.x, lastPos.current.y, (x1, y1) => {
      drawMirrored(cx, cy, pos.x, pos.y, (x2, y2) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });
    });

    lastPos.current = pos;
  };

  const endDraw = () => {
    setDrawing(false);
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const c = canvasRef.current;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, c.width, c.height);
    drawGuide();
  };

  const drawGuide = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    const cx = c.width / 2;
    const cy = c.height / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.5;
    const angle = (2 * Math.PI) / slices;
    for (let i = 0; i < slices; i++) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle * i) * c.width, cy + Math.sin(angle * i) * c.width);
      ctx.stroke();
    }
  };

  React.useEffect(() => { drawGuide(); }, [slices]);

  const s = {
    wrap: { background: '#0B1120', color: '#e2e8f0', fontFamily: 'system-ui,sans-serif', padding: '12px', height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '8px', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' },
    h: { fontSize: '18px', fontWeight: 700, margin: '0 0 8px', color: '#7c83ff' },
    toolbar: { display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap', alignItems: 'center' },
    label: { fontSize: '11px', color: '#888' },
    select: { background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '4px', color: '#e2e8f0', padding: '4px 8px', fontSize: '11px', cursor: 'pointer', outline: 'none' },
    colorInp: { width: '26px', height: '26px', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: 0, background: 'transparent' },
    range: { width: '50px', accentColor: '#7c83ff' },
    clearBtn: { background: '#f87171', border: 'none', borderRadius: '4px', color: '#fff', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' },
    canvas: { flex: 1, borderRadius: '6px', overflow: 'hidden', cursor: 'crosshair' },
  };

  return (
    <div style={s.wrap}>
      <div style={s.h}>🕉 Mandala</div>
      <div style={s.toolbar}>
        <span style={s.label}>Symmetry:</span>
        <select style={s.select} value={slices} onChange={e => setSlices(Number(e.target.value))}>
          {[2,3,4,5,6,7,8,9,10,12].map(n => <option key={n} value={n}>{n}-fold</option>)}
        </select>
        <input type="color" style={s.colorInp} value={color} onChange={e => setColor(e.target.value)} />
        <input type="range" style={s.range} min="1" max="8" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} />
        <span style={{fontSize:'9px',color:'#666'}}>{brushSize}</span>
        <button style={s.clearBtn} onClick={clearCanvas}>Clear</button>
      </div>
      <canvas ref={canvasRef} style={s.canvas}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
      />
    </div>
  );
}
