import catchAsyncError from '../Middleware/catchAsyncError';
import { AttendeeService } from '../Services/AttendeeService';
// import { sendAttendeeConfirmationEmail } from '../Utils/emailService';
import { errorHandler } from '../Utils/errorHandler';

// Register Attendee: create a new attendee record from form data
export const AttendeeRegistration = catchAsyncError(async (req, res, next) => {
    // Normalize body for multipart and JSON
    const body = req.body || {}

    const firstName = body.firstName
    const lastName = body.lastName
    const email = body.email
    const phoneNumber = body.phoneNumber
    const organization = body.organization
    const jobTitle = body.jobTitle
    const country = body.country
    const category = body.category || undefined
    const sectorInterest = body.sectorInterest || undefined
    const hasExistingCompanyRaw = body.hasExistingCompany
    const hasExistingCompany = typeof hasExistingCompanyRaw === 'boolean'
        ? hasExistingCompanyRaw
        : (typeof hasExistingCompanyRaw === 'string'
            ? ['true', 'yes', '1'].includes(hasExistingCompanyRaw.toLowerCase())
            : false)
    const companyName = body.companyName
    const companySector = body.companySector
    const attendanceRaw = body.attendance
    const attendance = ['day1', 'day2', 'both'].includes(attendanceRaw) ? attendanceRaw : undefined
    const needsVisaRaw = body.needsVisa
    const needsVisa = typeof needsVisaRaw === 'boolean'
        ? needsVisaRaw
        : (typeof needsVisaRaw === 'string'
            ? ['true', 'yes', '1'].includes(needsVisaRaw.toLowerCase())
            : false)
    const siteVisitRaw = body.siteVisit
    const siteVisit = typeof siteVisitRaw === 'boolean'
        ? siteVisitRaw
        : (typeof siteVisitRaw === 'string'
            ? ['true', 'yes', '1'].includes(siteVisitRaw.toLowerCase())
            : false)
    const specialRequirements = body.specialRequirements
    const communicationPreference = body.communicationPreference

    const existingAttendee = await AttendeeService.findByEmail(email);
    if (existingAttendee) {
        return next(new errorHandler('Attendee already registered with this email.', 400));
    }

    if (category && ['inv', 'loc'].includes(category) && !sectorInterest) {
        return next(new errorHandler('Sector interest is required for investors.', 400));
    }

    if (hasExistingCompany && !companyName) {
        return next(new errorHandler('Company name is required when you have an existing company.', 400));
    }

    if (!communicationPreference) {
        return next(new errorHandler('Communication preference is required.', 400));
    }

    const files = (req as any).files as Record<string, Express.Multer.File[]> | undefined
    const businessLicenseFile = files?.businessLicense?.[0]
    const passportCopyFile = files?.passportCopy?.[0]
    const businessLicenseUrl = businessLicenseFile ? `/uploads/attendees/${businessLicenseFile.filename}` : undefined
    const passportCopyUrl = passportCopyFile ? `/uploads/attendees/${passportCopyFile.filename}` : undefined

    if (needsVisa && !passportCopyUrl) {
        return next(new errorHandler('Passport copy is required when requesting visa assistance.', 400));
    }

    const processedData = {
        firstName,
        lastName,
        email,
        phoneNumber,
        organization,
        jobTitle,
        country,
        category,
        sectorInterest,
        hasExistingCompany,
        companyName,
        companySector,
        businessLicenseUrl,
        attendance,
        needsVisa,
        siteVisit,
        passportCopyUrl,
        specialRequirements,
        communicationPreference
    };

    const newAttendee = await AttendeeService.create(processedData);

    // // Send confirmation email
    // try {
    //     await sendAttendeeConfirmationEmail(newAttendee);
    //     console.log('Attendee confirmation email sent successfully to:', email);
    // } catch (emailError) {
    //     console.error('Failed to send confirmation email:', emailError);
    //     // Don't fail the registration if email fails
    // }

    res.status(200).json({
        message: 'Your attendee registration is successful. We have sent you a confirmation email.',
        attendee: newAttendee
    });
});
