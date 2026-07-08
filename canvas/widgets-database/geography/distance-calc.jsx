function Widget({ appBus }) {
  const [city1, setCity1] = React.useState(0);
  const [city2, setCity2] = React.useState(1);
  const [unit, setUnit] = React.useState('km');

  const cities = [
    {name:'New York',lat:40.7128,lon:-74.006},
    {name:'London',lat:51.5074,lon:-0.1278},
    {name:'Tokyo',lat:35.6762,lon:139.6503},
    {name:'Paris',lat:48.8566,lon:2.3522},
    {name:'Sydney',lat:-33.8688,lon:151.2093},
    {name:'Cairo',lat:30.0444,lon:31.2357},
    {name:'Moscow',lat:55.7558,lon:37.6173},
    {name:'Beijing',lat:39.9042,lon:116.4074},
    {name:'Rio de Janeiro',lat:-22.9068,lon:-43.1729},
    {name:'Cape Town',lat:-33.9249,lon:18.4241},
    {name:'Dubai',lat:25.2048,lon:55.2708},
    {name:'Singapore',lat:1.3521,lon:103.8198},
    {name:'Los Angeles',lat:34.0522,lon:-118.2437},
    {name:'Buenos Aires',lat:-34.6037,lon:-58.3816},
    {name:'Mumbai',lat:19.0760,lon:72.8777}
  ];

  const greatCircleDist = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const dist = greatCircleDist(cities[city1].lat, cities[city1].lon, cities[city2].lat, cities[city2].lon);
  const displayDist = unit === 'km' ? dist : dist * 0.621371;
  const unitLabel = unit === 'km' ? 'km' : 'mi';

  return (
    <div style={{width:'100%',height:'100%',background:'#0B1120',color:'#e2e8f0',fontFamily:'monospace',display:'flex',flexDirection:'column',padding:'16px',overflow:'auto',border:'1px solid rgba(34, 211, 238, 0.15)',boxShadow:'0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'}}>
      <div style={{fontSize:'13px',fontWeight:'bold',marginBottom:'12px',color:'#58a6ff'}}>Great Circle Distance Calculator</div>

      <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'14px'}}>
        <div>
          <div style={{color:'#94a3b8',marginBottom:'4px',fontSize:'11px'}}>From</div>
          <select value={city1} onChange={e=>setCity1(Number(e.target.value))}
            style={{width:'100%',padding:'6px',background:'#0f172a',border:'1px solid rgba(148, 163, 184, 0.08)',color:'#e2e8f0',borderRadius:'4px',fontSize:'12px'}}>
            {cities.map((c,i)=><option key={i} value={i}>{c.name}</option>)}
          </select>
        </div>
        <div style={{textAlign:'center',fontSize:'16px',color:'#94a3b8'}}>↓</div>
        <div>
          <div style={{color:'#94a3b8',marginBottom:'4px',fontSize:'11px'}}>To</div>
          <select value={city2} onChange={e=>setCity2(Number(e.target.value))}
            style={{width:'100%',padding:'6px',background:'#0f172a',border:'1px solid rgba(148, 163, 184, 0.08)',color:'#e2e8f0',borderRadius:'4px',fontSize:'12px'}}>
            {cities.map((c,i)=><option key={i} value={i}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div style={{textAlign:'center',padding:'16px',background:'#0f172a',border:'1px solid rgba(148, 163, 184, 0.08)',borderRadius:'8px',marginBottom:'12px'}}>
        <div style={{fontSize:'11px',color:'#94a3b8',marginBottom:'4px'}}>Great Circle Distance</div>
        <div style={{fontSize:'28px',fontWeight:'bold',color:'#58a6ff'}}>{displayDist.toLocaleString(undefined,{maximumFractionDigits:0})} {unitLabel}</div>
        <div style={{fontSize:'10px',color:'#94a3b8',marginTop:'2px'}}>
          ({dist.toFixed(1)} km / {(dist*0.621371).toFixed(1)} mi)
        </div>
      </div>

      <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
        <button onClick={()=>setUnit('km')}
          style={{flex:1,padding:'6px',background:unit==='km'?'#22d3ee':'#1e293b',border:'1px solid rgba(148, 163, 184, 0.08)',color:unit==='km'?'#0B1120':'#e2e8f0',borderRadius:'4px',cursor:'pointer',fontSize:'11px',fontWeight:unit==='km'?'bold':'normal'}}>km</button>
        <button onClick={()=>setUnit('mi')}
          style={{flex:1,padding:'6px',background:unit==='mi'?'#22d3ee':'#1e293b',border:'1px solid rgba(148, 163, 184, 0.08)',color:unit==='mi'?'#0B1120':'#e2e8f0',borderRadius:'4px',cursor:'pointer',fontSize:'11px',fontWeight:unit==='mi'?'bold':'normal'}}>miles</button>
      </div>

      <div style={{fontSize:'10px',color:'#94a3b8',padding:'8px',background:'#0f172a',borderRadius:'6px',lineHeight:1.5}}>
        Route: <strong style={{color:'#e2e8f0'}}>{cities[city1].name}</strong> ({cities[city1].lat.toFixed(2)}°, {cities[city1].lon.toFixed(2)}°) 
        → <strong style={{color:'#e2e8f0'}}>{cities[city2].name}</strong> ({cities[city2].lat.toFixed(2)}°, {cities[city2].lon.toFixed(2)}°)
      </div>

      {city1 !== city2 && (
        <div style={{marginTop:'8px',padding:'8px',background:'#0f172a',borderRadius:'6px',fontSize:'10px',color:'#94a3b8'}}>
          <div style={{marginBottom:'4px'}}>Other distances from {cities[city1].name}:</div>
          {cities.map((c,i)=>{
            if (i === city1) return null;
            const d = greatCircleDist(cities[city1].lat, cities[city1].lon, c.lat, c.lon);
            const dd = unit === 'km' ? d : d * 0.621371;
            return (
              <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'2px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                <span>{c.name}</span>
                <span style={{color:'#58a6ff'}}>{dd.toLocaleString(undefined,{maximumFractionDigits:0})} {unitLabel}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
