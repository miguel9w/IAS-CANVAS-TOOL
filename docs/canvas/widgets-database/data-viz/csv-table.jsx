/*
 * DEPENDENCY: appBus (provided by canvas runtime)
 * Listens: -
 * Emits: 'csv-data' with parsed CSV array of objects
 * Note: This widget requires appBus from the canvas runtime environment.
 */

function Widget({ appBus }) {
  var useState = React.useState;
  var useCallback = React.useCallback;
  var useMemo = React.useMemo;

  var [rawText, setRawText] = useState('');
  var [data, setData] = useState(null);
  var [columns, setColumns] = useState([]);
  var [sortCol, setSortCol] = useState(null);
  var [sortDir, setSortDir] = useState(1);
  var [error, setError] = useState(null);

  var SAMPLE = [
    { Name: 'Alice', Age: 28, City: 'New York', Salary: 72000 },
    { Name: 'Bob', Age: 35, City: 'San Francisco', Salary: 95000 },
    { Name: 'Charlie', Age: 22, City: 'Chicago', Salary: 48000 },
    { Name: 'Diana', Age: 31, City: 'Austin', Salary: 68000 },
    { Name: 'Eve', Age: 45, City: 'Seattle', Salary: 112000 },
    { Name: 'Frank', Age: 29, City: 'Boston', Salary: 76000 },
  ];

  var parseCSV = useCallback(function (text) {
    try {
      setError(null);
      var lines = text.trim().split('\n');
      if (lines.length < 2) { setError('Need at least a header and one data row'); return; }
      var cols = lines[0].split(',').map(function (c) { return c.trim(); });
      if (cols.length === 0) { setError('No columns found'); return; }
      var parsed = [];
      for (var i = 1; i < lines.length; i++) {
        var vals = lines[i].split(',').map(function (c) { return c.trim(); });
        if (vals.length === 0 || (vals.length === 1 && vals[0] === '')) continue;
        var row = {};
        for (var j = 0; j < cols.length; j++) {
          var num = parseFloat(vals[j]);
          row[cols[j]] = isNaN(num) || num.toString() !== vals[j] ? vals[j] : num;
        }
        parsed.push(row);
      }
      if (parsed.length === 0) { setError('No data rows found'); return; }
      setData(parsed);
      setColumns(cols);
      setSortCol(null);
      setSortDir(1);
      if (appBus) appBus.emit('csv-data', parsed);
    } catch (e) {
      setError('Parse error: ' + e.message);
    }
  }, [appBus]);

  var handlePaste = useCallback(function (e) { setRawText(e.target.value); }, []);

  var handleParse = useCallback(function () {
    if (rawText.trim()) parseCSV(rawText);
  }, [rawText, parseCSV]);

  var loadSample = useCallback(function () {
    var header = Object.keys(SAMPLE[0]).join(',');
    var rows = SAMPLE.map(function (r) { return Object.values(r).join(','); });
    var csv = [header].concat(rows).join('\n');
    setRawText(csv);
    parseCSV(csv);
  }, [parseCSV]);

  var handleSort = useCallback(function (col) {
    var dir = sortCol === col ? -sortDir : 1;
    setSortCol(col);
    setSortDir(dir);
    var sorted = [].concat(data).sort(function (a, b) {
      var va = a[col], vb = b[col];
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return String(va).localeCompare(String(vb)) * dir;
    });
    setData(sorted);
  }, [data, sortCol, sortDir]);

  var colors = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa', '#f783ac', '#20c997'];

  var containerStyle = {
    background: '#0B1120', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif',
    padding: '16px', borderRadius: '10px', height: '100%', overflow: 'auto',
    display: 'flex', flexDirection: 'column', gap: '12px',
    border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
  };

  var textareaStyle = {
    width: '100%', minHeight: '80px', background: '#0f172a', color: '#e2e8f0',
    border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '6px', padding: '10px',
    fontFamily: 'monospace', fontSize: '12px', resize: 'vertical', boxSizing: 'border-box'
  };

  var btnStyle = {
    background: '#4dabf7', color: '#fff', border: 'none', padding: '8px 16px',
    borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px'
  };

  var btnSecondary = Object.assign({}, btnStyle, { background: 'rgba(148, 163, 184, 0.08)', marginLeft: '8px' });

  var tableStyle = {
    width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginTop: '4px'
  };

  var thStyle = {
    padding: '8px 10px', textAlign: 'left', cursor: 'pointer',
    fontWeight: 600, fontSize: '12px', borderBottom: '2px solid rgba(148, 163, 184, 0.08)',
    position: 'sticky', top: 0, userSelect: 'none'
  };

  var tdStyle = {
    padding: '6px 10px', borderBottom: '1px solid #1e1e3a', whiteSpace: 'nowrap'
  };

  return React.createElement('div', { style: containerStyle },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' } },
      React.createElement('span', { style: { fontWeight: 700, fontSize: '15px' } }, 'CSV Data Table'),
      React.createElement('button', { style: btnSecondary, onClick: loadSample }, 'Load Sample')
    ),
    React.createElement('textarea', {
      style: textareaStyle, value: rawText, onChange: handlePaste,
      placeholder: 'Paste CSV data here...\ncol1,col2,col3\nval1,val2,val3'
    }),
    React.createElement('div', { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
      React.createElement('button', { style: btnStyle, onClick: handleParse, disabled: !rawText.trim() }, 'Parse CSV'),
      data ? React.createElement('span', { style: { color: '#69db7c', fontSize: '12px' } },
        data.length + ' rows, ' + columns.length + ' columns'
      ) : null
    ),
    error ? React.createElement('div', { style: { color: '#ff6b6b', fontSize: '12px', padding: '6px', background: '#2a1a1a', borderRadius: '4px' } }, error) : null,
    data ? React.createElement('div', { style: { overflow: 'auto', flex: 1 } },
      React.createElement('table', { style: tableStyle },
        React.createElement('thead', null,
          React.createElement('tr', null,
            columns.map(function (col, i) {
              var arrow = sortCol === col ? (sortDir === 1 ? ' ▲' : ' ▼') : '';
              return React.createElement('th', {
                key: col,
                style: Object.assign({}, thStyle, { background: colors[i % colors.length], color: colors[i % colors.length] === '#ffd43b' ? '#0B1120' : '#fff' }),
                onClick: function () { handleSort(col); }
              }, col + arrow);
            })
          )
        ),
        React.createElement('tbody', null,
          data.map(function (row, ri) {
            return React.createElement('tr', {
              key: ri,
              style: { background: ri % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.04)' }
            },
              columns.map(function (col) {
                return React.createElement('td', { key: col, style: tdStyle },
                  typeof row[col] === 'number' ? String(row[col]) : (row[col] != null ? String(row[col]) : '')
                );
              })
            );
          })
        )
      )
    ) : null
  );
}
