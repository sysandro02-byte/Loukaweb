import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { Notice } from '../components/Notice';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { apiRequest } from '../lib/api';
import { formatDate } from '../lib/format';
import { useNotice } from '../lib/hooks';
import type { AdminRole, AdminUser } from '../types/admin';

const roles: AdminRole[] = ['super_admin', 'editor', 'moderator', 'readonly'];

export function AdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'readonly' as AdminRole });
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { notice, showNotice } = useNotice();
  const load = async () => {
    setLoading(true);
    try {
      setAdmins(await apiRequest<AdminUser[]>('/api/admins'));
    } catch (err) {
      showNotice(err instanceof Error ? err.message : 'Impossible de charger les administrateurs.', 'error');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => void load(), []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await apiRequest('/api/admins', { method: 'POST', body: JSON.stringify(form) });
      showNotice('Administrateur ajoute.');
      setForm({ name: '', email: '', password: '', role: 'readonly' });
      await load();
    } catch (err) {
      showNotice(err instanceof Error ? err.message : 'Creation impossible.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Supprimer cet administrateur ?')) return;
    try {
      await apiRequest(`/api/admins/${id}`, { method: 'DELETE' });
      showNotice('Administrateur supprime.');
      await load();
    } catch (err) {
      showNotice(err instanceof Error ? err.message : 'Suppression impossible.', 'error');
    }
  };

  const filteredAdmins = admins.filter((admin) => `${admin.name} ${admin.email} ${admin.role}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <PageHeader title="Administrateurs" description="Gestion des roles : Super Admin, Editeur, Moderateur et Lecture seule." action={<button className="btn-secondary" onClick={load} disabled={loading}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} />Actualiser</button>} />
      {notice && <div className="mb-4"><Notice message={notice.message} type={notice.type} /></div>}
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form className="panel p-5" onSubmit={submit}>
          <h3 className="mb-4 font-bold">Ajouter un administrateur</h3>
          <div className="space-y-4">
            <input className="field" placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="field" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <input className="field" placeholder="Mot de passe temporaire" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={10} />
            <select className="field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as AdminRole })}>{roles.map((role) => <option key={role} value={role}>{role}</option>)}</select>
            <button className="btn-primary w-full" disabled={saving}><Plus size={16} />{saving ? 'Creation...' : 'Ajouter'}</button>
          </div>
        </form>
        <section className="panel overflow-hidden">
          <div className="border-b border-slate-200 p-4">
            <input className="field" placeholder="Rechercher un administrateur..." value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Nom</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Derniere connexion</th><th className="px-5 py-3">Action</th></tr></thead>
              <tbody>
                {filteredAdmins.map((admin) => (
                  <tr className="border-t border-slate-100" key={admin.id}>
                    <td className="px-5 py-4 font-medium">{admin.name}</td>
                    <td className="px-5 py-4">{admin.email}</td>
                    <td className="px-5 py-4"><StatusBadge status={admin.role} /></td>
                    <td className="px-5 py-4 text-slate-500">{admin.lastLoginAt ? formatDate(admin.lastLoginAt) : 'Jamais'}</td>
                    <td className="px-5 py-4"><button className="btn-secondary text-red-600" onClick={() => remove(admin.id)}><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && filteredAdmins.length === 0 && <div className="p-5"><EmptyState title="Aucun administrateur trouve" description="Aucun compte ne correspond a votre recherche." /></div>}
        </section>
      </div>
    </div>
  );
}
