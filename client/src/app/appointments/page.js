'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import AppointmentList from '@/components/AppointmentList';
import { Alert, EmptyState, Spinner } from '@/components/Feedback';
import { api } from '@/lib/api';

function AppointmentsInner() {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <Navbar />
      <div className="mt-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Appointments</h1>
        <button className="btn-outline" onClick={() => setRefreshKey((k) => k + 1)}>
          Refresh
        </button>
      </div>
      <div className="mt-4">
        <AppointmentList refreshKey={refreshKey} />
      </div>
    </main>
  );
}

export default function AppointmentsPage() {
  return (
    <ProtectedRoute>
      <AppointmentsInner />
    </ProtectedRoute>
  );
}
