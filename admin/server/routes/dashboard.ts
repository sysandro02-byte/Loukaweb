import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { readDb } from '../utils/storage';

export const dashboardRouter = Router();

function countBy<T>(items: T[], getKey: (item: T) => string) {
  const map = new Map<string, number>();
  items.forEach((item) => map.set(getKey(item) || 'Inconnu', (map.get(getKey(item) || 'Inconnu') || 0) + 1));
  return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
}

dashboardRouter.get('/', requireAuth('stats'), (_request, response) => {
  const db = readDb();
  const today = new Date().toISOString().slice(0, 10);
  const timeline = Array.from({ length: 14 }, (_, index) => {
    const day = new Date(Date.now() - (13 - index) * 86400000).toISOString().slice(5, 10);
    return {
      day,
      visiteurs: db.visits.filter((visit) => visit.createdAt.slice(5, 10) === day).length,
      messages: db.messages.filter((message) => message.createdAt.slice(5, 10) === day).length
    };
  });

  response.json({
    totalVisitors: db.visits.length,
    todayVisitors: db.visits.filter((visit) => visit.createdAt.startsWith(today)).length,
    totalMessages: db.messages.length,
    topPages: countBy(db.visits, (visit) => visit.page),
    countries: countBy(db.visits, (visit) => visit.country),
    devices: countBy(db.visits, (visit) => visit.device),
    browsers: countBy(db.visits, (visit) => visit.browser),
    timeline,
    latestLogins: db.activity.filter((item) => item.action === 'Connexion admin').slice(0, 8)
  });
});
