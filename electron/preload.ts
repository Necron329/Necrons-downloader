import { contextBridge, ipcRenderer } from 'electron';
import { YtDlpRequest, ProgressPayload } from '../shared/types/downloadData';

contextBridge.exposeInMainWorld('electronAPI', {
  getVideoMetadata: (payload: YtDlpRequest) => ipcRenderer.invoke('get-video-metadata', payload),
  startDownload: (payload: YtDlpRequest) => ipcRenderer.invoke('start-download', payload),
  onDownloadProgress: (callback: (data: ProgressPayload) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: ProgressPayload) =>
      callback(data);

    ipcRenderer.on('download-progress', handler);

    return () => ipcRenderer.removeListener('download-progress', handler);
  },

  selectMediaFile: () => ipcRenderer.invoke('dialog:selectMediaFile'),
  selectImageFile: () => ipcRenderer.invoke('dialog:selectImageFile'),
  readMetadata: (filePath: string) => ipcRenderer.invoke('metadata:read', filePath),
  updateMetadata: (filePath: string, metadata: any) => ipcRenderer.invoke('metadata:update', { filePath, metadata }),

  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),

  chooseDirectory: () => ipcRenderer.invoke('dialog:chooseDirectory'),
  openDirectory: (path: string) => ipcRenderer.invoke('dialog:openDirectory', path),

  getSettings: () => ipcRenderer.invoke('config:get-settings'),
  updateSettings: (newPartialConfig: any) => ipcRenderer.invoke('config:update-settings', newPartialConfig),

  registerToastReady: () => ipcRenderer.invoke('register-toast-ready'),
  onShowToast: (callback: (data: { message: string; duration: number }) => void) => {
    const subscription = (_event: any, data: { message: string; duration: number }) => callback(data);
    ipcRenderer.on('show-toast', subscription);
    return () => {
      ipcRenderer.removeListener('show-toast', subscription);
    };
  }
});