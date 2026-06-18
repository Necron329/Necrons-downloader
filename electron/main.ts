import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'child_process';
import fs from 'node:fs';
import { autoUpdater } from 'electron-updater';
import Store from 'electron-store';

// --- CONSTANTS, VARIABLES & TYPES ---
import { YtDlpRequest } from '../shared/types/downloadData';
const configStore = new Store({ name: 'user-config', });
let isAutoUpdateEnabled = configStore.get('autoUpdate', true);
let win: BrowserWindow | null = null
let isWindowReady = false;
const toastQueue: string[] = [];

// --- CONFIGURATION & PATHS ---
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const APP_ROOT = path.join(__dirname, '..')

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
const RENDERER_DIST = path.join(APP_ROOT, 'dist')
const VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(APP_ROOT, 'public') : RENDERER_DIST

// DYNAMIC PATHS FOR RESOURCES
let resourcesPath: string
let ytDlpPath: string

if (app.isPackaged) {
  resourcesPath = path.join(process.resourcesPath)
  ytDlpPath = path.join(resourcesPath, "yt-dlp.exe")
} else {
  resourcesPath = path.join(APP_ROOT, "resources")
  ytDlpPath = path.join(resourcesPath, "yt-dlp.exe")
}

// --- HELPER TO SEND TOASTS ---
function sendToast(message: string, duration: number = 4000) {
  const payload = { message, duration };
  if (win && win.webContents && isWindowReady) {
    win.webContents.send('show-toast', payload);
  } else {
    toastQueue.push(JSON.stringify(payload));
  }
}

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
app.whenReady().then(() => {
  createWindow();

  setTimeout(() => {
    if (isAutoUpdateEnabled) {
      autoUpdater.checkForUpdates();
    } else {
      console.log('Auto-update is disabled by user settings.');
    }
  }, 1500);
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// --- HELPER FUNCTIONS ---
const getValidatedPath = (outputPath: string): string => {
  const template = '%(title)s.%(ext)s';
  const defaultPath = path.join(app.getPath('downloads'), template);

  if (!outputPath || outputPath.trim() === '') {
    return defaultPath;
  }

  try {
    if (fs.statSync(outputPath).isDirectory()) {
      return path.join(outputPath, template);
    }
  } catch { }

  return defaultPath;
};

// --- IPC HANDLERS ---
ipcMain.handle('register-toast-ready', () => {
  isWindowReady = true;
  console.log('React is ready for toasts. Flushing queue...');

  while (toastQueue.length > 0) {
    const msg = toastQueue.shift();
    if (msg) {
      sendToast(msg);
    }
  }
  return { success: true };
});

ipcMain.handle('get-video-metadata', async (_, payload: YtDlpRequest) => {
  if (!ytDlpPath || !resourcesPath) {
    return { error: 'Invalid internal paths' };
  }

  const { url, isPlaylist } = payload;

  const args: string[] = [
    '-j',
    '--js-runtimes', 'node',
  ];

  if (isPlaylist) {
    args.push('--flat-playlist');
  } else {
    args.push('--no-playlist');
  }

  args.push(url);

  return new Promise((resolve) => {
    const child = spawn(ytDlpPath, args);

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
      } catch (e: any) {
        resolve({ error: 'Invalid JSON output', details: e.message });
      }
    });
  });
});

ipcMain.handle('start-download', async (_, payload: YtDlpRequest) => {
  if (!ytDlpPath || !resourcesPath) {
    return { error: 'Invalid internal paths' };
  }

  if (payload.type !== 'download') {
    return { error: 'Invalid request type' };
  }

  const { url, format, quality, isPlaylist } = payload;
  const finalOutputPath = getValidatedPath(payload.outputPath);

  const args: string[] = [
    url,
    '--output', finalOutputPath,
    '--ffmpeg-location', resourcesPath,
    '--newline',
    '--progress'
  ];

  if (format === 'mp3') {
    args.push(
      '--extract-audio',
      '--audio-format', 'mp3',
      '--audio-quality', quality === 'best' ? '0' : '5'
    );
  } else {
    const formatSelector =
      quality === 'worst'
        ? 'wv*+wa[ext=m4a]/w[ext=mp4]'
        : 'bv*+ba[ext=m4a]/b[ext=mp4]';

    args.push(
      '-f', formatSelector,
      '--merge-output-format', 'mp4'
    );
  }
  if (!isPlaylist) {
    args.push('--no-playlist');
  }

  return new Promise((resolve) => {
    const child = spawn(ytDlpPath, args);

    child.stdout.on('data', (data) => {
      const text = data.toString();
      console.log(text);
    });

    child.on('error', (err) => {
      resolve({ error: 'Failed to start', details: err.message });
    });

    child.on('close', (code) => {
      resolve(code === 0
        ? { success: true, path: finalOutputPath }
        : { error: 'Download failed', code }
      );
    });
  });
});

ipcMain.handle('dialog:chooseDirectory', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Select Download Directory',
    properties: ['openDirectory'],
  });

  if (canceled) {
    return '';
  } else {
    return filePaths[0];
  }
});

ipcMain.handle('config:get-settings', () => {
  try {
    return configStore.store;
  } catch (error) {
    console.error('Błąd podczas odczytu electron-store:', error);
    return null;
  }
});

ipcMain.handle('config:update-settings', (_event, newPartialConfig) => {
  try {
    // electron-store pozwala przekazać cały obiekt jako Partial i sam go scali
    configStore.set(newPartialConfig);
    return true;
  } catch (error) {
    console.error('Błąd podczas zapisu w electron-store:', error);
    return false;
  }
});

ipcMain.handle('check-for-updates', async () => {
  try {
    const results = await autoUpdater.checkForUpdates();
    if (!results?.isUpdateAvailable) {
      sendToast('No updates available. You are on the latest version.', 3000);
    }
    return results;
  } catch (error) {
    console.error('Error while checking for updates:', error);
    return { error: 'Failed to check for updates' };
  }
});

// --- AUTO-UPDATER ---
if (!app.isPackaged) {
  autoUpdater.updateConfigPath = path.join(APP_ROOT, "dev-app-update.yml");
  autoUpdater.forceDevUpdateConfig = true;
  autoUpdater.autoDownload = true;
}

autoUpdater.on('update-available', (info) => {
  sendToast(`New update v${info.version} is available! It is now downloading, wait for another toast confirming installation...`, 0);
});

autoUpdater.on('error', (err) => {
  sendToast(`Auto updater encountered an error: ${err.message}`, 0);
});

autoUpdater.on('update-downloaded', (info) => {
  sendToast(`Update v${info.version} downloaded! Please restart application to apply changes.`, 0);
});