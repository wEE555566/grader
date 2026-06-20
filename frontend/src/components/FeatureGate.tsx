'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { getFeatureFlags } from '@/lib/api';
import styles from './maintenance.module.css';

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
}

export default function FeatureGate({ feature, children }: FeatureGateProps) {
  const [enabled, setEnabled] = useState<boolean | null>(null); // null = loading
  const [loaded, setLoaded] = useState(false);

  const checkFlag = async () => {
    try {
      const { flags } = await getFeatureFlags();
      const isEnabled = flags[feature] !== false; // default true if key doesn't exist
      setEnabled(isEnabled);
    } catch {
      setEnabled(true); // fallback: enable if API fails
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    checkFlag();
    // Poll every 30 seconds
    const interval = setInterval(checkFlag, 30000);
    return () => clearInterval(interval);
  }, [feature]);

  // Still loading show nothing (or a brief blank)
  if (!loaded) return null;

  // Feature is enabled render children normally
  if (enabled) return <>{children}</>;

  // Feature is disabled show maintenance page
  return (
    <div className={styles.maintenanceContainer}>
      <div className={styles.maintenanceCard}>
        <span className={styles.maintenanceIcon}>🔧</span>
        <h2 className={styles.maintenanceTitle}>ระบบกำลังปรับปรุง</h2>
        <div className={styles.maintenanceProgress}>
          <div className={styles.maintenanceProgressBar} />
        </div>
        <p className={styles.maintenanceDesc}>
          ขออภัยในความไม่สะดวก<br />
          ฟีเจอร์นี้กำลังอยู่ในระหว่างการปรับปรุง<br />
          กรุณาลองใหม่อีกครั้งในภายหลัง
        </p>
        <Link href="/" className={styles.maintenanceBackBtn}>
          ← กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
}
