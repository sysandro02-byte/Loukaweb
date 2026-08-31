import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { addActivity } from '../utils/activity';
import { readDb, writeDb } from '../utils/storage';

export const pagesRouter = Router();

const pageSchema = z.object({
  title: z.string().min(2),
  subtitle: z.string().min(2),
  description: z.string().min(2),
  buttonText: z.string().min(1),
  image: z.string(),
  sections: z.array(z.object({ id: z.string(), label: z.string().min(1), visible: z.boolean(), order: z.number() }))
});
const publishSchema = z.object({ ids: z.array(z.string()).optional() });

function editorPage<T extends { draft?: object }>(page: T) {
  return page.draft ? { ...page, ...page.draft } : page;
}

function publicPage<T extends { draft?: unknown }>(page: T) {
  const { draft: _draft, ...published } = page;
  return published;
}

pagesRouter.get('/public/:slug', (request, response) => {
  const page = readDb().pages.find((item) => item.slug === request.params.slug);
  if (!page) return response.status(404).json({ message: 'Page introuvable.' });
  response.json(publicPage(page));
});

pagesRouter.get('/', requireAuth('pages'), (_request, response) => {
  response.json(readDb().pages.map(editorPage));
});

pagesRouter.get('/preview/changes', requireAuth('pages'), (_request, response) => {
  const changes = readDb().pages.filter((page) => page.draft).map((page) => ({
    id: page.id, name: page.name, slug: page.slug, published: publicPage(page), draft: page.draft
  }));
  response.json({ changes, count: changes.length });
});

pagesRouter.post('/publish', requireAuth('pages'), (request, response) => {
  const parsed = publishSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ message: 'Publication invalide.' });
  const db = readDb();
  const pagesToPublish = db.pages.filter((page) => page.draft && (!parsed.data.ids || parsed.data.ids.includes(page.id)));
  if (pagesToPublish.length === 0) return response.status(400).json({ message: 'Aucun brouillon à publier.' });
  pagesToPublish.forEach((page) => {
    const { updatedAt, ...content } = page.draft!;
    Object.assign(page, content, { updatedAt });
    delete page.draft;
  });
  addActivity(db, request.admin, 'Publication de brouillons', `${pagesToPublish.length} page(s)`);
  writeDb(db);
  response.json({ message: `${pagesToPublish.length} page(s) publiée(s).`, pages: pagesToPublish.map(editorPage) });
});

pagesRouter.put('/:id', requireAuth('pages'), (request, response) => {
  const result = pageSchema.safeParse(request.body);
  if (!result.success) return response.status(400).json({ message: 'Donnees de page invalides.' });

  const db = readDb();
  const index = db.pages.findIndex((page) => page.id === request.params.id);
  if (index === -1) return response.status(404).json({ message: 'Page introuvable.' });

  const updatedAt = new Date().toISOString();
  db.pages[index] = { ...db.pages[index], draft: { ...result.data, updatedAt }, updatedAt };
  addActivity(db, request.admin, 'Mise a jour d un brouillon', db.pages[index].name);
  writeDb(db);
  response.json(editorPage(db.pages[index]));
});
