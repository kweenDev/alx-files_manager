// routes/index.js
/**
 * API routes.
 * Author: Refiloe Radebe
 * Date: 2025-01-24
 */

import { Router } from 'express';
import AppController from '../controllers/AppController';

const router = Router();

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

export default router;
