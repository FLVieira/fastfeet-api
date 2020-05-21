import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import sessionController from './app/controllers/SessionController';
import recipientController from './app/controllers/RecipientController';
import deliverymanController from './app/controllers/DeliverymanController';
import deliverymanPackagesController from './app/controllers/DeliverymanPackagesController';
import orderController from './app/controllers/OrderController';
import deliveryProblemController from './app/controllers/DeliveryProblemController';
import fileController from './app/controllers/FileController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

// Session routes
routes.post('/sessions', sessionController.store);

// Deliveryman funcionalities routes
routes.get('/deliveryman/:id/deliveries', deliverymanPackagesController.index);
routes.put(
  '/deliveryman/:id/deliveries/:orderId',
  upload.single('file'),
  deliverymanPackagesController.update
);
routes.post(
  '/deliveryman/:id/problems/:orderId',
  deliveryProblemController.store
);

// Files routes
routes.post('/files', upload.single('file'), fileController.store);

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

// Delivery problems routes
routes.get('/delivery/:id/problems', deliveryProblemController.index);
routes.delete('/problem/:id/cancel-delivery', deliveryProblemController.delete);

export default routes;
