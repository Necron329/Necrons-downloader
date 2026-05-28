import React, { createContext, useContext, useState, useCallback } from 'react';

interface ToastItem {
  id: number;
  message: string;
  duration?: number;
  isExiting?: boolean;
}

interface ToastContextType {
  showToast: (message: string, duration?: number) => void;
  triggerExit: (id: number) => void;
  toasts: ToastItem[];
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeCompletely = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const triggerExit = useCallback((id: number) => {
    setToasts((prev) => 
      prev.map((t) => t.id === id ? { ...t, isExiting: true } : t)
    );
    setTimeout(() => removeCompletely(id), 200);
  }, [removeCompletely]);

  const showToast = useCallback((message: string, duration?: number) => {
    const id = Math.random() + Date.now();
    setToasts((prev) => [...prev, { id, message, duration, isExiting: false }]);

    if (duration && duration > 0) {
      setTimeout(() => triggerExit(id), duration);
    }
  }, [triggerExit]);

  return (
    <ToastContext.Provider value={{ showToast, triggerExit, toasts }}>
      {children}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};