function Widget({ appBus }) {
  const [playing, setPlaying] = React.useState(false)
  const [tempo, setTempo] = React.useState(100)
  const [step, setStep] = React.useState(-1)
  const [pitches, setPitches] = React.useState(() => {
    const notes = ['C4','C#4','D4','D#4','E4','F4','F#4','G4','G#4','A4','A#4','B4','C5']
    const base = ['C4','D4','E4','F4','G4','A4','B4','C5']
    return base.map(n => notes.indexOf(n))
  })
  const intervalRef = React.useRef(null)
  const activeOscsRef = React.useRef([])

  const noteNames = ['C4','C#4','D4','D#4','E4','F4','F#4','G4','G#4','A4','A#4','B4','C5']
  const noteFreqs = [261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392.00, 415.30, 440.00, 466.16, 493.88, 523.25]

  const playNote = (noteIdx) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(noteFreqs[noteIdx], audioCtx.currentTime)
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2)
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start()
    osc.stop(audioCtx.currentTime + 0.2)
    activeOscsRef.current.push(osc)
    setTimeout(() => {
      activeOscsRef.current = activeOscsRef.current.filter(o => o !== osc)
    }, 250)
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
      if (activeOscsRef.current.length > 8) return
      s = (s + 1) % 8
      setStep(s)
      playNote(pitches[s])
    }, interval)

    return () => clearInterval(intervalRef.current)
  }, [playing, tempo, pitches])

  React.useEffect(() => {
    return () => {
      clearInterval(intervalRef.current)
      activeOscsRef.current.forEach(o => {
        try { o.stop() } catch (e) {}
        try { o.disconnect() } catch (e) {}
      })
    }
  }, [])

  const updatePitch = (idx, dir) => {
    setPitches(prev => {
      const next = [...prev]
      next[idx] = Math.max(0, Math.min(12, next[idx] + dir))
      return next
    })
  }

  return (
    <div style={{ width: '100%', height: '100%', background: '#0B1120', display: 'flex', flexDirection: 'column', fontFamily: 'monospace', color: '#94A3B8', padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ color: '#34D399', fontWeight: 'bold', fontSize: 13 }}>STEP SEQUENCER</span>
        <button onClick={() => setPlaying(!playing)} style={{ background: playing ? '#EF4444' : '#34D399', border: 'none', borderRadius: 4, color: '#0B1120', padding: '4px 16px', fontWeight: 'bold', cursor: 'pointer', fontSize: 12 }}>
          {playing ? 'STOP' : 'PLAY'}
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 11 }}>
        <span>Tempo</span>
        <input type="range" min={60} max={180} value={tempo} onChange={e => setTempo(Number(e.target.value))} style={{ flex: 1, accentColor: '#34D399' }} />
        <span style={{ color: '#34D399', minWidth: 30, textAlign: 'right' }}>{tempo}</span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: step === i-1 ? '#34D399' : '#334155', fontWeight: 'bold' }}>
              {i}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {pitches.map((p, idx) => (
            <div key={idx} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              background: step === idx ? '#064E3B' : 'transparent', borderRadius: 6, padding: '4px 2px',
              border: step === idx ? '1px solid #34D399' : '1px solid transparent'
            }}>
              <button onClick={() => updatePitch(idx, 1)} style={{
                width: 24, height: 18, border: '1px solid #334155', background: '#1E293B',
                borderRadius: 3, cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#64748B', fontSize: 11, lineHeight: 1
              }}>&#9650;</button>
              <div style={{
                width: '100%', textAlign: 'center', fontSize: 10, fontWeight: 'bold',
                color: step === idx ? '#34D399' : '#94A3B8', padding: '2px 0', whiteSpace: 'nowrap'
              }}>
                {noteNames[p]}
              </div>
              <button onClick={() => updatePitch(idx, -1)} style={{
                width: 24, height: 18, border: '1px solid #334155', background: '#1E293B',
                borderRadius: 3, cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#64748B', fontSize: 11, lineHeight: 1
              }}>&#9660;</button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 8, textAlign: 'center', fontSize: 9, color: '#475569' }}>
        Triangle wave • C4–C5 • {tempo} BPM
      </div>
    </div>
  )
}
