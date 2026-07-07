function Widget({ appBus }) {
  const [board, setBoard] = React.useState(null);
  const [initial, setInitial] = React.useState(null);
  const [selected, setSelected] = React.useState(null);
  const [timer, setTimer] = React.useState(0);
  const [difficulty, setDifficulty] = React.useState('medium');
  const [message, setMessage] = React.useState('');
  const [playing, setPlaying] = React.useState(false);

  const timerRef = React.useRef(null);
  const boardRef = React.useRef(null);

  function isValid(grid, row, col, num) {
    for (let i = 0; i < 9; i++)
      if (grid[row][i] === num || grid[i][col] === num) return false;
    const br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
    for (let r = br; r < br + 3; r++)
      for (let c = bc; c < bc + 3; c++)
        if (grid[r][c] === num) return false;
    return true;
  }

  function solveGrid(grid) {
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (grid[r][c] === 0) {
          for (let n = 1; n <= 9; n++) {
            if (isValid(grid, r, c, n)) {
              grid[r][c] = n;
              if (solveGrid(grid)) return true;
              grid[r][c] = 0;
            }
          }
          return false;
        }
    return true;
  }

  function generatePuzzle(diff) {
    const g = Array(9).fill(null).map(() => Array(9).fill(0));
    solveGrid(g);
    const sol = g.map(r => [...r]);
    const diffs = { easy: 36, medium: 45, hard: 54 };
    const remove = diffs[diff] || 45;
    const cells = [];
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++) cells.push([r, c]);
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }
    for (let i = 0; i < remove && i < cells.length; i++) {
      const [r, c] = cells[i];
      g[r][c] = 0;
    }
    return { puzzle: g, solution: sol };
  }

  function startNewGame(diff) {
    if (timerRef.current) clearInterval(timerRef.current);
    const d = diff || difficulty;
    const { puzzle, solution } = generatePuzzle(d);
    setBoard(puzzle.map(r => [...r]));
    boardRef.current = puzzle.map(r => [...r]);
    setInitial(puzzle.map(r => [...r].map(c => c !== 0)));
    setSelected(null);
    setTimer(0);
    setMessage('');
    setPlaying(true);
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
  }

  function handleCellClick(row, col) {
    if (!playing) return;
    setSelected([row, col]);
    setMessage('');
  }

  function handleKey(e) {
    if (!playing || !selected || !board) return;
    const [row, col] = selected;
    if (initial[row][col]) return;
    const num = parseInt(e.key);
    if (num >= 1 && num <= 9) {
      const nb = board.map(r => [...r]);
      nb[row][col] = num;
      setBoard(nb);
      boardRef.current = nb;
      // check win
      if (nb.every((r, ri) => r.every((c, ci) => c !== 0))) {
        if (isBoardValid(nb)) {
          setMessage('🎉 Puzzle solved!');
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }
    }
    if (e.key === 'Backspace' || e.key === 'Delete') {
      const nb = board.map(r => [...r]);
      nb[row][col] = 0;
      setBoard(nb);
      boardRef.current = nb;
      setMessage('');
    }
  }

  function isBoardValid(grid) {
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (grid[r][c] !== 0) {
          const val = grid[r][c];
          grid[r][c] = 0;
          if (!isValid(grid, r, c, val)) { grid[r][c] = val; return false; }
          grid[r][c] = val;
        }
    return true;
  }

  function checkConflicts() {
    if (!board) return new Set();
    const conflicts = new Set();
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) continue;
        const val = board[r][c];
        board[r][c] = 0;
        if (!isValid(board, r, c, val)) conflicts.add(`${r},${c}`);
        board[r][c] = val;
      }
    }
    return conflicts;
  }

  function handleSolve() {
    if (!board) return;
    const nb = board.map(r => [...r]);
    if (solveGrid(nb)) {
      setBoard(nb);
      boardRef.current = nb;
      setMessage('💡 Solved!');
    } else {
      setMessage('❌ No solution exists');
    }
  }

  function handleValidate() {
    if (!board) return;
    const conflicts = checkConflicts();
    if (conflicts.size > 0) {
      setMessage(`⚠ ${conflicts.size} conflict(s) found`);
    } else {
      const filled = board.flat().filter(c => c !== 0).length;
      setMessage(`✅ ${filled}/81 filled, no conflicts`);
    }
  }

  React.useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selected, board, initial, playing]);

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  const conflicts = board ? checkConflicts() : new Set();
  const CELL = 36;

  const menuView = (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>🧩</div>
      <div style={{ marginBottom: '12px' }}>
        {['easy', 'medium', 'hard'].map(d => (
          <button key={d} onClick={() => { setDifficulty(d); startNewGame(d); }} style={{
            background: difficulty === d ? '#aa44ff' : '#0f172a', color: '#e2e8f0',
            border: difficulty === d ? 'none' : '1px solid rgba(148, 163, 184, 0.12)', padding: '8px 20px',
            borderRadius: '4px', cursor: 'pointer', fontSize: '14px', margin: '0 4px',
            fontWeight: difficulty === d ? 'bold' : 'normal'
          }}>{d.toUpperCase()}</button>
        ))}
      </div>
    </div>
  );

  const gameView = board && (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center', fontSize: '13px' }}>
        <span>⏱ <span style={{ color: '#aa44ff' }}>{formatTime(timer)}</span></span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={handleValidate} style={{
            background: '#0f172a', color: '#aaa', border: 'none', padding: '3px 10px',
            borderRadius: '4px', cursor: 'pointer', fontSize: '11px'
          }}>VALIDATE</button>
          <button onClick={handleSolve} style={{
            background: '#ffaa00', color: '#0B1120', border: 'none', padding: '3px 10px',
            borderRadius: '4px', cursor: 'pointer', fontSize: '11px'
          }}>SOLVE</button>
          <button onClick={() => startNewGame()} style={{
            background: '#aa44ff', color: '#fff', border: 'none', padding: '3px 10px',
            borderRadius: '4px', cursor: 'pointer', fontSize: '11px'
          }}>NEW</button>
        </div>
      </div>
      <div style={{ display: 'inline-block', border: '2px solid #0f172a', borderRadius: '4px', background: '#080d18' }}>
        {board.map((row, r) => (
          <div key={r} style={{ display: 'flex' }}>
            {row.map((cell, c) => {
              const isSel = selected && selected[0] === r && selected[1] === c;
              const isInit = initial && initial[r][c];
              const isConflict = conflicts.has(`${r},${c}`);
              const isSameRow = selected && selected[0] === r;
              const isSameCol = selected && selected[1] === c;
              const isSameBox = selected &&
                Math.floor(selected[0] / 3) === Math.floor(r / 3) &&
                Math.floor(selected[1] / 3) === Math.floor(c / 3);

              let bg = '#0a101e';
              if (isSel) bg = '#2a1a4a';
              else if (isSameRow || isSameCol || isSameBox) bg = '#111830';
              if (isInit) bg = isSel ? '#2a1a4a' : '#0d1525';

              const borderRight = (c + 1) % 3 === 0 ? '2px solid #0f172a' : '1px solid #111822';
              const borderBottom = (r + 1) % 3 === 0 ? '2px solid #0f172a' : '1px solid #111822';

              return (
                <div key={c} onClick={() => handleCellClick(r, c)} style={{
                  width: CELL, height: CELL, background: bg, color: isConflict ? '#ff3366' : isInit ? '#94a3b8' : '#00f0ff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', fontWeight: isInit ? 'bold' : 'normal',
                  cursor: 'pointer', borderRight, borderBottom, userSelect: 'none',
                  borderTop: '1px solid #111822', borderLeft: '1px solid #111822'
                }}>
                  {cell !== 0 ? cell : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {message && (
        <div style={{ marginTop: '6px', color: '#ffaa00', fontSize: '13px', fontWeight: 'bold' }}>
          {message}
        </div>
      )}
      <div style={{ marginTop: '6px', fontSize: '11px', color: '#667' }}>
        Keys: 1-9 to enter, Backspace to clear
      </div>
    </div>
  );

  return (
    <div style={{
      background: '#0B1120', color: '#e2e8f0', fontFamily: "'Courier New', monospace",
      padding: '16px', height: '100%', boxSizing: 'border-box', overflow: 'auto',
      border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
    }}>
      <div style={{ marginBottom: '10px' }}>
        <span style={{ color: '#aa44ff', fontWeight: 'bold', fontSize: '16px' }}>SUDOKU</span>
      </div>
      {!board ? menuView : gameView}
    </div>
  );
}
