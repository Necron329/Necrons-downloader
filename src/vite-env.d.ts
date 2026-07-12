/// <reference types="vite/client" />
import { YtDlpRequest } from '../shared/types/downloadData';

declare global {
  interface Window {
    electronAPI: {
      getVideoMetadata: (payload: YtDlpRequest) => Promise<any>;
      startDownload: (payload: YtDlpRequest) => void;
      onDownloadProgress: (callback: (data: ProgressPayload) => void) => () => void;

      selectMediaFile: () => Promise<string>;
      selectImageFile: () => Promise<string>;
      readMetadata: (filePath: string) => Promise<FileMetadata>;
      updateMetadata: (filePath: string, metadata: FileMetadata) => Promise<{ success: boolean; error?: string }>;

      checkForUpdates: () => Promise<{ error?: string }>;

      chooseDirectory: () => Promise<string | ''>;
      openDirectory: (path: string) => Promise<{ success: boolean; error?: string }>;

      getSettings: () => Promise<AppConfig>;
      updateSettings: (newPartialConfig: Partial<AppConfig>) => Promise<boolean>;

      registerToastReady: () => Promise<any>;
      onShowToast: (callback: (data: { message: string; duration: number }) => void) => () => void;
    }
  }
}

export {};