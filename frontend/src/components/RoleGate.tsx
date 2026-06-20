'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/api';

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function RoleGate({ children, allowedRoles }: RoleGateProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
      router.push('/login');
      return;
    }

    // Quick check: role must be in allowedRoles
    if (!role || (!allowedRoles.includes(role) && role !== 'admin')) {
      setIsAuthorized(false);
      router.push('/unauthorized');
      return;
    }

    // Validate token with server
    getCurrentUser()
      .then((user) => {
        if (user && (allowedRoles.includes(user.role) || user.role === 'admin')) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          router.push('/unauthorized');
        }
      })
      .catch(() => {
        // Token is expired or invalid clear and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        router.push('/login');
      });
  }, [allowedRoles, router]);

  if (isAuthorized === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>กำลังตรวจสอบสิทธิ์...</p>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}
