function Widget({ appBus }) {
  const [board, setBoard] = React.useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = React.useState(true);
  const [winner, setWinner] = React.useState(null);
  const [gameOver, setGameOver] = React.useState(false);
  const [scores, setScores] = React.useState({ X: 0, O: 0, draws: 0 });
  const [mode, setMode] = React.useState('ai'); // ai or 2p
  const [aiPlayer, setAiPlayer] = React.useState('O');

  const boardRef = React.useRef(board);
  const modeRef = React.useRef(mode);
  const aiPlayerRef = React.useRef(aiPlayer);

  React.useEffect(() => { boardRef.current = board; }, [board]);
  React.useEffect(() => { modeRef.current = mode; }, [mode]);
  React.useEffect(() => { aiPlayerRef.current = aiPlayer; }, [aiPlayer]);

  function checkWinner(squares) {
    const lines = [
      [0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]
    ];
    for (const [a,b,c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c])
        return squares[a];
    }
    return null;
  }

  function getWinningLine(squares) {
    const lines = [
      [0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]
    ];
    for (const [a,b,c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c])
        return [a,b,c];
    }
    return null;
  }

  function minimax(squares, isMaximizing, alpha, beta) {
    const w = checkWinner(squares);
    if (w === aiPlayerRef.current) return 10;
    if (w && w !== aiPlayerRef.current) return -10;
    if (squares.every(s => s !== null)) return 0;

    const player = aiPlayerRef.current;
    const opponent = player === 'X' ? 'O' : 'X';

    if (isMaximizing) {
      let best = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (squares[i]) continue;
        squares[i] = player;
        const val = minimax(squares, false, alpha, beta);
        squares[i] = null;
        best = Math.max(best, val);
        alpha = Math.max(alpha, val);
        if (beta <= alpha) break;
      }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < 9; i++) {
        if (squares[i]) continue;
        squares[i] = opponent;
        const val = minimax(squares, true, alpha, beta);
        squares[i] = null;
        best = Math.min(best, val);
        beta = Math.min(beta, val);
        if (beta <= alpha) break;
      }
      return best;
    }
  }

  function getAIMove(squares) {
    const player = aiPlayerRef.current;
    let bestScore = -Infinity;
    let bestMove = -1;
    for (let i = 0; i < 9; i++) {
      if (squares[i]) continue;
      squares[i] = player;
      const score = minimax(squares, false, -Infinity, Infinity);
      squares[i] = null;
      if (score > bestScore) { bestScore = score; bestMove = i; }
    }
    return bestMove;
  }

  function handleClick(index) {
    if (board[index] || gameOver) return;
    const currentPlayer = xIsNext ? 'X' : 'O';
    if (mode === 'ai' && currentPlayer !== 'X') return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    boardRef.current = newBoard;

    const w = checkWinner(newBoard);
    if (w) {
      setWinner(w);
      setGameOver(true);
      setScores(s => ({ ...s, [w]: s[w] + 1 }));
      return;
    }
    if (newBoard.every(s => s !== null)) {
      setGameOver(true);
      setScores(s => ({ ...s, draws: s.draws + 1 }));
      return;
    }

    const next = !xIsNext;
    setXIsNext(next);

    // AI move
    if (mode === 'ai' && next === true) {
      // the AI just moved, now it's X's turn so AI is done
    } else if (mode === 'ai' && !next) {
      // AI's turn (O just moved? No, X just moved, now it's O's turn)
      // Wait, xIsNext means X is next to play
      // If xIsNext is true, it's X's turn
      // If mode is ai and aiPlayer is 'O', AI plays when xIsNext is false
      if (aiPlayer === 'O' && !next) {
        setTimeout(() => {
          const currentBoard = boardRef.current;
          const move = getAIMove(currentBoard);
          if (move >= 0) handleClick(move);
        }, 100);
      }
    }
  }

  // Trigger AI when it's AI's turn initially
  React.useEffect(() => {
    if (mode === 'ai' && gameOver) return;
    if (mode === 'ai' && !xIsNext && aiPlayer === 'O' && board.some(s => s !== null)) {
      const timer = setTimeout(() => {
        const move = getAIMove(boardRef.current);
        if (move >= 0) handleClick(move);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [xIsNext, mode, aiPlayer, gameOver]);

  function resetGame() {
    setBoard(Array(9).fill(null));
    boardRef.current = Array(9).fill(null);
    setXIsNext(true);
    setWinner(null);
    setGameOver(false);
  }

  function switchMode(newMode) {
    setMode(newMode);
    resetGame();
  }

  function renderCell(i) {
    const val = board[i];
    const winLine = winner ? getWinningLine(board) : null;
    const isWin = winLine && winLine.includes(i);

    let bg = '#0a101e';
    let color = val === 'X' ? '#00f0ff' : '#ff3366';
    let glow = 'none';
    if (isWin) {
      bg = val === 'X' ? '#00f0ff22' : '#ff336622';
      glow = val === 'X' ? '0 0 12px #00f0ff' : '0 0 12px #ff3366';
    }
    if (val) color = val === 'X' ? '#00f0ff' : '#ff3366';

    return (
      <div key={i} onClick={() => handleClick(i)} style={{
        width: 80, height: 80, background: bg, color, cursor: gameOver || (mode === 'ai' && !xIsNext && aiPlayer === 'O') ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '36px', fontWeight: 'bold', transition: 'all 0.15s',
        border: '1px solid #0f172a', borderRadius: '4px',
        boxShadow: glow, textShadow: glow,
        userSelect: 'none'
      }}>
        {val === 'X' ? '✕' : val === 'O' ? '◯' : ''}
      </div>
    );
  }

  const status = winner
    ? `Winner: ${winner === 'X' ? '✕' : '◯'}`
    : gameOver ? 'Draw!' : `${xIsNext ? '✕' : '◯'}'s turn`;

  return (
    <div style={{
      background: '#0B1120', color: '#e2e8f0', fontFamily: "'Courier New', monospace",
      padding: '16px', height: '100%', boxSizing: 'border-box', overflow: 'auto',
      border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
    }}>
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#00f0ff', fontWeight: 'bold', fontSize: '16px' }}>TIC-TAC-TOE</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={() => switchMode('ai')} style={{
            background: mode === 'ai' ? '#00f0ff' : '#0f172a', color: mode === 'ai' ? '#0B1120' : '#aaa',
            border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px',
            fontWeight: mode === 'ai' ? 'bold' : 'normal'
          }}>AI</button>
          <button onClick={() => switchMode('2p')} style={{
            background: mode === '2p' ? '#00f0ff' : '#0f172a', color: mode === '2p' ? '#0B1120' : '#aaa',
            border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px',
            fontWeight: mode === '2p' ? 'bold' : 'normal'
          }}>2P</button>
        </div>
      </div>
      <div style={{ marginBottom: '10px', fontSize: '14px', textAlign: 'center', color: '#888' }}>
        {status}
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 80px)', gap: '6px',
        justifyContent: 'center'
      }}>
        {[0,1,2,3,4,5,6,7,8].map(renderCell)}
      </div>
      <div style={{ marginTop: '14px', textAlign: 'center' }}>
        {gameOver && (
          <button onClick={resetGame} style={{
            background: '#00f0ff', color: '#0B1120', border: 'none', padding: '6px 24px',
            borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginBottom: '8px'
          }}>PLAY AGAIN</button>
        )}
      </div>
      <div style={{
        display: 'flex', justifyContent: 'center', gap: '24px',
        padding: '8px', background: '#080d18', borderRadius: '6px',
        fontSize: '14px'
      }}>
        <span>✕ <span style={{ color: '#00f0ff', fontWeight: 'bold' }}>{scores.X}</span></span>
        <span>Draw <span style={{ color: '#888', fontWeight: 'bold' }}>{scores.draws}</span></span>
        <span>◯ <span style={{ color: '#ff3366', fontWeight: 'bold' }}>{scores.O}</span></span>
      </div>
    </div>
  );
}
