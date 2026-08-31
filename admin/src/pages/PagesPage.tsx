import { BrainCircuit, Eye, RefreshCw, Save, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Notice } from '../components/Notice';
import { PageHeader } from '../components/PageHeader';
import { apiRequest } from '../lib/api';
import { useNotice } from '../lib/hooks';
import type { SitePage } from '../types/admin';

type ChangesPreview = {
  count: number;
  changes: Array<{ id: string; name: string; slug: string; published: SitePage; draft: SitePage['draft'] }>;
};

export function PagesPage() {
  const [pages, setPages] = useState<SitePage[]>([]);
  const [preview, setPreview] = useState<ChangesPreview>({ count: 0, changes: [] });
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const { notice, showNotice } = useNotice();
  const page = pages.find((item) => item.id === selectedId);

  const load = async () => {
    setLoading(true);
    try {
      const [data, previewData] = await Promise.all([
        apiRequest<SitePage[]>('/api/pages'),
        apiRequest<ChangesPreview>('/api/pages/preview/changes')
      ]);
      setPages(data);
      setPreview(previewData);
      setSelectedId((current) => current || data[0]?.id || '');
    } catch (err) {
      showNotice(err instanceof Error ? err.message : 'Impossible de charger les pages.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => void load(), []);

  const updatePage = (patch: Partial<SitePage>) => {
    setPages((items) => items.map((item) => (item.id === selectedId ? { ...item, ...patch } : item)));
  };

  const save = async () => {
    if (!page) return;
    setSaving(true);
    try {
      const saved = await apiRequest<SitePage>(`/api/pages/${page.id}`, { method: 'PUT', body: JSON.stringify(page) });
      updatePage(saved);
      showNotice('Brouillon enregistré. Il ne sera pas visible sur le site avant publication.');
      await load();
    } catch (err) {
      showNotice(err instanceof Error ? err.message : 'Enregistrement impossible.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    if (preview.count === 0) return;
    setPublishing(true);
    try {
      const result = await apiRequest<{ message: string }>('/api/pages/publish', { method: 'POST', body: JSON.stringify({}) });
      showNotice(result.message);
      await load();
    } catch (err) {
      showNotice(err instanceof Error ? err.message : 'Publication impossible.', 'error');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Gestion des pages"
        description="Enregistrez vos changements comme brouillons, vérifiez-les puis publiez-les lorsque vous êtes prêt."
        action={
          <div className="flex flex-wrap gap-2">
            <Link className="btn-secondary" to="/ai-control"><BrainCircuit size={16} />Assistant IA</Link>
            <button className="btn-secondary" onClick={load} disabled={loading}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} />Recharger</button>
            <button className="btn-primary" onClick={save} disabled={saving || !page}><Save size={16} />{saving ? 'Enregistrement...' : 'Enregistrer le brouillon'}</button>
          </div>
        }
      />
      {notice && <div className="mb-4"><Notice message={notice.message} type={notice.type} /></div>}

      <section className="mb-6 overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 bg-gradient-to-r from-blue-50 to-violet-50 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-white text-loukaBlue shadow-sm"><Eye size={21} /></div>
            <div><h2 className="font-bold">Aperçu avant publication</h2><p className="mt-1 text-sm text-slate-600">{preview.count === 0 ? 'Aucune modification en attente : le site public affiche les contenus publiés.' : `${preview.count} brouillon(s) sont prêts à être relus.`}</p></div>
          </div>
          <button className="btn-primary" onClick={publish} disabled={publishing || preview.count === 0}><Send size={16} />{publishing ? 'Publication...' : 'Publier les modifications'}</button>
        </div>
        {preview.changes.length > 0 && <div className="grid gap-3 p-5 md:grid-cols-2">
          {preview.changes.map((change) => (
            <article className="rounded-lg border border-slate-200 p-4" key={change.id}>
              <div className="mb-3 flex items-center justify-between gap-3"><h3 className="font-bold">{change.name}</h3><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">Brouillon</span></div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Titre</p>
              <p className="mt-1 text-sm text-slate-500 line-through">{change.published.title}</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{change.draft?.title}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Description</p>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">{change.draft?.description}</p>
            </article>
          ))}
        </div>}
      </section>

      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <aside className="panel p-3">
          {pages.map((item) => (
            <button key={item.id} onClick={() => setSelectedId(item.id)} className={`mb-2 w-full rounded-lg px-4 py-3 text-left text-sm font-semibold ${item.id === selectedId ? 'bg-blue-50 text-loukaBlue' : 'hover:bg-slate-50'}`}>
              <span>{item.name}</span>{item.draft && <span className="ml-2 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">Brouillon</span>}
            </button>
          ))}
        </aside>
        {page && (
          <section className="panel p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold">Titre principal<input className="field mt-2" value={page.title} onChange={(e) => updatePage({ title: e.target.value })} /></label>
              <label className="text-sm font-semibold">Sous-titre<input className="field mt-2" value={page.subtitle} onChange={(e) => updatePage({ subtitle: e.target.value })} /></label>
              <label className="text-sm font-semibold md:col-span-2">Description<textarea className="field mt-2 min-h-28" value={page.description} onChange={(e) => updatePage({ description: e.target.value })} /></label>
              <label className="text-sm font-semibold">Texte du bouton<input className="field mt-2" value={page.buttonText} onChange={(e) => updatePage({ buttonText: e.target.value })} /></label>
              <label className="text-sm font-semibold">Image<input className="field mt-2" value={page.image} onChange={(e) => updatePage({ image: e.target.value })} /></label>
            </div>
            {page.image && <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-50"><img className="h-52 w-full object-cover" src={page.image} alt={`Aperçu ${page.name}`} onError={(event) => { event.currentTarget.style.display = 'none'; }} /></div>}
            <div className="mt-6">
              <h3 className="mb-3 font-bold">Sections</h3>
              <div className="space-y-3">
                {[...page.sections].sort((a, b) => a.order - b.order).map((section) => (
                  <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center" key={section.id}>
                    <input className="field flex-1" value={section.label} onChange={(e) => updatePage({ sections: page.sections.map((item) => item.id === section.id ? { ...item, label: e.target.value } : item) })} />
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={section.visible} onChange={(e) => updatePage({ sections: page.sections.map((item) => item.id === section.id ? { ...item, visible: e.target.checked } : item) })} />Visible</label>
                    <input className="field w-24" type="number" value={section.order} onChange={(e) => updatePage({ sections: page.sections.map((item) => item.id === section.id ? { ...item, order: Number(e.target.value) } : item) })} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
