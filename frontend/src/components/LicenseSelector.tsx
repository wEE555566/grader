'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './LicenseSelector.module.css';

// ===== License Data =====
export type LicenseType = 'CC-BY' | 'CC-BY-SA' | 'CC-BY-NC' | 'CC-BY-NC-SA' | 'CC-BY-ND' | 'CC-BY-NC-ND';

interface LicenseInfo {
  name: string;
  shortDesc: string;
  tags: { text: string; color: 'green' | 'red' | 'blue' | 'yellow' }[];
  icon: string;
  badgeClass: string;
}

const LICENSE_MAP: Record<LicenseType, LicenseInfo> = {
  'CC-BY': {
    name: 'CC BY',
    shortDesc: 'ให้เครดิต ผู้สร้าง | ดัดแปลง/แก้ไขได้อิสระ | ใช้เชิงพาณิชย์ได้',
    tags: [
      { text: '✅ ให้เครดิต', color: 'green' },
      { text: '✅ แก้ไขได้', color: 'green' },
      { text: '✅ ขายได้', color: 'green' },
    ],
    icon: '🟢',
    badgeClass: 'badgeBY',
  },
  'CC-BY-SA': {
    name: 'CC BY-SA',
    shortDesc: 'ให้เครดิต | แก้ไขได้ | ขายได้ (แต่ต้องแชร์ต่อด้วยสิทธิ์เดิม)',
    tags: [
      { text: '✅ ให้เครดิต', color: 'green' },
      { text: '✅ แก้ไขได้', color: 'green' },
      { text: '✅ ขายได้', color: 'green' },
      { text: '🔄 แชร์ต่อสิทธิ์เดิม', color: 'blue' },
    ],
    icon: '🔵',
    badgeClass: 'badgeSA',
  },
  'CC-BY-NC': {
    name: 'CC BY-NC',
    shortDesc: 'ให้เครดิต | แก้ไขได้ | ห้ามใช้เชิงพาณิชย์',
    tags: [
      { text: '✅ ให้เครดิต', color: 'green' },
      { text: '✅ แก้ไขได้', color: 'green' },
      { text: '❌ ห้ามขาย', color: 'yellow' },
    ],
    icon: '🟡',
    badgeClass: 'badgeNC',
  },
  'CC-BY-NC-SA': {
    name: 'CC BY-NC-SA',
    shortDesc: 'ให้เครดิต | แก้ไขได้ | ห้ามขาย (และต้องแชร์ต่อด้วยสิทธิ์เดิม)',
    tags: [
      { text: '✅ ให้เครดิต', color: 'green' },
      { text: '✅ แก้ไขได้', color: 'green' },
      { text: '❌ ห้ามขาย', color: 'yellow' },
      { text: '🔄 แชร์ต่อสิทธิ์เดิม', color: 'blue' },
    ],
    icon: '🟡',
    badgeClass: 'badgeNC',
  },
  'CC-BY-ND': {
    name: 'CC BY-ND',
    shortDesc: 'ให้เครดิต | ห้ามดัดแปลง/แก้ไข | ใช้เชิงพาณิชย์ได้',
    tags: [
      { text: '✅ ให้เครดิต', color: 'green' },
      { text: '❌ ห้ามแก้ไข', color: 'red' },
      { text: '✅ ขายได้', color: 'green' },
    ],
    icon: '🔴',
    badgeClass: 'badgeND',
  },
  'CC-BY-NC-ND': {
    name: 'CC BY-NC-ND',
    shortDesc: 'ให้เครดิต | ห้ามดัดแปลง | ห้ามใช้เชิงพาณิชย์',
    tags: [
      { text: '✅ ให้เครดิต', color: 'green' },
      { text: '❌ ห้ามแก้ไข', color: 'red' },
      { text: '❌ ห้ามขาย', color: 'red' },
    ],
    icon: '🔴',
    badgeClass: 'badgeND',
  },
};

// ===== Helper Functions =====
export function getLicenseInfo(license: string): LicenseInfo {
  return LICENSE_MAP[license as LicenseType] || LICENSE_MAP['CC-BY'];
}

export function isND(license: string): boolean {
  return license.includes('ND');
}

export function isNC(license: string): boolean {
  return license.includes('NC');
}

// ===== License Logic =====
type CommercialChoice = 'yes' | 'no';
type DerivativeChoice = 'yes' | 'share-alike' | 'no';

function computeLicense(commercial: CommercialChoice, derivative: DerivativeChoice): LicenseType {
  if (commercial === 'yes' && derivative === 'yes') return 'CC-BY';
  if (commercial === 'yes' && derivative === 'share-alike') return 'CC-BY-SA';
  if (commercial === 'yes' && derivative === 'no') return 'CC-BY-ND';
  if (commercial === 'no' && derivative === 'yes') return 'CC-BY-NC';
  if (commercial === 'no' && derivative === 'share-alike') return 'CC-BY-NC-SA';
  return 'CC-BY-NC-ND'; // no + no
}

// ===== Badge Component (Read-only) =====
interface LicenseBadgeProps {
  license: string;
  showDesc?: boolean;
}

export function LicenseBadge({ license, showDesc = false }: LicenseBadgeProps) {
  const info = getLicenseInfo(license);
  return (
    <span
      className={`${styles.badge} ${styles[info.badgeClass]}`}
      title={info.shortDesc}
    >
      {info.icon} {info.name}
      {showDesc && <span style={{ fontWeight: 400, marginLeft: '0.25rem' }}> {info.shortDesc}</span>}
    </span>
  );
}

// ===== Interactive Selector Component =====
interface LicenseSelectorProps {
  value?: string;
  onChange: (license: LicenseType) => void;
}

export default function LicenseSelector({ value = 'CC-BY', onChange }: LicenseSelectorProps) {
  // Reverse-compute initial state from value
  const getInitialState = useCallback((): { commercial: CommercialChoice; derivative: DerivativeChoice } => {
    const v = value as LicenseType;
    const commercial: CommercialChoice = v.includes('NC') ? 'no' : 'yes';
    let derivative: DerivativeChoice = 'yes';
    if (v.includes('ND')) derivative = 'no';
    else if (v.includes('SA')) derivative = 'share-alike';
    return { commercial, derivative };
  }, [value]);

  const [commercial, setCommercial] = useState<CommercialChoice>(getInitialState().commercial);
  const [derivative, setDerivative] = useState<DerivativeChoice>(getInitialState().derivative);

  useEffect(() => {
    const license = computeLicense(commercial, derivative);
    onChange(license);
  }, [commercial, derivative, onChange]);

  const currentLicense = computeLicense(commercial, derivative);
  const info = getLicenseInfo(currentLicense);

  const tagColorClass = (color: string) => {
    if (color === 'green') return styles.tagGreen;
    if (color === 'red') return styles.tagRed;
    if (color === 'blue') return styles.tagBlue;
    return styles.tagYellow;
  };

  return (
    <div className={styles.selectorWrapper}>
      <div className={styles.selectorTitle}>
        ⚖️ เลือกลิขสิทธิ์ Creative Commons
      </div>

      {/* Question 1: Commercial */}
      <div className={styles.questionBlock}>
        <label className={styles.questionLabel}>
          ❶ อนุญาตให้ผู้อื่นนำไปใช้เชิงพาณิชย์ (ขาย/หารายได้) ได้ไหม?
        </label>
        <div className={styles.optionsRow}>
          <button
            type="button"
            className={`${styles.optionBtn} ${commercial === 'yes' ? styles.optionBtnActive : ''}`}
            onClick={() => setCommercial('yes')}
          >
            ✅ อนุญาต
          </button>
          <button
            type="button"
            className={`${styles.optionBtn} ${commercial === 'no' ? styles.optionBtnActive : ''}`}
            onClick={() => setCommercial('no')}
          >
            ❌ ไม่อนุญาต
          </button>
        </div>
      </div>

      {/* Question 2: Derivatives */}
      <div className={styles.questionBlock}>
        <label className={styles.questionLabel}>
          ❷ อนุญาตให้ผู้อื่นดัดแปลง/แก้ไขข้อสอบได้ไหม?
        </label>
        <div className={styles.optionsRow}>
          <button
            type="button"
            className={`${styles.optionBtn} ${derivative === 'yes' ? styles.optionBtnActive : ''}`}
            onClick={() => setDerivative('yes')}
          >
            ✅ ดัดแปลงได้อิสระ
          </button>
          <button
            type="button"
            className={`${styles.optionBtn} ${derivative === 'share-alike' ? styles.optionBtnActive : ''}`}
            onClick={() => setDerivative('share-alike')}
          >
            🔄 ดัดแปลงได้ แต่ต้องแชร์ต่อด้วยสิทธิ์เดิม
          </button>
          <button
            type="button"
            className={`${styles.optionBtn} ${derivative === 'no' ? styles.optionBtnActive : ''}`}
            onClick={() => setDerivative('no')}
          >
            ❌ ห้ามดัดแปลง
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className={styles.previewSection}>
        <div className={styles.previewLabel}>ลิขสิทธิ์ที่เลือก</div>
        <div className={styles.licenseDetail}>
          <span className={styles.licenseIcon}>{info.icon}</span>
          <div className={styles.licenseInfo}>
            <div className={styles.licenseName}>{info.name}</div>
            <div className={styles.licenseDesc}>{info.shortDesc}</div>
            <div className={styles.licenseTagsRow}>
              {info.tags.map((tag, i) => (
                <span key={i} className={`${styles.licenseTag} ${tagColorClass(tag.color)}`}>
                  {tag.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
