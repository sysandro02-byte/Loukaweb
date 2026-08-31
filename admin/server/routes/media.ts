import { existsSync, unlinkSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { dirname, extname, join } from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth';
import { addActivity } from '../utils/activity';
import { readDb, writeDb } from '../utils/storage';

const uploadDir = process.env.DATA_FILE
  ? join(dirname(process.env.DATA_FILE), 'uploads')
  : process.env.VERCEL ? join('/tmp', 'loukatech-uploads') : join(process.cwd(), 'server', 'uploads');
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_request, file, callback) => callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'].includes(file.mimetype)) {
      callback(new Error('Format image non autorise.'));
      return;
    }
    callback(null, true);
  }
});

export const mediaRouter = Router();

mediaRouter.get('/', requireAuth('media'), (_request, response) => response.json(readDb().media));

mediaRouter.post('/', requireAuth('media'), upload.single('image'), (request, response) => {
  if (!request.file) return response.status(400).json({ message: 'Image requise.' });
  const db = readDb();
  const item = {
    id: randomUUID(),
    filename: request.file.filename,
    originalName: request.file.originalname,
    url: `/uploads/${request.file.filename}`,
    mimeType: request.file.mimetype,
    size: request.file.size,
    linkedTo: String(request.body.linkedTo || ''),
    createdAt: new Date().toISOString()
  };
  db.media.unshift(item);
  addActivity(db, request.admin, 'Modification d une image', item.originalName);
  writeDb(db);
  response.status(201).json(item);
});

mediaRouter.delete('/:id', requireAuth('media'), (request, response) => {
  const id = String(request.params.id);
  const db = readDb();
  const item = db.media.find((media) => media.id === id);
  if (item) {
    const filePath = join(uploadDir, item.filename);
    if (existsSync(filePath)) unlinkSync(filePath);
  }
  db.media = db.media.filter((media) => media.id !== id);
  addActivity(db, request.admin, 'Suppression d une image', item?.originalName || id);
  writeDb(db);
  response.json({ ok: true });
});
