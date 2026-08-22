import { useDownloadService } from "../contexts/DownloadContext";
import VideoDisplayer from "../components/VideoDisplayer";
import SettingInfo from "../components/SettingInfo";
import { Loader2, X, FolderOpen, Copy, ExternalLink } from "lucide-react";
import { styles } from "./Downloads.styles";

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
    videoCompatibility,
    setVideoCompatibility,
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
          videoCompatibility,
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

          {format === 'mp4' && (
            <div className={styles.settingRowWithInfo}>
              <div className="flex items-center gap-2">
                <label className={styles.label}>Video Compatibility</label>
                <SettingInfo
                  title="Video Compatibility"
                  description={
                    <span>
                      <strong>Best Quality — Recommended: </strong>
                      Normal downloads. Keeps the best quality without unnecessary conversion. Works with most players and apps. Choose this unless you need the video for editing or encoding.
                      <br /><br />
                      <strong>Maximum Compatibility: </strong>
                      For editing in software like DaVinci Resolve. Converts to H.264/AAC MP4 for broader compatibility. May take longer and slightly reduce quality.
                    </span>
                  }
                />
              </div>
              <select
                className={styles.selectWide}
                value={videoCompatibility}
                onChange={(e) => {
                  const next = e.target.value as 'best' | 'compatible';
                  setVideoCompatibility(next);
                  updateSettings({ videoCompatibility: next });
                }}
              >
                <option value="best">Best Quality</option>
                <option value="compatible">Maximum Compatibility</option>
              </select>
            </div>
          )}

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

