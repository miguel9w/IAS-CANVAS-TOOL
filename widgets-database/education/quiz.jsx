function Widget({ appBus }) {
  const questions = [
    { q: 'What is the capital of France?', opts: ['London', 'Paris', 'Berlin', 'Madrid'], ans: 1 },
    { q: 'Who painted the Mona Lisa?', opts: ['Van Gogh', 'Picasso', 'da Vinci', 'Rembrandt'], ans: 2 },
    { q: 'What is the largest planet?', opts: ['Mars', 'Saturn', 'Venus', 'Jupiter'], ans: 3 },
    { q: 'What year did WWII end?', opts: ['1944', '1945', '1946', '1947'], ans: 1 },
    { q: 'Which element is H?', opts: ['Helium', 'Hydrogen', 'Hafnium', 'Holmium'], ans: 1 },
    { q: 'What language is React written in?', opts: ['Python', 'Java', 'JavaScript', 'C++'], ans: 2 },
    { q: 'What is the speed of light?', opts: ['3×10⁶ m/s', '3×10⁸ m/s', '3×10¹⁰ m/s', '3×10¹² m/s'], ans: 1 },
    { q: 'Who wrote "1984"?', opts: ['Huxley', 'Orwell', 'Bradbury', 'Zamyatin'], ans: 1 },
    { q: 'What is 2^10?', opts: ['512', '1024', '2048', '256'], ans: 1 },
    { q: 'Which ocean is deepest?', opts: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], ans: 3 },
  ];

  const [idx, setIdx] = React.useState(0);
  const [selected, setSelected] = React.useState(null);
  const [answered, setAnswered] = React.useState(false);
  const [score, setScore] = React.useState(0);
  const [done, setDone] = React.useState(false);

  const handleAnswer = (optIdx) => {
    if (answered) return;
    setSelected(optIdx);
    setAnswered(true);
    if (optIdx === questions[idx].ans) setScore(s => s + 1);
  };

  const next = () => {
    if (idx < questions.length - 1) {
      setIdx(idx + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setDone(true);
    }
  };

  const reset = () => {
    setIdx(0); setSelected(null); setAnswered(false); setScore(0); setDone(false);
  };

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const grade = pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F';
    return (
      <div style={{ padding: '16px', fontFamily: 'sans-serif', color: '#e2e8f0', textAlign: 'center', background: '#0B1120', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>{pct >= 70 ? '🎉' : '📚'}</div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>{score} / {questions.length}</div>
        <div style={{ fontSize: '14px', color: pct >= 70 ? '#81c784' : '#ef9a9a', marginBottom: '12px' }}>
          {pct}% — Grade {grade}
        </div>
        <button onClick={reset} style={{
          padding: '8px 20px', background: '#bb86fc', border: 'none', borderRadius: '4px',
          color: '#121212', fontWeight: 'bold', cursor: 'pointer',
        }}>Try Again</button>
      </div>
    );
  }

  const q = questions[idx];
  const correct = answered && selected === q.ans;

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif', color: '#e2e8f0', background: '#0B1120', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
      <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#bb86fc' }}>
        GENERAL KNOWLEDGE QUIZ
      </div>
      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '12px' }}>
        Question {idx + 1} of {questions.length} · Score: {score}
      </div>
      <div style={{
        background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '16px',
        marginBottom: '12px', border: '1px solid rgba(148, 163, 184, 0.08)',
        fontSize: '14px', lineHeight: '1.5',
      }}>
        {q.q}
      </div>
      {q.opts.map((opt, i) => {
        let bg = 'rgba(255,255,255,0.03)';
        let border = 'rgba(148, 163, 184, 0.08)';
        if (answered) {
          if (i === q.ans) { bg = 'rgba(76,175,80,0.15)'; border = '#4caf50'; }
          else if (i === selected && i !== q.ans) { bg = 'rgba(244,67,54,0.15)'; border = '#f44336'; }
        } else if (selected === i) {
          bg = 'rgba(187,134,252,0.1)'; border = '#bb86fc';
        }
        return (
          <div key={i} onClick={() => handleAnswer(i)} style={{
            padding: '8px 12px', marginBottom: '4px', borderRadius: '4px',
            background: bg, border: `1px solid ${border}`, cursor: answered ? 'default' : 'pointer',
            fontSize: '13px', transition: 'all 0.15s',
            color: answered && i === q.ans ? '#81c784' : answered && i === selected && i !== q.ans ? '#ef9a9a' : '#94a3b8',
          }}>
            {answered && i === q.ans ? '✓ ' : answered && i === selected && i !== q.ans ? '✗ ' : ''}
            {opt}
          </div>
        );
      })}
      {answered && (
        <button onClick={next} style={{
          width: '100%', padding: '8px', marginTop: '12px', background: '#bb86fc',
          border: 'none', borderRadius: '4px', color: '#121212', fontWeight: 'bold',
          fontSize: '13px', cursor: 'pointer',
        }}>{idx < questions.length - 1 ? 'Next Question' : 'See Results'}</button>
      )}
    </div>
  );
}
