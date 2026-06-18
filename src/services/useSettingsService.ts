import { useState, useEffect } from "react";
import { AppConfig } from "../../shared/types/configData";
import { useConfigService } from "./useConfigService";

export interface SettingsState {
  autoUpdate: boolean;
}

const defaultSettings: SettingsState = {
  autoUpdate: true
};

export default function useSettingsService() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [checking, setChecking] = useState<boolean>(false);

  const { getSettings, updateSettings } = useConfigService();

  const checkForUpdates = async () => {
    setChecking(true);
    try {
      const result = await window.electronAPI.checkForUpdates();
      if (result && result.error) {
        console.error("Error checking for updates:", result.error);
      }
    } catch (error) {
      console.error("Error while checking for updates:", error);
    } finally {
      setChecking(false);
    
    }
  };

  useEffect(() => {
          const initSettings = async () => {
              try {
                  const settings: AppConfig = await getSettings();
                  if (settings) {
                    setSettings({
                      autoUpdate: settings.isAutoUpdateEnabled
                    });
                  }
              } catch (error) {
                  console.error("error while loading settings page values:", error);
              }
          };
  
          initSettings();
      }, []);

  return {
    settings,
    setSettings,
    checking,
    setChecking,
    updateSettings,
    checkForUpdates
  };
}