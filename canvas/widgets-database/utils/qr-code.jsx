function Widget({ appBus }) {
  const [text, setText] = React.useState('Hello World');
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const c = canvas.getContext('2d');
    const size = canvas.width;
    c.fillStyle = '#0B1120';
    c.fillRect(0, 0, size, size);

    if (!text) return;

    const data = text.split('').map(ch => ch.charCodeAt(0));
    const bits = [];
    for (const byte of data) {
      for (let i = 7; i >= 0; i--) bits.push((byte >> i) & 1);
    }

    const version = 3;
    const moduleSize = Math.floor(size / (version * 8 + 17));
    const qrSize = moduleSize * (version * 8 + 17);
    const offset = Math.floor((size - qrSize) / 2);

    const modules = [];
    const dim = version * 4 + 17;
    for (let y = 0; y < dim; y++) {
      modules[y] = [];
      for (let x = 0; x < dim; x++) modules[y][x] = false;
    }

    function drawFinder(y, x) {
      const len = 7;
      for (let fy = 0; fy < len; fy++) {
        for (let fx = 0; fx < len; fx++) {
          const isBorder = fy === 0 || fy === 6 || fx === 0 || fx === 6;
          const isInner = fy >= 2 && fy <= 4 && fx >= 2 && fx <= 4;
          if (isBorder || isInner) modules[y + fy][x + fx] = true;
        }
      }
    }
    function drawTiming(startY, startX, isVertical) {
      for (let i = 0; i < dim - 16; i++) {
        const y = isVertical ? startY + i + 1 : startY;
        const x = isVertical ? startX : startX + i + 1;
        if (i % 2 === 0) modules[y][x] = true;
      }
    }

    drawFinder(0, 0);
    drawFinder(0, dim - 7);
    drawFinder(dim - 7, 0);
    drawTiming(6, 6, true);
    drawTiming(6, 6, false);

    let bitIdx = 0;
    for (let col = dim - 1; col >= 0; col -= 2) {
      if (col <= 6) col--;
      for (let row = 0; row < dim; row++) {
        for (const cx of [col, col - 1]) {
          if (cx < 0) continue;
          if (modules[row][cx] !== undefined) continue;
          if (bitIdx < bits.length) {
            modules[row][cx] = bits[bitIdx++] === 1;
          } else {
            modules[row][cx] = Math.random() > 0.5;
          }
        }
      }
    }

    for (let y = 0; y < dim; y++) {
      for (let x = 0; x < dim; x++) {
        if (modules[y][x] === undefined) continue;
        c.fillStyle = modules[y][x] ? '#22d3ee' : '#0f172a';
        c.fillRect(offset + x * moduleSize, offset + y * moduleSize, moduleSize - 1, moduleSize - 1);
      }
    }
  }, [text]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  const containerStyle = {
    background: '#0B1120', padding: '16px', borderRadius: '8px',
    fontFamily: 'monospace', color: '#e2e8f0', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center',
    border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
  };
  const inputStyle = {
    width: '100%', background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155',
    borderRadius: '4px', padding: '8px', fontFamily: 'monospace', fontSize: '13px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box'
  };

  return (
    <div style={containerStyle}>
      <input value={text} onChange={e => setText(e.target.value)} placeholder="Enter text..." style={inputStyle} />
      <canvas ref={canvasRef} width={280} height={280}
        style={{ borderRadius: '8px', border: '1px solid #334155', background: '#0B1120' }} />
      {text && (
        <button onClick={download} style={{
          marginTop: '8px', background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155',
          borderRadius: '4px', padding: '7px 16px', cursor: 'pointer', fontSize: '12px'
        }}>⬇ Download PNG</button>
      )}
    </div>
  );
}
