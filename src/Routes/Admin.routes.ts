import { Router, type Router as ExpressRouter } from 'express';
import * as admin from '../Controller/AdminController';
import { requireAdmin } from '../Middleware/requireAdmin';

const router: ExpressRouter = Router();

// router.use(requireAdmin);

// Analytics routes
router.get('/analytics', admin.getAnalytics);
router.get('/counts', admin.getTotalCounts);

// User management routes
router.get('/attendees', admin.getAllAttendees);
router.get('/contacts', admin.getAllContacts);

export default router;
