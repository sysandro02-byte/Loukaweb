import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { apiRequest } from '../lib/api';
import { formatDate } from '../lib/format';
import type { Activity } from '../types/admin';

export function ActivityPage() {
  const [items, setItems] = useState<Activity[]>([]);
  useEffect(() => void apiRequest<Activity[]>('/api/activity').then(setItems), []);

  return (
    <div>
      <PageHeader title="Journal d'activite" description="Historique des connexions et actions sensibles realisees dans l'administration." />
      <section className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Action</th><th className="px-5 py-3">Utilisateur</th><th className="px-5 py-3">Cible</th><th className="px-5 py-3">Date</th></tr></thead>
            <tbody>
              {items.map((item) => (
                <tr className="border-t border-slate-100" key={item.id}>
                  <td className="px-5 py-4 font-medium">{item.action}</td>
                  <td className="px-5 py-4">{item.userEmail}</td>
                  <td className="px-5 py-4 text-slate-500">{item.target}</td>
                  <td className="px-5 py-4 text-slate-500">{formatDate(item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
