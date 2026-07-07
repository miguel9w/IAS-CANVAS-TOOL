function Widget({ appBus }) {
  const [input, setInput] = React.useState('');
  const [output, setOutput] = React.useState('');
  const [error, setError] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const [, forceUpdate] = React.useState(0);

  function format() {
    setError('');
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
    forceUpdate(n => n + 1);
  }

  function validate() {
    setError('');
    try {
      JSON.parse(input);
      setOutput('✓ Valid JSON');
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
    forceUpdate(n => n + 1);
  }

  function copy() {
    navigator.clipboard.writeText(output).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  function renderTree(obj, depth = 0) {
    if (obj === null) return <span style={{ color: '#ef4444' }}>null</span>;
    if (typeof obj === 'string') return <span style={{ color: '#22c55e' }}>"{obj}"</span>;
    if (typeof obj === 'number') return <span style={{ color: '#f59e0b' }}>{obj}</span>;
    if (typeof obj === 'boolean') return <span style={{ color: '#3b82f6' }}>{String(obj)}</span>;
    if (Array.isArray(obj)) {
      return (
        <div style={{ paddingLeft: depth > 0 ? '16px' : '0' }}>
          <span style={{ color: '#94a3b8' }}>[</span>
          {obj.length === 0 && <span style={{ color: '#94a3b8' }}> ]</span>}
          {obj.length > 0 && (
            <>
              {obj.map((item, i) => (
                <div key={i} style={{ paddingLeft: '16px' }}>
                  {renderTree(item, depth + 1)}{i < obj.length - 1 && <span style={{ color: '#475569' }}>,</span>}
                </div>
              ))}
              <span style={{ color: '#94a3b8' }}>]</span>
            </>
          )}
        </div>
      );
    }
    if (typeof obj === 'object') {
      const entries = Object.entries(obj);
      return (
        <div style={{ paddingLeft: depth > 0 ? '16px' : '0' }}>
          <span style={{ color: '#94a3b8' }}>{'{'}</span>
          {entries.length === 0 && <span style={{ color: '#94a3b8' }}> }</span>}
          {entries.length > 0 && (
            <>
              {entries.map(([key, val], i) => (
                <div key={key} style={{ paddingLeft: '16px' }}>
                  <span style={{ color: '#93c5fd' }}>"{key}"</span><span style={{ color: '#475569' }}>: </span>
                  {renderTree(val, depth + 1)}{i < entries.length - 1 && <span style={{ color: '#475569' }}>,</span>}
                </div>
              ))}
              <span style={{ color: '#94a3b8' }}>{'}'}</span>
            </>
          )}
        </div>
      );
    }
    return <span>{String(obj)}</span>;
  }

  let parsedObj = null;
  try { parsedObj = JSON.parse(input); } catch(e) {}

  const containerStyle = {
    background: '#0B1120', padding: '16px', borderRadius: '8px',
    border: '1px solid rgba(34, 211, 238, 0.15)',
    boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
    fontFamily: 'monospace', color: '#e2e8f0', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column'
  };
  const btn = { background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', marginRight: '6px' };
  const activeBtn = { ...btn, background: '#22d3ee', color: '#0B1120', borderColor: '#22d3ee' };

  return (
    <div style={containerStyle}>
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Paste JSON here..."
        style={{
          width: '100%', minHeight: '80px', background: '#0f172a', color: '#e2e8f0',
          border: error ? '1px solid #ef4444' : '1px solid rgba(148, 163, 184, 0.08)',
          borderRadius: '4px', padding: '8px', fontFamily: 'monospace', fontSize: '12px',
          resize: 'vertical', outline: 'none', marginBottom: '8px'
        }} />
      <div style={{ marginBottom: '8px' }}>
        <button style={btn} onClick={format}>Format</button>
        <button style={btn} onClick={validate}>Validate</button>
        {output && output !== '✓ Valid JSON' && (
          <button style={{ ...btn, background: copied ? '#10b981' : '#0f172a' }} onClick={copy}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
        <button style={btn} onClick={() => { setInput(''); setOutput(''); setError(''); }}>Clear</button>
      </div>
      {error && <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '8px', padding: '6px', background: '#3b1a1a', borderRadius: '4px' }}>{error}</div>}
      {parsedObj && (
        <div style={{ flex: 1, overflow: 'auto', background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '4px', padding: '8px', fontSize: '12px' }}>
          {renderTree(parsedObj)}
        </div>
      )}
    </div>
  );
}
