import { Router } from 'express';

import sessionController from './app/controllers/SessionController';
import recipientController from './app/controllers/RecipientController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

// Session routes
routes.post('/sessions', sessionController.store);

// Routes that require authentication -----
routes.use(authMiddleware);

// Recipients routes
routes.get('/recipients', authMiddleware, recipientController.index);
routes.post('/recipients', authMiddleware, recipientController.store);


export default routes;
