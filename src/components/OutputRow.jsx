import { basename } from '../utils'

export default function OutputRow({ outputFile, isConverting, onPickOutput }) {
  return (
    <div className="output-row">
      <span className="output-label">Destination</span>
      <button
        className="btn-output"
        onClick={onPickOutput}
        disabled={isConverting}
      >
        {outputFile ? basename(outputFile) : 'Choisir…'}
      </button>
    </div>
  )
}
