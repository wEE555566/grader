import styles from './QkPagination.module.css';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  const safeTotal = Math.max(1, totalPages);
  const safePage = Math.min(Math.max(1, page), safeTotal);

  const pages: number[] = [];
  for (let i = 1; i <= safeTotal; i++) pages.push(i);

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <button
        type="button"
        className={styles.navBtn}
        onClick={() => onChange(safePage - 1)}
        disabled={safePage <= 1}
        aria-label="Previous page"
      >
        <span className={styles.arrow} aria-hidden="true">‹</span>
      </button>
      <div className={styles.pageList}>
        {pages.map(p => (
          <button
            key={p}
            type="button"
            className={`${styles.pageBtn} ${p === safePage ? styles.active : ''}`}
            onClick={() => onChange(p)}
            aria-current={p === safePage ? 'page' : undefined}
          >
            {p}
          </button>
        ))}
      </div>
      <button
        type="button"
        className={styles.navBtn}
        onClick={() => onChange(safePage + 1)}
        disabled={safePage >= safeTotal}
        aria-label="Next page"
      >
        <span className={styles.arrow} aria-hidden="true">›</span>
      </button>
    </nav>
  );
}
