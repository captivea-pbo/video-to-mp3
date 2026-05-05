import { useState, useRef, useCallback } from 'react'
import './App.css'

const BITRATES = ['64k', '96k', '128k', '192k', '256k', '320k']
const SAMPLE_RATES = ['22050', '44100', '48000']
const CHANNELS = [{ value: '1', label: 'Mono' }, { value: '2', label: 'Stéréo' }]

function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`
}

function basename(filePath) {
  return filePath ? filePath.replace(/\\/g, '/').split('/').pop() : ''
}

function stripExt(filename) {
  return filename.replace(/\.[^/.]+$/, '')
}

export default function App() {
  const [inputFile, setInputFile]     = useState(null)
  const [outputFile, setOutputFile]   = useState(null)
  const [advanced, setAdvanced]       = useState(false)
  const [status, setStatus]           = useState('idle') // idle | converting | done | error
  const [progress, setProgress]       = useState(0)
  const [result, setResult]           = useState(null)
  const [errorMsg, setErrorMsg]       = useState('')
  const [dragging, setDragging]       = useState(false)

  // Advanced options
  const [bitrate, setBitrate]         = useState('192k')
  const [sampleRate, setSampleRate]   = useState('44100')
  const [channels, setChannels]       = useState('2')
  const [startTime, setStartTime]     = useState('')
  const [endTime, setEndTime]         = useState('')

  const cleanupRef = useRef(null)

  const handlePickFile = async () => {
    const path = await window.electronAPI.openFile()
    if (path) {
      setInputFile(path)
      setOutputFile(null)
      setStatus('idle')
      setResult(null)
    }
  }

  const handlePickOutput = async () => {
    const defaultName = inputFile
      ? stripExt(basename(inputFile)) + '.mp3'
      : 'output.mp3'
    const path = await window.electronAPI.saveFile(defaultName)
    if (path) setOutputFile(path)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      setInputFile(file.path)
      setOutputFile(null)
      setStatus('idle')
      setResult(null)
    }
  }, [])

  const handleConvert = async () => {
    if (!inputFile) return

    let out = outputFile
    if (!out) {
      out = await window.electronAPI.saveFile(stripExt(basename(inputFile)) + '.mp3')
      if (!out) return
      setOutputFile(out)
    }

    setStatus('converting')
    setProgress(0)
    setResult(null)
    setErrorMsg('')

    // Subscribe to progress
    const unsubscribe = window.electronAPI.onProgress((p) => setProgress(p))
    cleanupRef.current = unsubscribe

    try {
      const res = await window.electronAPI.convert({
        inputPath: inputFile,
        outputPath: out,
        options: {
          bitrate,
          sampleRate,
          channels,
          startTime: startTime || null,
          endTime: endTime || null,
        },
      })
      setResult(res)
      setStatus('done')
    } catch (err) {
      setErrorMsg(err.message || 'Erreur inconnue')
      setStatus('error')
    } finally {
      if (cleanupRef.current) cleanupRef.current()
    }
  }

  const handleReset = () => {
    setInputFile(null)
    setOutputFile(null)
    setStatus('idle')
    setProgress(0)
    setResult(null)
    setErrorMsg('')
  }

  const isConverting = status === 'converting'

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">◈</span>
          <span className="logo-text">VIDEO<em>to</em>MP3</span>
        </div>
        <button
          className={`btn-advanced ${advanced ? 'active' : ''}`}
          onClick={() => setAdvanced(v => !v)}
          disabled={isConverting}
        >
          {advanced ? '− Moins d\'options' : '+ Plus d\'options'}
        </button>
      </header>

      <main className="app-main">
        {/* Drop zone */}
        <div
          className={`drop-zone ${dragging ? 'dragging' : ''} ${inputFile ? 'has-file' : ''} ${isConverting ? 'locked' : ''}`}
          onClick={!isConverting ? handlePickFile : undefined}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          {inputFile ? (
            <>
              <span className="drop-icon">▶</span>
              <span className="drop-filename">{basename(inputFile)}</span>
              <span className="drop-hint">Cliquer pour changer</span>
            </>
          ) : (
            <>
              <span className="drop-icon">⊕</span>
              <span className="drop-label">Déposer une vidéo ici</span>
              <span className="drop-hint">ou cliquer pour parcourir · MP4, MKV, AVI, MOV…</span>
            </>
          )}
        </div>

        {/* Advanced options panel */}
        <div className={`advanced-panel ${advanced ? 'open' : ''}`}>
          <div className="advanced-grid">
            <div className="field">
              <label>Bitrate</label>
              <div className="chip-group">
                {BITRATES.map(b => (
                  <button
                    key={b}
                    className={`chip ${bitrate === b ? 'active' : ''}`}
                    onClick={() => setBitrate(b)}
                    disabled={isConverting}
                  >{b}</button>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Fréquence</label>
              <div className="chip-group">
                {SAMPLE_RATES.map(r => (
                  <button
                    key={r}
                    className={`chip ${sampleRate === r ? 'active' : ''}`}
                    onClick={() => setSampleRate(r)}
                    disabled={isConverting}
                  >{parseInt(r / 1000)}kHz</button>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Canaux</label>
              <div className="chip-group">
                {CHANNELS.map(c => (
                  <button
                    key={c.value}
                    className={`chip ${channels === c.value ? 'active' : ''}`}
                    onClick={() => setChannels(c.value)}
                    disabled={isConverting}
                  >{c.label}</button>
                ))}
              </div>
            </div>

            <div className="field field-time">
              <label>Découpe (optionnel)</label>
              <div className="time-inputs">
                <input
                  type="text"
                  placeholder="Début  00:00:00"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  disabled={isConverting}
                />
                <span className="time-sep">→</span>
                <input
                  type="text"
                  placeholder="Fin  00:00:00"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  disabled={isConverting}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Output path */}
        {inputFile && (
          <div className="output-row">
            <span className="output-label">Destination</span>
            <button
              className="btn-output"
              onClick={handlePickOutput}
              disabled={isConverting}
            >
              {outputFile ? basename(outputFile) : 'Choisir…'}
            </button>
          </div>
        )}

        {/* Progress bar */}
        {isConverting && (
          <div className="progress-wrap">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="progress-label">{progress}%</span>
          </div>
        )}

        {/* Result */}
        {status === 'done' && (
          <div className="result success">
            <span className="result-icon">✓</span>
            <span>Conversion terminée{result?.size ? ` · ${formatBytes(result.size)}` : ''}</span>
          </div>
        )}

        {status === 'error' && (
          <div className="result error">
            <span className="result-icon">✕</span>
            <span>{errorMsg}</span>
          </div>
        )}
      </main>

      {/* Footer actions */}
      <footer className="app-footer">
        {status === 'done' || status === 'error' ? (
          <button className="btn btn-reset" onClick={handleReset}>
            Nouvelle conversion
          </button>
        ) : (
          <button
            className="btn btn-convert"
            onClick={handleConvert}
            disabled={!inputFile || isConverting}
          >
            {isConverting ? 'Conversion…' : 'Convertir en MP3'}
          </button>
        )}
      </footer>
    </div>
  )
}
