'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, ReactNode } from 'react';
import {
  FaFolder, FaBell, FaDatabase, FaHistory,
  FaPlusCircle, FaEllipsisH, FaBook, FaTrophy,
  FaUsers, FaCheckDouble, FaCog, FaChartBar,
  FaServer, FaShieldAlt, FaRobot, FaFileAlt,
  FaChalkboardTeacher, FaGraduationCap, FaClipboardList,
  FaExclamationTriangle
} from 'react-icons/fa';
import styles from './MobileBottomBar.module.css';
import { getUnreadNotificationCount } from '@/lib/api';

/* ================================================================
   Types & Tab Definitions
   ================================================================ */

interface TabItem {
  href: string;
  label: string;
  icon: ReactNode;
  isPrimary?: boolean;  // e.g. "Create" button gets special style
}

type SidebarVariant = 'workspace' | 'student' | 'admin';

/* Workspace: show 4 main tabs + "more" */
const workspacePrimaryTabs: TabItem[] = [
  { href: '/workspace/workspaces', label: 'พื้นที่', icon: <FaFolder /> },
  { href: '/repository', label: 'คลัง', icon: <FaDatabase /> },
  { href: '/workspace/workspaces?create=true', label: 'สร้าง', icon: <FaPlusCircle />, isPrimary: true },
  { href: '/workspace/notifications', label: 'แจ้งเตือน', icon: <FaBell /> },
];

const workspaceMoreTabs: TabItem[] = [
  { href: '/workspace/classrooms', label: 'ติดตามห้องเรียน', icon: <FaUsers /> },
  { href: '/workspace/history', label: 'ประวัติข้อสอบ', icon: <FaHistory /> },
  { href: '/workspace/report', label: 'รายงาน', icon: <FaChartBar /> },
  { href: '/workspace/quality-check', label: 'ประเมินคุณภาพ', icon: <FaCheckDouble /> },
  { href: '/workspace/leaderboard', label: 'กระดานผู้นำ', icon: <FaTrophy /> },
  { href: '/workspace/llm-settings', label: 'ตั้งค่า AI', icon: <FaCog /> },
];

/* Student: 3 main tabs + "more" */
const studentPrimaryTabs: TabItem[] = [
  { href: '/student/classrooms', label: 'ห้องเรียน', icon: <FaBook /> },
  { href: '/student/history', label: 'ประวัติ', icon: <FaHistory /> },
  { href: '/student/leaderboard', label: 'ผู้นำ', icon: <FaTrophy /> },
];

/* Admin: 4 main tabs + "more" */
const adminPrimaryTabs: TabItem[] = [
  { href: '/admin', label: 'ระบบ', icon: <FaServer /> },
  { href: '/admin/users', label: 'ผู้ใช้', icon: <FaUsers /> },
  { href: '/admin/classrooms', label: 'ห้องเรียน', icon: <FaChalkboardTeacher /> },
];

const adminMoreTabs: TabItem[] = [
  { href: '/admin/exam-sets', label: 'คลังข้อสอบทั้งหมด', icon: <FaFileAlt /> },
  { href: '/admin/attempts', label: 'ผลการทำข้อสอบ', icon: <FaGraduationCap /> },
  { href: '/admin/moderation', label: 'ตรวจสอบเนื้อหา', icon: <FaShieldAlt /> },
  { href: '/admin/problem-reports', label: 'รายงานปัญหา', icon: <FaExclamationTriangle /> },
  { href: '/admin/audit', label: 'บันทึกการตรวจสอบ', icon: <FaClipboardList /> },
  { href: '/admin/feature-flags', label: 'ฟีเจอร์แฟล็ก', icon: <FaCog /> },
  { href: '/admin/ai-usage', label: 'การใช้งาน AI', icon: <FaRobot /> },
];

/* ================================================================
   Component
   ================================================================ */

interface MobileBottomBarProps {
  variant: SidebarVariant;
}

export default function MobileBottomBar({ variant }: Readonly<MobileBottomBarProps>) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  /* Notification count for workspace */
  useEffect(() => {
    if (variant !== 'workspace') return;
    const fetch = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) return;
        const data = await getUnreadNotificationCount();
        setUnreadCount(data.count);
      } catch {
        // silent
      }
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, [variant]);

  const isActive = (href: string) => {
    if (href === '#') return false;
    if (href.includes('?')) {
      return pathname?.startsWith(href.split('?')[0]) ?? false;
    }
    if (href === '/admin' && (pathname === '/admin' || pathname === '/admin/')) return true;
    if (href !== '/admin' && pathname?.startsWith(href)) return true;
    return pathname?.startsWith(href) ?? false;
  };

  const primaryTabs =
    variant === 'workspace' ? workspacePrimaryTabs :
    variant === 'student' ? studentPrimaryTabs :
    adminPrimaryTabs;

  const moreTabs =
    variant === 'workspace' ? workspaceMoreTabs :
    variant === 'student' ? [] :
    adminMoreTabs;

  const hasMore = moreTabs.length > 0;

  const handleCreateClick = () => {
    if (pathname?.startsWith('/workspace/workspaces')) {
      window.dispatchEvent(new CustomEvent('open-create-workspace'));
    } else {
      window.location.href = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/workspace/workspaces?create=true`;
    }
  };

  return (
    <>
      <nav className={styles.bottomBar} aria-label="เมนูด้านล่าง">
        {primaryTabs.map((tab) => {
          const active = isActive(tab.href);

          if (tab.isPrimary) {
            return (
              <button
                key={tab.href}
                className={`${styles.tab} ${styles.createTab}`}
                onClick={handleCreateClick}
                aria-label={tab.label}
              >
                <span className={styles.tabIcon}>{tab.icon}</span>
                <span className={styles.tabLabel}>{tab.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`${styles.tab} ${active ? styles.tabActive : ''}`}
              aria-label={tab.label}
              onClick={() => setMoreOpen(false)}
            >
              <span className={styles.tabIcon}>
                {tab.icon}
                {tab.href === '/workspace/notifications' && unreadCount > 0 && (
                  <span className={styles.badge}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </span>
              <span className={styles.tabLabel}>{tab.label}</span>
            </Link>
          );
        })}

        {/* "More" tab */}
        {hasMore && (
          <button
            className={`${styles.tab} ${moreOpen ? styles.tabActive : ''}`}
            onClick={() => setMoreOpen(!moreOpen)}
            aria-label="เพิ่มเติม"
            aria-expanded={moreOpen}
          >
            <span className={styles.tabIcon}><FaEllipsisH /></span>
            <span className={styles.tabLabel}>เพิ่มเติม</span>
          </button>
        )}
      </nav>

      {/* More popup menu */}
      {moreOpen && hasMore && (
        <>
          <div className={styles.moreOverlay} onClick={() => setMoreOpen(false)} />
          <div className={styles.moreMenu}>
            {moreTabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`${styles.moreItem} ${isActive(tab.href) ? styles.moreItemActive : ''}`}
                onClick={() => setMoreOpen(false)}
              >
                <span className={styles.moreItemIcon}>{tab.icon}</span>
                <span>{tab.label}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
