
import { Router, type Router as ExpressRouter } from 'express';
import multer from 'multer';
import * as register from '../Controller/AttendeeRegistration.controller';
import { AttendeeRegistrationValidator } from '../Validator/AttendeeRegistrationValidator';

const router: ExpressRouter = Router();

// Configure multer to store uploads under public/uploads/attendees
const upload = multer({ dest: 'public/uploads/attendees' });
// Get attendee details
router.get('/attendee-registration/:id', register.getAttendeeById);

// Update attendee
router.put('/attendee-registration/:id', register.updateAttendee);

// Delete attendee
router.delete('/attendee-registration/:id', register.deleteAttendee);

// Generate badge
router.get('/attendee-registration/:id/badge', register.generateBadge);

// Export attendee data
router.get('/attendee-registration/:id/export', register.exportAttendeeData);

// Send email to attendee
router.post('/attendee-registration/:id/send-email', register.sendEmailToAttendee);

router.post(
	'/attendee-registration',
	upload.fields([
		{ name: 'businessLicense', maxCount: 1 },
		{ name: 'passportCopy', maxCount: 1 }
	]),
	AttendeeRegistrationValidator,
	register.AttendeeRegistration
);

export default router;
