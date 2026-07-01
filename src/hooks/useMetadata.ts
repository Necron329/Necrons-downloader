import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';

export interface FileMetadata {
  title: string;
  author: string;
  description: string;
  thumbnailPath: string;
}

export default function useMetadata() {
  const { addToast } = useToast();

  const [filePath, setFilePath] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [metadata, setMetadata] = useState<FileMetadata>({
    title: '',
    author: '',
    description: '',
    thumbnailPath: '',
  });

  const selectMediaFile = async () => {
    try {
      // Wymaga dodania w preload.ts: window.electronAPI.selectMediaFile()
      const path = await (window as any).electronAPI.selectMediaFile();
      if (path) {
        setFilePath(path);
        // Opcjonalnie: automatyczne ładowanie istniejących metadanych
        // loadMetadata(path);
      }
    } catch (error) {
      addToast('Error selecting file.', 5000);
      console.error('Error selecting file:', error);
    }
  };

  const selectThumbnail = async () => {
    try {
      // Wymaga dodania w preload.ts: window.electronAPI.selectImageFile()
      const path = await (window as any).electronAPI.selectImageFile();
      if (path) {
        setMetadata(prev => ({ ...prev, thumbnailPath: path }));
      }
    } catch (error) {
      addToast('Error selecting thumbnail.', 5000);
      console.error('Error selecting thumbnail:', error);
    }
  };

  const saveMetadata = async () => {
    if (!filePath) return;
    setStatus('processing');

    try {
      // Wymaga dodania w preload.ts: window.electronAPI.updateMetadata(...)
      const result = await (window as any).electronAPI.updateMetadata(filePath, metadata);
      
      if (result.success) {
        setStatus('success');
        addToast('Metadata updated successfully.', 3000);
      } else {
        setStatus('error');
        addToast(`Error: ${result.error}`, 5000);
      }
    } catch (error) {
      setStatus('error');
      addToast('Error saving metadata, check console.', 5000);
      console.error('Error saving metadata:', error);
    }
  };

  const handleMetadataChange = (field: keyof FileMetadata, value: string) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
  };

  const clearState = () => {
    setFilePath('');
    setMetadata({ title: '', author: '', description: '', thumbnailPath: '' });
    setStatus('idle');
  };

  return {
    filePath,
    metadata,
    status,
    selectMediaFile,
    selectThumbnail,
    saveMetadata,
    handleMetadataChange,
    clearState
  } as const;
}