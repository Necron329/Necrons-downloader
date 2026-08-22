export interface AppConfig {
  quality: 'best' | 'worst';
  format: string;
  outputPath: string;
  isPlaylist: boolean;
  isAutoUpdateEnabled: boolean;
  videoCompatibility: 'best' | 'compatible';
}