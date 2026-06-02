/// <reference types="vite/client" />
import { YtDlpRequest } from '../shared/types/downloadData';

declare global {
  interface Window {
    electronAPI: {
      getVideoMetadata: (payload: YtDlpRequest) => Promise<any>;
      startDownload: (payload: YtDlpRequest) => void;
    }
  }
}

export {};