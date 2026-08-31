import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { adminsRouter } from './routes/admins';
import { activityRouter } from './routes/activity';
import { authRouter } from './routes/auth';
import { dashboardRouter } from './routes/dashboard';
import { adminHeavenRouter, heavenRouter } from './routes/heaven';
import { aiControlRouter } from './routes/ai-control';
import { mediaRouter } from './routes/media';
import { messagesRouter } from './routes/messages';
import { pagesRouter } from './routes/pages';
import { servicesRouter } from './routes/services';
import { visitorsRouter } from './routes/visitors';
import { readDb } from './utils/storage';

export function createApp() {
  const app = express();
  const uploadDir = process.env.DATA_FILE
    ? join(dirname(process.env.DATA_FILE), 'uploads')
    : process.env.VERCEL ? join('/tmp', 'loukatech-uploads') : join(process.cwd(), 'server', 'uploads');

  if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
  readDb();
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.ADMIN_ORIGIN || '')
    .split(',').map((origin) => origin.trim()).filter(Boolean);


  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true }));
  app.use(express.json({ limit: '1mb' }));
  app.use('/uploads', express.static(uploadDir));

  app.get('/api/health', (_request, response) => response.json({ ok: true }));
  app.use('/api/auth', authRouter);
  app.use('/api/heaven', heavenRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/pages', pagesRouter);
  app.use('/api/services', servicesRouter);
  app.use('/api/messages', messagesRouter);
  app.use('/api/visitors', visitorsRouter);
  app.use('/api/media', mediaRouter);
  app.use('/api/admins', adminsRouter);
  app.use('/api/activity', activityRouter);
  app.use('/api/admin/heaven', adminHeavenRouter);
  app.use('/api/admin/ai-control', aiControlRouter);

  return app;
}
