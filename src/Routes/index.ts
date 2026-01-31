import { Router, type Router as ExpressRouter } from 'express';
import globalErrorHandler from '../Middleware/globalErrorHandler';
import attendeeRegistrationRoutes from './AttendeeRegistration.routes';
import adminRoutes from './Admin.routes';
import attendanceRoutes from './Attendance.routes';
import communicationsRoutes from './Communications.routes';
import authRoutes from './Auth.routes';

const router: ExpressRouter = Router();
// Mount sub-routers
router.use('/attendee', attendeeRegistrationRoutes);
router.use('/admin', adminRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/admin/communications', communicationsRoutes);
router.use('/auth', authRoutes);
router.use(globalErrorHandler);

export default router;
