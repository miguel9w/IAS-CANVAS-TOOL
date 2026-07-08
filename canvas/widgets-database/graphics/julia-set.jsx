function Widget({ appBus }) {
  var _a = React.useState(200), iterations = _a[0], setIterations = _a[1];
  var _b = React.useState(-0.7), cReal = _b[0], setCReal = _b[1];
  var _c = React.useState(0.27), cImag = _c[0], setCImag = _c[1];
  var _d = React.useState({ x: 0, y: 0 }), offset = _d[0], setOffset = _d[1];
  var _e = React.useState(3), zoom = _e[0], setZoom = _e[1];
  var _f = React.useState({ x: 0, y: 0 }), mousePos = _f[0], setMousePos = _f[1];
  var _g = React.useState(false), isDragging = _g[0], setDragging = _g[1];
  var _h = React.useState(null), dragStart = _h[0], setDragStart = _h[1];
  var canvasRef = React.useRef(null);

  var render = React.useCallback(function () {
    var canvas = canvasRef.current;
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    var imageData = ctx.createImageData(W, H);
    var data = imageData.data;
    for (var py = 0; py < H; py++) {
      for (var px = 0; px < W; px++) {
        var x0 = (px / W - 0.5) * zoom + offset.x;
        var y0 = (py / H - 0.5) * zoom + offset.y;
        var x = x0, y = y0;
        var iter = 0;
        while (x * x + y * y <= 4 && iter < iterations) {
          var xt = x * x - y * y + cReal;
          y = 2 * x * y + cImag;
          x = xt;
          iter++;
        }
        var idx = (py * W + px) * 4;
        if (iter === iterations) {
          data[idx] = 0; data[idx + 1] = 0; data[idx + 2] = 0; data[idx + 3] = 255;
        } else {
          var t = iter / iterations;
          var r = Math.round(20 + 200 * Math.pow(1 - t, 2));
          var g = Math.round(10 + 100 * Math.pow(Math.sin(t * 10), 2));
          var b = Math.round(50 + 205 * t);
          data[idx] = r; data[idx + 1] = g; data[idx + 2] = b; data[idx + 3] = 255;
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }, [iterations, cReal, cImag, offset, zoom]);

  React.useEffect(function () { render(); }, [render]);

  function handleMouseMove(e) {
    var rect = canvasRef.current.getBoundingClientRect();
    var mx = (e.clientX - rect.left) / rect.width - 0.5;
    var my = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x: offset.x + mx * zoom, y: offset.y + my * zoom });
    if (isDragging && dragStart) {
      var dx = (e.clientX - dragStart.x) / rect.width * zoom;
      var dy = (e.clientY - dragStart.y) / rect.height * zoom;
      setOffset({ x: offset.x - dx, y: offset.y - dy });
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }

  function handleMouseDown(e) { setDragging(true); setDragStart({ x: e.clientX, y: e.clientY }); }
  function handleMouseUp() { setDragging(false); setDragStart(null); }

  function handleWheel(e) {
    e.preventDefault();
    setZoom(function (z) { return Math.max(0.01, e.deltaY > 0 ? z * 1.1 : z * 0.9); });
  }

  var sliderStyle = { width: '100%', accentColor: '#a78bfa', cursor: 'pointer', height: '4px' };
  var labelStyle = { fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace', minWidth: '50px' };
  var valueStyle = { fontSize: '11px', color: '#a78bfa', fontWeight: 600, fontFamily: 'monospace', minWidth: '48px', textAlign: 'right' };

  return React.createElement('div', {
    style: {
      background: '#0B1120', color: '#e2e8f0', fontFamily: "'Fira Code','Cascadia Code',monospace",
      padding: '16px', borderRadius: '12px', height: '100%', display: 'flex', flexDirection: 'column',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.4)',
      border: '1px solid rgba(255,255,255,0.06)'
    }
  },
    React.createElement('div', {
      style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }
    },
      React.createElement('span', { style: { fontSize: '13px', fontWeight: 600, color: '#a78bfa', letterSpacing: '0.5px', textTransform: 'uppercase' } }, 'Julia Set'),
      React.createElement('span', { style: { fontSize: '11px', color: '#64748b' } }, 'Iter: ',
        React.createElement('span', { style: { color: '#a78bfa', fontWeight: 600 } }, iterations)
      )
    ),
    React.createElement('div', { style: { display: 'flex', gap: '12px', marginBottom: '8px' } },
      React.createElement('div', { style: { flex: 1, display: 'flex', alignItems: 'center', gap: '6px' } },
        React.createElement('span', { style: labelStyle }, 'c_real'),
        React.createElement('input', { type: 'range', min: -1.5, max: 1.5, step: 0.01, value: cReal, onChange: function (e) { return setCReal(Number(e.target.value)); }, style: sliderStyle }),
        React.createElement('span', { style: valueStyle }, cReal.toFixed(2))
      ),
      React.createElement('div', { style: { flex: 1, display: 'flex', alignItems: 'center', gap: '6px' } },
        React.createElement('span', { style: labelStyle }, 'c_imag'),
        React.createElement('input', { type: 'range', min: -1.5, max: 1.5, step: 0.01, value: cImag, onChange: function (e) { return setCImag(Number(e.target.value)); }, style: sliderStyle }),
        React.createElement('span', { style: valueStyle }, cImag.toFixed(2))
      )
    ),
    React.createElement('div', { style: { flex: 1, position: 'relative', overflow: 'hidden', borderRadius: '8px' } },
      React.createElement('canvas', {
        ref: canvasRef, width: 600, height: 380,
        style: { width: '100%', height: '100%', cursor: isDragging ? 'grabbing' : 'crosshair', display: 'block' },
        onMouseDown: handleMouseDown,
        onMouseMove: handleMouseMove,
        onMouseUp: handleMouseUp,
        onMouseLeave: handleMouseUp,
        onWheel: handleWheel
      }),
      React.createElement('div', {
        style: {
          position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(11,17,32,0.85)',
          padding: '4px 10px', borderRadius: '6px', fontSize: '11px', color: '#94a3b8',
          fontFamily: 'monospace', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.06)'
        }
      },
        React.createElement('span', { style: { color: '#a78bfa' } }, 'C: '),
        '(' + cReal.toFixed(2) + ', ' + cImag.toFixed(2) + ')',
        '  ',
        React.createElement('span', { style: { color: '#a78bfa' } }, 'Z: '),
        zoom.toFixed(2)
      ),
      React.createElement('div', { style: { display: 'flex', gap: '16px', position: 'absolute', top: '8px', right: '8px' } },
        React.createElement('span', { style: { background: 'rgba(11,17,32,0.85)', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', color: '#94a3b8', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.06)' } },
          '(', mousePos.x.toFixed(4), ', ', mousePos.y.toFixed(4), ')'
        )
      )
    )
  );
}
