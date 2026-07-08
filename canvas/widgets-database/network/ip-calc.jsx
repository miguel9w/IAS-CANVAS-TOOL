function Widget({ appBus }) {
  const [cidr, setCidr] = React.useState('192.168.1.0/24');

  const parseCIDR = (input) => {
    const match = input.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)\/(\d+)$/);
    if (!match) return null;
    const octets = [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), parseInt(match[4])];
    const prefix = parseInt(match[5]);
    if (prefix < 0 || prefix > 32 || octets.some(o => o < 0 || o > 255)) return null;
    const mask = ~0 << (32 - prefix);
    const netRaw = (octets[0] << 24 | octets[1] << 16 | octets[2] << 8 | octets[3]) & mask;
    const broadcastRaw = netRaw | ~mask;
    const net = [(netRaw >>> 24) & 0xff, (netRaw >>> 16) & 0xff, (netRaw >>> 8) & 0xff, netRaw & 0xff];
    const broadcast = [(broadcastRaw >>> 24) & 0xff, (broadcastRaw >>> 16) & 0xff, (broadcastRaw >>> 8) & 0xff, broadcastRaw & 0xff];
    const maskOctets = [(mask >>> 24) & 0xff, (mask >>> 16) & 0xff, (mask >>> 8) & 0xff, mask & 0xff];
    const hosts = Math.max(0, Math.pow(2, 32 - prefix) - 2);
    return { ip: octets, net, broadcast, mask: maskOctets, prefix, hosts, maskRaw: mask };
  };

  const data = parseCIDR(cidr);

  const toBin = (n) => n.toString(2).padStart(8, '0').replace(/(.{4})/g, '$1 ').trim();
  const toBin32 = (octets) => octets.map(toBin).join(' ');

  return (
    <div style={{ padding: '16px', fontFamily: 'monospace', color: '#e2e8f0', background: '#0B1120', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
      <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#bb86fc', letterSpacing: '1px' }}>
        IP CALCULATOR
      </div>
      <input value={cidr} onChange={e => setCidr(e.target.value)}
        style={{
          width: '100%', padding: '8px', background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)',
          borderRadius: '4px', color: '#e2e8f0', fontSize: '14px', fontFamily: 'monospace',
          outline: 'none', marginBottom: '12px', boxSizing: 'border-box',
        }} placeholder="192.168.1.0/24" />
      {data ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
          {[
            { label: 'Address', value: data.ip.join('.'), bin: toBin32(data.ip) },
            { label: 'Network', value: data.net.join('.'), bin: toBin32(data.net) },
            { label: 'Broadcast', value: data.broadcast.join('.'), bin: toBin32(data.broadcast) },
            { label: 'Mask', value: data.mask.join('.'), bin: toBin32(data.mask) },
          ].map((row, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '4px', padding: '6px 8px' }}>
              <div style={{ color: '#94a3b8', fontSize: '10px', marginBottom: '2px' }}>{row.label}</div>
              <div style={{ color: '#e2e8f0', fontSize: '13px' }}>{row.value}</div>
              <div style={{ color: '#475569', fontSize: '10px', wordBreak: 'break-all', marginTop: '2px' }}>
                {row.bin}
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '4px', padding: '6px 8px', flex: 1 }}>
              <div style={{ color: '#94a3b8', fontSize: '10px' }}>Prefix</div>
              <div style={{ color: '#81c784', fontSize: '13px', fontWeight: 'bold' }}>/{data.prefix}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '4px', padding: '6px 8px', flex: 1 }}>
              <div style={{ color: '#94a3b8', fontSize: '10px' }}>Usable Hosts</div>
              <div style={{ color: '#81c784', fontSize: '13px', fontWeight: 'bold' }}>{data.hosts}</div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ color: '#ef9a9a', fontSize: '12px', padding: '12px', textAlign: 'center' }}>
          Invalid CIDR notation
        </div>
      )}
    </div>
  );
}
