function Widget({ appBus }) {
  const canvasRef = React.useRef(null);
  const [tool, setTool] = React.useState('pen');
  const [color, setColor] = React.useState('#ffffff');
  const [brushSize, setBrushSize] = React.useState(3);
  const [drawing, setDrawing] = React.useState(false);
  const [snapshots, setSnapshots] = React.useState([]);
  const lastPos = React.useRef(null);
  const startPos = React.useRef(null);

  React.useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const resize = () => {
      const data = c.toDataURL();
      c.width = c.parentElement.clientWidth;
      c.height = c.parentElement.clientHeight;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#0f0f1a';
      ctx.fillRect(0, 0, c.width, c.height);
      const img = new Image();
      img.onload = () => { ctx.drawImage(img, 0, 0); };
      img.src = data;
    };
    resize();
    window.addEventListener('resize', resize);
    saveSnapshot();
    return () => window.removeEventListener('resize', resize);
  }, []);

  const saveSnapshot = () => {
    const c = canvasRef.current;
    if (c) setSnapshots(prev => [...prev, c.toDataURL()]);
  };

  const undo = () => {
    if (snapshots.length < 2) return;
    const prev = snapshots[snapshots.length - 2];
    setSnapshots(snapshots.slice(0, -1));
    const img = new Image();
    img.onload = () => {
      const c = canvasRef.current;
      const ctx = c.getContext('2d');
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = prev;
  };

  const getPos = (e) => {
    const c = canvasRef.current;
    const r = c.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const startDraw = (e) => {
    const pos = getPos(e);
    lastPos.current = pos;
    startPos.current = pos;
    setDrawing(true);

    if (tool === 'eraser') {
      const ctx = canvasRef.current.getContext('2d');
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, brushSize * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      saveSnapshot();
    }
  };

  const draw = (e) => {
    if (!drawing) return;
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);

    if (tool === 'pen') {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastPos.current = pos;
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, brushSize * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    } else if (tool === 'spray') {
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * brushSize * 3;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(pos.x + Math.cos(angle) * dist, pos.y + Math.sin(angle) * dist, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const endDraw = (e) => {
    if (!drawing) return;
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);

    if (tool === 'line' && startPos.current) {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(startPos.current.x, startPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === 'rect' && startPos.current) {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.strokeRect(startPos.current.x, startPos.current.y, pos.x - startPos.current.x, pos.y - startPos.current.y);
    } else if (tool === 'circle' && startPos.current) {
      const cx = (startPos.current.x + pos.x) / 2;
      const cy = (startPos.current.y + pos.y) / 2;
      const rx = Math.abs(pos.x - startPos.current.x) / 2;
      const ry = Math.abs(pos.y - startPos.current.y) / 2;
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    saveSnapshot();
    setDrawing(false);
    lastPos.current = null;
    startPos.current = null;
  };

  const clearCanvas = () => {
    const c = canvasRef.current;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, c.width, c.height);
    saveSnapshot();
  };

  const s = {
    wrap: { background: '#0B1120', color: '#e2e8f0', fontFamily: 'system-ui,sans-serif', padding: '12px', height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '8px', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' },
    h: { fontSize: '18px', fontWeight: 700, margin: '0 0 8px', color: '#7c83ff' },
    toolbar: { display: 'flex', gap: '4px', marginBottom: '8px', flexWrap: 'wrap', alignItems: 'center' },
    toolBtn: (active) => ({ background: active ? '#7c83ff' : '#0f172a', border: '1px solid ' + (active ? '#7c83ff' : 'rgba(148, 163, 184, 0.08)'), borderRadius: '4px', color: active ? '#0B1120' : '#94a3b8', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }),
    colorInp: { width: '26px', height: '26px', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: 0, background: 'transparent' },
    range: { width: '50px', accentColor: '#7c83ff' },
    actionBtn: { background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '4px', color: '#94a3b8', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' },
    clearBtn: { background: '#f87171', border: 'none', borderRadius: '4px', color: '#fff', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' },
    canvas: { flex: 1, borderRadius: '6px', overflow: 'hidden', cursor: 'crosshair' },
  };

  return (
    <div style={s.wrap}>
      <div style={s.h}>✏️ Sketch Pad</div>
      <div style={s.toolbar}>
        <button style={s.toolBtn(tool === 'pen')} onClick={() => setTool('pen')}>Pen</button>
        <button style={s.toolBtn(tool === 'spray')} onClick={() => setTool('spray')}>Spray</button>
        <button style={s.toolBtn(tool === 'eraser')} onClick={() => setTool('eraser')}>Eraser</button>
        <button style={s.toolBtn(tool === 'line')} onClick={() => setTool('line')}>Line</button>
        <button style={s.toolBtn(tool === 'rect')} onClick={() => setTool('rect')}>Rect</button>
        <button style={s.toolBtn(tool === 'circle')} onClick={() => setTool('circle')}>Circle</button>
        <input type="color" style={s.colorInp} value={color} onChange={e => setColor(e.target.value)} />
        <input type="range" style={s.range} min="1" max="20" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} />
        <span style={{fontSize:'9px',color:'#666'}}>{brushSize}</span>
        <button style={s.actionBtn} onClick={undo} disabled={snapshots.length < 2}>↩</button>
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
