import catchAsyncError from '../Middleware/catchAsyncError';
import { AdminService } from '../Services/AdminService';
import { errorHandler } from '../Utils/errorHandler';

// Analytics: fetch overall activity metrics and counts
export const getAnalytics = catchAsyncError(async (req, res, next) => {
    try {
        const analytics = await AdminService.getAnalyticsSummary();

        res.status(200).json({
            success: true,
            data: analytics
        });
    } catch (error) {
        return next(new errorHandler('Failed to fetch analytics', 500));
    }
});

// Attendees: list all attendee registrations
export const getAllAttendees = catchAsyncError(async (req, res, next) => {
    try {
        const attendees = await AdminService.getAllAttendees();

        res.status(200).json({
            success: true,
            data: attendees
        });
    } catch (error) {
        return next(new errorHandler('Failed to fetch attendees', 500));
    }
});

// Contacts: list all contact form entries
export const getAllContacts = catchAsyncError(async (req, res, next) => {
    try {
        const contacts = await AdminService.getAllContacts();

        res.status(200).json({
            success: true,
            data: contacts
        });
    } catch (error) {
        return next(new errorHandler('Failed to fetch contacts', 500));
    }
});

// Totals: fetch aggregate counts across entities
export const getTotalCounts = catchAsyncError(async (req, res, next) => {
    try {
        const counts = await AdminService.getTotalCounts();

        res.status(200).json({
            success: true,
            data: counts
        });
    } catch (error) {
        return next(new errorHandler('Failed to fetch total counts', 500));
    }
});
