import { CheckCircle, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { Notice } from '../components/Notice';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { apiRequest } from '../lib/api';
import { formatDate } from '../lib/format';
import { useNotice } from '../lib/hooks';
import type { ContactMessage } from '../types/admin';

export function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | ContactMessage['status']>('all');
  const [loading, setLoading] = useState(true);
  const { notice, showNotice } = useNotice();
  const load = async () => {
    setLoading(true);
    try {
      setMessages(await apiRequest<ContactMessage[]>('/api/messages'));
    } catch (err) {
      showNotice(err instanceof Error ? err.message : 'Impossible de charger les messages.', 'error');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => void load(), []);

  const markDone = async (id: string) => {
    try {
      await apiRequest(`/api/messages/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'traite' }) });
      showNotice('Message marque comme traite.');
      await load();
    } catch (err) {
      showNotice(err instanceof Error ? err.message : 'Statut non modifie.', 'error');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Supprimer ce message ?')) return;
    try {
      await apiRequest(`/api/messages/${id}`, { method: 'DELETE' });
      showNotice('Message supprime.');
      await load();
    } catch (err) {
      showNotice(err instanceof Error ? err.message : 'Suppression impossible.', 'error');
    }
  };

  const filteredMessages = messages.filter((message) => {
    const text = `${message.name} ${message.email} ${message.phone} ${message.subject} ${message.message}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (status === 'all' || message.status === status);
  });

  return (
    <div>
      <PageHeader title="Messages contact" description="Tous les messages envoyes depuis le formulaire du site, avec statut de traitement." action={<button className="btn-secondary" onClick={load} disabled={loading}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} />Actualiser</button>} />
      {notice && <div className="mb-4"><Notice message={notice.message} type={notice.type} /></div>}
      <section className="panel overflow-hidden">
        <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-[1fr_180px]">
          <input className="field" placeholder="Rechercher nom, email, sujet..." value={query} onChange={(event) => setQuery(event.target.value)} />
          <select className="field" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
            <option value="all">Tous</option>
            <option value="nouveau">Nouveaux</option>
            <option value="lu">Lus</option>
            <option value="traite">Traites</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Contact</th><th className="px-5 py-3">Sujet</th><th className="px-5 py-3">Message</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Statut</th><th className="px-5 py-3">Actions</th></tr></thead>
            <tbody>
              {filteredMessages.map((message) => (
                <tr className="border-t border-slate-100 align-top" key={message.id}>
                  <td className="px-5 py-4"><strong>{message.name}</strong><p className="text-slate-500">{message.email}</p><p className="text-slate-500">{message.phone}</p></td>
                  <td className="px-5 py-4">{message.subject}</td>
                  <td className="px-5 py-4 max-w-md text-slate-600">{message.message}</td>
                  <td className="px-5 py-4 text-slate-500">{formatDate(message.createdAt)}</td>
                  <td className="px-5 py-4"><StatusBadge status={message.status} /></td>
                  <td className="px-5 py-4"><div className="flex gap-2"><button className="btn-secondary" onClick={() => markDone(message.id)}><CheckCircle size={16} /></button><button className="btn-secondary text-red-600" onClick={() => remove(message.id)}><Trash2 size={16} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filteredMessages.length === 0 && <div className="p-5"><EmptyState title="Aucun message trouve" description="Aucun message ne correspond a vos filtres." /></div>}
      </section>
    </div>
  );
}
