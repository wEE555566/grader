'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface SidebarContextValue {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

const STORAGE_KEY = 'sidebar_open';

export function SidebarProvider({ children }: { children: ReactNode }) {
  // Lazy initialiser: read from localStorage (default true for desktop, false for mobile).
  const [sidebarOpen, setSidebarOpenRaw] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === 'true';
    // Default: open on desktop, closed on mobile
    return window.innerWidth > 768;
  });

  // Persist to localStorage on every change.
  const setSidebarOpen = useCallback((open: boolean) => {
    setSidebarOpenRaw(open);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(open));
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen, setSidebarOpen]);

  // Sync across tabs (optional but nice).
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue !== null) {
        setSidebarOpenRaw(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    // Fallback for pages rendered outside the provider — same as before.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [open, setOpen] = useState(true);
    return { sidebarOpen: open, setSidebarOpen: setOpen, toggleSidebar: () => setOpen(o => !o) };
  }
  return ctx;
}
