function Widget({ appBus }) {
  const categories = {
    length: { units: ['mm','cm','m','km','in','ft','yd','mi'],
      conv: { mm:1, cm:10, m:1000, km:1000000, in:25.4, ft:304.8, yd:914.4, mi:1609344 } },
    mass: { units: ['mg','g','kg','t','oz','lb'],
      conv: { mg:1, g:1000, kg:1000000, t:1000000000, oz:28349.5, lb:453592 } },
    volume: { units: ['mL','L','gal','qt','pt','cup','fl oz'],
      conv: { 'mL':1, 'L':1000, 'gal':3785.41, 'qt':946.353, 'pt':473.176, 'cup':236.588, 'fl oz':29.5735 } },
    temperature: { units: ['°C','°F','K'], isSpecial: true },
    speed: { units: ['m/s','km/h','mph','ft/s','kn'],
      conv: { 'm/s':1, 'km/h':3.6, 'mph':2.23694, 'ft/s':3.28084, 'kn':1.94384 } }
  };

  const [cat, setCat] = React.useState('length');
  const [fromUnit, setFromUnit] = React.useState('m');
  const [toUnit, setToUnit] = React.useState('ft');
  const [fromVal, setFromVal] = React.useState('1');
  const [toVal, setToVal] = React.useState('');

  React.useEffect(() => {
    const c = categories[cat];
    const units = c.units;
    if (!units.includes(fromUnit)) setFromUnit(units[0]);
    if (!units.includes(toUnit)) setToUnit(units[1] || units[0]);
  }, [cat]);

  React.useEffect(() => {
    const c = categories[cat];
    const v = parseFloat(fromVal);
    if (isNaN(v)) { setToVal(''); return; }
    if (c.isSpecial) {
      if (fromUnit === '°C' && toUnit === '°F') setToVal((v * 9/5 + 32).toFixed(2));
      else if (fromUnit === '°C' && toUnit === 'K') setToVal((v + 273.15).toFixed(2));
      else if (fromUnit === '°F' && toUnit === '°C') setToVal(((v - 32) * 5/9).toFixed(2));
      else if (fromUnit === '°F' && toUnit === 'K') setToVal(((v - 32) * 5/9 + 273.15).toFixed(2));
      else if (fromUnit === 'K' && toUnit === '°C') setToVal((v - 273.15).toFixed(2));
      else if (fromUnit === 'K' && toUnit === '°F') setToVal(((v - 273.15) * 9/5 + 32).toFixed(2));
      else setToVal(v);
    } else {
      const base = v * c.conv[fromUnit];
      const result = base / c.conv[toUnit];
      setToVal(result < 0.001 ? result.toExponential(4) : result.toFixed(6));
    }
  }, [cat, fromUnit, toUnit, fromVal]);

  const containerStyle = {
    background: '#0B1120', padding: '16px', borderRadius: '8px',
    fontFamily: 'monospace', color: '#e2e8f0', height: '100%', boxSizing: 'border-box',
    border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
  };
  const labelStyle = { fontSize: '11px', color: '#64748b', marginBottom: '4px', display: 'block' };
  const selectStyle = {
    background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155',
    borderRadius: '4px', padding: '6px', fontSize: '12px', width: '100%', marginBottom: '8px'
  };
  const inputStyle = {
    width: '100%', background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155',
    borderRadius: '4px', padding: '8px', fontFamily: 'monospace', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
  };

  const c = categories[cat];
  return (
    <div style={containerStyle}>
      <label style={labelStyle}>Category</label>
      <select style={selectStyle} value={cat} onChange={e => setCat(e.target.value)}>
        {Object.keys(categories).map(k => (
          <option key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</option>
        ))}
      </select>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>From</label>
          <select style={selectStyle} value={fromUnit} onChange={e => setFromUnit(e.target.value)}>
            {c.units.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>To</label>
          <select style={selectStyle} value={toUnit} onChange={e => setToUnit(e.target.value)}>
            {c.units.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>
      <label style={labelStyle}>{fromUnit}</label>
      <input type="text" value={fromVal} onChange={e => setFromVal(e.target.value)} style={inputStyle} />
      <label style={{ ...labelStyle, marginTop: '8px' }}>{toUnit}</label>
      <input type="text" readOnly value={toVal} style={{ ...inputStyle, color: '#22d3ee', background: '#0f172a' }} />
    </div>
  );
}
