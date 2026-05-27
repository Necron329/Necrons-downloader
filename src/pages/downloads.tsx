import { useState } from "react";

const styles = {
  container: "p-6 max-w-xl bg-zinc-900 text-zinc-100 font-sans",
  header: "text-xl font-semibold tracking-tight mb-6 text-white",

  inputWrapper: "relative mb-4",
  input:
    "w-full pl-4 pr-10 py-2 bg-zinc-950 border border-zinc-800 rounded-lg outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 placeholder:text-zinc-600 text-sm",
  clearBtn:
    "absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-zinc-500 hover:text-zinc-200 transition-colors",

  button:
    "px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.97] bg-zinc-100 text-zinc-900 hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-500",
  secondaryButton:
    "ml-2 px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.97] bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-zinc-800/50 disabled:text-zinc-600",

  section: "mt-6 pt-4 border-t border-zinc-800",
  sectionTitle:
    "text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-3",

  settingsGrid: "grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2",
  settingRow: "flex items-center justify-between gap-4",
  label: "text-xs font-medium text-zinc-400 whitespace-nowrap",
  select:
    "w-32 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs outline-none focus:border-indigo-500 disabled:opacity-30 transition-all",

  checkboxWrapper: "flex items-center space-x-2 cursor-pointer group mt-4",
  checkbox:
    "w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-offset-zinc-900 focus:ring-indigo-500 transition-all",
};

export default function Downloads() {
  const [link, setLink] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const validateLink = (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const handleAnalyze = () => {
    const valid = validateLink(link);
    setIsValid(valid);
    setAnalyzed(valid);
  };

  const handleClear = () => {
    setLink("");
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Downloads</h1>

      <div className={styles.inputWrapper}>
        <input type="text" placeholder="Paste link here..."value={link}
            onChange={(e) => {
            setLink(e.target.value);
            setAnalyzed(false);
          }} className={styles.input}
        />
        {link && (
          <button onClick={handleClear} className={styles.clearBtn}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex">
        <button
          onClick={handleAnalyze}
          disabled={!link}
          className={styles.button}
        >
          Analyze
        </button>

        <button
          disabled={!analyzed || !isValid}
          className={styles.secondaryButton}
        >
          Download
        </button>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Configuration</h3>

        <div className={styles.settingsGrid}>
          {/* Format Setting */}
          <div className={styles.settingRow}>
            <label className={styles.label}>Format</label>
            <select disabled={!analyzed} className={styles.select}>
              <option>MP4</option>
              <option>MP3</option>
            </select>
          </div>

          {/* Quality Setting */}
          <div className={styles.settingRow}>
            <label className={styles.label}>Quality</label>
            <select disabled={!analyzed} className={styles.select}>
              <option>Best</option>
              <option>Low</option>
            </select>
          </div>
        </div>

        {/* Compact Checkbox */}
        <label className={styles.checkboxWrapper}>
          <input
            type="checkbox"
            disabled={!analyzed}
            className={styles.checkbox}
          />
          <span className="text-[11px] text-zinc-500 group-hover:text-zinc-300 transition-colors">
            Playlist mode
          </span>
        </label>
      </div>
    </div>
  );
}
