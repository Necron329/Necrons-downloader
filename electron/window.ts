import { BrowserWindow } from 'electron'
import path from 'node:path'
import { VITE_PUBLIC, VITE_DEV_SERVER_URL, RENDERER_DIST, __dirname } from './config'

export let win: BrowserWindow | null = null
export let isWindowReady = false
export const toastQueue: string[] = []

export function setIsWindowReady(ready: boolean) {
  isWindowReady = ready
}

export function setWinNull() {
  win = null
}

export function sendToast(message: string, duration: number = 4000) {
  const payload = { message, duration }
  if (win && win.webContents && isWindowReady) {
    win.webContents.send('show-toast', payload)
  } else {
    toastQueue.push(JSON.stringify(payload))
  }
}

export function createWindow() {
  win = new BrowserWindow({
    icon: path.join(VITE_PUBLIC, 'electron-vite.svg'),
    width: 840,
    height: 1000,
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