function Widget({ appBus }) {
  const now = new Date();
  const [year, setYear] = React.useState(now.getFullYear());
  const [month, setMonth] = React.useState(now.getMonth());
  const [selected, setSelected] = React.useState(null);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const today = new Date();
  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const isSelected = (d) => selected && d === selected.getDate() && month === selected.getMonth() && year === selected.getFullYear();

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  function getWeekNumber(d) {
    const date = new Date(year, month, d);
    const start = new Date(date.getFullYear(), 0, 1);
    return Math.ceil(((date - start) / 86400000 + start.getDay() + 1) / 7);
  }

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const weeks = [];
  let days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  const containerStyle = {
    background: '#0B1120', padding: '16px', borderRadius: '8px',
    fontFamily: 'monospace', color: '#e2e8f0', height: '100%', boxSizing: 'border-box',
    border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
  };

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <button onClick={prevMonth} style={{
          background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155',
          borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', fontSize: '14px'
        }}>◀</button>
        <div style={{ fontSize: '15px', fontWeight: 'bold' }}>{monthNames[month]} {year}</div>
        <button onClick={nextMonth} style={{
          background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155',
          borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', fontSize: '14px'
        }}>▶</button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr>
            {dayNames.map(d => (
              <th key={d} style={{ padding: '4px', color: '#64748b', fontWeight: 'normal', fontSize: '10px' }}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((d, di) => (
                <td key={di} style={{
                  padding: '6px 4px', textAlign: 'center', cursor: d ? 'pointer' : 'default',
                  borderRadius: '4px',
                  background: isSelected(d) ? '#22d3ee' : isToday(d) ? '#1e3a5f' : 'transparent',
                  color: isSelected(d) ? '#0B1120' : isToday(d) ? '#22d3ee' : d ? '#e2e8f0' : 'transparent',
                  fontWeight: isToday(d) || isSelected(d) ? 'bold' : 'normal',
                  border: isToday(d) && !isSelected(d) ? '1px solid #22d3ee44' : 'none'
                }} onClick={() => d && setSelected(new Date(year, month, d))}>
                  {d}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {selected && (
        <div style={{
          marginTop: '12px', padding: '8px', background: '#1e293b', borderRadius: '6px',
          fontSize: '12px', lineHeight: 1.6
        }}>
          <div><span style={{ color: '#64748b' }}>Date: </span>{monthNames[selected.getMonth()]} {selected.getDate()}, {selected.getFullYear()}</div>
          <div><span style={{ color: '#64748b' }}>Day: </span>{dayNames[selected.getDay()]}</div>
        </div>
      )}
    </div>
  );
}
