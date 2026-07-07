function Widget({ appBus }) {
  const [points, setPoints] = React.useState([]);
  const [centroids, setCentroids] = React.useState([]);
  const [assignments, setAssignments] = React.useState([]);
  const [k, setK] = React.useState(3);
  const [step, setStep] = React.useState(0);
  const [converged, setConverged] = React.useState(false);
  const [inertia, setInertia] = React.useState(0);
  const [animating, setAnimating] = React.useState(false);
  const [history, setHistory] = React.useState([]);
  const animRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  const colors = ['#00e5ff', '#ff4081', '#ffeb3b', '#76ff03', '#e040fb', '#ff6d00', '#00e676', '#40c4ff'];

  React.useEffect(() => {
    generatePoints();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  React.useEffect(() => {
    generatePoints();
  }, [k]);

  const generatePoints = React.useCallback(() => {
    const pts = [];
    const n = 80;
    const clusterSpread = 0.08;
    for (let cluster = 0; cluster < k; cluster++) {
      const cx = 0.15 + Math.random() * 0.7;
      const cy = 0.15 + Math.random() * 0.7;
      const ptsPerCluster = Math.floor(n / k) + (cluster < n % k ? 1 : 0);
      for (let i = 0; i < ptsPerCluster; i++) {
        pts.push({
          x: Math.max(0.01, Math.min(0.99, cx + (Math.random() - 0.5) * clusterSpread * 3)),
          y: Math.max(0.01, Math.min(0.99, cy + (Math.random() - 0.5) * clusterSpread * 3))
        });
      }
    }
    const shuffled = [];
    for (let i = pts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      shuffled.push(pts[j]);
      pts.splice(j, 1);
    }
    shuffled.push(...pts);
    setPoints(shuffled);
    initCentroids(shuffled);
  }, [k]);

  const initCentroids = React.useCallback((pts) => {
    const cent = [];
    const shuffled = [...pts].sort(() => Math.random() - 0.5);
    for (let i = 0; i < k; i++) {
      cent.push({ x: shuffled[i].x, y: shuffled[i].y });
    }
    setCentroids(cent);
    setAssignments(new Array(pts.length).fill(0));
    setStep(0);
    setConverged(false);
    setInertia(0);
    setHistory([]);
  }, [k]);

  const stepKMeans = React.useCallback(() => {
    if (converged || centroids.length === 0) return;

    const newAssignments = points.map(p => {
      let bestIdx = 0;
      let bestDist = Infinity;
      for (let i = 0; i < centroids.length; i++) {
        const dx = p.x - centroids[i].x;
        const dy = p.y - centroids[i].y;
        const dist = dx * dx + dy * dy;
        if (dist < bestDist) { bestDist = dist; bestIdx = i; }
      }
      return bestIdx;
    });

    if (assignments.length > 0 && JSON.stringify(newAssignments) === JSON.stringify(assignments)) {
      setConverged(true);
      return;
    }

    setAssignments(newAssignments);

    const newCentroids = centroids.map((_, idx) => {
      const assigned = points.filter((_, i) => newAssignments[i] === idx);
      if (assigned.length === 0) return { ...centroids[idx] };
      return {
        x: assigned.reduce((s, p) => s + p.x, 0) / assigned.length,
        y: assigned.reduce((s, p) => s + p.y, 0) / assigned.length
      };
    });

    let totalInertia = 0;
    for (let i = 0; i < points.length; i++) {
      const dx = points[i].x - newCentroids[newAssignments[i]].x;
      const dy = points[i].y - newCentroids[newAssignments[i]].y;
      totalInertia += dx * dx + dy * dy;
    }

    setHistory(prev => [...prev, { centroids: newCentroids, inertia: totalInertia }]);
    setCentroids(newCentroids);
    setInertia(totalInertia);
    setStep(s => s + 1);
  }, [points, centroids, assignments, converged]);

  const animateToConvergence = React.useCallback(() => {
    setAnimating(true);
    let running = true;

    const step = () => {
      if (!running) return;
      stepKMeans();
      setAnimFrame(id => {
        if (!converged && id < 100) {
          return requestAnimationFrame(step);
        }
        setAnimating(false);
        return null;
      });
    };

    const setAnimFrame = (fn) => {
      const id = requestAnimationFrame(step);
      animRef.current = id;
    };
    setAnimFrame();
  }, [stepKMeans, converged]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || points.length === 0) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = 420;
    const H = canvas.height = 420;
    const pad = 30;
    const plotW = W - pad * 2;
    const plotH = H - pad * 2;

    ctx.fillStyle = '#0B1120';
    ctx.fillRect(0, 0, W, H);

    const toScreen = (x, y) => [pad + x * plotW, pad + (1 - y) * plotH];

    for (let i = 0; i < points.length; i++) {
      const [sx, sy] = toScreen(points[i].x, points[i].y);
      const color = colors[assignments[i] % colors.length] || '#666';
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fillStyle = assignments.length > i ? color : 'rgba(148, 163, 184, 0.08)';
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = assignments.length > i ? color : '#0f172a';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      if (centroids.length > 0 && assignments.length > i) {
        const [csx, csy] = toScreen(centroids[assignments[i]].x, centroids[assignments[i]].y);
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.15;
        ctx.lineWidth = 0.5;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(csx, csy);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      }
    }

    centroids.forEach((c, i) => {
      const [sx, sy] = toScreen(c.x, c.y);
      const color = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(sx, sy, 10, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.3;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#0B1120';
      ctx.fill();
    });
  }, [points, centroids, assignments, colors]);

  const resetAll = React.useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setAnimating(false);
    generatePoints();
  }, [generatePoints]);

  const s = {
    container: { background: '#0B1120', color: '#e2e8f0', fontFamily: 'monospace', padding: '16px', borderRadius: '8px', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' },
    header: { fontSize: '16px', fontWeight: 'bold', color: '#00e5ff', marginBottom: '12px' },
    row: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
    canvas: { borderRadius: '4px', border: '1px solid #0f172a' },
    panel: { flex: 1, minWidth: '180px' },
    label: { color: '#8899bb', fontSize: '11px', marginBottom: '4px' },
    value: { color: '#e2e8f0', fontSize: '13px', marginBottom: '6px' },
    btn: { background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(148, 163, 184, 0.08)', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', margin: '3px' },
    slider: { width: '120px', accentColor: '#00e5ff' },
    legend: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' },
    dot: { width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block' },
  };

  return (
    <div style={s.container}>
      <div style={s.header}>K-Means Clustering</div>
      <div style={s.row}>
        <div>
          <canvas ref={canvasRef} width={420} height={420} style={s.canvas} />
        </div>
        <div style={s.panel}>
          <div style={s.label}>Number of clusters (k)</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <input type="range" min={2} max={8} value={k}
              onChange={e => setK(Number(e.target.value))}
              style={s.slider} />
            <span style={{color:'#00e5ff', fontWeight:'bold', fontSize:'16px'}}>{k}</span>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <button style={s.btn} onClick={stepKMeans} disabled={converged}>Step</button>
            <button style={s.btn} onClick={animateToConvergence} disabled={animating || converged}>
              {animating ? 'Running...' : 'Animate'}
            </button>
            <button style={s.btn} onClick={resetAll}>Reset</button>
          </div>
          <div style={s.label}>Steps</div>
          <div style={{...s.value, fontSize:'18px', fontWeight:'bold', color:'#00e5ff'}}>{step}</div>
          <div style={s.label}>Inertia (WCSS)</div>
          <div style={s.value}>{inertia.toFixed(4)}</div>
          <div style={s.label}>Status</div>
          <div style={{...s.value, color: converged ? '#76ff03' : '#ffeb3b'}}>
            {converged ? 'Converged' : (animating ? 'Animating...' : 'Ready')}
          </div>
          {history.length > 1 && (
            <>
              <div style={s.label}>Inertia Δ (last step)</div>
              <div style={{color: '#8899bb', fontSize:'11px'}}>
                {(history[history.length-1].inertia - history[history.length-2].inertia).toFixed(4)}
              </div>
            </>
          )}
          <div style={s.legend}>
            {Array.from({length: k}, (_, i) => (
              <span key={i} style={{display:'flex', alignItems:'center', gap:'3px', fontSize:'10px', color:'#8899bb'}}>
                <span style={{...s.dot, background: colors[i % colors.length]}}></span>
                C{i+1}
              </span>
            ))}
          </div>
          <div style={{color:'#556688', fontSize:'10px', marginTop:'8px'}}>
            {points.length} data points
          </div>
        </div>
      </div>
    </div>
  );
}
