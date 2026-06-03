export type StatusType =
  | 'idle'
  | 'ready'
  | 'downloading'
  | 'success'
  | 'error';

export interface VideoMetadata {
  title: string;
  duration?: number;
  thumbnail?: string;
  author?: string;
  url: string;
}

type BaseRequest = {
  url: string;
  isPlaylist?: boolean;
};

export type FetchRequest = BaseRequest & {
  type: 'fetch';
  format?: string;
  flatPlaylist?: boolean;
};

export type DownloadRequest = BaseRequest & {
  type: 'download';
  outputPath: string;
  format?: string;
  quality?: 'best' | 'worst';
};

export type YtDlpRequest = FetchRequest | DownloadRequest;