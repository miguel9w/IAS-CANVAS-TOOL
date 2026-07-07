function Widget({ appBus }) {
  const [text, setText] = React.useState('Hello World');
  const [font, setFont] = React.useState('system-ui');
  const [size, setSize] = React.useState(48);
  const [weight, setWeight] = React.useState(400);
  const [letterSpacing, setLetterSpacing] = React.useState(0);
  const [color, setColor] = React.useState('#7c83ff');
  const [bgColor, setBgColor] = React.useState('#0f0f1a');
  const [alignment, setAlignment] = React.useState('center');
  const [lineHeight, setLineHeight] = React.useState(1.2);
  const [italic, setItalic] = React.useState(false);
  const [shadow, setShadow] = React.useState(true);

  const fontOptions = [
    { value: 'system-ui', label: 'System UI' },
    { value: 'serif', label: 'Serif' },
    { value: 'sans-serif', label: 'Sans-Serif' },
    { value: 'monospace', label: 'Monospace' },
    { value: 'cursive', label: 'Cursive' },
    { value: 'fantasy', label: 'Fantasy' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: '"Times New Roman", serif', label: 'Times New Roman' },
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: '"Courier New", monospace', label: 'Courier New' },
    { value: '"Comic Sans MS", cursive', label: 'Comic Sans' },
    { value: 'Impact, fantasy', label: 'Impact' },
    { value: '"Segoe UI", system-ui', label: 'Segoe UI' },
  ];

  const s = {
    wrap: { background: '#0B1120', color: '#e2e8f0', fontFamily: 'system-ui,sans-serif', padding: '12px', height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '8px', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' },
    h: { fontSize: '18px', fontWeight: 700, margin: '0 0 8px', color: '#7c83ff' },
    controls: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' },
    row: { display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' },
    label: { fontSize: '10px', color: '#888', minWidth: '20px' },
    inp: (flexStyle) => ({ background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '4px', color: '#e2e8f0', padding: '4px 8px', fontSize: '11px', outline: 'none', flex: flexStyle || '1', minWidth: '60px' }),
    select: { background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '4px', color: '#e2e8f0', padding: '4px 8px', fontSize: '11px', cursor: 'pointer', outline: 'none', flex: '1', minWidth: '80px' },
    range: { width: '60px', accentColor: '#7c83ff' },
    colorInp: { width: '28px', height: '28px', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: 0, background: 'transparent' },
    toggleBtn: (active) => ({ background: active ? '#7c83ff' : '#0f172a', border: '1px solid ' + (active ? '#7c83ff' : 'rgba(148, 163, 184, 0.08)'), borderRadius: '4px', color: '#94a3b8', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }),
    alignBtn: (active) => ({ background: active ? '#7c83ff' : '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '4px', color: '#94a3b8', padding: '3px 6px', fontSize: '11px', cursor: 'pointer', minWidth: '26px' }),
    preview: {
      flex: 1,
      background: bgColor,
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: alignment === 'center' ? 'center' : alignment === 'left' ? 'flex-start' : 'flex-end',
      padding: '20px',
      overflow: 'hidden',
    },
    text: {
      fontFamily: font,
      fontSize: size + 'px',
      fontWeight: weight,
      letterSpacing: letterSpacing + 'px',
      color: color,
      textAlign: alignment,
      lineHeight: lineHeight,
      fontStyle: italic ? 'italic' : 'normal',
      textShadow: shadow ? `0 2px 10px ${color}40, 0 0 30px ${color}20` : 'none',
      wordBreak: 'break-word',
      maxWidth: '100%',
    },
  };

  return (
    <div style={s.wrap}>
      <div style={s.h}>🔤 Typography</div>
      <div style={s.controls}>
        <div style={s.row}>
          <input style={s.inp('1')} placeholder="Type something..." value={text} onChange={e => setText(e.target.value)} />
        </div>
        <div style={s.row}>
          <span style={s.label}>Font</span>
          <select style={s.select} value={font} onChange={e => setFont(e.target.value)}>
            {fontOptions.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <span style={s.label}>Size</span>
          <input type="range" style={s.range} min="12" max="120" value={size} onChange={e => setSize(Number(e.target.value))} />
          <span style={{fontSize:'10px',color:'#666',minWidth:'30px'}}>{size}px</span>
        </div>
        <div style={s.row}>
          <span style={s.label}>Wt</span>
          <input type="range" style={s.range} min="100" max="900" step="100" value={weight} onChange={e => setWeight(Number(e.target.value))} />
          <span style={{fontSize:'10px',color:'#666',minWidth:'24px'}}>{weight}</span>
          <span style={s.label}>LS</span>
          <input type="range" style={s.range} min="-5" max="20" step="0.5" value={letterSpacing} onChange={e => setLetterSpacing(Number(e.target.value))} />
          <span style={{fontSize:'10px',color:'#666',minWidth:'24px'}}>{letterSpacing}</span>
          <span style={s.label}>LH</span>
          <input type="range" style={s.range} min="0.8" max="3" step="0.1" value={lineHeight} onChange={e => setLineHeight(Number(e.target.value))} />
        </div>
        <div style={s.row}>
          <input type="color" style={s.colorInp} value={color} onChange={e => setColor(e.target.value)} />
          <span style={{fontSize:'10px',color:'#666'}}>Text</span>
          <input type="color" style={s.colorInp} value={bgColor} onChange={e => setBgColor(e.target.value)} />
          <span style={{fontSize:'10px',color:'#666'}}>Bg</span>
          <button style={s.alignBtn(alignment === 'left')} onClick={() => setAlignment('left')}>⫷</button>
          <button style={s.alignBtn(alignment === 'center')} onClick={() => setAlignment('center')}>⫿</button>
          <button style={s.alignBtn(alignment === 'right')} onClick={() => setAlignment('right')}>⫸</button>
          <button style={s.toggleBtn(italic)} onClick={() => setItalic(!italic)}>I</button>
          <button style={s.toggleBtn(shadow)} onClick={() => setShadow(!shadow)}>S</button>
        </div>
      </div>
      <div style={s.preview}>
        <div style={s.text}>{text || 'Type something...'}</div>
      </div>
    </div>
  );
}
