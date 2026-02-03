import { body } from 'express-validator';

export const AttendeeRegistrationValidator = [
    body('firstName').notEmpty().withMessage('First name is required').isLength({ min: 2 }).withMessage('First Name must be at least 2 characters long'),
    body('lastName').notEmpty().withMessage('Last name is required').isLength({ min: 2 }).withMessage('Last Name must be at least 2 characters long'),
    body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email address'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required'),
    body('organization').notEmpty().withMessage('Organization is required'),
    body('jobTitle').notEmpty().withMessage('Job title is required'),
    body('country').notEmpty().withMessage('Country is required'),
    body('category').optional().isString().withMessage('Invalid category'),
    body('otherCategory').optional().isString().withMessage('Other category must be a string'),
    body('sectorInterest').optional().isString().withMessage('Sector interest must be a string'),
    body('hasExistingCompany').optional().isIn(['true', 'false', '1', '0', 'yes', 'no']).withMessage('Invalid value for existing company'),
    body('companyName').optional().isString().withMessage('Company name must be a string'),
    body('companySector').optional().isString().withMessage('Company sector must be a string'),
    body('attendance').optional({ checkFalsy: true }).isIn(['day1', 'day2', 'both']).withMessage('Invalid attendance selection'),
    body('needsVisa').notEmpty().withMessage('Visa preference is required').isIn(['true', 'false', '1', '0', 'yes', 'no']).withMessage('Invalid visa preference'),
    body('siteVisit').notEmpty().withMessage('Site visit preference is required').isIn(['true', 'false', '1', '0', 'yes', 'no']).withMessage('Invalid site visit preference'),
    body('specialRequirements').optional().isString().withMessage('Special requirements must be a string'),
    body('communicationPreference').notEmpty().withMessage('Communication preference is required').isIn(['email', 'phone', 'both']).withMessage('Invalid communication preference')
];
