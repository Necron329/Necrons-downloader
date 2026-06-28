  import { createContext, useContext } from 'react';
  import useDownloadServiceRaw from '../hooks/useDownload';

  type DownloadContextType = ReturnType<typeof useDownloadServiceRaw>;

  const DownloadContext = createContext<DownloadContextType | undefined>(undefined);

  export function DownloadProvider({ children }: { children: React.ReactNode }) {
    const downloadService = useDownloadServiceRaw();

    return (
      <DownloadContext.Provider value={downloadService}>
        {children}
      </DownloadContext.Provider>
    );
  }

  export function useDownloadService() {
    const context = useContext(DownloadContext);
    if (!context) {
      throw new Error('useDownloadService must be used within a DownloadProvider');
    }
    return context;
  }