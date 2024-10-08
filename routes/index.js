// routes/index.js

import { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import FilesController from '../controllers/FilesController';
import AuthController from '../controllers/AuthController';

const router = Router();

router.post('/users', UsersController.postNew);
router.post('/files', FilesController.postUpload);

router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UsersController.getMe);
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

export default router;
