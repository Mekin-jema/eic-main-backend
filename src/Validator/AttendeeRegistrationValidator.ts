import { body } from 'express-validator';

const DAY1_SESSION_IDS = [
    'day1-panel-1',
    'day1-breakout-1',
    'day1-breakout-2',
    'day1-breakout-3',
    'day1-matchmaking',
];

const DAY2_SESSION_IDS = [
    'day2-panel-2',
    'day2-breakout-4',
    'day2-breakout-5',
    'day2-breakout-6',
];

const parseSessionList = (value: unknown): string[] => {
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return [];
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
        } catch {
            // ignore JSON parse errors
        }
        return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
    }
    return [];
};

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
    body('day1Attendance').optional({ checkFalsy: true }).isIn(['full', 'partial', 'no']).withMessage('Invalid Day 1 attendance selection'),
    body('day2Attendance').optional({ checkFalsy: true }).isIn(['full', 'partial', 'no']).withMessage('Invalid Day 2 attendance selection'),
    body('day1Sessions').optional().custom((value) => {
        const list = parseSessionList(value);
        if (!list.length) return true;
        return list.every((item) => DAY1_SESSION_IDS.includes(item));
    }).withMessage('Invalid Day 1 session selection'),
    body('day2Sessions').optional().custom((value) => {
        const list = parseSessionList(value);
        if (!list.length) return true;
        return list.every((item) => DAY2_SESSION_IDS.includes(item));
    }).withMessage('Invalid Day 2 session selection'),
    body('needsVisa').notEmpty().withMessage('Visa preference is required').isIn(['true', 'false', '1', '0', 'yes', 'no']).withMessage('Invalid visa preference'),
    body('siteVisit').notEmpty().withMessage('Site visit preference is required').isIn(['true', 'false', '1', '0', 'yes', 'no']).withMessage('Invalid site visit preference'),
    body('specialRequirements').optional().isString().withMessage('Special requirements must be a string'),
    body('communicationPreference').notEmpty().withMessage('Communication preference is required').isIn(['email', 'phone', 'both']).withMessage('Invalid communication preference')
];
