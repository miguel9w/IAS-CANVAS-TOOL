function Widget({ appBus }) {
  const [display, setDisplay] = React.useState('0');
  const [history, setHistory] = React.useState([]);
  const [waiting, setWaiting] = React.useState(false);
  const [op, setOp] = React.useState(null);
  const [prev, setPrev] = React.useState(null);

  function inputNum(n) {
    if (waiting) {
      setDisplay(String(n));
      setWaiting(false);
    } else {
      setDisplay(display === '0' && n !== '.' ? String(n) : display + n);
    }
  }

  function inputOp(op2) {
    const cur = parseFloat(display);
    if (prev !== null && !waiting) {
      compute();
    }
    setPrev(cur);
    setOp(op2);
    setWaiting(true);
  }

  function compute() {
    const cur = parseFloat(display);
    let result;
    switch (op) {
      case '+': result = prev + cur; break;
      case '-': result = prev - cur; break;
      case '×': result = prev * cur; break;
      case '÷': result = cur === 0 ? NaN : prev / cur; break;
      default: return;
    }
    if (isNaN(result)) {
      setDisplay('Error');
      setPrev(null);
      setOp(null);
      setWaiting(false);
      return;
    }
    const expr = `${prev} ${op} ${cur} = ${result}`;
    setHistory(h => [expr, ...h].slice(0, 20));
    setDisplay(String(result));
    setPrev(result);
    setWaiting(true);
  }

  function inputPercent() {
    const cur = parseFloat(display);
    setDisplay(String(cur / 100));
  }

  function inputSqrt() {
    const cur = parseFloat(display);
    if (cur < 0) { setDisplay('Error'); return; }
    setDisplay(String(Math.sqrt(cur)));
  }

  function inputPow() {
    const cur = parseFloat(display);
    setDisplay(String(cur * cur));
  }

  function clear() {
    setDisplay('0');
    setPrev(null);
    setOp(null);
    setWaiting(false);
  }

  function clearEntry() {
    setDisplay('0');
    setWaiting(false);
  }

  function backspace() {
    setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
  }

  function handleKey(e) {
    if (e.key >= '0' && e.key <= '9') inputNum(e.key);
    else if (e.key === '.') inputNum('.');
    else if (e.key === '+' || e.key === '-') inputOp(e.key === '+' ? '+' : '-');
    else if (e.key === '*') inputOp('×');
    else if (e.key === '/') { e.preventDefault(); inputOp('÷'); }
    else if (e.key === 'Enter' || e.key === '=') compute();
    else if (e.key === 'Escape') clear();
    else if (e.key === 'Backspace') backspace();
  }

  const btnStyle = (bg = '#1e293b', col = '#e2e8f0') => ({
    background: bg, color: col, border: 'none', borderRadius: '6px',
    padding: '10px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold',
    outline: 'none', transition: 'all 0.1s'
  });

  const containerStyle = {
    background: '#0B1120', padding: '16px', borderRadius: '8px',
    fontFamily: 'monospace', color: '#e2e8f0', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
    border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
  };

  return (
    <div style={containerStyle} tabIndex={0} onKeyDown={handleKey} styleOuter={containerStyle}>
      <div style={{
        fontSize: '28px', fontWeight: 'bold', textAlign: 'right', padding: '8px 4px',
        color: '#22d3ee', fontVariantNumeric: 'tabular-nums', minHeight: '42px',
        overflow: 'hidden', textOverflow: 'ellipsis', borderBottom: '1px solid #1e293b', marginBottom: '8px'
      }}>{display}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '8px' }}>
        <button style={btnStyle('#ef4444', 'white')} onClick={clear}>AC</button>
        <button style={btnStyle('#1e293b')} onClick={backspace}>⌫</button>
        <button style={btnStyle('#1e293b')} onClick={inputPercent}>%</button>
        <button style={btnStyle('#f59e0b', 'white')} onClick={() => inputOp('÷')}>÷</button>
        {[7,8,9].map(n => (
          <button key={n} style={btnStyle('#1e293b')} onClick={() => inputNum(n)}>{n}</button>
        ))}
        <button style={btnStyle('#f59e0b', 'white')} onClick={() => inputOp('×')}>×</button>
        {[4,5,6].map(n => (
          <button key={n} style={btnStyle('#1e293b')} onClick={() => inputNum(n)}>{n}</button>
        ))}
        <button style={btnStyle('#f59e0b', 'white')} onClick={() => inputOp('-')}>-</button>
        {[1,2,3].map(n => (
          <button key={n} style={btnStyle('#1e293b')} onClick={() => inputNum(n)}>{n}</button>
        ))}
        <button style={btnStyle('#f59e0b', 'white')} onClick={() => inputOp('+')}>+</button>
        <button style={btnStyle('#1e293b')} onClick={() => inputNum('0')}>0</button>
        <button style={btnStyle('#1e293b')} onClick={inputSqrt}>√</button>
        <button style={btnStyle('#1e293b')} onClick={inputPow}>x²</button>
        <button style={btnStyle('#22d3ee', '#0B1120')} onClick={compute}>=</button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', fontSize: '11px', color: '#64748b' }}>
        {history.slice(0, 6).map((h, i) => (
          <div key={i} style={{ padding: '2px 4px', borderBottom: '1px solid #0f172a' }}>{h}</div>
        ))}
      </div>
    </div>
  );
}
