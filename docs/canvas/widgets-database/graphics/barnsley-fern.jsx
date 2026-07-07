function Widget({ appBus }) {
  var _a = React.useState(0.01), p1 = _a[0], setP1 = _a[1];
  var _b = React.useState(0.85), p2 = _b[0], setP2 = _b[1];
  var _c = React.useState(0.07), p3 = _c[0], setP3 = _c[1];
  var _d = React.useState(0.07), p4 = _d[0], setP4 = _d[1];
  var _e = React.useState(0), dotCount = _e[0], setDotCount = _e[1];
  var _f = React.useState(false), running = _f[0], setRunning = _f[1];
  var _g = React.useState(50000), targetDots = _g[0], setTargetDots = _g[1];
  var canvasRef = React.useRef(null);
  var rafRef = React.useRef(null);
  var stateRef = React.useRef({ x: 0, y: 0, count: 0 });

  var W = 500, H = 500;
  var scale = 55, offsetX = 250, offsetY = 470;

  var transforms = [
    function (x, y) { return { x: 0, y: 0.16 * y }; },
    function (x, y) { return { x: 0.85 * x + 0.04 * y, y: -0.04 * x + 0.85 * y + 1.6 }; },
    function (x, y) { return { x: 0.2 * x - 0.26 * y, y: 0.23 * x + 0.22 * y + 1.6 }; },
    function (x, y) { return { x: -0.15 * x + 0.28 * y, y: 0.26 * x + 0.24 * y + 0.44 }; }
  ];

  React.useEffect(function () {
    stateRef.current = { x: 0, y: 0, count: 0 };
    setDotCount(0);
    var canvas = canvasRef.current;
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0B1120';
    ctx.fillRect(0, 0, W, H);
  }, []);

  React.useEffect(function () {
    if (!running) return;
    var canvas = canvasRef.current;
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var st = stateRef.current;
    st.count = 0;
    st.x = 0; st.y = 0;
    ctx.fillStyle = '#0B1120';
    ctx.fillRect(0, 0, W, H);

    function step() {
      var batch = 500;
      for (var i = 0; i < batch && st.count < targetDots; i++) {
        var r = Math.random();
        var idx;
        if (r < p1) idx = 0;
        else if (r < p1 + p2) idx = 1;
        else if (r < p1 + p2 + p3) idx = 2;
        else idx = 3;
        var t = transforms[idx];
        var newPos = t(st.x, st.y);
        st.x = newPos.x;
        st.y = newPos.y;
        if (st.count > 10) {
          var px = st.x * scale + offsetX;
          var py = offsetY - st.y * scale;
          if (px >= 0 && px < W && py >= 0 && py < H) {
            var hue = 90 + idx * 20;
            var lightness = 40 + Math.random() * 30;
            ctx.fillStyle = 'hsl(' + hue + ', 70%, ' + lightness + '%)';
            ctx.fillRect(px, py, 1.2, 1.2);
          }
        }
        st.count++;
      }
      setDotCount(st.count);
      if (st.count < targetDots) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setRunning(false);
      }
    }
    rafRef.current = requestAnimationFrame(step);
    return function () { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [running, targetDots, p1, p2, p3, p4]);

  function reset() {
    setRunning(false);
    stateRef.current = { x: 0, y: 0, count: 0 };
    setDotCount(0);
    var canvas = canvasRef.current;
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0B1120';
    ctx.fillRect(0, 0, W, H);
  }

  function getProbs() {
    var sum = p1 + p2 + p3 + p4;
    return { p1: p1 / sum, p2: p2 / sum, p3: p3 / sum, p4: p4 / sum };
  }

  var probs = getProbs();
  var sliderStyle = { flex: 1, accentColor: '#22c55e', cursor: 'pointer', height: '4px' };

  return React.createElement('div', {
    style: {
      background: '#0B1120', color: '#e2e8f0', fontFamily: "'Fira Code','Cascadia Code',monospace",
      padding: '16px', borderRadius: '12px', height: '100%', display: 'flex', flexDirection: 'column',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.4)',
      border: '1px solid rgba(255,255,255,0.06)'
    }
  },
    React.createElement('div', {
      style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }
    },
      React.createElement('span', { style: { fontSize: '13px', fontWeight: 600, color: '#22c55e', letterSpacing: '0.5px', textTransform: 'uppercase' } }, 'Barnsley Fern'),
      React.createElement('span', { style: { fontSize: '11px', color: '#64748b' } },
        'Leaves: ',
        React.createElement('span', { style: { color: '#22c55e', fontWeight: 600 } }, dotCount.toLocaleString())
      )
    ),
    React.createElement('div', { style: { display: 'flex', gap: '12px' } },
      React.createElement('div', { style: { flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
          React.createElement('span', { style: { fontSize: '10px', color: '#64748b', minWidth: '14px' } }, 'f1'),
          React.createElement('input', { type: 'range', min: 0.001, max: 0.5, step: 0.001, value: p1, onChange: function (e) { return setP1(Number(e.target.value)); }, style: sliderStyle }),
          React.createElement('span', { style: { fontSize: '10px', color: '#22c55e', fontWeight: 600, minWidth: '36px', textAlign: 'right' } }, (probs.p1 * 100).toFixed(1) + '%')
        ),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
          React.createElement('span', { style: { fontSize: '10px', color: '#64748b', minWidth: '14px' } }, 'f2'),
          React.createElement('input', { type: 'range', min: 0.001, max: 0.95, step: 0.001, value: p2, onChange: function (e) { return setP2(Number(e.target.value)); }, style: sliderStyle }),
          React.createElement('span', { style: { fontSize: '10px', color: '#22c55e', fontWeight: 600, minWidth: '36px', textAlign: 'right' } }, (probs.p2 * 100).toFixed(1) + '%')
        ),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
          React.createElement('span', { style: { fontSize: '10px', color: '#64748b', minWidth: '14px' } }, 'f3'),
          React.createElement('input', { type: 'range', min: 0.001, max: 0.5, step: 0.001, value: p3, onChange: function (e) { return setP3(Number(e.target.value)); }, style: sliderStyle }),
          React.createElement('span', { style: { fontSize: '10px', color: '#22c55e', fontWeight: 600, minWidth: '36px', textAlign: 'right' } }, (probs.p3 * 100).toFixed(1) + '%')
        ),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
          React.createElement('span', { style: { fontSize: '10px', color: '#64748b', minWidth: '14px' } }, 'f4'),
          React.createElement('input', { type: 'range', min: 0.001, max: 0.5, step: 0.001, value: p4, onChange: function (e) { return setP4(Number(e.target.value)); }, style: sliderStyle }),
          React.createElement('span', { style: { fontSize: '10px', color: '#22c55e', fontWeight: 600, minWidth: '36px', textAlign: 'right' } }, (probs.p4 * 100).toFixed(1) + '%')
        )
      ),
      React.createElement('div', { style: { width: '200px', height: '200px', overflow: 'hidden', borderRadius: '8px', flexShrink: 0 } },
        React.createElement('canvas', {
          ref: canvasRef, width: W, height: H,
          style: { width: '200px', height: '200px', display: 'block' }
        })
      )
    ),
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' } },
      React.createElement('div', { style: { flex: 1, display: 'flex', alignItems: 'center', gap: '8px' } },
        React.createElement('span', { style: { fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap' } }, 'Target:'),
        React.createElement('input', {
          type: 'range', min: 1000, max: 200000, step: 1000, value: targetDots,
          onChange: function (e) { return setTargetDots(Number(e.target.value)); },
          style: { flex: 1, accentColor: '#22c55e', cursor: 'pointer', height: '4px' }
        }),
        React.createElement('span', { style: { fontSize: '11px', color: '#22c55e', fontWeight: 600, minWidth: '50px', textAlign: 'right' } }, targetDots.toLocaleString())
      ),
      !running ? React.createElement('button', {
        onClick: function () { return setRunning(true); },
        style: {
          background: '#22c55e', color: '#0B1120', border: 'none', borderRadius: '6px',
          padding: '6px 16px', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
          fontFamily: 'inherit', letterSpacing: '0.5px', textTransform: 'uppercase'
        }
      }, 'Grow') : React.createElement('button', {
        onClick: function () { return setRunning(false); },
        style: {
          background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px',
          padding: '6px 16px', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
          fontFamily: 'inherit', letterSpacing: '0.5px', textTransform: 'uppercase'
        }
      }, 'Stop'),
      React.createElement('button', {
        onClick: reset,
        style: {
          background: 'rgba(255,255,255,0.08)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '6px', padding: '5px 12px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
        }
      }, 'Reset')
    )
  );
}
