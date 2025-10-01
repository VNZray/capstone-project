import React, { useEffect, useRef } from 'react';

type Action = {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

type BaseEditModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  actions?: Action[];
  children?: React.ReactNode;
  maxWidth?: string | number;
};

/**
 * BaseEditModal
 * A simple, accessible modal dialog without external UI libraries.
 * - Click outside to close
 * - Escape key closes
 * - Focus is moved to the dialog when opened (basic)
 * - Renders header, description, children, and action buttons
 *
 * Usage example (commented at bottom of file):
 */
export default function BaseEditModal({
  open,
  onClose,
  title = 'Edit',
  description,
  actions = [],
  children,
  maxWidth = 640,
}: BaseEditModalProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      // basic focus trap: keep focus inside dialog when open and Tab pressed
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    }

    if (open) {
      document.addEventListener('keydown', onKeyDown);
      // save scroll and prevent body scroll
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // focus the dialog for accessibility
      setTimeout(() => dialogRef.current?.focus(), 0);
      return () => {
        document.removeEventListener('keydown', onKeyDown);
        document.body.style.overflow = prev;
      };
    }
    return;
  }, [open, onClose]);

  if (!open) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '24px',
  };

  const dialogStyle: React.CSSProperties = {
    background: '#fff',
    borderRadius: 12,
    width: '100%',
    maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : String(maxWidth),
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
    padding: '20px',
    outline: 'none',
  };

  const closeBtnStyle: React.CSSProperties = {
    position: 'absolute',
    top: 12,
    right: 12,
    background: 'transparent',
    border: 'none',
    fontSize: 20,
    cursor: 'pointer',
    color: '#6b7280',
  };

  const headerStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
    color: '#111827',
  };

  const descriptionStyle: React.CSSProperties = {
    margin: '8px 0 16px',
    color: '#6b7280',
    fontSize: 14,
  };

  const actionsContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: 20,
    flexWrap: 'wrap',
  };

  const baseButtonStyle: React.CSSProperties = {
    padding: '8px 14px',
    fontSize: 14,
    borderRadius: 8,
    cursor: 'pointer',
    border: 'none',
  };

  const primaryStyle: React.CSSProperties = {
    ...baseButtonStyle,
    background: 'var(--primary-color)',
    color: '#fff',
  };

  const secondaryStyle: React.CSSProperties = {
    ...baseButtonStyle,
    background: 'transparent',
    color: '#374151',
    border: '1px solid transparent',
  };

  return (
    <div
      ref={overlayRef}
      style={overlayStyle}
      role="presentation"
      onMouseDown={(e) => {
        // close when clicking on overlay background
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="base-edit-modal-title"
        tabIndex={-1}
        style={{ position: 'relative', ...dialogStyle }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Close"
          onClick={onClose}
          style={closeBtnStyle}
          onMouseOver={(e) => (e.currentTarget.style.color = '#374151')}
          onMouseOut={(e) => (e.currentTarget.style.color = '#6b7280')}
        >
          ✕
        </button>

        <h2 id="base-edit-modal-title" style={headerStyle}>
          {title}
        </h2>
        {description && <p style={descriptionStyle}>{description}</p>}

        <div>{children}</div>

        <div style={actionsContainerStyle}>
          {actions.map((a, idx) => (
            <button
              key={idx}
              onClick={a.onClick}
              disabled={a.disabled}
              style={a.variant === 'primary' ? primaryStyle : secondaryStyle}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Usage example:
//
// <BaseEditModal
//   open={open}
//   onClose={() => setOpen(false)}
//   title="Edit Business Details"
//   description="Update your business information and contact details"
//   actions={[
//     { label: 'Cancel', onClick: () => setOpen(false) },
//     { label: 'Reset', onClick: () => { /* reset logic */ } },
//     { label: 'Save Changes', onClick: () => { /* save logic */ }, variant: 'primary' }
//   ]}
// >
//   <form>...your form fields...</form>
// </BaseEditModal>
