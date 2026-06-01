import { contextBridge, ipcRenderer } from 'electron';
import { YtDlpRequest } from './types/downloadData';

contextBridge.exposeInMainWorld('electronAPI', {
  getVideoMetadata: (payload: YtDlpRequest) => ipcRenderer.invoke('get-video-metadata', payload),
  startDownload: (payload: YtDlpRequest) => ipcRenderer.invoke('start-download', payload)
});