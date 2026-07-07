function Widget({ appBus }) {
  var _a = React.useState(10), sigma = _a[0], setSigma = _a[1];
  var _b = React.useState(28), rho = _b[0], setRho = _b[1];
  var _c = React.useState(2.667), beta = _c[0], setBeta = _c[1];
  var _d = React.useState(0), rotation = _d[0], setRotation = _d[1];
  var _e = React.useState(true), running = _e[0], setRunning = _e[1];
  var canvasRef = React.useRef(null);
  var rafRef = React.useRef(null);
  var trailRef = React.useRef([]);
  var stateRef = React.useRef({ x: 0.1, y: 0, z: 0 });
  var timeRef = React.useRef(0);
  var rotRef = React.useRef(0);

  var W = 600, H = 400;
  var scale = 8;

  React.useEffect(function () {
    trailRef.current = [];
    stateRef.current = { x: 0.1, y: 0, z: 0 };
    timeRef.current = 0;
  }, [sigma, rho, beta]);

  React.useEffect(function () {
    var canvas = canvasRef.current;
    if (!canvas || !running) return;
    var ctx = canvas.getContext('2d');
    var dt = 0.01;
    var maxPoints = 4000;

    function step() {
      var s = sigma, r = rho, b = beta;
      var st = stateRef.current;
      var dx = s * (st.y - st.x);
      var dy = st.x * (r - st.z) - st.y;
      var dz = st.x * st.y - b * st.z;
      st.x += dx * dt;
      st.y += dy * dt;
      st.z += dz * dt;

      rotRef.current += 0.002;
      var rot = rotRef.current;
      var cosR = Math.cos(rot), sinR = Math.sin(rot);

      var xp = st.x * cosR - st.y * sinR;
      var yp = st.x * sinR + st.y * cosR;
      var px = W / 2 + xp * scale;
      var py = H / 2 - st.z * scale * 0.6;

      var trail = trailRef.current;
      trail.push({ x: px, y: py, r: Math.atan2(st.y, st.x) });
      if (trail.length > maxPoints) trail.shift();
      setRotation(rot);

      ctx.fillStyle = '#0B1120';
      ctx.fillRect(0, 0, W, H);

      for (var i = 1; i < trail.length; i++) {
        var t = i / trail.length;
        var hue = (t * 240 + 200) % 360;
        var alpha = 0.3 + t * 0.7;
        ctx.strokeStyle = 'hsla(' + hue + ', 80%, 60%, ' + alpha + ')';
        ctx.lineWidth = 1.2 + t * 0.8;
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.stroke();
      }

      timeRef.current += dt;
      rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return function () { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [running, sigma, rho, beta]);

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
      React.createElement('span', { style: { fontSize: '13px', fontWeight: 600, color: '#f472b6', letterSpacing: '0.5px', textTransform: 'uppercase' } }, 'Lorenz Attractor'),
      React.createElement('button', {
        onClick: function () { return setRunning(function (v) { return !v; }); },
        style: {
          background: running ? '#ef4444' : '#f472b6', color: '#fff', border: 'none',
          borderRadius: '6px', padding: '5px 14px', fontSize: '10px', fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.5px', textTransform: 'uppercase'
        }
      }, running ? 'Pause' : 'Resume')
    ),
    React.createElement('div', { style: { display: 'flex', gap: '12px', marginBottom: '8px' } },
      React.createElement(ParamSlider, { label: '\u03C3', value: sigma, min: 1, max: 20, step: 0.1, onChange: setSigma, color: '#f472b6' }),
      React.createElement(ParamSlider, { label: '\u03C1', value: rho, min: 1, max: 50, step: 0.1, onChange: setRho, color: '#f472b6' }),
      React.createElement(ParamSlider, { label: '\u03B2', value: beta, min: 0.1, max: 5, step: 0.01, onChange: setBeta, color: '#f472b6' })
    ),
    React.createElement('div', { style: { flex: 1, overflow: 'hidden', borderRadius: '8px', position: 'relative' } },
      React.createElement('canvas', {
        ref: canvasRef, width: W, height: H,
        style: { width: '100%', height: '100%', display: 'block' }
      }),
      React.createElement('div', {
        style: {
          position: 'absolute', top: '8px', right: '8px', background: 'rgba(11,17,32,0.85)',
          padding: '4px 10px', borderRadius: '6px', fontSize: '10px', color: '#64748b',
          fontFamily: 'monospace', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.06)'
        }
      },
        '(\u03C3:', sigma.toFixed(1), ' \u03C1:', rho.toFixed(1), ' \u03B2:', beta.toFixed(2), ')  \u03B8:', (rotation * 180 / Math.PI).toFixed(0) + '\u00B0'
      )
    )
  );

  function ParamSlider(_a2) {
    var label = _a2.label, value = _a2.value, min = _a2.min, max = _a2.max, step = _a2.step, onChange = _a2.onChange, color = _a2.color;
    return React.createElement('div', { style: { flex: 1, display: 'flex', alignItems: 'center', gap: '6px' } },
      React.createElement('span', { style: { fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace', minWidth: '28px' } }, label),
      React.createElement('input', {
        type: 'range', min: min, max: max, step: step, value: value,
        onChange: function (e) { return onChange(Number(e.target.value)); },
        style: { flex: 1, accentColor: color, cursor: 'pointer', height: '4px' }
      }),
      React.createElement('span', { style: { fontSize: '11px', color: color, fontWeight: 600, fontFamily: 'monospace', minWidth: '40px', textAlign: 'right' } }, value.toFixed(step < 0.1 ? 2 : 1))
    );
  }
}
