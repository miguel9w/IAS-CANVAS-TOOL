function Widget({ appBus }) {
  const [speed, setSpeed] = React.useState(2);
  const [time, setTime] = React.useState(0);
  const canvasRef = React.useRef(null);
  const animRef = React.useRef(null);

  React.useEffect(() => {
    const step = () => { setTime(t=>t+speed*0.3); animRef.current = requestAnimationFrame(step); };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [speed]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.parentElement.clientWidth-24;
    const H = canvas.height = 400;

    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = '#0B1120';
    ctx.fillRect(0,0,W,H);

    // simplified world outline
    const worldOutline = [
      // North America
      [0.18,0.32],[0.20,0.28],[0.22,0.25],[0.24,0.22],[0.26,0.20],[0.22,0.18],[0.20,0.20],[0.18,0.24],[0.16,0.28],
      [0.14,0.32],[0.12,0.34],[0.14,0.36],[0.16,0.34],[0.18,0.32],
      // South America
      [0.22,0.48],[0.24,0.44],[0.26,0.42],[0.28,0.46],[0.30,0.50],[0.32,0.54],[0.34,0.58],[0.36,0.62],[0.38,0.66],
      [0.40,0.70],[0.38,0.72],[0.36,0.68],[0.34,0.64],[0.32,0.60],[0.30,0.56],[0.28,0.52],[0.26,0.50],[0.22,0.48],
      // Europe
      [0.48,0.22],[0.50,0.20],[0.52,0.18],[0.54,0.18],[0.56,0.20],[0.58,0.22],[0.60,0.24],[0.58,0.26],[0.56,0.28],
      [0.54,0.30],[0.52,0.30],[0.50,0.28],[0.48,0.26],[0.48,0.22],
      // Africa
      [0.50,0.32],[0.48,0.36],[0.46,0.40],[0.44,0.44],[0.42,0.48],[0.40,0.52],[0.42,0.56],[0.44,0.60],[0.46,0.64],
      [0.48,0.60],[0.50,0.56],[0.52,0.52],[0.54,0.48],[0.56,0.44],[0.58,0.40],[0.60,0.36],[0.62,0.32],[0.60,0.30],
      [0.58,0.28],[0.56,0.28],[0.54,0.30],[0.52,0.32],[0.50,0.32],
      // Asia
      [0.58,0.20],[0.62,0.18],[0.66,0.16],[0.70,0.14],[0.74,0.14],[0.78,0.16],[0.82,0.18],[0.86,0.20],[0.90,0.22],
      [0.88,0.24],[0.84,0.26],[0.80,0.28],[0.76,0.30],[0.72,0.30],[0.68,0.28],[0.64,0.26],[0.60,0.24],[0.58,0.20],
      // Australia
      [0.78,0.56],[0.82,0.54],[0.86,0.52],[0.90,0.54],[0.92,0.56],[0.90,0.58],[0.86,0.60],[0.82,0.58],[0.78,0.56],
      // Antarctica
      [0.10,0.94],[0.30,0.92],[0.50,0.90],[0.70,0.92],[0.90,0.94],[0.90,0.98],[0.70,0.98],[0.50,0.98],[0.30,0.98],[0.10,0.98]
    ];

    ctx.beginPath();
    worldOutline.forEach(([x,y],i) => {
      const sx = x * W, sy = y * H;
      i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(88,166,255,0.06)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(88,166,255,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // wind particles
    const numParticles = Math.round(120 * speed);
    const t = time * 0.01;

    for (let i = 0; i < numParticles; i++) {
      const seed = i * 137.508;
      const px = ((seed * 0.6180339887) % 1) * W;
      const py = ((seed * 0.3819660113) % 1) * H;
      const xOff = Math.sin(py * 0.01 + t + i) * 30;
      const yOff = Math.cos(px * 0.01 + t * 0.7 + i * 0.5) * 15;
      const windX = px + xOff;
      const windY = py + yOff;
      const dx = Math.sin(py * 0.01 + t + i + 0.5) * 30;
      const dy = Math.cos(px * 0.01 + t * 0.7 + i * 0.5 + 0.5) * 15;

      const alpha = 0.15 + 0.35 * (0.5 + 0.5 * Math.sin(px * 0.02 + py * 0.02 + t));

      ctx.beginPath();
      ctx.moveTo(windX, windY);
      ctx.lineTo(windX + dx * 0.3, windY + dy * 0.3);
      ctx.strokeStyle = `rgba(150,220,255,${alpha})`;
      ctx.lineWidth = 1 + Math.abs(dx) / 30;
      ctx.stroke();
    }

    // legend
    ctx.fillStyle = 'rgba(13,17,23,0.8)';
    ctx.fillRect(W-110, 8, 102, 20);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${(speed * 10).toFixed(0)} km/h`, W-105, 22);
  }, [time, speed]);

  return (
    <div style={{width:'100%',height:'100%',background:'#0B1120',color:'#e2e8f0',fontFamily:'monospace',display:'flex',flexDirection:'column',padding:'12px',overflow:'hidden',border:'1px solid rgba(34, 211, 238, 0.15)',boxShadow:'0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
        <span style={{fontSize:'13px',fontWeight:'bold',color:'#58a6ff'}}>Global Wind Map</span>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <span style={{fontSize:'11px',color:'#94a3b8'}}>Speed</span>
          <input type="range" min={0.5} max={5} step={0.1} value={speed} onChange={e=>setSpeed(Number(e.target.value))}
            style={{width:100,accentColor:'#58a6ff'}}/>
          <span style={{fontSize:'11px',color:'#94a3b8',minWidth:20}}>{speed.toFixed(1)}x</span>
        </div>
      </div>
      <canvas ref={canvasRef} style={{flex:1,borderRadius:'8px'}}/>
    </div>
  );
}
