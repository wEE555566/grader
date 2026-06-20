'use client';

import { ChangeEvent, ReactNode } from 'react';
import { FaSearch, FaPlus } from 'react-icons/fa';
import QkFilterButton from './QkFilterButton';
import styles from './QkPageHero.module.css';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export interface QkHeroFilter {
  id: string;
  label: string;
}

interface QkPageHeroProps {
  title: string;
  subtitle?: string;
  heroImage?: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  onAdd?: () => void;
  addLabel?: string;
  addIcon?: ReactNode;
  /** Replace the default + Add button with a custom action node (e.g. a form). */
  actionSlot?: ReactNode;
  filters?: QkHeroFilter[];
  onFilterClick?: (filterId: string) => void;
  hideSearch?: boolean;
}

export default function QkPageHero({
  title,
  subtitle,
  heroImage = `${basePath}/qk-workspace-hero.png`,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'ค้นหาข้อสอบ ตามวันที่สร้าง, รายวิชา หรือหัวข้อที่ต้องการ...',
  onAdd,
  addLabel = 'เพิ่ม',
  addIcon = <FaPlus size={16} />,
  actionSlot,
  filters,
  onFilterClick,
  hideSearch = false,
}: QkPageHeroProps) {
  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const filterList: QkHeroFilter[] = filters ?? [];

  const actionNode = actionSlot ?? (onAdd && (
    <button type="button" className={styles.addBtn} onClick={onAdd}>
      {addIcon}
      <span>{addLabel}</span>
    </button>
  ));

  return (
    <section className={styles.hero}>
      <div className={styles.bg} aria-hidden="true">
        <img src={heroImage} alt="" />
      </div>
      <div className={styles.content}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>
      {!hideSearch && (
        <div className={styles.searchRow}>
          <div className={styles.searchWrap} data-tour="repo-search">
            <span className={styles.searchIcon} aria-hidden="true">
              <FaSearch size={16} />
            </span>
            <input
              type="search"
              className={styles.searchInput}
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={handleInput}
              aria-label={searchPlaceholder}
            />
          </div>
          {filterList.length > 0 && (
            <div className={styles.filters}>
              {filterList.map(f => (
                <QkFilterButton key={f.id} label={f.label} onClick={() => onFilterClick?.(f.id)} />
              ))}
            </div>
          )}
        </div>
      )}
      {actionNode && (
        <div className={styles.actionCorner}>
          {actionNode}
        </div>
      )}
    </section>
  );
}
