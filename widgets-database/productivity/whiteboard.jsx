function Widget({ appBus }) {
  const canvasRef = React.useRef(null);
  const [drawing, setDrawing] = React.useState(false);
  const [color, setColor] = React.useState('#ffffff');
  const [brushSize, setBrushSize] = React.useState(3);
  const [tool, setTool] = React.useState('pen');
  const [snapshots, setSnapshots] = React.useState([]);
  const lastPos = React.useRef(null);

  React.useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.width = c.parentElement.clientWidth;
    c.height = c.parentElement.clientHeight;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, c.width, c.height);
    saveSnapshot();
  }, []);

  const saveSnapshot = () => {
    const c = canvasRef.current;
    if (!c) return;
    setSnapshots(prev => [...prev, c.toDataURL()]);
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
    setDrawing(true);
    if (tool === 'eraser') {
      const ctx = canvasRef.current.getContext('2d');
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, brushSize * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }
  };

  const draw = (e) => {
    if (!drawing || !lastPos.current) return;
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
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, brushSize * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    } else if (tool === 'spray') {
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * brushSize * 3;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(pos.x + Math.cos(angle) * dist, pos.y + Math.sin(angle) * dist, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    lastPos.current = pos;
  };

  const endDraw = () => {
    if (drawing) {
      saveSnapshot();
    }
    setDrawing(false);
    lastPos.current = null;
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
    toolbar: { display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap', alignItems: 'center' },
    toolBtn: (active) => ({ background: active ? '#7c83ff' : '#0f172a', border: '1px solid ' + (active ? '#7c83ff' : 'rgba(148, 163, 184, 0.08)'), borderRadius: '4px', color: '#94a3b8', padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }),
    colorInp: { width: '28px', height: '28px', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: 0, background: 'transparent' },
    clearBtn: { background: '#f87171', border: 'none', borderRadius: '4px', color: '#fff', padding: '4px 10px', fontSize: '11px', cursor: 'pointer' },
    undoBtn: { background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '4px', color: '#888', padding: '4px 10px', fontSize: '11px', cursor: 'pointer' },
    range: { width: '60px', accentColor: '#7c83ff' },
    canvas: { flex: 1, borderRadius: '6px', overflow: 'hidden', cursor: 'crosshair' },
  };

  return (
    <div style={s.wrap}>
      <div style={s.h}>🎨 Whiteboard</div>
      <div style={s.toolbar}>
        <button style={s.toolBtn(tool === 'pen')} onClick={() => setTool('pen')}>Pen</button>
        <button style={s.toolBtn(tool === 'spray')} onClick={() => setTool('spray')}>Spray</button>
        <button style={s.toolBtn(tool === 'eraser')} onClick={() => setTool('eraser')}>Eraser</button>
        <input type="color" style={s.colorInp} value={color} onChange={e => setColor(e.target.value)} />
        <input type="range" style={s.range} min="1" max="20" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} />
        <span style={{fontSize:'10px',color:'#666'}}>{brushSize}px</span>
        <button style={s.undoBtn} onClick={undo} disabled={snapshots.length < 2}>↩ Undo</button>
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
