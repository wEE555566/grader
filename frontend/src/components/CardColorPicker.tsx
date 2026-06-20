'use client';

import { MouseEvent } from 'react';
import styles from './CardColorPicker.module.css';

/**
 * Small row of color swatches that lets the user pick a colour for a
 * card. Used by ExamCard / ClassroomCard menus to let the user
 * customise the look of each card. The picker is presentational —
 * the parent decides where to persist the choice (see
 * `useCardColorOverride`).
 */
interface CardColorPickerProps<Variant extends string> {
  variants: readonly Variant[];
  current: Variant | null;
  onPick: (next: Variant | null) => void;
  /** Hide the "เปลี่ยนสี" label and shrink padding for compact contexts. */
  compact?: boolean;
  /** Optional label override (default: "เปลี่ยนสี"). */
  label?: string;
}

export default function CardColorPicker<Variant extends string>({
  variants,
  current,
  onPick,
  compact = false,
  label = 'เปลี่ยนสี',
}: CardColorPickerProps<Variant>) {
  const stop = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      className={`${styles.picker} ${compact ? styles.compact : ''}`}
      onClick={stop}
      role="group"
      aria-label={label}
    >
      {!compact && <span className={styles.label}>{label}</span>}
      {variants.map(v => (
        <button
          key={v}
          type="button"
          className={`${styles.swatch} ${styles[`swatch--${v}`]} ${current === v ? styles.active : ''}`}
          onClick={(e) => {
            stop(e);
            onPick(current === v ? null : v);
          }}
          title={v}
          aria-label={`สี ${v}`}
          aria-pressed={current === v}
        />
      ))}
    </div>
  );
}
