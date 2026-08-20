'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import AppointmentList from '@/components/AppointmentList';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

function DashboardInner() {
  const { user } = useAuth();
  const router = useRouter();

  const title =
    user.role === 'doctor'
      ? 'Your appointments'
      : user.role === 'admin'
      ? 'All appointments'
      : 'Your appointments';

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <Navbar />
      <section className="mt-6">
        <h1 className="text-2xl font-semibold text-slate-800">
          Welcome, {user.full_name.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-slate-500">Role: {user.role}</p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-sm text-slate-500">Book a visit</p>
          {user.role === 'patient' && (
            <button className="btn mt-2 w-full" onClick={() => router.push('/book')}>
              New appointment
            </button>
          )}
          {user.role !== 'patient' && (
            <p className="mt-2 text-sm text-slate-400">Manage appointments below.</p>
          )}
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Profile</p>
          <button className="btn-outline mt-2 w-full" onClick={() => router.push('/profile')}>
            Edit profile
          </button>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Quick links</p>
          {user.role === 'admin' && (
            <button className="btn-outline mt-2 w-full" onClick={() => router.push('/admin')}>
              Admin panel
            </button>
          )}
          {user.role !== 'admin' && (
            <p className="mt-2 text-sm text-slate-400">Your data stays in sync.</p>
          )}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-lg font-medium text-slate-700">{title}</h2>
        <AppointmentList />
      </section>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardInner />
    </ProtectedRoute>
  );
}
