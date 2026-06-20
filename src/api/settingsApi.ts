import { AppConfig } from '../../shared/types/configData';

export const settingsApi = () => {
  
  const getSettings = async (): Promise<AppConfig> => {
    try {
      const savedConfig = await window.electronAPI.getSettings();
      return savedConfig;
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      throw err;
    }
  };

  const updateSettings = async (newPartialConfig: Partial<AppConfig>): Promise<boolean> => {
    try {
      const success = await window.electronAPI.updateSettings(newPartialConfig);
      if (!success) {
        throw new Error('Electron Main rejected the update');
      }
      return success;
    } catch (err) {
      console.error('Failed to update settings:', err);
      throw err;
    }
  };

  return {
    getSettings,
    updateSettings,
  };
};