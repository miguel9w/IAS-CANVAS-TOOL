function Widget({ appBus }) {
  const [speed, setSpeed] = React.useState(1);
  const [time, setTime] = React.useState(0);
  const canvasRef = React.useRef(null);
  const animRef = React.useRef(null);

  const bases = [
    'A','T','G','C','A','T','G','C','A','T',
    'G','C','A','T','G','C','A','T','G','C',
    'A','T','G','C','A','T','G','C','A','T',
    'G','C','A','T','G','C','A','T','G','C'
  ];

  const pair = { 'A':'T', 'T':'A', 'G':'C', 'C':'G' };
  const bpColors = { 'A':'#4CAF50', 'T':'#F44336', 'G':'#2196F3', 'C':'#FF9800' };

  React.useEffect(() => {
    const step = () => { setTime(t=>t+speed*0.5); animRef.current = requestAnimationFrame(step); };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [speed]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    const W = canvas.width = rect.width-24;
    const H = canvas.height = 400;
    const cx = W/2;

    ctx.clearRect(0,0,W,H);

    const t = time * 0.02;
    const spacing = 18;
    const numPairs = bases.length;
    const amp = 60;
    const twist = 0.8;

    ctx.fillStyle = '#0B1120';
    ctx.fillRect(0,0,W,H);

    for (let i = 0; i < numPairs; i++) {
      const y = i * spacing + 20;
      const angle = i * twist + t;
      const x1 = cx + amp * Math.cos(angle);
      const x2 = cx + amp * Math.cos(angle + Math.PI);
      const z1 = Math.sin(angle) * 0.5 + 0.5;
      const z2 = Math.sin(angle + Math.PI) * 0.5 + 0.5;
      const alpha = 0.3 + 0.7 * z1;
      const alpha2 = 0.3 + 0.7 * z2;

      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.strokeStyle = `rgba(255,255,255,${0.08 + 0.25 * Math.min(z1,z2)})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      const b1 = bases[i];
      const b2 = pair[b1];

      ctx.fillStyle = bpColors[b1];
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(x1, y, 8, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = `${7+4*z1}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b1, x1, y);

      ctx.fillStyle = bpColors[b2];
      ctx.globalAlpha = alpha2;
      ctx.beginPath();
      ctx.arc(x2, y, 8, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = `${7+4*z2}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b2, x2, y);

      ctx.globalAlpha = 1;
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx + amp, 20);
    for (let i=0;i<numPairs-1;i++){
      const y = i*spacing+20;
      const angle = i*twist+t;
      const x = cx + amp * Math.cos(angle);
      ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + amp * Math.cos(Math.PI), 20);
    for (let i=0;i<numPairs-1;i++){
      const y = i*spacing+20;
      const angle = i*twist+t+Math.PI;
      const x = cx + amp * Math.cos(angle);
      ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = 'rgba(88,166,255,0.3)';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('5\'', 4, 14);
    ctx.fillText('3\'', W-20, 14);
    ctx.fillText('3\'', 4, H-4);
    ctx.fillText('5\'', W-20, H-4);
  }, [time, speed]);

  return (
    <div style={{width:'100%',height:'100%',background:'#0B1120',color:'#e2e8f0',fontFamily:'monospace',display:'flex',flexDirection:'column',padding:'12px',overflow:'hidden',border:'1px solid rgba(34, 211, 238, 0.15)',boxShadow:'0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
        <span style={{fontSize:'13px',fontWeight:'bold',color:'#58a6ff'}}>DNA Double Helix</span>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <span style={{fontSize:'11px',color:'#94a3b8'}}>Speed</span>
          <input type="range" min={0} max={5} step={0.1} value={speed} onChange={e=>setSpeed(Number(e.target.value))} style={{width:100,accentColor:'#58a6ff'}}/>
          <span style={{fontSize:'11px',color:'#94a3b8',minWidth:20}}>{speed.toFixed(1)}x</span>
        </div>
      </div>
      <canvas ref={canvasRef} style={{flex:1,borderRadius:'8px',background:'#0B1120'}}/>
      <div style={{display:'flex',gap:'14px',marginTop:'6px',fontSize:'11px',justifyContent:'center'}}>
        <span><span style={{color:'#4CAF50'}}>●</span> A</span>
        <span><span style={{color:'#F44336'}}>●</span> T</span>
        <span><span style={{color:'#2196F3'}}>●</span> G</span>
        <span><span style={{color:'#FF9800'}}>●</span> C</span>
      </div>
    </div>
  );
}
