import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { addActivity } from '../utils/activity';
import { readDb, writeDb } from '../utils/storage';

export const servicesRouter = Router();

const serviceSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(5),
  icon: z.string().min(1),
  image: z.string(),
  active: z.boolean()
});

servicesRouter.get('/public', (_request, response) => {
  response.json(readDb().services.filter((service) => service.active));
});

servicesRouter.get('/', requireAuth('services'), (_request, response) => response.json(readDb().services));

servicesRouter.post('/', requireAuth('services'), (request, response) => {
  const result = serviceSchema.safeParse(request.body);
  if (!result.success) return response.status(400).json({ message: 'Service invalide.' });
  const db = readDb();
  const service = { id: randomUUID(), ...result.data, createdAt: new Date().toISOString() };
  db.services.unshift(service);
  addActivity(db, request.admin, 'Ajout d un service', service.title);
  writeDb(db);
  response.status(201).json(service);
});

servicesRouter.put('/:id', requireAuth('services'), (request, response) => {
  const result = serviceSchema.safeParse(request.body);
  if (!result.success) return response.status(400).json({ message: 'Service invalide.' });
  const db = readDb();
  const index = db.services.findIndex((service) => service.id === request.params.id);
  if (index === -1) return response.status(404).json({ message: 'Service introuvable.' });
  db.services[index] = { ...db.services[index], ...result.data };
  addActivity(db, request.admin, 'Modification d un service', db.services[index].title);
  writeDb(db);
  response.json(db.services[index]);
});

servicesRouter.delete('/:id', requireAuth('services'), (request, response) => {
  const id = String(request.params.id);
  const db = readDb();
  const service = db.services.find((item) => item.id === id);
  db.services = db.services.filter((item) => item.id !== id);
  addActivity(db, request.admin, 'Suppression d un service', service?.title || id);
  writeDb(db);
  response.json({ ok: true });
});
