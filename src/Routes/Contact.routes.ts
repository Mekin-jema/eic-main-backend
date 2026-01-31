import { Router, type Router as ExpressRouter } from 'express';
import * as contact from '../Controller/Contact.controller';
import { ContactValidator } from '../Validator/ContactValidator';

const router: ExpressRouter = Router();

router.post('/contact-form', ContactValidator, contact.ContactForm);

export default router;
