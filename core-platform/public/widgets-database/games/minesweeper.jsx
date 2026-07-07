function Widget({ appBus }) {
  const [gridSize, setGridSize] = React.useState(10);
  const [mineCount, setMineCount] = React.useState(12);
  const [board, setBoard] = React.useState(null);
  const [revealed, setRevealed] = React.useState(null);
  const [flags, setFlags] = React.useState(null);
  const [gameState, setGameState] = React.useState('menu'); // menu, playing, won, lost
  const [minesPlaced, setMinesPlaced] = React.useState(false);
  const [timer, setTimer] = React.useState(0);
  const [flagMode, setFlagMode] = React.useState(false);

  const timerRef = React.useRef(null);
  const boardRef = React.useRef(null);
  const revealedRef = React.useRef(null);
  const flagsRef = React.useRef(null);
  const gameStateRef = React.useRef(gameState);

  React.useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  const NUMBER_COLORS = ['', '#00f0ff', '#00ff66', '#ff3366', '#aa44ff', '#ff8800', '#ff0066', '#888', '#888'];

  function initBoard(size, mines) {
    const b = Array(size).fill(null).map(() => Array(size).fill(0));
    const r = Array(size).fill(null).map(() => Array(size).fill(false));
    const f = Array(size).fill(null).map(() => Array(size).fill(false));
    setBoard(b); boardRef.current = b;
    setRevealed(r); revealedRef.current = r;
    setFlags(f); flagsRef.current = f;
    setMinesPlaced(false);
    setTimer(0);
    setGameState('playing'); gameStateRef.current = 'playing';
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (gameStateRef.current === 'playing') setTimer(t => t + 1);
    }, 1000);
    return { b, r, f };
  }

  function placeMines(b, r, size, mines, safeX, safeY) {
    const safe = new Set();
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++)
        safe.add(`${safeX + dx},${safeY + dy}`);
    const placed = [];
    while (placed.length < mines) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      if (!safe.has(`${x},${y}`) && b[y][x] !== -1) {
        b[y][x] = -1;
        placed.push([x, y]);
      }
    }
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++)
        if (b[y][x] !== -1) {
          let count = 0;
          for (let dx = -1; dx <= 1; dx++)
            for (let dy = -1; dy <= 1; dy++) {
              const nx = x + dx, ny = y + dy;
              if (nx >= 0 && nx < size && ny >= 0 && ny < size && b[ny][nx] === -1) count++;
            }
          b[y][x] = count;
        }
    setBoard([...b.map(row => [...row])]);
    boardRef.current = b;
    setMinesPlaced(true);
  }

  function reveal(x, y, b, r, f, size) {
    if (r[y][x] || f[y][x]) return;
    r[y][x] = true;
    if (b[y][x] === -1) return 'boom';
    if (b[y][x] === 0) {
      for (let dx = -1; dx <= 1; dx++)
        for (let dy = -1; dy <= 1; dy++) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < size && ny >= 0 && ny < size && !r[ny][nx]) reveal(nx, ny, b, r, f, size);
        }
    }
    return 'ok';
  }

  function checkWin(b, r, size) {
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++)
        if (b[y][x] !== -1 && !r[y][x]) return false;
    return true;
  }

  function handleCellClick(x, y) {
    if (gameState !== 'playing') return;
    const b = boardRef.current;
    const r = revealedRef.current;
    const f = flagsRef.current;
    const size = gridSize;

    if (flagMode) {
      if (r[y][x]) return;
      f[y][x] = !f[y][x];
      setFlags([...f.map(row => [...row])]);
      flagsRef.current = f;
      return;
    }

    if (f[y][x]) return;
    if (!minesPlaced) {
      placeMines(b, r, size, mineCount, x, y);
    }
    const result = reveal(x, y, b, r, f, size);
    setRevealed([...r.map(row => [...row])]);
    revealedRef.current = r;
    if (result === 'boom') {
      for (let yy = 0; yy < size; yy++)
        for (let xx = 0; xx < size; xx++)
          if (b[yy][xx] === -1) r[yy][xx] = true;
      setRevealed([...r.map(row => [...row])]);
      setGameState('lost'); gameStateRef.current = 'lost';
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    if (checkWin(b, r, size)) {
      setGameState('won'); gameStateRef.current = 'won';
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }

  function handleRightClick(e, x, y) {
    e.preventDefault();
    if (gameState !== 'playing') return;
    const r = revealedRef.current;
    if (r[y][x]) return;
    const f = flagsRef.current;
    f[y][x] = !f[y][x];
    setFlags([...f.map(row => [...row])]);
    flagsRef.current = f;
  }

  function startNewGame() {
    if (timerRef.current) clearInterval(timerRef.current);
    const { b, r, f } = initBoard(gridSize, mineCount);
    return { b, r, f };
  }

  function getFlagCount() {
    if (!flagsRef.current) return 0;
    return flagsRef.current.flat().filter(f => f).length;
  }

  const CELL = Math.min(36, Math.max(22, Math.floor(420 / gridSize)));

  const menuView = (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>💣</div>
      <div style={{ marginBottom: '12px' }}>
        <div style={{ marginBottom: '8px', fontSize: '13px' }}>
          <span style={{ color: '#888' }}>Grid: </span>
          <input type="range" min={8} max={16} value={gridSize} onChange={e => setGridSize(Number(e.target.value))}
            style={{ width: '120px', accentColor: '#00f0ff' }} />
          <span style={{ color: '#00f0ff', marginLeft: '6px' }}>{gridSize}x{gridSize}</span>
        </div>
        <div style={{ marginBottom: '12px', fontSize: '13px' }}>
          <span style={{ color: '#888' }}>Mines: </span>
          <input type="range" min={3} max={Math.floor(gridSize * gridSize * 0.3)} value={mineCount}
            onChange={e => setMineCount(Number(e.target.value))}
            style={{ width: '120px', accentColor: '#ff3366' }} />
          <span style={{ color: '#ff3366', marginLeft: '6px' }}>{mineCount}</span>
        </div>
      </div>
      <button onClick={startNewGame} style={{
        background: '#00f0ff', color: '#0B1120', border: 'none', padding: '10px 30px',
        borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px'
      }}>START GAME</button>
    </div>
  );

  const gameView = board && (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
        <span>💣 <span style={{ color: '#ff3366' }}>{mineCount - getFlagCount()}</span></span>
        <span>⏱ <span style={{ color: '#00f0ff' }}>{timer}s</span></span>
        <button onClick={() => setFlagMode(!flagMode)} style={{
          background: flagMode ? '#ff3366' : '#0f172a', color: flagMode ? '#fff' : '#aaa',
          border: 'none', padding: '2px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
        }}>{flagMode ? '🚩 FLAG' : '🔍 REVEAL'}</button>
        <button onClick={startNewGame} style={{
          background: '#0f172a', color: '#aaa', border: 'none', padding: '2px 10px',
          borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
        }}>NEW</button>
      </div>
      <div style={{ display: 'inline-block', border: '2px solid #0f172a', borderRadius: '4px', background: '#080d18', padding: '1px' }}>
        {board.map((row, y) => (
          <div key={y} style={{ display: 'flex' }}>
            {row.map((cell, x) => {
              const isRevealed = revealed[y][x];
              const isFlag = flags[y][x];
              const isMine = cell === -1;
              let content, bg = '#0a101e', color = '#e2e8f0', cursor = 'pointer';
              let border = '1px solid #111822';

              if (isRevealed) {
                if (isMine) {
                  content = '💣';
                  bg = '#ff336622';
                  border = '1px solid #ff336644';
                } else if (cell > 0) {
                  content = cell;
                  color = NUMBER_COLORS[cell];
                  bg = '#0d1525';
                  border = '1px solid #151e30';
                } else {
                  bg = '#0d1525';
                  border = '1px solid #151e30';
                }
                cursor = 'default';
              } else if (isFlag) {
                content = '🚩';
                bg = '#1a1520';
              }

              if (gameState === 'lost' && isMine && !isFlag) {
                content = '💣';
                bg = '#ff336622';
              }

              return (
                <div key={x} onClick={() => handleCellClick(x, y)}
                  onContextMenu={e => handleRightClick(e, x, y)}
                  style={{
                    width: CELL, height: CELL, background: bg, color, cursor,
                    border, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: Math.max(10, CELL * 0.5), fontWeight: 'bold',
                    userSelect: 'none', transition: 'background 0.1s'
                  }}>
                  {content}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {gameState === 'won' && (
        <div style={{ marginTop: '6px', color: '#00ff88', fontWeight: 'bold', fontSize: '14px' }}>
          🎉 YOU WON! {timer}s
        </div>
      )}
      {gameState === 'lost' && (
        <div style={{ marginTop: '6px', color: '#ff3366', fontWeight: 'bold', fontSize: '14px' }}>
          💥 GAME OVER
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      background: '#0B1120', color: '#e2e8f0', fontFamily: "'Courier New', monospace",
      padding: '16px', height: '100%', boxSizing: 'border-box', overflow: 'auto',
      border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
    }}>
      <div style={{ marginBottom: '10px' }}>
        <span style={{ color: '#00f0ff', fontWeight: 'bold', fontSize: '16px' }}>MINESWEEPER</span>
      </div>
      {!board ? menuView : gameView}
    </div>
  );
}
