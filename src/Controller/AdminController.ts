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

// Update exhibitor status
// export const updateExhibitorStatus = catchAsyncError(async (req, res, next) => {
//     const { id } = req.params;
//     const statusRaw = (req.body as any)?.status as string | string[] | undefined;
//     const status = Array.isArray(statusRaw) ? statusRaw[0] : statusRaw;

//     if (!id || !status) {
//         return next(new errorHandler('Exhibitor ID and status are required', 400));
//     }

//     if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
//         return next(new errorHandler('Invalid status. Must be PENDING, APPROVED, or REJECTED', 400));
//     }

//     try {
//         const updatedExhibitor = await AdminService.updateExhibitorStatus(id, status);

//         // Send approval email if status is APPROVED
//         if (status === 'APPROVED') {
//             try {
//                 await sendExhibitorConfirmationEmail(updatedExhibitor);
//                 console.log('Exhibitor approval email sent successfully to:', updatedExhibitor.email);
//             } catch (emailError) {
//                 console.error('Failed to send approval email:', emailError);
//                 // Don't fail the status update if email fails
//             }
//         }

//         res.status(200).json({
//             success: true,
//             message: `Exhibitor status updated to ${status}`,
//             data: updatedExhibitor
//         });
//     } catch (error) {
//         return next(new errorHandler('Failed to update exhibitor status', 500));
//     }
// });

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
