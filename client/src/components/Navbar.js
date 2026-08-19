'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-lg font-semibold text-brand-700"
        >
          🩺 ClinicBook
        </button>
        {user && (
          <nav className="flex items-center gap-4 text-sm">
            <span className="hidden text-slate-500 sm:inline">
              {user.full_name} · <span className="capitalize">{user.role}</span>
            </span>
            <button onClick={() => router.push('/appointments')} className="text-slate-600 hover:text-brand-700">
              Appointments
            </button>
            {user.role === 'patient' && (
              <button onClick={() => router.push('/book')} className="text-slate-600 hover:text-brand-700">
                Book
              </button>
            )}
            {user.role === 'admin' && (
              <button onClick={() => router.push('/admin')} className="text-slate-600 hover:text-brand-700">
                Admin
              </button>
            )}
            <button onClick={handleLogout} className="btn-outline">
              Logout
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
