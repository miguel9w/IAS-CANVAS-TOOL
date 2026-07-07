function Widget({ appBus }) {
  const [domain, setDomain] = React.useState('');
  const [result, setResult] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const lookupRef = React.useRef(null);

  React.useEffect(() => {
    return () => {
      if (lookupRef.current) clearTimeout(lookupRef.current);
    };
  }, []);

  const mockRecords = (dom) => {
    const base = dom.replace(/\..+$/, '');
    return {
      A: [`${Math.floor(Math.random() * 200 + 1)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`],
      AAAA: [`2a0${Math.floor(Math.random() * 9)}:${Math.floor(Math.random() * 9999).toString(16).padStart(4, '0')}:${Math.floor(Math.random() * 9999).toString(16).padStart(4, '0')}::${Math.floor(Math.random() * 999).toString(16)}`],
      MX: [`10 mail.${dom}`, `20 backup-mail.${dom}`],
      NS: [`ns1.${dom}`, `ns2.${dom}`, `ns3.cloudflare.com`],
      TXT: [`"v=spf1 include:_spf.${dom} ~all"`, `"google-site-verification=abc123"`],
    };
  };

  const lookup = () => {
    if (!domain) return;
    setLoading(true);
    if (lookupRef.current) clearTimeout(lookupRef.current);
    lookupRef.current = setTimeout(() => {
      setResult(mockRecords(domain));
      setLoading(false);
    }, 800);
  };

  const types = ['A', 'AAAA', 'MX', 'NS', 'TXT'];
  const colors = { A: '#4caf50', AAAA: '#2196f3', MX: '#ff9800', NS: '#9c27b0', TXT: '#00bcd4' };

  return (
    <div style={{ padding: '16px', fontFamily: 'monospace', color: '#e2e8f0', background: '#0B1120', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
      <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#bb86fc', letterSpacing: '1px' }}>
        DNS LOOKUP
      </div>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
        <input value={domain} onChange={e => setDomain(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && lookup()}
          style={{
            flex: 1, padding: '8px', background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)',
            borderRadius: '4px', color: '#e2e8f0', fontSize: '13px', fontFamily: 'monospace',
            outline: 'none',
          }} placeholder="example.com" />
        <button onClick={lookup} disabled={loading}
          style={{
            padding: '8px 16px', background: '#bb86fc', border: 'none', borderRadius: '4px',
            color: '#121212', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer',
            opacity: loading ? 0.6 : 1,
          }}>{loading ? '...' : 'Lookup'}</button>
      </div>
      {result && types.map(type => (
        <div key={type} style={{ marginBottom: '6px' }}>
          <div style={{
            display: 'inline-block', padding: '2px 6px', borderRadius: '3px',
            background: colors[type] + '22', color: colors[type],
            fontSize: '10px', fontWeight: 'bold', marginBottom: '3px',
          }}>{type}</div>
          {result[type].map((val, i) => (
            <div key={i} style={{
              padding: '4px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '3px',
              fontSize: '12px', color: '#94a3b8', marginBottom: '2px',
              borderLeft: `2px solid ${colors[type]}`,
            }}>{val}</div>
          ))}
        </div>
      ))}
      {result && (
        <div style={{ fontSize: '10px', color: '#475569', marginTop: '8px', textAlign: 'center' }}>
          Query time: {Math.floor(Math.random() * 40 + 5)}ms — simulated records
        </div>
      )}
    </div>
  );
}
