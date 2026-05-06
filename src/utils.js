export function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`
}

export function basename(filePath) {
  return filePath ? filePath.replace(/\\/g, '/').split('/').pop() : ''
}

export function stripExt(filename) {
  return filename.replace(/\.[^/.]+$/, '')
}
