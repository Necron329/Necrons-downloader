import React, { createContext, useContext } from 'react';
import useMetadataRaw from '../hooks/useMetadata';

type MetadataContextType = ReturnType<typeof useMetadataRaw>;

const MetadataContext = createContext<MetadataContextType | undefined>(undefined);

export function MetadataProvider({ children }: { children: React.ReactNode }) {
  const metadataService = useMetadataRaw();

  return (
    <MetadataContext.Provider value={metadataService}>
      {children}
    </MetadataContext.Provider>
  );
}

export function useMetadataService() {
  const context = useContext(MetadataContext);
  if (!context) {
    throw new Error('useMetadataService must be used within a MetadataProvider');
  }
  return context;
}