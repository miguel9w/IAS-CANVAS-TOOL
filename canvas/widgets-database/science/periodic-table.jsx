function Widget({ appBus }) {
  const [selected, setSelected] = React.useState(null);
  const [hovered, setHovered] = React.useState(null);

  const categoryColors = {
    'nonmetal': '#4CAF50', 'noble gas': '#9C27B0', 'alkali metal': '#F44336',
    'alkaline earth': '#FF9800', 'metalloid': '#00BCD4', 'halogen': '#E91E63',
    'transition metal': '#2196F3', 'post-transition metal': '#FF5722',
    'lanthanide': '#795548', 'actinide': '#607D8B', 'unknown': '#9E9E9E'
  };

  const elements = [
    {n:1,sym:'H',name:'Hydrogen',mass:1.008,cfg:'1s¹',cat:'nonmetal'},
    {n:2,sym:'He',name:'Helium',mass:4.003,cfg:'1s²',cat:'noble gas'},
    {n:3,sym:'Li',name:'Lithium',mass:6.941,cfg:'[He]2s¹',cat:'alkali metal'},
    {n:4,sym:'Be',name:'Beryllium',mass:9.012,cfg:'[He]2s²',cat:'alkaline earth'},
    {n:5,sym:'B',name:'Boron',mass:10.811,cfg:'[He]2s²2p¹',cat:'metalloid'},
    {n:6,sym:'C',name:'Carbon',mass:12.011,cfg:'[He]2s²2p²',cat:'nonmetal'},
    {n:7,sym:'N',name:'Nitrogen',mass:14.007,cfg:'[He]2s²2p³',cat:'nonmetal'},
    {n:8,sym:'O',name:'Oxygen',mass:15.999,cfg:'[He]2s²2p⁴',cat:'nonmetal'},
    {n:9,sym:'F',name:'Fluorine',mass:18.998,cfg:'[He]2s²2p⁵',cat:'halogen'},
    {n:10,sym:'Ne',name:'Neon',mass:20.180,cfg:'[He]2s²2p⁶',cat:'noble gas'},
    {n:11,sym:'Na',name:'Sodium',mass:22.990,cfg:'[Ne]3s¹',cat:'alkali metal'},
    {n:12,sym:'Mg',name:'Magnesium',mass:24.305,cfg:'[Ne]3s²',cat:'alkaline earth'},
    {n:13,sym:'Al',name:'Aluminium',mass:26.982,cfg:'[Ne]3s²3p¹',cat:'post-transition metal'},
    {n:14,sym:'Si',name:'Silicon',mass:28.086,cfg:'[Ne]3s²3p²',cat:'metalloid'},
    {n:15,sym:'P',name:'Phosphorus',mass:30.974,cfg:'[Ne]3s²3p³',cat:'nonmetal'},
    {n:16,sym:'S',name:'Sulfur',mass:32.065,cfg:'[Ne]3s²3p⁴',cat:'nonmetal'},
    {n:17,sym:'Cl',name:'Chlorine',mass:35.453,cfg:'[Ne]3s²3p⁵',cat:'halogen'},
    {n:18,sym:'Ar',name:'Argon',mass:39.948,cfg:'[Ne]3s²3p⁶',cat:'noble gas'},
    {n:19,sym:'K',name:'Potassium',mass:39.098,cfg:'[Ar]4s¹',cat:'alkali metal'},
    {n:20,sym:'Ca',name:'Calcium',mass:40.078,cfg:'[Ar]4s²',cat:'alkaline earth'},
    {n:21,sym:'Sc',name:'Scandium',mass:44.956,cfg:'[Ar]3d¹4s²',cat:'transition metal'},
    {n:22,sym:'Ti',name:'Titanium',mass:47.867,cfg:'[Ar]3d²4s²',cat:'transition metal'},
    {n:23,sym:'V',name:'Vanadium',mass:50.942,cfg:'[Ar]3d³4s²',cat:'transition metal'},
    {n:24,sym:'Cr',name:'Chromium',mass:51.996,cfg:'[Ar]3d⁵4s¹',cat:'transition metal'},
    {n:25,sym:'Mn',name:'Manganese',mass:54.938,cfg:'[Ar]3d⁵4s²',cat:'transition metal'},
    {n:26,sym:'Fe',name:'Iron',mass:55.845,cfg:'[Ar]3d⁶4s²',cat:'transition metal'},
    {n:27,sym:'Co',name:'Cobalt',mass:58.933,cfg:'[Ar]3d⁷4s²',cat:'transition metal'},
    {n:28,sym:'Ni',name:'Nickel',mass:58.693,cfg:'[Ar]3d⁸4s²',cat:'transition metal'},
    {n:29,sym:'Cu',name:'Copper',mass:63.546,cfg:'[Ar]3d¹⁰4s¹',cat:'transition metal'},
    {n:30,sym:'Zn',name:'Zinc',mass:65.409,cfg:'[Ar]3d¹⁰4s²',cat:'transition metal'},
    {n:31,sym:'Ga',name:'Gallium',mass:69.723,cfg:'[Ar]3d¹⁰4s²4p¹',cat:'post-transition metal'},
    {n:32,sym:'Ge',name:'Germanium',mass:72.640,cfg:'[Ar]3d¹⁰4s²4p²',cat:'metalloid'},
    {n:33,sym:'As',name:'Arsenic',mass:74.922,cfg:'[Ar]3d¹⁰4s²4p³',cat:'metalloid'},
    {n:34,sym:'Se',name:'Selenium',mass:78.960,cfg:'[Ar]3d¹⁰4s²4p⁴',cat:'nonmetal'},
    {n:35,sym:'Br',name:'Bromine',mass:79.904,cfg:'[Ar]3d¹⁰4s²4p⁵',cat:'halogen'},
    {n:36,sym:'Kr',name:'Krypton',mass:83.798,cfg:'[Ar]3d¹⁰4s²4p⁶',cat:'noble gas'},
    {n:37,sym:'Rb',name:'Rubidium',mass:85.468,cfg:'[Kr]5s¹',cat:'alkali metal'},
    {n:38,sym:'Sr',name:'Strontium',mass:87.620,cfg:'[Kr]5s²',cat:'alkaline earth'},
    {n:39,sym:'Y',name:'Yttrium',mass:88.906,cfg:'[Kr]4d¹5s²',cat:'transition metal'},
    {n:40,sym:'Zr',name:'Zirconium',mass:91.224,cfg:'[Kr]4d²5s²',cat:'transition metal'},
    {n:41,sym:'Nb',name:'Niobium',mass:92.906,cfg:'[Kr]4d⁴5s¹',cat:'transition metal'},
    {n:42,sym:'Mo',name:'Molybdenum',mass:95.940,cfg:'[Kr]4d⁵5s¹',cat:'transition metal'},
    {n:43,sym:'Tc',name:'Technetium',mass:98.000,cfg:'[Kr]4d⁵5s²',cat:'transition metal'},
    {n:44,sym:'Ru',name:'Ruthenium',mass:101.070,cfg:'[Kr]4d⁷5s¹',cat:'transition metal'},
    {n:45,sym:'Rh',name:'Rhodium',mass:102.906,cfg:'[Kr]4d⁸5s¹',cat:'transition metal'},
    {n:46,sym:'Pd',name:'Palladium',mass:106.420,cfg:'[Kr]4d¹⁰',cat:'transition metal'},
    {n:47,sym:'Ag',name:'Silver',mass:107.868,cfg:'[Kr]4d¹⁰5s¹',cat:'transition metal'},
    {n:48,sym:'Cd',name:'Cadmium',mass:112.411,cfg:'[Kr]4d¹⁰5s²',cat:'transition metal'},
    {n:49,sym:'In',name:'Indium',mass:114.818,cfg:'[Kr]4d¹⁰5s²5p¹',cat:'post-transition metal'},
    {n:50,sym:'Sn',name:'Tin',mass:118.710,cfg:'[Kr]4d¹⁰5s²5p²',cat:'post-transition metal'},
    {n:51,sym:'Sb',name:'Antimony',mass:121.760,cfg:'[Kr]4d¹⁰5s²5p³',cat:'metalloid'},
    {n:52,sym:'Te',name:'Tellurium',mass:127.600,cfg:'[Kr]4d¹⁰5s²5p⁴',cat:'metalloid'},
    {n:53,sym:'I',name:'Iodine',mass:126.905,cfg:'[Kr]4d¹⁰5s²5p⁵',cat:'halogen'},
    {n:54,sym:'Xe',name:'Xenon',mass:131.293,cfg:'[Kr]4d¹⁰5s²5p⁶',cat:'noble gas'},
    {n:55,sym:'Cs',name:'Caesium',mass:132.906,cfg:'[Xe]6s¹',cat:'alkali metal'},
    {n:56,sym:'Ba',name:'Barium',mass:137.327,cfg:'[Xe]6s²',cat:'alkaline earth'},
    {n:57,sym:'La',name:'Lanthanum',mass:138.906,cfg:'[Xe]5d¹6s²',cat:'lanthanide'},
    {n:58,sym:'Ce',name:'Cerium',mass:140.116,cfg:'[Xe]4f¹5d¹6s²',cat:'lanthanide'},
    {n:59,sym:'Pr',name:'Praseodymium',mass:140.908,cfg:'[Xe]4f³6s²',cat:'lanthanide'},
    {n:60,sym:'Nd',name:'Neodymium',mass:144.243,cfg:'[Xe]4f⁴6s²',cat:'lanthanide'},
    {n:61,sym:'Pm',name:'Promethium',mass:145.000,cfg:'[Xe]4f⁵6s²',cat:'lanthanide'},
    {n:62,sym:'Sm',name:'Samarium',mass:150.362,cfg:'[Xe]4f⁶6s²',cat:'lanthanide'},
    {n:63,sym:'Eu',name:'Europium',mass:151.964,cfg:'[Xe]4f⁷6s²',cat:'lanthanide'},
    {n:64,sym:'Gd',name:'Gadolinium',mass:157.250,cfg:'[Xe]4f⁷5d¹6s²',cat:'lanthanide'},
    {n:65,sym:'Tb',name:'Terbium',mass:158.925,cfg:'[Xe]4f⁹6s²',cat:'lanthanide'},
    {n:66,sym:'Dy',name:'Dysprosium',mass:162.500,cfg:'[Xe]4f¹⁰6s²',cat:'lanthanide'},
    {n:67,sym:'Ho',name:'Holmium',mass:164.930,cfg:'[Xe]4f¹¹6s²',cat:'lanthanide'},
    {n:68,sym:'Er',name:'Erbium',mass:167.259,cfg:'[Xe]4f¹²6s²',cat:'lanthanide'},
    {n:69,sym:'Tm',name:'Thulium',mass:168.934,cfg:'[Xe]4f¹³6s²',cat:'lanthanide'},
    {n:70,sym:'Yb',name:'Ytterbium',mass:173.054,cfg:'[Xe]4f¹⁴6s²',cat:'lanthanide'},
    {n:71,sym:'Lu',name:'Lutetium',mass:174.967,cfg:'[Xe]4f¹⁴5d¹6s²',cat:'lanthanide'},
    {n:72,sym:'Hf',name:'Hafnium',mass:178.490,cfg:'[Xe]4f¹⁴5d²6s²',cat:'transition metal'},
    {n:73,sym:'Ta',name:'Tantalum',mass:180.948,cfg:'[Xe]4f¹⁴5d³6s²',cat:'transition metal'},
    {n:74,sym:'W',name:'Tungsten',mass:183.840,cfg:'[Xe]4f¹⁴5d⁴6s²',cat:'transition metal'},
    {n:75,sym:'Re',name:'Rhenium',mass:186.207,cfg:'[Xe]4f¹⁴5d⁵6s²',cat:'transition metal'},
    {n:76,sym:'Os',name:'Osmium',mass:190.230,cfg:'[Xe]4f¹⁴5d⁶6s²',cat:'transition metal'},
    {n:77,sym:'Ir',name:'Iridium',mass:192.217,cfg:'[Xe]4f¹⁴5d⁷6s²',cat:'transition metal'},
    {n:78,sym:'Pt',name:'Platinum',mass:195.084,cfg:'[Xe]4f¹⁴5d⁹6s¹',cat:'transition metal'},
    {n:79,sym:'Au',name:'Gold',mass:196.967,cfg:'[Xe]4f¹⁴5d¹⁰6s¹',cat:'transition metal'},
    {n:80,sym:'Hg',name:'Mercury',mass:200.590,cfg:'[Xe]4f¹⁴5d¹⁰6s²',cat:'transition metal'},
    {n:81,sym:'Tl',name:'Thallium',mass:204.383,cfg:'[Xe]4f¹⁴5d¹⁰6s²6p¹',cat:'post-transition metal'},
    {n:82,sym:'Pb',name:'Lead',mass:207.200,cfg:'[Xe]4f¹⁴5d¹⁰6s²6p²',cat:'post-transition metal'},
    {n:83,sym:'Bi',name:'Bismuth',mass:208.980,cfg:'[Xe]4f¹⁴5d¹⁰6s²6p³',cat:'post-transition metal'},
    {n:84,sym:'Po',name:'Polonium',mass:209.000,cfg:'[Xe]4f¹⁴5d¹⁰6s²6p⁴',cat:'post-transition metal'},
    {n:85,sym:'At',name:'Astatine',mass:210.000,cfg:'[Xe]4f¹⁴5d¹⁰6s²6p⁵',cat:'halogen'},
    {n:86,sym:'Rn',name:'Radon',mass:222.000,cfg:'[Xe]4f¹⁴5d¹⁰6s²6p⁶',cat:'noble gas'},
    {n:87,sym:'Fr',name:'Francium',mass:223.000,cfg:'[Rn]7s¹',cat:'alkali metal'},
    {n:88,sym:'Ra',name:'Radium',mass:226.000,cfg:'[Rn]7s²',cat:'alkaline earth'},
    {n:89,sym:'Ac',name:'Actinium',mass:227.000,cfg:'[Rn]6d¹7s²',cat:'actinide'},
    {n:90,sym:'Th',name:'Thorium',mass:232.038,cfg:'[Rn]6d²7s²',cat:'actinide'},
    {n:91,sym:'Pa',name:'Protactinium',mass:231.036,cfg:'[Rn]5f²6d¹7s²',cat:'actinide'},
    {n:92,sym:'U',name:'Uranium',mass:238.029,cfg:'[Rn]5f³6d¹7s²',cat:'actinide'},
    {n:93,sym:'Np',name:'Neptunium',mass:237.000,cfg:'[Rn]5f⁴6d¹7s²',cat:'actinide'},
    {n:94,sym:'Pu',name:'Plutonium',mass:244.000,cfg:'[Rn]5f⁶7s²',cat:'actinide'},
    {n:95,sym:'Am',name:'Americium',mass:243.000,cfg:'[Rn]5f⁷7s²',cat:'actinide'},
    {n:96,sym:'Cm',name:'Curium',mass:247.000,cfg:'[Rn]5f⁷6d¹7s²',cat:'actinide'},
    {n:97,sym:'Bk',name:'Berkelium',mass:247.000,cfg:'[Rn]5f⁹7s²',cat:'actinide'},
    {n:98,sym:'Cf',name:'Californium',mass:251.000,cfg:'[Rn]5f¹⁰7s²',cat:'actinide'},
    {n:99,sym:'Es',name:'Einsteinium',mass:252.000,cfg:'[Rn]5f¹¹7s²',cat:'actinide'},
    {n:100,sym:'Fm',name:'Fermium',mass:257.000,cfg:'[Rn]5f¹²7s²',cat:'actinide'},
    {n:101,sym:'Md',name:'Mendelevium',mass:258.000,cfg:'[Rn]5f¹³7s²',cat:'actinide'},
    {n:102,sym:'No',name:'Nobelium',mass:259.000,cfg:'[Rn]5f¹⁴7s²',cat:'actinide'},
    {n:103,sym:'Lr',name:'Lawrencium',mass:262.000,cfg:'[Rn]5f¹⁴7s²7p¹',cat:'actinide'},
    {n:104,sym:'Rf',name:'Rutherfordium',mass:267.000,cfg:'[Rn]5f¹⁴6d²7s²',cat:'transition metal'},
    {n:105,sym:'Db',name:'Dubnium',mass:268.000,cfg:'[Rn]5f¹⁴6d³7s²',cat:'transition metal'},
    {n:106,sym:'Sg',name:'Seaborgium',mass:271.000,cfg:'[Rn]5f¹⁴6d⁴7s²',cat:'transition metal'},
    {n:107,sym:'Bh',name:'Bohrium',mass:272.000,cfg:'[Rn]5f¹⁴6d⁵7s²',cat:'transition metal'},
    {n:108,sym:'Hs',name:'Hassium',mass:270.000,cfg:'[Rn]5f¹⁴6d⁶7s²',cat:'transition metal'},
    {n:109,sym:'Mt',name:'Meitnerium',mass:276.000,cfg:'[Rn]5f¹⁴6d⁷7s²',cat:'transition metal'},
    {n:110,sym:'Ds',name:'Darmstadtium',mass:281.000,cfg:'[Rn]5f¹⁴6d⁸7s²',cat:'transition metal'},
    {n:111,sym:'Rg',name:'Roentgenium',mass:280.000,cfg:'[Rn]5f¹⁴6d⁹7s²',cat:'transition metal'},
    {n:112,sym:'Cn',name:'Copernicium',mass:285.000,cfg:'[Rn]5f¹⁴6d¹⁰7s²',cat:'transition metal'},
    {n:113,sym:'Nh',name:'Nihonium',mass:284.000,cfg:'[Rn]5f¹⁴6d¹⁰7s²7p¹',cat:'post-transition metal'},
    {n:114,sym:'Fl',name:'Flerovium',mass:289.000,cfg:'[Rn]5f¹⁴6d¹⁰7s²7p²',cat:'post-transition metal'},
    {n:115,sym:'Mc',name:'Moscovium',mass:288.000,cfg:'[Rn]5f¹⁴6d¹⁰7s²7p³',cat:'post-transition metal'},
    {n:116,sym:'Lv',name:'Livermorium',mass:293.000,cfg:'[Rn]5f¹⁴6d¹⁰7s²7p⁴',cat:'post-transition metal'},
    {n:117,sym:'Ts',name:'Tennessine',mass:294.000,cfg:'[Rn]5f¹⁴6d¹⁰7s²7p⁵',cat:'halogen'},
    {n:118,sym:'Og',name:'Oganesson',mass:294.000,cfg:'[Rn]5f¹⁴6d¹⁰7s²7p⁶',cat:'noble gas'}
  ];

  const periods = [1,2,3,4,5,6,7];
  const groups = Array.from({length:18},(_,i)=>i+1);

  const getPos = (el) => {
    if (el.n>=57 && el.n<=71) return null;
    if (el.n>=89 && el.n<=103) return null;
    let row=0;
    if(el.n<=2) row=1;
    else if(el.n<=10) row=2;
    else if(el.n<=18) row=3;
    else if(el.n<=36) row=4;
    else if(el.n<=54) row=5;
    else if(el.n<=86) row=6;
    else row=7;
    const pg = {1:[1,18],2:[1,2,13,14,15,16,17,18],3:[1,2,13,14,15,16,17,18],4:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],5:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],6:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],7:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]};
    const groups = pg[row];
    const elemsInRow = elements.filter(e=>{const p=getPeriod(e.n); return p===row && (e.n<57||e.n>71) && (e.n<89||e.n>103)}).sort((a,b)=>a.n-b.n);
    const idx = elemsInRow.findIndex(e=>e.n===el.n);
    if(idx===-1)return null;
    return {row, col: groups[idx]};
  };

  const getPeriod = (n) => {
    if(n<=2)return 1; if(n<=10)return 2; if(n<=18)return 3;
    if(n<=36)return 4; if(n<=54)return 5; if(n<=86)return 6;
    return 7;
  };

  const lanthanides = elements.filter(e=>e.n>=57&&e.n<=71);
  const actinides = elements.filter(e=>e.n>=89&&e.n<=103);

  const cellW = 56, cellH = 52;

  return (
    <div style={{width:'100%',height:'100%',background:'#0B1120',color:'#e2e8f0',fontFamily:'monospace',overflow:'auto',padding:'12px',border:'1px solid rgba(34, 211, 238, 0.15)',boxShadow:'0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'}}>
      <div style={{fontSize:'13px',fontWeight:'bold',marginBottom:'8px',color:'#58a6ff'}}>Periodic Table of Elements</div>
      <div style={{position:'relative',minWidth:cellW*18+40,minHeight:cellH*9+60}}>
        {elements.map(el=>{
          const pos = getPos(el);
          if(!pos)return null;
          const color = categoryColors[el.cat]||'#555';
          const isHov = hovered===el.n;
          return (
            <div key={el.n}
              onClick={()=>setSelected(el)}
              onMouseEnter={()=>setHovered(el.n)}
              onMouseLeave={()=>setHovered(null)}
              style={{position:'absolute',left:10+(pos.col-1)*(cellW+2),top:8+(pos.row-1)*(cellH+2),width:cellW,height:cellH,background:isHov?color:color+'44',border:`1px solid ${color}`,borderRadius:'4px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',transition:'0.15s',transform:isHov?'scale(1.12)':'scale(1)',zIndex:isHov?10:1,fontSize:'10px'}}>
              <span style={{fontSize:'9px',opacity:0.7,position:'absolute',top:2,left:4}}>{el.n}</span>
              <span style={{fontSize:'14px',fontWeight:'bold'}}>{el.sym}</span>
              <span style={{fontSize:'8px',opacity:0.8}}>{el.mass.toFixed(2)}</span>
            </div>
          );
        })}
        <div style={{position:'absolute',left:10,top:8+7*(cellH+2)+8,fontSize:'10px',color:'#94a3b8',marginTop:'4px'}}>Lanthanides</div>
        <div style={{position:'absolute',left:10,top:8+8*(cellH+2)+8,fontSize:'10px',color:'#94a3b8',marginTop:'4px'}}>Actinides</div>
        {lanthanides.map((el,i)=>{
          const color = categoryColors[el.cat]||'#555';
          const isHov = hovered===el.n;
          return (
            <div key={el.n}
              onClick={()=>setSelected(el)}
              onMouseEnter={()=>setHovered(el.n)}
              onMouseLeave={()=>setHovered(null)}
              style={{position:'absolute',left:10+i*(cellW+2),top:8+7*(cellH+2)+20,width:cellW,height:cellH,background:isHov?color:color+'44',border:`1px solid ${color}`,borderRadius:'4px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',transition:'0.15s',transform:isHov?'scale(1.12)':'scale(1)',zIndex:isHov?10:1,fontSize:'10px'}}>
              <span style={{fontSize:'9px',opacity:0.7,position:'absolute',top:2,left:4}}>{el.n}</span>
              <span style={{fontSize:'14px',fontWeight:'bold'}}>{el.sym}</span>
              <span style={{fontSize:'8px',opacity:0.8}}>{el.mass.toFixed(2)}</span>
            </div>
          );
        })}
        {actinides.map((el,i)=>{
          const color = categoryColors[el.cat]||'#555';
          const isHov = hovered===el.n;
          return (
            <div key={el.n}
              onClick={()=>setSelected(el)}
              onMouseEnter={()=>setHovered(el.n)}
              onMouseLeave={()=>setHovered(null)}
              style={{position:'absolute',left:10+i*(cellW+2),top:8+8*(cellH+2)+20,width:cellW,height:cellH,background:isHov?color:color+'44',border:`1px solid ${color}`,borderRadius:'4px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',transition:'0.15s',transform:isHov?'scale(1.12)':'scale(1)',zIndex:isHov?10:1,fontSize:'10px'}}>
              <span style={{fontSize:'9px',opacity:0.7,position:'absolute',top:2,left:4}}>{el.n}</span>
              <span style={{fontSize:'14px',fontWeight:'bold'}}>{el.sym}</span>
              <span style={{fontSize:'8px',opacity:0.8}}>{el.mass.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
      {selected && (
        <div style={{marginTop:'12px',padding:'12px',background:'#0f172a',border:'1px solid rgba(148, 163, 184, 0.08)',borderRadius:'8px',fontSize:'13px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <span style={{fontSize:'28px',fontWeight:'bold',color:categoryColors[selected.cat]}}>{selected.sym}</span>
            <div>
              <div style={{fontSize:'16px',fontWeight:'bold'}}>{selected.name}</div>
              <div style={{color:'#94a3b8'}}>Atomic Number: {selected.n} | Mass: {selected.mass.toFixed(2)}</div>
              <div style={{color:'#94a3b8'}}>Configuration: {selected.cfg} | {selected.cat}</div>
            </div>
          </div>
        </div>
      )}
      <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginTop:'10px',fontSize:'10px'}}>
        {Object.entries(categoryColors).map(([cat,color])=>
          <span key={cat} style={{display:'flex',alignItems:'center',gap:'4px'}}>
            <span style={{width:10,height:10,background:color,borderRadius:2,display:'inline-block'}}/>
            {cat}
          </span>
        )}
      </div>
    </div>
  );
}
