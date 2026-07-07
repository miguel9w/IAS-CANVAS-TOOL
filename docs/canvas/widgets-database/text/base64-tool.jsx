function Widget({ appBus }) {
  const [input, setInput] = React.useState('');
  const [output, setOutput] = React.useState('');
  const [urlSafe, setUrlSafe] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  function encode() {
    try {
      let b64 = btoa(input);
      if (urlSafe) b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      setOutput(b64);
    } catch (e) {
      setOutput('Error: ' + e.message);
    }
  }

  function decode() {
    try {
      let str = input;
      if (urlSafe) str = str.replace(/-/g, '+').replace(/_/g, '/');
      const pad = str.length % 4;
      if (pad) str += '='.repeat(4 - pad);
      setOutput(atob(str));
    } catch (e) {
      setOutput('Error: ' + e.message);
    }
  }

  function copy() {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const containerStyle = {
    background: '#0B1120', padding: '16px', borderRadius: '8px',
    border: '1px solid rgba(34, 211, 238, 0.15)',
    boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
    fontFamily: 'monospace', color: '#e2e8f0', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column'
  };
  const btn = { background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '4px', padding: '7px 16px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' };
  const labelStyle = { fontSize: '11px', color: '#94a3b8', marginBottom: '4px', marginTop: '8px' };

  return (
    <div style={containerStyle}>
      <label style={labelStyle}>Input</label>
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Enter text to encode/decode..."
        style={{
          width: '100%', minHeight: '70px', background: '#0f172a', color: '#e2e8f0',
            border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '4px', padding: '8px',
          fontFamily: 'monospace', fontSize: '12px', resize: 'vertical', outline: 'none'
        }} />
      <div style={{ margin: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button style={btn} onClick={encode}>Encode</button>
        <button style={btn} onClick={decode}>Decode</button>
        <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
          <input type="checkbox" checked={urlSafe} onChange={e => setUrlSafe(e.target.checked)} />
          URL-safe
        </label>
      </div>
      <label style={labelStyle}>Output</label>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <textarea readOnly value={output}
          style={{
            width: '100%', flex: 1, minHeight: '60px', background: '#0f172a', color: '#22d3ee',
          border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '4px', padding: '8px',
            fontFamily: 'monospace', fontSize: '12px', resize: 'none', outline: 'none'
          }} />
        {output && (
          <button onClick={copy} style={{
            ...btn, marginTop: '6px', alignSelf: 'flex-end',
            background: copied ? '#10b981' : '#0f172a'
          }}>{copied ? '✓ Copied' : 'Copy'}</button>
        )}
      </div>
    </div>
  );
}
