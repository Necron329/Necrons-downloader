/// <reference types="vite/client" />
import { DownloadRequest } from './types/downloadData';

declare global {
  interface Window {
    electronAPI: {
      getVideoMetadata: (url: string) => Promise<any>;
      startDownload: (payload: DownloadRequest) => void;
    }
  }
}

export {};