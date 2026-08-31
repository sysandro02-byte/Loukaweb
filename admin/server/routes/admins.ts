import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { addActivity } from '../utils/activity';
import { publicAdmin, readDb, writeDb } from '../utils/storage';

export const adminsRouter = Router();

const adminSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(10),
  role: z.enum(['super_admin', 'editor', 'moderator', 'readonly'])
});

adminsRouter.get('/', requireAuth('admins'), (_request, response) => {
  response.json(readDb().admins.map(publicAdmin));
});

adminsRouter.post('/', requireAuth('admins'), async (request, response) => {
  const result = adminSchema.safeParse(request.body);
  if (!result.success) return response.status(400).json({ message: 'Administrateur invalide.' });
  const db = readDb();
  if (db.admins.some((admin) => admin.email === result.data.email.toLowerCase())) {
    return response.status(409).json({ message: 'Cet email existe deja.' });
  }
  const admin = {
    id: randomUUID(),
    name: result.data.name,
    email: result.data.email.toLowerCase(),
    passwordHash: await bcrypt.hash(result.data.password, 12),
    role: result.data.role,
    active: true,
    createdAt: new Date().toISOString()
  };
  db.admins.push(admin);
  addActivity(db, request.admin, 'Ajout d un administrateur', admin.email);
  writeDb(db);
  response.status(201).json(publicAdmin(admin));
});

adminsRouter.delete('/:id', requireAuth('admins'), (request, response) => {
  const id = String(request.params.id);
  if (request.admin?.id === id) return response.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte.' });
  const db = readDb();
  const admin = db.admins.find((item) => item.id === id);
  db.admins = db.admins.filter((item) => item.id !== id);
  addActivity(db, request.admin, 'Suppression d un administrateur', admin?.email || id);
  writeDb(db);
  response.json({ ok: true });
});
