import { app, ipcMain, dialog, shell } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { spawn } from 'child_process'
import { autoUpdater } from 'electron-updater'
import { ytDlpPath, resourcesPath, configStore } from './config'
import { sendToast, toastQueue, setIsWindowReady } from './window'
import { YtDlpRequest, ProgressPayload } from '../shared/types/downloadData'

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

export function setupIpcHandlers() {
  ipcMain.handle('register-toast-ready', () => {
    setIsWindowReady(true);
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

  ipcMain.handle('start-download', async (event, payload: YtDlpRequest) => {
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
      '--js-runtimes', 'node',
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

        const progressMatch = text.match(
          /\[download\]\s+([\d.]+)%\s+of\s+([\d.]+\w+)\s+at\s+([\d.]+\w+\/s)\s+ETA\s+([\d:]+)/
        );

        if (progressMatch) {
          const progress: ProgressPayload = {
            percent: parseFloat(progressMatch[1]),
            filesize: progressMatch[2],
            speed: progressMatch[3],
            eta: progressMatch[4],
          };
          event.sender.send('download-progress', progress);
        }
      });

      child.stderr.on('data', (data) => {
        console.error('[yt-dlp stderr]', data.toString());
      });

      child.on('error', (err) => resolve({ error: 'Failed to start', details: err.message }));

      child.on('close', (code) => {
        if (code === 0) {
          event.sender.send('download-progress', {
            percent: 100, filesize: '', speed: '', eta: '00:00'
          } satisfies ProgressPayload);
        }
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

  ipcMain.handle('dialog:openDirectory', async (_, dirPath: string) => {
    if (!dirPath) return { success: false, error: 'Path is empty' };
    try {
      if (fs.existsSync(dirPath)) {
        const errorMessage = await shell.openPath(dirPath);
        if (errorMessage) {
          return { success: false, error: errorMessage };
        }
        return { success: true };
      } else {
        return { success: false, error: 'Directory does not exist' };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
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
}