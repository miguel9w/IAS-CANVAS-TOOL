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
      if (!labelCol && cols.length > 0) setLabelCol(cols[0]);
      if (!valueCol && num.length > 0) setValueCol(num[0]);
    };
    appBus.on('csv-data', handler);
    return function () { appBus.off('csv-data', handler); };
  }, [appBus]);

  function squarify(items, x, y, w, h) {
    // Simple slice-and-dice treemap layout
    if (items.length === 0) return [];
    var total = items.reduce(function (s, item) { return s + item.value; }, 0);
    if (total === 0) return [];
    var rects = [];
    var area = w * h;
    var remaining = [].concat(items);
    var cx = x, cy = y, cw = w, ch = h;

    while (remaining.length > 0) {
      var sum = remaining.reduce(function (s, item) { return s + item.value; }, 0);
      var isHorizontal = cw >= ch;

      var sliceVal = 0;
      var splitIdx = 0;
      for (var i = 0; i < remaining.length; i++) {
        if (sliceVal + remaining[i].value > sum * 0.5 && i > 0) break;
        sliceVal += remaining[i].value;
        splitIdx = i + 1;
      }

      var group = remaining.splice(0, Math.max(1, splitIdx));
      var gSum = group.reduce(function (s, item) { return s + item.value; }, 0);
      var p = gSum / sum;

      if (isHorizontal) {
        var sw = cw * p;
        group.forEach(function (item) {
          var ih = ch * (item.value / gSum);
          rects.push({ x: cx, y: cy, w: sw, h: ih, label: item.label, value: item.value, pct: (item.value / total) * 100 });
          cy += ih;
        });
        cx += sw;
        cw -= sw;
        cy = y;
      } else {
        var sh = ch * p;
        group.forEach(function (item) {
          var iw = cw * (item.value / gSum);
          rects.push({ x: cx, y: cy, w: iw, h: sh, label: item.label, value: item.value, pct: (item.value / total) * 100 });
          cx += iw;
        });
        cy += sh;
        ch -= sh;
        cx = x;
      }
    }
    return rects;
  }

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

    var pad = 4;

    var items = data.map(function (r) {
      return { label: String(r[labelCol]), value: Math.max(0, Number(r[valueCol])) };
    }).filter(function (item) { return item.value > 0; });

    if (items.length === 0) return;

    items.sort(function (a, b) { return b.value - a.value; });

    var minVal = items[items.length - 1].value;
    var maxVal = items[0].value;
    var valRange = maxVal - minVal || 1;

    var rects = squarify(items, pad, pad, w - pad * 2, h - pad * 2);

    var treeColors = [
      '#4dabf7', '#69db7c', '#ffa94d', '#ff6b6b', '#9775fa',
      '#ffd43b', '#f783ac', '#20c997', '#74c0fc', '#a9e34b',
      '#ff8787', '#e599f7', '#63e6be', '#ffc078', '#748ffc'
    ];

    rects.forEach(function (rect, i) {
      var t = (rect.value - minVal) / valRange;
      var color = treeColors[i % treeColors.length];
      var darken = 1 - t * 0.3;

      ctx.fillStyle = color;
      ctx.globalAlpha = 0.5 + t * 0.5;
      ctx.beginPath();
      var r = 2;
      var rx = rect.x, ry = rect.y, rw = rect.w, rh = rect.h;
      ctx.moveTo(rx + r, ry);
      ctx.lineTo(rx + rw - r, ry);
      ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r);
      ctx.lineTo(rx + rw, ry + rh - r);
      ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh);
      ctx.lineTo(rx + r, ry + rh);
      ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - r);
      ctx.lineTo(rx, ry + r);
      ctx.quadraticCurveTo(rx, ry, rx + r, ry);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.strokeStyle = '#0B1120';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      if (rect.w > 30 && rect.h > 20) {
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';
        var fs = Math.min(11, Math.max(8, Math.min(rect.w * 0.12, rect.h * 0.15)));
        ctx.font = 'bold ' + fs + 'px system-ui, sans-serif';
        var label = rect.label.length > Math.floor(rect.w / fs * 1.5) ? rect.label.substring(0, Math.floor(rect.w / fs * 1.5) - 2) + '..' : rect.label;
        ctx.fillText(label, rect.x + 4, rect.y + fs + 2);

        if (rect.h > 30) {
          ctx.font = Math.max(8, fs - 2) + 'px system-ui, sans-serif';
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.fillText(rect.pct.toFixed(1) + '%', rect.x + 4, rect.y + fs + fs + 4);
        }
      }
    });

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(valueCol + ' by ' + labelCol, 6, 14);

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
    React.createElement('div', { style: { fontWeight: 700, fontSize: '15px' } }, 'Treemap'),
    data.length > 0 ? React.createElement('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' } },
      React.createElement('label', { style: { fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' } },
        'Labels:', React.createElement('select', { style: selectStyle, value: labelCol, onChange: function (e) { setLabelCol(e.target.value); } },
          columns.map(function (c) { return React.createElement('option', { key: c, value: c }, c); })
        )
      ),
      React.createElement('label', { style: { fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' } },
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
