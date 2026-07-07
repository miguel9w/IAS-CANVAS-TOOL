function Widget({ appBus }) {
  const [difficulty, setDifficulty] = React.useState(10);
  const [questions, setQuestions] = React.useState([]);
  const [idx, setIdx] = React.useState(0);
  const [answer, setAnswer] = React.useState('');
  const [score, setScore] = React.useState(0);
  const [stars, setStars] = React.useState([]);
  const [feedback, setFeedback] = React.useState(null);
  const [started, setStarted] = React.useState(false);
  const [timed, setTimed] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(60);
  const [done, setDone] = React.useState(false);

  const genQuestions = () => {
    const qs = [];
    for (let i = 0; i < 20; i++) {
      const a = Math.floor(Math.random() * difficulty) + 1;
      const b = Math.floor(Math.random() * difficulty) + 1;
      qs.push({ a, b, answer: a * b });
    }
    return qs;
  };

  const start = (t) => {
    const qs = genQuestions();
    setQuestions(qs);
    setIdx(0);
    setScore(0);
    setStars([]);
    setAnswer('');
    setFeedback(null);
    setStarted(true);
    setDone(false);
    setTimed(t);
    setTimeLeft(t ? 60 : 0);
  };

  React.useEffect(() => {
    if (!timed || !started || done || timeLeft <= 0) return;
    const timer = setTimeout(() => {
      setTimeLeft(t => {
        if (t <= 1) { setDone(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [timed, started, done, timeLeft]);

  const submit = () => {
    const num = parseInt(answer);
    if (isNaN(num)) return;
    const q = questions[idx];
    const correct = num === q.answer;
    if (correct) {
      setScore(s => s + 1);
      setStars(s => [...s, '⭐']);
    }
    setFeedback(correct ? 'correct' : 'incorrect');
    setTimeout(() => {
      if (idx >= questions.length - 1) {
        setDone(true);
      } else {
        setIdx(i => i + 1);
        setAnswer('');
        setFeedback(null);
      }
    }, 800);
  };

  const getStarColor = (i) => {
    if (i <= 4) return '#ffeb3b';
    if (i <= 7) return '#ff9800';
    return '#f44336';
  };

  if (!started) {
    return (
      <div style={{ padding: '16px', fontFamily: 'sans-serif', color: '#e2e8f0', textAlign: 'center', background: '#0B1120', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', color: '#bb86fc' }}>
          MULTIPLICATION QUIZ
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>Difficulty</div>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
            {[{v:5, l:'1-5'}, {v:10, l:'1-10'}, {v:12, l:'1-12'}].map(d => (
              <button key={d.v} onClick={() => setDifficulty(d.v)} style={{
                padding: '6px 14px', background: difficulty === d.v ? '#bb86fc' : '#0f172a',
                border: `1px solid ${difficulty === d.v ? '#bb86fc' : 'rgba(148, 163, 184, 0.08)'}`,
                borderRadius: '4px', color: difficulty === d.v ? '#121212' : '#94a3b8',
                fontSize: '12px', cursor: 'pointer',
              }}>{d.l}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button onClick={() => start(false)} style={{
            padding: '10px 20px', background: '#4caf50', border: 'none', borderRadius: '4px',
            color: '#121212', fontWeight: 'bold', cursor: 'pointer',
          }}>Practice</button>
          <button onClick={() => start(true)} style={{
            padding: '10px 20px', background: '#ff9800', border: 'none', borderRadius: '4px',
            color: '#121212', fontWeight: 'bold', cursor: 'pointer',
          }}>Timed (60s)</button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div style={{ padding: '16px', fontFamily: 'sans-serif', color: '#e2e8f0', textAlign: 'center', background: '#0B1120', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#bb86fc' }}>
          COMPLETE!
        </div>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>
          {stars.map((s, i) => <span key={i} style={{ fontSize: i < 3 ? '24px' : '18px' }}>{s}</span>)}
        </div>
        <div style={{ fontSize: '16px', marginBottom: '4px' }}>
          {score} / {questions.length} correct
        </div>
        <div style={{ fontSize: '13px', color: '#888', marginBottom: '12px' }}>
          {timed && `${timeLeft}s remaining`}
        </div>
        <button onClick={() => { setStarted(false); setDone(false); }} style={{
          padding: '8px 20px', background: '#bb86fc', border: 'none', borderRadius: '4px',
          color: '#121212', fontWeight: 'bold', cursor: 'pointer',
        }}>Play Again</button>
      </div>
    );
  }

  const q = questions[idx];

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif', color: '#e2e8f0', background: '#0B1120', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ color: '#bb86fc', fontWeight: 'bold', fontSize: '12px' }}>
          {timed && <span style={{ color: timeLeft < 10 ? '#f44336' : '#e2e8f0' }}>{timeLeft}s </span>}
          Q{idx + 1}/{questions.length}
        </span>
        <span style={{ color: '#888', fontSize: '12px' }}>Score: {score}</span>
      </div>
      <div style={{
        background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '24px', textAlign: 'center',
        marginBottom: '12px', border: '1px solid rgba(148, 163, 184, 0.08)',
      }}>
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '8px' }}>
          {q.a} × {q.b}
        </div>
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          <input value={answer} onChange={e => setAnswer(e.target.value.replace(/\D/g, ''))}
            onKeyDown={e => e.key === 'Enter' && submit()}
            style={{
              width: '100px', padding: '8px', background: '#0f172a', border: feedback === 'correct' ? '1px solid #4caf50' : feedback === 'incorrect' ? '1px solid #f44336' : '1px solid rgba(148, 163, 184, 0.08)',
              borderRadius: '4px', color: '#e2e8f0', fontSize: '20px', textAlign: 'center',
              fontFamily: 'monospace', outline: 'none',
            }} />
        </div>
      </div>
      {feedback && (
        <div style={{ textAlign: 'center', fontSize: '13px', color: feedback === 'correct' ? '#81c784' : '#ef9a9a', marginBottom: '8px' }}>
          {feedback === 'correct' ? '✓ Correct!' : `✗ Answer: ${q.answer}`}
        </div>
      )}
      <button onClick={submit} disabled={!answer} style={{
        width: '100%', padding: '8px', background: answer ? '#bb86fc' : '#1e293b',
        border: 'none', borderRadius: '4px', color: answer ? '#121212' : '#475569',
        fontWeight: 'bold', fontSize: '13px', cursor: answer ? 'pointer' : 'default',
      }}>Submit</button>
    </div>
  );
}
