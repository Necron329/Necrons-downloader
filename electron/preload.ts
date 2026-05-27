import { contextBridge, ipcRenderer } from 'electron';
import { DownloadRequest } from './types/downloadData';

contextBridge.exposeInMainWorld('electronAPI', {
  getVideoMetadata: (url: string) => ipcRenderer.invoke('get-video-metadata', url),
  startDownload: (payload: DownloadRequest) => ipcRenderer.invoke('start-download', payload)
});