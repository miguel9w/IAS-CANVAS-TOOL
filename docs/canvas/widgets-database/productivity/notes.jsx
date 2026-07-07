function Widget({ appBus }) {
  const [notes, setNotes] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('notes_data') || '[]'); }
    catch { return []; }
  });
  const [title, setTitle] = React.useState('');
  const [text, setText] = React.useState('');
  const [color, setColor] = React.useState('#ffd93d');
  const [search, setSearch] = React.useState('');
  const [dragging, setDragging] = React.useState(null);

  React.useEffect(() => {
    localStorage.setItem('notes_data', JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    if (!text.trim()) return;
    setNotes([...notes, { id: Date.now(), title: title.trim() || 'Note', text: text.trim(), color, x: 20 + Math.random() * 100, y: 20 + Math.random() * 100, z: Date.now() }]);
    setTitle('');
    setText('');
  };

  const deleteNote = (id) => setNotes(notes.filter(n => n.id !== id));

  const bringToFront = (id) => {
    setNotes(notes.map(n => n.id === id ? { ...n, z: Date.now() } : n));
  };

  const handleMouseDown = (id, e) => {
    bringToFront(id);
    const rect = e.target.closest('[data-note]').getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    setDragging({ id, offsetX, offsetY });
  };

  React.useEffect(() => {
    if (!dragging) return;
    const handleMove = (e) => {
      setNotes(notes.map(n => n.id === dragging.id ? { ...n, x: e.clientX - dragging.offsetX, y: e.clientY - dragging.offsetY } : n));
    };
    const handleUp = () => setDragging(null);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
  }, [dragging, notes]);

  const filtered = notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.text.toLowerCase().includes(search.toLowerCase()));

  const colors = ['#ffd93d','#6bcb77','#4d96ff','#ff6b6b','#c084fc','#fb923c'];

  const s = {
    wrap: { background: '#0B1120', color: '#e2e8f0', fontFamily: 'system-ui,sans-serif', padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '8px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' },
    h: { fontSize: '18px', fontWeight: 700, margin: '0 0 12px', color: '#7c83ff' },
    addRow: { display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' },
    inp: { background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '6px', padding: '6px 10px', color: '#e2e8f0', fontSize: '12px', outline: 'none', flex: 1, minWidth: '80px' },
    textarea: { background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '6px', padding: '6px 10px', color: '#e2e8f0', fontSize: '12px', outline: 'none', flex: 1, minWidth: '120px', resize: 'none', fontFamily: 'inherit' },
    btn: { background: '#7c83ff', border: 'none', borderRadius: '6px', color: '#fff', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', fontWeight: 600, alignSelf: 'flex-end' },
    colors: { display: 'flex', gap: '4px', alignItems: 'center' },
    colorDot: (c) => ({ width: '20px', height: '20px', borderRadius: '50%', background: c, cursor: 'pointer', border: '2px solid transparent', boxSizing: 'border-box' }),
    colorDotActive: (c) => ({ width: '20px', height: '20px', borderRadius: '50%', background: c, cursor: 'pointer', border: '2px solid #fff', boxSizing: 'border-box' }),
    search: { background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '6px', padding: '6px 10px', color: '#e2e8f0', fontSize: '12px', outline: 'none', width: '100%', boxSizing: 'border-box', marginBottom: '8px' },
    canvas: { flex: 1, position: 'relative', overflow: 'hidden', borderRadius: '6px' },
    note: (n) => ({ position: 'absolute', left: n.x + 'px', top: n.y + 'px', width: '160px', background: n.color, borderRadius: '8px', padding: '8px', cursor: 'move', zIndex: n.z, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', fontSize: '12px', color: '#333' }),
    noteTitle: { fontWeight: 700, marginBottom: '4px', fontSize: '13px', wordBreak: 'break-word' },
    noteText: { wordBreak: 'break-word', whiteSpace: 'pre-wrap' },
    delNote: { position: 'absolute', top: '4px', right: '4px', background: 'none', border: 'none', color: '#333', cursor: 'pointer', fontSize: '14px', padding: 0, lineHeight: 1, opacity: 0.5 },
  };

  return (
    <div style={s.wrap}>
      <div style={s.h}>📝 Sticky Notes</div>
      <div style={s.addRow}>
        <input style={s.inp} placeholder="Title (optional)" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea style={s.textarea} placeholder="Note text..." value={text} onChange={e => setText(e.target.value)} rows={2} />
      </div>
      <div style={{...s.addRow,alignItems:'center'}}>
        <div style={s.colors}>
          {colors.map(c => (
            <div key={c} style={color === c ? s.colorDotActive(c) : s.colorDot(c)} onClick={() => setColor(c)} />
          ))}
        </div>
        <button style={s.btn} onClick={addNote}>+ Add</button>
      </div>
      <input style={s.search} placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} />
      <div style={s.canvas}>
        {filtered.map(n => (
          <div key={n.id} data-note style={s.note(n)} onMouseDown={e => handleMouseDown(n.id, e)}>
            <button style={s.delNote} onClick={() => deleteNote(n.id)}>✕</button>
            <div style={s.noteTitle}>{n.title}</div>
            <div style={s.noteText}>{n.text}</div>
          </div>
        ))}
        {filtered.length === 0 && <div style={{textAlign:'center',color:'#555',fontSize:'13px',padding:'40px'}}>No notes yet</div>}
      </div>
    </div>
  );
}
