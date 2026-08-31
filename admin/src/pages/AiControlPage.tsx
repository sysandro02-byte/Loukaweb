import { BrainCircuit, CheckCircle2, FileText, Image, Inbox, RefreshCw, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Notice } from '../components/Notice';
import { PageHeader } from '../components/PageHeader';
import { apiRequest } from '../lib/api';
import { useNotice } from '../lib/hooks';
import type { AiControlAction, AiControlOverview } from '../types/admin';

const actionIcons = {
  'reply-mails': Inbox,
  'update-content': FileText,
  'refresh-images': Image,
  'visitor-report': Users,
  'organize-admin': ShieldCheck
} as const;

export function AiControlPage() {
  const [overview, setOverview] = useState<AiControlOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(false);
  const [busyAction, setBusyAction] = useState('');
  const { notice, showNotice } = useNotice();

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<AiControlOverview>('/api/admin/ai-control/overview');
      setOverview(data);
      setActive(data.enabled);
    } catch (err) {
      showNotice(err instanceof Error ? err.message : 'Impossible de charger le pilotage IA.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => void load(), []);

  const activate = async () => {
    setBusyAction('activate');
    try {
      const data = await apiRequest<Pick<AiControlOverview, 'actions' | 'report'> & { enabled: boolean; message: string }>('/api/admin/ai-control/activate', {
        method: 'POST',
        body: JSON.stringify({})
      });
      setOverview((current) => (current ? { ...current, actions: data.actions, report: data.report, enabled: data.enabled } : current));
      setActive(data.enabled);
      showNotice(data.message);
    } catch (err) {
      showNotice(err instanceof Error ? err.message : 'Activation impossible.', 'error');
    } finally {
      setBusyAction('');
    }
  };

  const applyAction = async (action: AiControlAction) => {
    if (action.status !== 'pret') return;
    setBusyAction(action.id);
    try {
      const data = await apiRequest<Pick<AiControlOverview, 'actions' | 'report'> & { message: string }>('/api/admin/ai-control/apply', {
        method: 'POST',
        body: JSON.stringify({ actionId: action.id })
      });
      setOverview((current) => (current ? { ...current, actions: data.actions, report: data.report } : current));
      showNotice(data.message, 'info');
    } catch (err) {
      showNotice(err instanceof Error ? err.message : 'Action IA non appliquee.', 'error');
    } finally {
      setBusyAction('');
    }
  };

  if (loading && !overview) return <div className="text-slate-600">Chargement du dispositif IA...</div>;

  return (
    <div>
      <PageHeader
        title="Pilotage IA"
        description="Un centre de controle pour mails, contenus, images, rapports visiteurs et organisation admin, avec validation humaine obligatoire."
        action={
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary" onClick={load} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Actualiser
            </button>
            <button className="btn-primary" onClick={activate} disabled={busyAction === 'activate'}>
              <BrainCircuit size={16} />
              {active ? 'Recalculer le plan IA' : 'Activer le pilotage IA'}
            </button>
          </div>
        }
      />

      {notice && <div className="mb-4"><Notice message={notice.message} type={notice.type} /></div>}

      {overview && (
        <>
          <section className="panel overflow-hidden">
            <div className="grid gap-6 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white lg:grid-cols-[1.2fr_.8fr]">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-100">
                  <Sparkles size={14} />
                  Mode controle admin
                </div>
                <h3 className="text-2xl font-bold">{overview.headline}</h3>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{overview.description}</p>
                <div className="mt-5 rounded-xl border border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-50">
                  Securite: l IA ne supprime rien, n envoie pas d email et ne publie pas de contenu sans validation depuis cette interface.
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                  <span className="text-xs text-slate-300">Visiteurs total</span>
                  <strong className="mt-1 block text-3xl">{overview.report.totalVisitors}</strong>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                  <span className="text-xs text-slate-300">Aujourd hui</span>
                  <strong className="mt-1 block text-3xl">{overview.report.todayVisits}</strong>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                  <span className="text-xs text-slate-300">Messages nouveaux</span>
                  <strong className="mt-1 block text-3xl">{overview.report.newMessages}</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-5 xl:grid-cols-[1fr_360px]">
            <div className="grid gap-4">
              {overview.actions.map((action) => {
                const Icon = actionIcons[action.id];
                return (
                  <article className="panel p-5" key={action.id}>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex gap-4">
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-loukaBlue">
                          <Icon size={22} />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold">{action.title}</h3>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${action.status === 'pret' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                              {action.status === 'pret' ? 'Pret' : 'En attente'}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{action.preview}</p>
                          <p className="mt-3 text-xs font-medium text-amber-700">{action.risk}</p>
                        </div>
                      </div>
                      <button className="btn-primary shrink-0" onClick={() => applyAction(action)} disabled={!active || action.status !== 'pret' || busyAction === action.id}>
                        <CheckCircle2 size={16} />
                        Valider
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="panel p-5">
              <h3 className="font-bold">Rapport visiteurs IA</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{overview.report.summary}</p>
              <div className="mt-5 space-y-3">
                {overview.report.topPages.length > 0 ? overview.report.topPages.map((page) => (
                  <div className="rounded-lg border border-slate-200 p-3" key={page.page}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate font-medium">{page.page}</span>
                      <strong>{page.count}</strong>
                    </div>
                  </div>
                )) : (
                  <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">Aucune page visitee pour le moment.</p>
                )}
              </div>
            </aside>
          </section>
        </>
      )}
    </div>
  );
}
