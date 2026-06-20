'use client';

import React from 'react';
import Link from 'next/link';
import { FaChevronLeft } from 'react-icons/fa';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  children: React.ReactNode;
  role: 'user' | 'teacher' | 'student'; // 'user' is the new default; teacher/student kept for backward compat
  backHref: string;
}

export default function AuthLayout({ children, role, backHref }: AuthLayoutProps) {
  // All roles now use the same illustration style
  const illustrationSrc = '/login.png';

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.leftSide}>
          <Link href={backHref} className={styles.backBtnLeft} title="กลับหน้าหลัก" aria-label="กลับหน้าหลัก">
            <FaChevronLeft />
          </Link>
          {children}
        </div>
        <div className={styles.rightSideImageOnly}>
          <img
            src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}${illustrationSrc}`}
            alt="ภาพประกอบ QooKru"
            className={styles.fullImage}
          />
        </div>
      </div>
    </div>
  );
}
