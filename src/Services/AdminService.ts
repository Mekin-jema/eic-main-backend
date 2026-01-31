import AttendeeRegistration from '../Models/AttendeeRegistration';
import Contact from '../Models/Contact';

export class AdminService {
    // Get daily analytics for the last 30 days
    static async getDailyAnalytics() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const attendees = await AttendeeRegistration.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return {
            attendees: attendees.map((item: { _id: string, count: number }) => ({ date: item._id, count: item.count }))
        };
    }

    // Get total counts for each user type
    static async getTotalCounts() {
        const [attendeeCount, contactCount] = await Promise.all([
            AttendeeRegistration.countDocuments(),
            Contact.countDocuments()
        ]);

        return {
            attendees: attendeeCount,
            contacts: contactCount,
            total: attendeeCount
        };
    }

    // Get all exhibitor applications with status
    // Get all attendees
    static async getAllAttendees() {
        return await AttendeeRegistration.find().sort({ createdAt: -1 });
    }

    // Get all contacts
    static async getAllContacts() {
        return await Contact.find().sort({ createdAt: -1 });
    }

    // Get recent activity (last 10 registrations)
    static async getRecentActivity() {
        const recentAttendees = await AttendeeRegistration.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select({ firstName: 1, lastName: 1, email: 1, createdAt: 1, category: 1 });

        return {
            attendees: recentAttendees
        };
    }

    // Get analytics summary
    static async getAnalyticsSummary() {
        const [totalCounts, recentActivity, dailyAnalytics] = await Promise.all([this.getTotalCounts(), this.getRecentActivity(), this.getDailyAnalytics()]);

        return {
            totalCounts,
            recentActivity,
            dailyAnalytics
        };
    }
}
