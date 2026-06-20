import { app } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Store from 'electron-store'

export const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const RENDERER_DIST = path.join(APP_ROOT, 'dist')
export const VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(APP_ROOT, 'public') : RENDERER_DIST

export const configStore = new Store({ name: 'user-config' })

export let resourcesPath: string
export let ytDlpPath: string

if (app.isPackaged) {
  resourcesPath = path.join(process.resourcesPath)
  ytDlpPath = path.join(resourcesPath, "yt-dlp.exe")
} else {
  resourcesPath = path.join(APP_ROOT, "resources")
  ytDlpPath = path.join(resourcesPath, "yt-dlp.exe")
}