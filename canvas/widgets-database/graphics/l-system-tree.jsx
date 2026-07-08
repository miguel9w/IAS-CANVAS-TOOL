function Widget({ appBus }) {
  var _a = React.useState(5), iterations = _a[0], setIterations = _a[1];
  var _b = React.useState(25), angle = _b[0], setAngle = _b[1];
  var _c = React.useState(0), seed = _c[0], setSeed = _c[1];
  var canvasRef = React.useRef(null);

  var W = 600, H = 500;

  var render = React.useCallback(function () {
    var canvas = canvasRef.current;
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0B1120';
    ctx.fillRect(0, 0, W, H);

    var axiom = 'X';
    var rules = { X: 'F+[[X]-X]-F[-FX]+X', F: 'FF' };
    var sentence = axiom;
    for (var i = 0; i < iterations; i++) {
      var next = '';
      for (var j = 0; j < sentence.length; j++) {
        var ch = sentence[j];
        next += rules[ch] || ch;
      }
      sentence = next;
    }

    var len = Math.max(2, 12 - iterations * 1.5);
    var ang = angle * Math.PI / 180;
    var x = W / 2;
    var y = H - 20;

    var stack = [];
    ctx.save();
    ctx.translate(x, y);

    var depth = 0;
    for (var k = 0; k < sentence.length; k++) {
      var c = sentence[k];
      if (c === 'F' || c === 'X') {
        var hue = 30 + depth * 25;
        var lightness = 20 + depth * 8;
        ctx.strokeStyle = 'hsl(' + hue + ', 70%, ' + Math.min(lightness, 55) + '%)';
        ctx.lineWidth = Math.max(0.5, 4 - depth * 0.5);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -len);
        ctx.stroke();
        ctx.translate(0, -len);
      } else if (c === '+') {
        ctx.rotate(ang + (seed > 0 ? (Math.sin(k * 0.5 + seed) * 0.05) : 0));
      } else if (c === '-') {
        ctx.rotate(-ang + (seed > 0 ? (Math.sin(k * 0.3 + seed) * 0.05) : 0));
      } else if (c === '[') {
        ctx.save();
        depth++;
      } else if (c === ']') {
        ctx.restore();
        depth--;
      }
    }
    ctx.restore();
  }, [iterations, angle, seed]);

  React.useEffect(function () { render(); }, [render]);

  function randomize() { setSeed(function (s) { return s + 1; }); }

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
      React.createElement('span', { style: { fontSize: '13px', fontWeight: 600, color: '#fb923c', letterSpacing: '0.5px', textTransform: 'uppercase' } }, 'L-System Tree'),
      React.createElement('button', {
        onClick: randomize,
        style: {
          background: 'rgba(255,255,255,0.08)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '6px', padding: '5px 12px', fontSize: '10px', fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit'
        }
      }, 'Randomize')
    ),
    React.createElement('div', { style: { display: 'flex', gap: '12px', marginBottom: '8px' } },
      React.createElement('div', { style: { flex: 1, display: 'flex', alignItems: 'center', gap: '6px' } },
        React.createElement('span', { style: { fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap' } }, 'Iterations:'),
        React.createElement('input', {
          type: 'range', min: 1, max: 6, step: 1, value: iterations,
          onChange: function (e) { return setIterations(Number(e.target.value)); },
          style: { flex: 1, accentColor: '#fb923c', cursor: 'pointer', height: '4px' }
        }),
        React.createElement('span', { style: { fontSize: '11px', color: '#fb923c', fontWeight: 600, minWidth: '16px', textAlign: 'right' } }, iterations)
      ),
      React.createElement('div', { style: { flex: 1, display: 'flex', alignItems: 'center', gap: '6px' } },
        React.createElement('span', { style: { fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap' } }, 'Angle:'),
        React.createElement('input', {
          type: 'range', min: 10, max: 50, step: 1, value: angle,
          onChange: function (e) { return setAngle(Number(e.target.value)); },
          style: { flex: 1, accentColor: '#fb923c', cursor: 'pointer', height: '4px' }
        }),
        React.createElement('span', { style: { fontSize: '11px', color: '#fb923c', fontWeight: 600, minWidth: '30px', textAlign: 'right' } }, angle + '\u00B0')
      )
    ),
    React.createElement('div', { style: { flex: 1, overflow: 'hidden', borderRadius: '8px' } },
      React.createElement('canvas', {
        ref: canvasRef, width: W, height: H,
        style: { width: '100%', height: '100%', display: 'block' }
      })
    ),
    React.createElement('div', { style: { fontSize: '10px', color: '#64748b', textAlign: 'center', marginTop: '6px' } },
      'Axiom: X \u2022 Rules: X\u2192F+[[X]-X]-F[-FX]+X, F\u2192FF'
    )
  );
}
