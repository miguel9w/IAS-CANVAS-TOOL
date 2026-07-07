function Widget({ appBus }) {
  const [lat, setLat] = React.useState(40.7128);
  const [lon, setLon] = React.useState(-74.006);
  const [date, setDate] = React.useState(new Date());
  const canvasRef = React.useRef(null);

  const solarPos = (lat, lon, date) => {
    const day = (date - new Date(date.getFullYear(),0,0)) / 86400000;
    const declination = 23.44 * Math.sin((360/365) * (day - 81) * Math.PI / 180);
    const hourAngle = (date.getUTCHours() + date.getUTCMinutes()/60 + lon/15 - 12) * 15;
    const latR = lat * Math.PI / 180;
    const decR = declination * Math.PI / 180;
    const haR = hourAngle * Math.PI / 180;
    const alt = Math.asin(Math.sin(latR)*Math.sin(decR) + Math.cos(latR)*Math.cos(decR)*Math.cos(haR));
    const az = Math.atan2(-Math.sin(haR), Math.tan(decR)*Math.cos(latR) - Math.sin(latR)*Math.cos(haR));
    return { elevation: alt * 180 / Math.PI, azimuth: (az * 180 / Math.PI + 180) % 360, declination };
  };

  const dayLength = (lat, date) => {
    const day = (date - new Date(date.getFullYear(),0,0)) / 86400000;
    const declination = 23.44 * Math.sin((360/365) * (day - 81) * Math.PI / 180);
    const latR = lat * Math.PI / 180;
    const decR = declination * Math.PI / 180;
    const cosHA = -Math.tan(latR) * Math.tan(decR);
    if (cosHA < -1) return 24;
    if (cosHA > 1) return 0;
    const ha = Math.acos(cosHA) * 180 / Math.PI;
    return 2 * ha / 15;
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.parentElement.clientWidth-24;
    const H = canvas.height = 320;

    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = '#0B1120';
    ctx.fillRect(0,0,W,H);

    const cx = W/2, cy = H - 30;
    const r = Math.min(W/2-20, 130);

    // horizon arc
    ctx.beginPath();
    ctx.moveTo(cx-r, cy);
    ctx.lineTo(cx+r, cy);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // sky gradient
    const skyGrad = ctx.createLinearGradient(0,0,0,cy);
    skyGrad.addColorStop(0,'rgba(88,166,255,0.1)');
    skyGrad.addColorStop(0.7,'rgba(88,166,255,0.02)');
    ctx.fillStyle = skyGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, 0);
    ctx.fill();

    // elevation arcs
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * i / 3, Math.PI, 0);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.font = '9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${i*30}°`, cx+2, cy - r * i / 3);
    }

    // compass
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('N', cx, cy+16);
    ctx.fillText('S', cx, cy-r-8);
    ctx.fillText('E', cx+r+12, cy+4);
    ctx.fillText('W', cx-r-12, cy+4);

    // sun path
    const pos = solarPos(lat, lon, date);
    const altRad = pos.elevation * Math.PI / 180;
    const azRad = pos.azimuth * Math.PI / 180;

    // convert: azimuth 0=N, clockwise; in canvas: N=top, E=right
    const sx = cx + r * Math.cos(azRad - Math.PI/2) * Math.cos(altRad);
    const sy = cy - r * Math.sin(altRad);

    // sun ray
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(sx, sy);
    ctx.strokeStyle = 'rgba(255,200,50,0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4,4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // sun
    const grad = ctx.createRadialGradient(sx,sy,0,sx,sy,20);
    grad.addColorStop(0,'rgba(255,220,50,1)');
    grad.addColorStop(0.3,'rgba(255,180,50,0.8)');
    grad.addColorStop(1,'rgba(255,150,50,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(sx, sy, 20, 0, Math.PI*2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(sx, sy, 6, 0, Math.PI*2);
    ctx.fillStyle = '#ffe040';
    ctx.fill();
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;

    // day arc
    const dl = dayLength(lat, date);
    for (let h = 0; h < 24; h++) {
      const testDate = new Date(date);
      testDate.setUTCHours(h, 0, 0, 0);
      const p = solarPos(lat, lon, testDate);
      if (p.elevation < 0) continue;
      const ha = p.azimuth * Math.PI / 180;
      const px = cx + r * Math.cos(ha - Math.PI/2) * Math.cos(p.elevation * Math.PI/180);
      const py = cy - r * Math.sin(p.elevation * Math.PI/180);
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,200,50,0.15)';
      ctx.fill();
    }
  }, [lat, lon, date]);

  const pos = solarPos(lat, lon, date);
  const dl = dayLength(lat, date);

  const sunrise = 12 - dl/2;
  const sunset = 12 + dl/2;
  const srH = Math.floor(sunrise);
  const srM = Math.round((sunrise - srH) * 60);
  const ssH = Math.floor(sunset);
  const ssM = Math.round((sunset - ssH) * 60);

  return (
    <div style={{width:'100%',height:'100%',background:'#0B1120',color:'#e2e8f0',fontFamily:'monospace',display:'flex',flexDirection:'column',padding:'12px',overflow:'auto',border:'1px solid rgba(34, 211, 238, 0.15)',boxShadow:'0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'}}>
      <div style={{fontSize:'13px',fontWeight:'bold',marginBottom:'8px',color:'#58a6ff'}}>Sun Position</div>

      <div style={{display:'flex',gap:'8px',marginBottom:'8px',fontSize:'11px'}}>
        <div style={{flex:1}}>
          <div style={{color:'#94a3b8'}}>Latitude</div>
          <input type="number" step={0.1} value={lat} onChange={e=>setLat(Number(e.target.value))}
            style={{width:'100%',padding:'4px',background:'#0f172a',border:'1px solid rgba(148, 163, 184, 0.08)',color:'#e2e8f0',borderRadius:'4px',fontSize:'11px'}}/>
        </div>
        <div style={{flex:1}}>
          <div style={{color:'#94a3b8'}}>Longitude</div>
          <input type="number" step={0.1} value={lon} onChange={e=>setLon(Number(e.target.value))}
            style={{width:'100%',padding:'4px',background:'#0f172a',border:'1px solid rgba(148, 163, 184, 0.08)',color:'#e2e8f0',borderRadius:'4px',fontSize:'11px'}}/>
        </div>
        <div style={{flex:1}}>
          <div style={{color:'#94a3b8'}}>Date</div>
          <input type="date" value={date.toISOString().split('T')[0]} onChange={e=>setDate(new Date(e.target.value+'T12:00:00'))}
            style={{width:'100%',padding:'4px',background:'#0f172a',border:'1px solid rgba(148, 163, 184, 0.08)',color:'#e2e8f0',borderRadius:'4px',fontSize:'11px'}}/>
        </div>
      </div>

      <canvas ref={canvasRef} style={{width:'100%',borderRadius:'8px',background:'#0B1120'}}/>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px',marginTop:'8px',fontSize:'11px'}}>
        <div style={{padding:'8px',background:'#0f172a',borderRadius:'6px'}}>
          <div style={{color:'#94a3b8'}}>Elevation</div>
          <div style={{fontSize:'16px',fontWeight:'bold',color:'#ffe040'}}>{pos.elevation.toFixed(1)}°</div>
        </div>
        <div style={{padding:'8px',background:'#0f172a',borderRadius:'6px'}}>
          <div style={{color:'#94a3b8'}}>Azimuth</div>
          <div style={{fontSize:'16px',fontWeight:'bold',color:'#58a6ff'}}>{pos.azimuth.toFixed(1)}°</div>
        </div>
        <div style={{padding:'8px',background:'#0f172a',borderRadius:'6px'}}>
          <div style={{color:'#94a3b8'}}>Sunrise</div>
          <div style={{fontSize:'14px',fontWeight:'bold',color:'#ffa500'}}>{String(srH).padStart(2,'0')}:{String(srM).padStart(2,'0')}</div>
        </div>
        <div style={{padding:'8px',background:'#0f172a',borderRadius:'6px'}}>
          <div style={{color:'#94a3b8'}}>Sunset</div>
          <div style={{fontSize:'14px',fontWeight:'bold',color:'#ff6b6b'}}>{String(ssH).padStart(2,'0')}:{String(ssM).padStart(2,'0')}</div>
        </div>
      </div>

      <div style={{textAlign:'center',marginTop:'6px',fontSize:'11px',color:'#94a3b8'}}>
        Day length: <strong style={{color:'#e2e8f0'}}>{dl.toFixed(1)} hours</strong>
      </div>
    </div>
  );
}
