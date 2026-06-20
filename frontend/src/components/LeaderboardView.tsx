'use client';

import React, { useEffect, useState } from 'react';
import { getTopStudents, getPopularExams, TopStudent, PopularExam } from '@/lib/api';
import { FaTrophy, FaMedal, FaSpinner, FaUser } from 'react-icons/fa';
import QkPageHero from '@/components/QkPageHero';
import styles from './LeaderboardView.module.css';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function LeaderboardView({ role }: { role: 'workspace' | 'student' }) {
  const [activeTab, setActiveTab] = useState<'students' | 'exams'>('students');
  const [topStudents, setTopStudents] = useState<TopStudent[]>([]);
  const [popularExams, setPopularExams] = useState<PopularExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  /* dummy search state – hero requires it but leaderboard hides the search bar */
  const [_search, _setSearch] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (activeTab === 'students') {
        const res = await getTopStudents(20);
        setTopStudents(res.data);
      } else {
        const res = await getPopularExams(20);
        setPopularExams(res.data);
      }
    } catch (err) {
      console.error('Failed to load leaderboard', err);
      setError(err instanceof Error ? err.message : 'ไม่สามารถโหลดกระดานผู้นำได้');
    } finally {
      setIsLoading(false);
    }
  };

  const renderRankIcon = (index: number) => {
    if (index === 0) return <FaTrophy className={styles.iconGold} />; // Gold
    if (index === 1) return <FaMedal className={styles.iconSilver} />; // Silver
    if (index === 2) return <FaMedal className={styles.iconBronze} />; // Bronze
    return <span className={styles.iconNumber}>{index + 1}</span>;
  };

  return (
    <div className={styles.page}>
      {/* Shared hero banner – same component as Repository, Classroom, etc. */}
      <QkPageHero
        title="กระดานผู้นำ (Leaderboard)"
        subtitle="แสดงอันดับและสถิติของผู้ใช้งานเพื่อยกย่องความตั้งใจและสร้างแรงบันดาลใจในการฝึกฝนอย่างต่อเนื่อง"
        heroImage={`${basePath}/leaderboard.png`}
        searchQuery={_search}
        onSearchChange={_setSearch}
        hideSearch
      />

      {/* Tab group below the hero */}
      <div className={styles.tabRow}>
        <div className={styles.tabGroup}>
          <button
            onClick={() => setActiveTab('students')}
            className={`${styles.tab} ${activeTab === 'students' ? styles.tabActive : ''}`}
          >
            🏆 คะแนนสูงสุด (Top Scorers)
          </button>
          <button
            onClick={() => setActiveTab('exams')}
            className={`${styles.tab} ${activeTab === 'exams' ? styles.tabActive : ''}`}
          >
            🔥 ข้อสอบยอดฮิต (Popular Exams)
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loading}>
          <FaSpinner className={`qk-spin ${styles.spinnerIcon}`} />
        </div>
      ) : error ? (
        <div role="alert" className={styles.error}>
          {error}
        </div>
      ) : (
        <div className={styles.panel}>

          {/* TOP STUDENTS - Game-style Cards */}
          {activeTab === 'students' && (
            <div className={styles.list}>
              {topStudents.length > 0 ? topStudents.map((student, idx) => {
                // Lighter gradient colors for top 3
                const gradients = [
                  'linear-gradient(135deg, var(--qk-primary-dark) 0%, var(--qk-primary) 100%)', // 1st
                  'linear-gradient(135deg, var(--qk-primary) 0%, #2f63d6 100%)', // 2nd
                  'linear-gradient(135deg, #2f63d6 0%, #3b6fd1 100%)', // 3rd (darkened so white text passes AA)
                ];
                const isTop3 = idx < 3;

                return (
                  <div
                    key={student.student_id}
                    className={`${styles.card} ${isTop3 ? styles.cardTop : styles.cardRest}`}
                    style={isTop3 ? { background: gradients[idx] } : undefined}
                  >
                    {/* Rank Number */}
                    <div className={styles.rankCol}>
                      {isTop3 ? renderRankIcon(idx) : (
                        <span className={styles.rankFallback}>{idx + 1}</span>
                      )}
                    </div>

                    {/* Profile Picture */}
                    <div className={`${styles.avatar} ${isTop3 ? styles.avatarTop : styles.avatarRest}`}>
                      {student.profile_picture ? (
                        <img
                          src={student.profile_picture}
                          alt={student.name}
                          className={styles.avatarImg}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <FaUser className={isTop3 ? styles.avatarIconTop : styles.avatarIconRest} />
                      )}
                    </div>

                    {/* Name & Role */}
                    <div className={styles.info}>
                      <div className={styles.name}>
                        {student.name}
                      </div>
                      {student.role && (
                        <span className={`${styles.roleBadge} ${isTop3 ? styles.roleBadgeTop : styles.roleBadgeRest}`}>
                          {student.role}
                        </span>
                      )}
                    </div>

                    {/* Exams Taken */}
                    <div className={styles.examsTaken}>
                      {student.exams_taken} ครั้ง
                    </div>

                    {/* Score */}
                    <div className={`${styles.score} ${isTop3 ? styles.scoreTop : styles.scoreRest}`}>
                      {Math.round(student.total_score)}
                    </div>
                  </div>
                );
              }) : (
                <div className={styles.empty}>
                  ยังไม่มีข้อมูลการทำข้อสอบ
                </div>
              )}
            </div>
          )}

          {/* POPULAR EXAMS CARDS */}
          {activeTab === 'exams' && (
            <div className={styles.list}>
              {popularExams.length > 0 ? popularExams.map((exam, idx) => {
                // Lighter gradient colors for top 3
                const gradients = [
                  'linear-gradient(135deg, var(--qk-primary-dark) 0%, var(--qk-primary) 100%)', // 1st
                  'linear-gradient(135deg, var(--qk-primary) 0%, #2f63d6 100%)', // 2nd
                  'linear-gradient(135deg, #2f63d6 0%, #3b6fd1 100%)', // 3rd (darkened so white text passes AA)
                ];
                const isTop3 = idx < 3;

                return (
                  <div
                    key={exam.exam_set_id}
                    className={`${styles.card} ${isTop3 ? styles.cardTop : styles.cardRest}`}
                    style={isTop3 ? { background: gradients[idx] } : undefined}
                  >
                    {/* Rank Number */}
                    <div className={styles.rankCol}>
                      {isTop3 ? renderRankIcon(idx) : (
                        <span className={styles.rankFallback}>{idx + 1}</span>
                      )}
                    </div>

                    {/* Title & Creator */}
                    <div className={styles.info}>
                      <div className={styles.name}>
                        {exam.title}
                      </div>
                      <div className={`${styles.creator} ${isTop3 ? styles.creatorTop : styles.creatorRest}`}>
                        สร้างโดย: {exam.creator_name}
                      </div>
                    </div>

                    {/* Attempts Count */}
                    <div className={`${styles.score} ${isTop3 ? styles.scoreTop : styles.scoreRest}`}>
                      {exam.attempt_count}
                    </div>
                  </div>
                );
              }) : (
                <div className={styles.empty}>
                  ยังไม่มีข้อมูลชุดข้อสอบ
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
