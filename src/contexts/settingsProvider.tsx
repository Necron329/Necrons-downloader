import React, { createContext, useContext } from 'react';
import useSettingsServiceRaw from '../hooks/useSettings';

type SettingsContextType = ReturnType<typeof useSettingsServiceRaw>;

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const settingsService = useSettingsServiceRaw();

  return (
    <SettingsContext.Provider value={settingsService}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsService() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsService must be used within a SettingsProvider');
  }
  return context;
}