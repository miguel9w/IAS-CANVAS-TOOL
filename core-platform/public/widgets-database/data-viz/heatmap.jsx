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
  var [valCol, setValCol] = useState('');
  var [hoverInfo, setHoverInfo] = useState(null);
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
      if (!xCol && cols.length > 0) setXCol(cols[0]);
      if (!yCol && cols.length > 1) setYCol(cols[1]);
      if (!valCol && num.length > 0) setValCol(num[0]);
    };
    appBus.on('csv-data', handler);
    return function () { appBus.off('csv-data', handler); };
  }, [appBus]);

  var draw = useCallback(function () {
    var canvas = canvasRef.current;
    if (!canvas || !data.length || !xCol || !yCol || !valCol) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    var H = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    var w = canvas.offsetWidth, h = canvas.offsetHeight;

    var pad = { top: 40, right: 20, bottom: 60, left: 80 };
    var cw = w - pad.left - pad.right;
    var ch = h - pad.top - pad.bottom;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0B1120';
    ctx.fillRect(0, 0, w, h);

    // Build matrix
    var xLabels = [], yLabels = [];
    var xSet = {}, ySet = {};
    data.forEach(function (r) {
      var xv = String(r[xCol]); var yv = String(r[yCol]);
      if (!xSet[xv]) { xSet[xv] = true; xLabels.push(xv); }
      if (!ySet[yv]) { ySet[yv] = true; yLabels.push(yv); }
    });

    var matrix = {};
    var allVals = [];
    data.forEach(function (r) {
      var key = String(r[xCol]) + '|' + String(r[yCol]);
      var v = Number(r[valCol]);
      matrix[key] = v;
      allVals.push(v);
    });

    var sortedVals = [].concat(allVals).sort(function (a, b) { return a - b; });
    var minVal = sortedVals[0];
    var maxVal = sortedVals[sortedVals.length - 1];
    var valRange = maxVal - minVal || 1;

    var cellW = cw / xLabels.length;
    var cellH = ch / yLabels.length;

    // X labels
    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px system-ui, sans-serif';
    xLabels.forEach(function (l, i) {
      var lx = pad.left + i * cellW + cellW / 2;
      ctx.save();
      ctx.translate(lx, pad.top + ch + 14);
      ctx.rotate(Math.PI / 4);
      ctx.fillText(l.length > 8 ? l.substring(0, 8) : l, 0, 0);
      ctx.restore();
    });

    // Y labels
    ctx.textAlign = 'right';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px system-ui, sans-serif';
    yLabels.forEach(function (l, i) {
      var ly = pad.top + i * cellH + cellH / 2;
      ctx.fillText(l.length > 10 ? l.substring(0, 10) + '...' : l, pad.left - 6, ly + 3);
    });

    // Draw cells
    for (var xi = 0; xi < xLabels.length; xi++) {
      for (var yi = 0; yi < yLabels.length; yi++) {
        var key = xLabels[xi] + '|' + yLabels[yi];
        var v = matrix[key];
        var isMissing = v === undefined;

        var x = pad.left + xi * cellW;
        var y = pad.top + yi * cellH;

        if (!isMissing) {
          var t = (v - minVal) / valRange;
          var color = heatColor(t);
          ctx.fillStyle = color;
        } else {
          ctx.fillStyle = '#111122';
        }
        ctx.fillRect(x, y, cellW, cellH);

        ctx.strokeStyle = '#0B1120';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cellW, cellH);

        // Value text
        if (!isMissing && cellW > 30 && cellH > 20) {
          ctx.fillStyle = t > 0.5 ? '#fff' : '#cbd5e1';
          ctx.textAlign = 'center';
          ctx.font = '9px system-ui, sans-serif';
          ctx.fillText(formatVal(v), x + cellW / 2, y + cellH / 2 + 3);
        }
      }
    }

    // Title
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(valCol + ' (' + xCol + ' × ' + yCol + ')', pad.left, 16);

    // Color bar
    var cbx = w - 30, cby = pad.top, cbw = 12, cbh = ch;
    for (var i = 0; i <= cbh; i++) {
      var t = 1 - i / cbh;
      ctx.fillStyle = heatColor(t);
      ctx.fillRect(cbx, cby + i, cbw, 1);
    }
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
    ctx.lineWidth = 1;
    ctx.strokeRect(cbx, cby, cbw, cbh);

    ctx.fillStyle = '#64748b';
    ctx.font = '9px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(formatVal(maxVal), cbx + cbw + 4, cby + 8);
    ctx.fillText(formatVal(minVal), cbx + cbw + 4, cby + cbh);
    ctx.textAlign = 'center';
    ctx.fillText(valCol, cbx + cbw / 2, cby - 6);

  }, [data, xCol, yCol, valCol]);

  function heatColor(t) {
    // cool-to-warm: blue -> cyan -> yellow -> red
    var r, g, b;
    if (t < 0.25) {
      var p = t / 0.25;
      r = Math.round(50 + p * 30);
      g = Math.round(50 + p * 130);
      b = Math.round(180 - p * 60);
    } else if (t < 0.5) {
      var p = (t - 0.25) / 0.25;
      r = Math.round(80 + p * 100);
      g = Math.round(180 + p * 55);
      b = Math.round(120 - p * 70);
    } else if (t < 0.75) {
      var p = (t - 0.5) / 0.25;
      r = Math.round(180 + p * 55);
      g = Math.round(235 - p * 55);
      b = Math.round(50 - p * 30);
    } else {
      var p = (t - 0.75) / 0.25;
      r = Math.round(235 - p * 10);
      g = Math.round(180 - p * 100);
      b = Math.round(20 + p * 10);
    }
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  function formatVal(v) {
    if (Math.abs(v) >= 1000000) return (v / 1000000).toFixed(1) + 'M';
    if (Math.abs(v) >= 1000) return (v / 1000).toFixed(1) + 'K';
    return Number.isInteger(v) ? String(v) : v.toFixed(1);
  }

  useEffect(function () { draw(); }, [draw]);

  useEffect(function () {
    var onResize = function () { draw(); };
    window.addEventListener('resize', onResize);
    return function () { window.removeEventListener('resize', onResize); };
  }, [draw]);

  // Hover tooltip
  var handleMouseMove = useCallback(function (e) {
    var canvas = canvasRef.current;
    if (!canvas) return;
    var rect = canvas.getBoundingClientRect();
    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;

    var pad = { top: 40, left: 80 };
    var cw = canvas.offsetWidth - pad.left - 20;
    var ch = canvas.offsetHeight - pad.top - 60;

    // Need xLabels, yLabels - rebuild from data
    if (!data.length || !xCol || !yCol || !valCol) { setHoverInfo(null); return; }
    var xLabels = [], yLabels = [];
    var xSet = {}, ySet = {};
    data.forEach(function (r) {
      var xv = String(r[xCol]); var yv = String(r[yCol]);
      if (!xSet[xv]) { xSet[xv] = true; xLabels.push(xv); }
      if (!ySet[yv]) { ySet[yv] = true; yLabels.push(yv); }
    });
    var cellW = cw / xLabels.length;
    var cellH = ch / yLabels.length;

    var xi = Math.floor((mx - pad.left) / cellW);
    var yi = Math.floor((my - pad.top) / cellH);

    if (xi >= 0 && xi < xLabels.length && yi >= 0 && yi < yLabels.length) {
      var key = xLabels[xi] + '|' + yLabels[yi];
      var matrix = {};
      data.forEach(function (r) { matrix[String(r[xCol]) + '|' + String(r[yCol])] = Number(r[valCol]); });
      setHoverInfo({ x: xLabels[xi], y: yLabels[yi], val: matrix[key] !== undefined ? matrix[key] : 'N/A', cx: e.clientX - rect.left, cy: e.clientY - rect.top });
    } else {
      setHoverInfo(null);
    }
  }, [data, xCol, yCol, valCol]);

  var containerStyle = {
    background: '#0B1120', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif',
    padding: '16px', borderRadius: '10px', height: '100%', display: 'flex', flexDirection: 'column', gap: '10px',
    position: 'relative',
    border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
  };

  var selectStyle = {
    background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(148, 163, 184, 0.08)',
    borderRadius: '5px', padding: '5px 8px', fontSize: '12px', cursor: 'pointer'
  };

  return React.createElement('div', { style: containerStyle },
    React.createElement('div', { style: { fontWeight: 700, fontSize: '15px' } }, 'Heatmap'),
    data.length > 0 ? React.createElement('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' } },
      React.createElement('label', { style: { fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' } },
        'X:', React.createElement('select', { style: selectStyle, value: xCol, onChange: function (e) { setXCol(e.target.value); } },
          columns.map(function (c) { return React.createElement('option', { key: c, value: c }, c); })
        )
      ),
      React.createElement('label', { style: { fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' } },
        'Y:', React.createElement('select', { style: selectStyle, value: yCol, onChange: function (e) { setYCol(e.target.value); } },
          columns.map(function (c) { return React.createElement('option', { key: c, value: c }, c); })
        )
      ),
      React.createElement('label', { style: { fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' } },
        'Value:', React.createElement('select', { style: selectStyle, value: valCol, onChange: function (e) { setValCol(e.target.value); } },
          numericCols.map(function (c) { return React.createElement('option', { key: c, value: c }, c); })
        )
      )
    ) : React.createElement('div', { style: { color: '#475569', fontSize: '13px', padding: '20px', textAlign: 'center' } },
      'Awaiting CSV data...'
    ),
    React.createElement('div', { style: { flex: 1, position: 'relative' } },
      React.createElement('canvas', {
        ref: canvasRef,
        style: { width: '100%', height: '100%', borderRadius: '6px', position: 'absolute', top: 0, left: 0 },
        onMouseMove: handleMouseMove,
        onMouseLeave: function () { setHoverInfo(null); }
      }),
      hoverInfo ? React.createElement('div', {
        style: {
          position: 'absolute', left: hoverInfo.cx + 12 + 'px', top: hoverInfo.cy - 20 + 'px',
          background: '#0f172a', border: '1px solid #4dabf7', borderRadius: '6px',
          padding: '6px 10px', fontSize: '11px', color: '#e2e8f0',
          pointerEvents: 'none', zIndex: 10, whiteSpace: 'nowrap'
        }
      },
        xCol + ': ' + hoverInfo.x + ' | ' + yCol + ': ' + hoverInfo.y + ' | ' + valCol + ': ' + hoverInfo.val
      ) : null
    )
  );
}
