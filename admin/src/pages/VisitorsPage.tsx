import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { Notice } from '../components/Notice';
import { PageHeader } from '../components/PageHeader';
import { apiRequest } from '../lib/api';
import { formatDate } from '../lib/format';
import { useNotice } from '../lib/hooks';
import type { Visit } from '../types/admin';

export function VisitorsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { notice, showNotice } = useNotice();
  const load = async () => {
    setLoading(true);
    try {
      setVisits(await apiRequest<Visit[]>('/api/visitors'));
    } catch (err) {
      showNotice(err instanceof Error ? err.message : 'Impossible de charger les visites.', 'error');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => void load(), []);

  const filteredVisits = visits.filter((visit) => `${visit.page} ${visit.country} ${visit.city} ${visit.browser} ${visit.os} ${visit.device} ${visit.referrer}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <PageHeader title="Visiteurs et statistiques" description="Donnees internes non publiques utilisees uniquement pour les statistiques, la securite et l'amelioration du site." action={<button className="btn-secondary" onClick={load} disabled={loading}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} />Actualiser</button>} />
      {notice && <div className="mb-4"><Notice message={notice.message} type={notice.type} /></div>}
      <section className="panel overflow-hidden">
        <div className="border-b border-slate-200 p-4">
          <input className="field" placeholder="Rechercher page, pays, appareil, navigateur..." value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Page</th><th className="px-5 py-3">Pays / ville</th><th className="px-5 py-3">Appareil</th><th className="px-5 py-3">Navigateur</th><th className="px-5 py-3">Source</th><th className="px-5 py-3">Date</th></tr></thead>
            <tbody>
              {filteredVisits.map((visit) => (
                <tr className="border-t border-slate-100" key={visit.id}>
                  <td className="px-5 py-4 font-medium">{visit.page}</td>
                  <td className="px-5 py-4">{visit.country}<p className="text-slate-500">{visit.city}</p></td>
                  <td className="px-5 py-4">{visit.device}<p className="text-slate-500">{visit.os}</p></td>
                  <td className="px-5 py-4">{visit.browser}</td>
                  <td className="px-5 py-4 text-slate-500">{visit.referrer || 'Direct'}</td>
                  <td className="px-5 py-4 text-slate-500">{formatDate(visit.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filteredVisits.length === 0 && <div className="p-5"><EmptyState title="Aucune visite trouvee" description="Aucune visite ne correspond a votre recherche." /></div>}
      </section>
    </div>
  );
}
