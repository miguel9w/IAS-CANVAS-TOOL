function Widget({ appBus }) {
  const wordBank = ['the','quick','brown','fox','jumps','lazy','dog','hello','world','react','javascript','function','closure','async','await','promise','reduce','filter','spread','destructure','component','state','effect','callback','module','bundle','compiler','render','virtual','dom','event','loop','stack','queue','prototype','class','extends','static','getter','setter','arrow','template','literal','symbol','iterator','generator','proxy','reflect','proxy','memo','context','ref','portal','fragment','suspense','lazy','memoize','throttle','debounce','curry','compose','pipe','partial','memoization','recursion','tail','call','apply','bind','hoist','scope','chain','closure','module','pattern','singleton','factory','observer','pubsub','middleware','decorator','mixin','trait','interface','abstract','polymorphism','encapsulation','inheritance','composition'];
  const [words, setWords] = React.useState([]);
  const [input, setInput] = React.useState('');
  const [wordIdx, setWordIdx] = React.useState(0);
  const [charIdx, setCharIdx] = React.useState(0);
  const [correct, setCorrect] = React.useState(0);
  const [total, setTotal] = React.useState(0);
  const [startTime, setStartTime] = React.useState(null);
  const [timeLeft, setTimeLeft] = React.useState(30);
  const [mode, setMode] = React.useState(30);
  const [running, setRunning] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const initWords = () => {
    const shuffled = [...wordBank].sort(() => Math.random() - 0.5).slice(0, 30);
    setWords(shuffled);
    setWordIdx(0);
    setCharIdx(0);
    setCorrect(0);
    setTotal(0);
    setInput('');
    setStartTime(null);
    setDone(false);
  };

  const start = (m) => {
    setMode(m);
    setTimeLeft(m);
    setRunning(true);
    setStartTime(Date.now());
    initWords();
  };

  React.useEffect(() => {
    if (!running || done) return;
    if (timeLeft <= 0) {
      setRunning(false);
      setDone(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [running, timeLeft, done]);

  const handleInput = (e) => {
    if (!running || done) return;
    const val = e.target.value;
    if (val.endsWith(' ')) {
      const typed = val.trim();
      if (typed === words[wordIdx]) setCorrect(c => c + 1);
      setTotal(t => t + 1);
      setWordIdx(w => w + 1);
      setCharIdx(0);
      setInput('');
      if (wordIdx >= words.length - 1) {
        const extra = [...wordBank].sort(() => Math.random() - 0.5).slice(0, 20);
        setWords(w => [...w, ...extra]);
      }
    } else {
      setInput(val);
      setCharIdx(val.length);
    }
  };

  const wpm = running || done ? Math.round((correct / ((mode - timeLeft) / 60)) || 0) : 0;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100;

  const renderWord = (w, idx) => {
    if (idx < wordIdx) {
      return <span key={idx} style={{ color: '#4caf50', opacity: 0.5 }}>{w} </span>;
    }
    if (idx === wordIdx) {
      const typed = input;
      return (
        <span key={idx} style={{ background: '#1e293b', borderRadius: '2px', padding: '0 2px' }}>
          {w.split('').map((ch, ci) => {
            let c = '#e2e8f0';
            if (ci < typed.length) c = typed[ci] === ch ? '#4caf50' : '#f44336';
            return <span key={ci} style={{ color: c }}>{ch}</span>;
          })}
          {typed.length < w.length && (
            <span style={{
              display: 'inline-block', width: '2px', height: '14px',
              background: '#bb86fc', animation: 'blink 0.5s infinite',
              verticalAlign: 'text-bottom', marginLeft: '1px',
            }} />
          )}
          {' '}
        </span>
      );
    }
    return <span key={idx} style={{ color: '#475569' }}>{w} </span>;
  };

  if (!running && !done) {
    return (
      <div style={{ padding: '16px', fontFamily: 'monospace', color: '#e2e8f0', textAlign: 'center', background: '#0B1120', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', color: '#bb86fc' }}>
          TYPING TUTOR
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button onClick={() => start(30)} style={{
            padding: '10px 24px', background: '#4caf50', border: 'none', borderRadius: '4px',
            color: '#121212', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer',
          }}>30s</button>
          <button onClick={() => start(60)} style={{
            padding: '10px 24px', background: '#ff9800', border: 'none', borderRadius: '4px',
            color: '#121212', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer',
          }}>60s</button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div style={{ padding: '16px', fontFamily: 'monospace', color: '#e2e8f0', textAlign: 'center', background: '#0B1120', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#bb86fc' }}>RESULTS</div>
        <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>{wpm}</div>
        <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>WPM</div>
        <div style={{ fontSize: '14px', marginBottom: '4px' }}>Accuracy: <span style={{ color: accuracy >= 90 ? '#81c784' : '#ff9800' }}>{accuracy}%</span></div>
        <div style={{ fontSize: '14px', marginBottom: '16px' }}>Correct: {correct}/{total}</div>
        <button onClick={() => { setRunning(false); setDone(false); }} style={{
          padding: '8px 20px', background: '#bb86fc', border: 'none', borderRadius: '4px',
          color: '#121212', fontWeight: 'bold', cursor: 'pointer',
        }}>Try Again</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', fontFamily: 'monospace', color: '#e2e8f0', background: '#0B1120', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div><span style={{ color: '#bb86fc', fontWeight: 'bold' }}>{timeLeft}</span><span style={{ color: '#888', fontSize: '11px' }}>s</span></div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#81c784', fontSize: '18px', fontWeight: 'bold' }}>{wpm}</div>
          <div style={{ color: '#888', fontSize: '10px' }}>wpm</div>
        </div>
      </div>
      <div style={{
        background: 'rgba(255,255,255,0.03)', borderRadius: '6px', padding: '12px', marginBottom: '12px',
        minHeight: '40px', fontSize: '16px', lineHeight: '1.8', border: '1px solid rgba(148, 163, 184, 0.08)',
      }}>
        {words.map((w, i) => renderWord(w, i))}
      </div>
      <input value={input} onChange={handleInput} autoFocus
        style={{
          width: '100%', padding: '8px', background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)',
          borderRadius: '4px', color: '#e2e8f0', fontSize: '16px', fontFamily: 'monospace',
          outline: 'none', boxSizing: 'border-box',
        }} placeholder="Type here..." />
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </div>
  );
}
