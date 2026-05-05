const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const fs = require('fs')

// Get ffmpeg binary path (works both in dev and packaged)
function getFfmpegPath() {
  try {
    return require('ffmpeg-static')
  } catch {
    return 'ffmpeg'
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 720,
    height: 560,
    minWidth: 600,
    minHeight: 480,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: '#0f0f0f',
  })

  // Load Vite dev server or built files
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// ─── IPC: Open file dialog ───────────────────────────────────────────────────
ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [
      {
        name: 'Vidéos',
        extensions: ['mp4', 'mkv', 'avi', 'mov', 'webm', 'flv', 'wmv', 'm4v', 'mpeg'],
      },
    ],
    properties: ['openFile'],
  })
  return canceled ? null : filePaths[0]
})

// ─── IPC: Choose output directory ────────────────────────────────────────────
ipcMain.handle('dialog:saveFile', async (_, defaultName) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: defaultName,
    filters: [{ name: 'Audio MP3', extensions: ['mp3'] }],
  })
  return canceled ? null : filePath
})

// ─── IPC: Convert video to MP3 ───────────────────────────────────────────────
ipcMain.handle('ffmpeg:convert', async (event, { inputPath, outputPath, options }) => {
  const ffmpegPath = getFfmpegPath()

  const {
    bitrate = '192k',
    sampleRate = '44100',
    channels = '2',
    startTime = null,
    endTime = null,
  } = options || {}

  return new Promise((resolve, reject) => {
    // First pass: get duration for progress
    const probe = spawn(ffmpegPath, ['-i', inputPath])
    let durationSec = 0

    probe.stderr.on('data', (data) => {
      const match = data.toString().match(/Duration: (\d+):(\d+):(\d+\.?\d*)/)
      if (match) {
        durationSec =
          parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseFloat(match[3])
      }
    })

    probe.on('close', () => {
      // Build ffmpeg args
      const args = ['-i', inputPath, '-y']

      if (startTime) args.push('-ss', startTime)
      if (endTime) args.push('-to', endTime)

      args.push(
        '-vn',                    // no video
        '-acodec', 'libmp3lame',
        '-ab', bitrate,
        '-ar', sampleRate,
        '-ac', channels,
        outputPath
      )

      const ffmpeg = spawn(ffmpegPath, args)
      let lastProgress = 0

      ffmpeg.stderr.on('data', (data) => {
        const str = data.toString()
        // Parse current time for progress
        const timeMatch = str.match(/time=(\d+):(\d+):(\d+\.?\d*)/)
        if (timeMatch && durationSec > 0) {
          const currentSec =
            parseInt(timeMatch[1]) * 3600 +
            parseInt(timeMatch[2]) * 60 +
            parseFloat(timeMatch[3])
          const progress = Math.min(Math.round((currentSec / durationSec) * 100), 99)
          if (progress !== lastProgress) {
            lastProgress = progress
            event.sender.send('ffmpeg:progress', progress)
          }
        }
      })

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          event.sender.send('ffmpeg:progress', 100)
          // Get output file size
          try {
            const stats = fs.statSync(outputPath)
            resolve({ success: true, size: stats.size })
          } catch {
            resolve({ success: true, size: 0 })
          }
        } else {
          reject(new Error(`FFmpeg exited with code ${code}`))
        }
      })

      ffmpeg.on('error', (err) => reject(err))
    })
  })
})
