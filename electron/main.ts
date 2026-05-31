import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'child_process';

// --- CONFIGURATION & PATHS ---
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const APP_ROOT = path.join(__dirname, '..')

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
const RENDERER_DIST = path.join(APP_ROOT, 'dist')
const VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(APP_ROOT, 'public') : RENDERER_DIST

// DYNAMICZNE ŚCIEŻKI DO ZASOBÓW (ffmpeg, yt-dlp)
let resourcesPath: string
let ytDlpPath: string

if (app.isPackaged) {
  // Po spakowaniu: resources znajduje się wewnątrz folderu głównego aplikacji (obok .exe)
  resourcesPath = path.join(process.resourcesPath, "resources")
  ytDlpPath = path.join(resourcesPath, "yt-dlp.exe")
} else {
  // Tryb deweloperski: resources znajduje się w głównym folderze projektu
  resourcesPath = path.join(APP_ROOT, "resources")
  ytDlpPath = path.join(resourcesPath, "yt-dlp.exe")
}

let win: BrowserWindow | null = null

// --- WINDOW MANAGEMENT ---
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(VITE_PUBLIC, 'electron-vite.svg'),
    width: 1100,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// --- APP LIFECYCLE ---
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// --- IPC HANDLERS ---
ipcMain.handle('get-video-metadata', async (_, url: string) => {
  if (!ytDlpPath || !resourcesPath) {
    return { error: 'Invalid internal paths' };
  }

  return new Promise((resolve) => {
    const child = spawn(ytDlpPath, [
      '-j',
      '--js-runtimes', 'node',
      '--ffmpeg-location', resourcesPath,
      url
    ]);

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', d => (stdout += d));
    child.stderr.on('data', d => (stderr += d));

    child.on('error', err => {
      resolve({ error: 'Process start failed', details: err.message });
    });

    child.on('close', (code) => {
      if (code !== 0) {
        return resolve({ error: 'yt-dlp failed', code, stderr });
      }

      try {
        const data = stdout
          .trim()
          .split('\n')
          .filter(Boolean)
          .map(line => JSON.parse(line));

        resolve(data);
      } catch {
        resolve({ error: 'Invalid JSON output' });
      }
    });
  });
});