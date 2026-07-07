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
  var [xCol, setXCol] = useState('');
  var [selectedSeries, setSelectedSeries] = useState([]);
  var canvasRef = useRef(null);
  var animRef = useRef(null);

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
      if (!xCol && cols.length > 0) setXCol(cols[0]);
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
    if (!canvas || !data.length || !xCol || selectedSeries.length === 0) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    var H = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    var w = canvas.offsetWidth, h = canvas.offsetHeight;

    var pad = { top: 30, right: 30, bottom: 45, left: 55 };
    var cw = w - pad.left - pad.right;
    var ch = h - pad.top - pad.bottom;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0B1120';
    ctx.fillRect(0, 0, w, h);

    var allVals = [];
    selectedSeries.forEach(function (col) {
      data.forEach(function (r) { allVals.push(Number(r[col])); });
    });
    var minV = Math.min(0, Math.min.apply(null, allVals));
    var maxV = Math.max.apply(null, allVals);
    var range = maxV - minV || 1;

    // grid
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
    ctx.lineWidth = 0.5;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'right';
    var gridCount = 5;
    for (var i = 0; i <= gridCount; i++) {
      var gy = pad.top + ch - (i / gridCount) * ch;
      var v = minV + (i / gridCount) * range;
      ctx.beginPath();
      ctx.moveTo(pad.left, gy);
      ctx.lineTo(w - pad.right, gy);
      ctx.stroke();
      ctx.fillText(formatNum(v), pad.left - 6, gy + 3);
    }

    // X labels
    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px system-ui, sans-serif';
    var xLabels = data.map(function (r) { return String(r[xCol]); });
    var xStep = Math.max(1, Math.floor(data.length / 10));
    for (var i = 0; i < data.length; i += xStep) {
      var lx = pad.left + (i / (data.length - 1 || 1)) * cw;
      ctx.fillText(xLabels[i].length > 8 ? xLabels[i].substring(0, 8) : xLabels[i], lx, pad.top + ch + 16);
    }

    var colors = ['#4dabf7', '#ff6b6b', '#69db7c', '#ffd43b', '#9775fa', '#f783ac'];

    // lines
    selectedSeries.forEach(function (col, si) {
      var vals = data.map(function (r) { return Number(r[col]); });
      ctx.strokeStyle = colors[si % colors.length];
      ctx.lineWidth = 2;
      ctx.beginPath();
      var started = false;

      var lineAnim = 1;
      var len = Math.floor(data.length * lineAnim);

      for (var i = 0; i < data.length; i++) {
        var x = pad.left + (i / (data.length - 1 || 1)) * cw;
        var y = pad.top + ch - ((vals[i] - minV) / range) * ch;
        if (!started) { ctx.moveTo(x, y); started = true; }
        else { ctx.lineTo(x, y); }
      }
      ctx.stroke();

      // dots
      data.forEach(function (r, i) {
        var x = pad.left + (i / (data.length - 1 || 1)) * cw;
        var y = pad.top + ch - ((vals[i] - minV) / range) * ch;
        ctx.fillStyle = colors[si % colors.length];
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0B1120';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    });

    // axis labels
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(xCol, pad.left, 14);
    ctx.textAlign = 'right';
    ctx.fillText(selectedSeries.join(', '), w - pad.right, 14);

    // legend
    var lx = pad.left;
    var ly = h - 6;
    ctx.textAlign = 'left';
    ctx.font = '10px system-ui, sans-serif';
    selectedSeries.forEach(function (col, si) {
      ctx.fillStyle = colors[si % colors.length];
      ctx.fillRect(lx, ly - 6, 10, 10);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(col, lx + 14, ly + 3);
      lx += ctx.measureText(col).width + 28;
    });

  }, [data, xCol, selectedSeries]);

  useEffect(function () {
    draw();
  }, [draw]);

  useEffect(function () {
    var onResize = function () { draw(); };
    window.addEventListener('resize', onResize);
    return function () { window.removeEventListener('resize', onResize); };
  }, [draw]);

  function formatNum(n) {
    if (Math.abs(n) >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (Math.abs(n) >= 1000) return (n / 1000).toFixed(1) + 'K';
    return Number.isInteger(n) ? String(n) : n.toFixed(1);
  }

  var containerStyle = {
    background: '#0B1120', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif',
    padding: '16px', borderRadius: '10px', height: '100%', display: 'flex', flexDirection: 'column', gap: '10px',
    border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
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
    React.createElement('div', { style: { fontWeight: 700, fontSize: '15px' } }, 'Line Chart'),
    data.length > 0 ? React.createElement('div', { style: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' } },
      React.createElement('label', { style: { fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' } },
        'X:', React.createElement('select', { style: selectStyle, value: xCol, onChange: function (e) { setXCol(e.target.value); } },
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
