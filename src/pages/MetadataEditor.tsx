import { useMetadataService } from "../contexts/MetadataContext";
import { Loader2, FileAudio, Image as ImageIcon, X, Save } from "lucide-react";
import { styles } from "./MetadataEditor.styles";

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

