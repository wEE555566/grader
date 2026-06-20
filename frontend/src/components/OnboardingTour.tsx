'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './OnboardingTour.module.css';

/* ================================================================
   Types
   ================================================================ */
export interface TourStep {
  /** CSS selector for the target element to highlight */
  targetSelector: string;
  /** Title of this step */
  title: string;
  /** Description text */
  description: string;
  /** Preferred position of the tooltip relative to the target */
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
  /** Unique key to track "seen" state in localStorage */
  tourKey: string;
  /** Welcome screen title */
  welcomeTitle?: string;
  /** Welcome screen description */
  welcomeDescription?: string;
  /** Welcome screen emoji */
  welcomeEmoji?: string;
  /** Steps to show after welcome */
  steps: TourStep[];
  /** Callback when tour finishes or is skipped */
  onComplete?: () => void;
  /** Force show (ignores localStorage) — used by the "?" help button */
  forceShow?: boolean;
  /** Callback when forceShow is consumed */
  onForceShowConsumed?: () => void;
}

/* ================================================================
   Helpers
   ================================================================ */
const STORAGE_PREFIX = 'tour_seen_';

function getElementRect(selector: string): DOMRect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  return el.getBoundingClientRect();
}

function calcTooltipPosition(
  targetRect: DOMRect,
  position: 'top' | 'bottom' | 'left' | 'right',
  tooltipWidth: number = 320,
): { top: number; left: number; resolvedPos: string } {
  const pad = 14;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let top = 0, left = 0, resolvedPos = position;

  switch (position) {
    case 'bottom':
      top = targetRect.bottom + pad;
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
      if (top + 200 > vh) { resolvedPos = 'top'; top = targetRect.top - pad - 200; }
      break;
    case 'top':
      top = targetRect.top - pad - 200;
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
      if (top < 10) { resolvedPos = 'bottom'; top = targetRect.bottom + pad; }
      break;
    case 'left':
      top = targetRect.top + targetRect.height / 2 - 100;
      left = targetRect.left - pad - tooltipWidth;
      if (left < 10) { resolvedPos = 'right'; left = targetRect.right + pad; }
      break;
    case 'right':
      top = targetRect.top + targetRect.height / 2 - 100;
      left = targetRect.right + pad;
      if (left + tooltipWidth > vw) { resolvedPos = 'left'; left = targetRect.left - pad - tooltipWidth; }
      break;
  }

  // Clamp within viewport
  left = Math.max(12, Math.min(left, vw - tooltipWidth - 12));
  top = Math.max(12, Math.min(top, vh - 220));

  return { top, left, resolvedPos };
}

/* ================================================================
   Component
   ================================================================ */
export default function OnboardingTour({
  tourKey,
  welcomeTitle = 'ยินดีต้อนรับ! 🎉',
  welcomeDescription = 'มาเรียนรู้การใช้งานกันเถอะ',
  welcomeEmoji = '🎓',
  steps,
  onComplete,
  forceShow,
  onForceShowConsumed,
}: OnboardingTourProps) {
  const [visible, setVisible] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Check if tour has been seen
  useEffect(() => {
    if (forceShow) {
      setVisible(true);
      setShowWelcome(true);
      setCurrentStep(0);
      onForceShowConsumed?.();
      return;
    }
    const seen = localStorage.getItem(`${STORAGE_PREFIX}${tourKey}`);
    if (!seen) {
      // Delay showing tour to let the page render first
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [tourKey, forceShow, onForceShowConsumed]);

  // Update target rect when step changes
  const updateTargetRect = useCallback(() => {
    if (showWelcome || currentStep >= steps.length) return;
    const step = steps[currentStep];
    const rect = getElementRect(step.targetSelector);
    setTargetRect(rect);
  }, [currentStep, showWelcome, steps]);

  useEffect(() => {
    updateTargetRect();
    // Also update on resize/scroll
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);
    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [updateTargetRect]);

  const markSeen = useCallback(() => {
    localStorage.setItem(`${STORAGE_PREFIX}${tourKey}`, 'true');
  }, [tourKey]);

  const finish = useCallback(() => {
    markSeen();
    setVisible(false);
    onComplete?.();
  }, [markSeen, onComplete]);

  const skip = useCallback(() => {
    finish();
  }, [finish]);

  const startTour = () => {
    setShowWelcome(false);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep >= steps.length - 1) {
      finish();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!visible || steps.length === 0) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  // Calculate tooltip position
  const tooltipPos = targetRect
    ? calcTooltipPosition(targetRect, step?.position || 'bottom')
    : null;

  const positionClass =
    tooltipPos?.resolvedPos === 'top' ? styles.tooltipTop :
    tooltipPos?.resolvedPos === 'bottom' ? styles.tooltipBottom :
    tooltipPos?.resolvedPos === 'left' ? styles.tooltipLeft :
    styles.tooltipRight;

  const portal = (
    <>
      {/* Backdrop */}
      {showWelcome ? (
        <div className={styles.backdropOverlay} />
      ) : targetRect ? (
        <>
          {/* Spotlight cutout */}
          <div
            className={styles.spotlight}
            style={{
              top: targetRect.top - 6,
              left: targetRect.left - 6,
              width: targetRect.width + 12,
              height: targetRect.height + 12,
            }}
          />
          <div
            className={styles.spotlightPulse}
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
            }}
          />
        </>
      ) : (
        <div className={styles.backdropOverlay} />
      )}

      {/* Welcome Screen */}
      {showWelcome && (
        <div className={styles.welcomeOverlay}>
          <div className={styles.welcomeCard}>
            <div className={styles.welcomeEmoji}>{welcomeEmoji}</div>
            <h2 className={styles.welcomeTitle}>{welcomeTitle}</h2>
            <p className={styles.welcomeDesc}>{welcomeDescription}</p>
            <div className={styles.welcomeActions}>
              <button className={styles.welcomeSkipBtn} onClick={skip}>
                ข้ามไปเลย
              </button>
              <button className={styles.welcomeStartBtn} onClick={startTour}>
                เริ่มเรียนรู้ →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip for each step */}
      {!showWelcome && step && tooltipPos && (
        <div
          ref={tooltipRef}
          className={`${styles.tooltip} ${positionClass}`}
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
          }}
        >
          <div className={styles.header}>
            <span className={styles.stepBadge}>
              {currentStep + 1}/{steps.length}
            </span>
            <span className={styles.title}>{step.title}</span>
          </div>
          <p className={styles.description}>{step.description}</p>
          <div className={styles.footer}>
            <div className={styles.progressDots}>
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`${styles.dot} ${i === currentStep ? styles.dotActive : ''} ${i < currentStep ? styles.dotDone : ''}`}
                />
              ))}
            </div>
            <div className={styles.actions}>
              <button className={styles.skipBtn} onClick={skip}>ข้าม</button>
              {currentStep > 0 && (
                <button className={styles.prevBtn} onClick={prevStep}>
                  ← ก่อน
                </button>
              )}
              <button className={styles.nextBtn} onClick={nextStep}>
                {isLastStep ? 'เสร็จสิ้น ✓' : 'ถัดไป →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* If no target element found, show tooltip centered */}
      {!showWelcome && step && !targetRect && (
        <div className={styles.welcomeOverlay}>
          <div className={styles.welcomeCard} style={{ textAlign: 'left' }}>
            <div className={styles.header}>
              <span className={styles.stepBadge}>
                {currentStep + 1}/{steps.length}
              </span>
              <span className={styles.title}>{step.title}</span>
            </div>
            <p className={styles.description}>{step.description}</p>
            <div className={styles.footer}>
              <div className={styles.progressDots}>
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`${styles.dot} ${i === currentStep ? styles.dotActive : ''} ${i < currentStep ? styles.dotDone : ''}`}
                  />
                ))}
              </div>
              <div className={styles.actions}>
                <button className={styles.skipBtn} onClick={skip}>ข้าม</button>
                {currentStep > 0 && (
                  <button className={styles.prevBtn} onClick={prevStep}>
                    ← ก่อน
                  </button>
                )}
                <button className={styles.nextBtn} onClick={nextStep}>
                  {isLastStep ? 'เสร็จสิ้น ✓' : 'ถัดไป →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Use portal to render at top level
  if (typeof document === 'undefined') return null;
  return createPortal(portal, document.body);
}
