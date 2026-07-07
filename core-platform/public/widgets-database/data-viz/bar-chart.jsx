function Widget({ appBus }) {
  var useState = React.useState;
  var useEffect = React.useEffect;
  var useRef = React.useRef;
  var useCallback = React.useCallback;
  var useMemo = React.useMemo;

  var [data, setData] = useState([]);
  var [columns, setColumns] = useState([]);
  var [numericCols, setNumericCols] = useState([]);
  var [xCol, setXCol] = useState('');
  var [yCol, setYCol] = useState('');
  var canvasRef = useRef(null);
  var animRef = useRef(null);
  var animProgress = useRef(0);

  useEffect(function () {
    if (!appBus) return;
    var handler = function (d) {
      if (!d || d.length === 0) return;
      setData(d);
      var cols = Object.keys(d[0]);
      setColumns(cols);
      var num = cols.filter(function (c) {
        return typeof d[0][c] === 'number' || d.every(function (r) { return !isNaN(parseFloat(r[c])) && isFinite(r[c]); });
      });
      setNumericCols(num);
      if (!xCol && cols.length > 0) setXCol(cols[0]);
      if (!yCol && num.length > 0) setYCol(num[0]);
      else if (!yCol && num.length > 0) setYCol(num[0]);
    };
    appBus.on('csv-data', handler);
    return function () { appBus.off('csv-data', handler); };
  }, [appBus]);

  var draw = useCallback(function (progress) {
    var canvas = canvasRef.current;
    if (!canvas || !data.length || !xCol || !yCol) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    var H = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    var w = canvas.offsetWidth, h = canvas.offsetHeight;

    var pad = { top: 30, right: 20, bottom: 50, left: 60 };
    var cw = w - pad.left - pad.right;
    var ch = h - pad.top - pad.bottom;

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = '#0B1120';
    ctx.fillRect(0, 0, w, h);

    var values = data.map(function (r) { return Number(r[yCol]); });
    var sorted = [].concat(values).sort(function (a, b) { return a - b; });
    var minVal = Math.min(0, sorted[0]);
    var maxVal = sorted[sorted.length - 1];
    var range = maxVal - minVal || 1;

    var labels = data.map(function (r) { return String(r[xCol]); });

    var barW = Math.min(cw / data.length * 0.7, 60);
    var gap = (cw - barW * data.length) / (data.length + 1);

    var gridCount = 5;
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
    ctx.lineWidth = 0.5;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'right';
    for (var i = 0; i <= gridCount; i++) {
      var y = pad.top + ch - (i / gridCount) * ch;
      var v = minVal + (i / gridCount) * range;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();
      ctx.fillText(formatNum(v), pad.left - 6, y + 3);
    }

    var colors = ['#4dabf7', '#69db7c', '#ffa94d', '#ff6b6b', '#9775fa', '#ffd43b', '#f783ac', '#20c997'];
    ctx.textAlign = 'center';

    data.forEach(function (row, i) {
      var v = Number(row[yCol]);
      var barH = ((v - minVal) / range) * ch * Math.min(1, progress);
      var x = pad.left + gap + i * (barW + gap);
      var y = pad.top + ch - barH;

      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      var r = 3;
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + barW - r, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
      ctx.lineTo(x + barW, pad.top + ch);
      ctx.lineTo(x, pad.top + ch);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.fill();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '10px system-ui, sans-serif';
      ctx.fillText(barH > 15 ? '' : formatNum(v), x + barW / 2, y - 5);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px system-ui, sans-serif';
      ctx.save();
      ctx.translate(x + barW / 2, pad.top + ch + 14);
      ctx.rotate(Math.PI / 6);
      ctx.fillText(labels[i].length > 10 ? labels[i].substring(0, 10) + '...' : labels[i], 0, 0);
      ctx.restore();
    });

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(yCol, w - pad.right, 16);

    ctx.textAlign = 'left';
    ctx.fillText(xCol, pad.left, 16);
  }, [data, xCol, yCol]);

  useEffect(function () {
    animProgress.current = 0;
    var duration = 40;
    function step() {
      animProgress.current = Math.min(1, animProgress.current + 0.03);
      draw(animProgress.current);
      if (animProgress.current < 1) {
        animRef.current = requestAnimationFrame(step);
      }
    }
    animRef.current = requestAnimationFrame(step);
    return function () { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [draw, data, xCol, yCol]);

  useEffect(function () {
    var onResize = function () { draw(1); };
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

  return React.createElement('div', { style: containerStyle },
    React.createElement('div', { style: { fontWeight: 700, fontSize: '15px' } }, 'Bar Chart'),
    data.length > 0 ? React.createElement('div', { style: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' } },
      React.createElement('label', { style: { fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' } },
        'X:', React.createElement('select', { style: selectStyle, value: xCol, onChange: function (e) { setXCol(e.target.value); } },
          columns.map(function (c) { return React.createElement('option', { key: c, value: c }, c); })
        )
      ),
      React.createElement('label', { style: { fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' } },
        'Y:', React.createElement('select', { style: selectStyle, value: yCol, onChange: function (e) { setYCol(e.target.value); } },
          numericCols.map(function (c) { return React.createElement('option', { key: c, value: c }, c); })
        )
      )
    ) : React.createElement('div', { style: { color: '#475569', fontSize: '13px', padding: '20px', textAlign: 'center' } },
      'Awaiting CSV data... Use the CSV Table widget to load data.'
    ),
    React.createElement('canvas', {
      ref: canvasRef,
      style: { flex: 1, width: '100%', borderRadius: '6px', minHeight: '200px' }
    })
  );
}
