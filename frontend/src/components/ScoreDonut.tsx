'use client';

import { useEffect, useState } from 'react';
import styles from './ScoreDonut.module.css';

interface ScoreDonutProps {
  /** Percentage 0–100 used to draw the ring. */
  percent: number;
  /** Big number shown in the centre (e.g. raw score). Defaults to the rounded percent. */
  centerValue?: React.ReactNode;
  /** Small line under the centre value (e.g. "/ 20"). */
  centerSub?: React.ReactNode;
  /** Diameter in px. */
  size?: number;
  /** Ring thickness in px. */
  stroke?: number;
  /**
   * Ring colour. Defaults to threshold colouring: >=50% emerald, else rose.
   * Pass an explicit CSS colour to override.
   */
  color?: string;
}

/**
 * Animated SVG donut. Draws the progress ring from 0 → percent on mount via a
 * stroke-dashoffset transition (disabled under prefers-reduced-motion).
 */
export default function ScoreDonut({
  percent,
  centerValue,
  centerSub,
  size = 150,
  stroke = 12,
  color,
}: ScoreDonutProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const target = circumference * (1 - clamped / 100);

  // Start fully empty, then animate to the target offset after mount.
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const reduce = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setOffset(target); return; }
    const id = requestAnimationFrame(() => setOffset(target));
    return () => cancelAnimationFrame(id);
  }, [target]);

  const ringColor = color ?? (clamped >= 50 ? 'var(--color-success)' : 'var(--color-error)');

  return (
    <div className={styles.wrap} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img"
        aria-label={`คะแนน ${Math.round(clamped)}%`}>
        <circle
          className={styles.track}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
        />
        <circle
          className={styles.progress}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          stroke={ringColor}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className={styles.center}>
        <span className={styles.value}>{centerValue ?? `${Math.round(clamped)}%`}</span>
        {centerSub && <span className={styles.sub}>{centerSub}</span>}
      </div>
    </div>
  );
}
