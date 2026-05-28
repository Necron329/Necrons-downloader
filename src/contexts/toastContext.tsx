import React, { createContext, useContext, useState, useCallback } from 'react';

interface ToastItem {
  id: number;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, duration?: number) => void;
  removeToast: (id: number) => void;
  toasts: ToastItem[];
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, duration?: number) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, duration }]);

    if (duration && duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast, toasts }}>
      {children}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};