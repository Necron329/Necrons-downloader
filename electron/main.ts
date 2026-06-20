import { app, BrowserWindow } from 'electron';
import { createWindow } from './window';
import { setupIpcHandlers } from './ipcHandlers';
import { setupUpdater } from './updater';

app.whenReady().then(() => {
  createWindow();
  setupIpcHandlers();

  setTimeout(() => {
    setupUpdater();
  }, 1500);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});