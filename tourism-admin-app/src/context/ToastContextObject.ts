import { createContext } from 'react';

export interface ToastOptionsInternal {
  message: string;
  severity?: 'success' | 'danger' | 'warning' | 'neutral';
  autoHideMs?: number;
}
export interface ToastContextValue {
  showToast: (opts: ToastOptionsInternal) => void;
}
export const ToastContext = createContext<ToastContextValue | undefined>(undefined);
