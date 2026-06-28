import { useState, useEffect } from 'react';

export interface ToastData {
  id: string;
  message: string;
  isExiting?: boolean;
  duration?: number;
}

export default function useToastService() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const triggerExit = (id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  };

  const addToast = (message: string, duration: number = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        triggerExit(id);
      }, duration);
    }
  };

  useEffect(() => {
    if (window.electronAPI && typeof window.electronAPI.onShowToast === 'function') {
      const unsubscribe = window.electronAPI.onShowToast((data: any) => {
        addToast(data.message, data.duration);
      });

      if (typeof window.electronAPI.registerToastReady === 'function') {
        window.electronAPI.registerToastReady();
      }

      return () => unsubscribe();
    }
  }, []);

  return { toasts, addToast, triggerExit };
}