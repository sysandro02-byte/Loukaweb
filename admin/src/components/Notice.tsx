export function Notice({ message, type = 'success' }: { message: string; type?: 'success' | 'error' | 'info' }) {
  const classes = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    error: 'border-red-200 bg-red-50 text-red-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800'
  };

  return <div className={`rounded-lg border px-4 py-3 text-sm font-medium ${classes[type]}`}>{message}</div>;
}
