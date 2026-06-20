'use client';

import { useState, useEffect, useCallback } from 'react';
import { getFeatureFlags } from '@/lib/api';
import styles from './GlobalBanner.module.css';

/** Feature group metadata labels shown when a feature group is disabled */
const FEATURE_LABELS: Record<string, string> = {
  ai_engine: 'ระบบ AI (สร้างข้อสอบ, ประเมินคุณภาพ, ตั้งค่า AI)',
  public_repository: 'คลังข้อสอบสาธารณะ',
  classroom_system: 'ระบบห้องเรียน (ครูและนักเรียน)',
  exam_history: 'ประวัติข้อสอบ',
};

const BANNER_ICONS: Record<string, string> = {
  maintenance: '🔧',
  warning: '⚠️',
  info: 'ℹ️',
  critical: '🚨',
};

export interface Announcement {
  id: string;
  message: string;
  banner_type: string;
  link_text?: string | null;
  link_url?: string | null;
  created_at: number;
  expires_at: number;
}

interface BannerItem {
  id: string;
  type: 'maintenance' | 'warning' | 'info' | 'critical';
  message: string;
  linkText?: string | null;
  linkUrl?: string | null;
  dismissible: boolean;
}

export default function GlobalBanner() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const fetchBanners = useCallback(async () => {
    try {
      const data = await getFeatureFlags();
      const items: BannerItem[] = [];

      // 1. Feature-flag-based banners (maintenance type, not dismissible)
      if (data.flags) {
        Object.entries(data.flags).forEach(([key, enabled]) => {
          if (!enabled && FEATURE_LABELS[key]) {
            items.push({
              id: `ff-${key}`,
              type: 'maintenance',
              message: `${FEATURE_LABELS[key]} กำลังปรับปรุง ยังไม่พร้อมใช้งานในขณะนี้`,
              dismissible: false,
            });
          }
        });
      }

      // 2. Announcement banners from admin
      if (data.announcements && Array.isArray(data.announcements)) {
        data.announcements.forEach((ann: Announcement) => {
          const type = (['maintenance', 'warning', 'info', 'critical'].includes(ann.banner_type)
            ? ann.banner_type
            : 'info') as BannerItem['type'];

          items.push({
            id: ann.id,
            type,
            message: ann.message,
            linkText: ann.link_text,
            linkUrl: ann.link_url,
            dismissible: type === 'info' || type === 'warning',
          });
        });
      }

      setBanners(items);
    } catch {
      // Silent fail don't show banners if API is down
    }
  }, []);

  useEffect(() => {
    fetchBanners();
    const interval = setInterval(fetchBanners, 30000);
    return () => clearInterval(interval);
  }, [fetchBanners]);

  // Load dismissed IDs from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('dismissed_banners');
      if (stored) setDismissed(new Set(JSON.parse(stored)));
    } catch { /* ignore */ }
  }, []);

  const handleDismiss = (id: string) => {
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    try {
      sessionStorage.setItem('dismissed_banners', JSON.stringify([...next]));
    } catch { /* ignore */ }
  };

  const visibleBanners = banners.filter(b => !dismissed.has(b.id));
  if (visibleBanners.length === 0) return null;

  return (
    <div className={styles.bannerStack}>
      {visibleBanners.map(banner => (
        <div key={banner.id} className={`${styles.banner} ${styles[banner.type]}`}>
          <span className={styles.bannerIcon}>{BANNER_ICONS[banner.type] || 'ℹ️'}</span>
          <div className={styles.bannerContent}>
            <span className={styles.bannerMessage}>{banner.message}</span>
            {banner.linkText && banner.linkUrl && (
              <a href={banner.linkUrl} className={styles.bannerLink}>
                {banner.linkText} →
              </a>
            )}
          </div>
          {banner.dismissible && (
            <button
              className={styles.bannerClose}
              onClick={() => handleDismiss(banner.id)}
              aria-label="ปิดการแจ้งเตือน"
            >
              ✕
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
