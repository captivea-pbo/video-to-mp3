import { formatBytes } from '../utils'

export default function ResultBanner({ status, result, errorMsg }) {
  if (status === 'done') {
    return (
      <div className="result success">
        <span className="result-icon">✓</span>
        <span>Conversion terminée{result?.size ? ` · ${formatBytes(result.size)}` : ''}</span>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="result error">
        <span className="result-icon">✕</span>
        <span>{errorMsg}</span>
      </div>
    )
  }

  return null
}
