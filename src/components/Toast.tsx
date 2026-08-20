import { useToast } from '../contexts/ToastContext';
import { Info } from 'lucide-react';
import clsx from "clsx";
import { styles } from './Toast.styles';

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

