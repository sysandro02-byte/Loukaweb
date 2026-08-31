import { Copy, RefreshCw, Trash2, Upload } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { Notice } from '../components/Notice';
import { PageHeader } from '../components/PageHeader';
import { apiRequest } from '../lib/api';
import { formatBytes, formatDate } from '../lib/format';
import { useNotice } from '../lib/hooks';
import type { MediaItem } from '../types/admin';

export function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [linkedTo, setLinkedTo] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { notice, showNotice } = useNotice();
  const load = async () => {
    setLoading(true);
    try {
      setItems(await apiRequest<MediaItem[]>('/api/media'));
    } catch (err) {
      showNotice(err instanceof Error ? err.message : 'Impossible de charger les medias.', 'error');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => void load(), []);

  const upload = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    formData.append('linkedTo', linkedTo);
    setUploading(true);
    try {
      await apiRequest('/api/media', { method: 'POST', body: formData });
      showNotice('Image uploadee.');
      setFile(null);
      setLinkedTo('');
      await load();
    } catch (err) {
      showNotice(err instanceof Error ? err.message : 'Upload impossible.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Supprimer cette image ?')) return;
    try {
      await apiRequest(`/api/media/${id}`, { method: 'DELETE' });
      showNotice('Image supprimee.');
      await load();
    } catch (err) {
      showNotice(err instanceof Error ? err.message : 'Suppression impossible.', 'error');
    }
  };

  const filteredItems = items.filter((item) => `${item.originalName} ${item.linkedTo || ''} ${item.mimeType}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <PageHeader title="Bibliotheque media" description="Upload, suppression, copie de lien et association d'images aux pages ou services." action={<button className="btn-secondary" onClick={load} disabled={loading}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} />Actualiser</button>} />
      {notice && <div className="mb-4"><Notice message={notice.message} type={notice.type} /></div>}
      <form className="panel mb-6 grid gap-4 p-5 md:grid-cols-[1fr_1fr_auto]" onSubmit={upload}>
        <input className="field" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(event) => setFile(event.target.files?.[0] || null)} required />
        <input className="field" placeholder="Associer a une page ou un service" value={linkedTo} onChange={(event) => setLinkedTo(event.target.value)} />
        <button className="btn-primary" disabled={uploading}><Upload size={16} />{uploading ? 'Upload...' : 'Uploader'}</button>
      </form>
      <input className="field mb-4" placeholder="Rechercher un media..." value={query} onChange={(event) => setQuery(event.target.value)} />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {filteredItems.map((item) => (
          <article className="panel overflow-hidden" key={item.id}>
            <img className="h-44 w-full object-cover" src={item.url} alt={item.originalName} />
            <div className="p-4">
              <h3 className="truncate font-semibold">{item.originalName}</h3>
              <p className="mt-1 text-xs text-slate-500">{formatBytes(item.size)} · {formatDate(item.createdAt)}</p>
              <p className="mt-1 truncate text-xs text-slate-500">{item.linkedTo || 'Non associe'}</p>
              <div className="mt-4 flex gap-2">
                <button className="btn-secondary flex-1" onClick={() => { void navigator.clipboard.writeText(new URL(item.url, window.location.origin).href); showNotice('Lien copie.'); }}><Copy size={16} />Lien</button>
                <button className="btn-secondary text-red-600" onClick={() => remove(item.id)}><Trash2 size={16} /></button>
              </div>
            </div>
          </article>
        ))}
      </section>
      {!loading && filteredItems.length === 0 && <EmptyState title="Aucun media trouve" description="Uploadez une image ou modifiez votre recherche." />}
    </div>
  );
}
