function Widget({ appBus }) {
  var _a = React.useState(5000), dotCount = _a[0], setDotCount = _a[1];
  var _b = React.useState(0), currentIter = _b[0], setCurrentIter = _b[1];
  var _c = React.useState(false), running = _c[0], setRunning = _c[1];
  var _d = React.useState(0), speed = _d[0], setSpeed = _d[1];
  var canvasRef = React.useRef(null);
  var pointsRef = React.useRef([]);
  var rafRef = React.useRef(null);
  var iterRef = React.useRef(0);

  var W = 600, H = 520;

  var initCanvas = React.useCallback(function () {
    var canvas = canvasRef.current;
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0B1120';
    ctx.fillRect(0, 0, W, H);

    var margin = 40;
    var p1 = { x: W / 2, y: margin };
    var p2 = { x: margin, y: H - margin };
    var p3 = { x: W - margin, y: H - margin };

    ctx.strokeStyle = 'rgba(52,211,153,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.closePath();
    ctx.stroke();

    var v = [p1, p2, p3];
    var x = (p1.x + p2.x + p3.x) / 3;
    var y = (p1.y + p2.y + p3.y) / 3;
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(x, y, 1, 0, Math.PI * 2);
    ctx.fill();

    pointsRef.current = { v: v, x: x, y: y };
  }, []);

  React.useEffect(function () {
    initCanvas();
  }, [initCanvas]);

  var animate = React.useCallback(function () {
    var canvas = canvasRef.current;
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var p = pointsRef.current;
    if (!p) return;

    var batchSize = Math.max(1, Math.floor(speed === 0 ? 100 : speed * 5));
    var target = dotCount;

    function stepBatch() {
      if (iterRef.current >= target) { setRunning(false); return; }
      var batch = Math.min(batchSize, target - iterRef.current);
      ctx.fillStyle = '#34d399';
      for (var i = 0; i < batch; i++) {
        var idx = Math.floor(Math.random() * 3);
        p.x = (p.x + p.v[idx].x) / 2;
        p.y = (p.y + p.v[idx].y) / 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 0.6, 0, Math.PI * 2);
        ctx.fill();
        iterRef.current++;
      }
      setCurrentIter(iterRef.current);
      rafRef.current = requestAnimationFrame(stepBatch);
    }
    rafRef.current = requestAnimationFrame(stepBatch);
  }, [dotCount, speed]);

  React.useEffect(function () {
    if (running) { iterRef.current = 0; initCanvas(); animate(); }
    return function () { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [running, animate, initCanvas]);

  function reset() {
    setRunning(false);
    iterRef.current = 0;
    setCurrentIter(0);
    initCanvas();
  }

  var progress = dotCount > 0 ? (currentIter / dotCount * 100).toFixed(1) : 0;

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
      React.createElement('span', { style: { fontSize: '13px', fontWeight: 600, color: '#34d399', letterSpacing: '0.5px', textTransform: 'uppercase' } }, 'Sierpinski Triangle'),
      React.createElement('span', { style: { fontSize: '11px', color: '#64748b' } },
        'Points: ',
        React.createElement('span', { style: { color: '#34d399', fontWeight: 600 } }, currentIter.toLocaleString())
      )
    ),
    React.createElement('div', { style: { flex: 1, position: 'relative', overflow: 'hidden', borderRadius: '8px' } },
      React.createElement('canvas', {
        ref: canvasRef, width: W, height: H,
        style: { width: '100%', height: '100%', display: 'block' }
      }),
      !running && currentIter === 0 ? React.createElement('div', {
        style: {
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(11,17,32,0.6)', backdropFilter: 'blur(2px)'
        }
      },
        React.createElement('span', { style: { color: '#34d399', fontSize: '14px', opacity: 0.7 } }, 'Press Start to render')
      ) : null
    ),
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' } },
      React.createElement('div', { style: { flex: 1, display: 'flex', alignItems: 'center', gap: '8px' } },
        React.createElement('span', { style: { fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap' } }, 'Points:'),
        React.createElement('input', {
          type: 'range', min: 100, max: 100000, step: 100, value: dotCount,
          onChange: function (e) { return setDotCount(Number(e.target.value)); },
          style: { flex: 1, accentColor: '#34d399', cursor: 'pointer', height: '4px' }
        }),
        React.createElement('span', { style: { fontSize: '11px', color: '#34d399', fontWeight: 600, minWidth: '55px', textAlign: 'right' } }, dotCount.toLocaleString())
      ),
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        React.createElement('span', { style: { fontSize: '11px', color: '#64748b' } }, progress + '%'),
        !running ? React.createElement('button', {
          onClick: function () { setRunning(true); },
          style: {
            background: '#34d399', color: '#0B1120', border: 'none', borderRadius: '6px',
            padding: '6px 16px', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
            fontFamily: 'inherit', letterSpacing: '0.5px', textTransform: 'uppercase'
          }
        }, 'Start') : React.createElement('button', {
          onClick: function () { setRunning(false); },
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
            borderRadius: '6px', padding: '5px 12px', fontSize: '11px', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit'
          }
        }, 'Reset')
      )
    ),
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' } },
      React.createElement('span', { style: { fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap' } }, 'Speed:'),
      React.createElement('input', {
        type: 'range', min: 0, max: 10, step: 1, value: speed,
        onChange: function (e) { return setSpeed(Number(e.target.value)); },
        style: { flex: 1, accentColor: '#34d399', cursor: 'pointer', height: '4px', maxWidth: '160px' }
      }),
      React.createElement('span', { style: { fontSize: '11px', color: '#34d399', fontWeight: 600, minWidth: '30px' } }, speed)
    )
  );
}
