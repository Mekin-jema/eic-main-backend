import catchAsyncError from '../Middleware/catchAsyncError';
import { AttendeeService } from '../Services/AttendeeService';
import { errorHandler } from '../Utils/errorHandler';

const userTypeLabel = 'Attendee';

// Parse QR code data
const parseQRCode = (qrData: string) => {
    const parts = qrData.split(':');

    // Check format: GREEN_ENERGY_EVENT:USER_TYPE:USER_ID
    if (parts.length !== 3 || parts[0] !== 'GREEN_ENERGY_EVENT') {
        throw new Error('Invalid QR code format');
    }

    const userType = parts[1];
    const userId = parts[2];

    // Validate user type
    if (userType !== 'ATT') {
        throw new Error('Invalid user type in QR code');
    }

    return { userType, userId };
};

// Format user data based on type
const formatUserData = (user: any) => {
    const baseData = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        registrationDate: user.createdAt
    };
    return {
        ...baseData,
        organization: user.organization,
        occupation: user.occupation,
        age: user.age,
        country: user.country,
        registrationType: user.registrationType,
        groupSize: user.groupSize,
        interests: user.interests
    };
};

// Verify QR: parse QR, find user, auto check-in/update scan info
export const verifyUserQR = catchAsyncError(async (req, res, next) => {
    const { qrData } = req.body;

    if (!qrData) {
        return next(new errorHandler('QR code data is required', 400));
    }

    try {
        // Parse QR code
        const { userId } = parseQRCode(qrData);

        // Find user in database
        const user = await AttendeeService.findById(userId);

        if (!user) {
            return next(new errorHandler('Attendee not found', 404));
        }

        // Auto check-in logic
        const now = new Date();
        let message = '';
        let updatedUser;

        const currentScanCount = Number((user as any).scanCount || 0);
        if (!user.isCheckedIn) {
            // Auto check-in user
            updatedUser = await AttendeeService.update(userId, {
                isCheckedIn: true,
                checkInTime: now,
                lastScannedAt: now,
                scanCount: currentScanCount + 1
            });
            message = 'User checked in successfully';
        } else {
            // Already checked in - just update scan info
            updatedUser = await AttendeeService.update(userId, {
                lastScannedAt: now,
                scanCount: currentScanCount + 1
            });
            message = 'User already checked in';
        }

        if (!updatedUser) {
            return next(new errorHandler('Failed to update attendee', 500));
        }

        // Format attendance status
        const attendanceStatus = {
            isCheckedIn: updatedUser.isCheckedIn,
            checkInTime: updatedUser.checkInTime,
            checkOutTime: updatedUser.checkOutTime,
            lastScannedAt: updatedUser.lastScannedAt,
            scanCount: updatedUser.scanCount
        };

        // Format response data
        const userData = formatUserData(updatedUser);

        res.status(200).json({
            success: true,
            message: message,
            userType: 'ATT',
            userTypeLabel: userTypeLabel,
            attendanceStatus: attendanceStatus,
            user: userData
        });
    } catch (error) {
        if (error instanceof Error) {
            return next(new errorHandler(error.message, 400));
        }
        return next(new errorHandler('Invalid QR code', 400));
    }
});

// Get User: fetch user details by ID and type
export const getUserById = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;

    try {
        const user = await AttendeeService.findById(idStr);

        if (!user) {
            return next(new errorHandler('Attendee not found', 404));
        }

        const userData = formatUserData(user);

        res.status(200).json({
            success: true,
            userType: 'ATT',
            userTypeLabel: userTypeLabel,
            user: userData
        });
    } catch (error) {
        return next(new errorHandler('Invalid user ID', 400));
    }
});
