import { useContext } from 'react';
import { ToastProvider } from './ToastContext';
import { ToastContext } from './ToastContextObject';

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within <ToastProvider>');
  return context;
};

export { ToastProvider };
