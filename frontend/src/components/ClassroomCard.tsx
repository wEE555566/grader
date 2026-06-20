'use client';

import { MouseEvent } from 'react';
import Link from 'next/link';
import {
  FaUsers,
  FaArrowRight,
  FaEllipsisV,
  FaCopy,
  FaCheck,
} from 'react-icons/fa';
import styles from './ClassroomCard.module.css';

export type ClassroomCardVariant =
  | 'purple'
  | 'blue'
  | 'green'
  | 'teal'
  | 'yellow'
  | 'orange'
  | 'pink';

export const CLASSROOM_CARD_VARIANTS: ClassroomCardVariant[] = [
  'purple',
  'blue',
  'green',
  'teal',
  'yellow',
  'orange',
  'pink',
];

interface ClassroomCardProps {
  id: number | string;
  classroomName: string;
  workspaceName?: string;
  joinCode: string;
  studentCount?: number;
  colorVariant?: ClassroomCardVariant;
  href?: string;
  isActive?: boolean;
  codeCopied?: boolean;
  /** Display author/teacher line under the join code (read-only view). */
  teacherName?: string;
  /** Display enrollment date under footer (read-only view). */
  enrolledAt?: string;
  /** Override the CTA text (default "ดูคะแนน"). */
  ctaLabel?: string;
  /** Override the student count label, e.g. show exam-set count instead. */
  metaLabel?: string;
  /** Hide the kebab menu button entirely (when no actions exist). */
  hideMenu?: boolean;
  onMenuClick?: (id: number | string, e: MouseEvent<HTMLButtonElement>) => void;
  onViewScores?: (id: number | string, e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
  viewScoresHref?: string;
  onCopyCode?: (code: string, id: number | string) => void;
  onToggleActive?: (id: number | string, next: boolean) => void;
  onDelete?: (id: number | string) => void;
}

const bannerClass: Record<ClassroomCardVariant, string> = {
  purple: styles['banner--purple'],
  blue: styles['banner--blue'],
  green: styles['banner--green'],
  teal: styles['banner--teal'],
  yellow: styles['banner--yellow'],
  orange: styles['banner--orange'],
  pink: styles['banner--pink'],
};

export default function ClassroomCard({
  id,
  classroomName,
  workspaceName,
  joinCode,
  studentCount = 0,
  colorVariant = 'blue',
  href,
  isActive,
  codeCopied = false,
  teacherName,
  enrolledAt,
  ctaLabel = 'ดูคะแนน',
  metaLabel,
  hideMenu = false,
  onMenuClick,
  onViewScores,
  viewScoresHref,
  onCopyCode,
}: ClassroomCardProps) {
  const handleMenu = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onMenuClick?.(id, e);
  };

  const handleScores = (e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (onViewScores) {
      e.preventDefault();
      e.stopPropagation();
      onViewScores(id, e);
    }
  };

  const stopAndDo = (fn?: () => void) => (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fn?.();
  };

  const cardBody = (
    <>
      <div className={`${styles.banner} ${bannerClass[colorVariant]}`}>
        {!hideMenu && onMenuClick && (
          <button
            type="button"
            className={styles.menuBtn}
            onClick={handleMenu}
            aria-label="More actions"
          >
            <FaEllipsisV size={16} />
          </button>
        )}
        <div
          className={styles.titleBox}
          style={{ fontSize: classroomName.length > 18 ? '14px' : classroomName.length > 12 ? '17px' : classroomName.length > 8 ? '19px' : '22px' }}
        >
          {classroomName}
          {isActive === false && <span className={styles.inactiveBadge}>ปิด</span>}
        </div>
        {workspaceName && (
          <div className={styles.workspaceBox}>
            <span className={styles.workspaceLabel}>พื้นที่ทำงาน:</span>
            <span className={styles.workspaceName}>{workspaceName}</span>
          </div>
        )}
      </div>
      <div className={styles.body}>
        <span className={styles.codeLabel}>รหัสเข้าห้องเรียน</span>
        <div className={styles.codeRow}>
          <p className={styles.code}>{joinCode}</p>
          {onCopyCode && (
            <button
              type="button"
              className={styles.copyBtn}
              onClick={stopAndDo(() => onCopyCode(joinCode, id))}
              title="คัดลอกรหัส"
              aria-label="คัดลอกรหัสเข้าห้องเรียน"
            >
              {codeCopied ? <FaCheck size={12} /> : <FaCopy size={12} />}
            </button>
          )}
        </div>
        {(teacherName || enrolledAt) && (
          <div className={styles.metaRow}>
            {teacherName && <span>คุณครู: {teacherName}</span>}
            {enrolledAt && <span>เข้าร่วม: {new Date(enrolledAt).toLocaleDateString('th-TH')}</span>}
          </div>
        )}
        <hr className={styles.divider} />
        <div className={styles.footer}>
          <span className={styles.studentCount}>
            <FaUsers size={14} />
            {metaLabel ?? `นักเรียน ${studentCount} คน`}
          </span>
          {/*
            When the whole card is a <Link>, `viewScoresHref` cannot also be a
            <Link> (nested <a> is invalid HTML and breaks hydration). Render the
            link only when the card itself has no `href`; otherwise the card
            link covers the same destination.
          */}
          {viewScoresHref && !href ? (
            <Link href={viewScoresHref} className={styles.scoresLink} onClick={handleScores}>
              {ctaLabel} <FaArrowRight size={9} />
            </Link>
          ) : (
            <button type="button" className={styles.scoresLink} onClick={handleScores}>
              {ctaLabel} <FaArrowRight size={9} />
            </button>
          )}
        </div>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={styles.card}>
        {cardBody}
      </Link>
    );
  }
  return <div className={styles.card}>{cardBody}</div>;
}
