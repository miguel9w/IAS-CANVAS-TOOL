function Widget({ appBus }) {
  const [rotX, setRotX] = React.useState(0.3);
  const [rotY, setRotY] = React.useState(0);
  const [time, setTime] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const [lastPos, setLastPos] = React.useState(null);
  const canvasRef = React.useRef(null);
  const animRef = React.useRef(null);

  React.useEffect(() => {
    const step = () => { setTime(t=>t+0.5); animRef.current = requestAnimationFrame(step); };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const continents = [
    // North America
    {lat:[30,35,40,45,48,50,55,60,65,70,72,70,65,60,55,50,45,42,38,35,32,28,25,22,20], lon:[-85,-80,-75,-70,-65,-60,-55,-50,-45,-40,-30,-20,-15,-10,-5,0,5,10,15,20,25,30,35,40,45]},
    // approximate simplified outlines
  ];

  // Simplified continent edge points
  const land = [
    // North America
    [[55,-130],[50,-125],[48,-125],[45,-125],[40,-125],[35,-120],[32,-118],[30,-115],[25,-110],[22,-108],[20,-105],[22,-100],[25,-98],[30,-95],[35,-90],[40,-85],[42,-80],[45,-75],[48,-70],[50,-65],[52,-60],[55,-55],[58,-50],[60,-45],[62,-40],[65,-35],[68,-30],[70,-25],[72,-20],[70,-15],[68,-10],[65,-5],[60,0],[55,5],[50,10],[45,15],[42,20],[38,25],[35,30],[32,35],[30,40],[28,45],[25,50],[22,55],[20,60],[20,65],[22,70],[25,75],[28,80],[30,85],[32,90],[35,95],[38,100],[40,105],[45,110],[50,115],[55,120],[60,125],[62,130],[60,135],[58,140],[55,145],[50,150],[45,155],[40,160],[35,165],[30,170],[25,175],[20,180],[20,-180],[22,-175],[25,-170],[28,-165],[30,-160],[32,-155],[35,-150],[40,-145],[45,-140],[48,-135],[50,-130],[55,-130]],
    // South America
    [[10,-75],[8,-75],[5,-75],[0,-75],[-5,-78],[-10,-75],[-15,-72],[-20,-70],[-25,-68],[-30,-65],[-35,-60],[-40,-58],[-45,-65],[-50,-70],[-55,-68],[-55,-65],[-50,-60],[-45,-55],[-40,-50],[-35,-48],[-30,-45],[-25,-40],[-20,-35],[-15,-30],[-10,-35],[-5,-40],[0,-45],[5,-50],[10,-55],[12,-60],[10,-75]],
    // Europe
    [[35,-10],[38,-8],[40,-5],[42,-5],[44,-5],[46,-5],[48,-5],[50,-5],[52,-5],[54,-8],[56,-5],[58,-5],[60,-5],[62,-5],[65,-5],[68,-10],[70,-15],[72,-20],[72,-25],[70,-30],[68,-35],[65,-40],[60,-45],[55,-50],[50,-55],[45,-60],[42,-65],[40,-70],[38,-75],[35,-80],[32,-85],[30,-90],[28,-95],[25,-100],[22,-105],[20,-110],[20,-115],[22,-120],[25,-125],[28,-130],[30,-135],[32,-140],[35,-145],[38,-150],[40,-155],[42,-160],[45,-165],[48,-170],[50,-175],[52,-180],[52,180],[50,175],[48,170],[45,165],[42,160],[40,155],[38,150],[35,145],[32,140],[30,135],[28,130],[25,125],[22,120],[20,115],[20,110],[22,105],[25,100],[28,95],[30,90],[32,85],[35,80],[38,75],[40,70],[42,65],[45,60],[48,55],[50,50],[52,45],[54,40],[55,35],[55,30],[55,25],[55,20],[55,15],[52,10],[50,5],[48,0],[45,-5],[42,-8],[38,-10],[35,-10]],
    // Africa
    [[35,-5],[35,0],[35,5],[35,10],[32,15],[30,20],[28,22],[25,25],[22,28],[20,30],[18,32],[15,35],[12,38],[10,40],[8,42],[5,45],[2,48],[0,48],[-2,45],[-5,42],[-8,40],[-10,38],[-12,35],[-15,32],[-18,30],[-20,28],[-22,25],[-25,22],[-28,20],[-30,18],[-32,15],[-34,12],[-35,10],[-35,5],[-34,0],[-30,-5],[-28,-10],[-25,-15],[-22,-18],[-20,-20],[-18,-22],[-15,-20],[-12,-18],[-10,-15],[-8,-12],[-5,-10],[-2,-8],[0,-5],[2,-8],[5,-10],[8,-12],[10,-15],[12,-18],[15,-20],[18,-22],[20,-20],[22,-18],[25,-15],[28,-12],[30,-10],[32,-8],[35,-5]],
    // Asia
    [[40,50],[42,50],[45,50],[48,52],[50,55],[52,55],[55,55],[58,55],[60,55],[62,55],[65,55],[68,55],[70,55],[72,55],[75,55],[78,55],[80,55],[82,55],[85,55],[88,55],[90,55],[92,55],[95,55],[98,55],[100,55],[102,55],[105,55],[108,55],[110,55],[112,55],[115,55],[118,55],[120,55],[122,55],[125,55],[128,55],[130,55],[132,55],[135,55],[138,55],[140,55],[142,55],[145,55],[148,55],[150,55],[152,55],[155,55],[158,55],[160,55],[162,55],[165,55],[168,55],[170,55],[172,55],[175,55],[178,55],[180,55],[180,50],[178,50],[175,50],[172,50],[170,50],[168,50],[165,50],[162,50],[160,50],[158,50],[155,50],[152,50],[150,50],[148,50],[145,50],[142,50],[140,50],[138,50],[135,50],[132,50],[130,50],[128,50],[125,50],[122,50],[120,50],[118,50],[115,50],[112,50],[110,50],[108,50],[105,50],[102,50],[100,50],[98,50],[95,50],[92,50],[90,50],[88,50],[85,50],[82,50],[80,50],[78,50],[75,50],[72,50],[70,50],[68,50],[65,45],[60,40],[55,35],[50,30],[45,25],[40,20],[35,15],[30,10],[25,5],[20,0],[15,-5],[10,-10],[5,-15],[0,-20],[-5,-25],[-10,-30],[-15,-35],[-20,-40],[-25,-45],[-30,-50],[-35,-55],[-40,-60],[-45,-65],[-50,-70],[-55,-75],[-60,-80],[-60,-85],[-55,-90],[-50,-95],[-45,-100],[-40,-105],[-35,-110],[-30,-115],[-25,-120],[-20,-125],[-15,-130],[-10,-135],[-5,-140],[0,-145],[5,-150],[10,-155],[15,-160],[20,-165],[25,-170],[30,-175],[35,-180],[40,180],[40,175],[40,170],[40,165],[40,160],[40,155],[40,150],[40,145],[40,140],[40,135],[40,130],[40,125],[40,120],[40,115],[40,110],[40,105],[40,100],[40,95],[40,90],[40,85],[40,80],[40,75],[40,70],[40,65],[40,60],[40,55],[40,50]],
    // Australia
    [[-10,130],[-10,135],[-12,140],[-15,145],[-18,148],[-20,150],[-22,152],[-25,155],[-28,158],[-30,160],[-32,162],[-34,165],[-36,168],[-38,170],[-40,172],[-42,175],[-42,180],[-40,180],[-38,175],[-36,170],[-34,165],[-32,160],[-30,155],[-28,150],[-25,148],[-22,145],[-20,142],[-18,140],[-15,138],[-12,135],[-10,132],[-10,130]],
    // Antarctica
    [[-60,-180],[-65,-180],[-70,-180],[-75,-180],[-80,-180],[-85,-180],[-85,-150],[-85,-120],[-85,-90],[-85,-60],[-85,-30],[-85,0],[-85,30],[-85,60],[-85,90],[-85,120],[-85,150],[-85,180],[-80,180],[-75,180],[-70,180],[-65,180],[-60,180],[-60,150],[-60,120],[-60,90],[-60,60],[-60,30],[-60,0],[-60,-30],[-60,-60],[-60,-90],[-60,-120],[-60,-150],[-60,-180]],
  ];

  const toXY = (lat, lon, r) => {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = lon * Math.PI / 180;
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.sin(theta);
    const rx = rotX, ry = rotY;
    const cosX = Math.cos(rx), sinX = Math.sin(rx);
    const cosY = Math.cos(ry), sinY = Math.sin(ry);
    let x1 = x, y1 = y, z1 = z;
    // rotate Y
    let tmp = x1 * cosY + z1 * sinY;
    z1 = -x1 * sinY + z1 * cosY;
    x1 = tmp;
    // rotate X
    tmp = y1 * cosX - z1 * sinX;
    z1 = y1 * sinX + z1 * cosX;
    y1 = tmp;
    if (z1 <= 0) return null;
    // perspective
    const d = 300;
    const px = (x1 / z1) * d;
    const py = (y1 / z1) * d;
    return {x: px, y: py};
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.parentElement.clientWidth-24;
    const H = canvas.height = 400;
    const cx = W/2, cy = H/2;
    const r = 120;

    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = '#0B1120';
    ctx.fillRect(0,0,W,H);

    // grid
    for (let lat = -80; lat <= 80; lat += 20) {
      ctx.beginPath();
      for (let lon = -180; lon <= 180; lon += 5) {
        const p = toXY(lat, lon, r);
        if (!p) { ctx.beginPath(); continue; }
        const sx = cx + p.x, sy = cy + p.y;
        if (lon === -180) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
    for (let lon = -180; lon <= 180; lon += 20) {
      ctx.beginPath();
      for (let lat = -90; lat <= 90; lat += 3) {
        const p = toXY(lat, lon, r);
        if (!p) { ctx.beginPath(); continue; }
        const sx = cx + p.x, sy = cy + p.y;
        if (lat === -90) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // equator
    ctx.beginPath();
    for (let lon = -180; lon <= 180; lon += 2) {
      const p = toXY(0, lon, r);
      if (!p) { ctx.beginPath(); continue; }
      const sx = cx + p.x, sy = cy + p.y;
      if (lon === -180) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.strokeStyle = 'rgba(88,166,255,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // continents
    land.forEach(contour => {
      ctx.beginPath();
      let started = false;
      contour.forEach(([lat, lon]) => {
        const p = toXY(lat, lon, r);
        if (!p) { started = false; return; }
        const sx = cx + p.x, sy = cy + p.y;
        if (!started) { ctx.moveTo(sx, sy); started = true; }
        else ctx.lineTo(sx, sy);
      });
      ctx.closePath();
      ctx.fillStyle = 'rgba(88,166,255,0.15)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(88,166,255,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }, [rotX, rotY, time]);

  const handleMouseDown = React.useCallback((e) => {
    setDragging(true);
    setLastPos({x: e.clientX, y: e.clientY});
  }, []);

  const handleMouseMove = React.useCallback((e) => {
    if (!dragging || !lastPos) return;
    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    setRotY(r => r + dx * 0.005);
    setRotX(r => Math.max(-1.5, Math.min(1.5, r - dy * 0.005)));
    setLastPos({x: e.clientX, y: e.clientY});
  }, [dragging, lastPos]);

  const handleMouseUp = React.useCallback(() => {
    setDragging(false);
    setLastPos(null);
  }, []);

  return (
    <div style={{width:'100%',height:'100%',background:'#0B1120',color:'#e2e8f0',fontFamily:'monospace',display:'flex',flexDirection:'column',padding:'12px',overflow:'hidden',userSelect:'none',border:'1px solid rgba(34, 211, 238, 0.15)',boxShadow:'0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'}}>
      <div style={{fontSize:'13px',fontWeight:'bold',marginBottom:'8px',color:'#58a6ff'}}>3D Globe — Drag to rotate</div>
      <canvas ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{flex:1,borderRadius:'8px',cursor:dragging?'grabbing':'grab'}}/>
    </div>
  );
}
