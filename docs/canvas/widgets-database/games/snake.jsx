function Widget({ appBus }) {
  const GRID = 20;
  const CELL = 20;

  const [snake, setSnake] = React.useState([[5, 10], [4, 10], [3, 10]]);
  const [food, setFood] = React.useState([12, 10]);
  const [dir, setDir] = React.useState([1, 0]);
  const [nextDir, setNextDir] = React.useState([1, 0]);
  const [score, setScore] = React.useState(0);
  const [highScore, setHighScore] = React.useState(() => Number(localStorage.getItem('snake-high') || 0));
  const [gameOver, setGameOver] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);
  const [speed, setSpeed] = React.useState(150);

  const speedRef = React.useRef(speed);
  const playingRef = React.useRef(playing);
  const gameOverRef = React.useRef(gameOver);
  const snakeRef = React.useRef(snake);
  const foodRef = React.useRef(food);
  const dirRef = React.useRef(dir);
  const nextDirRef = React.useRef(nextDir);
  const scoreRef = React.useRef(score);

  React.useEffect(() => { speedRef.current = speed; }, [speed]);
  React.useEffect(() => { playingRef.current = playing; }, [playing]);
  React.useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
  React.useEffect(() => { snakeRef.current = snake; }, [snake]);
  React.useEffect(() => { foodRef.current = food; }, [food]);
  React.useEffect(() => { dirRef.current = dir; }, [dir]);
  React.useEffect(() => { nextDirRef.current = nextDir; }, [nextDir]);
  React.useEffect(() => { scoreRef.current = score; }, [score]);

  function spawnFood(snakeArr) {
    const occupied = new Set(snakeArr.map(p => `${p[0]},${p[1]}`));
    const free = [];
    for (let x = 0; x < GRID; x++)
      for (let y = 0; y < GRID; y++)
        if (!occupied.has(`${x},${y}`)) free.push([x, y]);
    if (free.length === 0) return null;
    return free[Math.floor(Math.random() * free.length)];
  }

  function resetGame() {
    const start = [[5, 10], [4, 10], [3, 10]];
    setSnake(start);
    snakeRef.current = start;
    setDir([1, 0]);
    setNextDir([1, 0]);
    dirRef.current = [1, 0];
    nextDirRef.current = [1, 0];
    setScore(0);
    setGameOver(false);
    gameOverRef.current = false;
    setPlaying(true);
    playingRef.current = true;
    const f = spawnFood(start);
    setFood(f);
    foodRef.current = f;
  }

  React.useEffect(() => {
    if (!playing || gameOver) return;
    const interval = setInterval(() => {
      if (!playingRef.current || gameOverRef.current) return;
      const s = snakeRef.current;
      const d = nextDirRef.current;
      dirRef.current = d;
      setDir(d);
      const head = [s[0][0] + d[0], s[0][1] + d[1]];
      if (head[0] < 0 || head[0] >= GRID || head[1] < 0 || head[1] >= GRID ||
          s.some(p => p[0] === head[0] && p[1] === head[1])) {
        setPlaying(false);
        playingRef.current = false;
        setGameOver(true);
        gameOverRef.current = true;
        if (scoreRef.current > highScore) {
          setHighScore(scoreRef.current);
          localStorage.setItem('snake-high', String(scoreRef.current));
        }
        return;
      }
      const ate = head[0] === foodRef.current[0] && head[1] === foodRef.current[1];
      const newSnake = [head, ...s];
      if (!ate) newSnake.pop();
      snakeRef.current = newSnake;
      setSnake(newSnake);
      if (ate) {
        const newScore = scoreRef.current + 1;
        setScore(newScore);
        scoreRef.current = newScore;
        const newFood = spawnFood(newSnake);
        if (!newFood) {
          // win
          setPlaying(false);
          playingRef.current = false;
          setGameOver(true);
          gameOverRef.current = true;
        } else {
          setFood(newFood);
          foodRef.current = newFood;
        }
        const newSpeed = Math.max(50, 150 - newScore * 5);
        setSpeed(newSpeed);
        speedRef.current = newSpeed;
      }
    }, speedRef.current);
    return () => clearInterval(interval);
  }, [playing, gameOver]);

  React.useEffect(() => {
    function handleKey(e) {
      if (!playingRef.current) return;
      const keyMap = {
        ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
        w: [0, -1], W: [0, -1], s: [0, 1], S: [0, 1], a: [-1, 0], A: [-1, 0], d: [1, 0], D: [1, 0]
      };
      const nd = keyMap[e.key];
      if (!nd) return;
      e.preventDefault();
      const cd = dirRef.current;
      if (nd[0] + cd[0] === 0 && nd[1] + cd[1] === 0) return;
      nextDirRef.current = nd;
      setNextDir(nd);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  function renderCell(x, y) {
    const isHead = snake.length > 0 && snake[0][0] === x && snake[0][1] === y;
    const isBody = snake.some((p, i) => i > 0 && p[0] === x && p[1] === y);
    const isFood = food[0] === x && food[1] === y;

    if (isHead) return <div key={`${x}-${y}`} style={{ width: CELL, height: CELL, background: '#00ff88', borderRadius: '4px', boxShadow: '0 0 8px #00ff88' }} />;
    if (isBody) {
      const idx = snake.findIndex(p => p[0] === x && p[1] === y);
      const intensity = 0.3 + 0.7 * (1 - idx / snake.length);
      return <div key={`${x}-${y}`} style={{ width: CELL, height: CELL, background: `rgba(0, 255, 136, ${intensity})`, borderRadius: '3px' }} />;
    }
    if (isFood) return <div key={`${x}-${y}`} style={{ width: CELL, height: CELL, background: '#ff3366', borderRadius: '50%', boxShadow: '0 0 10px #ff3366' }} />;
    return <div key={`${x}-${y}`} style={{ width: CELL, height: CELL, background: '#0a101e' }} />;
  }

  return (
    <div style={{
      background: '#0B1120', color: '#e2e8f0', fontFamily: "'Courier New', monospace",
      padding: '16px', height: '100%', boxSizing: 'border-box', overflow: 'auto',
      border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
    }}>
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#00ff88', fontWeight: 'bold', fontSize: '16px' }}>SNAKE</span>
        <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
          <span>Score: <span style={{ color: '#00ff88' }}>{score}</span></span>
          <span>Best: <span style={{ color: '#ffaa00' }}>{highScore}</span></span>
        </div>
      </div>
      {!playing && !gameOver && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🐍</div>
          <button onClick={resetGame} style={{
            background: '#00ff88', color: '#0B1120', border: 'none', padding: '10px 30px',
            borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px'
          }}>START GAME</button>
          <p style={{ color: '#667', marginTop: '12px', fontSize: '12px' }}>Arrow keys or WASD to steer</p>
        </div>
      )}
      {gameOver && (
        <div style={{ textAlign: 'center', margin: '10px 0' }}>
          <div style={{ color: '#ff3366', fontSize: '20px', fontWeight: 'bold' }}>GAME OVER</div>
          <div style={{ fontSize: '12px', color: '#888', margin: '4px 0 8px' }}>Score: {score} | High: {highScore}</div>
          <button onClick={resetGame} style={{
            background: '#ff3366', color: '#fff', border: 'none', padding: '6px 20px',
            borderRadius: '4px', cursor: 'pointer', fontSize: '13px'
          }}>PLAY AGAIN</button>
        </div>
      )}
      {(playing || gameOver) && (
        <div style={{
          display: 'grid', gridTemplateColumns: `repeat(${GRID}, ${CELL}px)`, gap: '1px',
          background: '#080d18', padding: '2px', border: '1px solid #0f172a', borderRadius: '4px',
          width: 'fit-content', margin: '0 auto'
        }}>
          {Array.from({ length: GRID * GRID }, (_, i) => {
            const x = i % GRID;
            const y = Math.floor(i / GRID);
            return renderCell(x, y);
          })}
        </div>
      )}
    </div>
  );
}
