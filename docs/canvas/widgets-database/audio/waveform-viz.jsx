function Widget({ appBus }) {
  const [isRunning, setIsRunning] = React.useState(false)
  const canvasRef = React.useRef(null)
  const animRef = React.useRef(null)
  const streamRef = React.useRef(null)
  const analyserRef = React.useRef(null)
  const dataRef = React.useRef(new Uint8Array(256))

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w = canvas.width = canvas.clientWidth * 2
    let h = canvas.height = canvas.clientHeight * 2
    ctx.scale(2, 2)

    function draw() {
      const cw = canvas.clientWidth
      const ch = canvas.clientHeight
      if (cw !== w/2 || ch !== h/2) {
        w = canvas.width = cw * 2
        h = canvas.height = ch * 2
        ctx.scale(2, 2)
      }

      ctx.clearRect(0, 0, cw, ch)
      ctx.fillStyle = '#0B1120'
      ctx.fillRect(0, 0, cw, ch)

      if (analyserRef.current) {
        analyserRef.current.getByteTimeDomainData(dataRef.current)
      }

      const data = dataRef.current
      const centerY = ch / 2
      const barWidth = cw / data.length

      ctx.fillStyle = '#22D3EE'
      for (let i = 0; i < data.length; i++) {
        const amplitude = (data[i] - 128) / 128
        const barHeight = Math.abs(amplitude) * (ch * 0.4)
        const x = i * barWidth
        const y = amplitude > 0 ? centerY - barHeight : centerY
        ctx.fillRect(x, y, Math.max(1, barWidth - 0.5), barHeight)
      }

      animRef.current = requestAnimationFrame(draw)
    }

    if (isRunning) {
      draw()
    }

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [isRunning])

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 512
      source.connect(analyser)
      analyserRef.current = analyser
      dataRef.current = new Uint8Array(analyser.frequencyBinCount)
      setIsRunning(true)
    } catch (e) {
      appBus?.emit('error', 'Mic access denied')
    }
  }

  const stop = () => {
    setIsRunning(false)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    analyserRef.current = null
  }

  const toggle = () => isRunning ? stop() : start()

  return (
    <div style={{ width: '100%', height: '100%', background: '#0B1120', display: 'flex', flexDirection: 'column', fontFamily: 'monospace', color: '#94A3B8' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #1E293B' }}>
        <span style={{ color: '#22D3EE', fontWeight: 'bold', fontSize: 13 }}>WAVEFORM VIZ</span>
        <button onClick={toggle} style={{ background: isRunning ? '#EF4444' : '#22D3EE', border: 'none', borderRadius: 4, color: '#0B1120', padding: '4px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: 12 }}>
          {isRunning ? 'STOP' : 'START'}
        </button>
      </div>
      <canvas ref={canvasRef} style={{ flex: 1, width: '100%', display: 'block' }} />
      <div style={{ padding: '6px 12px', fontSize: 11, borderTop: '1px solid #1E293B', color: '#64748B' }}>
        {isRunning ? 'Recording from microphone...' : 'Click START to visualize'}
      </div>
    </div>
  )
}
