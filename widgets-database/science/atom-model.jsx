function Widget({ appBus }) {
  const [Z, setZ] = React.useState(6);
  const [time, setTime] = React.useState(0);
  const canvasRef = React.useRef(null);
  const animRef = React.useRef(null);

  const configs = {
    1:{cfg:'1s¹',shells:[1]},2:{cfg:'1s²',shells:[2]},
    3:{cfg:'[He]2s¹',shells:[2,1]},4:{cfg:'[He]2s²',shells:[2,2]},
    5:{cfg:'[He]2s²2p¹',shells:[2,3]},6:{cfg:'[He]2s²2p²',shells:[2,4]},
    7:{cfg:'[He]2s²2p³',shells:[2,5]},8:{cfg:'[He]2s²2p⁴',shells:[2,6]},
    9:{cfg:'[He]2s²2p⁵',shells:[2,7]},10:{cfg:'[He]2s²2p⁶',shells:[2,8]},
    11:{cfg:'[Ne]3s¹',shells:[2,8,1]},12:{cfg:'[Ne]3s²',shells:[2,8,2]},
    13:{cfg:'[Ne]3s²3p¹',shells:[2,8,3]},14:{cfg:'[Ne]3s²3p²',shells:[2,8,4]},
    15:{cfg:'[Ne]3s²3p³',shells:[2,8,5]},16:{cfg:'[Ne]3s²3p⁴',shells:[2,8,6]},
    17:{cfg:'[Ne]3s²3p⁵',shells:[2,8,7]},18:{cfg:'[Ne]3s²3p⁶',shells:[2,8,8]},
    19:{cfg:'[Ar]4s¹',shells:[2,8,8,1]},20:{cfg:'[Ar]4s²',shells:[2,8,8,2]}
  };

  const names = ['','Hydrogen','Helium','Lithium','Beryllium','Boron','Carbon','Nitrogen','Oxygen','Fluorine','Neon','Sodium','Magnesium','Aluminium','Silicon','Phosphorus','Sulfur','Chlorine','Argon','Potassium','Calcium'];

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

    const d = configs[Z];
    if (!d) return;

    const colors = ['#ff6b6b','#ffd93d','#6bcbff','#6fcf97'];
    const radii = [40, 70, 100, 130];
    const numShells = d.shells.length;

    const t = time * 0.02;

    for (let n = 0; n < numShells; n++) {
      const r = radii[n];
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      const count = d.shells[n];
      for (let i = 0; i < count; i++) {
        const angle = t * (1 + n*0.5) + (i/count)*Math.PI*2;
        const ex = cx + r * Math.cos(angle);
        const ey = cy + r * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(ex, ey, 6, 0, Math.PI*2);
        ctx.fillStyle = colors[n % colors.length];
        ctx.fill();
        ctx.shadowColor = colors[n % colors.length];
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI*2);
    const grad = ctx.createRadialGradient(cx-4,cy-4,2,cx,cy,18);
    grad.addColorStop(0,'#ff6b6b');
    grad.addColorStop(1,'#c0392b');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Z, cx, cy);

    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    for (let i=0;i<3;i++){
      const a = t*0.3+i*2.1;
      ctx.beginPath();
      ctx.ellipse(cx+Math.cos(a)*8,cy+Math.sin(a)*8,40,12,a,0,Math.PI*2);
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth=1;
      ctx.stroke();
    }
  }, [Z, time]);

  const cfg = configs[Z];

  return (
    <div style={{width:'100%',height:'100%',background:'#0B1120',color:'#e2e8f0',fontFamily:'monospace',display:'flex',flexDirection:'column',padding:'12px',overflow:'hidden',border:'1px solid rgba(34, 211, 238, 0.15)',boxShadow:'0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
        <span style={{fontSize:'13px',fontWeight:'bold',color:'#58a6ff'}}>Bohr Model: {names[Z]} ({Z})</span>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <button onClick={()=>setZ(Math.max(1,Z-1))} style={{background:'#1e293b',border:'1px solid rgba(148, 163, 184, 0.08)',color:'#e2e8f0',padding:'2px 10px',borderRadius:'4px',cursor:'pointer',fontSize:'14px'}}>-</button>
          <input type="range" min={1} max={20} value={Z} onChange={e=>setZ(Number(e.target.value))} style={{width:120,accentColor:'#58a6ff'}}/>
          <button onClick={()=>setZ(Math.min(20,Z+1))} style={{background:'#1e293b',border:'1px solid rgba(148, 163, 184, 0.08)',color:'#e2e8f0',padding:'2px 10px',borderRadius:'4px',cursor:'pointer',fontSize:'14px'}}>+</button>
        </div>
      </div>
      <canvas ref={canvasRef} style={{flex:1,borderRadius:'8px'}}/>
      <div style={{marginTop:'8px',fontSize:'12px',color:'#94a3b8',textAlign:'center'}}>
        {cfg ? `${Z > 2 ? `[${names[Z-1]||''}] ` : ''}${cfg.cfg}` : ''} — {cfg.shells.join(', ')} e⁻ per shell
      </div>
    </div>
  );
}
