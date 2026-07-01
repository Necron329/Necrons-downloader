import { useDownloadService } from "../contexts/DownloadContext";
import VideoDisplayer from "../components/VideoDisplayer";
import { Loader2, X, FolderOpen, Copy, ExternalLink } from "lucide-react";

export default function Downloads() {
  const {
    getVideoMetadata,
    videoData,
    processDownloadLink,
    isLoading,
    status,
    downloadUrl,
    setDownloadUrl,
    isValid,
    setIsValid,
    analyzed,
    setAnalyzed,
    format,
    setFormat,
    quality,
    setQuality,
    isPlaylist,
    setIsPlaylist,
    outputPath,
    setOutputPath,
    chooseDirectory,
    openDirectoryInExplorer,
    updateSettings,
    progress
  } = useDownloadService();

  const validateLink = (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const handleAnalyze = async () => {
    if (isValid) {
      try {
        await getVideoMetadata();
        setAnalyzed(true);
      } catch (error) {
        setAnalyzed(false);
        console.error('[Downloads] Link analysis failed:', error);
      }
    } else {
      setAnalyzed(false);
    }
  };

  const handleDownload = () => {
    if (isValid && analyzed) {
      try {
        processDownloadLink({
          type: "download",
          url: downloadUrl,
          format,
          quality,
          isPlaylist,
          outputPath,
        });
      } catch (error) {
        console.error('[Downloads] Execution failed:', error);
      }
    }
  };

  const handleClear = () => {
    setDownloadUrl("");
    setIsValid(false);
    setAnalyzed(false);
  };

  const handleSelectFolder = async () => {
    await chooseDirectory();
  };

  const handleCopyPath = () => {
    if (outputPath) {
      navigator.clipboard.writeText(outputPath);
    }
  };

  const handleOpenExplorer = () => {
    if (outputPath) {
      openDirectoryInExplorer(outputPath);
    }
  };

  return (
    <div className={styles.container}>
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <Loader2 className={styles.loaderIcon} />
          <span className={styles.loadingText}>Loading settings...</span>
        </div>
      )}

      <h1 className={styles.header}>Downloads</h1>

      <div className={styles.inputArea}>
        <input
          type="text"
          placeholder="Paste link here..."
          value={downloadUrl}
          onChange={(e) => {
            const val = e.target.value;
            setDownloadUrl(val);
            setIsValid(validateLink(val));
          }}
          className={styles.input}
        />
        {downloadUrl && (
          <button onClick={handleClear} className={styles.clearBtn}>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className={styles.analyzeBtnWrapper}>
        <button
          onClick={handleAnalyze}
          disabled={!downloadUrl || status === "fetching"}
          className={styles.analyzeBtn}
        >
          {status === "fetching" ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      <div className={styles.configSection}>
        <h3 className={styles.configTitle}>Configuration</h3>

        <div className={styles.settingsGrid}>
          <div className={styles.settingRow}>
            <label className={styles.label}>Format</label>
            <select
              className={styles.select}
              value={format}
              onChange={(e) => {
                const nextFormat = e.target.value;
                setFormat(nextFormat);
                updateSettings({ format: nextFormat });
              }}
            >
              <option value="mp4">MP4</option>
              <option value="mp3">MP3</option>
              <option value="subtitles">Subtitles (txt)</option>
            </select>
          </div>

          <div className={styles.settingRow}>
            <label className={styles.label}>Quality</label>
            <select
              className={styles.select}
              value={quality}
              onChange={(e) => {
                const nextQuality = e.target.value as "best" | "worst";
                setQuality(nextQuality);
                updateSettings({ quality: nextQuality });
              }}
            >
              <option value="best">Best</option>
              <option value="worst">Worst</option>
            </select>
          </div>

          <div className={styles.outputPathWrapper}>
            <label className={styles.label}>Output Path</label>
            <div className={styles.outputPathInputGroup}>
              <input
                type="text"
                placeholder="e.g. C:\Users\Name\Downloads"
                className={styles.outputPathInput}
                value={outputPath || ""}
                onChange={(e) => {
                  const nextPath = e.target.value;
                  setOutputPath(nextPath);
                  updateSettings({ outputPath: nextPath });
                }}
              />
              <button
                type="button"
                onClick={handleCopyPath}
                className={styles.iconBtnMiddle}
                title="Copy path"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleOpenExplorer}
                className={styles.iconBtnMiddle}
                title="Open in File Explorer"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleSelectFolder}
                className={styles.iconBtnRight}
                title="Select folder"
              >
                <FolderOpen className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <label className={styles.checkboxWrapper}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={isPlaylist}
            onChange={(e) => {
              const nextIsPlaylist = e.target.checked;
              setIsPlaylist(nextIsPlaylist);
              updateSettings({ isPlaylist: nextIsPlaylist });
            }}
          />
          <span className={styles.checkboxLabel}>Playlist mode</span>
        </label>
      </div>

      {analyzed && videoData.length > 0 && (
        <VideoDisplayer
          videos={videoData}
          onDownload={handleDownload}
          status={status}
          progress={progress}
        />
      )}
    </div>
  );
}

const styles = {
  container: "relative overflow-hidden w-full p-6 max-w-xl mx-auto mt-10 bg-zinc-900 text-zinc-100 font-sans rounded-2xl border border-zinc-800 shadow-2xl",
  header: "text-xl font-semibold tracking-tight mb-6 text-white",
  loadingOverlay: "absolute inset-0 bg-zinc-950/70 backdrop-blur-sm flex flex-col items-center justify-center z-50 transition-all duration-300",
  loaderIcon: "animate-spin h-8 w-8 text-indigo-500 mb-2",
  loadingText: "text-xs font-medium text-zinc-400",
  inputArea: "relative mb-4",
  input: "w-full pl-4 pr-10 py-2 bg-zinc-950 border border-zinc-800 rounded-lg outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 placeholder:text-zinc-600 text-sm",
  clearBtn: "absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer",
  analyzeBtnWrapper: "flex justify-center",
  analyzeBtn: "w-full px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.97] bg-zinc-100 text-zinc-900 hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-500 cursor-pointer disabled:cursor-default",
  configSection: "mt-6 pt-4 border-t border-zinc-800",
  configTitle: "text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-3",
  settingsGrid: "grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4",
  settingRow: "flex items-center justify-between gap-4",
  label: "text-xs font-medium text-zinc-400 whitespace-nowrap",
  select: "w-32 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs outline-none focus:border-indigo-500 disabled:opacity-30 transition-all cursor-pointer",
  outputPathWrapper: "flex flex-col gap-2 sm:col-span-2 mt-2",
  outputPathInputGroup: "flex items-center w-full",
  outputPathInput: "flex-1 bg-zinc-950 border border-zinc-800 rounded-l px-3 py-1.5 text-xs outline-none focus:border-indigo-500 transition-all text-zinc-200 placeholder:text-zinc-700",
  iconBtnMiddle: "p-2 bg-zinc-950 border-y border-r border-zinc-800 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors active:scale-[0.95] cursor-pointer",
  iconBtnRight: "p-2 bg-zinc-950 border-y border-r border-zinc-800 rounded-r text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors active:scale-[0.95] cursor-pointer",
  checkboxWrapper: "flex items-center space-x-2 cursor-pointer group mt-4",
  checkbox: "w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-offset-zinc-900 focus:ring-indigo-500 transition-all cursor-pointer",
  checkboxLabel: "text-[11px] text-zinc-500 group-hover:text-zinc-300 transition-colors",
};