import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { readDb } from '../utils/storage';

export const activityRouter = Router();

activityRouter.get('/', requireAuth('activity'), (_request, response) => {
  response.json(readDb().activity);
});
