import { Request, Response } from 'express';
import catchAsyncError from '../Middleware/catchAsyncError';
import { FailedEmailService } from '../Services/FailedEmailService';

type FailedEmail = {
    id?: string;
    [key: string]: any;
};

// List All: return all failed email records
export const getAllFailedEmails = catchAsyncError(async (req: Request, res: Response) => {
    const failedEmails = await FailedEmailService.getAll();
    res.status(200).json({
        success: true,
        data: failedEmails,
        count: failedEmails.length
    });
});

// By Status: filter failed emails by status value
export const getFailedEmailsByStatus = catchAsyncError(async (req: Request, res: Response) => {
    const { statusParam } = req.params;
    const status = Array.isArray(statusParam) ? statusParam[0] : statusParam;

    if (!['failed', 'retrying', 'sent'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status. Must be: failed, retrying, or sent'
        });
    }

    const failedEmails = await FailedEmailService.getByStatus(status as 'failed' | 'retrying' | 'sent');
    res.status(200).json({
        success: true,
        data: failedEmails,
        count: failedEmails.length
    });
});

// By Type: filter failed emails by email type
export const getFailedEmailsByType = catchAsyncError(async (req: Request, res: Response) => {
    const { emailTypeParam } = req.params;
    const emailType = Array.isArray(emailTypeParam) ? emailTypeParam[0] : emailTypeParam;

    if (!['attendee', 'contact'].includes(emailType)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid email type. Must be: attendee or contact'
        });
    }

    const failedEmails = await FailedEmailService.getByEmailType(emailType as 'attendee' | 'contact');
    res.status(200).json({
        success: true,
        data: failedEmails,
        count: failedEmails.length
    });
});

// Retryable: list emails eligible for retry
export const getRetryableEmails = catchAsyncError(async (req: Request, res: Response) => {
    const retryableEmails = await FailedEmailService.getRetryableEmails();
    res.status(200).json({
        success: true,
        data: retryableEmails,
        count: retryableEmails.length
    });
});

// Stats: get aggregate stats for failed emails
export const getFailedEmailStats = catchAsyncError(async (req: Request, res: Response) => {
    const stats = await FailedEmailService.getStats();
    res.status(200).json({
        success: true,
        data: stats
    });
});

// Update: change status and optional error message
export const updateFailedEmailStatus = catchAsyncError(async (req: Request, res: Response) => {
    const { emailId } = req.params;
    const id = Array.isArray(emailId) ? emailId[0] : emailId;
    const { status, errorMessage } = req.body;

    const statusStr = Array.isArray(status) ? status[0] : status;

    if (!['failed', 'retrying', 'sent'].includes(statusStr)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status. Must be: failed, retrying, or sent'
        });
    }

    const updateData: any = { status: statusStr };
    if (errorMessage) {
        updateData.errorMessage = errorMessage;
    }

    const updatedEmail = await FailedEmailService.update(id, updateData);

    res.status(200).json({
        success: true,
        data: updatedEmail,
        message: 'Failed email status updated successfully'
    });
});

// Mark Retrying: set email status to retrying
export const markEmailAsRetrying = catchAsyncError(async (req: Request, res: Response) => {
    const { emailId } = req.params;
    const id = Array.isArray(emailId) ? emailId[0] : emailId;

    const updatedEmail = await FailedEmailService.markAsRetrying(id);

    res.status(200).json({
        success: true,
        data: updatedEmail,
        message: 'Email marked as retrying'
    });
});

// Mark Sent: set email status to sent
export const markEmailAsSent = catchAsyncError(async (req: Request, res: Response) => {
    const { emailId } = req.params;
    const id = Array.isArray(emailId) ? emailId[0] : emailId;

    const updatedEmail = await FailedEmailService.markAsSent(id);

    res.status(200).json({
        success: true,
        data: updatedEmail,
        message: 'Email marked as sent successfully'
    });
});

// Delete: remove a failed email entry
export const deleteFailedEmail = catchAsyncError(async (req: Request, res: Response) => {
    const { emailId } = req.params;
    const id = Array.isArray(emailId) ? emailId[0] : emailId;

    await FailedEmailService.delete(id);

    res.status(200).json({
        success: true,
        message: 'Failed email deleted successfully'
    });
});

// Retry: initiate manual retry flow for a failed email
export const retryFailedEmail = catchAsyncError(async (req: Request, res: Response) => {
    const { emailId } = req.params;
    const id = Array.isArray(emailId) ? emailId[0] : emailId;

    // Get the failed email data
    const failedEmails = await FailedEmailService.getAll();
    const failedEmail = failedEmails.find((email: FailedEmail) => email.id === id);

    if (!failedEmail) {
        return res.status(404).json({
            success: false,
            message: 'Failed email not found'
        });
    }

    // Mark as retrying
    await FailedEmailService.markAsRetrying(id);

    // Here you would implement the actual retry logic
    // For now, we'll just increment the retry count
    await FailedEmailService.incrementRetryCount(id);

    res.status(200).json({
        success: true,
        message: 'Email retry initiated',
        data: {
            id: failedEmail.id,
            recipientEmail: failedEmail.recipientEmail,
            emailType: failedEmail.emailType
        }
    });
});
