function Widget({ appBus }) {
  var [entries, setEntries] = React.useState([
    { desc: 'Salary', cat: 'Income', amount: 5000, type: 'income' },
    { desc: 'Rent', cat: 'Housing', amount: 1500, type: 'expense' },
    { desc: 'Groceries', cat: 'Food', amount: 600, type: 'expense' },
    { desc: 'Transport', cat: 'Transport', amount: 200, type: 'expense' },
    { desc: 'Internet', cat: 'Utilities', amount: 100, type: 'expense' },
    { desc: 'Freelance', cat: 'Income', amount: 800, type: 'income' },
  ]);
  var [desc, setDesc] = React.useState('');
  var [cat, setCat] = React.useState('');
  var [amt, setAmt] = React.useState('');
  var [type, setType] = React.useState('expense');

  var totalIncome = entries.filter(function(e) { return e.type === 'income'; })
    .reduce(function(s, e) { return s + e.amount; }, 0);
  var totalExpenses = entries.filter(function(e) { return e.type === 'expense'; })
    .reduce(function(s, e) { return s + e.amount; }, 0);
  var remaining = totalIncome - totalExpenses;

  var cats = {};
  entries.filter(function(e) { return e.type === 'expense'; }).forEach(function(e) {
    cats[e.cat] = (cats[e.cat] || 0) + e.amount;
  });
  var catEntries = Object.entries(cats);
  var catMax = catEntries.reduce(function(m, c) { return Math.max(m, c[1]); }, 1);

  var colors = ['#ef4444','#f59e0b','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#f97316','#6366f1'];
  var pieTotal = catEntries.reduce(function(s, c) { return s + c[1]; }, 0) || 1;
  var pieOffset = 0;

  var addEntry = function() {
    if (!desc || !cat || !amt) return;
    setEntries([].concat(entries, [{
      desc: desc, cat: cat, amount: Number(amt), type: type
    }]));
    setDesc(''); setCat(''); setAmt('');
  };

  var removeEntry = function(i) {
    setEntries(entries.filter(function(_, idx) { return idx !== i; }));
  };

  return (
    <div style={{
      background: '#0B1120', color: '#e2e8f0', fontFamily: "'Segoe UI',system-ui,sans-serif",
      padding: '20px', borderRadius: '12px', height: '100%', boxSizing: 'border-box',
      overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '12px',
      border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
    }}>
      <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fff' }}>
        Budget Tracker
      </h2>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px',
        background: '#0f172a', borderRadius: '8px', padding: '12px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Income</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#34d399' }}>+${totalIncome.toFixed(0)}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Expenses</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#ef4444' }}>-${totalExpenses.toFixed(0)}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Remaining</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: remaining >= 0 ? '#4a9eff' : '#ef4444' }}>
            ${remaining.toFixed(0)}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          {catEntries.map(function(cat, i) {
            var pct = cat[1] / pieTotal;
            var angle = pct * 360;
            var startAngle = pieOffset;
            pieOffset += angle;
            var startRad = (startAngle - 90) * Math.PI / 180;
            var endRad = (startAngle + angle - 90) * Math.PI / 180;
            var x1 = 50 + 40 * Math.cos(startRad);
            var y1 = 50 + 40 * Math.sin(startRad);
            var x2 = 50 + 40 * Math.cos(endRad);
            var y2 = 50 + 40 * Math.sin(endRad);
            var large = angle > 180 ? 1 : 0;
            if (pct >= 0.999) {
              return <circle key={i} cx="50" cy="50" r="40" fill={colors[i % colors.length]} />;
            }
            return (
              <path key={i}
                d={'M50 50 L' + x1 + ' ' + y1 + ' A40 40 0 ' + large + ' 1 ' + x2 + ' ' + y2 + ' Z'}
                fill={colors[i % colors.length]} stroke="#0B1120" strokeWidth="1" />
            );
          })}
          {!catEntries.length && <circle cx="50" cy="50" r="40" fill="#0f172a" />}
        </svg>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {catEntries.map(function(cat, i) {
            return (
              <div key={cat[0]} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: colors[i % colors.length] }} />
                <span style={{ flex: 1, color: '#aaa' }}>{cat[0]}</span>
                <span style={{ color: '#e2e8f0' }}>${cat[1].toFixed(0)}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minHeight: 0, overflow: 'auto' }}>
        <div style={{ fontSize: '12px', color: '#94a3b8' }}>Expense Breakdown</div>
        {catEntries.map(function(cat) {
          var pct = (cat[1] / catMax) * 100;
          return (
            <div key={cat[0]} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '70px', fontSize: '11px', color: '#aaa', flexShrink: 0 }}>{cat[0]}</div>
              <div style={{ flex: 1, height: '16px', background: '#0f172a', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: pct + '%', height: '100%', background: '#4a9eff', borderRadius: '4px' }} />
              </div>
              <div style={{ fontSize: '11px', color: '#e2e8f0', minWidth: '50px', textAlign: 'right' }}>
                ${cat[1].toFixed(0)}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ borderTop: '1px solid rgba(148, 163, 184, 0.08)', paddingTop: '10px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <input placeholder="Description" value={desc}
            onChange={function(e) { setDesc(e.target.value); }}
            style={{
              flex: '1 1 100px', padding: '6px 8px', background: '#0f172a',
              border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '6px', color: '#e2e8f0',
              fontSize: '12px', outline: 'none', minWidth: '60px'
            }} />
          <input placeholder="Category" value={cat}
            onChange={function(e) { setCat(e.target.value); }}
            style={{
              flex: '1 1 80px', padding: '6px 8px', background: '#0f172a',
              border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '6px', color: '#e2e8f0',
              fontSize: '12px', outline: 'none', minWidth: '60px'
            }} />
          <input placeholder="Amount" type="number" value={amt}
            onChange={function(e) { setAmt(e.target.value); }}
            style={{
              flex: '0 1 80px', padding: '6px 8px', background: '#0f172a',
              border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '6px', color: '#e2e8f0',
              fontSize: '12px', outline: 'none', width: '70px'
            }} />
          <select value={type}
            onChange={function(e) { setType(e.target.value); }}
            style={{
              padding: '6px 8px', background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)',
              borderRadius: '6px', color: '#e2e8f0', fontSize: '12px', outline: 'none'
            }}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <button onClick={addEntry}
            style={{
              padding: '6px 12px', background: '#22d3ee', border: 'none',
              borderRadius: '6px', color: '#0B1120', cursor: 'pointer', fontSize: '12px'
            }}>
            Add
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '120px', overflow: 'auto' }}>
        {entries.slice().reverse().map(function(e, i) {
          var realI = entries.length - 1 - i;
          return (
            <div key={realI} style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 6px',
              background: '#0f172a', borderRadius: '4px', fontSize: '11px'
            }}>
              <span style={{ flex: 1, color: '#e2e8f0' }}>{e.desc}</span>
              <span style={{ color: '#94a3b8', width: '60px' }}>{e.cat}</span>
              <span style={{ color: e.type === 'income' ? '#34d399' : '#ef4444', fontWeight: 600, width: '60px', textAlign: 'right' }}>
                {e.type === 'income' ? '+' : '-'}${e.amount.toFixed(0)}
              </span>
              <button onClick={function() { removeEntry(realI); }}
                style={{
                  padding: '2px 6px', background: 'transparent', border: '1px solid rgba(148, 163, 184, 0.08)',
                  borderRadius: '4px', color: '#ef4444', cursor: 'pointer', fontSize: '10px'
                }}>
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
