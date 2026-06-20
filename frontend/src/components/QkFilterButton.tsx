import styles from './QkFilterButton.module.css';

interface FilterButtonProps {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

export default function FilterButton({ label, onClick, active = false }: FilterButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.button} ${active ? styles.active : ''}`}
      onClick={onClick}
    >
      <span className={styles.label}>{label}</span>
      <span className={styles.caret} aria-hidden="true">▾</span>
    </button>
  );
}
