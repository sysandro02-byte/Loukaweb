import { Eye, FileText, Inbox, RefreshCw, Send, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Notice } from '../components/Notice';
import { PageHeader } from '../components/PageHeader';
import { apiRequest } from '../lib/api';
import { formatDate } from '../lib/format';
import { useNotice } from '../lib/hooks';
import type { DashboardStats } from '../types/admin';

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyAction, setBusyAction] = useState('');
  const { notice, showNotice } = useNotice();

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setStats(await apiRequest<DashboardStats>('/api/dashboard'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger le dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => void load(), []);

  const simulateVisit = async () => {
    setBusyAction('visit');
    try {
      await apiRequest('/api/visitors/track', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({
          page: '/admin-demo',
          referrer: 'Dashboard admin',
          country: 'RDC',
          city: 'Kinshasa'
        })
      });
      showNotice('Visite de test ajoutee aux statistiques.');
      await load();
    } catch (err) {
      showNotice(err instanceof Error ? err.message : 'Visite non ajoutee.', 'error');
    } finally {
      setBusyAction('');
    }
  };

  const simulateMessage = async () => {
    setBusyAction('message');
    try {
      await apiRequest('/api/messages/public', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({
          name: 'Test Admin',
          email: 'test-admin@loukatech.com',
          phone: '+243 000 000 000',
          subject: 'Message de test',
          message: 'Message de test genere depuis le dashboard admin pour verifier le flux contact.'
        })
      });
      showNotice('Message de test ajoute.');
      await load();
    } catch (err) {
      showNotice(err instanceof Error ? err.message : 'Message non ajoute.', 'error');
    } finally {
      setBusyAction('');
    }
  };

  if (loading && !stats) return <div className="text-slate-600">Chargement du dashboard...</div>;

  const cards = [
    { label: 'Visiteurs total', value: stats?.totalVisitors ?? 0, icon: Eye },
    { label: "Visiteurs aujourd'hui", value: stats?.todayVisitors ?? 0, icon: Users },
    { label: 'Messages recus', value: stats?.totalMessages ?? 0, icon: Inbox },
    { label: 'Pages suivies', value: stats?.topPages.length ?? 0, icon: FileText }
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Vue globale des visiteurs, messages, pages populaires et dernieres connexions admin."
        action={
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary" onClick={load} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Actualiser
            </button>
            <button className="btn-secondary" onClick={simulateVisit} disabled={busyAction === 'visit'}>
              <Eye size={16} />
              Visite test
            </button>
            <button className="btn-primary" onClick={simulateMessage} disabled={busyAction === 'message'}>
              <Send size={16} />
              Message test
            </button>
          </div>
        }
      />
      <div className="mb-4 space-y-3">
        {notice && <Notice message={notice.message} type={notice.type} />}
        {error && <Notice message={error} type="error" />}
      </div>
      {!stats ? null : (
        <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <article className="panel p-5" key={label}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <strong className="mt-2 block text-3xl">{value}</strong>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-blue-50 text-loukaBlue">
                <Icon size={20} />
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_.9fr]">
        <div className="panel p-5">
          <h3 className="mb-4 font-bold">Trafic et messages</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Line type="monotone" dataKey="visiteurs" stroke="#2563eb" strokeWidth={3} />
                <Line type="monotone" dataKey="messages" stroke="#7c3aed" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel p-5">
          <h3 className="mb-4 font-bold">Pages les plus visitees</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.topPages}>
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        {[
          ['Pays', stats.countries],
          ['Appareils', stats.devices],
          ['Navigateurs', stats.browsers]
        ].map(([title, rows]) => (
          <div className="panel p-5" key={title as string}>
            <h3 className="mb-4 font-bold">{title as string}</h3>
            <div className="space-y-3">
              {(rows as Array<{ name: string; value: number }>).map((row) => (
                <div key={row.name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{row.name}</span>
                    <strong>{row.value}</strong>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-gradient-to-r from-loukaBlue to-loukaViolet" style={{ width: `${Math.min(row.value * 12, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="panel mt-6 overflow-hidden">
        <div className="border-b border-slate-200 p-5">
          <h3 className="font-bold">Dernieres connexions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="px-5 py-3">Utilisateur</th><th className="px-5 py-3">Action</th><th className="px-5 py-3">Date</th></tr>
            </thead>
            <tbody>
              {stats.latestLogins.map((item) => (
                <tr className="border-t border-slate-100" key={item.id}>
                  <td className="px-5 py-4 font-medium">{item.userEmail}</td>
                  <td className="px-5 py-4">{item.action}</td>
                  <td className="px-5 py-4 text-slate-500">{formatDate(item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
        </>
      )}
    </div>
  );
}
