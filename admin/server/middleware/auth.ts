import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { AdminRole } from '../types';
import { readDb } from '../utils/storage';

const permissions: Record<AdminRole, string[]> = {
  super_admin: ['stats', 'pages', 'services', 'messages', 'media', 'admins', 'activity', 'heaven'],
  editor: ['stats', 'pages', 'services', 'media', 'heaven'],
  moderator: ['stats', 'messages', 'activity'],
  readonly: ['stats', 'activity']
};

export function requireAuth(permission?: string) {
  return (request: Request, response: Response, next: NextFunction) => {
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) return response.status(401).json({ message: 'Authentification requise.' });

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'change-this-secret') as { sub: string };
      const db = readDb();
      const admin = db.admins.find((item) => item.id === payload.sub && item.active);

      if (!admin) return response.status(401).json({ message: 'Session invalide.' });
      if (permission && !permissions[admin.role].includes(permission)) {
        return response.status(403).json({ message: 'Permission insuffisante.' });
      }

      request.admin = admin;
      next();
    } catch {
      return response.status(401).json({ message: 'Session expiree.' });
    }
  };
}
