function Widget({ appBus }) {
  const [isRunning, setIsRunning] = React.useState(false)
  const [bins, setBins] = React.useState(64)
  const canvasRef = React.useRef(null)
  const animRef = React.useRef(null)
  const streamRef = React.useRef(null)
  const analyserRef = React.useRef(null)
  const dataRef = React.useRef(new Uint8Array(128))
  const peakRef = React.useRef([])
  const peakDecayRef = React.useRef([])

  React.useEffect(() => {
    peakRef.current = new Array(bins).fill(0)
    peakDecayRef.current = new Array(bins).fill(0)
  }, [bins])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w = canvas.width = canvas.clientWidth * 2
    let h = canvas.height = canvas.clientHeight * 2

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
        analyserRef.current.getByteFrequencyData(dataRef.current)
      }

      const data = dataRef.current
      const step = Math.max(1, Math.floor(data.length / bins))
      const barWidth = cw / bins
      const gap = 2

      for (let i = 0; i < bins; i++) {
        let sum = 0
        for (let j = 0; j < step; j++) {
          sum += data[i * step + j] || 0
        }
        const avg = sum / step
        const barHeight = (avg / 255) * (ch * 0.85)

        const x = i * barWidth + gap / 2
        const bw = barWidth - gap

        const hue = 200 - (avg / 255) * 140
        ctx.fillStyle = `hsl(${hue}, 100%, ${50 + (avg / 255) * 30}%)`
        ctx.fillRect(x, ch - barHeight, bw, barHeight)

        if (barHeight > peakRef.current[i]) {
          peakRef.current[i] = barHeight
        } else {
          peakRef.current[i] = Math.max(0, peakRef.current[i] - 0.5)
        }

        const peakY = ch - peakRef.current[i]
        ctx.fillStyle = '#FBBF24'
        ctx.fillRect(x, peakY, bw, 2)
      }

      animRef.current = requestAnimationFrame(draw)
    }

    if (isRunning) draw()

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [isRunning, bins])

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
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

  return (
    <div style={{ width: '100%', height: '100%', background: '#0B1120', display: 'flex', flexDirection: 'column', fontFamily: 'monospace', color: '#94A3B8' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #1E293B' }}>
        <span style={{ color: '#FBBF24', fontWeight: 'bold', fontSize: 13 }}>SPECTRUM ANALYZER</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={bins} onChange={e => setBins(Number(e.target.value))} style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 4, color: '#94A3B8', padding: '3px 6px', fontSize: 11 }}>
            <option value={16}>16</option>
            <option value={32}>32</option>
            <option value={64}>64</option>
            <option value={128}>128</option>
          </select>
          <button onClick={isRunning ? stop : start} style={{ background: isRunning ? '#EF4444' : '#FBBF24', border: 'none', borderRadius: 4, color: '#0B1120', padding: '4px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: 12 }}>
            {isRunning ? 'STOP' : 'START'}
          </button>
        </div>
      </div>
      <canvas ref={canvasRef} style={{ flex: 1, width: '100%', display: 'block' }} />
      <div style={{ padding: '6px 12px', fontSize: 11, borderTop: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
        <span>Bins: {bins}</span>
        <span>{isRunning ? 'Live' : 'Idle'}</span>
        <span>Peak hold • HSL gradient</span>
      </div>
    </div>
  )
}
