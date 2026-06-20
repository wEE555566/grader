'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimesCircle, FaTimes } from 'react-icons/fa';
import styles from './ToastProvider.module.css';

type ToastKind = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  id: number;
  resolve: (ok: boolean) => void;
}

interface ToastApi {
  /** Fire-and-forget toast. */
  toast: (message: string, kind?: ToastKind) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
  /** Promise-based replacement for window.confirm resolves true/false. */
  confirm: (opts: ConfirmOptions | string) => Promise<boolean>;
}

const ToastContext = createContext<ToastApi | null>(null);

const ICONS: Record<ToastKind, React.ReactNode> = {
  success: <FaCheckCircle />,
  error: <FaTimesCircle />,
  info: <FaInfoCircle />,
  warning: <FaExclamationTriangle />,
};

export function ToastProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dialog, setDialog] = useState<ConfirmState | null>(null);
  const counter = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = ++counter.current;
    setToasts(prev => [...prev, { id, kind, message }]);
    setTimeout(() => remove(id), 4500);
  }, [remove]);

  const confirm = useCallback((opts: ConfirmOptions | string) => {
    const resolved = typeof opts === 'string' ? { message: opts } : opts;
    return new Promise<boolean>(resolve => {
      setDialog({ id: ++counter.current, resolve, ...resolved });
    });
  }, []);

  const closeDialog = useCallback((ok: boolean) => {
    setDialog(prev => {
      prev?.resolve(ok);
      return null;
    });
  }, []);

  const api = useMemo<ToastApi>(() => ({
    toast,
    success: (m: string) => toast(m, 'success'),
    error: (m: string) => toast(m, 'error'),
    info: (m: string) => toast(m, 'info'),
    warning: (m: string) => toast(m, 'warning'),
    confirm,
  }), [toast, confirm]);

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* Toast stack */}
      <div className={styles.stack} role="region" aria-live="polite" aria-label="การแจ้งเตือน">
        {toasts.map(t => (
          <div key={t.id} className={`${styles.toast} ${styles[t.kind]}`} role="status">
            <span className={styles.icon}>{ICONS[t.kind]}</span>
            <span className={styles.msg}>{t.message}</span>
            <button className={styles.close} onClick={() => remove(t.id)} aria-label="ปิด">
              <FaTimes />
            </button>
          </div>
        ))}
      </div>

      {/* Confirm dialog */}
      {dialog && (
        <div className={styles.overlay} onClick={() => closeDialog(false)}>
          <div
            className={styles.dialog}
            role="alertdialog"
            aria-modal="true"
            aria-label={dialog.title || 'ยืนยัน'}
            onClick={(e) => e.stopPropagation()}
          >
            {dialog.title && <h3 className={styles.dialogTitle}>{dialog.title}</h3>}
            <p className={styles.dialogMsg}>{dialog.message}</p>
            <div className={styles.dialogActions}>
              <button className={styles.btnCancel} onClick={() => closeDialog(false)}>
                {dialog.cancelLabel || 'ยกเลิก'}
              </button>
              <button
                className={dialog.danger ? styles.btnDanger : styles.btnConfirm}
                onClick={() => closeDialog(true)}
                autoFocus
              >
                {dialog.confirmLabel || 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

/** Access toasts + confirm. Throws if used outside ToastProvider. */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
