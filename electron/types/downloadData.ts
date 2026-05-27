export type statusType = 'idle' | 'analyzing' | 'ready' | 'downloading' | 'success' | 'error';

export interface VideoMetadata {
  title: string;
  duration: number;
  thumbnail: string;
  author: string;
  isPlaylist: boolean;
  url: string;
}

export interface DownloadRequest {
  url: string;
  type: 'video' | 'playlist';
}