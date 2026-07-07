function Widget({ appBus }) {
  const [left, setLeft] = React.useState('');
  const [right, setRight] = React.useState('');

  function lcs(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Int32Array(n + 1));
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
    const result = [];
    let i = m, j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
        result.unshift({ type: 'same', char: a[i - 1] });
        i--; j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        result.unshift({ type: 'add', char: b[j - 1] });
        j--;
      } else {
        result.unshift({ type: 'remove', char: a[i - 1] });
        i--;
      }
    }
    return result;
  }

  const diff = lcs(left, right);

  const containerStyle = {
    background: '#0B1120', padding: '16px', borderRadius: '8px',
    border: '1px solid rgba(34, 211, 238, 0.15)',
    boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
    fontFamily: 'monospace', color: '#e2e8f0', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column'
  };
  const rowStyle = { display: 'flex', gap: '8px', flex: 1, minHeight: 0 };
  const halfStyle = { flex: 1, display: 'flex', flexDirection: 'column' };

  return (
    <div style={containerStyle}>
      <div style={rowStyle}>
        <div style={halfStyle}>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Original</div>
          <textarea value={left} onChange={e => setLeft(e.target.value)}
            style={{
              flex: 1, background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(148, 163, 184, 0.08)',
              borderRadius: '4px', padding: '8px', fontFamily: 'monospace', fontSize: '13px',
              resize: 'none', outline: 'none'
            }} />
        </div>
        <div style={halfStyle}>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Modified</div>
          <textarea value={right} onChange={e => setRight(e.target.value)}
            style={{
              flex: 1, background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(148, 163, 184, 0.08)',
              borderRadius: '4px', padding: '8px', fontFamily: 'monospace', fontSize: '13px',
              resize: 'none', outline: 'none'
            }} />
        </div>
      </div>
      {diff.length > 0 && (
        <div style={{
          marginTop: '8px', background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)',
          borderRadius: '4px', padding: '8px', fontSize: '14px', lineHeight: '1.6',
          maxHeight: '120px', overflow: 'auto', fontFamily: 'monospace', wordBreak: 'break-all'
        }}>
          {diff.map((d, i) => (
            <span key={i} style={{
              background: d.type === 'add' ? '#064e3b' : d.type === 'remove' ? '#450a0a' : 'transparent',
              color: d.type === 'add' ? '#6ee7b7' : d.type === 'remove' ? '#fca5a5' : '#e2e8f0',
              textDecoration: d.type === 'remove' ? 'line-through' : 'none'
            }}>{d.char === ' ' ? '\u00A0' : d.char}</span>
          ))}
        </div>
      )}
    </div>
  );
}
