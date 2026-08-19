export function StatusBadge({ status }) {
  const map = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  const cls = map[status] || 'bg-slate-100 text-slate-700';
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${cls}`}>
      {status}
    </span>
  );
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center gap-2 text-slate-500">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
      {label}
    </div>
  );
}

export function Alert({ type = 'error', message }) {
  if (!message) return null;
  const cls =
    type === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-green-200 bg-green-50 text-green-700';
  return (
    <div className={`rounded-md border p-3 text-sm ${cls}`} role="alert">
      {message}
    </div>
  );
}

export function EmptyState({ title, message }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-1 py-10 text-center">
      <p className="font-medium text-slate-700">{title}</p>
      {message && <p className="text-sm text-slate-500">{message}</p>}
    </div>
  );
}
