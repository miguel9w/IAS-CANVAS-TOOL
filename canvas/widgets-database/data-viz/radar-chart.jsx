/*
 * DEPENDENCY: appBus (provided by canvas runtime)
 * Listens: 'csv-data' with array of objects
 * Emits: -
 * Note: This widget requires appBus from the canvas runtime environment.
 */

function Widget({ appBus }) {
  var useState = React.useState;
  var useEffect = React.useEffect;
  var useRef = React.useRef;
  var useCallback = React.useCallback;

  var [data, setData] = useState([]);
  var [columns, setColumns] = useState([]);
  var [numericCols, setNumericCols] = useState([]);
  var [labelCol, setLabelCol] = useState('');
  var [selectedSeries, setSelectedSeries] = useState([]);
  var canvasRef = useRef(null);

  useEffect(function () {
    if (!appBus) return;
    var handler = function (d) {
      if (!d || d.length === 0) return;
      setData(d);
      var cols = Object.keys(d[0]);
      setColumns(cols);
      var num = cols.filter(function (c) {
        return d.every(function (r) { return !isNaN(parseFloat(r[c])) && isFinite(r[c]); });
      });
      setNumericCols(num);
      if (!labelCol && cols.length > 0) setLabelCol(cols[0]);
      if (selectedSeries.length === 0 && num.length > 0) setSelectedSeries([num[0]]);
    };
    appBus.on('csv-data', handler);
    return function () { appBus.off('csv-data', handler); };
  }, [appBus]);

  var toggleSeries = useCallback(function (col) {
    setSelectedSeries(function (prev) {
      if (prev.indexOf(col) >= 0) return prev.filter(function (c) { return c !== col; });
      if (prev.length >= 6) return prev;
      return prev.concat([col]);
    });
  }, []);

  var draw = useCallback(function () {
    var canvas = canvasRef.current;
    if (!canvas || !data.length || !labelCol || selectedSeries.length === 0) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    var H = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    var w = canvas.offsetWidth, h = canvas.offsetHeight;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0B1120';
    ctx.fillRect(0, 0, w, h);

    var cx = w / 2, cy = h / 2;
    var radius = Math.min(cx, cy) - 50;

    var labels = data.map(function (r) { return String(r[labelCol]); });
    var n = labels.length;
    if (n < 3) return;

    var angleStep = (Math.PI * 2) / n;

    // Find global max for scaling
    var allVals = [];
    selectedSeries.forEach(function (col) {
      data.forEach(function (r) { allVals.push(Number(r[col])); });
    });
    var maxVal = Math.max.apply(null, allVals);
    maxVal = maxVal * 1.1 || 1;

    // Grid rings
    var rings = 5;
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
    ctx.lineWidth = 0.5;
    for (var ri = 1; ri <= rings; ri++) {
      var r = (ri / rings) * radius;
      ctx.beginPath();
      for (var i = 0; i <= n; i++) {
        var a = i * angleStep - Math.PI / 2;
        var px = cx + Math.cos(a) * r;
        var py = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      // Ring labels
      ctx.fillStyle = '#475569';
      ctx.font = '9px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(formatNum((ri / rings) * maxVal), cx + 4, cy - r + 3);
    }

    // Axis lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
    ctx.lineWidth = 0.5;
    for (var i = 0; i < n; i++) {
      var a = i * angleStep - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
      ctx.stroke();
    }

    var colors = ['#4dabf7', '#ff6b6b', '#69db7c', '#ffd43b', '#9775fa', '#f783ac'];

    // Data polygons
    selectedSeries.forEach(function (col, si) {
      var vals = data.map(function (r) { return Number(r[col]); });

      ctx.beginPath();
      for (var i = 0; i <= n; i++) {
        var idx = i % n;
        var a = idx * angleStep - Math.PI / 2;
        var r = (vals[idx] / maxVal) * radius;
        var px = cx + Math.cos(a) * r;
        var py = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      ctx.fillStyle = colors[si % colors.length] + '33';
      ctx.fill();
      ctx.strokeStyle = colors[si % colors.length];
      ctx.lineWidth = 2;
      ctx.stroke();

      // Dots
      for (var i = 0; i < n; i++) {
        var a = i * angleStep - Math.PI / 2;
        var r = (vals[i] / maxVal) * radius;
        var px = cx + Math.cos(a) * r;
        var py = cy + Math.sin(a) * r;
        ctx.fillStyle = colors[si % colors.length];
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0B1120';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    // Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    for (var i = 0; i < n; i++) {
      var a = i * angleStep - Math.PI / 2;
      var lx = cx + Math.cos(a) * (radius + 18);
      var ly = cy + Math.sin(a) * (radius + 18);
      ctx.fillText(labels[i].length > 10 ? labels[i].substring(0, 10) + '...' : labels[i], lx, ly + 3);
    }

    // Title
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Radar Chart', 10, 16);

    // Legend
    var lx = 10;
    var ly = h - selectedSeries.length * 20 - 10;
    ctx.textAlign = 'left';
    ctx.font = '10px system-ui, sans-serif';
    selectedSeries.forEach(function (col, si) {
      var y = ly + si * 20;
      ctx.fillStyle = colors[si % colors.length];
      ctx.fillRect(lx, y - 6, 10, 10);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(col, lx + 16, y + 3);
    });

  }, [data, labelCol, selectedSeries]);

  function formatNum(n) {
    if (Math.abs(n) >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (Math.abs(n) >= 1000) return (n / 1000).toFixed(1) + 'K';
    return Number.isInteger(n) ? String(n) : n.toFixed(1);
  }

  useEffect(function () { draw(); }, [draw]);

  useEffect(function () {
    var onResize = function () { draw(); };
    window.addEventListener('resize', onResize);
    return function () { window.removeEventListener('resize', onResize); };
  }, [draw]);

  var containerStyle = {
    background: '#0B1120', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif',
    padding: '16px', borderRadius: '10px', height: '100%', display: 'flex', flexDirection: 'column', gap: '10px',
    border: '1px solid rgba(34, 211, 238, 0.15)',
    boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
  };

  var selectStyle = {
    background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(148, 163, 184, 0.08)',
    borderRadius: '5px', padding: '5px 8px', fontSize: '12px', cursor: 'pointer'
  };

  var chipStyle = {
    display: 'inline-block', padding: '2px 8px', borderRadius: '10px',
    fontSize: '11px', cursor: 'pointer', border: '1px solid rgba(148, 163, 184, 0.08)', margin: '2px'
  };

  var colors = ['#4dabf7', '#ff6b6b', '#69db7c', '#ffd43b', '#9775fa', '#f783ac'];

  return React.createElement('div', { style: containerStyle },
    React.createElement('div', { style: { fontWeight: 700, fontSize: '15px' } }, 'Radar Chart'),
    data.length > 0 ? React.createElement('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' } },
      React.createElement('label', { style: { fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' } },
        'Labels:', React.createElement('select', { style: selectStyle, value: labelCol, onChange: function (e) { setLabelCol(e.target.value); } },
          columns.map(function (c) { return React.createElement('option', { key: c, value: c }, c); })
        )
      ),
      React.createElement('div', { style: { fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' } },
        React.createElement('span', null, 'Series:'),
        numericCols.map(function (c) {
          var active = selectedSeries.indexOf(c) >= 0;
          var ci = selectedSeries.indexOf(c);
          return React.createElement('span', {
            key: c,
            style: Object.assign({}, chipStyle, {
              background: active ? (colors[ci % colors.length] + '33') : 'transparent',
              borderColor: active ? colors[ci % colors.length] : 'rgba(148, 163, 184, 0.08)',
              color: active ? '#fff' : '#64748b'
            }),
            onClick: function () { toggleSeries(c); }
          }, c);
        })
      )
    ) : React.createElement('div', { style: { color: '#475569', fontSize: '13px', padding: '20px', textAlign: 'center' } },
      'Awaiting CSV data...'
    ),
    React.createElement('canvas', {
      ref: canvasRef,
      style: { flex: 1, width: '100%', borderRadius: '6px', minHeight: '200px' }
    })
  );
}
