import { Router } from 'express';
import AppController from '../controllers/AppController';

const router = Router();

// Route for checking Redis and DB status
router.get('/status', AppController.getStatus);

// Route for getting the number of users and files
router.get('/stats', AppController.getStats);

export default router;
