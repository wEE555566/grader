'use client';

import { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaRobot, FaUser, FaHeadset, FaTimes, FaArrowLeft, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import styles from './ChatBot.module.css';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'สวัสดีครับ! ผมคือ **คู่ครู AI** ผู้ช่วยอัจฉริยะของ QooKru 🦉\n\nผมสามารถช่วยคุณได้เรื่องต่อไปนี้:\n- 📝 วิธีสร้างข้อสอบด้วย AI\n- 🏫 การจัดการห้องเรียน\n- 📊 วิเคราะห์ผลการเรียนรู้\n- ⚙️ การตั้งค่าระบบ\n\nถามเลยครับ!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Report form state
  const [showReport, setShowReport] = useState(false);
  const [reportCategory, setReportCategory] = useState('bug');
  const [reportDesc, setReportDesc] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const getApiBase = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
    if (process.env.NEXT_PUBLIC_BASE_PATH) return process.env.NEXT_PUBLIC_BASE_PATH;
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/qookru')) {
      return '/qookru';
    }
    return '';
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    // Add placeholder for assistant
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const apiBase = getApiBase();
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiBase}/api/v1/chat/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(-6),
        }),
      });

      if (!response.ok) {
        throw new Error('Chat API error');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              fullContent += data;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: fullContent };
                return updated;
              });
            }
          }
        }
      }

      // If no content received, show fallback
      if (!fullContent) {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: 'ขออภัย ไม่สามารถตอบได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง'
          };
          return updated;
        });
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง หรือติดต่อแอดมินเพื่อขอความช่วยเหลือ'
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const [reportSubmitting, setReportSubmitting] = useState(false);

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitting(true);
    try {
      const apiBase = getApiBase();
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiBase}/api/v1/problem-reports/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          category: reportCategory,
          description: reportDesc,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'ส่งรายงานไม่สำเร็จ');
      }

      setReportSubmitted(true);
      setTimeout(() => {
        setReportSubmitted(false);
        setReportDesc('');
        setShowReport(false);
      }, 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
      alert(msg);
    } finally {
      setReportSubmitting(false);
    }
  };

  // Simple markdown-like rendering
  const renderContent = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
      .replace(/- /g, '• ');
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          className={styles.floatingBtn}
          onClick={() => setIsOpen(true)}
          aria-label="เปิดแชทบอท"
        >
          <FaRobot size={24} />
          <span className={styles.floatingLabel}>คู่ครู AI</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderInfo}>
              <div className={styles.chatAvatar}>
                <FaRobot />
              </div>
              <div>
                <h3>คู่ครู AI</h3>
                <span className={styles.chatStatus}>ออนไลน์</span>
              </div>
            </div>
            <button className={styles.chatCloseBtn} onClick={() => setIsOpen(false)}>
              <FaTimes />
            </button>
          </div>

          {/* Messages or Report */}
          {!showReport ? (
            <>
              <div className={styles.chatMessages}>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`${styles.messageRow} ${msg.role === 'user' ? styles.userRow : styles.assistantRow}`}
                  >
                    <div className={`${styles.messageAvatar} ${msg.role === 'user' ? styles.userAvatar : styles.botAvatar}`}>
                      {msg.role === 'user' ? <FaUser /> : <FaRobot />}
                    </div>
                    <div
                      className={`${styles.messageBubble} ${msg.role === 'user' ? styles.userBubble : styles.assistantBubble}`}
                      dangerouslySetInnerHTML={{ __html: renderContent(msg.content || '...') }}
                    />
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.content === '' && (
                  <div className={`${styles.messageRow} ${styles.assistantRow}`}>
                    <div className={`${styles.messageAvatar} ${styles.botAvatar}`}>
                      <FaRobot />
                    </div>
                    <div className={`${styles.messageBubble} ${styles.assistantBubble}`}>
                      <span className={styles.typingDots}>
                        <span></span><span></span><span></span>
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Contact Admin Button */}
              <div className={styles.adminBar}>
                <button onClick={() => setShowReport(true)} className={styles.adminBtn}>
                  <FaHeadset />
                  <span>ติดต่อแอดมิน</span>
                </button>
              </div>

              {/* Input */}
              <div className={styles.chatInputArea}>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="พิมพ์ข้อความ..."
                  className={styles.chatInput}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  className={styles.sendBtn}
                  disabled={isLoading || !input.trim()}
                >
                  <FaPaperPlane />
                </button>
              </div>
            </>
          ) : (
            <div className={styles.reportContainer}>
              <button className={styles.backToChatBtn} onClick={() => setShowReport(false)}>
                <FaArrowLeft /> ย้อนกลับ
              </button>
              
              <div className={styles.reportHeader}>
                <FaExclamationTriangle size={24} color="#f59e0b" />
                <div>
                  <h4>รายงานปัญหา</h4>
                  <div className={styles.reportDesc}>แจ้งปัญหาเพื่อให้เราปรับปรุงระบบให้ดียิ่งขึ้น</div>
                </div>
              </div>

              {reportSubmitted ? (
                <div className={styles.successBox}>
                  <FaCheckCircle className={styles.successIcon} />
                  <h3>ส่งรายงานสำเร็จ!</h3>
                  <p>ขอบคุณสำหรับข้อมูล ทีมงานจะรีบตรวจสอบโดยเร็วที่สุด</p>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className={styles.formGroup}>
                    <label>ประเภทปัญหา</label>
                    <select 
                      value={reportCategory} 
                      onChange={(e) => setReportCategory(e.target.value)} 
                      className={styles.select}
                    >
                      <option value="bug">บัค / ข้อผิดพลาดของระบบ</option>
                      <option value="ui">ปัญหาหน้าจอ / UI</option>
                      <option value="ai">ปัญหาเกี่ยวกับ AI</option>
                      <option value="classroom">ปัญหาห้องเรียน / ข้อสอบ</option>
                      <option value="suggestion">ข้อเสนอแนะ</option>
                      <option value="other">อื่นๆ</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>รายละเอียด</label>
                    <textarea
                      value={reportDesc}
                      onChange={(e) => setReportDesc(e.target.value)}
                      placeholder="อธิบายปัญหาที่พบ หรือข้อเสนอแนะของคุณ..."
                      className={styles.textarea}
                      rows={5}
                      required
                    />
                  </div>

                  <button type="submit" className={styles.reportSubmitBtn} disabled={!reportDesc.trim() || reportSubmitting}>
                    <FaPaperPlane />
                    <span>{reportSubmitting ? 'กำลังส่ง...' : 'ส่งรายงาน'}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
