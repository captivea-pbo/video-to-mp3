const BITRATES = ['64k', '96k', '128k', '192k', '256k', '320k']
const SAMPLE_RATES = ['22050', '44100', '48000']
const CHANNELS = [{ value: '1', label: 'Mono' }, { value: '2', label: 'Stéréo' }]

export default function AdvancedPanel({
  open, isConverting,
  bitrate, setBitrate,
  sampleRate, setSampleRate,
  channels, setChannels,
  startTime, setStartTime,
  endTime, setEndTime,
}) {
  return (
    <div className={`advanced-panel ${open ? 'open' : ''}`}>
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
  )
}
