// Get attendee details by ID
import catchAsyncError from '../Middleware/catchAsyncError';
import { AttendeeService } from '../Services/AttendeeService';
// import { sendAttendeeConfirmationEmail } from '../Utils/emailService';
import { errorHandler } from '../Utils/errorHandler';
import { generateAttendeeBadge } from '../Utils/badgeGenerator';
import { createTransporter } from '../Utils/emailService';

const normalizeCategory = (value: unknown): string | undefined => {
    if (value === undefined || value === null) return undefined;
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    const directMap: Record<string, string> = {
        Investor: 'inv',
        'International Investor': 'inv',
        'Domestic Investor': 'loc',
        'Local Investor': 'loc',
        'Government Official': 'gov',
        'Diplomat / Development Partner': 'dip',
        Media: 'med',
        'Academia/Research Institution': 'aca',
        'Academia / Research Institution': 'aca',
        'Business Consultant': 'con',
        Other: 'oth',
    };

    if (directMap[trimmed]) return directMap[trimmed];

    const normalized = trimmed.toLowerCase();
    const lowerMap: Record<string, string> = {
        investor: 'inv',
        'international investor': 'inv',
        'domestic investor': 'loc',
        'local investor': 'loc',
        'government official': 'gov',
        'diplomat / development partner': 'dip',
        'diplomat/development partner': 'dip',
        media: 'med',
        'academia/research institution': 'aca',
        'academia / research institution': 'aca',
        'business consultant': 'con',
        other: 'oth',
    };

    return lowerMap[normalized] ?? trimmed;
};

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

const sanitizeSessions = (list: string[], allowed: string[]) => list.filter((item) => allowed.includes(item));
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
    const payload = { ...req.body };
    if ('category' in payload) {
        payload.category = normalizeCategory(payload.category);
    }
    const updated = await AttendeeService.update(id, payload);
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
    const category = normalizeCategory(body.category)
    const otherCategory = body.otherCategory || undefined
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
    const day1AttendanceRaw = body.day1Attendance
    const day2AttendanceRaw = body.day2Attendance
    const day1Attendance = ['full', 'partial', 'no'].includes(day1AttendanceRaw) ? day1AttendanceRaw : undefined
    const day2Attendance = ['full', 'partial', 'no'].includes(day2AttendanceRaw) ? day2AttendanceRaw : undefined
    const day1Sessions = sanitizeSessions(parseSessionList(body.day1Sessions), DAY1_SESSION_IDS)
    const day2Sessions = sanitizeSessions(parseSessionList(body.day2Sessions), DAY2_SESSION_IDS)
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

    if (typeof category === 'string' && ['inv', 'loc'].includes(category) && !sectorInterest) {
        return next(new errorHandler('Sector interest is required for investors.', 400));
    }

    if (category === 'oth' && !otherCategory) {
        return next(new errorHandler('Please specify your category.', 400));
    }

    if (hasExistingCompany && !companyName) {
        return next(new errorHandler('Company name is required when you have an existing company.', 400));
    }

    if (!communicationPreference) {
        return next(new errorHandler('Communication preference is required.', 400));
    }

    if (day1Attendance === 'partial' && day1Sessions.length === 0) {
        return next(new errorHandler('Please select at least one Day 1 session.', 400));
    }

    if (day2Attendance === 'partial' && day2Sessions.length === 0) {
        return next(new errorHandler('Please select at least one Day 2 session.', 400));
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
        otherCategory,
        sectorInterest,
        hasExistingCompany,
        companyName,
        companySector,
        businessLicenseUrl,
        attendance,
        day1Attendance,
        day1Sessions: day1Attendance === 'partial' ? day1Sessions : [],
        day2Attendance,
        day2Sessions: day2Attendance === 'partial' ? day2Sessions : [],
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
