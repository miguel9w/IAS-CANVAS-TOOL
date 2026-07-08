function Widget({ appBus }) {
  var WORK = 25 * 60;
  var BREAK = 5 * 60;
  var LONG_BREAK = 15 * 60;
  var LONG_AFTER = 4;

  var [phase, setPhase] = React.useState('work');
  var [timeLeft, setTimeLeft] = React.useState(WORK);
  var [running, setRunning] = React.useState(false);
  var [session, setSession] = React.useState(1);

  React.useEffect(function() {
    if (!running) return;
    var interval = setInterval(function() {
      setTimeLeft(function(prev) {
        if (prev <= 1) {
          var nextSession = phase === 'work' ? session : session;
          if (phase === 'work') nextSession = session;
          var isLongBreak = phase === 'work' && session % LONG_AFTER === 0;
          var nextPhase = phase === 'work' ? 'break' : 'work';
          var nextTime = nextPhase === 'work' ? WORK : (isLongBreak && phase === 'work' ? LONG_BREAK : BREAK);

          if (phase === 'work') {
            nextSession = session + 1;
          }

          setPhase(nextPhase);
          setSession(nextSession);
          setTimeLeft(nextTime);

          if (appBus && appBus.notify) {
            appBus.notify({ type: 'pomodoro', phase: nextPhase });
          }

          return nextTime;
        }
        return prev - 1;
      });
    }, 1000);
    return function() { clearInterval(interval); };
  }, [running, phase, session]);

  var toggle = function() { setRunning(!running); };
  var reset = function() {
    setRunning(false);
    setPhase('work');
    setTimeLeft(WORK);
    setSession(1);
  };

  var totalPhase = phase === 'work' ? WORK : (session > 0 && session % LONG_AFTER === 0 && phase === 'work' ? WORK : (phase === 'break' ? (session % LONG_AFTER === 0 ? LONG_BREAK : BREAK) : WORK));
  var pct = ((totalPhase - timeLeft) / totalPhase) * 100;
  var radius = 60;
  var circ = 2 * Math.PI * radius;
  var offset = circ - (pct / 100) * circ;

  var mins = Math.floor(timeLeft / 60);
  var secs = timeLeft % 60;
  var pad = function(n) { return n < 10 ? '0' + n : '' + n; };

  return (
    <div style={{
      background: '#0B1120', color: '#e2e8f0', fontFamily: "'Segoe UI',system-ui,sans-serif",
      padding: '20px', borderRadius: '12px', height: '100%', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px',
      border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
    }}>
      <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>
        Pomodoro
      </h2>
      <div style={{
        fontSize: '11px', color: '#94a3b8', padding: '3px 10px',
        background: phase === 'work' ? '#22d3ee' : '#1a3a1a',
        borderRadius: '12px', fontWeight: 600,
        color: phase === 'work' ? '#0B1120' : '#34d399'
      }}>
        {phase === 'work' ? 'FOCUS' : 'BREAK'}
      </div>
      <svg width="150" height="150" viewBox="0 0 150 150">
        <circle cx="75" cy="75" r={radius} fill="none" stroke="#0f172a" strokeWidth="8" />
        <circle cx="75" cy="75" r={radius} fill="none"
          stroke={phase === 'work' ? '#4a9eff' : '#34d399'} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '75px 75px', transition: 'stroke-dashoffset 0.5s' }} />
        <text x="75" y="65" textAnchor="middle" fill="#e2e8f0" fontSize="28" fontWeight="700" fontFamily="'Segoe UI',sans-serif" dominantBaseline="central">
          {pad(mins)}:{pad(secs)}
        </text>
        <text x="75" y="95" textAnchor="middle" fill="#888" fontSize="11" fontFamily="'Segoe UI',sans-serif">
          Session #{session}
        </text>
      </svg>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={toggle}
          style={{
            padding: '8px 24px', background: running ? '#22d3ee' : '#34d399',
            border: 'none', borderRadius: '8px',
            color: running ? '#0B1120' : '#0B1120',
            fontWeight: 600, cursor: 'pointer', fontSize: '14px'
          }}>
          {running ? 'Pause' : 'Start'}
        </button>
        <button onClick={reset}
          style={{
            padding: '8px 16px', background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)',
            borderRadius: '8px', color: '#94a3b8', cursor: 'pointer', fontSize: '12px'
          }}>
          Reset
        </button>
      </div>
    </div>
  );
}
