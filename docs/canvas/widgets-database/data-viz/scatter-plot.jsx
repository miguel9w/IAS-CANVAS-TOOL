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
  var [yCol, setYCol] = useState('');
  var [colorCol, setColorCol] = useState('');
  var [pointRadius, setPointRadius] = useState(5);
  var [showTrend, setShowTrend] = useState(true);
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
      if (!xCol && num.length > 0) setXCol(num[0]);
      if (!yCol && num.length > 1) setYCol(num[1]);
      else if (!yCol && num.length > 0) setYCol(num[0]);
    };
    appBus.on('csv-data', handler);
    return function () { appBus.off('csv-data', handler); };
  }, [appBus]);

  var draw = useCallback(function () {
    var canvas = canvasRef.current;
    if (!canvas || !data.length || !xCol || !yCol) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    var H = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    var w = canvas.offsetWidth, h = canvas.offsetHeight;

    var pad = { top: 30, right: 25, bottom: 45, left: 55 };
    var cw = w - pad.left - pad.right;
    var ch = h - pad.top - pad.bottom;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0B1120';
    ctx.fillRect(0, 0, w, h);

    var xVals = data.map(function (r) { return Number(r[xCol]); });
    var yVals = data.map(function (r) { return Number(r[yCol]); });
    var allX = [].concat(xVals).sort(function (a, b) { return a - b; });
    var allY = [].concat(yVals).sort(function (a, b) { return a - b; });
    var minX = allX[0], maxX = allX[allX.length - 1];
    var minY = allY[0], maxY = allY[allY.length - 1];
    var xRange = maxX - minX || 1;
    var yRange = maxY - minY || 1;

    // grid
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
    ctx.lineWidth = 0.5;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px system-ui, sans-serif';

    for (var i = 0; i <= 5; i++) {
      var gx = pad.left + (i / 5) * cw;
      var vx = minX + (i / 5) * xRange;
      ctx.beginPath();
      ctx.moveTo(gx, pad.top);
      ctx.lineTo(gx, pad.top + ch);
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.fillText(formatNum(vx), gx, pad.top + ch + 14);
    }
    for (var i = 0; i <= 5; i++) {
      var gy = pad.top + ch - (i / 5) * ch;
      var vy = minY + (i / 5) * yRange;
      ctx.beginPath();
      ctx.moveTo(pad.left, gy);
      ctx.lineTo(w - pad.right, gy);
      ctx.stroke();
      ctx.textAlign = 'right';
      ctx.fillText(formatNum(vy), pad.left - 6, gy + 3);
    }

    // trend line
    if (showTrend) {
      var n = data.length;
      var sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
      data.forEach(function (r) {
        var x = Number(r[xCol]), y = Number(r[yCol]);
        sumX += x; sumY += y; sumXY += x * y; sumX2 += x * x;
      });
      var slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX || 1);
      var intercept = (sumY - slope * sumX) / n;

      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      var tx1 = pad.left;
      var ty1 = pad.top + ch - ((slope * minX + intercept - minY) / yRange) * ch;
      var tx2 = pad.left + cw;
      var ty2 = pad.top + ch - ((slope * maxX + intercept - minY) / yRange) * ch;
      ctx.moveTo(tx1, ty1);
      ctx.lineTo(tx2, ty2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // points
    var colorMap = {};
    if (colorCol && columns.indexOf(colorCol) >= 0) {
      var uniqueVals = [];
      data.forEach(function (r) {
        var v = String(r[colorCol]);
        if (uniqueVals.indexOf(v) < 0) uniqueVals.push(v);
      });
      var catColors = ['#4dabf7', '#ff6b6b', '#69db7c', '#ffd43b', '#9775fa', '#f783ac', '#20c997', '#ffa94d', '#e599f7', '#74c0fc'];
      uniqueVals.forEach(function (v, i) { colorMap[v] = catColors[i % catColors.length]; });
    }

    var r = Math.max(2, Math.min(15, pointRadius));

    data.forEach(function (row) {
      var x = pad.left + ((Number(row[xCol]) - minX) / xRange) * cw;
      var y = pad.top + ch - ((Number(row[yCol]) - minY) / yRange) * ch;

      ctx.fillStyle = colorCol && colorMap[String(row[colorCol])]
        ? colorMap[String(row[colorCol])]
        : '#4dabf7';
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // axis labels
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(xCol, pad.left, 14);
    ctx.textAlign = 'right';
    ctx.fillText(yCol, w - pad.right, 14);

  }, [data, xCol, yCol, colorCol, pointRadius, showTrend]);

  useEffect(function () { draw(); }, [draw]);

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
    border: '1px solid rgba(34, 211, 238, 0.15)',
    boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
  };

  var selectStyle = {
    background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(148, 163, 184, 0.08)',
    borderRadius: '5px', padding: '5px 8px', fontSize: '12px', cursor: 'pointer'
  };

  return React.createElement('div', { style: containerStyle },
    React.createElement('div', { style: { fontWeight: 700, fontSize: '15px' } }, 'Scatter Plot'),
    data.length > 0 ? React.createElement('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' } },
      React.createElement('label', { style: { fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' } },
        'X:', React.createElement('select', { style: Object.assign({}, selectStyle, { width: '80px' }), value: xCol, onChange: function (e) { setXCol(e.target.value); } },
          numericCols.map(function (c) { return React.createElement('option', { key: c, value: c }, c); })
        )
      ),
      React.createElement('label', { style: { fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' } },
        'Y:', React.createElement('select', { style: Object.assign({}, selectStyle, { width: '80px' }), value: yCol, onChange: function (e) { setYCol(e.target.value); } },
          numericCols.map(function (c) { return React.createElement('option', { key: c, value: c }, c); })
        )
      ),
      React.createElement('label', { style: { fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' } },
        'Color:', React.createElement('select', { style: Object.assign({}, selectStyle, { width: '80px' }), value: colorCol, onChange: function (e) { setColorCol(e.target.value); } },
          React.createElement('option', { value: '' }, 'None'),
          columns.map(function (c) { return React.createElement('option', { key: c, value: c }, c); })
        )
      ),
      React.createElement('label', { style: { fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' } },
        'Radius:',
        React.createElement('input', {
          type: 'range', min: 2, max: 15, step: 0.5,
          value: pointRadius,
          onChange: function (e) { setPointRadius(parseFloat(e.target.value)); },
          style: { width: '60px' }
        }),
        React.createElement('span', { style: { fontSize: '10px', color: '#64748b' } }, pointRadius.toFixed(1))
      ),
      React.createElement('label', { style: { fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' } },
        React.createElement('input', {
          type: 'checkbox', checked: showTrend,
          onChange: function (e) { setShowTrend(e.target.checked); }
        }),
        'Trend'
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
