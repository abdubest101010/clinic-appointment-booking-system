'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge, Spinner, Alert, EmptyState } from '@/components/Feedback';

// Fetches the current user's appointments and renders them with role-aware actions.
export default function AppointmentList({ refreshKey = 0 }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

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
  if (!items.length)
    return <EmptyState title="No appointments yet" message="Book one to get started." />;

  return (
    <div className="space-y-3">
      {actionError && <Alert message={actionError} />}
      {items.map((a) => (
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
