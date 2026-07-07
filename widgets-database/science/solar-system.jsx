function Widget({ appBus }) {
  const [selected, setSelected] = React.useState(null);
  const [time, setTime] = React.useState(0);
  const canvasRef = React.useRef(null);
  const animRef = React.useRef(null);

  const planets = [
    {name:'Mercury',d:0.39,period:88,day:58.6,diam:4879,color:'#b5b5b5',ring:0},
    {name:'Venus',d:0.72,period:225,day:243,diam:12104,color:'#e8c87a',ring:0},
    {name:'Earth',d:1.0,period:365,day:1,diam:12756,color:'#4b8bbe',ring:0},
    {name:'Mars',d:1.52,period:687,day:1.03,diam:6792,color:'#c1440e',ring:0},
    {name:'Jupiter',d:5.2,period:4333,day:0.41,diam:142984,color:'#d4a574',ring:0},
    {name:'Saturn',d:9.54,period:10759,day:0.45,diam:120536,color:'#ead6b8',ring:1},
    {name:'Uranus',d:19.19,period:30687,day:0.72,diam:51118,color:'#7ec8e3',ring:1},
    {name:'Neptune',d:30.07,period:60190,day:0.67,diam:49528,color:'#3b5c9c',ring:0}
  ];

  React.useEffect(() => {
    const step = () => { setTime(t=>t+1); animRef.current = requestAnimationFrame(step); };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.parentElement.clientWidth-24;
    const H = canvas.height = 400;
    const cx = W/2, cy = H/2;

    ctx.clearRect(0,0,W,H);

    const maxDist = 30.07;
    const scale = (Math.min(W,H)/2 - 30) / maxDist;
    const t = time * 0.005;

    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI*2);
    const grad = ctx.createRadialGradient(cx,cy,2,cx,cy,15);
    grad.addColorStop(0,'#ffe066');
    grad.addColorStop(1,'#ff6b00');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.fillStyle = '#ffe066';
    ctx.shadowColor = '#ff6b00';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;

    planets.forEach((p, i) => {
      const r = p.d * scale;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      const angle = t * (1 / Math.sqrt(p.d)) + i * 1.5;
      const px = cx + r * Math.cos(angle);
      const py = cy + r * Math.sin(angle);

      if (p.ring) {
        ctx.beginPath();
        ctx.ellipse(px, py, 10, 3, angle, 0, Math.PI*2);
        ctx.strokeStyle = 'rgba(200,200,200,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(px, py, 4 + p.diam/50000, 0, Math.PI*2);
      ctx.fillStyle = p.color;
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(p.name, px, py - 12);
    });

    if (selected !== null) {
      const p = planets[selected];
      ctx.fillStyle = 'rgba(13,17,23,0.85)';
      ctx.fillRect(10, H-80, 220, 70);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.strokeRect(10, H-80, 220, 70);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(p.name, 20, H-60);
      ctx.font = '10px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`Distance: ${p.d} AU  |  Year: ${p.period} days`, 20, H-42);
      ctx.fillText(`Diameter: ${p.diam.toLocaleString()} km  |  Day: ${p.day} Earth days`, 20, H-26);
    }
  }, [time, selected]);

  const handleClick = React.useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const W = canvas.width, H = canvas.height;
    const cx = W/2, cy = H/2;
    const maxDist = 30.07;
    const scale = (Math.min(W,H)/2 - 30) / maxDist;
    const t = time * 0.005;

    for (let i = planets.length-1; i >= 0; i--) {
      const p = planets[i];
      const r = p.d * scale;
      const angle = t * (1 / Math.sqrt(p.d)) + i * 1.5;
      const px = cx + r * Math.cos(angle);
      const py = cy + r * Math.sin(angle);
      const dist = Math.hypot(mx-px, my-py);
      if (dist < 15) {
        setSelected(i);
        return;
      }
    }
    setSelected(null);
  }, [time]);

  return (
    <div style={{width:'100%',height:'100%',background:'#0B1120',color:'#e2e8f0',fontFamily:'monospace',display:'flex',flexDirection:'column',padding:'12px',overflow:'hidden',border:'1px solid rgba(34, 211, 238, 0.15)',boxShadow:'0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'}}>
      <div style={{fontSize:'13px',fontWeight:'bold',marginBottom:'8px',color:'#58a6ff'}}>Solar System</div>
      <canvas ref={canvasRef} onClick={handleClick} style={{flex:1,borderRadius:'8px',cursor:'pointer'}}/>
      <div style={{marginTop:'6px',fontSize:'10px',color:'#94a3b8',textAlign:'center'}}>Click a planet for details</div>
    </div>
  );
}
