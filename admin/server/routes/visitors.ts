import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { UAParser } from 'ua-parser-js';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { readDb, writeDb } from '../utils/storage';

export const visitorsRouter = Router();

const trackingSchema = z.object({
  page: z.string().max(300),
  referrer: z.string().max(500).optional().default(''),
  country: z.string().max(80).optional().default('Inconnu'),
  city: z.string().max(80).optional().default('')
});

visitorsRouter.post('/track', (request, response) => {
  const result = trackingSchema.safeParse(request.body);
  if (!result.success) return response.status(400).json({ message: 'Tracking invalide.' });
  const parser = new UAParser(request.headers['user-agent']);
  const db = readDb();
  const ip = String(request.headers['x-forwarded-for'] || request.socket.remoteAddress || '').split(',')[0];

  db.visits.unshift({
    id: randomUUID(),
    ip,
    country: result.data.country,
    city: result.data.city,
    page: result.data.page,
    referrer: result.data.referrer,
    browser: parser.getBrowser().name || 'Inconnu',
    os: parser.getOS().name || 'Inconnu',
    device: parser.getDevice().type || 'Desktop',
    createdAt: new Date().toISOString()
  });
  db.visits = db.visits.slice(0, 10000);
  writeDb(db);
  response.status(201).json({ ok: true });
});

visitorsRouter.get('/', requireAuth('stats'), (_request, response) => response.json(readDb().visits));
