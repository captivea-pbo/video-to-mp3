import { basename } from '../utils'

export default function DropZone({ inputFile, isConverting, dragging, onPickFile, onDragOver, onDragLeave, onDrop }) {
  return (
    <div
      className={`drop-zone ${dragging ? 'dragging' : ''} ${inputFile ? 'has-file' : ''} ${isConverting ? 'locked' : ''}`}
      onClick={!isConverting ? onPickFile : undefined}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
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
  )
}
