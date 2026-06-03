import { VideoMetadata } from '../../shared/types/downloadData';

interface VideoDisplayerProps {
  videos: VideoMetadata[];
  onDownload: () => void;
  className?: string;
}

const styles = {
  wrapper: "mt-6 p-4 bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col gap-4",
  badgeIndigo: "bg-indigo-950 text-indigo-400 border border-indigo-900 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded",
  badgeZinc: "inline-block bg-zinc-900 text-zinc-400 border border-zinc-800 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
  downloadBtn: "w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded shadow-lg shadow-indigo-500/10 transition-all active:scale-95 flex items-center justify-center gap-2",
  playlistContainer: "flex flex-col gap-3",
  playlistHeader: "flex items-center justify-between border-b border-zinc-900 pb-3",
  playlistScrollArea: "space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800",
  playlistItem: "flex items-center gap-3 text-xs py-1 border-b border-zinc-900/50 last:border-0",
  videoLayout: "flex flex-col sm:flex-row gap-4",
  thumbnailWrapper: "relative w-full sm:w-48 aspect-video rounded-md overflow-hidden bg-zinc-900 border border-zinc-800 flex-shrink-0",
  durationTag: "absolute bottom-1 right-1 bg-zinc-900/90 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded border border-zinc-800 font-mono",
  videoInfo: "flex flex-col justify-between flex-grow min-w-0",
  videoTitle: "text-sm font-medium text-zinc-100 line-clamp-2 leading-snug",
  videoAuthor: "text-xs text-zinc-500 truncate mt-1",
};

const VideoDisplayer: React.FC<VideoDisplayerProps> = ({ videos, onDownload, className = "" }) => {
  if (!videos || videos.length === 0) return null;

  const isPlaylist = videos.length > 1;
  const mainVideo = videos[0];

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`${styles.wrapper} ${className}`}>
      
      {isPlaylist ? (
        <div className={styles.playlistContainer}>
          <div className={styles.playlistHeader}>
            <div className="flex items-center gap-2">
              <span className={styles.badgeIndigo}>Playlist</span>
              <span className="text-zinc-400 text-xs font-medium">
                {videos.length} items detected
              </span>
            </div>
          </div>

          <div className={styles.playlistScrollArea}>
            {videos.map((v, i) => (
              <div key={i} className={styles.playlistItem}>
                <span className="text-zinc-600 font-mono w-4">{i + 1}.</span>
                <span className="text-zinc-300 truncate flex-grow">{v.title}</span>
                {v.duration && (
                  <span className="text-zinc-500 font-mono text-[10px]">
                    {formatDuration(v.duration)}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-2 flex justify-end">
            <button onClick={onDownload} className={styles.downloadBtn}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download All
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.videoLayout}>
          <div className={styles.thumbnailWrapper}>
            <img 
              src={mainVideo.thumbnail || ''} 
              alt={mainVideo.title} 
              className="w-full h-full object-cover"
            />
            {mainVideo.duration && (
              <span className={styles.durationTag}>
                {formatDuration(mainVideo.duration)}
              </span>
            )}
          </div>

          <div className={styles.videoInfo}>
            <div>
              <span className={`${styles.badgeZinc} mb-2`}>Video</span>
              <h2 className={styles.videoTitle}>{mainVideo.title}</h2>
              <p className={styles.videoAuthor}>{mainVideo.author}</p>
            </div>

            <div className="mt-4 flex justify-end">
              <button onClick={onDownload} className={styles.downloadBtn}>
                Download Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoDisplayer;