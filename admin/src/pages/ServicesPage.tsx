import { Plus, RefreshCw, Save, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { Notice } from '../components/Notice';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { apiRequest } from '../lib/api';
import { useNotice } from '../lib/hooks';
import type { Service } from '../types/admin';

const emptyService = { title: '', description: '', icon: 'Code', image: '', active: true };

export function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState(emptyService);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { notice, showNotice } = useNotice();

  const load = async () => {
    setLoading(true);
    try {
      setServices(await apiRequest<Service[]>('/api/services'));
    } catch (err) {
      showNotice(err instanceof Error ? err.message : 'Impossible de charger les services.', 'error');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => void load(), []);

  const edit = (service: Service) => {
    setEditingId(service.id);
    setForm({ title: service.title, description: service.description, icon: service.icon, image: service.image, active: service.active });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const path = editingId ? `/api/services/${editingId}` : '/api/services';
    const method = editingId ? 'PUT' : 'POST';
    setSaving(true);
    try {
      await apiRequest<Service>(path, { method, body: JSON.stringify(form) });
      showNotice(editingId ? 'Service mis a jour.' : 'Service ajoute.');
      setForm(emptyService);
      setEditingId(null);
      await load();
    } catch (err) {
      showNotice(err instanceof Error ? err.message : 'Enregistrement impossible.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Supprimer ce service ?')) return;
    try {
      await apiRequest(`/api/services/${id}`, { method: 'DELETE' });
      showNotice('Service supprime.');
      await load();
    } catch (err) {
      showNotice(err instanceof Error ? err.message : 'Suppression impossible.', 'error');
    }
  };

  const toggle = async (service: Service) => {
    try {
      await apiRequest<Service>(`/api/services/${service.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...service, active: !service.active })
      });
      showNotice(service.active ? 'Service desactive.' : 'Service active.');
      await load();
    } catch (err) {
      showNotice(err instanceof Error ? err.message : 'Changement de statut impossible.', 'error');
    }
  };

  const filteredServices = services.filter((service) => {
    const matchesQuery = `${service.title} ${service.description} ${service.icon}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === 'all' || (status === 'active' ? service.active : !service.active);
    return matchesQuery && matchesStatus;
  });

  return (
    <div>
      <PageHeader title="Services LoukaTech" description="CRUD complet des services avec statut actif ou inactif." action={<button className="btn-secondary" onClick={load} disabled={loading}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} />Actualiser</button>} />
      {notice && <div className="mb-4"><Notice message={notice.message} type={notice.type} /></div>}
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form className="panel p-5" onSubmit={submit}>
          <h3 className="mb-4 font-bold">{editingId ? 'Modifier le service' : 'Ajouter un service'}</h3>
          <div className="space-y-4">
            <label className="block text-sm font-semibold">Titre<input className="field mt-2" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <label className="block text-sm font-semibold">Description<textarea className="field mt-2 min-h-28" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <label className="block text-sm font-semibold">Icone<input className="field mt-2" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></label>
            <label className="block text-sm font-semibold">Image<input className="field mt-2" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></label>
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />Service actif</label>
            <button className="btn-primary w-full" disabled={saving}>{editingId ? <Save size={16} /> : <Plus size={16} />}{saving ? 'Traitement...' : editingId ? 'Enregistrer' : 'Ajouter'}</button>
            {editingId && <button type="button" className="btn-secondary w-full" onClick={() => { setEditingId(null); setForm(emptyService); }}>Annuler</button>}
          </div>
        </form>
        <section className="panel overflow-hidden">
          <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-[1fr_180px]">
            <input className="field" placeholder="Rechercher un service..." value={query} onChange={(event) => setQuery(event.target.value)} />
            <select className="field" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
              <option value="all">Tous</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Service</th><th className="px-5 py-3">Icone</th><th className="px-5 py-3">Statut</th><th className="px-5 py-3">Actions</th></tr></thead>
              <tbody>
                {filteredServices.map((service) => (
                  <tr className="border-t border-slate-100" key={service.id}>
                    <td className="px-5 py-4"><strong>{service.title}</strong><p className="mt-1 max-w-xl text-slate-500">{service.description}</p></td>
                    <td className="px-5 py-4">{service.icon}</td>
                    <td className="px-5 py-4"><StatusBadge status={service.active ? 'actif' : 'inactif'} /></td>
                    <td className="px-5 py-4"><div className="flex gap-2"><button className="btn-secondary" onClick={() => edit(service)}>Modifier</button><button className="btn-secondary" onClick={() => toggle(service)}>{service.active ? 'Desactiver' : 'Activer'}</button><button className="btn-secondary text-red-600" onClick={() => remove(service.id)}><Trash2 size={16} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && filteredServices.length === 0 && <div className="p-5"><EmptyState title="Aucun service trouve" description="Modifiez les filtres ou ajoutez un nouveau service." /></div>}
        </section>
      </div>
    </div>
  );
}
