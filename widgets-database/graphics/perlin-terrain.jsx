function Widget({ appBus }) {
  var _a = React.useState(8), resolution = _a[0], setResolution = _a[1];
  var _b = React.useState(0), seed = _b[0], setSeed = _b[1];
  var canvasRef = React.useRef(null);

  var W = 600, H = 400;

  function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function lerp(a, b, t) { return a + t * (b - a); }
  function grad(hash, x, y) {
    var h = hash & 3;
    var u = h < 2 ? x : y;
    var v = h < 1 ? y : (h === 2 ? x : y);
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  function perlin(x, y, perm) {
    var xi = Math.floor(x) & 255;
    var yi = Math.floor(y) & 255;
    var xf = x - Math.floor(x);
    var yf = y - Math.floor(y);
    var u = fade(xf);
    var v = fade(yf);
    var aa = perm[perm[xi] + yi];
    var ab = perm[perm[xi] + yi + 1];
    var ba = perm[perm[xi + 1] + yi];
    var bb = perm[perm[xi + 1] + yi + 1];
    var x1 = lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u);
    var x2 = lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u);
    return lerp(x1, x2, v);
  }

  function fbm(x, y, octaves, perm) {
    var value = 0, amplitude = 1, frequency = 1, maxVal = 0;
    for (var i = 0; i < octaves; i++) {
      value += amplitude * perlin(x * frequency, y * frequency, perm);
      maxVal += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }
    return value / maxVal;
  }

  var render = React.useCallback(function () {
    var canvas = canvasRef.current;
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var imageData = ctx.createImageData(W, H);
    var data = imageData.data;

    var perm = new Array(512);
    var p = [];
    for (var i2 = 0; i2 < 256; i2++) p[i2] = i2;
    for (var i3 = 255; i3 > 0; i3--) {
      var j = Math.floor(seededRandom(i3 + seed * 1000) * (i3 + 1));
      var tmp = p[i3]; p[i3] = p[j]; p[j] = tmp;
    }
    for (var i4 = 0; i4 < 512; i4++) perm[i4] = p[i4 & 255];

    var octaves = 6;
    for (var py = 0; py < H; py++) {
      for (var px = 0; px < W; px++) {
        var nx = px / W * resolution;
        var ny = py / H * resolution;
        var val = fbm(nx, ny, octaves, perm);
        var idx = (py * W + px) * 4;
        if (val < 0.35) {
          var t2 = val / 0.35;
          data[idx] = Math.round(10 + 30 * t2);
          data[idx + 1] = Math.round(50 + 80 * t2);
          data[idx + 2] = Math.round(120 + 50 * t2);
        } else if (val < 0.45) {
          var t3 = (val - 0.35) / 0.1;
          data[idx] = Math.round(40 + 140 * t3);
          data[idx + 1] = Math.round(130 + 60 * t3);
          data[idx + 2] = Math.round(170 - 70 * t3);
        } else if (val < 0.55) {
          var t4 = (val - 0.45) / 0.1;
          data[idx] = Math.round(180 + 50 * t4);
          data[idx + 1] = Math.round(190 + 20 * t4);
          data[idx + 2] = Math.round(100 - 30 * t4);
        } else if (val < 0.75) {
          var t5 = (val - 0.55) / 0.2;
          data[idx] = Math.round(230 - 130 * t5);
          data[idx + 1] = Math.round(210 - 90 * t5);
          data[idx + 2] = Math.round(70 - 20 * t5);
        } else {
          var t6 = (val - 0.75) / 0.25;
          data[idx] = Math.round(100 + 155 * t6);
          data[idx + 1] = Math.round(120 + 135 * t6);
          data[idx + 2] = Math.round(50 + 205 * t6);
        }
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }, [resolution, seed]);

  function seededRandom(s) {
    var x = Math.sin(s * 9301 + 49297) * 49297;
    return x - Math.floor(x);
  }

  React.useEffect(function () { render(); }, [render]);

  function regenerate() { setSeed(function (s) { return s + 1; }); }

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
      React.createElement('span', { style: { fontSize: '13px', fontWeight: 600, color: '#fbbf24', letterSpacing: '0.5px', textTransform: 'uppercase' } }, 'Perlin Terrain'),
      React.createElement('button', {
        onClick: regenerate,
        style: {
          background: '#fbbf24', color: '#0B1120', border: 'none', borderRadius: '6px',
          padding: '5px 14px', fontSize: '10px', fontWeight: 700, cursor: 'pointer',
          fontFamily: 'inherit', letterSpacing: '0.5px', textTransform: 'uppercase'
        }
      }, 'Regenerate')
    ),
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' } },
      React.createElement('span', { style: { fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap' } }, 'Resolution:'),
      React.createElement('input', {
        type: 'range', min: 2, max: 20, step: 1, value: resolution,
        onChange: function (e) { return setResolution(Number(e.target.value)); },
        style: { flex: 1, accentColor: '#fbbf24', cursor: 'pointer', height: '4px' }
      }),
      React.createElement('span', { style: { fontSize: '11px', color: '#fbbf24', fontWeight: 600, minWidth: '24px', textAlign: 'right' } }, resolution)
    ),
    React.createElement('div', { style: { flex: 1, overflow: 'hidden', borderRadius: '8px' } },
      React.createElement('canvas', {
        ref: canvasRef, width: W, height: H,
        style: { width: '100%', height: '100%', display: 'block' }
      })
    ),
    React.createElement('div', { style: { display: 'flex', gap: '12px', marginTop: '6px', fontSize: '10px', color: '#64748b', justifyContent: 'center' } },
      React.createElement('span', { style: { color: '#1a3d78' } }, '\u25A0 Water'),
      React.createElement('span', { style: { color: '#b4d464' } }, '\u25A0 Sand'),
      React.createElement('span', { style: { color: '#e8d046' } }, '\u25A0 Grass'),
      React.createElement('span', { style: { color: '#64782e' } }, '\u25A0 Forest'),
      React.createElement('span', { style: { color: '#ffffff' } }, '\u25A0 Snow')
    )
  );
}
