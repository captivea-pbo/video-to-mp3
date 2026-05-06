const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // File dialogs
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (defaultName) => ipcRenderer.invoke('dialog:saveFile', defaultName),

  // Conversion
  convert: (params) => ipcRenderer.invoke('ffmpeg:convert', params),
  cancel: () => ipcRenderer.invoke('ffmpeg:cancel'),

  // Progress listener
  onProgress: (callback) => {
    ipcRenderer.on('ffmpeg:progress', (_, value) => callback(value))
    return () => ipcRenderer.removeAllListeners('ffmpeg:progress')
  },
})
