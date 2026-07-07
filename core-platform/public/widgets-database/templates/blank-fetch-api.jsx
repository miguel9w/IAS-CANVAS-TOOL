function Widget({ appBus }) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const fetchRef = React.useRef(null);

  React.useEffect(() => {
    return () => {
      if (fetchRef.current) clearTimeout(fetchRef.current);
    };
  }, []);

  const simulateFetch = () => {
    setLoading(true);
    setError(null);
    setData(null);

    if (fetchRef.current) clearTimeout(fetchRef.current);
    fetchRef.current = setTimeout(() => {
      const shouldFail = Math.random() < 0.15;
      if (shouldFail) {
        setError('Network error: request timed out');
        setLoading(false);
      } else {
        const result = {
          id: Math.floor(Math.random() * 1000),
          title: 'Sample Data Loaded',
          items: Array.from({ length: 5 }, (_, i) => ({
            id: i + 1,
            name: `Item ${String.fromCharCode(65 + i)}`,
            value: Math.floor(Math.random() * 100),
          })),
          timestamp: new Date().toISOString(),
        };
        setData(result);
        setLoading(false);
      }
    }, 1200);
  };

  const states = ['idle', 'loading', 'success', 'error'];

  return (
    <div style={{ padding: '16px', fontFamily: 'monospace', color: '#e2e8f0', background: '#0B1120', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
      <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#bb86fc' }}>
        FETCH API PATTERN
      </div>
      <button onClick={simulateFetch} disabled={loading} style={{
        width: '100%', padding: '8px', marginBottom: '10px',
        background: loading ? '#1e293b' : '#bb86fc', border: 'none', borderRadius: '4px',
        color: loading ? '#475569' : '#121212', fontWeight: 'bold', fontSize: '12px',
        cursor: loading ? 'default' : 'pointer',
      }}>{loading ? 'Loading...' : 'Fetch Data (simulated)'}</button>

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{
            width: '24px', height: '24px', border: '3px solid #1e293b',
            borderTopColor: '#bb86fc', borderRadius: '50%',
            animation: 'fetchSpin 0.8s linear infinite',
            margin: '0 auto 8px',
          }} />
          <div style={{ fontSize: '11px', color: '#888' }}>Fetching data...</div>
          <style>{`@keyframes fetchSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {error && (
        <div style={{
          background: 'rgba(244,67,54,0.1)', border: '1px solid #f44336',
          borderRadius: '4px', padding: '10px', marginBottom: '8px',
        }}>
          <div style={{ color: '#ef9a9a', fontSize: '12px', fontWeight: 'bold', marginBottom: '2px' }}>Error</div>
          <div style={{ color: '#888', fontSize: '11px' }}>{error}</div>
        </div>
      )}

      {data && (
        <div style={{
          background: 'rgba(255,255,255,0.03)', borderRadius: '4px', padding: '10px',
          border: '1px solid rgba(148, 163, 184, 0.08)',
        }}>
          <div style={{ color: '#81c784', fontSize: '11px', marginBottom: '4px' }}>
            ✓ Loaded — {data.id}
          </div>
          <div style={{ color: '#e2e8f0', fontSize: '13px', marginBottom: '6px' }}>{data.title}</div>
          {data.items.map(item => (
            <div key={item.id} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '4px 6px', marginBottom: '2px',
              background: 'rgba(255,255,255,0.03)', borderRadius: '3px', fontSize: '11px',
            }}>
              <span style={{ color: '#94a3b8' }}>{item.name}</span>
              <span style={{ color: '#81c784' }}>{item.value}</span>
            </div>
          ))}
          <div style={{ fontSize: '9px', color: '#555', marginTop: '6px' }}>
            {data.timestamp}
          </div>
        </div>
      )}
    </div>
  );
}
