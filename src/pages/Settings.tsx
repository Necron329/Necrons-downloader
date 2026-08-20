import { Loader2 } from "lucide-react";
import { useSettingsService } from "../contexts/SettingsContext";
import { styles } from "./Settings.styles";

export default function Settings() {
  const { settings, setSettings, updateSettings, checkForUpdates, checking, appVersion } = useSettingsService();

  const handleCheckForUpdates = () => {
    checkForUpdates();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Settings</h1>

      <div className={styles.configSection}>
        <h3 className={styles.configTitle}>Configuration</h3>

        <div className={styles.settingsGrid}>
          <label className={styles.checkboxWrapper}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={settings.autoUpdate}
              onChange={(e) => {
                const isChecked = e.target.checked;
                updateSettings({ isAutoUpdateEnabled: isChecked });
                setSettings(prev => ({ ...prev, autoUpdate: isChecked }));
              }}
            />
            <span className={styles.checkboxLabel}>Automatic updates</span>
          </label>

          <div className="flex sm:justify-end">
            <button
              type="button"
              onClick={handleCheckForUpdates}
              disabled={checking}
              className={styles.updateBtn}
            >
              {checking && <Loader2 className="animate-spin h-4 w-4" />}
              {checking ? "Checking..." : "Check for update"}
            </button>
          </div>
        </div>

        {appVersion && (
          <p className="text-xs text-gray-400 mt-4">Current app version: {appVersion}</p>
        )}
      </div>
    </div>
  );
}

