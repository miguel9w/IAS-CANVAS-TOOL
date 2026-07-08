function Widget({ appBus }) {
  const [pH, setPH] = React.useState(7);

  const examples = {
    0:'Battery acid',1:'Gastric acid',2:'Lemon juice',3:'Vinegar',
    4:'Tomato juice',5:'Black coffee',6:'Milk',7:'Pure water',
    8:'Seawater',9:'Baking soda',10:'Milk of magnesia',
    11:'Ammonia',12:'Soapy water',13:'Bleach',14:'Drain cleaner'
  };

  const category = pH < 3 ? 'Strong acid' : pH < 6 ? 'Weak acid' : pH < 7 ? 'Very weak acid'
    : pH === 7 ? 'Neutral' : pH < 9 ? 'Very weak base' : pH < 12 ? 'Weak base' : 'Strong base';

  const hue = 280 - (pH / 14) * 280;

  return (
    <div style={{width:'100%',height:'100%',background:'#0B1120',color:'#e2e8f0',fontFamily:'monospace',display:'flex',flexDirection:'column',padding:'16px',overflow:'hidden',border:'1px solid rgba(34, 211, 238, 0.15)',boxShadow:'0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'}}>
      <div style={{fontSize:'13px',fontWeight:'bold',marginBottom:'12px',color:'#58a6ff'}}>pH Scale</div>

      <div style={{display:'flex',flexDirection:'column',alignItems:'center',flex:1,justifyContent:'center'}}>
        <div style={{width:'100%',maxWidth:400}}>
          <div style={{
            width:'100%',height:30,borderRadius:6,
            background:'linear-gradient(to right, #ff0000, #ff6600, #ffcc00, #99cc33, #33cc33, #3399ff, #3333ff, #6633cc)',
            position:'relative'
          }}>
            <div style={{
              position:'absolute',left:`${(pH/14)*100}%`,top:-22,
              transform:'translateX(-50%)',
              background:'#fff',color:'#000',
              borderRadius:'50%',width:32,height:32,
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:'14px',fontWeight:'bold',
              border:'2px solid #58a6ff',
              transition:'left 0.2s'
            }}>{pH}</div>
          </div>

          <div style={{display:'flex',justifyContent:'space-between',fontSize:'9px',color:'#94a3b8',marginTop:2}}>
            {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(v=>
              <span key={v} style={{width:20,textAlign:'center'}}>{v}</span>
            )}
          </div>

          <input type="range" min={0} max={14} step={0.1} value={pH}
            onChange={e=>setPH(Number(e.target.value))}
            style={{width:'100%',marginTop:12,accentColor:'#58a6ff',height:6}}/>

          <div style={{
            marginTop:16,padding:'14px 18px',borderRadius:8,
            border:'1px solid rgba(148, 163, 184, 0.08)',
            background:'#0f172a',textAlign:'center'
          }}>
            <div style={{fontSize:22,fontWeight:'bold',marginBottom:4,color:`hsl(${hue},80%,60%)`}}>
              {pH.toFixed(1)}
            </div>
            <div style={{fontSize:13,color:'#94a3b8',marginBottom:6}}>{category}</div>
            <div style={{fontSize:14,color:'#e2e8f0'}}>
              Example: <strong>{examples[Math.round(pH)] || '—'}</strong>
            </div>
          </div>
        </div>
      </div>

      <div style={{display:'flex',justifyContent:'center',gap:16,marginTop:10,fontSize:'10px',color:'#94a3b8'}}>
        <span style={{color:'#ff4444'}}>●</span> Acidic
        <span style={{color:'#33cc33'}}>●</span> Neutral
        <span style={{color:'#4444ff'}}>●</span> Basic
      </div>
    </div>
  );
}
