function Widget({ appBus }) {
  const [freq, setFreq] = React.useState(440)
  const [vol, setVol] = React.useState(0.3)
  const [expr, setExpr] = React.useState('Math.sin(x)')
  const [exprError, setExprError] = React.useState(null)
  const [playing, setPlaying] = React.useState(false)

  const canvasRef = React.useRef(null)
  const rafRef = React.useRef(null)
  const ctxRef = React.useRef(null)
  const srcRef = React.useRef(null)
  const gainRef = React.useRef(null)
  const analyserRef = React.useRef(null)
  const bufRef = React.useRef(null)

  const BASE_FREQ = 440

  const compileFn = React.useCallback((e) => {
    try {
      const fn = new Function('x', 'return (' + e + ')')
      fn(0)
      return fn
    } catch (err) {
      return null
    }
  }, [])

  const generateBuffer = React.useCallback((audioCtx, fn) => {
    const sampleCount = Math.round(audioCtx.sampleRate / BASE_FREQ)
    const buffer = audioCtx.createBuffer(1, sampleCount, audioCtx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < sampleCount; i++) {
      data[i] = fn((i / sampleCount) * 2 * Math.PI)
    }
    return buffer
  }, [])

  const rebuildSrc = React.useCallback(() => {
    const ctx = ctxRef.current
    if (!ctx || !bufRef.current) return
    if (srcRef.current) {
      try { srcRef.current.stop() } catch (e) {}
      srcRef.current.disconnect()
    }
    const src = ctx.createBufferSource()
    src.buffer = bufRef.current
    src.loop = true
    src.playbackRate.value = freq / BASE_FREQ
    src.connect(analyserRef.current)
    src.start()
    srcRef.current = src
  }, [freq])

  const startAudio = React.useCallback(() => {
    const fn = compileFn(expr)
    if (!fn) { setExprError('Expressão inválida'); return }
    setExprError(null)

    if (ctxRef.current) {
      ctxRef.current.close()
    }

    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const gain = ctx.createGain()
    gain.gain.value = vol
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256

    const buffer = generateBuffer(ctx, fn)
    bufRef.current = buffer

    const src = ctx.createBufferSource()
    src.buffer = buffer
    src.loop = true
    src.playbackRate.value = freq / BASE_FREQ
    src.connect(analyser)
    analyser.connect(gain)
    gain.connect(ctx.destination)
    src.start()

    ctxRef.current = ctx
    srcRef.current = src
    gainRef.current = gain
    analyserRef.current = analyser
    setPlaying(true)
  }, [expr, freq, vol, compileFn, generateBuffer])

  const stopAudio = React.useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (srcRef.current) { try { srcRef.current.stop() } catch (e) {}; srcRef.current.disconnect(); srcRef.current = null }
    if (ctxRef.current) { ctxRef.current.close(); ctxRef.current = null }
    bufRef.current = null
    setPlaying(false)
  }, [])

  const togglePlay = React.useCallback(() => {
    playing ? stopAudio() : startAudio()
  }, [playing, startAudio, stopAudio])

  React.useEffect(() => {
    if (analyserRef.current && srcRef.current) {
      srcRef.current.playbackRate.value = freq / BASE_FREQ
    }
  }, [freq])

  React.useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = vol
    }
  }, [vol])

  React.useEffect(() => {
    if (ctxRef.current && bufRef.current) {
      const fn = compileFn(expr)
      if (!fn) { setExprError('Expressão inválida'); return }
      setExprError(null)
      bufRef.current = generateBuffer(ctxRef.current, fn)
      rebuildSrc()
    }
  }, [expr, compileFn, generateBuffer, rebuildSrc])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)

      ctx.fillStyle = '#0B1120'
      ctx.fillRect(0, 0, W, H)

      const analyser = analyserRef.current

      if (analyser) {
        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        analyser.getByteTimeDomainData(dataArray)

        ctx.lineWidth = 2
        ctx.strokeStyle = '#2dd4bf'
        ctx.beginPath()
        const sliceWidth = W / bufferLength
        let x = 0
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0
          const y = v * H / 2
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
          x += sliceWidth
        }
        ctx.stroke()
      } else {
        const fn = compileFn(expr)
        if (fn) {
          ctx.lineWidth = 1.5
          ctx.strokeStyle = 'rgba(45,212,191,0.35)'
          ctx.beginPath()
          const steps = W
          for (let i = 0; i <= steps; i++) {
            const x = (i / steps) * 2 * Math.PI
            const v = fn(x)
            const px = (i / steps) * W
            const py = H / 2 - (v * (H / 2 - 4))
            if (i === 0) ctx.moveTo(px, py)
            else ctx.lineTo(px, py)
          }
          ctx.stroke()
        }
      }

      ctx.strokeStyle = 'rgba(45,212,191,0.12)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(0, H / 2)
      ctx.lineTo(W, H / 2)
      ctx.stroke()
      ctx.setLineDash([])
    }

    draw()
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [expr, compileFn])

  const presets = [
    { label: 'Sen', expr: 'Math.sin(x)' },
    { label: 'Quad', expr: 'Math.sin(x) >= 0 ? 1 : -1' },
    { label: 'Tri', expr: 'Math.asin(Math.sin(x)) / (Math.PI/2)' },
    { label: 'Ser', expr: '((x / Math.PI) % 2) - 1' },
  ]

  return (
    <div style={{ width: '100%', height: '100%', background: '#0B1120', fontFamily: 'monospace', color: '#94A3B8', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#2dd4bf', fontWeight: 'bold', fontSize: 13 }}>MATH TONE GEN</span>
        <button onClick={togglePlay} style={{
          background: playing ? '#EF4444' : '#2dd4bf', border: 'none', borderRadius: 4,
          color: '#0B1120', padding: '5px 16px', fontWeight: 'bold', cursor: 'pointer', fontSize: 12
        }}>
          {playing ? 'STOP' : 'PLAY'}
        </button>
      </div>

      <canvas ref={canvasRef} width={320} height={110} style={{
        width: '100%', height: 110, background: '#0B1120', borderRadius: 8,
        border: '1px solid #1e293b'
      }} />

      <input type="text" value={expr} onChange={e => setExpr(e.target.value)}
        spellCheck={false}
        style={{
          width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid ' + (exprError ? '#EF4444' : '#1e293b'),
          background: '#0B1120', color: '#e2e8f0', fontSize: 12, fontFamily: 'monospace', outline: 'none'
        }}
        placeholder="Digite uma função de x (ex: Math.sin(x))"
      />
      {exprError && (
        <span style={{ fontSize: 10, color: '#EF4444', marginTop: -6 }}>{exprError}</span>
      )}

      <div style={{ display: 'flex', gap: 4 }}>
        {presets.map(p => (
          <button key={p.label} onClick={() => setExpr(p.expr)} style={{
            flex: 1, padding: '5px 0', borderRadius: 5, border: 'none',
            fontSize: 11, fontWeight: 600, cursor: 'pointer',
            background: expr === p.expr ? '#2dd4bf' : '#1e293b',
            color: expr === p.expr ? '#0B1120' : '#64748b'
          }}>
            {p.label}
          </button>
        ))}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 3 }}>
          <span>Frequência</span>
          <span style={{ color: '#2dd4bf' }}>{freq} Hz</span>
        </div>
        <input type="range" min={20} max={2000} value={freq} onChange={e => setFreq(Number(e.target.value))} style={{ width: '100%', accentColor: '#2dd4bf' }} />
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 3 }}>
          <span>Volume</span>
          <span style={{ color: '#2dd4bf' }}>{Math.round(vol * 100)}%</span>
        </div>
        <input type="range" min={0} max={1} step={0.01} value={vol} onChange={e => setVol(Number(e.target.value))} style={{ width: '100%', accentColor: '#2dd4bf' }} />
      </div>

    </div>
  )
}
