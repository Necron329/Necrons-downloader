import { useState } from "react";

export interface SettingsState {
  autoUpdate: boolean;
}

const defaultSettings: SettingsState = {
  autoUpdate: true
};

export default function useSettingsService() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [checking, setChecking] = useState<boolean>(false);
  const updateSettings = (newSettings: Partial<SettingsState>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }

  return {
    settings,
    setSettings,
    checking,
    setChecking,
    updateSettings
  };
}