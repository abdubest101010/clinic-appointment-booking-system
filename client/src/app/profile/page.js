'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/Feedback';
import { api } from '@/lib/api';

function ProfileInner() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: user.full_name || '',
    email: user.email || '',
    phone: user.phone || '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      // Only send password if the user typed a new one.
      const payload = { ...form };
      if (!payload.password) delete payload.password;

      const res = await api.patch('/auth/me', payload);
      setUser(res.data); // keep the UI in sync with the updated profile
      setSuccess('Profile updated successfully.');
      setForm((f) => ({ ...f, password: '' }));
    } catch (err) {
      setError(err.message + (err.details ? ` (${err.details[0]?.message})` : ''));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-6">
      <Navbar />
      <div className="mt-6 card">
        <h1 className="text-xl font-semibold text-slate-800">My profile</h1>
        <p className="text-sm text-slate-500">Role: {user.role}</p>
        <Alert message={error} />
        {success && <Alert type="success" message={success} />}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
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
            <label className="mb-1 block text-sm font-medium">Phone</label>
            <input className="input" value={form.phone}
              onChange={(e) => update('phone', e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">New password (optional)</label>
            <input className="input" type="password" value={form.password} minLength={8}
              onChange={(e) => update('password', e.target.value)}
              placeholder="Leave blank to keep current" />
          </div>
          <div className="flex gap-2">
            <button className="btn" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save changes'}
            </button>
            <button type="button" className="btn-outline" onClick={() => router.push('/dashboard')}>
              Back
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileInner />
    </ProtectedRoute>
  );
}
