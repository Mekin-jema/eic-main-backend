// Get attendee details by ID
import catchAsyncError from '../Middleware/catchAsyncError';
import { AttendeeService } from '../Services/AttendeeService';
// import { sendAttendeeConfirmationEmail } from '../Utils/emailService';
import { errorHandler } from '../Utils/errorHandler';
import { generateAttendeeBadge } from '../Utils/badgeGenerator';
import { createTransporter } from '../Utils/emailService';
export const getAttendeeById = catchAsyncError(async (req, res, next) => {
    let { id } = req.params;
    if (Array.isArray(id)) id = id[0];
    const attendee = await AttendeeService.findById(id);
    if (!attendee) {
        return next(new errorHandler('Attendee not found', 404));
    }
    res.status(200).json({ attendee });
});

// Update attendee by ID
export const updateAttendee = catchAsyncError(async (req, res, next) => {
    let { id } = req.params;
    if (Array.isArray(id)) id = id[0];
    const updated = await AttendeeService.update(id, req.body);
    if (!updated) {
        return next(new errorHandler('Attendee not found', 404));
    }
    res.status(200).json({ attendee: updated });
});

// Delete attendee by ID
export const deleteAttendee = catchAsyncError(async (req, res, next) => {
    let { id } = req.params;
    if (Array.isArray(id)) id = id[0];
    const deleted = await AttendeeService.delete(id);
    if (!deleted) {
        return next(new errorHandler('Attendee not found', 404));
    }
    res.status(200).json({ message: 'Attendee deleted successfully' });
});

// Generate badge (stub)
export const generateBadge = catchAsyncError(async (req, res, next) => {
    let { id } = req.params;
    if (Array.isArray(id)) id = id[0];
    console.log('[generateBadge] start', { id });
    const attendee = await AttendeeService.findById(id);
    if (!attendee) {
        console.warn('[generateBadge] attendee not found', { id });
        return next(new errorHandler('Attendee not found', 404));
    }

    const pdfBuffer = await generateAttendeeBadge(attendee);
    console.log('[generateBadge] badge generated', { id, size: pdfBuffer.length });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="attendee-badge-${id}.pdf"`);
    res.status(200).send(pdfBuffer);
});

// Export attendee data (stub)
export const exportAttendeeData = catchAsyncError(async (req, res, next) => {
    let { id } = req.params;
    if (Array.isArray(id)) id = id[0];
    console.log('[exportAttendeeData] start', { id });
    const attendee = await AttendeeService.findById(id);
    if (!attendee) {
        console.warn('[exportAttendeeData] attendee not found', { id });
        return next(new errorHandler('Attendee not found', 404));
    }

    const exportData = {
        attendee,
        exportedAt: new Date().toISOString(),
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="attendee-${id}.json"`);
    console.log('[exportAttendeeData] export ready', { id });
    res.status(200).send(JSON.stringify(exportData, null, 2));
});

// Send email to attendee (stub)
export const sendEmailToAttendee = catchAsyncError(async (req, res, next) => {
    let { id } = req.params;
    if (Array.isArray(id)) id = id[0];
    const { subject, body, includeBadge } = req.body as { subject?: string; body?: string; includeBadge?: boolean };
    console.log('[sendEmailToAttendee] start', { id, includeBadge, subject: subject ? '[provided]' : '[missing]' });
    if (!subject || !body) {
        console.warn('[sendEmailToAttendee] missing subject/body', { id });
        return next(new errorHandler('Subject and body are required', 400));
    }

    const attendee = await AttendeeService.findById(id);
    if (!attendee) {
        console.warn('[sendEmailToAttendee] attendee not found', { id });
        return next(new errorHandler('Attendee not found', 404));
    }

    const transporter = createTransporter();
    const attachments = [] as Array<{ filename: string; content: Buffer; contentType: string }>;

    if (includeBadge) {
        const pdfBuffer = await generateAttendeeBadge(attendee);
        attachments.push({
            filename: `attendee-badge-${id}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
        });
        console.log('[sendEmailToAttendee] badge attached', { id, size: pdfBuffer.length });
    }

    const textBody = String(body).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const info = await transporter.sendMail({
        from: 'noreply@powerethio.com',
        to: String(attendee.email),
        subject,
        html: body,
        text: textBody || undefined,
        attachments,
    });

    console.log('[sendEmailToAttendee] email sent', { id, to: attendee.email, messageId: (info as any)?.messageId });
    res.status(200).json({ message: 'Email sent successfully' });
});


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
