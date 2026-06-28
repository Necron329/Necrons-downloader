import React, { createContext, useContext } from 'react';
import useToastLogic from '../hooks/useToast';

type ToastContextType = ReturnType<typeof useToastLogic>;

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toastService = useToastLogic();

  return (
    <ToastContext.Provider value={toastService}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}