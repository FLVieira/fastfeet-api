import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import sessionController from './app/controllers/SessionController';
import recipientController from './app/controllers/RecipientController';
import fileController from './app/controllers/FileController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

// Session routes
routes.post('/sessions', sessionController.store);

// Routes that require authentication -----
routes.use(authMiddleware);

// Recipients routes
routes.get('/recipients', authMiddleware, recipientController.index);
routes.post('/recipients', authMiddleware, recipientController.store);

// Files routes
routes.post('/files', upload.single('file'), fileController.store);

export default routes;
