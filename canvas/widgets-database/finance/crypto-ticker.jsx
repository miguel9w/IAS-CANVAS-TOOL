function Widget({ appBus }) {
  var [prices, setPrices] = React.useState({
    BTC: { price: 67500, hist: [] },
    ETH: { price: 3450, hist: [] },
    SOL: { price: 145, hist: [] },
    ADA: { price: 0.45, hist: [] }
  });
  var MAX_HIST = 40;

  React.useEffect(function() {
    var interval = setInterval(function() {
      setPrices(function(prev) {
        var next = {};
        Object.keys(prev).forEach(function(sym) {
          var cur = prev[sym].price;
          var change = cur * (Math.random() - 0.48) * 0.02;
          var newPrice = Math.max(cur + change, 0.001);
          var hist = prev[sym].hist.slice();
          hist.push(newPrice);
          if (hist.length > MAX_HIST) hist.shift();
          next[sym] = { price: newPrice, hist: hist };
        });
        return next;
      });
    }, 5000);
    return function() { clearInterval(interval); };
  }, []);

  var syms = [
    { sym: 'BTC', name: 'Bitcoin', color: '#f7931a' },
    { sym: 'ETH', name: 'Ethereum', color: '#627eea' },
    { sym: 'SOL', name: 'Solana', color: '#00ffa3' },
    { sym: 'ADA', name: 'Cardano', color: '#0033ad' }
  ];

  var sparkW = 80;
  var sparkH = 30;

  return (
    <div style={{
      background: '#0B1120', color: '#e2e8f0', fontFamily: "'Segoe UI',system-ui,sans-serif",
      padding: '20px', borderRadius: '12px', height: '100%', boxSizing: 'border-box',
      overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '12px',
      border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
    }}>
      <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fff' }}>
        Crypto Ticker
      </h2>
      <div style={{ fontSize: '11px', color: '#666', textAlign: 'right' }}>
        Auto-refresh 5s
      </div>
      {syms.map(function(s) {
        var data = prices[s.sym];
        var hist = data.hist;
        var change = hist.length >= 2 ? data.price - hist[0] : 0;
        var isUp = change >= 0;
        var minP = hist.length ? Math.min.apply(null, hist) : data.price;
        var maxP = hist.length ? Math.max.apply(null, hist) : data.price;
        var range = (maxP - minP) || 1;

        return (
          <div key={s.sym} style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
            background: '#0f172a', borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100px' }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%', background: s.color
              }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{s.sym}</div>
                <div style={{ fontSize: '10px', color: '#666' }}>{s.name}</div>
              </div>
            </div>
            <div style={{ flex: 1, textAlign: 'right' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0' }}>
                ${data.price < 1 ? data.price.toFixed(4) : data.price.toFixed(2)}
              </div>
              <div style={{ fontSize: '11px', color: isUp ? '#34d399' : '#ef4444' }}>
                {isUp ? '+' : ''}{change.toFixed(2)}
              </div>
            </div>
            <svg width={sparkW} height={sparkH} viewBox={'0 0 ' + sparkW + ' ' + sparkH}>
              {hist.length >= 2 && (function() {
                var pts = hist.map(function(p, i) {
                  var x = (i / (hist.length - 1)) * sparkW;
                  var y = sparkH - ((p - minP) / range) * (sparkH - 4) - 2;
                  return x + ',' + y;
                }).join(' ');
                return (
                  <polyline points={pts}
                    fill="none" stroke={isUp ? '#34d399' : '#ef4444'} strokeWidth="1.5" />
                );
              })()}
            </svg>
          </div>
        );
      })}
    </div>
  );
}
