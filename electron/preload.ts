import { contextBridge, ipcRenderer } from 'electron';
import { YtDlpRequest } from '../shared/types/downloadData';

contextBridge.exposeInMainWorld('electronAPI', {
  getVideoMetadata: (payload: YtDlpRequest) => ipcRenderer.invoke('get-video-metadata', payload),
  startDownload: (payload: YtDlpRequest) => ipcRenderer.invoke('start-download', payload),

  chooseDirectory: () => ipcRenderer.invoke('dialog:chooseDirectory'),

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