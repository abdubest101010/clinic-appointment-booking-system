'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/Feedback';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    role: 'patient',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      router.replace('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="card">
        <h1 className="mb-1 text-xl font-semibold text-brand-700">Create account</h1>
        <p className="mb-4 text-sm text-slate-500">Register as a patient (default).</p>
        <Alert message={error} />
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
            <label className="mb-1 block text-sm font-medium">Phone (optional)</label>
            <input className="input" value={form.phone}
              onChange={(e) => update('phone', e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input className="input" type="password" value={form.password} required minLength={8}
              onChange={(e) => update('password', e.target.value)} placeholder="Min 8 chars, 1 number, 1 uppercase" />
          </div>
          <button className="btn w-full" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-700 hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
