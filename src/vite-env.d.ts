/// <reference types="vite/client" />
import { YtDlpRequest } from '../shared/types/downloadData';

declare global {
  interface Window {
    electronAPI: {
      getVideoMetadata: (payload: YtDlpRequest) => Promise<any>;
      startDownload: (payload: YtDlpRequest) => void;

      checkForUpdates: () => Promise<{ error?: string }>;

      chooseDirectory: () => Promise<string | ''>;

      getSettings: () => Promise<AppConfig>;
      updateSettings: (newPartialConfig: Partial<AppConfig>) => Promise<boolean>;

      registerToastReady: () => Promise<any>;
      onShowToast: (callback: (data: { message: string; duration: number }) => void) => () => void;
    }
  }
}

export {};