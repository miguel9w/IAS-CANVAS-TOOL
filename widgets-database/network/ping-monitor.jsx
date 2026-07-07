function Widget({ appBus }) {
  const [hosts, setHosts] = React.useState([
    { name: 'google.com', ip: '142.250.80.46', status: 'up', ms: 12, up: true },
    { name: 'cloudflare.com', ip: '104.16.132.229', status: 'up', ms: 8, up: true },
    { name: 'github.com', ip: '140.82.121.3', status: 'up', ms: 34, up: true },
    { name: 'stackoverflow.com', ip: '151.101.1.69', status: 'down', ms: 0, up: false },
    { name: 'localhost', ip: '127.0.0.1', status: 'up', ms: 0, up: true },
  ]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setHosts(prev => prev.map(h => ({
        ...h,
        up: Math.random() > 0.15,
        ms: h.up ? Math.floor(Math.random() * 80 + 1) : 0,
        status: Math.random() > 0.15 ? 'up' : 'down',
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const maxMs = Math.max(...hosts.map(h => h.ms), 1);

  return (
    <div style={{ padding: '16px', fontFamily: 'monospace', color: '#e2e8f0', background: '#0B1120', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
      <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#bb86fc', letterSpacing: '1px' }}>
        PING MONITOR
      </div>
      {hosts.map((h, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '6px 8px', marginBottom: '4px',
          background: h.up ? 'rgba(76,175,80,0.08)' : 'rgba(244,67,54,0.12)',
          borderRadius: '4px', borderLeft: `3px solid ${h.up ? '#4caf50' : '#f44336'}`,
        }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: h.up ? '#4caf50' : '#f44336',
            boxShadow: h.up ? '0 0 6px #4caf50' : '0 0 6px #f44336',
            flexShrink: 0,
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', color: '#e2e8f0' }}>{h.name}</div>
            <div style={{ fontSize: '11px', color: '#888' }}>{h.ip}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: h.up ? '#81c784' : '#ef9a9a' }}>
              {h.up ? `${h.ms}ms` : 'TIMEOUT'}
            </div>
          </div>
          <div style={{
            width: '60px', height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden', flexShrink: 0,
          }}>
            <div style={{
              width: h.up ? `${(h.ms / maxMs) * 100}%` : '0%',
              height: '100%',
              background: h.up ? (h.ms < 30 ? '#4caf50' : h.ms < 60 ? '#ff9800' : '#f44336') : '#555',
              borderRadius: '3px',
              transition: 'width 0.3s',
            }} />
          </div>
        </div>
      ))}
      <div style={{ fontSize: '10px', color: '#475569', marginTop: '8px', textAlign: 'center' }}>
        auto-refresh every 2s
      </div>
    </div>
  );
}
