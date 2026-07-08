function Widget({ appBus }) {
  const [notes, setNotes] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('sticky_notes_data') || '[]'); }
    catch { return []; }
  });
  const [newText, setNewText] = React.useState('');
  const [dragging, setDragging] = React.useState(null);

  React.useEffect(() => {
    localStorage.setItem('sticky_notes_data', JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    if (!newText.trim()) return;
    setNotes([...notes, {
      id: Date.now(),
      text: newText.trim(),
      color: '#ffd93d',
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      z: Date.now(),
      collapsed: false,
      timestamp: new Date().toLocaleString()
    }]);
    setNewText('');
  };

  const deleteNote = (id) => setNotes(notes.filter(n => n.id !== id));

  const bringToFront = (id) => {
    setNotes(notes.map(n => n.id === id ? { ...n, z: Date.now() } : n));
  };

  const toggleCollapse = (id) => {
    setNotes(notes.map(n => n.id === id ? { ...n, collapsed: !n.collapsed } : n));
  };

  const changeColor = (id, color) => {
    setNotes(notes.map(n => n.id === id ? { ...n, color } : n));
  };

  const handleMouseDown = (id, e) => {
    bringToFront(id);
    const el = document.querySelector(`[data-sticky="${id}"]`);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setDragging({ id, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top });
  };

  React.useEffect(() => {
    if (!dragging) return;
    const move = (e) => {
      setNotes(notes.map(n => n.id === dragging.id ? { ...n, x: Math.max(0, e.clientX - dragging.offsetX), y: Math.max(0, e.clientY - dragging.offsetY) } : n));
    };
    const up = () => setDragging(null);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [dragging, notes]);

  const colors = ['#ffd93d','#6bcb77','#4d96ff','#ff6b6b','#c084fc','#fb923c','#ff8fab','#a8e6cf'];

  const s = {
    wrap: { background: '#0B1120', color: '#e2e8f0', fontFamily: 'system-ui,sans-serif', padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '8px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' },
    h: { fontSize: '18px', fontWeight: 700, margin: '0 0 12px', color: '#7c83ff' },
    addRow: { display: 'flex', gap: '6px', marginBottom: '8px' },
    inp: { flex: 1, background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '6px', padding: '8px 12px', color: '#e2e8f0', fontSize: '13px', outline: 'none' },
    btn: { background: '#7c83ff', border: 'none', borderRadius: '6px', color: '#fff', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', fontWeight: 600 },
    canvas: { flex: 1, position: 'relative', overflow: 'hidden', borderRadius: '6px', background: '#0f0f1a' },
    note: (n) => ({ position: 'absolute', left: n.x + 'px', top: n.y + 'px', width: '180px', background: n.color, borderRadius: '8px', overflow: 'hidden', cursor: 'move', zIndex: n.z, boxShadow: '0 4px 16px rgba(0,0,0,0.4)', fontSize: '12px', color: '#333' }),
    titleBar: { padding: '6px 8px', fontWeight: 600, fontSize: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.1)', cursor: 'move', userSelect: 'none' },
    actions: { display: 'flex', gap: '4px', alignItems: 'center' },
    actionBtn: { background: 'none', border: 'none', color: '#333', cursor: 'pointer', fontSize: '12px', padding: '0 2px', opacity: 0.6, lineHeight: 1 },
    body: (n) => ({ padding: n.collapsed ? '0' : '6px 8px 8px', display: n.collapsed ? 'none' : 'block' }),
    text: { wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: 1.4 },
    time: { fontSize: '9px', color: 'rgba(0,0,0,0.5)', marginTop: '6px' },
    colors: { display: 'flex', gap: '2px', padding: '0 8px 6px', flexWrap: 'wrap' },
    colorDot: (c) => ({ width: '12px', height: '12px', borderRadius: '50%', background: c, cursor: 'pointer', border: '1px solid rgba(0,0,0,0.15)' }),
  };

  return (
    <div style={s.wrap}>
      <div style={s.h}>📌 Sticky Notes</div>
      <div style={s.addRow}>
        <input style={s.inp} placeholder="Type a note..." value={newText} onChange={e => setNewText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addNote()} />
        <button style={s.btn} onClick={addNote}>+</button>
      </div>
      <div style={s.canvas}>
        {notes.map(n => (
          <div key={n.id} data-sticky={n.id} style={s.note(n)}>
            <div style={s.titleBar} onMouseDown={e => handleMouseDown(n.id, e)}>
              <span>📌 Note</span>
              <div style={s.actions}>
                <button style={s.actionBtn} onClick={() => toggleCollapse(n.id)}>{n.collapsed ? '▸' : '▾'}</button>
                <button style={s.actionBtn} onClick={() => deleteNote(n.id)}>✕</button>
              </div>
            </div>
            <div style={s.body(n)}>
              <div style={s.text}>{n.text}</div>
              <div style={s.time}>{n.timestamp}</div>
            </div>
            <div style={s.colors}>
              {colors.map(c => (
                <div key={c} style={{...s.colorDot(c), border: n.color === c ? '2px solid rgba(0,0,0,0.5)' : '1px solid rgba(0,0,0,0.15)'}} onClick={() => changeColor(n.id, c)} />
              ))}
            </div>
          </div>
        ))}
        {notes.length === 0 && <div style={{textAlign:'center',color:'#444',fontSize:'13px',padding:'40px'}}>Add a sticky note</div>}
      </div>
    </div>
  );
}
