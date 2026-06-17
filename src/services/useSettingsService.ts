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
    updateSettings
  };
}