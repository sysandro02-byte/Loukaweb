import { randomUUID } from 'node:crypto';
import type { AdminUser, Database } from '../types';

export function addActivity(db: Database, admin: AdminUser | undefined, action: string, target: string) {
  db.activity.unshift({
    id: randomUUID(),
    action,
    userId: admin?.id || 'system',
    userEmail: admin?.email || 'system',
    target,
    createdAt: new Date().toISOString()
  });
  db.activity = db.activity.slice(0, 500);
}
