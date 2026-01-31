import { Router, type Router as ExpressRouter } from 'express';
import * as paymentController from '../Controller/Payment.controller';

const router: ExpressRouter = Router();

router.post('/payment', paymentController.webhook);

export default router;
