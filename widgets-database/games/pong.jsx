function Widget({ appBus }) {
  const W = 560, H = 360;
  const PADDLE_W = 8, PADDLE_H = 60;
  const BALL_SIZE = 8;
  const WIN_SCORE = 7;

  const [ball, setBall] = React.useState({ x: W/2, y: H/2, vx: 3.5, vy: 2.5 });
  const [leftY, setLeftY] = React.useState(H/2 - PADDLE_H/2);
  const [rightY, setRightY] = React.useState(H/2 - PADDLE_H/2);
  const [leftScore, setLeftScore] = React.useState(0);
  const [rightScore, setRightScore] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [gameOver, setGameOver] = React.useState(false);
  const [aiMode, setAiMode] = React.useState(true);
  const [rallies, setRallies] = React.useState(0);

  const ballRef = React.useRef(ball);
  const leftYRef = React.useRef(leftY);
  const rightYRef = React.useRef(rightY);
  const leftScoreRef = React.useRef(leftScore);
  const rightScoreRef = React.useRef(rightScore);
  const ralliesRef = React.useRef(rallies);
  const playingRef = React.useRef(playing);
  const aiModeRef = React.useRef(aiMode);

  const keysRef = React.useRef({ w: false, s: false, ArrowUp: false, ArrowDown: false });

  React.useEffect(() => { ballRef.current = ball; }, [ball]);
  React.useEffect(() => { leftYRef.current = leftY; }, [leftY]);
  React.useEffect(() => { rightYRef.current = rightY; }, [rightY]);
  React.useEffect(() => { leftScoreRef.current = leftScore; }, [leftScore]);
  React.useEffect(() => { rightScoreRef.current = rightScore; }, [rightScore]);
  React.useEffect(() => { ralliesRef.current = rallies; }, [rallies]);
  React.useEffect(() => { playingRef.current = playing; }, [playing]);
  React.useEffect(() => { aiModeRef.current = aiMode; }, [aiMode]);

  React.useEffect(() => {
    function handleKey(e) {
      const k = e.key;
      if (k === 'w' || k === 'W') keysRef.current.w = e.type === 'keydown';
      if (k === 's' || k === 'S') keysRef.current.s = e.type === 'keydown';
      if (k === 'ArrowUp') keysRef.current.ArrowUp = e.type === 'keydown';
      if (k === 'ArrowDown') keysRef.current.ArrowDown = e.type === 'keydown';
    }
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKey);
    };
  }, []);

  function resetBall(dir) {
    return { x: W/2, y: H/2, vx: dir * 3.5, vy: (Math.random() - 0.5) * 4 };
  }

  function startGame() {
    setLeftScore(0); leftScoreRef.current = 0;
    setRightScore(0); rightScoreRef.current = 0;
    setRallies(0); ralliesRef.current = 0;
    setGameOver(false); setPlaying(true); playingRef.current = true;
    setLeftY(H/2 - PADDLE_H/2); leftYRef.current = H/2 - PADDLE_H/2;
    setRightY(H/2 - PADDLE_H/2); rightYRef.current = H/2 - PADDLE_H/2;
    setBall(resetBall(1)); ballRef.current = resetBall(1);
  }

  React.useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      const b = { ...ballRef.current };
      const lY = leftYRef.current;
      let rY = rightYRef.current;
      const lS = leftScoreRef.current;
      const rS = rightScoreRef.current;

      // AI
      if (aiModeRef.current) {
        const target = b.y - PADDLE_H/2 + BALL_SIZE;
        const speed = 3 + Math.min(ralliesRef.current * 0.15, 6);
        if (rY + PADDLE_H/2 < target) rY = Math.min(H - PADDLE_H, rY + speed);
        else if (rY + PADDLE_H/2 > target + 5) rY = Math.max(0, rY - speed);
      } else {
        if (keysRef.current.ArrowUp) rY = Math.max(0, rY - 4.5);
        if (keysRef.current.ArrowDown) rY = Math.min(H - PADDLE_H, rY + 4.5);
      }
      if (keysRef.current.w) lY = Math.max(0, lY - 4.5);
      if (keysRef.current.s) lY = Math.min(H - PADDLE_H, lY + 4.5);

      b.x += b.vx;
      b.y += b.vy;

      // wall bounce
      if (b.y <= 0 || b.y >= H - BALL_SIZE) b.vy = -b.vy;

      // paddle collision left
      if (b.vx < 0 && b.x <= PADDLE_W + BALL_SIZE && b.x >= 0 &&
          b.y + BALL_SIZE > lY && b.y < lY + PADDLE_H) {
        b.vx = -b.vx * 1.05;
        const offset = (b.y + BALL_SIZE/2 - (lY + PADDLE_H/2)) / (PADDLE_H/2);
        b.vy += offset * 2;
        b.x = PADDLE_W + BALL_SIZE;
        setRallies(r => r + 1); ralliesRef.current++;
      }

      // paddle collision right
      if (b.vx > 0 && b.x >= W - PADDLE_W - BALL_SIZE && b.x <= W &&
          b.y + BALL_SIZE > rY && b.y < rY + PADDLE_H) {
        b.vx = -b.vx * 1.05;
        const offset = (b.y + BALL_SIZE/2 - (rY + PADDLE_H/2)) / (PADDLE_H/2);
        b.vy += offset * 2;
        b.x = W - PADDLE_W - BALL_SIZE;
        setRallies(r => r + 1); ralliesRef.current++;
      }

      // scoring
      if (b.x < -BALL_SIZE) {
        const ns = rS + 1;
        setRightScore(ns); rightScoreRef.current = ns;
        if (ns >= WIN_SCORE) { setPlaying(false); playingRef.current = false; setGameOver(true); }
        else { setBall(resetBall(-1)); ballRef.current = resetBall(-1); }
        setRallies(0); ralliesRef.current = 0;
      }
      if (b.x > W + BALL_SIZE) {
        const ns = lS + 1;
        setLeftScore(ns); leftScoreRef.current = ns;
        if (ns >= WIN_SCORE) { setPlaying(false); playingRef.current = false; setGameOver(true); }
        else { setBall(resetBall(1)); ballRef.current = resetBall(1); }
        setRallies(0); ralliesRef.current = 0;
      }

      setLeftY(lY); leftYRef.current = lY;
      setRightY(rY); rightYRef.current = rY;
      setBall(b); ballRef.current = b;
    }, 16);
    return () => clearInterval(interval);
  }, [playing]);

  const isGameActive = playing || gameOver;

  return (
    <div style={{
      background: '#0B1120', color: '#e2e8f0', fontFamily: "'Courier New', monospace",
      padding: '16px', height: '100%', boxSizing: 'border-box', overflow: 'hidden',
      border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
    }}>
      <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#ff8800', fontWeight: 'bold', fontSize: '16px' }}>PONG</span>
        <label style={{ fontSize: '12px', color: '#888', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
          <input type="checkbox" checked={aiMode} onChange={e => setAiMode(e.target.checked)}
            style={{ accentColor: '#ff8800' }} />
          AI Opponent
        </label>
      </div>
      {!isGameActive && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏓</div>
          <button onClick={startGame} style={{
            background: '#ff8800', color: '#0B1120', border: 'none', padding: '10px 30px',
            borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px'
          }}>START GAME</button>
          <p style={{ color: '#667', marginTop: '12px', fontSize: '12px' }}>
            Left: W/S &nbsp; Right: ↑/↓ &nbsp; First to {WIN_SCORE}
          </p>
        </div>
      )}
      {isGameActive && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', marginBottom: '4px', color: '#e2e8f0' }}>
            <span style={{ color: '#00ff88' }}>{leftScore}</span>
            <span style={{ color: '#555', margin: '0 12px' }}>:</span>
            <span style={{ color: '#00f0ff' }}>{rightScore}</span>
            {aiMode && <span style={{ color: '#555', fontSize: '12px', marginLeft: '12px' }}>AI</span>}
          </div>
          <div style={{ position: 'relative', width: W, height: H, background: '#080d18', margin: '0 auto',
            border: '1px solid #0f172a', borderRadius: '4px', overflow: 'hidden' }}>
            {/* center line */}
            <div style={{ position: 'absolute', left: W/2 - 1, top: 0, width: 2, height: H,
              background: '#0f172a', opacity: 0.5 }} />
            {/* ball */}
            {playing && (
              <div style={{
                position: 'absolute', left: ball.x, top: ball.y, width: BALL_SIZE, height: BALL_SIZE,
                background: '#fff', borderRadius: '50%', boxShadow: '0 0 6px #fff'
              }} />
            )}
            {/* left paddle */}
            <div style={{
              position: 'absolute', left: 0, top: leftY, width: PADDLE_W, height: PADDLE_H,
              background: '#00ff88', borderRadius: '3px', boxShadow: '0 0 8px #00ff88'
            }} />
            {/* right paddle */}
            <div style={{
              position: 'absolute', right: 0, top: rightY, width: PADDLE_W, height: PADDLE_H,
              background: '#00f0ff', borderRadius: '3px', boxShadow: '0 0 8px #00f0ff'
            }} />
            {/* game over overlay */}
            {gameOver && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{ color: '#ff8800', fontSize: '24px', fontWeight: 'bold' }}>WINNER!</div>
                <div style={{ color: '#e2e8f0', fontSize: '16px', margin: '8px 0' }}>
                  {leftScore >= WIN_SCORE ? 'Left Player' : aiMode ? 'AI' : 'Right Player'}
                </div>
                <button onClick={startGame} style={{
                  background: '#ff8800', color: '#0B1120', border: 'none', padding: '8px 24px',
                  borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px'
                }}>PLAY AGAIN</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
