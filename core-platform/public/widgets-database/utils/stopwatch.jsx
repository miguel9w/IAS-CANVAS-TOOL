function Widget({ appBus }) {
  const [time, setTime] = React.useState(0);
  const [running, setRunning] = React.useState(false);
  const [laps, setLaps] = React.useState([]);
  const startRef = React.useRef(null);
  const intervalRef = React.useRef(null);

  React.useEffect(() => {
    if (running) {
      startRef.current = Date.now() - time;
      intervalRef.current = setInterval(() => {
        setTime(Date.now() - startRef.current);
      }, 10);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  function format(t) {
    const cs = Math.floor(t / 10) % 100;
    const s = Math.floor(t / 1000) % 60;
    const m = Math.floor(t / 60000) % 60;
    const h = Math.floor(t / 3600000);
    return `${h > 0 ? h + ':' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  }

  function reset() {
    setRunning(false);
    setTime(0);
    setLaps([]);
  }

  function lap() {
    if (running) {
      const prev = laps.length > 0 ? laps[laps.length - 1].total : 0;
      setLaps([...laps, { total: time, diff: time - prev, index: laps.length + 1 }]);
    }
  }

  const containerStyle = {
    background: '#0B1120', padding: '16px', borderRadius: '8px',
    fontFamily: 'monospace', color: '#e2e8f0', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
    border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
  };
  const btn = { border: '1px solid #334155', borderRadius: '4px', padding: '7px 16px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', marginRight: '6px' };

  return (
    <div style={containerStyle}>
      <div style={{
        fontSize: '36px', fontWeight: 'bold', textAlign: 'center',
        color: '#22d3ee', fontVariantNumeric: 'tabular-nums', padding: '16px 0',
        letterSpacing: '2px'
      }}>{format(time)}</div>
      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        <button style={{ ...btn, background: running ? '#f59e0b' : '#22d3ee', color: '#0B1120', borderColor: running ? '#f59e0b' : '#22d3ee' }}
          onClick={() => setRunning(!running)}>{running ? 'Pause' : 'Start'}</button>
        <button style={{ ...btn, background: '#1e293b', color: '#e2e8f0' }} onClick={lap}>Lap</button>
        <button style={{ ...btn, background: '#1e293b', color: '#e2e8f0' }} onClick={reset}>Reset</button>
      </div>
      {laps.length > 0 && (
        <div style={{ flex: 1, overflow: 'auto' }}>
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: '#64748b', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '4px', textAlign: 'left' }}>#</th>
                <th style={{ padding: '4px', textAlign: 'right' }}>Lap</th>
                <th style={{ padding: '4px', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {laps.slice().reverse().map(l => (
                <tr key={l.index} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '4px', color: '#64748b' }}>{l.index}</td>
                  <td style={{ padding: '4px', textAlign: 'right', color: '#22d3ee' }}>{format(l.diff)}</td>
                  <td style={{ padding: '4px', textAlign: 'right', color: '#94a3b8' }}>{format(l.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
