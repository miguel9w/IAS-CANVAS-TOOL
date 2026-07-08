function Widget({ appBus }) {
  var _a = React.useState(200), iterations = _a[0], setIterations = _a[1];
  var _b = React.useState({ x: 0, y: 0 }), offset = _b[0], setOffset = _b[1];
  var _c = React.useState(3.5), zoom = _c[0], setZoom = _c[1];
  var _d = React.useState({ x: 0, y: 0 }), mousePos = _d[0], setMousePos = _d[1];
  var _e = React.useState(false), isDragging = _e[0], setDragging = _e[1];
  var _f = React.useState(null), dragStart = _f[0], setDragStart = _f[1];
  var _g = React.useState(false), animating = _g[0], setAnimating = _g[1];
  var _h = React.useState(0), animZoom = _h[0], setAnimZoom = _h[1];
  var canvasRef = React.useRef(null);
  var rafRef = React.useRef(null);

  var render = React.useCallback(function (iters, offX, offY, zm, animZ) {
    var canvas = canvasRef.current;
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    var zf = zm * (animZ > 0 ? Math.pow(0.95, animZ) : 1);
    var imageData = ctx.createImageData(W, H);
    var data = imageData.data;
    for (var py = 0; py < H; py++) {
      for (var px = 0; px < W; px++) {
        var x0 = (px / W - 0.5) * zf + offX;
        var y0 = (py / H - 0.5) * zf + offY;
        var x = 0, y = 0;
        var iter = 0;
        while (x * x + y * y <= 4 && iter < iters) {
          var xt = x * x - y * y + x0;
          y = 2 * x * y + y0;
          x = xt;
          iter++;
        }
        var idx = (py * W + px) * 4;
        var hue = (iter / iters) * 360 + 180;
        if (iter === iters) {
          data[idx] = 0; data[idx + 1] = 0; data[idx + 2] = 0; data[idx + 3] = 255;
        } else {
          var sat = 100, light = 50 + 20 * Math.sin(iter * 0.3);
          var rgb = hslToRgb(hue % 360, sat / 100, light / 100);
          data[idx] = rgb[0]; data[idx + 1] = rgb[1]; data[idx + 2] = rgb[2]; data[idx + 3] = 255;
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }, []);

  React.useEffect(function () {
    render(iterations, offset.x, offset.y, zoom, animZoom);
  }, [iterations, offset, zoom, animZoom, render]);

  React.useEffect(function () {
    if (animating) {
      var start = performance.now();
      function step() {
        var elapsed = Math.floor((performance.now() - start) / 100);
        if (elapsed >= 60) { setAnimating(false); setAnimZoom(0); return; }
        setAnimZoom(elapsed);
        rafRef.current = requestAnimationFrame(step);
      }
      rafRef.current = requestAnimationFrame(step);
      return function () { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }
  }, [animating]);

  function hslToRgb(h, s, l) {
    var c = (1 - Math.abs(2 * l - 1)) * s;
    var x = c * (1 - Math.abs((h / 60) % 2 - 1));
    var m = l - c / 2;
    var r, g, b;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
  }

  function handleCanvasClick(e) {
    var rect = canvasRef.current.getBoundingClientRect();
    var mx = (e.clientX - rect.left) / rect.width - 0.5;
    var my = (e.clientY - rect.top) / rect.height - 0.5;
    var zf = zoom * (animZoom > 0 ? Math.pow(0.95, animZoom) : 1);
    var newX = offset.x + mx * zf;
    var newY = offset.y + my * zf;
    setZoom(zf * 0.5);
    setOffset({ x: newX, y: newY });
    setAnimating(true);
    setAnimZoom(0);
  }

  function handleMouseDown(e) {
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }

  function handleMouseMove(e) {
    var rect = canvasRef.current.getBoundingClientRect();
    var mx = (e.clientX - rect.left) / rect.width - 0.5;
    var my = (e.clientY - rect.top) / rect.height - 0.5;
    var zf = zoom * (animZoom > 0 ? Math.pow(0.95, animZoom) : 1);
    setMousePos({
      x: offset.x + mx * zf,
      y: offset.y + my * zf
    });
    if (isDragging && dragStart) {
      var dx = (e.clientX - dragStart.x) / rect.width * zf;
      var dy = (e.clientY - dragStart.y) / rect.height * zf;
      setOffset({ x: offset.x - dx, y: offset.y - dy });
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }

  function handleMouseUp() { setDragging(false); setDragStart(null); }

  function handleWheel(e) {
    e.preventDefault();
    var factor = e.deltaY > 0 ? 1.1 : 0.9;
    setZoom(function (z) { return Math.max(0.001, z * factor); });
  }

  return React.createElement('div', {
    style: {
      background: '#0B1120', color: '#e2e8f0', fontFamily: "'Fira Code','Cascadia Code',monospace",
      padding: '16px', borderRadius: '12px', height: '100%', display: 'flex', flexDirection: 'column',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.4)',
      border: '1px solid rgba(255,255,255,0.06)'
    }
  },
    React.createElement('div', {
      style: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '10px', gap: '12px'
      }
    },
      React.createElement('span', { style: { fontSize: '13px', fontWeight: 600, color: '#60a5fa', letterSpacing: '0.5px', textTransform: 'uppercase' } }, 'Mandelbrot Explorer'),
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#94a3b8' } },
        React.createElement('span', null, 'Iterations:'),
        React.createElement('input', {
          type: 'range', min: 50, max: 500, value: iterations,
          onChange: function (e) { return setIterations(Number(e.target.value)); },
          style: { width: '100px', accentColor: '#60a5fa', cursor: 'pointer' }
        }),
        React.createElement('span', { style: { color: '#60a5fa', fontWeight: 600, minWidth: '30px' } }, iterations)
      )
    ),
    React.createElement('div', { style: { position: 'relative', flex: 1, overflow: 'hidden', borderRadius: '8px' } },
      React.createElement('canvas', {
        ref: canvasRef, width: 600, height: 400,
        style: { width: '100%', height: '100%', cursor: isDragging ? 'grabbing' : 'crosshair', display: 'block' },
        onClick: handleCanvasClick,
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
        React.createElement('span', { style: { color: '#60a5fa' } }, 'C: '),
        '(' + mousePos.x.toFixed(6) + ', ' + mousePos.y.toFixed(6) + ')',
        '  ',
        React.createElement('span', { style: { color: '#60a5fa' } }, 'Z: '),
        (zoom * (animZoom > 0 ? Math.pow(0.95, animZoom) : 1)).toFixed(6)
      ),
      React.createElement('div', {
        style: {
          position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(11,17,32,0.85)',
          padding: '4px 10px', borderRadius: '6px', fontSize: '10px', color: '#64748b',
          fontFamily: 'monospace', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.06)'
        }
      }, 'Click to zoom · Scroll to zoom · Drag to pan')
    )
  );
}
