function Widget({ appBus }) {
  var [period, setPeriod] = React.useState('1M');
  var [seed] = React.useState(Date.now());

  var periods = { '1W': 7, '1M': 30, '3M': 90, '1Y': 365, '5Y': 1825 };
  var days = periods[period];

  var genPrices = function(seedVal, count) {
    var prices = [];
    var cur = 150;
    var prng = seedVal;
    for (var i = 0; i < count; i++) {
      prng = (prng * 16807 + 0) % 2147483647;
      var change = (prng / 2147483647 - 0.5) * 4;
      var open = cur;
      var close = open + change;
      var high = Math.max(open, close) + Math.abs(change) * 0.5 * (prng % 100) / 100;
      var low = Math.min(open, close) - Math.abs(change) * 0.5 * ((prng * 3) % 100) / 100;
      var vol = 1000000 + (prng % 5000000);
      prices.push({ open: open, high: high, low: low, close: close, volume: vol });
      cur = close;
    }
    return prices;
  };

  var prices = genPrices(seed, days);
  var current = prices[prices.length - 1] || { open: 150, close: 150 };
  var firstClose = prices[0] ? prices[0].close : 150;
  var changeVal = current.close - firstClose;
  var changePct = (changeVal / firstClose) * 100;
  var isUp = changeVal >= 0;
  var allHigh = prices.reduce(function(m, p) { return Math.max(m, p.high); }, -Infinity);
  var allLow = prices.reduce(function(m, p) { return Math.min(m, p.low); }, Infinity);
  var range = allHigh - allLow || 1;

  var barH = 120;
  var w = 400;
  var barW = w / days;
  var mid = (allHigh + allLow) / 2;

  var volMax = prices.reduce(function(m, p) { return Math.max(m, p.volume); }, 1);
  var volH = 40;

  return (
    <div style={{
      background: '#0B1120', color: '#e2e8f0', fontFamily: "'Segoe UI',system-ui,sans-serif",
      padding: '20px', borderRadius: '12px', height: '100%', boxSizing: 'border-box',
      overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '12px',
      border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fff' }}>
          AAPL
        </h2>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: isUp ? '#34d399' : '#ef4444' }}>
            ${current.close.toFixed(2)}
          </div>
          <div style={{ fontSize: '12px', color: isUp ? '#34d399' : '#ef4444' }}>
            {isUp ? '+' : ''}{changeVal.toFixed(2)} ({isUp ? '+' : ''}{changePct.toFixed(2)}%)
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '4px' }}>
        {Object.keys(periods).map(function(p) {
          return (
            <button key={p} onClick={function() { setPeriod(p); }}
              style={{
                padding: '4px 12px', background: period === p ? '#22d3ee' : 'transparent',
                border: '1px solid ' + (period === p ? '#4a9eff' : 'rgba(148, 163, 184, 0.08)'),
                borderRadius: '4px', color: period === p ? '#4a9eff' : '#888',
                fontSize: '11px', cursor: 'pointer'
              }}>
              {p}
            </button>
          );
        })}
      </div>
      <svg viewBox={'0 0 ' + w + ' ' + (barH + volH + 10)} style={{ width: '100%', height: '180px' }}>
        {prices.map(function(p, i) {
          var x = i * barW + barW * 0.1;
          var cw = Math.max(barW * 0.6, 1);
          var color = p.close >= p.open ? '#34d399' : '#ef4444';
          var hiY = barH - ((p.high - allLow) / range) * barH;
          var loY = barH - ((p.low - allLow) / range) * barH;
          var opY = barH - ((p.open - allLow) / range) * barH;
          var clY = barH - ((p.close - allLow) / range) * barH;
          var volY = barH + 10 + volH - (p.volume / volMax) * volH;
          return (
            <g key={i}>
              <line x1={x + cw/2} y1={hiY} x2={x + cw/2} y2={loY}
                stroke={color} strokeWidth={1} />
              <rect x={x} y={Math.min(opY, clY)} width={cw}
                height={Math.max(Math.abs(clY - opY), 1)} fill={color} />
              <rect x={x + cw * 0.15} y={volY} width={cw * 0.7}
                height={volH - (volY - (barH + 10))} fill={color} opacity={0.3} />
            </g>
          );
        })}
        <line x1={0} y1={barH} x2={w} y2={barH} stroke="rgba(148, 163, 184, 0.08)" strokeWidth={1} />
      </svg>
    </div>
  );
}
