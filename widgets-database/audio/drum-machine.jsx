function Widget({ appBus }) {
  const [playing, setPlaying] = React.useState(false)
  const [tempo, setTempo] = React.useState(120)
  const [step, setStep] = React.useState(-1)
  const [pattern, setPattern] = React.useState(() => {
    const p = {}
    ;['kick','snare','hihat','clap'].forEach(s => {
      p[s] = new Array(16).fill(false)
    })
    return p
  })
  const intervalRef = React.useRef(null)
  const ctxRef = React.useRef(null)

  const toggleCell = (sound, idx) => {
    setPattern(prev => {
      const next = { ...prev, [sound]: [...prev[sound]] }
      next[sound][idx] = !next[sound][idx]
      return next
    })
  }

  const playSound = (sound) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const now = audioCtx.currentTime
    const gain = audioCtx.createGain()
    gain.connect(audioCtx.destination)

    switch (sound) {
      case 'kick': {
        const osc = audioCtx.createOscillator()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(150, now)
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.1)
        gain.gain.setValueAtTime(0.8, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
        osc.connect(gain)
        osc.start(now)
        osc.stop(now + 0.15)
        break
      }
      case 'snare': {
        const osc = audioCtx.createOscillator()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(200, now)
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.05)
        const noise = audioCtx.createBufferSource()
        const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.05, audioCtx.sampleRate)
        const d = buf.getChannelData(0)
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3)
        noise.buffer = buf
        gain.gain.setValueAtTime(0.6, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
        osc.connect(gain)
        noise.connect(gain)
        osc.start(now)
        noise.start(now)
        osc.stop(now + 0.15)
        noise.stop(now + 0.15)
        break
      }
      case 'hihat': {
        const noise = audioCtx.createBufferSource()
        const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.05, audioCtx.sampleRate)
        const d = buf.getChannelData(0)
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 5)
        noise.buffer = buf
        const hp = audioCtx.createBiquadFilter()
        hp.type = 'highpass'
        hp.frequency.setValueAtTime(7000, now)
        gain.gain.setValueAtTime(0.3, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
        noise.connect(hp)
        hp.connect(gain)
        noise.start(now)
        noise.stop(now + 0.06)
        break
      }
      case 'clap': {
        for (let j = 0; j < 3; j++) {
          const t = now + j * 0.01
          const noise = audioCtx.createBufferSource()
          const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.03, audioCtx.sampleRate)
          const d = buf.getChannelData(0)
          for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3)
          noise.buffer = buf
          const g = audioCtx.createGain()
          g.gain.setValueAtTime(0.5, t)
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.03)
          noise.connect(g)
          g.connect(audioCtx.destination)
          noise.start(t)
          noise.stop(t + 0.03)
        }
        break
      }
    }
  }

  React.useEffect(() => {
    if (!playing) {
      setStep(-1)
      clearInterval(intervalRef.current)
      return
    }

    let s = -1
    const interval = (60 / tempo) * 1000 / 4

    intervalRef.current = setInterval(() => {
      s = (s + 1) % 16
      setStep(s)
      ;['kick','snare','hihat','clap'].forEach(sound => {
        if (pattern[sound][s]) playSound(sound)
      })
    }, interval)

    return () => clearInterval(intervalRef.current)
  }, [playing, tempo, pattern])

  const sounds = ['kick', 'snare', 'hihat', 'clap']
  const soundColors = { kick: '#60A5FA', snare: '#FBBF24', hihat: '#34D399', clap: '#F472B6' }

  return (
    <div style={{ width: '100%', height: '100%', background: '#0B1120', display: 'flex', flexDirection: 'column', fontFamily: 'monospace', color: '#94A3B8', padding: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ color: '#60A5FA', fontWeight: 'bold', fontSize: 13 }}>DRUM MACHINE</span>
        <button onClick={() => setPlaying(!playing)} style={{ background: playing ? '#EF4444' : '#60A5FA', border: 'none', borderRadius: 4, color: '#0B1120', padding: '4px 16px', fontWeight: 'bold', cursor: 'pointer', fontSize: 12 }}>
          {playing ? 'PAUSE' : 'PLAY'}
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 11 }}>
        <span>Tempo</span>
        <input type="range" min={60} max={180} value={tempo} onChange={e => setTempo(Number(e.target.value))} style={{ flex: 1, accentColor: '#60A5FA' }} />
        <span style={{ color: '#60A5FA', minWidth: 30, textAlign: 'right' }}>{tempo}</span>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 2, minHeight: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: 50, flexShrink: 0, paddingTop: 2 }}>
          {sounds.map(s => (
            <div key={s} style={{ height: 28, display: 'flex', alignItems: 'center', fontSize: 10, fontWeight: 'bold', color: soundColors[s], textTransform: 'uppercase' }}>
              {s}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sounds.map(sound => (
            <div key={sound} style={{ display: 'flex', gap: 3 }}>
              {pattern[sound].map((active, idx) => (
                <button key={idx} onClick={() => toggleCell(sound, idx)} style={{
                  flex: 1, height: 28, borderRadius: 3,
                  border: '1px solid ' + (idx === step ? '#FFFFFF' : active ? soundColors[sound] : '#1E293B'),
                  background: idx === step ? (active ? soundColors[sound] : '#334155') : (active ? soundColors[sound] + '40' : 'transparent'),
                  cursor: 'pointer', opacity: idx % 4 === 0 ? 1 : 0.7
                }} />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 6 }}>
        {[0,1,2,3].map(b => (
          <span key={b} style={{ fontSize: 9, color: step >= b * 4 && step < (b + 1) * 4 ? '#60A5FA' : '#334155', fontWeight: 'bold' }}>
            {b + 1}
          </span>
        ))}
      </div>
    </div>
  )
}
