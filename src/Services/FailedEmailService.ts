import FailedEmail from '../Models/FailedEmail';

export interface CreateFailedEmailData {
    recipientEmail: string;
    recipientName?: string;
    emailType: 'attendee' | 'contact';
    subject: string;
    htmlContent: string;
    errorMessage: string;
    originalData: any;
}

export interface UpdateFailedEmailData {
    retryCount?: number;
    lastRetryAt?: Date;
    status?: 'failed' | 'retrying' | 'sent';
    errorMessage?: string;
}

export class FailedEmailService {
    // Create a new failed email record
    static async create(data: CreateFailedEmailData) {
        try {
            const failedEmail = await FailedEmail.create({
                recipientEmail: data.recipientEmail,
                recipientName: data.recipientName,
                emailType: data.emailType,
                subject: data.subject,
                htmlContent: data.htmlContent,
                errorMessage: data.errorMessage,
                originalData: data.originalData,
                status: 'failed',
                retryCount: 0
            });

            console.log('Failed email saved to database:', failedEmail.id);
            return failedEmail;
        } catch (error) {
            console.error('Error saving failed email to database:', error);
            throw error;
        }
    }

    // Get all failed emails
    static async getAll() {
        try {
            return await FailedEmail.find().sort({ createdAt: -1 });
        } catch (error) {
            console.error('Error fetching failed emails:', error);
            throw error;
        }
    }

    // Get failed emails by status
    static async getByStatus(status: 'failed' | 'retrying' | 'sent') {
        try {
            return await FailedEmail.find({ status }).sort({ createdAt: -1 });
        } catch (error) {
            console.error('Error fetching failed emails by status:', error);
            throw error;
        }
    }

    // Get failed emails by email type
    static async getByEmailType(emailType: 'attendee' | 'contact') {
        try {
            return await FailedEmail.find({ emailType }).sort({ createdAt: -1 });
        } catch (error) {
            console.error('Error fetching failed emails by type:', error);
            throw error;
        }
    }

    // Update a failed email record
    static async update(id: string, data: UpdateFailedEmailData) {
        try {
            return await FailedEmail.findByIdAndUpdate(id, data, { new: true });
        } catch (error) {
            console.error('Error updating failed email:', error);
            throw error;
        }
    }

    // Delete a failed email record
    static async delete(id: string) {
        try {
            return await FailedEmail.findByIdAndDelete(id);
        } catch (error) {
            console.error('Error deleting failed email:', error);
            throw error;
        }
    }

    // Get failed emails that can be retried (status = 'failed' and retryCount < 3)
    static async getRetryableEmails() {
        try {
            return await FailedEmail.find({
                status: 'failed',
                retryCount: { $lt: 3 }
            }).sort({ createdAt: 1 });
        } catch (error) {
            console.error('Error fetching retryable emails:', error);
            throw error;
        }
    }

    // Mark email as retrying
    static async markAsRetrying(id: string) {
        try {
            return await FailedEmail.findByIdAndUpdate(
                id,
                {
                    status: 'retrying',
                    lastRetryAt: new Date()
                },
                { new: true }
            );
        } catch (error) {
            console.error('Error marking email as retrying:', error);
            throw error;
        }
    }

    // Mark email as sent successfully
    static async markAsSent(id: string) {
        try {
            return await FailedEmail.findByIdAndUpdate(
                id,
                {
                    status: 'sent'
                },
                { new: true }
            );
        } catch (error) {
            console.error('Error marking email as sent:', error);
            throw error;
        }
    }

    // Increment retry count
    static async incrementRetryCount(id: string) {
        try {
            const failedEmail = (await FailedEmail.findById(id).lean()) as any;

            if (failedEmail) {
                return await FailedEmail.findByIdAndUpdate(
                    id,
                        {
                            retryCount: Number(failedEmail.retryCount || 0) + 1,
                        lastRetryAt: new Date()
                    },
                    { new: true }
                );
            }
        } catch (error) {
            console.error('Error incrementing retry count:', error);
            throw error;
        }
    }

    // Get statistics
    static async getStats() {
        try {
            const total = await FailedEmail.countDocuments();
            const byStatus = await FailedEmail.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]);
            const byType = await FailedEmail.aggregate([
                { $group: { _id: '$emailType', count: { $sum: 1 } } }
            ]);

            return {
                total,
                byStatus: byStatus.map((item: { _id: string, count: number }) => ({
                    status: item._id,
                    count: item.count
                })),
                byType: byType.map((item: { _id: string, count: number }) => ({
                    emailType: item._id,
                    count: item.count
                }))
            };
        } catch (error) {
            console.error('Error fetching failed email stats:', error);
            throw error;
        }
    }
}
