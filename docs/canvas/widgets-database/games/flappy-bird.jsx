function Widget({ appBus }) {
  const W = 320, H = 480;
  const GRAVITY = 0.45;
  const FLAP = -7;
  const PIPE_W = 45;
  const PIPE_GAP = 130;
  const PIPE_SPEED = 2.5;
  const BIRD_R = 12;

  const [bird, setBird] = React.useState({ x: 60, y: H/2, vy: 0 });
  const [pipes, setPipes] = React.useState([]);
  const [score, setScore] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [gameOver, setGameOver] = React.useState(false);
  const [frame, setFrame] = React.useState(0);

  const birdRef = React.useRef(bird);
  const pipesRef = React.useRef(pipes);
  const scoreRef = React.useRef(score);
  const playingRef = React.useRef(playing);
  const gameOverRef = React.useRef(gameOver);
  const frameRef = React.useRef(0);

  React.useEffect(() => { birdRef.current = bird; }, [bird]);
  React.useEffect(() => { pipesRef.current = pipes; }, [pipes]);
  React.useEffect(() => { scoreRef.current = score; }, [score]);
  React.useEffect(() => { playingRef.current = playing; }, [playing]);
  React.useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);

  function flap() {
    if (gameOverRef.current) {
      startGame();
      return;
    }
    if (!playingRef.current) return;
    setBird(b => ({ ...b, vy: FLAP }));
  }

  function startGame() {
    setBird({ x: 60, y: H/2, vy: 0 }); birdRef.current = { x: 60, y: H/2, vy: 0 };
    setPipes([]); pipesRef.current = [];
    setScore(0); scoreRef.current = 0;
    setGameOver(false); gameOverRef.current = false;
    setPlaying(true); playingRef.current = true;
  }

  React.useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setFrame(f => f + 1);
      const b = { ...birdRef.current };
      const p = pipesRef.current.map(pipe => ({ ...pipe }));

      // bird physics
      b.vy += GRAVITY;
      b.y += b.vy;

      // check floor/ceiling
      if (b.y + BIRD_R >= H || b.y - BIRD_R <= 0) {
        setPlaying(false); playingRef.current = false;
        setGameOver(true); gameOverRef.current = true;
        return;
      }

      // move pipes
      for (let i = p.length - 1; i >= 0; i--) {
        p[i].x -= PIPE_SPEED;
        if (p[i].x + PIPE_W < 0) {
          p.splice(i, 1);
          const sc = scoreRef.current + 1;
          setScore(sc); scoreRef.current = sc;
        }
      }

      // spawn pipes
      const lastPipe = p[p.length - 1];
      if (!lastPipe || lastPipe.x < W - 160) {
        const gapY = 80 + Math.random() * (H - PIPE_GAP - 160);
        p.push({ x: W, gapY, scored: false });
      }

      // collision
      for (const pipe of p) {
        if (b.x + BIRD_R > pipe.x && b.x - BIRD_R < pipe.x + PIPE_W) {
          if (b.y - BIRD_R < pipe.gapY || b.y + BIRD_R > pipe.gapY + PIPE_GAP) {
            setPlaying(false); playingRef.current = false;
            setGameOver(true); gameOverRef.current = true;
            return;
          }
        }
      }

      setBird(b); birdRef.current = b;
      setPipes(p); pipesRef.current = p;
    }, 16);
    return () => clearInterval(interval);
  }, [playing]);

  React.useEffect(() => {
    function handleKey(e) {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault(); flap();
      }
    }
    function handleClick() { flap(); }
    window.addEventListener('keydown', handleKey);
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div style={{
      background: '#0B1120', color: '#e2e8f0', fontFamily: "'Courier New', monospace",
      padding: '16px', height: '100%', boxSizing: 'border-box', overflow: 'hidden',
      border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
    }}>
      <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#ffaa00', fontWeight: 'bold', fontSize: '16px' }}>FLAPPY BIRD</span>
        {playing && <span style={{ color: '#ffaa00', fontSize: '18px', fontWeight: 'bold' }}>{score}</span>}
      </div>
      {!playing && !gameOver && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🐤</div>
          <button onClick={startGame} style={{
            background: '#ffaa00', color: '#0B1120', border: 'none', padding: '10px 30px',
            borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px'
          }}>START GAME</button>
          <p style={{ color: '#667', marginTop: '12px', fontSize: '12px' }}>Space / Click to flap</p>
        </div>
      )}
      {(playing || gameOver) && (
        <div style={{
          position: 'relative', width: W, height: H, background: '#0a1520', margin: '0 auto',
          border: '1px solid #0f172a', borderRadius: '4px', overflow: 'hidden'
        }}>
          {/* bird trail */}
          <div style={{
            position: 'absolute', left: bird.x - BIRD_R, top: bird.y - BIRD_R,
            width: BIRD_R * 2, height: BIRD_R * 2, borderRadius: '50%',
            background: `radial-gradient(circle, #ffaa00 0%, #ff8800 60%, #ff6600 100%)`,
            boxShadow: `0 0 12px #ffaa00, 0 0 24px #ff880066`,
            transform: `rotate(${bird.vy * 4}deg)`,
            transition: 'transform 0.05s'
          }} />
          {/* bird eye */}
          <div style={{
            position: 'absolute', left: bird.x + 4, top: bird.y - 4,
            width: 5, height: 5, borderRadius: '50%', background: '#fff',
            boxShadow: '0 0 3px #fff'
          }} />
          {/* pipes */}
          {pipes.map((pipe, i) => (
            <div key={i}>
              {/* top pipe */}
              <div style={{
                position: 'absolute', left: pipe.x, top: 0,
                width: PIPE_W, height: pipe.gapY,
                background: 'linear-gradient(180deg, #00cc66, #008844)',
                borderBottom: '3px solid #005522',
                borderRadius: '0 0 3px 3px'
              }} />
              {/* bottom pipe */}
              <div style={{
                position: 'absolute', left: pipe.x, top: pipe.gapY + PIPE_GAP,
                width: PIPE_W, height: H - pipe.gapY - PIPE_GAP,
                background: 'linear-gradient(0deg, #00cc66, #008844)',
                borderTop: '3px solid #005522',
                borderRadius: '3px 3px 0 0'
              }} />
            </div>
          ))}
          {/* game over overlay */}
          {gameOver && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{ color: '#ff3366', fontSize: '22px', fontWeight: 'bold' }}>GAME OVER</div>
              <div style={{ color: '#ffaa00', fontSize: '16px', margin: '8px 0' }}>Score: {score}</div>
              <button onClick={startGame} style={{
                background: '#ffaa00', color: '#0B1120', border: 'none', padding: '8px 24px',
                borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px'
              }}>RESTART</button>
              <p style={{ color: '#667', marginTop: '8px', fontSize: '11px' }}>Space / Click to restart</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
