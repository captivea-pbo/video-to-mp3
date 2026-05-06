import { useState, useRef, useCallback } from 'react'
import './App.css'
import { basename, stripExt } from './utils'
import DropZone from './components/DropZone'
import AdvancedPanel from './components/AdvancedPanel'
import OutputRow from './components/OutputRow'
import ProgressBar from './components/ProgressBar'
import ResultBanner from './components/ResultBanner'

export default function App() {
  const [inputFile, setInputFile]   = useState(null)
  const [outputFile, setOutputFile] = useState(null)
  const [advanced, setAdvanced]     = useState(false)
  const [status, setStatus]         = useState('idle') // idle | converting | done | error
  const [progress, setProgress]     = useState(0)
  const [result, setResult]         = useState(null)
  const [errorMsg, setErrorMsg]     = useState('')
  const [dragging, setDragging]     = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const [bitrate, setBitrate]       = useState('192k')
  const [sampleRate, setSampleRate] = useState('44100')
  const [channels, setChannels]     = useState('2')
  const [startTime, setStartTime]   = useState('')
  const [endTime, setEndTime]       = useState('')

  const cleanupRef = useRef(null)

  const isConverting = status === 'converting'

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

    const unsubscribe = window.electronAPI.onProgress((p) => setProgress(p))
    cleanupRef.current = unsubscribe

    try {
      const res = await window.electronAPI.convert({
        inputPath: inputFile,
        outputPath: out,
        options: { bitrate, sampleRate, channels, startTime: startTime || null, endTime: endTime || null },
      })
      if (res.cancelled) {
        setStatus('idle')
      } else {
        setResult(res)
        setStatus('done')
      }
    } catch (err) {
      setErrorMsg(err.message || 'Erreur inconnue')
      setStatus('error')
    } finally {
      if (cleanupRef.current) cleanupRef.current()
      setConfirmCancel(false)
    }
  }

  const handleCancelConfirm = () => {
    window.electronAPI.cancel()
  }

  const handleReset = () => {
    setInputFile(null)
    setOutputFile(null)
    setStatus('idle')
    setProgress(0)
    setResult(null)
    setErrorMsg('')
    setConfirmCancel(false)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">◈</span>
          <span className="logo-text">VIDEO<em>to</em>MP3 <em>by Paul Bonnet</em></span>
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
        <DropZone
          inputFile={inputFile}
          isConverting={isConverting}
          dragging={dragging}
          onPickFile={handlePickFile}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        />

        <AdvancedPanel
          open={advanced}
          isConverting={isConverting}
          bitrate={bitrate} setBitrate={setBitrate}
          sampleRate={sampleRate} setSampleRate={setSampleRate}
          channels={channels} setChannels={setChannels}
          startTime={startTime} setStartTime={setStartTime}
          endTime={endTime} setEndTime={setEndTime}
        />

        {inputFile && (
          <OutputRow
            outputFile={outputFile}
            isConverting={isConverting}
            onPickOutput={handlePickOutput}
          />
        )}

        {isConverting && <ProgressBar progress={progress} />}

        <ResultBanner status={status} result={result} errorMsg={errorMsg} />
      </main>

      <footer className="app-footer">
        {status === 'done' || status === 'error' ? (
          <button className="btn btn-reset" onClick={handleReset}>
            Nouvelle conversion
          </button>
        ) : isConverting ? (
          confirmCancel ? (
            <div className="cancel-confirm">
              <span className="cancel-confirm-label">Annuler la conversion ?</span>
              <button className="btn btn-danger" onClick={handleCancelConfirm}>Oui, annuler</button>
              <button className="btn btn-reset" onClick={() => setConfirmCancel(false)}>Continuer</button>
            </div>
          ) : (
            <button className="btn btn-cancel" onClick={() => setConfirmCancel(true)}>
              Annuler
            </button>
          )
        ) : (
          <button
            className="btn btn-convert"
            onClick={handleConvert}
            disabled={!inputFile}
          >
            Convertir en MP3
          </button>
        )}
      </footer>
    </div>
  )
}
