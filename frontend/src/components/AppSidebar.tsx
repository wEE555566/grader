'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, ReactNode } from 'react';
import {
  FaPlusCircle, FaFolder, FaHistory, FaBell, FaDatabase,
  FaUsers, FaCheckDouble, FaCog, FaTrophy, FaBook,
  FaServer, FaShieldAlt, FaRobot, FaSignOutAlt,
  FaUser, FaExclamationTriangle, FaChartBar, FaClipboardList,
  FaChalkboardTeacher, FaFileAlt, FaGraduationCap
} from 'react-icons/fa';
import styles from './AppSidebar.module.css';
import { getUnreadNotificationCount, getFeatureFlags, getCurrentUser } from '@/lib/api';

/* ================================================================
   Sidebar menu definitions for each module
   ================================================================ */

interface MenuItem {
  href: string;
  label: string;
  icon: ReactNode;
  featureFlag?: string | null;
  minRole?: 'admin' | 'moderator' | null;
}

interface MenuSection {
  title?: string;
  items: MenuItem[];
}

/* ── Workspace menu ── */
const workspaceMenu: MenuSection[] = [
  {
    items: [
      { href: '/workspace/workspaces', label: 'พื้นที่ทำงาน', icon: <FaFolder />, featureFlag: null },
      { href: '/workspace/classrooms', label: 'ติดตามห้องเรียน', icon: <FaUsers />, featureFlag: 'classroom_system' },
      { href: '/repository', label: 'คลังข้อสอบ', icon: <FaDatabase />, featureFlag: 'public_repository' },
      { href: '/workspace/history', label: 'ประวัติข้อสอบ', icon: <FaHistory />, featureFlag: 'exam_history' },
      { href: '/workspace/report', label: 'รายงาน', icon: <FaChartBar />, featureFlag: null },
      { href: '/workspace/quality-check', label: 'ประเมินคุณภาพ', icon: <FaCheckDouble />, featureFlag: 'ai_engine' },
      { href: '/workspace/leaderboard', label: 'กระดานผู้นำ', icon: <FaTrophy />, featureFlag: null },
      { href: '/workspace/llm-settings', label: 'ตั้งค่า AI', icon: <FaCog />, featureFlag: 'ai_engine' },
      { href: '/workspace/notifications', label: 'การแจ้งเตือน', icon: <FaBell />, featureFlag: null },
    ],
  },
];

/* ── Student menu ── */
const studentMenu: MenuSection[] = [
  {
    title: 'เมนูหลัก',
    items: [
      { href: '/student/classrooms', label: 'ห้องเรียนของฉัน', icon: <FaBook /> },
      { href: '/student/history', label: 'ประวัติการทำข้อสอบ', icon: <FaHistory /> },
      { href: '/student/leaderboard', label: 'กระดานผู้นำ', icon: <FaTrophy /> },
    ],
  },
];

/* ── Admin menu ── */
const adminMenu: MenuSection[] = [
  {
    title: 'โครงสร้างพื้นฐาน',
    items: [
      { href: '/admin', label: 'สถานะระบบ', icon: <FaServer />, minRole: 'admin' },
    ],
  },
  {
    title: 'การจัดการ',
    items: [
      { href: '/admin/users', label: 'จัดการผู้ใช้', icon: <FaUsers />, minRole: 'admin' },
      { href: '/admin/classrooms', label: 'จัดการห้องเรียน', icon: <FaChalkboardTeacher />, minRole: 'admin' },
      { href: '/admin/exam-sets', label: 'คลังข้อสอบทั้งหมด', icon: <FaFileAlt />, minRole: 'admin' },
      { href: '/admin/attempts', label: 'ผลการทำข้อสอบ', icon: <FaGraduationCap />, minRole: 'admin' },
      { href: '/admin/moderation', label: 'ตรวจสอบเนื้อหา', icon: <FaShieldAlt />, minRole: 'moderator' },
      { href: '/admin/problem-reports', label: 'รายงานปัญหา', icon: <FaExclamationTriangle />, minRole: 'moderator' },
      { href: '/admin/audit', label: 'บันทึกการตรวจสอบ', icon: <FaClipboardList />, minRole: 'moderator' },
      { href: '/admin/feature-flags', label: 'ฟีเจอร์แฟล็ก', icon: <FaCog />, minRole: 'admin' },
    ],
  },
  {
    title: 'การวิเคราะห์',
    items: [
      { href: '/admin/ai-usage', label: 'การใช้งานและค่าใช้จ่าย AI', icon: <FaRobot />, minRole: 'admin' },
    ],
  },
];

/* ================================================================
   Component Props
   ================================================================ */
type SidebarVariant = 'workspace' | 'student' | 'admin';

interface AppSidebarProps {
  variant: SidebarVariant;
  isOpen?: boolean;
  onLinkClick?: () => void;
}

/* ================================================================
   AppSidebar Component
   ================================================================ */
export default function AppSidebar({ variant, isOpen = true, onLinkClick }: Readonly<AppSidebarProps>) {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [email, setEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [impersonating, setImpersonating] = useState<string | null>(null);

  /* Fetch common data */
  useEffect(() => {
    const storedEmail = localStorage.getItem('email') || '';
    const storedRole = localStorage.getItem('role') || '';
    setEmail(storedEmail);
    setUserRole(storedRole);
    setImpersonating(localStorage.getItem('impersonating_email'));

    const token = localStorage.getItem('token');
    if (token) {
      getCurrentUser().then(user => {
        if (user?.profile?.profile_picture) {
          setProfilePicture(user.profile.profile_picture);
        }
        const firstName = user?.profile?.first_name?.trim();
        const lastName = user?.profile?.last_name?.trim();
        if (firstName || lastName) {
          setDisplayName([firstName, lastName].filter(Boolean).join(' '));
        }
      }).catch(() => {
        // silent fail fallback to email
      });
    }
  }, []);

  /* Notification count (workspace only) */
  useEffect(() => {
    if (variant !== 'workspace') return;
    const fetchUnread = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) return;
        const data = await getUnreadNotificationCount();
        setUnreadCount(data.count);
      } catch {
        // silent fail
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [variant]);

  /* Feature flags (workspace only) */
  useEffect(() => {
    if (variant !== 'workspace') return;
    const fetchFlags = async () => {
      try {
        const data = await getFeatureFlags();
        setFlags(data.flags);
      } catch {
        // silent fail keep all visible
      }
    };
    fetchFlags();
    const interval = setInterval(fetchFlags, 30000);
    return () => clearInterval(interval);
  }, [variant]);

  /* ── Helpers ── */
  const isActive = (href: string) => {
    if (href === '#') return false;
    if (href === '/admin' && (pathname === '/admin' || pathname === '/admin/')) return true;
    if (href !== '/admin' && pathname?.startsWith(href)) return true;
    if (href === '/workspace') return pathname === href;
    return pathname?.startsWith(href) ?? false;
  };

  const hasAccess = (minRole: string | null | undefined): boolean => {
    if (!minRole) return true;
    if (userRole === 'admin') return true;
    if (userRole === 'moderator' && minRole === 'moderator') return true;
    return false;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('impersonator_token');
    localStorage.removeItem('impersonating_email');
    router.push('/login');
  };

  // Restore the backed-up admin session when leaving an impersonation session.
  const exitImpersonation = () => {
    const adminToken = localStorage.getItem('impersonator_token');
    if (adminToken) localStorage.setItem('token', adminToken);
    localStorage.removeItem('impersonator_token');
    localStorage.removeItem('impersonating_email');
    localStorage.setItem('role', 'admin');  // only admins can impersonate
    window.location.href = '/admin/users';
  };

  const handleNavClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      onLinkClick?.();
    }
  };

  const avatarInitial = (email || 'U').charAt(0).toUpperCase();

  /* ── Determine menu ── */
  const menuSections =
    variant === 'workspace' ? workspaceMenu :
    variant === 'student' ? studentMenu :
    adminMenu;

  const roleLabel =
    userRole === 'admin' ? 'ผู้ดูแลระบบ' :
    userRole === 'moderator' ? 'ผู้ดูแล' :
    'ผู้ใช้';

  const roleIcon =
    userRole === 'admin' ? <FaCog /> :
    userRole === 'moderator' ? <FaShieldAlt /> :
    <FaUser />;

  /* ── Filter items ── */
  const filteredSections = menuSections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (item.featureFlag && flags[item.featureFlag] === false) return false;
      if (item.minRole && !hasAccess(item.minRole)) return false;
      return true;
    }),
  })).filter(section => section.items.length > 0);

  return (
    <>
      {impersonating && (
        <div role="status" style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          background: '#b45309', color: '#fff', padding: '0.5rem 1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.75rem', fontSize: '0.9rem', fontWeight: 600,
        }}>
          <span>👤 กำลังใช้งานแทน {impersonating}</span>
          <button onClick={exitImpersonation} style={{
            background: '#fff', color: '#b45309', border: 'none',
            padding: '0.25rem 0.75rem', borderRadius: '6px', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            ออกจากการใช้แทน
          </button>
        </div>
      )}
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      {/* Create Button (workspace only) */}
      {variant === 'workspace' && (
        <button className={styles.createBtn} title="สร้างข้อสอบใหม่" data-tour="sidebar-create" onClick={() => {
          if (pathname?.startsWith('/workspace/workspaces')) {
            window.dispatchEvent(new CustomEvent('open-create-workspace'));
          } else {
            window.location.href = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/workspace/workspaces?create=true`;
          }
        }}>
          <FaPlusCircle />
          <span className={styles.navLabel}>สร้างข้อสอบใหม่</span>
        </button>
      )}

      {/* Navigation */}
      <nav className={styles.nav} data-tour="sidebar-nav">
        {filteredSections.map((section, idx) => (
          <div key={section.title ?? `section-${idx}`}>
            {section.title && (
              <div className={styles.sectionLabel}>{section.title}</div>
            )}
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                onClick={handleNavClick}
                className={`${styles.navItem} ${isActive(item.href) ? styles.navActive : ''}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
                {variant === 'workspace' && item.href === '/workspace/notifications' && unreadCount > 0 && (
                  <span className={styles.badge}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            ))}
            {idx < filteredSections.length - 1 && <div className={styles.divider} />}
          </div>
        ))}
      </nav>

      {/* User profile section */}
      <div className={styles.bottomArea}>
        <Link
          href="/profile"
          className={styles.userProfile}
          onClick={handleNavClick}
          title="ดูโปรไฟล์"
        >
          <div className={styles.avatar} aria-hidden="true">
            {profilePicture ? (
              <img src={profilePicture} alt="" referrerPolicy="no-referrer" />
            ) : (
              avatarInitial
            )}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName} title={displayName || email}>
              {displayName || email || 'ผู้ใช้'}
            </div>
            <div className={styles.userRole}>
              <span className={styles.userRoleIcon}>{roleIcon}</span>
              <span>{roleLabel}</span>
            </div>
          </div>
        </Link>
        <button className={styles.logoutBtn} onClick={handleLogout} title="ออกจากระบบ">
          <FaSignOutAlt />
          <span className={styles.navLabel}>ออกจากระบบ</span>
        </button>
      </div>

    </aside>
    </>
  );
}
