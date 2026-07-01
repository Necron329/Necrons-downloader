import { useToast } from '../contexts/ToastContext';
import { Info } from 'lucide-react';
import clsx from "clsx";

export default function Toast() {
  const { toasts, triggerExit } = useToast();

  return (
    <div className={styles.container}>
      {toasts.map((t) => (
        <div 
          key={t.id} 
          onClick={() => triggerExit(t.id)}
          className={clsx(styles.toastItem, t.isExiting ? 'animate-toast-out' : 'animate-toast-in')}
        >
          <div className={styles.iconWrapper}>
            <Info size={20} />
          </div>

          <div className={styles.content}>
            <span className={styles.message}>
              {t.message}
            </span>
            {!t.duration && (
              <span className={styles.dismissHint}>
                Click to dismiss
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: "fixed top-5 right-5 z-9999 flex flex-col gap-3 pointer-events-none w-full max-w-87.5",
  toastItem: "pointer-events-auto flex items-start p-4 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl cursor-pointer hover:border-zinc-700 transition-colors duration-200 no-select toast-active-scale",
  iconWrapper: "w-5 h-5 text-indigo-500 mt-0.5 shrink-0 mr-3",
  content: "flex flex-col gap-1 min-w-0 flex-1",
  message: "text-[13px] font-medium text-zinc-200 leading-relaxed break-words whitespace-pre-wrap",
  dismissHint: "text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1",
};