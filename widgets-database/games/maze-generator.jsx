function Widget({ appBus }) {
  const [size, setSize] = React.useState(10);
  const [maze, setMaze] = React.useState(null);
  const [solution, setSolution] = React.useState(null);
  const [generating, setGenerating] = React.useState(false);
  const [showAnim, setShowAnim] = React.useState(true);
  const [solved, setSolved] = React.useState(false);
  const [cellsVisited, setCellsVisited] = React.useState(0);
  const animTimeoutRef = React.useRef(null);

  const CELL = Math.min(36, Math.max(10, Math.floor(480 / size)));
  const WALL = 2;

  React.useEffect(() => {
    generateMaze();
    return () => {
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
    };
  }, [size]);

  async function generateMaze() {
    setGenerating(true);
    setSolved(false);
    setSolution(null);

    const cols = size, rows = size;
    // grid: 0 = path, 1 = wall
    const grid = Array(rows * 2 + 1).fill(null).map(() => Array(cols * 2 + 1).fill(1));
    const visited = Array(rows).fill(null).map(() => Array(cols).fill(false));

    // carve paths using recursive backtracking
    function carve(x, y, visitList) {
      visited[y][x] = true;
      grid[y * 2 + 1][x * 2 + 1] = 0;
      visitList.push([x, y]);

      const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
      for (let i = dirs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
      }

      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && !visited[ny][nx]) {
          grid[y * 2 + 1 + dy][x * 2 + 1 + dx] = 0;
          carve(nx, ny, visitList);
        }
      }
    }

    const visitOrder = [];
    carve(0, 0, visitOrder);

    // entrance/exit
    grid[0][1] = 0;
    grid[rows * 2][cols * 2 - 1] = 0;

    if (showAnim) {
      // animated rendering
      const animGrid = Array(rows * 2 + 1).fill(null).map(() => Array(cols * 2 + 1).fill(1));
      let animIdx = 0;

      function animStep() {
        if (animIdx >= visitOrder.length) {
          // finalize
          animGrid[0][1] = 0;
          animGrid[rows * 2][cols * 2 - 1] = 0;
          setMaze(animGrid.map(r => [...r]));
          setCellsVisited(visitOrder.length);
          setGenerating(false);
          return;
        }
        const [cx, cy] = visitOrder[animIdx];
        animGrid[cy * 2 + 1][cx * 2 + 1] = 0;
        // also carve connecting walls from previous
        if (animIdx > 0) {
          const [px, py] = visitOrder[animIdx - 1];
          const mx = px + (cx - px);
          const my = py + (cy - py);
          if (mx >= 0 && mx < cols * 2 && my >= 0 && my < rows * 2) {
            animGrid[my * 2 + 1 - (cy - py)][mx * 2 + 1 - (cx - px)] = 0;
          }
        }
        // For simplicity just carve all connections up to current
        for (let i = 1; i <= animIdx; i++) {
          const [ax, ay] = visitOrder[i - 1];
          const [bx, by] = visitOrder[i];
          grid[by * 2 + 1][bx * 2 + 1] = 0;
          const wx = ax + (bx - ax);
          const wy = ay + (by - ay);
          animGrid[wy * 2 + 1 - (by - ay)][wx * 2 + 1 - (bx - ax)] = 0;
          // Copy from actual
          for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++) {
              const gy = by * 2 + 1 + dy;
              const gx = bx * 2 + 1 + dx;
              if (gy >= 0 && gy < rows * 2 + 1 && gx >= 0 && gx < cols * 2 + 1)
                animGrid[gy][gx] = grid[gy][gx];
            }
        }
        animGrid[0][1] = 0;
        animGrid[rows * 2][cols * 2 - 1] = 0;
        setMaze(animGrid.map(r => [...r]));
        animIdx++;
        animTimeoutRef.current = setTimeout(animStep, 20);
      }
      animStep();
    } else {
      setMaze(grid);
      setCellsVisited(visitOrder.length);
      setGenerating(false);
    }
  }

  function solveMaze() {
    if (!maze) return;
    setSolved(false);

    const rows = size * 2 + 1;
    const cols = size * 2 + 1;
    const dist = Array(rows).fill(null).map(() => Array(cols).fill(Infinity));
    const prev = Array(rows).fill(null).map(() => Array(cols).fill(null));

    const start = [0, 1];
    const end = [rows - 1, cols - 2];

    dist[1][1] = 0;
    const queue = [[1, 1]];

    while (queue.length > 0) {
      const [cy, cx] = queue.shift();
      if (cy === end[0] && cx === end[1]) break;
      for (const [dy, dx] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
        const ny = cy + dy, nx = cx + dx;
        if (ny >= 0 && ny < rows && nx >= 0 && nx < cols &&
            maze[ny][nx] === 0 && dist[ny][nx] === Infinity) {
          dist[ny][nx] = dist[cy][cx] + 1;
          prev[ny][nx] = [cy, cx];
          queue.push([ny, nx]);
        }
      }
    }

    // trace path
    const path = [];
    let cur = end;
    while (cur) {
      path.push(cur);
      cur = prev[cur[0]][cur[1]];
    }
    // only keep actual path cells (skip the start corridor)
    const sol = new Set(path.filter(([y, x]) => y % 2 === 1 || (y === 0 && x === 1) || (y === rows - 1)).map(p => `${p[0]},${p[1]}`));
    setSolution(sol);
    setSolved(true);
  }

  return (
    <div style={{
      background: '#0B1120', color: '#e2e8f0', fontFamily: "'Courier New', monospace",
      padding: '16px', height: '100%', boxSizing: 'border-box', overflow: 'auto',
      border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
    }}>
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#aa44ff', fontWeight: 'bold', fontSize: '16px' }}>MAZE GENERATOR</span>
        {maze && <span style={{ color: '#888', fontSize: '12px' }}>{size}x{size}</span>}
      </div>
      <div style={{ marginBottom: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: '#888' }}>Size:</span>
        <input type="range" min={5} max={30} value={size} onChange={e => setSize(Number(e.target.value))}
          style={{ width: '100px', accentColor: '#aa44ff' }} />
        <span style={{ color: '#aa44ff', fontSize: '12px' }}>{size}</span>
        <button onClick={generateMaze} disabled={generating} style={{
          background: '#aa44ff', color: '#fff', border: 'none', padding: '4px 14px',
          borderRadius: '4px', cursor: generating ? 'not-allowed' : 'pointer', fontSize: '12px',
          opacity: generating ? 0.5 : 1
        }}>{generating ? '⏳' : '🔄 GENERATE'}</button>
        {maze && !generating && (
          <button onClick={solveMaze} style={{
            background: solved ? '#ffaa00' : '#0f172a', color: solved ? '#0B1120' : '#aaa',
            border: 'none', padding: '4px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
          }}>{solved ? '🔍 HIDE PATH' : '🔍 SOLVE'}</button>
        )}
        <label style={{ fontSize: '12px', color: '#888', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
          <input type="checkbox" checked={showAnim} onChange={e => setShowAnim(e.target.checked)}
            style={{ accentColor: '#aa44ff' }} />
          Animate
        </label>
      </div>
      {maze && (
        <div style={{
          border: '2px solid #0f172a', borderRadius: '4px', display: 'inline-block',
          background: '#080d18', padding: '0', lineHeight: 0
        }}>
          {maze.map((row, y) => (
            <div key={y} style={{ display: 'flex', lineHeight: 0 }}>
              {row.map((cell, x) => {
                const isSol = solution && solution.has(`${y},${x}`);
                const isEntrance = y === 0 && x === 1;
                const isExit = y === maze.length - 1 && x === maze[0].length - 2;
                let bg = cell === 1 ? '#0d1820' : '#0a101e';
                if (isSol && !isEntrance && !isExit) bg = '#ffaa0044';
                if (isEntrance || isExit) bg = '#00ff8822';
                return (
                  <div key={x} style={{
                    width: CELL, height: CELL, background: bg,
                    border: 'none', margin: 0, padding: 0
                  }} />
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
