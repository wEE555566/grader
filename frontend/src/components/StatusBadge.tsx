'use client';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

// Text colors are the darker AA-safe shades (≥4.5:1 on their light tint),
// matching the qk-badge-* system in globals.css. The earlier mid-tones
// (#059669/#d97706/#2563eb) failed AA on these tints.
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  up: { label: 'UP', color: '#065f46', bg: '#d1fae5' },
  down: { label: 'DOWN', color: '#991b1b', bg: '#fee2e2' },
  healthy: { label: 'ปกติ', color: '#065f46', bg: '#d1fae5' },
  degraded: { label: 'มีปัญหา', color: '#92400e', bg: '#fef3c7' },
  active: { label: 'ใช้งาน', color: '#065f46', bg: '#d1fae5' },
  suspended: { label: 'ระงับ', color: '#92400e', bg: '#fef3c7' },
  deleted: { label: 'ลบแล้ว', color: '#991b1b', bg: '#fee2e2' },
  pending: { label: 'รอตรวจ', color: '#92400e', bg: '#fef3c7' },
  approved: { label: 'อนุมัติ', color: '#065f46', bg: '#d1fae5' },
  rejected: { label: 'ปฏิเสธ', color: '#374151', bg: '#f3f4f6' },
  reviewed: { label: 'ตรวจแล้ว', color: '#1e40af', bg: '#dbeafe' },
  success: { label: 'สำเร็จ', color: '#065f46', bg: '#d1fae5' },
  error: { label: 'ผิดพลาด', color: '#991b1b', bg: '#fee2e2' },
  completed: { label: 'เสร็จสิ้น', color: '#065f46', bg: '#d1fae5' },
  failed: { label: 'ล้มเหลว', color: '#991b1b', bg: '#fee2e2' },
  processing: { label: 'กำลังทำ', color: '#1e40af', bg: '#dbeafe' },
  in_progress: { label: 'กำลังดำเนินการ', color: '#1e40af', bg: '#dbeafe' },
  resolved: { label: 'แก้ไขแล้ว', color: '#065f46', bg: '#d1fae5' },
  dismissed: { label: 'ยกเลิก', color: '#374151', bg: '#f3f4f6' },
  draft: { label: 'แบบร่าง', color: '#374151', bg: '#f3f4f6' },
};

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status?.toLowerCase()] || { label: status, color: '#374151', bg: '#f3f4f6' };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: size === 'sm' ? '0.15rem 0.5rem' : '0.25rem 0.75rem',
        fontSize: size === 'sm' ? '0.7rem' : '0.8rem',
        fontWeight: 600,
        color: config.color,
        backgroundColor: config.bg,
        borderRadius: '9999px',
        letterSpacing: '0.02em',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        backgroundColor: config.color,
        display: 'inline-block',
        animation: status === 'up' || status === 'processing' ? 'pulse 2s infinite' : 'none',
      }} />
      {config.label}
    </span>
  );
}
