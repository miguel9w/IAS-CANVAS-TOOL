function Widget({ appBus }) {
  var [events, setEvents] = React.useState([
    { title: 'Project Started', date: '2026-01-15', desc: 'Initial kickoff meeting', color: '#4a9eff' },
    { title: 'Alpha Release', date: '2026-03-01', desc: 'Internal testing begins', color: '#34d399' },
    { title: 'Beta Launch', date: '2026-05-20', desc: 'Public beta with limited users', color: '#f59e0b' },
    { title: 'v1.0', date: '2026-07-01', desc: 'Production release', color: '#ef4444' },
  ]);
  var [title, setTitle] = React.useState('');
  var [date, setDate] = React.useState('');
  var [desc, setDesc] = React.useState('');
  var [color, setColor] = React.useState('#4a9eff');
  var [zoom, setZoom] = React.useState(1);

  var colors = ['#4a9eff','#34d399','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316'];

  var addEvent = function() {
    if (!title || !date) return;
    setEvents([].concat(events, [{ title: title, date: date, desc: desc || '—', color: color }]));
    setTitle(''); setDate(''); setDesc(''); setColor('#4a9eff');
  };

  var removeEvent = function(i) {
    setEvents(events.filter(function(_, idx) { return idx !== i; }));
  };

  var sorted = events.slice().sort(function(a, b) { return a.date.localeCompare(b.date); });

  var itemH = 70 * zoom;
  var dotSize = 12 * zoom;

  return (
    <div style={{
      background: '#0B1120', color: '#e2e8f0', fontFamily: "'Segoe UI',system-ui,sans-serif",
      padding: '20px', borderRadius: '12px', height: '100%', boxSizing: 'border-box',
      overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '12px',
      border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fff' }}>
          Timeline
        </h2>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Zoom</span>
          <input type="range" min="0.5" max="2" step="0.1" value={zoom}
            onChange={function(e) { setZoom(Number(e.target.value)); }}
            style={{ width: '60px' }} />
        </div>
      </div>

      <div style={{ position: 'relative', paddingLeft: '20px', flex: 1, minHeight: 0 }}>
        <div style={{
          position: 'absolute', left: '6px', top: '0', bottom: '0', width: '2px',
          background: 'rgba(148, 163, 184, 0.08)'
        }} />
        {sorted.map(function(ev, i) {
          return (
            <div key={i} style={{
              position: 'relative', marginBottom: '8px', paddingLeft: '20px',
              minHeight: itemH + 'px'
            }}>
              <div style={{
                position: 'absolute', left: '-15px', top: '4px', width: dotSize + 'px',
                height: dotSize + 'px', borderRadius: '50%', background: ev.color,
                border: '2px solid #0B1120', zIndex: 1
              }} />
              <div style={{
                background: '#0f172a', borderRadius: '8px', padding: '8px 12px',
                borderLeft: '3px solid ' + ev.color
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>
                      {ev.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      {ev.date}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                      {ev.desc}
                    </div>
                  </div>
                  <button onClick={function() { removeEvent(i); }}
                    style={{
                      padding: '2px 6px', background: 'transparent', border: '1px solid rgba(148, 163, 184, 0.08)',
                      borderRadius: '4px', color: '#ef4444', cursor: 'pointer', fontSize: '10px', flexShrink: 0
                    }}>
                    ✕
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ borderTop: '1px solid rgba(148, 163, 184, 0.08)', paddingTop: '10px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <input placeholder="Title" value={title}
            onChange={function(e) { setTitle(e.target.value); }}
            style={{
              flex: '1 1 120px', padding: '6px 8px', background: '#0f172a',
              border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '6px', color: '#e2e8f0',
              fontSize: '12px', outline: 'none', minWidth: '80px'
            }} />
          <input type="date" value={date}
            onChange={function(e) { setDate(e.target.value); }}
            style={{
              padding: '6px 8px', background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)',
              borderRadius: '6px', color: '#e2e8f0', fontSize: '12px', outline: 'none', width: '130px'
            }} />
          <input placeholder="Description" value={desc}
            onChange={function(e) { setDesc(e.target.value); }}
            style={{
              flex: '1 1 120px', padding: '6px 8px', background: '#0f172a',
              border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '6px', color: '#e2e8f0',
              fontSize: '12px', outline: 'none', minWidth: '80px'
            }} />
          <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
            {colors.map(function(c) {
              return (
                <div key={c} onClick={function() { setColor(c); }}
                  style={{
                    width: '18px', height: '18px', borderRadius: '50%',
                    background: c, cursor: 'pointer',
                    border: color === c ? '2px solid #fff' : '2px solid transparent',
                    boxSizing: 'border-box'
                  }} />
              );
            })}
          </div>
          <button onClick={addEvent}
            style={{
              padding: '6px 12px', background: '#22d3ee', border: 'none',
              borderRadius: '6px', color: '#0B1120', cursor: 'pointer', fontSize: '12px'
            }}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
