'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import AppointmentList from '@/components/AppointmentList';
import { api } from '@/lib/api';
import { Alert, Spinner } from '@/components/Feedback';

function AdminInner() {
  const [doctors, setDoctors] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    Promise.all([api.get('/doctors'), api.get('/appointments')])
      .then(([d, a]) => {
        setDoctors(d.data || []);
        const list = a.data || [];
        setStats({
          total: list.length,
          pending: list.filter((x) => x.status === 'pending').length,
          confirmed: list.filter((x) => x.status === 'confirmed').length,
          completed: list.filter((x) => x.status === 'completed').length,
          cancelled: list.filter((x) => x.status === 'cancelled').length,
        });
      })
      .catch((err) => setError(err.message));
  }, [refreshKey]);

  if (error) return <Alert message={error} />;
  if (!stats) return <Spinner label="Loading admin data…" />;

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <Navbar />
      <h1 className="mt-6 text-xl font-semibold text-slate-800">Admin panel</h1>

      <section className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          ['Total', stats.total],
          ['Pending', stats.pending],
          ['Confirmed', stats.confirmed],
          ['Completed', stats.completed],
          ['Cancelled', stats.cancelled],
        ].map(([label, value]) => (
          <div key={label} className="card text-center">
            <p className="text-2xl font-semibold text-brand-700">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-lg font-medium text-slate-700">Doctors ({doctors.length})</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {doctors.map((d) => (
            <div key={d.doctor_id} className="card">
              <p className="font-medium text-slate-800">{d.full_name}</p>
              <p className="text-sm text-slate-500">{d.specialty}</p>
              <p className="mt-1 text-xs text-slate-400">{d.email}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-medium text-slate-700">All appointments</h2>
          <button className="btn-outline" onClick={() => setRefreshKey((k) => k + 1)}>
            Refresh
          </button>
        </div>
        <AppointmentList refreshKey={refreshKey} />
      </section>
    </main>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute allowRoles={['admin']}>
      <AdminInner />
    </ProtectedRoute>
  );
}
