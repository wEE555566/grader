'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { FaBell, FaCog, FaListUl, FaUser, FaQuestionCircle } from 'react-icons/fa';
import styles from './Navbar.module.css';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    setIsLoggedIn(!!token);
    setRole(userRole);

    // Fetch unread notification count if logged in
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/v1/notifications/unread-count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(r => r.ok ? r.json() : { count: 0 })
        .then(data => setUnreadCount(data.count || 0))
        .catch(() => {});
    }
  }, [pathname]);

  const isAuthenticated = isLoggedIn && !!role;
  const isModeratorOrAdmin = role === 'moderator' || role === 'admin';

  const isHome = pathname === '/';
  const isWorkspaceActive = pathname?.startsWith('/workspace') ?? false;
  const isStudentClassroomActive = pathname?.startsWith('/student') ?? false;
  const isAdminActive = pathname?.startsWith('/admin') ?? false;

  return (
    <>
      <a href="#main-content" className={styles.skipNav}>ข้ามไปยังเนื้อหาหลัก</a>
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <Link href="/" className={styles.brand} aria-label="QooKru หน้าแรก">
            <img
              src={`${basePath}/qk-owl-avatar.png`}
              alt=""
              className={styles.logoImg}
            />
            <span className={styles.logoText}>
              <span className={styles.logoOo}>oo</span>
              <span className={styles.logoKru}>Kru</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className={styles.navLinks}>
            <Link href="/" className={isHome ? styles.activeLink : ''}>
              หน้าแรก
            </Link>
            {isAuthenticated && (
              <Link
                href="/workspace/workspaces"
                className={isWorkspaceActive ? styles.activeLink : ''}
              >
                พื้นที่ทำงาน
              </Link>
            )}
            {isAuthenticated && (
              <Link
                href="/student/classrooms"
                className={isStudentClassroomActive ? styles.activeLink : ''}
              >
                ห้องเรียนของฉัน
              </Link>
            )}
            {isModeratorOrAdmin && (
              <Link href="/admin" className={isAdminActive ? styles.activeLink : ''}>
                จัดการระบบ
              </Link>
            )}
            {!isLoggedIn && (
              <Link href="/#features">
                ฟีเจอร์
              </Link>
            )}
          </div>

          {/* Desktop Action Buttons */}
          <div className={styles.authButtons}>
            <Link href="/exam/join" className={styles.examJoinBtn} aria-label="เข้าห้องสอบด้วยรหัสผ่าน" title="เข้าห้องสอบด้วยรหัสผ่านสำหรับนักเรียน">
              <FaListUl />
              <span>เข้าห้องด้วยรหัส</span>
            </Link>

            {isAuthenticated && (
              <Link href="/workspace/notifications" className={styles.iconBtn} aria-label="แจ้งเตือน" title="แจ้งเตือน">
                <div className={styles.notifWrapper}>
                  <FaBell />
                  {unreadCount > 0 && (
                    <span className={styles.notifBadge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </div>
              </Link>
            )}

            {isAuthenticated && (
              <Link href="/workspace/llm-settings" className={styles.iconBtn} aria-label="ตั้งค่า" title="ตั้งค่า">
                <FaCog />
              </Link>
            )}

            {isAuthenticated && (
              <button
                className={styles.iconBtn}
                aria-label="แนะนำการใช้งาน"
                title="แนะนำการใช้งาน"
                onClick={() => window.dispatchEvent(new CustomEvent('open-tour'))}
                style={{ border: 'none', cursor: 'pointer' }}
              >
                <FaQuestionCircle />
              </button>
            )}

            {isAuthenticated && (
              <Link href="/profile" className={styles.profileBtn} aria-label="โปรไฟล์">
                <FaUser size={14} />
              </Link>
            )}

            {!isLoggedIn && (
              <>
                <div className={styles.divider}></div>
                <Link href="/login" className={styles.loginBtn}>สมัครสมาชิก / เข้าสู่ระบบ</Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
