function Widget({ appBus }) {
  const [pattern, setPattern] = React.useState('');
  const [testStr, setTestStr] = React.useState('');
  const [flags, setFlags] = React.useState('g');
  const [matches, setMatches] = React.useState([]);
  const [error, setError] = React.useState('');
  const [matchCount, setMatchCount] = React.useState(0);
  const [groups, setGroups] = React.useState([]);

  function testRegex() {
    setError('');
    setMatches([]);
    setMatchCount(0);
    setGroups([]);
    if (!pattern) return;
    try {
      const re = new RegExp(pattern, flags);
      const m = [];
      let gs = [];
      let count = 0;
      let match;
      while ((match = re.exec(testStr)) !== null) {
        m.push({ index: match.index, length: match[0].length, text: match[0] });
        count++;
        if (match.length > 1) {
          gs.push({ index: match.index, groups: Array.from({ length: match.length - 1 }, (_, i) => match[i + 1]) });
        }
        if (!flags.includes('g')) break;
      }
      setMatches(m);
      setMatchCount(count);
      setGroups(gs);
    } catch (e) {
      setError(e.message);
    }
  }

  function highlightText() {
    if (!matches.length || !testStr) return testStr;
    const parts = [];
    let last = 0;
    const sorted = [...matches].sort((a, b) => a.index - b.index);
    sorted.forEach((m, idx) => {
      if (m.index < last) return;
      if (m.index > last) parts.push(<span key={`t${last}`}>{testStr.slice(last, m.index)}</span>);
      parts.push(<mark key={`m${idx}`} style={{ background: '#22d3ee44', color: '#22d3ee', borderRadius: '2px', padding: '0 2px' }}>{testStr.slice(m.index, m.index + m.length)}</mark>);
      last = m.index + m.length;
    });
    if (last < testStr.length) parts.push(<span key={`t${last}`}>{testStr.slice(last)}</span>);
    return parts.length ? parts : testStr;
  }

  const containerStyle = {
    background: '#0B1120', padding: '16px', borderRadius: '8px',
    border: '1px solid rgba(34, 211, 238, 0.15)',
    boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
    fontFamily: 'monospace', color: '#e2e8f0', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column'
  };
  const inputStyle = {
    width: '100%', background: '#0f172a', color: '#e2e8f0', border: error ? '1px solid #ef4444' : '1px solid rgba(148, 163, 184, 0.08)',
    borderRadius: '4px', padding: '8px', fontFamily: 'monospace', fontSize: '13px', outline: 'none', marginBottom: '8px'
  };
  const labelStyle = { fontSize: '11px', color: '#94a3b8', marginBottom: '4px', display: 'block' };
  const btnStyle = { background: '#22d3ee', color: '#0B1120', border: 'none', borderRadius: '4px', padding: '7px 16px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' };
  const flagBtn = (f) => ({
    background: flags.includes(f) ? '#22d3ee' : '#0f172a',
    color: flags.includes(f) ? '#0B1120' : '#94a3b8',
    border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '3px', padding: '4px 8px',
    cursor: 'pointer', fontSize: '11px', fontWeight: flags.includes(f) ? 'bold' : 'normal'
  });

  return (
    <div style={containerStyle}>
      <label style={labelStyle}>Pattern</label>
      <input value={pattern} onChange={e => setPattern(e.target.value)} placeholder="/regex/" style={inputStyle} />
      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
        {['g','i','m'].map(f => (
          <button key={f} style={flagBtn(f)} onClick={() => {
            const f2 = flags.includes(f) ? flags.replace(f, '') : flags + f;
            setFlags(f2);
          }}>{f}</button>
        ))}
        <button style={btnStyle} onClick={testRegex}>Test</button>
      </div>
      <label style={labelStyle}>Test String</label>
      <textarea value={testStr} onChange={e => setTestStr(e.target.value)}
        style={{
          ...inputStyle, minHeight: '60px', resize: 'vertical', marginBottom: '8px'
        }} />
      {error && <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '4px' }}>{error}</div>}
      {matchCount > 0 && (
        <div style={{ fontSize: '12px', color: '#22d3ee', marginBottom: '4px' }}>
          {matchCount} match{matchCount !== 1 ? 'es' : ''}
          {groups.length > 0 && (
            <div style={{ marginTop: '4px', color: '#94a3b8' }}>
              {groups.map((g, i) => (
                <div key={i}>Match {i + 1}: groups = [{g.groups.join(', ')}]</div>
              ))}
            </div>
          )}
        </div>
      )}
      {matchCount === 0 && pattern && !error && <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>No matches</div>}
      <div style={{
        flex: 1, background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '4px',
        padding: '8px', overflow: 'auto', fontSize: '13px', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word'
      }}>
        {highlightText()}
      </div>
    </div>
  );
}
