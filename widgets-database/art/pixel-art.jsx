function Widget({ appBus }) {
  const [gridSize, setGridSize] = React.useState(16);
  const [pixels, setPixels] = React.useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('pixelart_data') || 'null');
      if (saved) return saved;
    } catch {}
    return Array(16).fill(null).map(() => Array(16).fill('#0B1120'));
  });
  const [color, setColor] = React.useState('#7c83ff');
  const [tool, setTool] = React.useState('pen');
  const [zoom, setZoom] = React.useState(1);
  const prevColor = React.useRef('#7c83ff');

  React.useEffect(() => {
    localStorage.setItem('pixelart_data', JSON.stringify(pixels));
  }, [pixels]);

  React.useEffect(() => {
    if (gridSize !== pixels.length) {
      const newPixels = Array(gridSize).fill(null).map(() => Array(gridSize).fill('#0B1120'));
      for (let y = 0; y < Math.min(gridSize, pixels.length); y++) {
        for (let x = 0; x < Math.min(gridSize, pixels[0].length); x++) {
          newPixels[y][x] = pixels[y][x];
        }
      }
      setPixels(newPixels);
    }
  }, [gridSize]);

  const paint = (x, y) => {
    if (tool === 'pen') {
      setPixels(pixels.map((row, ry) => row.map((p, rx) => rx === x && ry === y ? color : p)));
    } else if (tool === 'eraser') {
      setPixels(pixels.map((row, ry) => row.map((p, rx) => rx === x && ry === y ? '#0B1120' : p)));
    } else if (tool === 'eyedropper') {
      setColor(pixels[y][x]);
    } else if (tool === 'bucket') {
      const target = pixels[y][x];
      if (target === color) return;
      const fill = (grid, sx, sy, targetColor, fillColor) => {
        if (sx < 0 || sx >= grid[0].length || sy < 0 || sy >= grid.length) return;
        if (grid[sy][sx] !== targetColor) return;
        grid[sy][sx] = fillColor;
        fill(grid, sx+1, sy, targetColor, fillColor);
        fill(grid, sx-1, sy, targetColor, fillColor);
        fill(grid, sx, sy+1, targetColor, fillColor);
        fill(grid, sx, sy-1, targetColor, fillColor);
      };
      const newPixels = pixels.map(row => [...row]);
      fill(newPixels, x, y, target, color);
      setPixels(newPixels);
    }
  };

  const handleMouseDown = (x, y) => paint(x, y);
  const handleMouseEnter = (x, y, e) => { if (e.buttons === 1 && tool !== 'eyedropper') paint(x, y); };

  const exportDataUrl = () => {
    const size = gridSize;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    pixels.forEach((row, y) => row.forEach((p, x) => {
      ctx.fillStyle = p;
      ctx.fillRect(x, y, 1, 1);
    }));
    const url = canvas.toDataURL();
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pixel-art.png';
    a.click();
  };

  const clearAll = () => {
    setPixels(Array(gridSize).fill(null).map(() => Array(gridSize).fill('#0B1120')));
  };

  const cellSize = Math.min(20, 320 / gridSize);

  const s = {
    wrap: { background: '#0B1120', color: '#e2e8f0', fontFamily: 'system-ui,sans-serif', padding: '12px', height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '8px', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' },
    h: { fontSize: '18px', fontWeight: 700, margin: '0 0 8px', color: '#7c83ff' },
    toolbar: { display: 'flex', gap: '4px', marginBottom: '8px', flexWrap: 'wrap', alignItems: 'center' },
    toolBtn: (active) => ({ background: active ? '#7c83ff' : '#0f172a', border: '1px solid ' + (active ? '#7c83ff' : 'rgba(148, 163, 184, 0.08)'), borderRadius: '4px', color: active ? '#0B1120' : '#94a3b8', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }),
    colorInp: { width: '26px', height: '26px', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: 0, background: 'transparent' },
    select: { background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '4px', color: '#e2e8f0', padding: '3px 6px', fontSize: '10px', cursor: 'pointer', outline: 'none' },
    actionBtn: { background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '4px', color: '#94a3b8', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' },
    clearBtn: { background: '#f87171', border: 'none', borderRadius: '4px', color: '#fff', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' },
    grid: { display: 'grid', gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`, gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`, gap: '1px', background: 'rgba(148, 163, 184, 0.08)', borderRadius: '4px', overflow: 'hidden', width: 'fit-content', margin: '0 auto' },
    pixel: (c) => ({ width: cellSize + 'px', height: cellSize + 'px', background: c, cursor: 'crosshair' }),
  };

  return (
    <div style={s.wrap}>
      <div style={s.h}>🎮 Pixel Art</div>
      <div style={s.toolbar}>
        <button style={s.toolBtn(tool === 'pen')} onClick={() => setTool('pen')}>Pen</button>
        <button style={s.toolBtn(tool === 'bucket')} onClick={() => setTool('bucket')}>Fill</button>
        <button style={s.toolBtn(tool === 'eraser')} onClick={() => setTool('eraser')}>Eraser</button>
        <button style={s.toolBtn(tool === 'eyedropper')} onClick={() => setTool('eyedropper')}>Pick</button>
        <input type="color" style={s.colorInp} value={color} onChange={e => setColor(e.target.value)} />
        <select style={s.select} value={gridSize} onChange={e => setGridSize(Number(e.target.value))}>
          {[16,24,32].map(n => <option key={n} value={n}>{n}x{n}</option>)}
        </select>
        <button style={s.actionBtn} onClick={exportDataUrl}>Export</button>
        <button style={s.clearBtn} onClick={clearAll}>Clear</button>
      </div>
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',overflow:'auto'}}>
        <div style={s.grid}>
          {pixels.map((row, y) => row.map((p, x) => (
            <div key={y + '-' + x} style={s.pixel(p)}
              onMouseDown={() => handleMouseDown(x, y)}
              onMouseEnter={e => handleMouseEnter(x, y, e)}
            />
          )))}
        </div>
      </div>
    </div>
  );
}
