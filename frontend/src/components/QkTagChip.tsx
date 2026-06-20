import { ReactNode } from 'react';
import styles from './QkTagChip.module.css';

interface TagChipProps {
  children: ReactNode;
}

export default function TagChip({ children }: TagChipProps) {
  return <span className={styles.chip}>{children}</span>;
}
