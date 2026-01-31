import catchAsyncError from '../Middleware/catchAsyncError';
import { ContactService } from '../Services/ContactService';
import { sendContactConfirmationEmail } from '../Utils/emailService';

// Contact Form: save inquiry and send confirmation email
export const ContactForm = catchAsyncError(async (req, res, next) => {
    const { name, email, phoneNumber, jobTitle, companyName, country, message, FixedlineNumber } = req.body;

    const newContact = await ContactService.create({
        name,
        email,
        phoneNumber,
        jobTitle,
        companyName,
        country,
        message,
        FixedlineNumber
    });

    // Send confirmation email
    try {
        await sendContactConfirmationEmail(newContact);
        console.log('Contact confirmation email sent successfully to:', email);
    } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the contact form if email fails
    }

    res.status(200).json({
        message: 'Your message has been sent successfully. We will get back to you soon.',
        contact: newContact
    });
});
