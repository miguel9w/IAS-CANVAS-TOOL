function Widget({ appBus }) {
  const [count, setCount] = React.useState(3);
  const [startLorem, setStartLorem] = React.useState(true);
  const [text, setText] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  const words = [
    'lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit',
    'sed','do','eiusmod','tempor','incididunt','ut','labore','et','dolore',
    'magna','aliqua','enim','ad','minim','veniam','quis','nostrud',
    'exercitation','ullamco','laboris','nisi','aliquip','ex','ea','commodo',
    'consequat','duis','aute','irure','dolor','in','reprehenderit','voluptate',
    'velit','esse','cillum','fugiat','nulla','pariatur','excepteur','sint',
    'occaecat','cupidatat','non','proident','sunt','culpa','qui','officia',
    'deserunt','mollit','anim','id','est','laborum'
  ];

  function generate() {
    let result = '';
    for (let p = 0; p < count; p++) {
      const sentenceCount = 3 + Math.floor(Math.random() * 5);
      for (let s = 0; s < sentenceCount; s++) {
        const wordCount = 5 + Math.floor(Math.random() * 10);
        let sentence = '';
        for (let w = 0; w < wordCount; w++) {
          let word = words[Math.floor(Math.random() * words.length)];
          if (w === 0 && s === 0 && p === 0 && startLorem) {
            word = 'Lorem';
          } else if (w === 0) {
            word = word.charAt(0).toUpperCase() + word.slice(1);
          }
          sentence += word + (w < wordCount - 1 ? ' ' : '.');
        }
        result += sentence + ' ';
      }
      if (p < count - 1) result += '\n\n';
    }
    setText(result.trim());
  }

  React.useEffect(() => { generate(); }, [count, startLorem]);

  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const containerStyle = {
    background: '#0B1120', padding: '16px', borderRadius: '8px',
    border: '1px solid rgba(34, 211, 238, 0.15)',
    boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
    fontFamily: 'monospace', color: '#e2e8f0', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column'
  };
  const labelStyle = { fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' };

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: '12px' }}>
        <label style={labelStyle}>Paragraphs: {count}</label>
        <input type="range" min={1} max={20} value={count}
          onChange={e => setCount(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#22d3ee' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
          <span>1</span><span>20</span>
        </div>
      </div>
      <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '8px' }}>
        <input type="checkbox" checked={startLorem} onChange={e => setStartLorem(e.target.checked)} />
        Start with "Lorem ipsum"
      </label>
      <textarea readOnly value={text}
        style={{
          flex: 1, background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(148, 163, 184, 0.08)',
          borderRadius: '4px', padding: '8px', fontFamily: 'monospace', fontSize: '12px',
          resize: 'none', outline: 'none', lineHeight: 1.5
        }} />
      <button onClick={copy} style={{
        marginTop: '8px', alignSelf: 'flex-end',
        background: copied ? '#10b981' : '#0f172a', color: '#e2e8f0',
        border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '4px', padding: '7px 16px',
        cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'
      }}>{copied ? '✓ Copied' : 'Copy'}</button>
    </div>
  );
}
