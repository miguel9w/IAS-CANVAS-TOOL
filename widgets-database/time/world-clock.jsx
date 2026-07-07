function Widget({ appBus }) {
  var cityDefs = {
    'New York': -5, 'London': 0, 'Tokyo': 9, 'Sydney': 11, 'Sao Paulo': -3
  };
  var [cities, setCities] = React.useState(cityDefs);
  var [newCity, setNewCity] = React.useState('');
  var [newOffset, setNewOffset] = React.useState(0);
  var [now, setNow] = React.useState(Date.now());

  React.useEffect(function() {
    var interval = setInterval(function() { setNow(Date.now()); }, 1000);
    return function() { clearInterval(interval); };
  }, []);

  var utcMs = now + (new Date().getTimezoneOffset()) * 60000;

  var addCity = function() {
    if (!newCity.trim()) return;
    setCities(Object.assign({}, cities, { [newCity.trim()]: newOffset }));
    setNewCity('');
    setNewOffset(0);
  };

  var removeCity = function(name) {
    var next = Object.assign({}, cities);
    delete next[name];
    setCities(next);
  };

  return (
    <div style={{
      background: '#0B1120', color: '#e2e8f0', fontFamily: "'Segoe UI',system-ui,sans-serif",
      padding: '20px', borderRadius: '12px', height: '100%', boxSizing: 'border-box',
      overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '10px',
      border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
    }}>
      <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fff' }}>
        World Clock
      </h2>
      {Object.entries(cities).map(function(entry) {
        var name = entry[0];
        var offset = entry[1];
        var cityTime = new Date(utcMs + offset * 3600000);
        var h = cityTime.getHours();
        var m = cityTime.getMinutes();
        var s = cityTime.getSeconds();
        var pad = function(n) { return n < 10 ? '0' + n : '' + n; };
        var ampm = h >= 12 ? 'PM' : 'AM';
        var dh = h % 12 || 12;
        return (
          <div key={name} style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px',
            background: '#0f172a', borderRadius: '6px'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{name}</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>UTC{offset >= 0 ? '+' : ''}{offset}</div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 400, fontVariantNumeric: 'tabular-nums', color: '#4a9eff' }}>
              {pad(dh)}:{pad(m)}:{pad(s)}
              <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '4px' }}>{ampm}</span>
            </div>
            <button onClick={function() { removeCity(name); }}
              style={{
                padding: '2px 6px', background: 'transparent', border: '1px solid rgba(148, 163, 184, 0.08)',
                borderRadius: '4px', color: '#ef4444', cursor: 'pointer', fontSize: '10px'
              }}>
              ✕
            </button>
          </div>
        );
      })}
      <div style={{ borderTop: '1px solid rgba(148, 163, 184, 0.08)', paddingTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <input placeholder="City name" value={newCity}
          onChange={function(e) { setNewCity(e.target.value); }}
          style={{
            flex: 1, padding: '6px 8px', background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)',
            borderRadius: '6px', color: '#e2e8f0', fontSize: '12px', outline: 'none', minWidth: '80px'
          }} />
        <select value={newOffset}
          onChange={function(e) { setNewOffset(Number(e.target.value)); }}
          style={{
            padding: '6px 8px', background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)',
            borderRadius: '6px', color: '#e2e8f0', fontSize: '12px', outline: 'none'
          }}>
          {[-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,10,11,12].map(function(o) {
            return <option key={o} value={o}>UTC{o >= 0 ? '+' : ''}{o}</option>;
          })}
        </select>
        <button onClick={addCity}
          style={{
            padding: '6px 12px', background: '#22d3ee', border: 'none',
            borderRadius: '6px', color: '#0B1120', cursor: 'pointer', fontSize: '12px'
          }}>
          Add
        </button>
      </div>
    </div>
  );
}
