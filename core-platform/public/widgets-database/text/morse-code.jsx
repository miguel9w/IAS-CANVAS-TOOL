function Widget({ appBus }) {
  const [input, setInput] = React.useState('');
  const [output, setOutput] = React.useState('');
  const [mode, setMode] = React.useState('text-to-morse');
  const [playing, setPlaying] = React.useState(false);
  const ctxRef = React.useRef(null);

  const morseMap = {
    'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....',
    'I':'..','J':'.---','K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.',
    'Q':'--.-','R':'.-.','S':'...','T':'-','U':'..-','V':'...-','W':'.--','X':'-..-',
    'Y':'-.--','Z':'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-',
    '5':'.....','6':'-....','7':'--...','8':'---..','9':'----.','.':'.-.-.-',',':'--..--',
    '?':'..--..',"'":'.----.','!':'-.-.--','/':'-..-.','(':'-.--.',')':'-.--.-',
    '&':'.-...',':':'---...',';':'-.-.-.','=':'-...-','+':'.-.-.','-':'-....-',
    '_':'..--.-','"':'.-..-.','$':'...-..-','@':'.--.-.'
  };
  const reverseMap = Object.fromEntries(Object.entries(morseMap).map(([k, v]) => [v, k]));

  React.useEffect(() => {
    if (mode === 'text-to-morse') {
      const upper = input.toUpperCase();
      let result = '';
      for (const ch of upper) {
        if (ch === ' ') result += '  ';
        else if (morseMap[ch]) result += morseMap[ch] + ' ';
        else result += ch + ' ';
      }
      setOutput(result.trim());
    } else {
      const words = input.split('   ');
      let result = '';
      for (const word of words) {
        const letters = word.split(' ');
        for (const l of letters) {
          if (reverseMap[l]) result += reverseMap[l];
          else if (l === '') result += ' ';
          else result += l;
        }
        result += ' ';
      }
      setOutput(result.trim());
    }
  }, [input, mode]);

  function playMorse() {
    if (playing || !output) return;
    setPlaying(true);
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = ctx;
    const dot = 0.08;
    const freq = 700;
    let time = ctx.currentTime + 0.1;
    const seq = output;
    let i = 0;

    function scheduleNext() {
      if (i >= seq.length || !ctxRef.current) { setPlaying(false); return; }
      const ch = seq[i];
      if (ch === '.') {
        playTone(ctx, freq, time, dot);
        time += dot * 1.5;
      } else if (ch === '-') {
        playTone(ctx, freq, time, dot * 3);
        time += dot * 1.5;
      } else if (ch === ' ') {
        time += dot * 1.5;
      }
      i++;
      setTimeout(scheduleNext, (time - ctx.currentTime) * 1000);
    }
    scheduleNext();
  }

  function playTone(ctx, freq, time, dur) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + dur + 0.01);
  }

  function stopPlayback() {
    if (ctxRef.current) { ctxRef.current.close(); ctxRef.current = null; }
    setPlaying(false);
  }

  const containerStyle = {
    background: '#0B1120', padding: '16px', borderRadius: '8px',
    border: '1px solid rgba(34, 211, 238, 0.15)',
    boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
    fontFamily: 'monospace', color: '#e2e8f0', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column'
  };
  const btn = {
    background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(148, 163, 184, 0.08)',
    borderRadius: '4px', padding: '7px 16px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'
  };
  const activeBtn = { ...btn, background: '#22d3ee', color: '#0B1120', borderColor: '#22d3ee' };

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
        <button style={mode === 'text-to-morse' ? activeBtn : btn} onClick={() => { setMode('text-to-morse'); setInput(''); setOutput(''); }}>
          Text → Morse
        </button>
        <button style={mode === 'morse-to-text' ? activeBtn : btn} onClick={() => { setMode('morse-to-text'); setInput(''); setOutput(''); }}>
          Morse → Text
        </button>
      </div>
      <textarea value={input} onChange={e => setInput(e.target.value)}
        placeholder={mode === 'text-to-morse' ? 'Enter text...' : 'Enter morse code (spaces between letters, 3 spaces between words)...'}
        style={{
          width: '100%', minHeight: '60px', background: '#0f172a', color: '#e2e8f0',
          border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '4px', padding: '8px',
          fontFamily: 'monospace', fontSize: '12px', resize: 'vertical', outline: 'none', marginBottom: '8px'
        }} />
      <textarea readOnly value={output}
        style={{
          width: '100%', flex: 1, background: '#0f172a', color: '#22d3ee',
          border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '4px', padding: '8px',
          fontFamily: 'monospace', fontSize: '12px', resize: 'none', outline: 'none', marginBottom: '8px'
        }} />
      {output && mode === 'text-to-morse' && (
        <button onClick={playing ? stopPlayback : playMorse} style={{
          ...btn, background: playing ? '#ef4444' : '#0f172a', alignSelf: 'flex-start'
        }}>
          {playing ? '■ Stop' : '▶ Play Morse'}
        </button>
      )}
    </div>
  );
}
