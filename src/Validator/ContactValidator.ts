import { body } from 'express-validator';

export const ContactValidator = [
    body('name').notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
    body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email address'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required'),
    body('jobTitle').notEmpty().withMessage('Job title is required'),
    body('companyName').notEmpty().withMessage('Company name is required'),
    body('country').notEmpty().withMessage('Country is required'),
    body('message').notEmpty().withMessage('Message is required').isLength({ min: 10 }).withMessage('Message must be at least 10 characters long')
];
