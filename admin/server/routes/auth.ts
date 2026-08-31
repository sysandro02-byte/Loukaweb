import bcrypt from 'bcryptjs';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { addActivity } from '../utils/activity';
import { publicAdmin, readDb, writeDb } from '../utils/storage';

export const authRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de tentatives. Reessayez dans quelques minutes.' }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

authRouter.post('/login', loginLimiter, async (request, response) => {
  const result = loginSchema.safeParse(request.body);
  if (!result.success) return response.status(400).json({ message: 'Identifiants invalides.' });

  const db = readDb();
  const admin = db.admins.find((item) => item.email === result.data.email.toLowerCase() && item.active);
  if (!admin || !(await bcrypt.compare(result.data.password, admin.passwordHash))) {
    return response.status(401).json({ message: 'Email ou mot de passe incorrect.' });
  }

  admin.lastLoginAt = new Date().toISOString();
  addActivity(db, admin, 'Connexion admin', 'auth');
  writeDb(db);

  const token = jwt.sign({ sub: admin.id, role: admin.role }, process.env.JWT_SECRET || 'change-this-secret', { expiresIn: '8h' });
  response.json({ token, user: publicAdmin(admin) });
});

authRouter.get('/me', requireAuth(), (request, response) => {
  response.json({ user: publicAdmin(request.admin!) });
});
