function generateDataPoints() {
  const pts = [];
  for (let i = 0; i < 60; i++) {
    let x = Math.random(), y = Math.random();
    let label = 0;
    if ((x < 0.5 && y < 0.5) || (x >= 0.5 && y >= 0.5)) label = x < y ? 0 : 1;
    else label = x < y ? 1 : 0;
    if (Math.random() < 0.1) label = label === 0 ? 1 : 0;
    pts.push({ x, y, label });
  }
  return pts;
}

function Widget({ appBus }) {
  const [points, setPoints] = React.useState(() => generateDataPoints());
  const [tree, setTree] = React.useState(null);
  const [trained, setTrained] = React.useState(false);
  const [accuracy, setAccuracy] = React.useState(0);
  const [splits, setSplits] = React.useState([]);
  const canvasRef = React.useRef(null);
  const treeCanvasRef = React.useRef(null);

  const generateData = React.useCallback(() => {
    setPoints(generateDataPoints());
    setTree(null);
    setTrained(false);
    setAccuracy(0);
    setSplits([]);
  }, []);

  const gini = React.useCallback((data) => {
    if (data.length === 0) return 0;
    const counts = { 0: 0, 1: 0 };
    for (const p of data) { counts[p.label]++; }
    const n = data.length;
    return 1 - (counts[0]/n)**2 - (counts[1]/n)**2;
  }, []);

  const buildTree = React.useCallback((data, depth = 0) => {
    if (depth >= 6 || data.length < 3) {
      const counts = { 0: 0, 1: 0 };
      for (const p of data) counts[p.label]++;
      return { type: 'leaf', value: counts[0] >= counts[1] ? 0 : 1, data };
    }
    const currentGini = gini(data);
    if (currentGini === 0) {
      return { type: 'leaf', value: data[0].label, data };
    }

    let bestGain = 0, bestSplit = null, bestLeft = [], bestRight = [], bestDim = 0;

    for (const dim of ['x', 'y']) {
      const sorted = [...data].sort((a, b) => a[dim] - b[dim]);
      for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i][dim] === sorted[i+1][dim]) continue;
        const threshold = (sorted[i][dim] + sorted[i+1][dim]) / 2;
        const left = sorted.slice(0, i + 1);
        const right = sorted.slice(i + 1);
        const gain = currentGini - (left.length / data.length) * gini(left) - (right.length / data.length) * gini(right);
        if (gain > bestGain) {
          bestGain = gain;
          bestSplit = threshold;
          bestLeft = left;
          bestRight = right;
          bestDim = dim;
        }
      }
    }

    if (!bestSplit || bestGain < 0.001) {
      const counts = { 0: 0, 1: 0 };
      for (const p of data) counts[p.label]++;
      return { type: 'leaf', value: counts[0] >= counts[1] ? 0 : 1, data };
    }

    const leftChild = buildTree(bestLeft, depth + 1);
    const rightChild = buildTree(bestRight, depth + 1);
    return {
      type: 'node', dim: bestDim, threshold: bestSplit,
      left: leftChild, right: rightChild, data,
      visualSplit: { dim: bestDim, threshold: bestSplit }
    };
  }, [gini]);

  const collectSplits = React.useCallback((node, splits = []) => {
    if (node.type === 'node') {
      splits.push(node.visualSplit);
      collectSplits(node.left, splits);
      collectSplits(node.right, splits);
    }
    return splits;
  }, []);

  const trainTree = React.useCallback(() => {
    const root = buildTree(points);
    setTree(root);
    const s = collectSplits(root);
    setSplits(s);
    let correct = 0;
    for (const p of points) {
      let node = root;
      while (node.type === 'node') {
        if (p[node.dim] < node.threshold) node = node.left;
        else node = node.right;
      }
      if (node.value === p.label) correct++;
    }
    setAccuracy(correct / points.length);
    setTrained(true);
  }, [points, buildTree, collectSplits]);

  const predict = React.useCallback((x, y, node) => {
    if (node.type === 'leaf') return node.value;
    if (node.dim === 'x') {
      return x < node.threshold ? predict(x, y, node.left) : predict(x, y, node.right);
    }
    return y < node.threshold ? predict(x, y, node.left) : predict(x, y, node.right);
  }, []);

  const treeHeight = React.useCallback((node) => {
    if (node.type === 'leaf') return 1;
    return 1 + Math.max(treeHeight(node.left), treeHeight(node.right));
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = 380;
    const H = canvas.height = 380;
    const pad = 30;

    ctx.fillStyle = '#0B1120';
    ctx.fillRect(0, 0, W, H);

    const plotW = W - pad * 2;
    const plotH = H - pad * 2;
    const toScreen = (x, y) => [pad + x * plotW, pad + (1 - y) * plotH];

    if (trained && tree) {
      const res = 2;
      for (let gx = 0; gx < plotW; gx += res) {
        for (let gy = 0; gy < plotH; gy += res) {
          const x = gx / plotW;
          const y = 1 - gy / plotH;
          const pred = predict(x, y, tree);
          const [sx, sy] = toScreen(x, y);
          ctx.fillStyle = pred === 0 ? 'rgba(0,229,255,0.06)' : 'rgba(255,64,129,0.06)';
          ctx.fillRect(sx - res/2, sy - res/2, res, res);
        }
      }

      for (const split of splits) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        if (split.dim === 'x') {
          const lx = pad + split.threshold * plotW;
          ctx.moveTo(lx, pad); ctx.lineTo(lx, H - pad);
        } else {
          const ly = pad + (1 - split.threshold) * plotH;
          ctx.moveTo(pad, ly); ctx.lineTo(W - pad, ly);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    for (const p of points) {
      const [sx, sy] = toScreen(p.x, p.y);
      ctx.beginPath();
      ctx.arc(sx, sy, 5, 0, Math.PI * 2);
      ctx.fillStyle = p.label === 0 ? '#00e5ff' : '#ff4081';
      ctx.fill();
      ctx.strokeStyle = p.label === 0 ? '#4dd0ff' : '#ff6f9c';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }, [points, trained, tree, splits, predict]);

  React.useEffect(() => {
    const canvas = treeCanvasRef.current;
    if (!canvas || !tree) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = 380;
    const H = canvas.height = 300;

    ctx.fillStyle = '#0B1120';
    ctx.fillRect(0, 0, W, H);

    const drawNode = (node, x, y, level, maxLevel) => {
      if (!node) return;
      const h = Math.min(50, H / (maxLevel + 1));
      const spread = Math.max(20, (W - 20) / Math.pow(2, level + 1));

      ctx.font = '10px monospace';
      ctx.textAlign = 'center';

      if (node.type === 'leaf') {
        ctx.fillStyle = node.value === 0 ? 'rgba(0,229,255,0.15)' : 'rgba(255,64,129,0.15)';
        ctx.strokeStyle = node.value === 0 ? '#00e5ff' : '#ff4081';
        ctx.lineWidth = 1;
        const bw = 30, bh = 18;
        ctx.beginPath();
        ctx.roundRect(x - bw/2, y - bh/2, bw, bh, 3);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = node.value === 0 ? '#00e5ff' : '#ff4081';
        ctx.fillText(node.value === 0 ? 'Red' : 'Blue', x, y + 4);
        return;
      }

      const nx = x - spread;
      const ny = y + h;
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y + 10);
      ctx.lineTo(nx, ny - 10);
      ctx.stroke();
      drawNode(node.left, nx, ny, level + 1, maxLevel);

      const nx2 = x + spread;
      ctx.beginPath();
      ctx.moveTo(x, y + 10);
      ctx.lineTo(nx2, ny - 10);
      ctx.stroke();
      drawNode(node.right, nx2, ny, level + 1, maxLevel);

      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 1;
      const bw = Math.max(40, node.dim === 'x' ? 50 : 50);
      const bh = 18;
      ctx.beginPath();
      ctx.roundRect(x - bw/2, y - bh/2, bw, bh, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '9px monospace';
      const label = node.dim === 'x' ? `X < ${node.threshold.toFixed(2)}` : `Y < ${node.threshold.toFixed(2)}`;
      ctx.fillText(label, x, y + 4);
    };

    const maxH = treeHeight(tree);
    drawNode(tree, W/2, 15, 0, maxH);
  }, [tree, treeHeight]);

  const s = {
    container: { background: '#0B1120', color: '#e2e8f0', fontFamily: 'monospace', padding: '16px', borderRadius: '8px', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' },
    header: { fontSize: '16px', fontWeight: 'bold', color: '#00e5ff', marginBottom: '12px' },
    row: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
    canvas: { borderRadius: '4px', border: '1px solid #0f172a' },
    panel: { flex: 1, minWidth: '160px' },
    label: { color: '#8899bb', fontSize: '11px', marginBottom: '4px' },
    value: { color: '#e2e8f0', fontSize: '13px', marginBottom: '6px' },
    btn: { background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(148, 163, 184, 0.08)', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', margin: '3px' },
  };

  return (
    <div style={s.container}>
      <div style={s.header}>Decision Tree Visualizer</div>
      <div style={s.row}>
        <div>
          <canvas ref={canvasRef} width={380} height={380} style={s.canvas} />
        </div>
        <div style={s.panel}>
          <div style={{ marginBottom: '10px' }}>
            <button style={s.btn} onClick={trainTree} disabled={points.length === 0}>Train Tree</button>
            <button style={s.btn} onClick={generateData}>New Data</button>
          </div>
          <div style={s.label}>Accuracy</div>
          <div style={{...s.value, fontSize: '18px', fontWeight: 'bold', color: accuracy > 0.85 ? '#00e5ff' : '#ff4081'}}>
            {(accuracy * 100).toFixed(1)}%
          </div>
          <div style={s.label}>Data points</div>
          <div style={s.value}>
            <span style={{color:'#00e5ff'}}>Red: {points.filter(p => p.label === 0).length}</span>
            {' | '}
            <span style={{color:'#ff4081'}}>Blue: {points.filter(p => p.label === 1).length}</span>
          </div>
          <div style={s.label}>Splits</div>
          <div style={s.value}>{splits.length}</div>
          <div style={s.label}>Tree depth</div>
          <div style={s.value}>{tree ? treeHeight(tree) : '-'}</div>
          <div style={{color:'#556688', fontSize:'10px', marginTop:'8px'}}>
            Decision boundary visualized on left panel.<br/>
            Tree structure shown below.
          </div>
          <canvas ref={treeCanvasRef} width={380} height={300} style={{...s.canvas, marginTop:'8px'}} />
        </div>
      </div>
    </div>
  );
}
