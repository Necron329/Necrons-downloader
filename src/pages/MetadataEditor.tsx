import { useMetadataService } from "../contexts/MetadataContext";
import { Loader2, FileAudio, Image as ImageIcon, X, Save } from "lucide-react";

export default function MetadataEditor() {
  const {
    filePath,
    metadata,
    status,
    selectMediaFile,
    selectThumbnail,
    saveMetadata,
    handleMetadataChange,
    clearState
  } = useMetadataService();

  const isProcessing = status === 'processing';

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Metadata Editor</h1>

      <div className={styles.fileSection}>
        <button 
          onClick={selectMediaFile} 
          disabled={isProcessing}
          className={styles.fileBtn}
        >
          <FileAudio className="w-5 h-5" />
          {filePath ? "Change Media File" : "Select MP3 / MP4 File"}
        </button>

        {filePath && (
          <div className={styles.selectedFile}>
            <span className={styles.filePath} title={filePath}>
              {filePath.split('\\').pop() || filePath.split('/').pop()}
            </span>
            <button onClick={clearState} className={styles.clearBtn} disabled={isProcessing}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {filePath && (
        <div className={styles.editorSection}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Title</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Song / Video Title"
              value={metadata.title}
              onChange={(e) => handleMetadataChange('title', e.target.value)}
              disabled={isProcessing}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Author / Artist</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Artist Name"
              value={metadata.author}
              onChange={(e) => handleMetadataChange('author', e.target.value)}
              disabled={isProcessing}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              placeholder="Add description..."
              value={metadata.description}
              onChange={(e) => handleMetadataChange('description', e.target.value)}
              disabled={isProcessing}
              rows={3}
            />
          </div>

          <div className={styles.thumbnailSection}>
            <label className={styles.label}>Thumbnail (Cover Art)</label>
            <div className={styles.thumbnailWrapper}>
              {metadata.thumbnailPath ? (
                <div className={styles.thumbnailPreview}>
                  <img src={`file://${metadata.thumbnailPath}`} alt="Cover" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className={styles.thumbnailPlaceholder}>
                  <ImageIcon className="w-8 h-8 text-zinc-700" />
                </div>
              )}
              
              <div className="flex flex-col gap-2 flex-1">
                <button 
                  onClick={selectThumbnail} 
                  disabled={isProcessing}
                  className={styles.secondaryBtn}
                >
                  Browse Image
                </button>
                {metadata.thumbnailPath && (
                  <button 
                    onClick={() => handleMetadataChange('thumbnailPath', '')} 
                    disabled={isProcessing}
                    className={styles.dangerBtn}
                  >
                    Remove Cover
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className={styles.actionSection}>
            <button
              onClick={saveMetadata}
              disabled={isProcessing}
              className={styles.saveBtn}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Metadata
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: "relative overflow-hidden w-full p-6 max-w-xl mx-auto mt-10 bg-zinc-900 text-zinc-100 font-sans rounded-2xl border border-zinc-800 shadow-2xl",
  header: "text-xl font-semibold tracking-tight mb-6 text-white",
  fileSection: "flex flex-col gap-3",
  fileBtn: "w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-zinc-700 hover:border-indigo-500 hover:bg-zinc-800/50 rounded-lg transition-colors text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
  selectedFile: "flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-lg",
  filePath: "text-xs text-indigo-400 font-mono truncate mr-2",
  clearBtn: "text-zinc-500 hover:text-red-400 transition-colors cursor-pointer",
  editorSection: "mt-6 pt-6 border-t border-zinc-800 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2",
  inputGroup: "flex flex-col gap-1.5",
  label: "text-xs font-medium text-zinc-400",
  input: "w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-sm placeholder:text-zinc-700",
  textarea: "w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-sm placeholder:text-zinc-700 resize-none",
  thumbnailSection: "flex flex-col gap-1.5 mt-2",
  thumbnailWrapper: "flex items-center gap-4",
  thumbnailPreview: "w-24 h-24 rounded-lg border border-zinc-800 overflow-hidden bg-zinc-950 flex-shrink-0",
  thumbnailPlaceholder: "w-24 h-24 rounded-lg border border-zinc-800 border-dashed bg-zinc-950 flex items-center justify-center flex-shrink-0",
  secondaryBtn: "px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-50",
  dangerBtn: "px-4 py-2 bg-zinc-950 border border-red-900/30 text-red-400 hover:bg-red-950/30 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-50",
  actionSection: "mt-4 pt-4 border-t border-zinc-800 flex justify-end",
  saveBtn: "flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-sm font-bold rounded shadow-lg shadow-indigo-500/10 transition-all active:scale-95 cursor-pointer disabled:cursor-default",
};