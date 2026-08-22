import { app } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Store from 'electron-store'

export const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const RENDERER_DIST = path.join(APP_ROOT, 'dist')
export const VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(APP_ROOT, 'public') : RENDERER_DIST

export const configStore = new Store({
  name: 'user-config',
  defaults: {
    videoCompatibility: 'best',
  },
})

export let resourcesPath: string
export let ytDlpPath: string
export let ffprobePath: string

const isWin = process.platform === 'win32'
const ytDlpBinary = isWin ? 'yt-dlp.exe' : 'yt-dlp'
const ffprobeBinary = isWin ? 'ffprobe.exe' : 'ffprobe'

if (app.isPackaged) {
  resourcesPath = path.join(process.resourcesPath)
  ytDlpPath = path.join(resourcesPath, ytDlpBinary)
  ffprobePath = path.join(resourcesPath, ffprobeBinary) 
} else {
  resourcesPath = path.join(APP_ROOT, "resources")
  ytDlpPath = path.join(resourcesPath, ytDlpBinary)
  ffprobePath = path.join(resourcesPath, ffprobeBinary) 
}