function Widget({ appBus }) {
  const [length, setLength] = React.useState(16);
  const [upper, setUpper] = React.useState(true);
  const [lower, setLower] = React.useState(true);
  const [nums, setNums] = React.useState(true);
  const [symbols, setSymbols] = React.useState(true);
  const [password, setPassword] = React.useState('');
  const [strength, setStrength] = React.useState('medium');
  const [copied, setCopied] = React.useState(false);

  const chars = { upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', lower: 'abcdefghijklmnopqrstuvwxyz', nums: '0123456789', symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?' };

  function generate() {
    let pool = '';
    if (upper) pool += chars.upper;
    if (lower) pool += chars.lower;
    if (nums) pool += chars.nums;
    if (symbols) pool += chars.symbols;
    if (!pool) { setPassword('Select char types'); return; }
    let result = '';
    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    for (let i = 0; i < length; i++) {
      result += pool[arr[i] % pool.length];
    }
    setPassword(result);

    let score = 0;
    if (upper) score += 1;
    if (lower) score += 1;
    if (nums) score += 1;
    if (symbols) score += 2;
    if (length >= 12) score += 2;
    else if (length >= 8) score += 1;
    if (length >= 16) score += 1;
    setStrength(score >= 6 ? 'strong' : score >= 4 ? 'medium' : 'weak');
  }

  React.useEffect(() => { generate(); }, [length, upper, lower, nums, symbols]);

  function copy() {
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const strengthColor = { weak: '#ef4444', medium: '#f59e0b', strong: '#22c55e' };
  const containerStyle = {
    background: '#0B1120', padding: '16px', borderRadius: '8px',
    fontFamily: 'monospace', color: '#e2e8f0', height: '100%', boxSizing: 'border-box',
    border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
  };
  const labelStyle = { fontSize: '11px', color: '#94a3b8', marginBottom: '4px', display: 'block' };

  return (
    <div style={containerStyle}>
      <div style={{
        background: '#1e293b', border: '1px solid #334155', borderRadius: '6px',
        padding: '10px 12px', marginBottom: '12px', fontSize: '18px',
        fontFamily: 'monospace', color: '#22d3ee', wordBreak: 'break-all',
        minHeight: '24px', letterSpacing: '1px'
      }}>{password}</div>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
        <button onClick={generate} style={{
          background: '#22d3ee', color: '#0B1120', border: 'none', borderRadius: '4px',
          padding: '7px 16px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px'
        }}>🔄 Regenerate</button>
        <button onClick={copy} style={{
          background: copied ? '#10b981' : '#1e293b', color: '#e2e8f0', border: '1px solid #334155',
          borderRadius: '4px', padding: '7px 16px', cursor: 'pointer', fontSize: '12px'
        }}>{copied ? '✓ Copied' : 'Copy'}</button>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <div style={{
          flex: 1, height: '8px', borderRadius: '4px', background: '#1e293b', overflow: 'hidden'
        }}>
          <div style={{
            height: '100%', width: strength === 'weak' ? '33%' : strength === 'medium' ? '66%' : '100%',
            background: strengthColor[strength], borderRadius: '4px', transition: 'all 0.3s'
          }} />
        </div>
        <span style={{
          fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold',
          color: strengthColor[strength]
        }}>{strength}</span>
      </div>
      <label style={labelStyle}>Length: {length}</label>
      <input type="range" min={8} max={64} value={length}
        onChange={e => setLength(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#22d3ee', marginBottom: '12px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {[
          [upper, setUpper, 'Uppercase (A-Z)'],
          [lower, setLower, 'Lowercase (a-z)'],
          [nums, setNums, 'Numbers (0-9)'],
          [symbols, setSymbols, 'Symbols (!@#$%)']
        ].map(([val, setter, label]) => (
          <label key={label} style={{
            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px'
          }}>
            <input type="checkbox" checked={val} onChange={e => setter(e.target.checked)}
              style={{ accentColor: '#22d3ee' }} />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}
