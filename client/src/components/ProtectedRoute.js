'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Guards a page: redirects to /login when not authenticated.
export default function ProtectedRoute({ children, allowRoles }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (allowRoles && !allowRoles.includes(user.role)) router.replace('/dashboard');
  }, [user, loading, allowRoles, router]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Loading…</p>
      </main>
    );
  }
  if (allowRoles && !allowRoles.includes(user.role)) return null;

  return children;
}
