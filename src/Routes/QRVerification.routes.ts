import { Router, type Router as ExpressRouter } from 'express';
import * as qrController from '../Controller/QRVerification.controller';

const router: ExpressRouter = Router();

// QR verification for attendees
router.post('/verify', qrController.verifyUserQR);

// Get attendee details by ID
router.get('/user/:id', qrController.getUserById);

export default router;
