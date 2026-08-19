'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Alert, Spinner } from '@/components/Feedback';

function BookInner() {
  const { user } = useAuth();
  const router = useRouter();
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [when, setWhen] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get('/doctors')
      .then((res) => setDoctors(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/appointments', {
        doctor_id: Number(doctorId),
        appointment_at: new Date(when).toISOString(),
        reason,
      });
      router.replace('/appointments');
    } catch (err) {
      setError(err.message + (err.details ? ` (${err.details[0]?.message})` : ''));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Spinner label="Loading doctors…" />;

  return (
    <main className="mx-auto max-w-xl px-4 py-6">
      <Navbar />
      <div className="mt-6 card">
        <h1 className="text-xl font-semibold text-slate-800">Book an appointment</h1>
        <Alert message={error} />
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Doctor</label>
            <select className="input" value={doctorId} required onChange={(e) => setDoctorId(e.target.value)}>
              <option value="">Select a doctor</option>
              {doctors.map((d) => (
                <option key={d.doctor_id} value={d.doctor_id}>
                  {d.full_name} — {d.specialty}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Date & time</label>
            <input className="input" type="datetime-local" value={when} required
              onChange={(e) => setWhen(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Reason</label>
            <textarea className="input" rows={3} value={reason} required maxLength={500}
              onChange={(e) => setReason(e.target.value)} placeholder="Briefly describe your concern" />
          </div>
          <button className="btn w-full" disabled={submitting || !doctorId}>
            {submitting ? 'Booking…' : 'Book appointment'}
          </button>
        </form>
      </div>
    </main>
  );
}

// Only patients may book.
export default function BookPage() {
  return (
    <ProtectedRoute allowRoles={['patient']}>
      <BookInner />
    </ProtectedRoute>
  );
}
