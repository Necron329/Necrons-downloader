import { Loader2 } from "lucide-react";
import { useSettingsService } from "../contexts/settingsProvider";

const styles = {
  container: "relative overflow-hidden w-full p-6 max-w-xl mx-auto mt-10 bg-zinc-900 text-zinc-100 font-sans rounded-2xl border border-zinc-800 shadow-2xl",
  header: "text-xl font-semibold tracking-tight mb-6 text-white",
  configSection: "mt-6 pt-4 border-t border-zinc-800",
  configTitle: "text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-3",
  settingsGrid: "grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 items-center",
  checkboxWrapper: "flex items-center space-x-2 cursor-pointer group",
  checkbox: "w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-offset-zinc-900 focus:ring-indigo-500 transition-all cursor-pointer",
  checkboxLabel: "text-[11px] text-zinc-500 group-hover:text-zinc-300 transition-colors",
  updateBtn: "w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.97] bg-zinc-100 text-zinc-900 hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-500 cursor-pointer disabled:cursor-default flex items-center justify-center gap-2",
};

export default function Settings() {
  const { settings, setSettings, updateSettings, checking, setChecking } = useSettingsService();

  const handleCheckForUpdates = () => {
    setChecking(true);
    
    // TODO: Implement actual update verification logic using the backend
    setTimeout(() => setChecking(false), 2000);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Settings</h1>

      <div className={styles.configSection}>
        <h3 className={styles.configTitle}>Configuration</h3>

        <div className={styles.settingsGrid}>
          {/* Automatic updates toggle switch */}
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

          {/* Manual update action trigger */}
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
      </div>
    </div>
  );
}