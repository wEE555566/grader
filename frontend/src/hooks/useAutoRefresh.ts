import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook สำหรับ Auto-refresh ข้อมูลแบบ Near Real-time
 * ใช้ polling แทน WebSocket เพื่อความเสถียรผ่านทุก Proxy
 * - Poll ทุก intervalMs เมื่อ tab อยู่ในโฟกัส
 * - หยุด poll เมื่อ tab ถูกซ่อน (ประหยัด server load)
 */
export function useAutoRefresh(
  callback: () => void | Promise<void>,
  intervalMs: number = 5000,
  enabled: boolean = true
) {
  const savedCallback = useRef(callback);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // อัพเดท callback ref ทุกครั้งที่ callback เปลี่ยน
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) return; // ถ้ามีอยู่แล้ว ไม่ต้องสร้างใหม่
    intervalRef.current = setInterval(() => {
      savedCallback.current();
    }, intervalMs);
  }, [intervalMs]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      stopPolling();
      return;
    }

    // เริ่ม polling
    startPolling();

    // ตรวจจับว่า tab ถูกซ่อนหรือไม่
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        // เมื่อกลับมาดู tab อีกครั้ง ดึงข้อมูลทันทีแล้วเริ่ม poll ใหม่
        savedCallback.current();
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, startPolling, stopPolling]);
}
