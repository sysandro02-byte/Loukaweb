import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { addActivity } from '../utils/activity';
import { readDb, writeDb } from '../utils/storage';

export const messagesRouter = Router();

const publicMessageSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional().default(''),
  subject: z.string().min(2).max(160),
  message: z.string().min(10).max(5000)
});

messagesRouter.post('/public', (request, response) => {
  const result = publicMessageSchema.safeParse(request.body);
  if (!result.success) return response.status(400).json({ message: 'Message invalide.' });
  const db = readDb();
  const message = { id: randomUUID(), ...result.data, status: 'nouveau' as const, createdAt: new Date().toISOString() };
  db.messages.unshift(message);
  writeDb(db);
  response.status(201).json({ ok: true });
});

messagesRouter.get('/', requireAuth('messages'), (_request, response) => response.json(readDb().messages));

messagesRouter.patch('/:id/status', requireAuth('messages'), (request, response) => {
  const result = z.object({ status: z.enum(['nouveau', 'lu', 'traite']) }).safeParse(request.body);
  if (!result.success) return response.status(400).json({ message: 'Statut invalide.' });
  const db = readDb();
  const message = db.messages.find((item) => item.id === request.params.id);
  if (!message) return response.status(404).json({ message: 'Message introuvable.' });
  message.status = result.data.status;
  addActivity(db, request.admin, 'Modification statut message', message.email);
  writeDb(db);
  response.json(message);
});

messagesRouter.delete('/:id', requireAuth('messages'), (request, response) => {
  const id = String(request.params.id);
  const db = readDb();
  const message = db.messages.find((item) => item.id === id);
  db.messages = db.messages.filter((item) => item.id !== id);
  addActivity(db, request.admin, 'Suppression d un message', message?.email || id);
  writeDb(db);
  response.json({ ok: true });
});
