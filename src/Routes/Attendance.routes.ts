// import express from 'express';
import { Router, type Router as ExpressRouter } from 'express';

import { checkInUser, checkOutUser, getAttendanceStatus, getAttendanceSummary } from '../Controller/Attendance.controller';
import { requireAdmin } from '../Middleware/requireAdmin';

const router:ExpressRouter  = Router();

// Manual check-in
router.post('/checkin/:id', checkInUser);

// Manual check-out
router.post('/checkout/:id', checkOutUser);

// Get attendance status
router.get('/status/:id', getAttendanceStatus);

// Get attendance summary for admin
router.get('/summary', requireAdmin, getAttendanceSummary);

export default router;

