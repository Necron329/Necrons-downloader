import { app, ipcMain, dialog, shell } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import { spawn } from 'child_process'
import { autoUpdater } from 'electron-updater'
import { ytDlpPath, resourcesPath, configStore, ffprobePath } from './config' // Import ffprobePath
import { sendToast, toastQueue, setIsWindowReady } from './window'
import { YtDlpRequest, ProgressPayload } from '../shared/types/downloadData'

interface FileMetadata {
  title: string;
  author: string;
  description: string;
  thumbnailPath: string;
}

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

function buildYtDlpArgs(
  url: string,
  outputPath: string,
  ffmpegLocation: string,
  format: string | undefined,
  quality: string | undefined,
  isPlaylist: boolean | undefined
): string[] {
  const args: string[] = [
    url,
    '--output', outputPath,
    '--ffmpeg-location', ffmpegLocation,
    '--js-runtimes', 'node',
    '--newline',
    '--progress',
    '--restrict-filenames'
  ];

  if (format === 'mp3') {
    args.push(
      '--extract-audio',
      '--audio-format', 'mp3',
      '--audio-quality', quality === 'best' ? '0' : '5'
    );
  } else if (format === 'subtitles') {
    args.push(
      '--write-sub',
      '--write-auto-sub',
      '--sub-lang', 'en.*',
      '--skip-download'
    );
  } else {
    const formatSelector =
      quality === 'worst'
        ? 'wv*+wa[ext=m4a]/w[ext=mp4]'
        : 'bv*+ba[ext=m4a]/b[ext=mp4]';

    args.push('-f', formatSelector, '--merge-output-format', 'mp4');
  }

  if (!isPlaylist) {
    args.push('--no-playlist');
  }

  return args;
}

async function processSubtitles(destinationPath: string): Promise<string> {
  const vttFile = destinationPath.trim().replace(/[\r\n]/g, '');
  if (!vttFile) {
    throw new Error('Failed to capture a valid VTT file path from stdout logs.');
  }

  const dirPath = path.dirname(vttFile);
  const fileName = path.basename(vttFile);
  const baseName = fileName.split('.')[0];
  const txtFile = path.join(dirPath, `${baseName}.txt`);

  const content = await fsPromises.readFile(vttFile, 'utf8');

  const rawLines = content
    .replace(/WEBVTT/g, '')
    .replace(/\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/align:[^\s]+/g, '')
    .replace(/position:[^\s]+/g, '')
    .split('\n');

  const uniqueLines: string[] = [];
  let lastLine = '';

  for (let line of rawLines) {
    let cleanedLine = line.trim();
    if (!cleanedLine || cleanedLine.startsWith('Kind:') || cleanedLine.startsWith('Language:')) {
      continue;
    }
    if (cleanedLine === lastLine) {
      continue;
    }
    uniqueLines.push(cleanedLine);
    lastLine = cleanedLine;
  }

  const cleanText = uniqueLines.join('\n');
  await fsPromises.writeFile(txtFile, cleanText);

  await new Promise((r) => setTimeout(r, 100));

  const allFiles = await fsPromises.readdir(dirPath);
  for (const file of allFiles) {
    if (file.startsWith(baseName) && file.endsWith('.vtt')) {
      const fullPathToDelete = path.join(dirPath, file);
      await fsPromises.unlink(fullPathToDelete);
      console.log(`[Cleanup] Removed temporary file: ${file}`);
    }
  }

  return txtFile;
}

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

    const args = buildYtDlpArgs(url, finalOutputPath, resourcesPath, format, quality, isPlaylist);

    return new Promise((resolve) => {
      const child = spawn(ytDlpPath, args);
      let realDestinationPath = '';

      child.stdout.on('data', (data) => {
        const text = data.toString();

        const destMatch = text.match(/Destination:\s+(.+)$/m) || text.match(/Writing video subtitles to:\s+(.+)$/m);
        if (destMatch) {
          realDestinationPath = destMatch[1].trim();
        }

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

      child.on('close', async (code) => {
        let finalPathToReturn = finalOutputPath;

        if (code === 0) {
          event.sender.send('download-progress', {
            percent: 100, filesize: '', speed: '', eta: '00:00'
          } satisfies ProgressPayload);

          if (format === 'subtitles') {
            try {
              finalPathToReturn = await processSubtitles(realDestinationPath);
            } catch (err: any) {
              console.error('[Error] Subtitles conversion or cleanup failed:', err);
            }
          } else if (realDestinationPath) {
            finalPathToReturn = realDestinationPath;
          }
        }

        resolve(code === 0
          ? { success: true, path: finalPathToReturn }
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

  ipcMain.handle('dialog:selectMediaFile', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Select Media File to Edit',
      properties: ['openFile'],
      filters: [
        { name: 'Media Files', extensions: ['mp4', 'm4a', 'mp3', 'mkv', 'webm'] }
      ]
    });
    return canceled ? '' : filePaths[0];
  });

  ipcMain.handle('dialog:selectImageFile', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Select Thumbnail Image',
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp'] }
      ]
    });
    return canceled ? '' : filePaths[0];
  });

  ipcMain.handle('metadata:read', async (_, filePath: string) => {
    if (!ffprobePath || !fs.existsSync(filePath)) {
      return { error: 'Invalid path or ffprobe missing' };
    }

    const args = [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      filePath
    ];

    return new Promise((resolve) => {
      const child = spawn(ffprobePath, args);
      let stdout = '';

      child.stdout.on('data', (d) => (stdout += d));
      
      child.on('close', (code) => {
        if (code !== 0) {
          return resolve({ error: 'Failed to read metadata' });
        }

        try {
          const parsed = JSON.parse(stdout);
          const tags = parsed.format?.tags || {};

          resolve({
            title: tags.title || tags.TITLE || '',
            author: tags.artist || tags.ARTIST || tags.author || tags.AUTHOR || '',
            description: tags.comment || tags.COMMENT || tags.description || tags.DESCRIPTION || '',
            thumbnailPath: ''
          });
        } catch (e: any) {
          resolve({ error: 'Failed to parse metadata JSON', details: e.message });
        }
      });
    });
  });

  ipcMain.handle('metadata:update', async (_, { filePath, metadata }: { filePath: string, metadata: FileMetadata }) => {
    if (!resourcesPath) {
      return { success: false, error: 'FFmpeg resources path is missing' };
    }

    const ffmpegPath = path.join(resourcesPath, process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
    
    const ext = path.extname(filePath);
    const dir = path.dirname(filePath);
    const tempOutputFile = path.join(dir, `temp_metadata_${Date.now()}${ext}`);

    const args: string[] = ['-i', filePath];

    if (metadata.thumbnailPath && fs.existsSync(metadata.thumbnailPath)) {
      args.push('-i', metadata.thumbnailPath, '-map', '0', '-map', '1');
      
      if (ext.toLowerCase() === '.mp3') {
        args.push('-c:v', 'mjpeg', '-id3v2_version', '3');
      } else if (ext.toLowerCase() === '.mp4' || ext.toLowerCase() === '.m4a') {
        args.push('-c:v:1', 'png', '-disposition:v:1', 'attached_pic');
      } else {
        args.push('-c:v:1', 'copy', '-disposition:v:1', 'attached_pic');
      }
    } else {
      args.push('-map', '0');
    }

    if (metadata.title) args.push('-metadata', `title=${metadata.title}`);
    if (metadata.author) args.push('-metadata', `artist=${metadata.author}`);
    if (metadata.description) {
      args.push('-metadata', `comment=${metadata.description}`);
      if (ext.toLowerCase() === '.mp4' || ext.toLowerCase() === '.m4a') {
        args.push('-metadata', `description=${metadata.description}`);
      }
    }

    args.push('-c:a', 'copy', '-c:v:0', 'copy', '-movflags', 'use_metadata_tags', tempOutputFile);

    return new Promise((resolve) => {
      const child = spawn(ffmpegPath, args);

      let stderr = '';
      child.stderr.on('data', (d) => (stderr += d));

      child.on('close', async (code) => {
        if (code !== 0) {
          console.error('[FFmpeg Error]', stderr);
          return resolve({ success: false, error: `FFmpeg failed with code ${code}` });
        }

        try {
          await fsPromises.unlink(filePath);
          await fsPromises.rename(tempOutputFile, filePath);
          resolve({ success: true });
        } catch (err: any) {
          if (fs.existsSync(tempOutputFile)) {
            await fsPromises.unlink(tempOutputFile).catch(() => {});
          }
          resolve({ success: false, error: `File swap failed: ${err.message}` });
        }
      });
    });
  });
}