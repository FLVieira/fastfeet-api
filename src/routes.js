import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import sessionController from './app/controllers/SessionController';
import recipientController from './app/controllers/RecipientController';
import deliverymanController from './app/controllers/DeliverymanController';
import orderController from './app/controllers/OrderController';
import fileController from './app/controllers/FileController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

// Session routes
routes.post('/sessions', sessionController.store);

// Routes that require authentication -----
routes.use(authMiddleware);

// Recipients routes
routes.get('/recipients', recipientController.index);
routes.get('/recipients/:id', recipientController.show);
routes.post('/recipients', recipientController.store);

// Deliverymen routes
routes.get('/deliverymen', deliverymanController.index);
routes.get('/deliverymen/:id', deliverymanController.show);
routes.post('/deliverymen', deliverymanController.store);
routes.put('/deliverymen/:id', deliverymanController.update);
routes.delete('/deliverymen/:id', deliverymanController.delete);

// Orders routes
routes.get('/orders', orderController.index);
routes.get('/orders/:id', orderController.show);
routes.post('/orders', orderController.store);
routes.put('/orders/:id', orderController.update);
routes.delete('/orders/:id', orderController.delete);

// Files routes
routes.post('/files', upload.single('file'), fileController.store);

export default routes;
