function Widget({ appBus }) {
  const [constellation, setConstellation] = React.useState('orion');
  const canvasRef = React.useRef(null);

  const constellations = {
    orion: {
      name: 'Orion',
      stars: [
        {id:'Betelgeuse',x:200,y:60,size:10,color:'#ff6b6b'},
        {id:'Meissa',x:260,y:80,size:6,color:'#e2e8f0'},
        {id:'Bellatrix',x:310,y:100,size:8,color:'#e2e8f0'},
        {id:'Alnitak',x:230,y:200,size:7,color:'#6bcbff'},
        {id:'Alnilam',x:260,y:170,size:7,color:'#6bcbff'},
        {id:'Mintaka',x:290,y:140,size:7,color:'#6bcbff'},
        {id:'Saiph',x:180,y:300,size:7,color:'#e2e8f0'},
        {id:'Rigel',x:320,y:320,size:9,color:'#6bcbff'}
      ],
      lines: [[0,1],[1,2],[2,5],[5,4],[4,3],[5,7],[2,6],[0,3],[3,7],[6,7],[1,4],[0,4]]
    },
    bigdipper: {
      name: 'Big Dipper',
      stars: [
        {id:'Dubhe',x:100,y:60,size:8,color:'#e2e8f0'},
        {id:'Merak',x:180,y:90,size:7,color:'#e2e8f0'},
        {id:'Phecda',x:230,y:160,size:7,color:'#e2e8f0'},
        {id:'Megrez',x:250,y:220,size:6,color:'#e2e8f0'},
        {id:'Alioth',x:290,y:280,size:8,color:'#e2e8f0'},
        {id:'Mizar',x:340,y:310,size:7,color:'#e2e8f0'},
        {id:'Alkaid',x:400,y:330,size:7,color:'#e2e8f0'}
      ],
      lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]]
    },
    cassiopeia: {
      name: 'Cassiopeia',
      stars: [
        {id:'Caph',x:100,y:250,size:7,color:'#e2e8f0'},
        {id:'Schedar',x:180,y:200,size:8,color:'#e2e8f0'},
        {id:'Ruchbah',x:250,y:270,size:7,color:'#e2e8f0'},
        {id:'Segin',x:320,y:210,size:6,color:'#e2e8f0'},
        {id:'Navi',x:390,y:160,size:9,color:'#ff6b6b'}
      ],
      lines: [[0,1],[1,2],[2,3],[3,4]]
    },
    southerncross: {
      name: 'Southern Cross',
      stars: [
        {id:'Acrux',x:200,y:320,size:9,color:'#6bcbff'},
        {id:'Becrux',x:250,y:250,size:8,color:'#e2e8f0'},
        {id:'Gacrux',x:300,y:180,size:7,color:'#e2e8f0'},
        {id:'Delta Crucis',x:330,y:290,size:6,color:'#e2e8f0'},
        {id:'Epsilon Crucis',x:270,y:350,size:5,color:'#e2e8f0'}
      ],
      lines: [[0,1],[1,2],[1,3],[0,4]]
    }
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.parentElement.clientWidth-24;
    const H = canvas.height = 380;

    ctx.fillStyle = '#0B1120';
    ctx.fillRect(0,0,W,H);

    for (let i=0;i<80;i++){
      ctx.beginPath();
      ctx.arc(Math.random()*W,Math.random()*H,Math.random()*1.5,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,255,255,${0.1+Math.random()*0.6})`;
      ctx.fill();
    }

    const data = constellations[constellation];
    if (!data) return;

    const offsetX = (W - 500) / 2;
    const offsetY = (H - 400) / 2;

    data.lines.forEach(([i,j]) => {
      const s1 = data.stars[i], s2 = data.stars[j];
      ctx.beginPath();
      ctx.moveTo(s1.x+offsetX, s1.y+offsetY);
      ctx.lineTo(s2.x+offsetX, s2.y+offsetY);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    data.stars.forEach(s => {
      const x = s.x+offsetX, y = s.y+offsetY;
      const grad = ctx.createRadialGradient(x,y,0,x,y,s.size);
      grad.addColorStop(0, s.color);
      grad.addColorStop(0.3, s.color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, s.size*2, 0, Math.PI*2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, s.size*0.5, 0, Math.PI*2);
      ctx.fillStyle = '#fff';
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(s.id, x, y + s.size + 12);
    });

    ctx.fillStyle = 'rgba(13,17,23,0.7)';
    ctx.fillRect(W-130, 8, 120, 24);
    ctx.fillStyle = '#58a6ff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(data.name, W-16, 25);
  }, [constellation]);

  return (
    <div style={{width:'100%',height:'100%',background:'#0B1120',color:'#e2e8f0',fontFamily:'monospace',display:'flex',flexDirection:'column',padding:'12px',overflow:'hidden',border:'1px solid rgba(34, 211, 238, 0.15)',boxShadow:'0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
        <span style={{fontSize:'13px',fontWeight:'bold',color:'#58a6ff'}}>Star Chart</span>
        <div style={{display:'flex',gap:'4px'}}>
          {Object.entries(constellations).map(([k,v])=>
            <button key={k} onClick={()=>setConstellation(k)}
              style={{background:constellation===k?'#22d3ee':'#1e293b',border:'1px solid rgba(148, 163, 184, 0.08)',color:constellation===k?'#0B1120':'#e2e8f0',padding:'3px 10px',borderRadius:'4px',cursor:'pointer',fontSize:'11px'}}>
              {v.name}
            </button>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} style={{flex:1,borderRadius:'8px'}}/>
    </div>
  );
}
