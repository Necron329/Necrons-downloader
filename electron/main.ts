import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { exec } from 'child_process';
import { promisify } from 'util';

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

// --- UTILITIES ---
const execPromise = promisify(exec);

// --- IPC HANDLERS ---
ipcMain.handle('get-video-metadata', async (_, url: string): Promise<any> => {
  try {
    const command = `"${ytDlpPath}" -J --js-runtimes node --ffmpeg-location "${resourcesPath}" "${url} "`;
    
    const { stdout } = await execPromise(command);
    
    return JSON.parse(stdout);
  } catch (error) {
    console.error('Failed to fetch metadata:', error);
    return { error: 'Could not fetch video metadata' };
  }
});