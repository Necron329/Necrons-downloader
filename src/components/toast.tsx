import { useToast } from '../contexts/toastContext';

const styles = {
  wrapper: "fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none",
  toast: "pointer-events-auto flex items-center justify-between p-4 min-w-[300px] max-w-[400px] bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl animate-in fade-in slide-in-from-right-5 cursor-pointer hover:border-zinc-700 transition-colors",
  content: "flex items-center",
  icon: "w-5 h-5 text-indigo-500 mr-3 flex-shrink-0",
  message: "text-sm font-medium text-zinc-200 break-words",
  closeHint: "text-[9px] text-zinc-600 ml-4 uppercase tracking-widest"
};

export default function Toast() {
  const { toasts, removeToast } = useToast();

  return (
    <div className={styles.wrapper}>
      {toasts.map((t) => (
        <div key={t.id} className={styles.toast} onClick={() => removeToast(t.id)}>
          <div className={styles.content}>
            <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={styles.message}>{t.message}</span>
          </div>
          {!t.duration && <span className={styles.closeHint}>Click to close</span>}
        </div>
      ))}
    </div>
  );
}