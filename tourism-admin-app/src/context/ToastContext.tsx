import React, { useCallback, useState, type ReactNode, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/joy';
import { ToastContext, type ToastOptionsInternal } from './ToastContextObject';

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<ToastOptionsInternal['severity']>('success');
  const [autoHideMs, setAutoHideMs] = useState<number>(3000);

  const showToast = useCallback(({ message, severity = 'success', autoHideMs = 3000 }: ToastOptionsInternal) => {
    setMessage(message);
    setSeverity(severity);
    setAutoHideMs(autoHideMs);
    setOpen(true);
  }, []);

  // Auto-hide timer management
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => setOpen(false), autoHideMs);
    return () => clearTimeout(id);
  }, [open, autoHideMs]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={open}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        variant="soft"
        sx={{ zIndex: (theme) => theme.zIndex.tooltip + 10 }}
      >
        <Alert color={severity} variant="soft" sx={{ boxShadow: 'sm' }}>{message}</Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};

// Hook is defined in useToast.ts to satisfy fast refresh constraints.
