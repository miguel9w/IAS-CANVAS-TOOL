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
  var [valueCol, setValueCol] = useState('');
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
      if (!labelCol) setLabelCol(cols[0]);
      if (!valueCol && num.length > 0) setValueCol(num[0]);
    };
    appBus.on('csv-data', handler);
    return function () { appBus.off('csv-data', handler); };
  }, [appBus]);

  var draw = useCallback(function () {
    var canvas = canvasRef.current;
    if (!canvas || !data.length || !labelCol || !valueCol) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    var H = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    var w = canvas.offsetWidth, h = canvas.offsetHeight;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0B1120';
    ctx.fillRect(0, 0, w, h);

    var validData = data.filter(function (r) {
      var v = Number(r[valueCol]);
      return !isNaN(v) && v > 0;
    });
    if (validData.length === 0) return;

    var total = validData.reduce(function (s, r) { return s + Number(r[valueCol]); }, 0);

    var cx = w * 0.4, cy = h / 2;
    var radius = Math.min(cx - 30, cy - 30, w * 0.3);
    var offset = 8;

    var pieColors = [
      '#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7',
      '#9775fa', '#f783ac', '#20c997', '#e599f7', '#74c0fc',
      '#a9e34b', '#ff8787'
    ];

    var angles = [];
    var currentAngle = -Math.PI / 2;
    validData.forEach(function (r) {
      var val = Number(r[valueCol]);
      var a = (val / total) * Math.PI * 2;
      angles.push({ start: currentAngle, end: currentAngle + a, value: val, label: String(r[labelCol]), pct: (val / total) * 100 });
      currentAngle += a;
    });

    // Find the biggest slice to offset
    var maxIdx = 0;
    var maxVal = 0;
    angles.forEach(function (a, i) {
      if (a.value > maxVal) { maxVal = a.value; maxIdx = i; }
    });

    angles.forEach(function (a, i) {
      var mid = (a.start + a.end) / 2;
      var ox = Math.cos(mid) * offset;
      var oy = Math.sin(mid) * offset;

      ctx.beginPath();
      ctx.moveTo(cx + ox, cy + oy);
      ctx.arc(cx + ox, cy + oy, radius, a.start, a.end);
      ctx.closePath();

      ctx.fillStyle = pieColors[i % pieColors.length];
      ctx.fill();

      ctx.strokeStyle = '#0B1120';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 3D-like highlight overlay
      var grad = ctx.createRadialGradient(cx + ox, cy + oy - radius * 0.3, 0, cx + ox, cy + oy, radius);
      grad.addColorStop(0, 'rgba(255,255,255,0.1)');
      grad.addColorStop(1, 'rgba(0,0,0,0.15)');
      ctx.fillStyle = grad;
      ctx.fill();
    });

    // Labels with percentages
    ctx.textAlign = 'center';
    angles.forEach(function (a, i) {
      var mid = (a.start + a.end) / 2;
      var lr = radius * 0.65;
      var lx = cx + Math.cos(mid) * lr;
      var ly = cy + Math.sin(mid) * lr;

      var pctStr = a.pct.toFixed(1) + '%';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px system-ui, sans-serif';
      if (a.pct > 5) ctx.fillText(pctStr, lx, ly + 4);

      // connecting line to label outside
      var outR = radius + 16;
      var olx = cx + Math.cos(mid) * outR;
      var oly = cy + Math.sin(mid) * outR;
      ctx.strokeStyle = pieColors[i % pieColors.length];
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(mid) * (radius - 4), cy + Math.sin(mid) * (radius - 4));
      ctx.lineTo(olx, oly);
      ctx.stroke();
    });

    // Legend
    var lx = w * 0.7;
    var ly = 30;
    ctx.textAlign = 'left';
    ctx.font = '11px system-ui, sans-serif';
    angles.forEach(function (a, i) {
      var y = ly + i * 20;
      if (y > h - 10) return;
      ctx.fillStyle = pieColors[i % pieColors.length];
      ctx.fillRect(lx, y - 8, 12, 12);
      ctx.fillStyle = '#cbd5e1';
      var label = a.label.length > 14 ? a.label.substring(0, 14) + '...' : a.label;
      ctx.fillText(label + ' (' + a.pct.toFixed(1) + '%)', lx + 18, y + 2);
    });

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(valueCol + ' by ' + labelCol, 10, 16);

  }, [data, labelCol, valueCol]);

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

  return React.createElement('div', { style: containerStyle },
    React.createElement('div', { style: { fontWeight: 700, fontSize: '15px' } }, 'Pie Chart'),
    data.length > 0 ? React.createElement('div', { style: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' } },
      React.createElement('label', { style: { fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' } },
        'Labels:', React.createElement('select', { style: selectStyle, value: labelCol, onChange: function (e) { setLabelCol(e.target.value); } },
          columns.map(function (c) { return React.createElement('option', { key: c, value: c }, c); })
        )
      ),
      React.createElement('label', { style: { fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' } },
        'Values:', React.createElement('select', { style: selectStyle, value: valueCol, onChange: function (e) { setValueCol(e.target.value); } },
          numericCols.map(function (c) { return React.createElement('option', { key: c, value: c }, c); })
        )
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
