'use client';

import { useMemo, useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaPenFancy, FaBrain, FaLightbulb } from 'react-icons/fa';
import type { ExamResultDetail } from '@/lib/api';
import ScoreDonut from './ScoreDonut';
import styles from './ExamResult.module.css';

/** Minimal question shape needed for review + skill breakdown. */
export interface ExamResultQuestion {
  question_text: string;
  question_type?: string;
  choices?: string[];
  bloom_level?: string | null;
  explanation?: string | null;
}

interface ExamResultProps {
  score: number;
  maxScore: number;
  percentage: number;
  details: ExamResultDetail[];
  questions: ExamResultQuestion[];
}

type Tab = 'all' | 'correct' | 'incorrect';

const CHOICE_LETTERS = ['ก', 'ข', 'ค', 'ง', 'จ', 'ฉ'];

/**
 * Post-exam "data storytelling" panel: animated donut hero, a per-skill
 * (Bloom-level) breakdown, faceted All / Correct / Incorrect review tabs, and a
 * per-question answer review. Pure presentational feed it submit-result data.
 */
export default function ExamResult({ score, maxScore, percentage, details, questions }: ExamResultProps) {
  const [tab, setTab] = useState<Tab>('all');

  const correctCount = details.filter(d => d.is_correct === true).length;
  const incorrectCount = details.filter(d => d.is_correct === false).length;
  const pendingCount = details.filter(d => d.is_correct === null).length;

  // Per-Bloom-level skill breakdown (the only real "tag" available on questions).
  const skills = useMemo(() => {
    const map = new Map<string, { total: number; correct: number }>();
    for (const d of details) {
      if (d.is_correct === null) continue; // skip ungraded essays
      const level = questions[d.question_idx]?.bloom_level?.trim() || 'ไม่ระบุระดับ';
      const entry = map.get(level) ?? { total: 0, correct: 0 };
      entry.total += 1;
      if (d.is_correct) entry.correct += 1;
      map.set(level, entry);
    }
    return Array.from(map.entries())
      .map(([level, v]) => ({ level, ...v, pct: v.total ? Math.round((v.correct / v.total) * 100) : 0 }))
      .sort((a, b) => a.pct - b.pct); // weakest first read the gap fastest
  }, [details, questions]);

  const visible = details.filter(d => {
    if (tab === 'correct') return d.is_correct === true;
    if (tab === 'incorrect') return d.is_correct === false;
    return true;
  });

  return (
    <div className={styles.root}>
      {/* Hero: donut + headline counts */}
      <div className={styles.hero}>
        <ScoreDonut
          percent={percentage}
          centerValue={score}
          centerSub={`/ ${maxScore}`}
          size={150}
          stroke={13}
        />
        <div className={styles.kpis}>
          <div className={styles.kpiPct} style={{ color: percentage >= 50 ? 'var(--color-success)' : 'var(--color-error)' }}>
            {percentage}%
          </div>
          <div className={styles.kpiRow}>
            <span className={styles.kpiCorrect}><FaCheckCircle /> ถูก {correctCount}</span>
            <span className={styles.kpiIncorrect}><FaTimesCircle /> ผิด {incorrectCount}</span>
            {pendingCount > 0 && (
              <span className={styles.kpiPending}><FaPenFancy /> รอตรวจ {pendingCount}</span>
            )}
          </div>
        </div>
      </div>

      {/* Skill-gap matrix by Bloom level */}
      {skills.length > 0 && (
        <div className={styles.skills}>
          <h3 className={styles.sectionTitle}>จุดเด่น / จุดที่ควรพัฒนา (ตามระดับ Bloom)</h3>
          {skills.map(s => {
            const pass = s.pct >= 50;
            return (
              <div key={s.level} className={styles.skillRow}>
                <span className={styles.skillLabel}>{s.level}</span>
                <div className={styles.skillBarTrack}>
                  <div
                    className={`${styles.skillBarFill} ${pass ? styles.skillPass : styles.skillFail}`}
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
                <span className={styles.skillStat}>{s.correct}/{s.total} ({s.pct}%)</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Faceted review tabs */}
      <div className={styles.tabs} role="tablist">
        <button role="tab" aria-selected={tab === 'all'}
          className={`${styles.tab} ${tab === 'all' ? styles.tabActive : ''}`}
          onClick={() => setTab('all')}>
          ทั้งหมด {details.length}
        </button>
        <button role="tab" aria-selected={tab === 'correct'}
          className={`${styles.tab} ${styles.tabCorrect} ${tab === 'correct' ? styles.tabActive : ''}`}
          onClick={() => setTab('correct')}>
          ข้อที่ถูก {correctCount}
        </button>
        <button role="tab" aria-selected={tab === 'incorrect'}
          className={`${styles.tab} ${styles.tabIncorrect} ${tab === 'incorrect' ? styles.tabActive : ''}`}
          onClick={() => setTab('incorrect')}>
          ข้อที่ผิด {incorrectCount}
        </button>
      </div>

      {/* Per-question review */}
      <div className={styles.reviewList}>
        {visible.length === 0 && <p className={styles.reviewEmpty}>ไม่มีข้อในหมวดนี้</p>}
        {visible.map(d => {
          const q = questions[d.question_idx];
          let stateClass = styles.rPending;
          if (d.is_correct === true) stateClass = styles.rCorrect;
          else if (d.is_correct === false) stateClass = styles.rIncorrect;
          return (
            <div key={d.question_idx} className={`${styles.reviewItem} ${stateClass}`}>
              <div className={styles.reviewHead}>
                <span className={styles.reviewNo}>ข้อ {d.question_idx + 1}</span>
                {d.is_correct === true && <span className={styles.tagCorrect}><FaCheckCircle /> ถูก</span>}
                {d.is_correct === false && <span className={styles.tagIncorrect}><FaTimesCircle /> ผิด</span>}
                {d.is_correct === null && <span className={styles.tagPending}><FaPenFancy /> รอตรวจ</span>}
                {q?.bloom_level && (
                  <span className={styles.bloomBadge}>
                    <FaBrain size={10} /> {q.bloom_level}
                  </span>
                )}
              </div>
              {q?.question_text && <p className={styles.reviewQ}>{q.question_text}</p>}

              {/* What this question measures */}
              {q?.bloom_level && (
                <div className={styles.measureInfo}>
                  <FaBrain size={11} />
                  <span>ข้อนี้วัด: <strong>{q.bloom_level}</strong></span>
                </div>
              )}

              {d.is_correct !== null && (
                <div className={styles.answerRow}>
                  <span><strong>คำตอบของคุณ:</strong> {d.selected ?? '—'}</span>
                  {d.is_correct === false && d.correct_answer && (
                    <span className={styles.correctAns}><strong>เฉลย:</strong> {d.correct_answer}</span>
                  )}
                </div>
              )}

              {/* Reasoning for wrong answers */}
              {d.is_correct === false && (
                <div className={styles.reasoningBox}>
                  <div className={styles.reasoningHeader}>
                    <FaLightbulb size={13} />
                    <strong>เหตุผลและคำอธิบาย</strong>
                  </div>
                  {d.explanation ? (
                    <p className={styles.reasoningText}>{d.explanation}</p>
                  ) : q?.explanation ? (
                    <p className={styles.reasoningText}>{q.explanation}</p>
                  ) : q?.bloom_level ? (
                    <p className={styles.reasoningText}>
                      ข้อนี้ออกตามระดับ <strong>{q.bloom_level}</strong> ของ Bloom&apos;s Taxonomy
                      {q.bloom_level.includes('ความจำ') && ' — ต้องจดจำข้อเท็จจริง คำจำกัดความ หรือสูตรต่างๆ'}
                      {q.bloom_level.includes('ความเข้าใจ') && ' — ต้องอธิบายความหมาย สรุปใจความ หรือเปรียบเทียบ'}
                      {q.bloom_level.includes('นำไปใช้') && ' — ต้องประยุกต์ใช้ความรู้ในสถานการณ์ใหม่'}
                      {q.bloom_level.includes('วิเคราะห์') && ' — ต้องแยกแยะ หาความสัมพันธ์ หรือเปรียบเทียบองค์ประกอบ'}
                      {q.bloom_level.includes('ประเมิน') && ' — ต้องตัดสิน ตรวจสอบ หรือให้เหตุผลสนับสนุน'}
                      {q.bloom_level.includes('สร้างสรรค์') && ' — ต้องออกแบบ สร้าง หรือเสนอแนวทางใหม่'}
                    </p>
                  ) : (
                    <p className={styles.reasoningText}>ลองทบทวนเนื้อหาที่เกี่ยวข้องอีกครั้ง</p>
                  )}
                </div>
              )}

              {/* Explanation for correct answers too (if available) */}
              {d.is_correct === true && (d.explanation || q?.explanation) && (
                <p className={styles.explanation}>
                  💡 {d.explanation || q?.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
