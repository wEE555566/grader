'use client';

import styles from './QkSpinner.module.css';

interface QkSpinnerProps {
  /** Visual size of the spinner. Default: 'md'. */
  size?: 'sm' | 'md' | 'lg';
  /** Screen-reader label. Default: 'กำลังโหลด'. Pass empty string to hide from SR. */
  label?: string;
  /** Extra class name for positioning or colour overrides. */
  className?: string;
}

/**
 * QkSpinner CSS-only loading indicator using the QooKru primary colour.
 *
 * Replaces the per-module `@keyframes spin` pattern that appears in 10+
 * CSS module files. Use this component for all loading states.
 *
 * ```tsx
 * // Inline (button / list row)
 * <QkSpinner size="sm" />
 *
 * // Page-level loading block
 * <div className={styles.loadingState} aria-busy="true">
 *   <QkSpinner size="lg" label="กำลังโหลดข้อสอบ..." />
 *   <p>กำลังโหลด...</p>
 * </div>
 * ```
 */
export default function QkSpinner({ size = 'md', label = 'กำลังโหลด', className }: QkSpinnerProps) {
  return (
    <span
      className={`${styles.spinner} ${styles[size]}${className ? ` ${className}` : ''}`}
      role="status"
      aria-label={label || undefined}
      aria-hidden={!label || undefined}
    />
  );
}
