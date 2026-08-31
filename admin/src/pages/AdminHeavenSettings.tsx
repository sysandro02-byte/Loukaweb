import { Archive, Bot, Plus, RefreshCw, Save, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { Notice } from '../components/Notice';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { apiRequest } from '../lib/api';
import { formatDate } from '../lib/format';
import { useNotice } from '../lib/hooks';
import type { HeavenConversation, HeavenLead, HeavenSettings, HeavenStats } from '../types/admin';

const leadStatuses: HeavenLead['status'][] = ['nouveau', 'contacte', 'en_discussion', 'converti', 'abandonne'];

export function AdminHeavenSettings() {
  const [settings, setSettings] = useState<HeavenSettings | null>(null);
  const [conversations, setConversations] = useState<HeavenConversation[]>([]);
  const [stats, setStats] = useState<HeavenStats | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { notice, showNotice } = useNotice();

  const selectedConversation = conversations.find((conversation) => conversation.id === selectedConversationId);

  const load = async () => {
    setLoading(true);
    try {
      const [settingsData, conversationsData, statsData] = await Promise.all([
        apiRequest<HeavenSettings>('/api/admin/heaven/settings'),
        apiRequest<HeavenConversation[]>('/api/admin/heaven/conversations'),
        apiRequest<HeavenStats>('/api/admin/heaven/stats')
      ]);
      setSettings(settingsData);
      setConversations(conversationsData);
      setStats(statsData);
      setSelectedConversationId((current) => current || conversationsData[0]?.id || '');
    } catch (err) {
      showNotice(err instanceof Error ? err.message : 'Impossible de charger Heaven.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => void load(), []);

  const save = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      setSettings(await apiRequest<HeavenSettings>('/api/admin/heaven/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      }));
      showNotice('Reglages Heaven enregistres.');
      await load();
    } catch (err) {
      showNotice(err instanceof Error ? err.message : 'Enregistrement impossible.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateLeadStatus = async (leadId: string, status: HeavenLead['status']) => {
    try {
      await apiRequest(`/api/admin/heaven/leads/${leadId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      showNotice('Statut prospect mis a jour.');
      await load();
    } catch (err) {
      showNotice(err instanceof Error ? err.message : 'Statut non modifie.', 'error');
    }
  };

  const archiveConversation = async (id: string) => {
    await apiRequest(`/api/admin/heaven/conversations/${id}/archive`, { method: 'PATCH' });
    showNotice('Conversation archivee.');
    await load();
  };

  const deleteConversation = async (id: string) => {
    if (!confirm('Supprimer cette conversation Heaven ?')) return;
    await apiRequest(`/api/admin/heaven/conversations/${id}`, { method: 'DELETE' });
    showNotice('Conversation supprimee.');
    await load();
  };

  const addFaq = () => {
    if (!settings) return;
    setSettings({
      ...settings,
      faqs: [...settings.faqs, { id: crypto.randomUUID(), question: 'Nouvelle question', answer: 'Reponse Heaven.' }]
    });
  };

  const addService = () => {
    if (!settings) return;
    setSettings({
      ...settings,
      services: [...settings.services, { id: crypto.randomUUID(), title: 'Nouveau service', description: 'Description du service.', active: true }]
    });
  };

  if (loading && !settings) return <div className="text-slate-600">Chargement de Heaven IA...</div>;

  return (
    <div>
      <PageHeader
        title="Reglages Heaven IA"
        description="Configurez le chatbot, son prompt IA, les FAQ, les services, les prospects et l'historique des conversations."
        action={
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary" onClick={load} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Actualiser
            </button>
            <button className="btn-primary" onClick={() => void save()} disabled={saving || !settings}>
              <Save size={16} />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        }
      />
      {notice && <div className="mb-4"><Notice message={notice.message} type={notice.type} /></div>}

      {stats && (
        <section className="mb-6 grid gap-4 md:grid-cols-4">
          <article className="panel p-5"><p className="text-sm text-slate-500">Conversations</p><strong className="mt-2 block text-3xl">{stats.totalConversations}</strong></article>
          <article className="panel p-5"><p className="text-sm text-slate-500">Prospects</p><strong className="mt-2 block text-3xl">{stats.totalProspects}</strong></article>
          <article className="panel p-5"><p className="text-sm text-slate-500">Conversion</p><strong className="mt-2 block text-3xl">{stats.conversionRate}%</strong></article>
          <article className="panel p-5"><p className="text-sm text-slate-500">Service demande</p><strong className="mt-2 block text-lg">{stats.topServices[0]?.name || 'Aucun'}</strong></article>
        </section>
      )}

      {settings && (
        <form className="grid gap-6 xl:grid-cols-[1fr_.9fr]" onSubmit={save}>
          <section className="panel p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-blue-50 text-loukaBlue"><Bot size={20} /></div>
              <div><h3 className="font-bold">Configuration du chatbot</h3><p className="text-sm text-slate-500">Nom, message d'accueil, prompt et redirections.</p></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold">Activer Heaven<select className="field mt-2" value={String(settings.enabled)} onChange={(event) => setSettings({ ...settings, enabled: event.target.value === 'true' })}><option value="true">Actif</option><option value="false">Desactive</option></select></label>
              <label className="text-sm font-semibold">Nom du chatbot<input className="field mt-2" value={settings.botName} onChange={(event) => setSettings({ ...settings, botName: event.target.value })} /></label>
              <label className="text-sm font-semibold md:col-span-2">Message d'accueil<textarea className="field mt-2 min-h-24" value={settings.welcomeMessage} onChange={(event) => setSettings({ ...settings, welcomeMessage: event.target.value })} /></label>
              <label className="text-sm font-semibold md:col-span-2">Prompt systeme IA<textarea className="field mt-2 min-h-44" value={settings.systemPrompt} onChange={(event) => setSettings({ ...settings, systemPrompt: event.target.value })} /></label>
              <label className="text-sm font-semibold">WhatsApp<input className="field mt-2" value={settings.whatsappNumber} onChange={(event) => setSettings({ ...settings, whatsappNumber: event.target.value })} /></label>
              <label className="text-sm font-semibold">Email reception<input className="field mt-2" type="email" value={settings.receiverEmail} onChange={(event) => setSettings({ ...settings, receiverEmail: event.target.value })} /></label>
            </div>

            <div className="mt-6">
              <h3 className="mb-3 font-bold">Suggestions rapides</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {settings.quickSuggestions.map((suggestion, index) => (
                  <input key={index} className="field" value={suggestion} onChange={(event) => setSettings({ ...settings, quickSuggestions: settings.quickSuggestions.map((item, itemIndex) => itemIndex === index ? event.target.value : item) })} />
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between"><h3 className="font-bold">Questions frequentes</h3><button type="button" className="btn-secondary" onClick={addFaq}><Plus size={16} />FAQ</button></div>
              <div className="space-y-3">
                {settings.faqs.map((faq) => (
                  <div className="rounded-lg border border-slate-200 p-3" key={faq.id}>
                    <input className="field" value={faq.question} onChange={(event) => setSettings({ ...settings, faqs: settings.faqs.map((item) => item.id === faq.id ? { ...item, question: event.target.value } : item) })} />
                    <textarea className="field mt-2 min-h-20" value={faq.answer} onChange={(event) => setSettings({ ...settings, faqs: settings.faqs.map((item) => item.id === faq.id ? { ...item, answer: event.target.value } : item) })} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="panel p-5">
              <div className="mb-3 flex items-center justify-between"><h3 className="font-bold">Services presentes par Heaven</h3><button type="button" className="btn-secondary" onClick={addService}><Plus size={16} />Service</button></div>
              <div className="space-y-3">
                {settings.services.map((service) => (
                  <div className="rounded-lg border border-slate-200 p-3" key={service.id}>
                    <div className="flex items-center gap-2">
                      <input className="field" value={service.title} onChange={(event) => setSettings({ ...settings, services: settings.services.map((item) => item.id === service.id ? { ...item, title: event.target.value } : item) })} />
                      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={service.active} onChange={(event) => setSettings({ ...settings, services: settings.services.map((item) => item.id === service.id ? { ...item, active: event.target.checked } : item) })} />Actif</label>
                    </div>
                    <textarea className="field mt-2 min-h-20" value={service.description} onChange={(event) => setSettings({ ...settings, services: settings.services.map((item) => item.id === service.id ? { ...item, description: event.target.value } : item) })} />
                  </div>
                ))}
              </div>
            </div>

            <div className="panel overflow-hidden">
              <div className="border-b border-slate-200 p-5"><h3 className="font-bold">Prospects Heaven</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Prospect</th><th className="px-4 py-3">Service</th><th className="px-4 py-3">Statut</th><th className="px-4 py-3">Date</th></tr></thead>
                  <tbody>
                    {conversations.filter((conversation) => conversation.lead).map((conversation) => (
                      <tr className="border-t border-slate-100" key={conversation.lead!.id}>
                        <td className="px-4 py-3"><strong>{conversation.lead!.name || 'Sans nom'}</strong><p className="text-slate-500">{conversation.lead!.phone || conversation.lead!.email || 'Contact incomplet'}</p></td>
                        <td className="px-4 py-3">{conversation.lead!.serviceRequested || '-'}</td>
                        <td className="px-4 py-3"><select className="field" value={conversation.lead!.status} onChange={(event) => void updateLeadStatus(conversation.lead!.id, event.target.value as HeavenLead['status'])}>{leadStatuses.map((status) => <option value={status} key={status}>{status}</option>)}</select></td>
                        <td className="px-4 py-3 text-slate-500">{formatDate(conversation.lead!.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {conversations.every((conversation) => !conversation.lead) && <div className="p-5"><EmptyState title="Aucun prospect" description="Les prospects apparaitront quand Heaven detectera des coordonnees ou demandes de devis." /></div>}
            </div>
          </section>
        </form>
      )}

      <section className="panel mt-6 overflow-hidden">
        <div className="border-b border-slate-200 p-5"><h3 className="font-bold">Historique des conversations</h3></div>
        <div className="grid min-h-[420px] lg:grid-cols-[360px_1fr]">
          <aside className="border-r border-slate-200">
            {conversations.map((conversation) => (
              <button key={conversation.id} className={`block w-full border-b border-slate-100 p-4 text-left text-sm transition hover:bg-slate-50 ${conversation.id === selectedConversationId ? 'bg-blue-50' : ''}`} onClick={() => setSelectedConversationId(conversation.id)}>
                <div className="flex items-center justify-between"><strong>{conversation.lead?.name || conversation.visitorId}</strong><StatusBadge status={conversation.status} /></div>
                <p className="mt-1 truncate text-slate-500">{conversation.messages[conversation.messages.length - 1]?.content || conversation.sourcePage}</p>
              </button>
            ))}
            {conversations.length === 0 && <div className="p-5"><EmptyState title="Aucune conversation" description="Les conversations Heaven apparaitront ici." /></div>}
          </aside>
          <div className="p-5">
            {selectedConversation ? (
              <>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div><h3 className="font-bold">Conversation</h3><p className="text-sm text-slate-500">{selectedConversation.sourcePage} · {formatDate(selectedConversation.createdAt)}</p></div>
                  <div className="flex gap-2"><button className="btn-secondary" onClick={() => void archiveConversation(selectedConversation.id)}><Archive size={16} />Archiver</button><button className="btn-secondary text-red-600" onClick={() => void deleteConversation(selectedConversation.id)}><Trash2 size={16} />Supprimer</button></div>
                </div>
                <div className="space-y-3">
                  {selectedConversation.messages.map((message) => (
                    <div className={`max-w-3xl rounded-lg p-3 text-sm ${message.role === 'user' ? 'ml-auto bg-blue-50 text-blue-950' : 'bg-slate-100 text-slate-800'}`} key={message.id}>
                      <p>{message.content}</p>
                      <span className="mt-2 block text-xs text-slate-500">{formatDate(message.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState title="Selectionnez une conversation" description="Cliquez sur une conversation pour voir le detail des messages." />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
