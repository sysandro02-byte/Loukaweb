export function StatusBadge({ status }: { status: string }) {
  const classes: Record<string, string> = {
    nouveau: 'bg-blue-50 text-blue-700',
    lu: 'bg-violet-50 text-violet-700',
    traite: 'bg-emerald-50 text-emerald-700',
    actif: 'bg-emerald-50 text-emerald-700',
    inactif: 'bg-slate-100 text-slate-600'
  };

  return <span className={`badge ${classes[status] || 'bg-slate-100 text-slate-700'}`}>{status}</span>;
}
