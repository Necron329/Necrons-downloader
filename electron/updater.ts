import { app } from 'electron'
import path from 'node:path'
import { autoUpdater } from 'electron-updater'
import { APP_ROOT, configStore } from './config'
import { sendToast } from './window'

export function setupUpdater() {
  const isAutoUpdateEnabled = configStore.get('autoUpdate', true);

  if (isAutoUpdateEnabled) {
    autoUpdater.checkForUpdates();
  } else {
    console.log('Auto-update is disabled by user settings.');
  }

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
}