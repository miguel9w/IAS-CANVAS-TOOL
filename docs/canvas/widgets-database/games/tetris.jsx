function Widget({ appBus }) {
  const COLS = 10;
  const ROWS = 20;
  const CELL = 24;

  const TETROMINOES = {
    I: { shape: [[1,1,1,1]], color: '#00f0ff' },
    O: { shape: [[1,1],[1,1]], color: '#ffee00' },
    T: { shape: [[0,1,0],[1,1,1]], color: '#aa44ff' },
    S: { shape: [[0,1,1],[1,1,0]], color: '#00ff66' },
    Z: { shape: [[1,1,0],[0,1,1]], color: '#ff3366' },
    J: { shape: [[1,0,0],[1,1,1]], color: '#3366ff' },
    L: { shape: [[0,0,1],[1,1,1]], color: '#ff8800' },
  };
  const PIECE_NAMES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

  const [board, setBoard] = React.useState(() =>
    Array(ROWS).fill(null).map(() => Array(COLS).fill(0))
  );
  const [piece, setPiece] = React.useState(null);
  const [pos, setPos] = React.useState({ x: 3, y: 0 });
  const [nextPiece, setNextPiece] = React.useState(null);
  const [score, setScore] = React.useState(0);
  const [level, setLevel] = React.useState(1);
  const [lines, setLines] = React.useState(0);
  const [gameOver, setGameOver] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);

  const boardRef = React.useRef(board);
  const pieceRef = React.useRef(piece);
  const posRef = React.useRef(pos);
  const nextRef = React.useRef(nextPiece);
  const scoreRef = React.useRef(score);
  const linesRef = React.useRef(lines);
  const levelRef = React.useRef(level);
  const gameOverRef = React.useRef(gameOver);
  const playingRef = React.useRef(playing);

  React.useEffect(() => { boardRef.current = board; }, [board]);
  React.useEffect(() => { pieceRef.current = piece; }, [piece]);
  React.useEffect(() => { posRef.current = pos; }, [pos]);
  React.useEffect(() => { nextRef.current = nextPiece; }, [nextPiece]);
  React.useEffect(() => { scoreRef.current = score; }, [score]);
  React.useEffect(() => { linesRef.current = lines; }, [lines]);
  React.useEffect(() => { levelRef.current = level; }, [level]);
  React.useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
  React.useEffect(() => { playingRef.current = playing; }, [playing]);

  function randomPiece() {
    const name = PIECE_NAMES[Math.floor(Math.random() * PIECE_NAMES.length)];
    return {
      name,
      shape: TETROMINOES[name].shape.map(r => [...r]),
      color: TETROMINOES[name].color,
    };
  }

  function rotateShape(shape) {
    return shape[0].map((_, i) => shape.map(r => r[i]).reverse());
  }

  function collide(b, p, px, py) {
    if (!p) return true;
    for (let r = 0; r < p.shape.length; r++) {
      for (let c = 0; c < p.shape[0].length; c++) {
        if (!p.shape[r][c]) continue;
        const bx = px + c, by = py + r;
        if (bx < 0 || bx >= COLS || by >= ROWS) return true;
        if (by >= 0 && b[by][bx]) return true;
      }
    }
    return false;
  }

  function lock(b, p, px, py) {
    const nb = b.map(r => [...r]);
    for (let r = 0; r < p.shape.length; r++) {
      for (let c = 0; c < p.shape[0].length; c++) {
        if (!p.shape[r][c]) continue;
        const by = py + r;
        if (by < 0) { setGameOver(true); gameOverRef.current = true; setPlaying(false); playingRef.current = false; return nb; }
        nb[by][px + c] = p.color;
      }
    }
    return nb;
  }

  function clearLines(b) {
    let cleared = 0;
    const nb = b.filter(row => {
      const full = row.every(c => c !== 0);
      if (full) cleared++;
      return !full;
    });
    while (nb.length < ROWS) nb.unshift(Array(COLS).fill(0));
    if (cleared > 0) {
      const pts = [0, 100, 300, 500, 800];
      const ns = scoreRef.current + (pts[cleared] || 0) * levelRef.current;
      const nl = linesRef.current + cleared;
      setScore(ns); scoreRef.current = ns;
      setLines(nl); linesRef.current = nl;
      const nlv = Math.floor(nl / 10) + 1;
      setLevel(nlv); levelRef.current = nlv;
    }
    return nb;
  }

  function spawnNew() {
    const np = nextRef.current || randomPiece();
    const nnext = randomPiece();
    setNextPiece(nnext); nextRef.current = nnext;
    if (collide(boardRef.current, np, 3, 0)) {
      setGameOver(true); gameOverRef.current = true; setPlaying(false); playingRef.current = false;
      return;
    }
    setPiece(np); pieceRef.current = np;
    setPos({ x: 3, y: 0 }); posRef.current = { x: 3, y: 0 };
  }

  function movePiece(dx, dy) {
    if (!playingRef.current || gameOverRef.current || !pieceRef.current) return;
    const np = { x: posRef.current.x + dx, y: posRef.current.y + dy };
    if (!collide(boardRef.current, pieceRef.current, np.x, np.y)) {
      setPos(np); posRef.current = np;
    } else if (dy > 0) {
      const nb = lock(boardRef.current, pieceRef.current, posRef.current.x, posRef.current.y);
      const cb = clearLines(nb);
      setBoard(cb); boardRef.current = cb;
      setPiece(null); pieceRef.current = null;
      spawnNew();
    }
  }

  function rotatePiece() {
    if (!playingRef.current || gameOverRef.current || !pieceRef.current) return;
    const rs = rotateShape(pieceRef.current.shape);
    const rp = { ...pieceRef.current, shape: rs };
    if (!collide(boardRef.current, rp, posRef.current.x, posRef.current.y)) {
      setPiece(rp); pieceRef.current = rp;
    }
  }

  function hardDrop() {
    if (!playingRef.current || gameOverRef.current || !pieceRef.current) return;
    let py = posRef.current.y;
    while (!collide(boardRef.current, pieceRef.current, posRef.current.x, py + 1)) py++;
    const nb = lock(boardRef.current, pieceRef.current, posRef.current.x, py);
    const cb = clearLines(nb);
    setBoard(cb); boardRef.current = cb;
    setPiece(null); pieceRef.current = null;
    const ns = scoreRef.current + 2;
    setScore(ns); scoreRef.current = ns;
    spawnNew();
  }

  function startGame() {
    const nb = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    setBoard(nb); boardRef.current = nb;
    setScore(0); scoreRef.current = 0;
    setLines(0); linesRef.current = 0;
    setLevel(1); levelRef.current = 1;
    setGameOver(false); gameOverRef.current = false;
    setPlaying(true); playingRef.current = true;
    const np = randomPiece();
    setNextPiece(randomPiece());
    nextRef.current = randomPiece();
    setPiece(np); pieceRef.current = np;
    setPos({ x: 3, y: 0 }); posRef.current = { x: 3, y: 0 };
  }

  React.useEffect(() => {
    if (!playing || gameOver) return;
    const interval = setInterval(() => {
      movePiece(0, 1);
    }, Math.max(50, 500 - (levelRef.current - 1) * 40));
    return () => clearInterval(interval);
  }, [playing, gameOver, level]);

  React.useEffect(() => {
    function handleKey(e) {
      if (!playingRef.current || gameOverRef.current) return;
      switch (e.key) {
        case 'ArrowLeft': e.preventDefault(); movePiece(-1, 0); break;
        case 'ArrowRight': e.preventDefault(); movePiece(1, 0); break;
        case 'ArrowDown': e.preventDefault(); movePiece(0, 1); break;
        case 'ArrowUp': e.preventDefault(); rotatePiece(); break;
        case ' ': e.preventDefault(); hardDrop(); break;
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  function renderBoard() {
    const cells = board.map((row, y) => {
      const rowEls = row.map((cell, x) => {
        let bg = '#0a101e';
        if (cell) bg = cell;
        if (piece) {
          for (let r = 0; r < piece.shape.length; r++) {
            for (let c = 0; c < piece.shape[0].length; c++) {
              if (piece.shape[r][c] && pos.x + c === x && pos.y + r === y) bg = piece.color;
            }
          }
        }
        return <div key={x} style={{ width: CELL, height: CELL, background: bg, border: '1px solid #111822' }} />;
      });
      return <div key={y} style={{ display: 'flex' }}>{rowEls}</div>;
    });
    return cells;
  }

  function renderNext() {
    if (!nextPiece) return null;
    const s = nextPiece.shape;
    const size = 18;
    return (
      <div style={{ marginTop: '8px' }}>
        <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>NEXT</div>
        <div style={{ background: '#0a101e', padding: '4px', borderRadius: '4px', display: 'inline-block' }}>
          {s.map((row, r) => (
            <div key={r} style={{ display: 'flex' }}>
              {row.map((cell, c) => (
                <div key={c} style={{
                  width: size, height: size,
                  background: cell ? nextPiece.color : 'transparent',
                  border: cell ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent'
                }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#0B1120', color: '#e2e8f0', fontFamily: "'Courier New', monospace",
      padding: '16px', height: '100%', boxSizing: 'border-box', overflow: 'auto',
      border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
    }}>
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#00f0ff', fontWeight: 'bold', fontSize: '16px' }}>TETRIS</span>
        <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
          <span>Score <span style={{ color: '#ffaa00' }}>{score}</span></span>
          <span>Level <span style={{ color: '#00ff88' }}>{level}</span></span>
          <span>Lines <span style={{ color: '#00f0ff' }}>{lines}</span></span>
        </div>
      </div>
      {!playing && !gameOver && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🧊</div>
          <button onClick={startGame} style={{
            background: '#00f0ff', color: '#0B1120', border: 'none', padding: '10px 30px',
            borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px'
          }}>START GAME</button>
          <p style={{ color: '#667', marginTop: '12px', fontSize: '12px' }}>
            ← → ↓ rotate: ↑ &nbsp; hard drop: Space
          </p>
        </div>
      )}
      {(playing || gameOver) && (
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <div style={{
            border: '1px solid #0f172a', borderRadius: '4px', padding: '2px', background: '#080d18'
          }}>
            {renderBoard()}
          </div>
          <div style={{ textAlign: 'center' }}>
            {renderNext()}
            {gameOver && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ color: '#ff3366', fontSize: '14px', fontWeight: 'bold' }}>GAME OVER</div>
                <button onClick={startGame} style={{
                  marginTop: '8px', background: '#ff3366', color: '#fff', border: 'none',
                  padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
                }}>RESTART</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
