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

  // Doctor registration form state
  const [form, setForm] = useState({ full_name: '', email: '', password: '', specialty: '', bio: '' });
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

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

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleRegisterDoctor(e) {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    setRegLoading(true);
    try {
      await api.post('/doctors', form);
      setRegSuccess(`Doctor ${form.full_name} registered.`);
      setForm({ full_name: '', email: '', password: '', specialty: '', bio: '' });
      setShowForm(false);          // hide the form again
      setRefreshKey((k) => k + 1); // reload doctor list
    } catch (err) {
      setRegError(err.message + (err.details ? ` (${err.details[0]?.message})` : ''));
    } finally {
      setRegLoading(false);
    }
  }

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
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-medium text-slate-700">Doctors ({doctors.length})</h2>
          <button className="btn" onClick={() => setShowForm((s) => !s)}>
            {showForm ? 'Close' : 'Register a doctor'}
          </button>
        </div>

        {showForm && (
          <div className="card">
            <Alert message={regError} />
            {regSuccess && <Alert type="success" message={regSuccess} />}
            <form onSubmit={handleRegisterDoctor} className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Full name</label>
                <input className="input" value={form.full_name} required
                  onChange={(e) => update('full_name', e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input className="input" type="email" value={form.email} required
                  onChange={(e) => update('email', e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Password</label>
                <input className="input" type="password" value={form.password} required minLength={8}
                  onChange={(e) => update('password', e.target.value)} placeholder="Min 8 chars, 1 number, 1 uppercase" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Specialty</label>
                <input className="input" value={form.specialty} required
                  onChange={(e) => update('specialty', e.target.value)} placeholder="e.g. Cardiology" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">Bio (optional)</label>
                <textarea className="input" rows={2} value={form.bio}
                  onChange={(e) => update('bio', e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <button className="btn" disabled={regLoading}>
                  {regLoading ? 'Registering…' : 'Register doctor'}
                </button>
              </div>
            </form>
          </div>
        )}
      </section>

      <section className="mt-4">
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
