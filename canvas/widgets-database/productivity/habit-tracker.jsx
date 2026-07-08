function Widget({ appBus }) {
  const [habits, setHabits] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('habit_data') || '[]'); }
    catch { return []; }
  });
  const [name, setName] = React.useState('');
  const [weekOffset, setWeekOffset] = React.useState(0);

  React.useEffect(() => {
    localStorage.setItem('habit_data', JSON.stringify(habits));
  }, [habits]);

  const addHabit = () => {
    if (!name.trim()) return;
    setHabits([...habits, { id: Date.now(), name: name.trim(), log: {} }]);
    setName('');
  };

  const removeHabit = (id) => setHabits(habits.filter(h => h.id !== id));

  const toggleDay = (habitId, day) => {
    setHabits(habits.map(h => {
      if (h.id !== habitId) return h;
      const log = { ...h.log };
      if (log[day]) delete log[day];
      else log[day] = true;
      return { ...h, log };
    }));
  };

  const getWeekDates = () => {
    const now = new Date();
    now.setDate(now.getDate() + weekOffset * 7);
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(now.setDate(diff));
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(mon);
      d.setDate(mon.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const fmtDate = (d) => d.toISOString().slice(0, 10);
  const weekDates = getWeekDates();
  const dayLabels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  const calcStreak = (habit) => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = fmtDate(d);
      if (habit.log[key]) streak++;
      else if (i > 0) break;
    }
    return streak;
  };

  const calcStats = (habit) => {
    const total = Object.keys(habit.log).length;
    return { total, streak: calcStreak(habit) };
  };

  const s = {
    wrap: { background: '#0B1120', color: '#e2e8f0', fontFamily: 'system-ui,sans-serif', padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '8px', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' },
    h: { fontSize: '18px', fontWeight: 700, margin: '0 0 12px', color: '#7c83ff' },
    addRow: { display: 'flex', gap: '6px', marginBottom: '12px' },
    inp: { flex: 1, background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '6px', padding: '6px 10px', color: '#e2e8f0', fontSize: '12px', outline: 'none' },
    btn: { background: '#7c83ff', border: 'none', borderRadius: '6px', color: '#fff', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 },
    nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
    navBtn: { background: 'none', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '4px', color: '#888', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' },
    weekLabel: { fontSize: '12px', color: '#888' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '11px' },
    th: { textAlign: 'center', padding: '4px 2px', color: '#888', fontWeight: 400, borderBottom: '1px solid rgba(148, 163, 184, 0.08)', fontSize: '10px' },
    td: (isToday) => ({ textAlign: 'center', padding: '2px', borderBottom: '1px solid #0B1120', background: isToday ? 'rgba(124,131,255,0.1)' : 'transparent' }),
    cell: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer', fontSize: '11px', border: '1px solid rgba(148, 163, 184, 0.08)', background: 'transparent' },
    cellFilled: { background: '#7c83ff', borderColor: '#7c83ff', color: '#fff' },
    habitName: { cursor: 'pointer', color: '#e2e8f0', fontWeight: 500, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    delHabit: { background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '12px', padding: '0 2px', marginLeft: '4px' },
    stats: { fontSize: '10px', color: '#666', marginTop: '2px' },
  };

  return (
    <div style={s.wrap}>
      <div style={s.h}>✅ Habit Tracker</div>
      <div style={s.addRow}>
        <input style={s.inp} placeholder="New habit..." value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addHabit()} />
        <button style={s.btn} onClick={addHabit}>+</button>
      </div>
      <div style={s.nav}>
        <button style={s.navBtn} onClick={() => setWeekOffset(weekOffset - 1)}>◀</button>
        <span style={s.weekLabel}>{weekDates[0].toLocaleDateString()} - {weekDates[6].toLocaleDateString()}</span>
        <button style={s.navBtn} onClick={() => setWeekOffset(weekOffset + 1)}>▶</button>
      </div>
      <div style={{flex:1,overflowY:'auto'}}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Habit</th>
              {dayLabels.map(d => <th key={d} style={s.th}>{d}</th>)}
              <th style={s.th}>🔥</th>
            </tr>
          </thead>
          <tbody>
            {habits.map(habit => {
              const stats = calcStats(habit);
              return (
                <tr key={habit.id}>
                  <td style={s.td(false)}>
                    <div style={{display:'flex',alignItems:'center'}}>
                      <span style={s.habitName} title={habit.name}>{habit.name}</span>
                      <button style={s.delHabit} onClick={() => removeHabit(habit.id)}>✕</button>
                    </div>
                  </td>
                  {weekDates.map(d => {
                    const key = fmtDate(d);
                    const checked = !!habit.log[key];
                    const isToday = fmtDate(new Date()) === key;
                    return (
                      <td key={key} style={s.td(isToday)}>
                        <div style={{...s.cell, ...(checked ? s.cellFilled : {})}} onClick={() => toggleDay(habit.id, key)}>
                          {checked ? '✓' : ''}
                        </div>
                      </td>
                    );
                  })}
                  <td style={s.td(false)}>
                    <span style={{color:'#fb923c',fontWeight:600}}>{stats.streak}</span>
                    <div style={s.stats}>{stats.total}d</div>
                  </td>
                </tr>
              );
            })}
            {habits.length === 0 && (
              <tr><td colSpan={9} style={{textAlign:'center',color:'#555',fontSize:'12px',padding:'20px'}}>Add a habit to start tracking</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
