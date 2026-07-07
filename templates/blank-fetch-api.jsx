function Widget({ appBus }) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    // Simulated async data fetch — replace with real fetch() in production
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate success (20% chance of error to demonstrate error state)
    if (Math.random() > 0.2) {
      setData([
        { id: 1, title: 'Item One', value: Math.round(Math.random() * 100) },
        { id: 2, title: 'Item Two', value: Math.round(Math.random() * 100) },
        { id: 3, title: 'Item Three', value: Math.round(Math.random() * 100) },
        { id: 4, title: 'Item Four', value: Math.round(Math.random() * 100) },
        { id: 5, title: 'Item Five', value: Math.round(Math.random() * 100) },
      ]);
    } else {
      setError('Failed to fetch data. Network error.');
    }
    setLoading(false);
  };

  return (
    <div style={{ background: '#0B1120', color: '#e2e8f0', fontFamily: 'monospace', height: '100%', padding: '16px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Fetch API Demo</h2>
        <button onClick={fetchData} disabled={loading}
          style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '12px', opacity: loading ? 0.6 : 1 }}>
          Fetch Data
        </button>
      </div>
      {loading && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #1e2d4a', borderTopColor: '#3b82f6', borderRadius: '50%', marginBottom: '12px' }} />
          <div style={{ color: '#64748b', fontSize: '12px' }}>Loading data...</div>
        </div>
      )}
      {error && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#450a0a', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px 16px', color: '#fca5a5', fontSize: '12px', textAlign: 'center' }}>
            {error}
          </div>
        </div>
      )}
      {data && (
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ color: '#64748b', fontSize: '10px', marginBottom: '4px' }}>{data.length} items loaded</div>
          {data.map(item => (
            <div key={item.id} style={{ background: '#131c31', borderRadius: '6px', padding: '8px 12px', border: '1px solid #1e2d4a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{item.title}</span>
              <span style={{ color: '#3b82f6', fontSize: '12px', fontWeight: 700 }}>{item.value}</span>
            </div>
          ))}
        </div>
      )}
      {!data && !loading && !error && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '12px' }}>
          Click "Fetch Data" to load simulated data
        </div>
      )}
    </div>
  );
}
