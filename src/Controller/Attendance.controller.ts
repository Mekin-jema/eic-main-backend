import catchAsyncError from '../Middleware/catchAsyncError';
import { AttendeeService } from '../Services/AttendeeService';
import { errorHandler } from '../Utils/errorHandler';

// Check-in: mark a user as checked in by type/id
export const checkInUser = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;

    if (!idStr) {
        return next(new errorHandler('User ID is required', 400));
    }

    try {
        const user = await AttendeeService.findById(idStr);

        if (!user) {
            return next(new errorHandler('Attendee not found', 404));
        }

        if (user.isCheckedIn) {
            return next(new errorHandler('Attendee is already checked in', 400));
        }

        const now = new Date();
        const updatedUser = await AttendeeService.update(idStr, {
            isCheckedIn: true,
            checkInTime: now,
            lastScannedAt: now
        });

        if (!updatedUser) {
            return next(new errorHandler('Failed to update attendee', 500));
        }

        res.status(200).json({
            success: true,
            message: 'Attendee checked in successfully',
            userType: 'ATT',
            userTypeLabel: 'Attendee',
            attendanceStatus: {
                isCheckedIn: updatedUser.isCheckedIn,
                checkInTime: updatedUser.checkInTime,
                checkOutTime: updatedUser.checkOutTime,
                lastScannedAt: updatedUser.lastScannedAt,
                scanCount: updatedUser.scanCount
            },
            user: {
                id: updatedUser.id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email
            }
        });
    } catch (error) {
        return next(new errorHandler('Failed to check in user', 500));
    }
});

// Check-out: mark a user as checked out by type/id
export const checkOutUser = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;

    if (!idStr) {
        return next(new errorHandler('User ID is required', 400));
    }

    try {
        const user = await AttendeeService.findById(idStr);

        if (!user) {
            return next(new errorHandler('Attendee not found', 404));
        }

        if (!user.isCheckedIn) {
            return next(new errorHandler('Attendee is not checked in', 400));
        }

        const now = new Date();
        const updatedUser = await AttendeeService.update(idStr, {
            isCheckedIn: false,
            checkOutTime: now,
            lastScannedAt: now
        });

        if (!updatedUser) {
            return next(new errorHandler('Failed to update attendee', 500));
        }

        res.status(200).json({
            success: true,
            message: 'Attendee checked out successfully',
            userType: 'ATT',
            userTypeLabel: 'Attendee',
            attendanceStatus: {
                isCheckedIn: updatedUser.isCheckedIn,
                checkInTime: updatedUser.checkInTime,
                checkOutTime: updatedUser.checkOutTime,
                lastScannedAt: updatedUser.lastScannedAt,
                scanCount: updatedUser.scanCount
            },
            user: {
                id: updatedUser.id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email
            }
        });
    } catch (error) {
        return next(new errorHandler('Failed to check out user', 500));
    }
});

// Status: return check-in/out status for a specific user
export const getAttendanceStatus = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;

    if (!idStr) {
        return next(new errorHandler('User ID is required', 400));
    }

    try {
        const user = await AttendeeService.findById(idStr);

        if (!user) {
            return next(new errorHandler('Attendee not found', 404));
        }

        res.status(200).json({
            success: true,
            userType: 'ATT',
            userTypeLabel: 'Attendee',
            attendanceStatus: {
                isCheckedIn: user.isCheckedIn || false,
                checkInTime: user.checkInTime,
                checkOutTime: user.checkOutTime,
                lastScannedAt: user.lastScannedAt,
                scanCount: user.scanCount || 0
            },
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });
    } catch (error) {
        return next(new errorHandler('Failed to get attendance status', 500));
    }
});

// Summary: compute attendance stats and recent activity
export const getAttendanceSummary = catchAsyncError(async (req, res, next) => {
    try {
        const attendees = await AttendeeService.findAll();

        const totalUsers = attendees.length;
        const checkedInUsers = attendees.filter((user) => user.isCheckedIn).length;

        const attendanceRate = totalUsers > 0 ? (checkedInUsers / totalUsers) * 100 : 0;

        // Get recent check-ins (last 24 hours)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const recentCheckIns = attendees.filter((user) => user.checkInTime && user.checkInTime > yesterday);

        res.status(200).json({
            success: true,
            summary: {
                totalUsers,
                checkedInUsers,
                attendanceRate: Math.round(attendanceRate * 100) / 100,
                recentCheckIns: recentCheckIns.length,
                breakdown: {
                    attendees: {
                        total: attendees.length,
                        checkedIn: attendees.filter((user) => user.isCheckedIn).length
                    }
                }
            }
        });
    } catch (error) {
        return next(new errorHandler('Failed to get attendance summary', 500));
    }
});
