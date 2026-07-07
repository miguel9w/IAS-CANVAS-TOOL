function Widget({ appBus }) {
  const [gridSize, setGridSize] = React.useState(40);
  const [running, setRunning] = React.useState(false);
  const [speed, setSpeed] = React.useState(100);
  const [generation, setGeneration] = React.useState(0);
  const [grid, setGrid] = React.useState(null);
  const [colorScheme, setColorScheme] = React.useState(0);
  const colors = [
    ['#00f0ff', '#0077ff', '#00ff88'],
    ['#ff0066', '#ff4400', '#ffaa00'],
    ['#aa00ff', '#6600ff', '#ff00aa'],
    ['#00ff66', '#00ffcc', '#66ff00'],
  ];

  const cellSize = Math.min(12, Math.max(4, Math.floor(500 / gridSize)));

  React.useEffect(() => {
    initGrid();
  }, [gridSize]);

  React.useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        step();
      }, speed);
    }
    return () => clearInterval(interval);
  }, [running, speed, grid, gridSize]);

  function initGrid() {
    const g = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    setGrid(g);
    setGeneration(0);
    setRunning(false);
  }

  function randomize() {
    const g = Array(gridSize).fill(null).map(() =>
      Array(gridSize).fill(null).map(() => Math.random() > 0.7 ? 1 : 0)
    );
    setGrid(g);
    setGeneration(0);
  }

  function countNeighbors(g, x, y) {
    let count = 0;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nx = (x + dx + gridSize) % gridSize;
        const ny = (y + dy + gridSize) % gridSize;
        count += g[ny][nx];
      }
    }
    return count;
  }

  function step() {
    setGrid(prev => {
      if (!prev) return prev;
      const next = prev.map(row => [...row]);
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          const neighbors = countNeighbors(prev, x, y);
          if (prev[y][x] === 1 && (neighbors < 2 || neighbors > 3)) next[y][x] = 0;
          else if (prev[y][x] === 0 && neighbors === 3) next[y][x] = 1;
          else next[y][x] = prev[y][x];
        }
      }
      setGeneration(g => g + 1);
      return next;
    });
  }

  function toggleCell(x, y) {
    if (running) return;
    setGrid(prev => {
      if (!prev) return prev;
      const next = prev.map(row => [...row]);
      next[y][x] = prev[y][x] ? 0 : 1;
      return next;
    });
  }

  function handleCanvasClick(e) {
    const rect = e.target.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
    toggleCell(x, y);
  }

  const palette = colors[colorScheme % colors.length];

  return (
    <div style={{
      background: '#0B1120', color: '#e2e8f0', fontFamily: "'Courier New', monospace",
      padding: '16px', height: '100%', boxSizing: 'border-box', overflow: 'auto',
      border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
    }}>
      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ color: '#00f0ff', fontWeight: 'bold', fontSize: '16px' }}>GAME OF LIFE</span>
        <span style={{ color: '#888', fontSize: '12px' }}>Gen: {generation}</span>
      </div>
      <div style={{ marginBottom: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => setRunning(!running)} style={{
          background: running ? '#ff3333' : '#00ff88', color: '#0B1120', border: 'none',
          padding: '5px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
        }}>{running ? '⏹ PAUSE' : '▶ PLAY'}</button>
        <button onClick={step} disabled={running} style={{
          background: '#0f172a', color: '#aaa', border: '1px solid rgba(148, 163, 184, 0.12)', padding: '5px 12px',
          borderRadius: '4px', cursor: running ? 'not-allowed' : 'pointer', fontSize: '13px', opacity: running ? 0.5 : 1
        }}>⏭ STEP</button>
        <button onClick={randomize} style={{
          background: '#0f172a', color: '#aaa', border: '1px solid rgba(148, 163, 184, 0.12)', padding: '5px 12px',
          borderRadius: '4px', cursor: 'pointer', fontSize: '13px'
        }}>🎲 RANDOM</button>
        <button onClick={initGrid} style={{
          background: '#0f172a', color: '#aaa', border: '1px solid rgba(148, 163, 184, 0.12)', padding: '5px 12px',
          borderRadius: '4px', cursor: 'pointer', fontSize: '13px'
        }}>🗑 CLEAR</button>
        <select value={colorScheme} onChange={e => setColorScheme(Number(e.target.value))} style={{
          background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(148, 163, 184, 0.12)', padding: '4px 8px',
          borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
        }}>
          <option value={0}>🌊 Blue</option>
          <option value={1}>🔥 Fire</option>
          <option value={2}>🍇 Purple</option>
          <option value={3}>🌿 Green</option>
        </select>
      </div>
      <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
        <span style={{ color: '#888' }}>Size:</span>
        <input type="range" min={20} max={80} value={gridSize} onChange={e => setGridSize(Number(e.target.value))}
          style={{ width: '120px', accentColor: '#00f0ff' }} />
        <span style={{ color: '#00f0ff', minWidth: '30px' }}>{gridSize}</span>
        <span style={{ color: '#888' }}>Speed:</span>
        <input type="range" min={20} max={500} value={speed} onChange={e => setSpeed(Number(e.target.value))}
          style={{ width: '120px', accentColor: '#00f0ff' }} />
        <span style={{ color: '#00f0ff', minWidth: '40px' }}>{speed}ms</span>
      </div>
      <div style={{
        border: '1px solid #0f172a', borderRadius: '4px', display: 'inline-block',
        background: '#0a0f1a', padding: '2px'
      }}>
        {grid && (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`, gap: '0px' }}>
            {grid.flatMap((row, y) =>
              row.map((cell, x) => (
                <div key={`${x}-${y}`} onClick={() => toggleCell(x, y)} style={{
                  width: cellSize, height: cellSize,
                  background: cell ? palette[Math.floor(Math.random() * palette.length)] : '#0a0f1a',
                  boxShadow: cell ? `0 0 ${cellSize * 0.6}px ${palette[0]}` : 'none',
                  border: '1px solid #111822',
                  cursor: running ? 'default' : 'pointer',
                  transition: 'background 0.1s, box-shadow 0.1s',
                  borderRadius: '1px'
                }} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
