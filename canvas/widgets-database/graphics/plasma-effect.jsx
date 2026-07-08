function Widget({ appBus }) {
  var _a = React.useState(0), paletteIdx = _a[0], setPaletteIdx = _a[1];
  var _b = React.useState(0), fps = _b[0], setFps = _b[1];
  var canvasRef = React.useRef(null);
  var rafRef = React.useRef(null);
  var timeRef = React.useRef(0);
  var frameCountRef = React.useRef(0);
  var fpsTimeRef = React.useRef(0);

  var palettes = [
    { name: 'Neon', colors: [
      [255, 0, 128], [255, 100, 0], [255, 255, 0], [0, 255, 128],
      [0, 200, 255], [128, 0, 255], [255, 0, 128]
    ]},
    { name: 'Ocean', colors: [
      [0, 20, 80], [0, 60, 150], [0, 120, 200], [0, 180, 220],
      [0, 220, 180], [0, 150, 100], [0, 60, 40]
    ]},
    { name: 'Fire', colors: [
      [80, 0, 0], [180, 20, 0], [255, 80, 0], [255, 180, 0],
      [255, 220, 100], [255, 240, 180], [255, 200, 100]
    ]},
    { name: 'Aurora', colors: [
      [0, 10, 40], [0, 80, 60], [0, 180, 80], [100, 255, 100],
      [180, 255, 120], [100, 200, 255], [50, 100, 200]
    ]},
    { name: 'Sunset', colors: [
      [80, 0, 40], [140, 10, 60], [200, 40, 70], [240, 100, 80],
      [255, 170, 100], [255, 220, 150], [255, 240, 200]
    ]}
  ];

  function lerpColor(c1, c2, t) {
    return [
      Math.round(c1[0] + (c2[0] - c1[0]) * t),
      Math.round(c1[1] + (c2[1] - c1[1]) * t),
      Math.round(c1[2] + (c2[2] - c1[2]) * t)
    ];
  }

  function getPaletteColor(pal, t) {
    var n = pal.length;
    var scaled = t * (n - 1);
    var idx = Math.floor(scaled);
    var frac = scaled - idx;
    var c1 = pal[Math.min(idx, n - 1)];
    var c2 = pal[Math.min(idx + 1, n - 1)];
    return lerpColor(c1, c2, frac);
  }

  var W = 600, H = 400;

  React.useEffect(function () {
    var canvas = canvasRef.current;
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var imageData = ctx.createImageData(W, H);
    var data = imageData.data;

    function step(timestamp) {
      if (!fpsTimeRef.current) fpsTimeRef.current = timestamp;
      frameCountRef.current++;
      if (timestamp - fpsTimeRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        fpsTimeRef.current = timestamp;
      }

      var pal = palettes[paletteIdx].colors;
      var t = timeRef.current;

      for (var py = 0; py < H; py++) {
        for (var px = 0; px < W; px++) {
          var v1 = Math.sin(px * 0.02 + t * 0.8);
          var v2 = Math.sin(py * 0.025 + t * 0.6);
          var v3 = Math.sin((px + py) * 0.015 + t * 1.2);
          var v4 = Math.sin(Math.sqrt(px * px + py * py) * 0.01 + t * 0.5);
          var val = (v1 + v2 + v3 + v4) / 4;
          var norm = (val + 1) / 2;

          var color = getPaletteColor(pal, norm);
          var idx = (py * W + px) * 4;
          data[idx] = color[0];
          data[idx + 1] = color[1];
          data[idx + 2] = color[2];
          data[idx + 3] = 255;
        }
      }
      ctx.putImageData(imageData, 0, 0);
      timeRef.current += 0.02;
      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return function () { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [paletteIdx]);

  function cyclePalette() {
    setPaletteIdx(function (i) { return (i + 1) % palettes.length; });
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
      style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }
    },
      React.createElement('span', { style: { fontSize: '13px', fontWeight: 600, color: '#38bdf8', letterSpacing: '0.5px', textTransform: 'uppercase' } }, 'Plasma Effect'),
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
        React.createElement('span', { style: { fontSize: '11px', color: '#64748b' } },
          'FPS: ',
          React.createElement('span', { style: { color: '#38bdf8', fontWeight: 600 } }, fps)
        ),
        React.createElement('button', {
          onClick: cyclePalette,
          style: {
            background: '#38bdf8', color: '#0B1120', border: 'none', borderRadius: '6px',
            padding: '5px 14px', fontSize: '10px', fontWeight: 700, cursor: 'pointer',
            fontFamily: 'inherit', letterSpacing: '0.5px', textTransform: 'uppercase'
          }
        }, palettes[paletteIdx].name)
      )
    ),
    React.createElement('div', { style: { flex: 1, overflow: 'hidden', borderRadius: '8px' } },
      React.createElement('canvas', {
        ref: canvasRef, width: W, height: H,
        style: { width: '100%', height: '100%', display: 'block' }
      })
    ),
    React.createElement('div', { style: { display: 'flex', gap: '6px', marginTop: '8px', justifyContent: 'center' } },
      palettes.map(function (p, i) {
        return React.createElement('button', {
          key: p.name,
          onClick: function () { return setPaletteIdx(i); },
          style: {
            background: i === paletteIdx ? p.colors[3] : 'rgba(255,255,255,0.06)',
            color: i === paletteIdx ? '#fff' : '#94a3b8',
            border: i === paletteIdx ? 'none' : '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px', padding: '4px 10px', fontSize: '10px', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s'
          }
        }, p.name);
      })
    )
  );
}
