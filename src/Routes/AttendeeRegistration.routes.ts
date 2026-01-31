import { Router, type Router as ExpressRouter } from 'express';
import multer from 'multer';
import * as register from '../Controller/AttendeeRegistration.controller';
import { AttendeeRegistrationValidator } from '../Validator/AttendeeRegistrationValidator';

const router: ExpressRouter = Router();

// Configure multer to store uploads under public/uploads/attendees
const upload = multer({ dest: 'public/uploads/attendees' });

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
