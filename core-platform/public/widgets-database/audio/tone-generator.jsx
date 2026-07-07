function Widget({ appBus }) {
  const [playing, setPlaying] = React.useState(false)
  const [freq, setFreq] = React.useState(440)
  const [volume, setVolume] = React.useState(0.3)
  const [waveform, setWaveform] = React.useState('sine')
  const oscRef = React.useRef(null)
  const gainRef = React.useRef(null)
  const ctxRef = React.useRef(null)

  const stop = () => {
    if (oscRef.current) {
      try { oscRef.current.stop() } catch (e) {}
      oscRef.current.disconnect()
      oscRef.current = null
    }
    setPlaying(false)
  }

  const play = () => {
    stop()
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    ctxRef.current = audioCtx
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = waveform
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime)
    gain.gain.setValueAtTime(volume, audioCtx.currentTime)
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start()
    oscRef.current = osc
    gainRef.current = gain
    setPlaying(true)
  }

  const toggle = () => playing ? stop() : play()

  React.useEffect(() => {
    if (oscRef.current && ctxRef.current) {
      oscRef.current.frequency.setValueAtTime(freq, ctxRef.current.currentTime)
    }
  }, [freq])

  React.useEffect(() => {
    if (gainRef.current && ctxRef.current) {
      gainRef.current.gain.setValueAtTime(volume, ctxRef.current.currentTime)
    }
  }, [volume])

  React.useEffect(() => {
    if (oscRef.current && ctxRef.current) {
      oscRef.current.type = waveform
    }
  }, [waveform])

  React.useEffect(() => {
    return () => stop()
  }, [])

  const waves = ['sine', 'square', 'sawtooth', 'triangle']

  return (
    <div style={{ width: '100%', height: '100%', background: '#0B1120', display: 'flex', flexDirection: 'column', fontFamily: 'monospace', color: '#94A3B8', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ color: '#A78BFA', fontWeight: 'bold', fontSize: 13 }}>TONE GENERATOR</span>
        <button onClick={toggle} style={{ background: playing ? '#EF4444' : '#A78BFA', border: 'none', borderRadius: 4, color: '#0B1120', padding: '6px 20px', fontWeight: 'bold', cursor: 'pointer', fontSize: 13 }}>
          {playing ? 'STOP' : 'PLAY'}
        </button>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
          <span>Frequency</span>
          <span style={{ color: '#A78BFA' }}>{freq} Hz</span>
        </div>
        <input type="range" min={20} max={2000} value={freq} onChange={e => setFreq(Number(e.target.value))} style={{ width: '100%', accentColor: '#A78BFA' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#475569' }}>
          <span>20 Hz</span>
          <span>2000 Hz</span>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
          <span>Volume</span>
          <span style={{ color: '#A78BFA' }}>{Math.round(volume * 100)}%</span>
        </div>
        <input type="range" min={0} max={1} step={0.01} value={volume} onChange={e => setVolume(Number(e.target.value))} style={{ width: '100%', accentColor: '#A78BFA' }} />
      </div>

      <div>
        <div style={{ fontSize: 11, marginBottom: 6 }}>Waveform</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {waves.map(w => (
            <button key={w} onClick={() => setWaveform(w)} style={{
              flex: 1, padding: '6px 0', borderRadius: 4, border: waveform === w ? '2px solid #A78BFA' : '1px solid #334155',
              background: waveform === w ? '#1E1B4B' : 'transparent', color: waveform === w ? '#A78BFA' : '#64748B',
              cursor: 'pointer', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase'
            }}>
              {w}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
