import type { ReactNode } from 'react';

export function PageHeader({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">{description}</p>
      </div>
      {action}
    </div>
  );
}
