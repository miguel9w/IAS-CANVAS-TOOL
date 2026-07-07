function Widget({ appBus }) {
  const [tasks, setTasks] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('todolist_tasks') || '[]'); }
    catch { return []; }
  });
  const [input, setInput] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const [editing, setEditing] = React.useState(null);

  React.useEffect(() => {
    localStorage.setItem('todolist_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!input.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: input.trim(), done: false }]);
    setInput('');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const editTask = (id, text) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, text } : t));
    setEditing(null);
  };

  const filtered = tasks.filter(t => {
    if (filter === 'active') return !t.done;
    if (filter === 'completed') return t.done;
    return true;
  });

  const done = tasks.filter(t => t.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  const s = {
    wrap: { background: '#0B1120', color: '#e2e8f0', fontFamily: 'system-ui,sans-serif', padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '8px', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' },
    h: { fontSize: '18px', fontWeight: 700, margin: '0 0 12px', color: '#7c83ff', display: 'flex', alignItems: 'center', gap: '8px' },
    barOuter: { width: '100%', height: '6px', background: 'rgba(148, 163, 184, 0.08)', borderRadius: '3px', marginBottom: '12px', overflow: 'hidden' },
    barInner: { height: '100%', background: 'linear-gradient(90deg,#7c83ff,#a78bfa)', borderRadius: '3px', transition: 'width 0.3s', width: pct + '%' },
    barLabel: { fontSize: '11px', color: '#888', marginBottom: '4px', textAlign: 'right' },
    addRow: { display: 'flex', gap: '8px', marginBottom: '12px' },
    inp: { flex: 1, background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '6px', padding: '8px 12px', color: '#e2e8f0', fontSize: '13px', outline: 'none' },
    btn: { background: '#7c83ff', border: 'none', borderRadius: '6px', color: '#fff', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', fontWeight: 600 },
    filters: { display: 'flex', gap: '4px', marginBottom: '12px' },
    ftBtn: (active) => ({ background: active ? '#7c83ff' : 'transparent', border: '1px solid ' + (active ? '#7c83ff' : 'rgba(148, 163, 184, 0.08)'), borderRadius: '4px', color: active ? '#fff' : '#888', padding: '4px 12px', fontSize: '12px', cursor: 'pointer' }),
    list: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' },
    item: (done) => ({ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: '#0f172a', borderRadius: '6px', opacity: done ? 0.6 : 1 }),
    cb: { appearance: 'none', width: '16px', height: '16px', border: '2px solid #7c83ff', borderRadius: '3px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'transparent' },
    cbChecked: { background: '#7c83ff' },
    text: (done) => ({ flex: 1, fontSize: '13px', textDecoration: done ? 'line-through' : 'none', color: done ? '#666' : '#e2e8f0', cursor: 'pointer' }),
    delBtn: { background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '16px', padding: '0 4px', lineHeight: 1 },
  };

  return (
    <div style={s.wrap}>
      <div style={s.h}>📋 Todo List <span style={{fontSize:'12px',color:'#888',fontWeight:400}}>({done}/{tasks.length})</span></div>
      <div style={s.barLabel}>{pct}% complete</div>
      <div style={s.barOuter}><div style={s.barInner} /></div>
      <div style={s.addRow}>
        <input style={s.inp} placeholder="Add a task..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} />
        <button style={s.btn} onClick={addTask}>+</button>
      </div>
      <div style={s.filters}>
        {['all','active','completed'].map(f => (
          <button key={f} style={s.ftBtn(filter === f)} onClick={() => setFilter(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
        ))}
      </div>
      <div style={s.list}>
        {filtered.map(t => (
          <div key={t.id} style={s.item(t.done)}>
            <div style={{...s.cb, ...(t.done ? s.cbChecked : {})}} onClick={() => toggleTask(t.id)}>
              {t.done && <span style={{color:'#fff',fontSize:'12px'}}>✓</span>}
            </div>
            {editing === t.id ? (
              <input style={s.inp} defaultValue={t.text} autoFocus onBlur={e => editTask(t.id, e.target.value)} onKeyDown={e => e.key === 'Enter' && editTask(t.id, e.target.value)} />
            ) : (
              <span style={s.text(t.done)} onClick={() => !t.done && setEditing(t.id)}>{t.text}</span>
            )}
            <button style={s.delBtn} onClick={() => deleteTask(t.id)}>✕</button>
          </div>
        ))}
        {filtered.length === 0 && <div style={{textAlign:'center',color:'#555',fontSize:'13px',padding:'20px'}}>No tasks</div>}
      </div>
    </div>
  );
}
