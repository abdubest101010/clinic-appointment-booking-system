'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge, Spinner, Alert, EmptyState } from '@/components/Feedback';

const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

// Fetches the current user's appointments and renders them with role-aware
// actions, a status filter, and soonest-appointment-first sorting (near today
// appears at the top).
export default function AppointmentList({ refreshKey = 0 }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [filter, setFilter] = useState('all');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/appointments');
      setItems(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  async function act(path, method, body) {
    setActionError('');
    try {
      await api[method](path, body);
      await load();
    } catch (err) {
      setActionError(err.message);
    }
  }

  if (loading) return <Spinner label="Loading appointments…" />;
  if (error) return <Alert message={error} />;

  // Filter by status, then sort soonest-first (closest to today at the top).
  const visible = items
    .filter((a) => filter === 'all' || a.status === filter)
    .slice()
    .sort((a, b) => new Date(a.appointment_at) - new Date(b.appointment_at));

  if (!items.length)
    return <EmptyState title="No appointments yet" message="Book one to get started." />;

  return (
    <div className="space-y-3">
      {actionError && <Alert message={actionError} />}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={
              filter === f
                ? 'btn'
                : 'btn-outline'
            }
          >
            {f === 'all' ? 'All' : f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {visible.length === 0 && (
        <EmptyState title="No appointments match this filter" />
      )}

      {visible.map((a) => (
        <div key={a.id} className="card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-medium text-slate-800">
                {user.role === 'patient' ? a.doctor_name : a.patient_name} · {a.specialty}
              </p>
              <p className="text-sm text-slate-500">
                {new Date(a.appointment_at).toLocaleString()} — {a.reason}
              </p>
            </div>
            <StatusBadge status={a.status} />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {user.role === 'patient' && a.status !== 'cancelled' && a.status !== 'completed' && (
              <button className="btn-outline" onClick={() => act(`/appointments/${a.id}/cancel`, 'patch')}>
                Cancel
              </button>
            )}
            {user.role === 'doctor' && a.status === 'pending' && (
              <button className="btn" onClick={() => act(`/appointments/${a.id}/status`, 'patch', { status: 'confirmed' })}>
                Confirm
              </button>
            )}
            {user.role === 'doctor' && a.status === 'confirmed' && (
              <button className="btn" onClick={() => act(`/appointments/${a.id}/status`, 'patch', { status: 'completed' })}>
                Complete
              </button>
            )}
            {user.role === 'admin' && (
              <button className="btn-outline" onClick={() => act(`/appointments/${a.id}`, 'del')}>
                Delete
              </button>
            )}
          </div>
          {a.notes && <p className="mt-2 text-xs text-slate-400">Notes: {a.notes}</p>}
        </div>
      ))}
    </div>
  );
}
