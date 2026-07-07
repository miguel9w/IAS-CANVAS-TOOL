function Widget({ appBus }) {
  const [active, setActive] = React.useState(false)
  const [freq, setFreq] = React.useState(440)
  const [gain, setGain] = React.useState(0)
  const containerRef = React.useRef(null)
  const ctxRef = React.useRef(null)
  const oscRef = React.useRef(null)
  const gainRef = React.useRef(null)

  const startOsc = () => {
    if (ctxRef.current) return
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    ctxRef.current = audioCtx
    const osc = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(440, audioCtx.currentTime)
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime)
    osc.connect(gainNode)
    gainNode.connect(audioCtx.destination)
    osc.start()
    oscRef.current = osc
    gainRef.current = gainNode
    setActive(true)
  }

  const stopOsc = () => {
    if (oscRef.current) {
      try { oscRef.current.stop() } catch (e) {}
      oscRef.current.disconnect()
      oscRef.current = null
    }
    if (gainRef.current) gainRef.current.disconnect()
    if (ctxRef.current) ctxRef.current.close()
    ctxRef.current = null
    gainRef.current = null
    setActive(false)
    setGain(0)
  }

  React.useEffect(() => {
    return () => {
      if (ctxRef.current) {
        try { ctxRef.current.close() } catch (e) {}
      }
    }
  }, [])

  const handleMouseMove = (e) => {
    if (!ctxRef.current || !oscRef.current || !gainRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const newFreq = 20 + x * 1980
    const newGain = Math.max(0, 1 - y) * 0.5
    oscRef.current.frequency.setValueAtTime(newFreq, ctxRef.current.currentTime)
    gainRef.current.gain.setValueAtTime(newGain, ctxRef.current.currentTime)
    setFreq(Math.round(newFreq))
    setGain(Math.round(newGain * 100))
  }

  const handleMouseEnter = () => {
    if (!active) startOsc()
  }

  const handleMouseLeave = () => {
    if (gainRef.current && ctxRef.current) {
      gainRef.current.gain.setValueAtTime(0, ctxRef.current.currentTime)
    }
    setGain(0)
  }

  return (
    <div style={{ width: '100%', height: '100%', background: '#0B1120', display: 'flex', flexDirection: 'column', fontFamily: 'monospace', color: '#94A3B8' }}>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#F472B6', fontWeight: 'bold', fontSize: 13 }}>THEREMIN</span>
        <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
          <span>{freq} Hz</span>
          <span style={{ color: gain > 0 ? '#F472B6' : '#64748B' }}>Vol: {gain}%</span>
        </div>
      </div>
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          flex: 1, cursor: 'crosshair', position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, #0B1120 0%, #1E1B4B 50%, #0B1120 100%)'
        }}
      >
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
          <defs>
            <radialGradient id="thereminGlow" cx={freq / 2000 * 100 + '%'} cy={100 - gain + '%'} r="30%">
              <stop offset="0%" stopColor={active ? '#F472B680' : 'transparent'} />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#thereminGlow)" />
        </svg>
        <div style={{
          position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex',
          justifyContent: 'space-between', fontSize: 10, color: '#475569', pointerEvents: 'none'
        }}>
          <span>X → Pitch (20-2000 Hz)</span>
          <span>Y → Volume</span>
        </div>
        {!active && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#475569', fontSize: 12, pointerEvents: 'none', textAlign: 'center' }}>
            Move mouse here to play
          </div>
        )}
      </div>
    </div>
  )
}
