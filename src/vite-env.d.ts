/// <reference types="vite/client" />
import { YtDlpRequest } from '../shared/types/downloadData';

declare global {
  interface Window {
    electronAPI: {
      getVideoMetadata: (payload: YtDlpRequest) => Promise<any>;
      startDownload: (payload: YtDlpRequest) => void;

      getSettings: () => Promise<AppConfig>;
      updateSettings: (newConfig: Partial<AppConfig>) => Promise<boolean>;

      registerToastReady: () => Promise<any>;
      onShowToast: (callback: (data: { message: string; duration: number }) => void) => () => void;
    }
  }
}

export {};