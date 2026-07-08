function Widget({ appBus }) {
  const [mode, setMode] = React.useState('dd'); // dd, dms, utm
  const [latDD, setLatDD] = React.useState(48.8566);
  const [lonDD, setLonDD] = React.useState(2.3522);
  const [latDMS, setLatDMS] = React.useState({d:48,n:'N',m:51,s:24});
  const [lonDMS, setLonDMS] = React.useState({d:2,n:'E',m:21,s:8});
  const [utmZone, setUtmZone] = React.useState('31');
  const [utmEast, setUtmEast] = React.useState(448617);
  const [utmNorth, setUtmNorth] = React.useState(5411928);

  const toDMS = (dd, isLat) => {
    const n = dd >= 0 ? (isLat ? 'N' : 'E') : (isLat ? 'S' : 'W');
    const d = Math.abs(dd);
    const deg = Math.floor(d);
    const m = Math.floor((d - deg) * 60);
    const s = Math.round(((d - deg) * 60 - m) * 60);
    return {d: deg, m, s, n};
  };

  const fromDMS = (d, m, s, n) => {
    let dd = d + m/60 + s/3600;
    if (n === 'S' || n === 'W') dd = -dd;
    return dd;
  };

  const ddToUtm = (lat, lon) => {
    const zone = Math.floor((lon + 180) / 6) + 1;
    const latRad = lat * Math.PI / 180;
    const lonRad = lon * Math.PI / 180;
    const a = 6378137;
    const f = 1/298.257223563;
    const k0 = 0.9996;
    const e = Math.sqrt(2*f - f*f);
    const e2 = e*e;
    const e4 = e2*e2;
    const e6 = e4*e2;
    const N = a / Math.sqrt(1 - e2 * Math.sin(latRad)**2);
    const T = Math.tan(latRad)**2;
    const C = e2 * Math.cos(latRad)**2 / (1 - e2);
    const A = (lonRad - ((zone-1)*6 - 180 + 3)*Math.PI/180) * Math.cos(latRad);
    const M = a * ((1 - e2/4 - 3*e4/64 - 5*e6/256)*latRad - (3*e2/8 + 3*e4/32 + 45*e6/1024)*Math.sin(2*latRad) + (15*e4/256 + 45*e6/1024)*Math.sin(4*latRad) - (35*e6/3072)*Math.sin(6*latRad));
    const M0 = 0;
    const east = k0*N*(A + (1-T+C)*A*A*A/6 + (5 - 18*T + T*T + 72*C - 58*e2)*A*A*A*A*A/120) + 500000;
    const north = k0*(M - M0 + N*Math.tan(latRad)*(A*A/2 + (5 - T + 9*C + 4*C*C)*A*A*A*A/24 + (61 - 58*T + T*T + 600*C - 330*e2)*A*A*A*A*A*A/720));
    return {zone, east: Math.round(east), north: Math.round(north)};
  };

  const updateFromDD = (lat, lon) => {
    setLatDD(lat);
    setLonDD(lon);
    const dmsLat = toDMS(lat, true);
    const dmsLon = toDMS(lon, false);
    setLatDMS(dmsLat);
    setLonDMS(dmsLon);
    const utm = ddToUtm(lat, lon);
    setUtmZone(utm.zone);
    setUtmEast(utm.east);
    setUtmNorth(utm.north);
  };

  const handleDDChange = (field, val) => {
    const lat = field === 'lat' ? val : latDD;
    const lon = field === 'lon' ? val : lonDD;
    updateFromDD(lat, lon);
  };

  const handleDMSChange = (field, val) => {
    const dmsLa = {...latDMS};
    const dmsLo = {...lonDMS};
    if (field.startsWith('lat')) {
      if (field === 'lat_d') dmsLa.d = val;
      else if (field === 'lat_m') dmsLa.m = val;
      else if (field === 'lat_s') dmsLa.s = val;
      else if (field === 'lat_n') dmsLa.n = val;
    } else {
      if (field === 'lon_d') dmsLo.d = val;
      else if (field === 'lon_m') dmsLo.m = val;
      else if (field === 'lon_s') dmsLo.s = val;
      else if (field === 'lon_n') dmsLo.n = val;
    }
    setLatDMS(dmsLa);
    setLonDMS(dmsLo);
    const lat = fromDMS(dmsLa.d, dmsLa.m, dmsLa.s, dmsLa.n);
    const lon = fromDMS(dmsLo.d, dmsLo.m, dmsLo.s, dmsLo.n);
    updateFromDD(lat, lon);
  };

  return (
    <div style={{width:'100%',height:'100%',background:'#0B1120',color:'#e2e8f0',fontFamily:'monospace',display:'flex',flexDirection:'column',padding:'16px',overflow:'auto',fontSize:'12px',border:'1px solid rgba(34, 211, 238, 0.15)',boxShadow:'0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'}}>
      <div style={{fontSize:'13px',fontWeight:'bold',marginBottom:'12px',color:'#58a6ff'}}>Coordinate Converter</div>

      <div style={{display:'flex',gap:'6px',marginBottom:'12px'}}>
        {['dd','dms','utm'].map(m=>
          <button key={m} onClick={()=>setMode(m)}
            style={{flex:1,padding:'4px',background:mode===m?'#22d3ee':'#1e293b',border:'1px solid rgba(148, 163, 184, 0.08)',color:mode===m?'#0B1120':'#e2e8f0',borderRadius:'4px',cursor:'pointer',fontSize:'11px',fontWeight:mode===m?'bold':'normal'}}>
            {m==='dd'?'Decimal':m==='dms'?'DMS':'UTM'}
          </button>
        )}
      </div>

      {mode === 'dd' && (
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          <div>
            <div style={{color:'#94a3b8',marginBottom:'4px'}}>Latitude</div>
            <input type="number" step={0.0001} value={latDD} onChange={e=>handleDDChange('lat',Number(e.target.value))}
              style={{width:'100%',padding:'6px',background:'#0f172a',border:'1px solid rgba(148, 163, 184, 0.08)',color:'#e2e8f0',borderRadius:'4px',fontSize:'12px'}}/>
          </div>
          <div>
            <div style={{color:'#94a3b8',marginBottom:'4px'}}>Longitude</div>
            <input type="number" step={0.0001} value={lonDD} onChange={e=>handleDDChange('lon',Number(e.target.value))}
              style={{width:'100%',padding:'6px',background:'#0f172a',border:'1px solid rgba(148, 163, 184, 0.08)',color:'#e2e8f0',borderRadius:'4px',fontSize:'12px'}}/>
          </div>
        </div>
      )}

      {mode === 'dms' && (
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          <div>
            <div style={{color:'#94a3b8',marginBottom:'4px'}}>Latitude</div>
            <div style={{display:'flex',gap:'4px'}}>
              <input type="number" value={latDMS.d} onChange={e=>handleDMSChange('lat_d',Number(e.target.value))} style={{width:50,padding:'6px',background:'#0f172a',border:'1px solid rgba(148, 163, 184, 0.08)',color:'#e2e8f0',borderRadius:'4px',fontSize:'12px'}}/><span style={{color:'#94a3b8',lineHeight:'28px'}}>°</span>
              <input type="number" value={latDMS.m} onChange={e=>handleDMSChange('lat_m',Number(e.target.value))} style={{width:50,padding:'6px',background:'#0f172a',border:'1px solid rgba(148, 163, 184, 0.08)',color:'#e2e8f0',borderRadius:'4px',fontSize:'12px'}}/><span style={{color:'#94a3b8',lineHeight:'28px'}}>'</span>
              <input type="number" value={latDMS.s} onChange={e=>handleDMSChange('lat_s',Number(e.target.value))} style={{width:60,padding:'6px',background:'#0f172a',border:'1px solid rgba(148, 163, 184, 0.08)',color:'#e2e8f0',borderRadius:'4px',fontSize:'12px'}}/><span style={{color:'#94a3b8',lineHeight:'28px'}}>"</span>
              <select value={latDMS.n} onChange={e=>handleDMSChange('lat_n',e.target.value)} style={{padding:'6px',background:'#0f172a',border:'1px solid rgba(148, 163, 184, 0.08)',color:'#e2e8f0',borderRadius:'4px',fontSize:'12px'}}>
                <option value="N">N</option><option value="S">S</option>
              </select>
            </div>
          </div>
          <div>
            <div style={{color:'#94a3b8',marginBottom:'4px'}}>Longitude</div>
            <div style={{display:'flex',gap:'4px'}}>
              <input type="number" value={lonDMS.d} onChange={e=>handleDMSChange('lon_d',Number(e.target.value))} style={{width:50,padding:'6px',background:'#0f172a',border:'1px solid rgba(148, 163, 184, 0.08)',color:'#e2e8f0',borderRadius:'4px',fontSize:'12px'}}/><span style={{color:'#94a3b8',lineHeight:'28px'}}>°</span>
              <input type="number" value={lonDMS.m} onChange={e=>handleDMSChange('lon_m',Number(e.target.value))} style={{width:50,padding:'6px',background:'#0f172a',border:'1px solid rgba(148, 163, 184, 0.08)',color:'#e2e8f0',borderRadius:'4px',fontSize:'12px'}}/><span style={{color:'#94a3b8',lineHeight:'28px'}}>'</span>
              <input type="number" value={lonDMS.s} onChange={e=>handleDMSChange('lon_s',Number(e.target.value))} style={{width:60,padding:'6px',background:'#0f172a',border:'1px solid rgba(148, 163, 184, 0.08)',color:'#e2e8f0',borderRadius:'4px',fontSize:'12px'}}/><span style={{color:'#94a3b8',lineHeight:'28px'}}>"</span>
              <select value={lonDMS.n} onChange={e=>handleDMSChange('lon_n',e.target.value)} style={{padding:'6px',background:'#0f172a',border:'1px solid rgba(148, 163, 184, 0.08)',color:'#e2e8f0',borderRadius:'4px',fontSize:'12px'}}>
                <option value="E">E</option><option value="W">W</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {mode === 'utm' && (
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          <div>
            <div style={{color:'#94a3b8',marginBottom:'4px'}}>Zone</div>
            <input type="number" value={utmZone} readOnly style={{width:'100%',padding:'6px',background:'#0f172a',border:'1px solid rgba(148, 163, 184, 0.08)',color:'#58a6ff',borderRadius:'4px',fontSize:'12px'}}/>
          </div>
          <div>
            <div style={{color:'#94a3b8',marginBottom:'4px'}}>Easting</div>
            <input type="number" value={utmEast} readOnly style={{width:'100%',padding:'6px',background:'#0f172a',border:'1px solid rgba(148, 163, 184, 0.08)',color:'#e2e8f0',borderRadius:'4px',fontSize:'12px'}}/>
          </div>
          <div>
            <div style={{color:'#94a3b8',marginBottom:'4px'}}>Northing</div>
            <input type="number" value={utmNorth} readOnly style={{width:'100%',padding:'6px',background:'#0f172a',border:'1px solid rgba(148, 163, 184, 0.08)',color:'#e2e8f0',borderRadius:'4px',fontSize:'12px'}}/>
          </div>
        </div>
      )}

      <div style={{marginTop:'14px',padding:'10px',background:'#0f172a',border:'1px solid rgba(148, 163, 184, 0.08)',borderRadius:'8px'}}>
        <div style={{color:'#94a3b8',marginBottom:'6px',fontSize:'11px'}}>Conversions</div>
        <div style={{display:'grid',gridTemplateColumns:'auto 1fr',gap:'3px 8px',fontSize:'11px'}}>
          <span style={{color:'#94a3b8'}}>Decimal:</span>
          <span>{latDD.toFixed(6)}°, {lonDD.toFixed(6)}°</span>
          <span style={{color:'#94a3b8'}}>DMS:</span>
          <span>{latDMS.d}°{latDMS.m}'{latDMS.s}"{latDMS.n}  {lonDMS.d}°{lonDMS.m}'{lonDMS.s}"{lonDMS.n}</span>
          <span style={{color:'#94a3b8'}}>UTM:</span>
          <span>{utmZone} {utmEast}E {utmNorth}N</span>
        </div>
      </div>
    </div>
  );
}
