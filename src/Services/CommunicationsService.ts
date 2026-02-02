import AttendeeRegistration from '../Models/AttendeeRegistration';
import CommunicationTemplate from '../Models/CommunicationTemplate';
import CommunicationLog from '../Models/CommunicationLog';
import CommunicationSettings from '../Models/CommunicationSettings';
import SmsLog from '../Models/SmsLog';
import NotificationLog from '../Models/NotificationLog';

export type AudienceFilter = 'all' | 'checked-in' | 'pending' | 'vip' | 'speakers' | 'custom';

export class CommunicationsService {
  static async ensureDefaultTemplates() {
    const defaults = [
      {
        key: 'welcome',
        name: 'Welcome Email',
        subject: 'Welcome to Invest Ethiopia Forum 2026',
        body: `Dear Attendee,

Welcome to the Invest Ethiopia Forum 2026! We're excited to have you join us for this premier investment event.

Important Details:
• Date: May 12-13, 2026
• Venue: Ethiopian Skylight Hotel, Addis Ababa
• Check-in: Starts at 8:00 AM

Please bring your registration confirmation and ID.

Best regards,
Invest Ethiopia Forum Team`,
      },
      {
        key: 'checkin-reminder',
        name: 'Check-in Reminder',
        subject: 'Important: Check-in Information',
        body: `Dear Attendee,

This is a friendly reminder about check-in for Invest Ethiopia Forum 2026.

Check-in Details:
• Date: May 12-13, 2026
• Time: 8:00 AM – 10:30 AM
• Venue: Ethiopian Skylight Hotel, Addis Ababa

Please bring your registration confirmation and a valid ID for quick entry.

We look forward to welcoming you.

Best regards,
Invest Ethiopia Forum Team`,
      },
      {
        key: 'vip-invite',
        name: 'VIP Invitation',
        subject: 'Exclusive VIP Event Invitation',
        body: `Dear Esteemed Guest,

You are cordially invited to the Invest Ethiopia Forum 2026 VIP experience.

VIP Access Includes:
• Priority check-in and seating
• Private networking lounge
• Exclusive meetings with key stakeholders

Please confirm your attendance so we can reserve your VIP access.

Warm regards,
Invest Ethiopia Forum Team`,
      },
      {
        key: 'post-event',
        name: 'Post-Event Follow-up',
        subject: 'Thank You & Next Steps',
        body: `Dear Attendee,

Thank you for attending Invest Ethiopia Forum 2026. We appreciate your participation and engagement.

Next Steps:
• You will receive a summary of key sessions and materials shortly.
• For follow-ups, please reply with any questions or partnership interests.

We look forward to staying connected.

Best regards,
Invest Ethiopia Forum Team`,
      },
    ];
    for (const tpl of defaults) {
      await CommunicationTemplate.findOneAndUpdate(
        { key: tpl.key },
        { $setOnInsert: tpl },
        { upsert: true, new: true }
      );
    }
  }

  static async getTemplates() {
    await this.ensureDefaultTemplates();
    return CommunicationTemplate.find().sort({ name: 1 });
  }

  static async getRecentMessages(limit = 10) {
    return CommunicationLog.find().sort({ createdAt: -1 }).limit(limit);
  }

  static async getStats() {
    const agg = await CommunicationLog.aggregate([
      {
        $group: {
          _id: null,
          sentCount: { $sum: { $ifNull: ['$sentCount', 0] } },
          openedCount: { $sum: { $ifNull: ['$openedCount', 0] } },
          clickedCount: { $sum: { $ifNull: ['$clickedCount', 0] } },
          bouncedCount: { $sum: { $ifNull: ['$bouncedCount', 0] } },
        },
      },
    ]);

    const totals = agg[0] || { sentCount: 0, openedCount: 0, clickedCount: 0, bouncedCount: 0 };
    const totalSent = totals.sentCount ?? 0;
    const openRate = totalSent ? Math.round(((totals.openedCount ?? 0) / totalSent) * 100) : 0;
    const clickRate = totalSent ? Math.round(((totals.clickedCount ?? 0) / totalSent) * 100) : 0;
    const bounceRate = totalSent ? Math.round(((totals.bouncedCount ?? 0) / totalSent) * 100) : 0;
    const unsubscribes = 0; // Not tracked currently

    return { totalSent, openRate, clickRate, bounceRate, unsubscribes };
  }

  static async getSettings() {
    let settings = await CommunicationSettings.findOne();
    if (!settings) {
      settings = await CommunicationSettings.create({
        smsCreditsTotal: 5000,
        smsCreditsUsed: 0,
        unsubscribes: 0,
        iosUsers: 856,
        androidUsers: 391,
        totalAppUsers: 1247,
      });
    }
    return settings;
  }

  static async getEmailCampaigns() {
    await this.ensureDefaultTemplates();
    const templates = await CommunicationTemplate.find();
    const logs = await CommunicationLog.aggregate([
      {
        $group: {
          _id: '$templateKey',
          sentCount: { $sum: { $ifNull: ['$sentCount', 0] } },
          openedCount: { $sum: { $ifNull: ['$openedCount', 0] } },
        },
      },
    ]);
    const logMap = new Map(logs.map((l: { _id?: string, sentCount?: number, openedCount?: number }) => [l._id ?? '', l]));
    return templates.map((tpl: any) => {
      const agg = logMap.get(tpl.key) as { sentCount?: number; openedCount?: number } | undefined;
      const sent = agg?.sentCount ?? 0;
      const openRate = sent ? Math.round(((agg?.openedCount ?? 0) / sent) * 100) : 0;
      const lastUsedAt = tpl.lastUsedAt ? new Date(tpl.lastUsedAt as any) : null;
      const lastUsedDays = lastUsedAt ? (Date.now() - lastUsedAt.getTime()) / (1000 * 60 * 60 * 24) : Infinity;
      const status = tpl.usedCount === 0 ? 'Draft' : lastUsedDays <= 14 ? 'Active' : 'Paused';
      return { name: tpl.name, status, sent, openRate };
    });
  }

  static async getSmsStats() {
    const settings = (await this.getSettings()) as any;
    const smsAgg = await SmsLog.aggregate([
      {
        $group: {
          _id: null,
          sentCount: { $sum: { $ifNull: ['$sentCount', 0] } },
          failedCount: { $sum: { $ifNull: ['$failedCount', 0] } },
        },
      },
    ]);
    const totals = smsAgg[0] || { sentCount: 0, failedCount: 0 };
    const sent = totals.sentCount ?? 0;
    const failed = totals.failedCount ?? 0;
    const smsCreditsTotal = Number(settings.smsCreditsTotal || 0);
    const smsCreditsUsed = Number(settings.smsCreditsUsed || 0);
    const creditsUsed = smsCreditsUsed + sent;
    const creditsRemaining = Math.max(smsCreditsTotal - creditsUsed, 0);
    const usedPercent = smsCreditsTotal ? Math.round((creditsUsed / smsCreditsTotal) * 100) : 0;
    const deliveryRate = sent ? Math.round(((sent - failed) / sent) * 100) : 0;
    return { creditsRemaining, usedPercent, deliveryRate, delivered: sent - failed, failed };
  }

  static async getRecentNotifications(limit = 10) {
    return NotificationLog.find().sort({ createdAt: -1 }).limit(limit);
  }

  static async getPlatformStats() {
    const s = (await this.getSettings()) as any;
    return {
      iosUsers: Number(s.iosUsers || 0),
      androidUsers: Number(s.androidUsers || 0),
      totalAppUsers: Number(s.totalAppUsers || 0),
    };
  }

  static async resolveAudience(audience: AudienceFilter): Promise<Array<{ email: string; firstName?: string; lastName?: string; fullName?: string; organization?: string }>> {
    // Fetch recipient emails by audience filter
    const attendees = await AttendeeRegistration.find();
    const filterFn = (a: any) => {
      switch (audience) {
        case 'checked-in':
          return a.isCheckedIn;
        case 'pending':
          return !a.isCheckedIn;
        case 'vip':
          return a.registrationType?.toLowerCase() === 'vip';
        case 'speakers':
          return a.registrationType?.toLowerCase() === 'speaker';
        case 'all':
        default:
          return true;
      }
    };
    return attendees
      .filter(filterFn)
      .map((a: any) => ({
        email: String(a.email),
        firstName: a.firstName,
        lastName: a.lastName,
        fullName: `${a.firstName} ${a.lastName}`.trim(),
        organization: a.organization,
      }));
  }

  static async resolveRecipientsByIds(ids: string[]): Promise<Array<{ email: string; firstName?: string; lastName?: string; fullName?: string; organization?: string }>> {
    if (!ids.length) return [];
    const attendees = await AttendeeRegistration.find({ _id: { $in: ids } });
    return attendees
      .filter((a: any) => Boolean(a.email))
      .map((a: any) => ({
        email: String(a.email),
        firstName: a.firstName,
        lastName: a.lastName,
        fullName: `${a.firstName} ${a.lastName}`.trim(),
        organization: a.organization,
      }));
  }

  static async logEmailSend(params: {
    templateKey?: string;
    audience: AudienceFilter;
    subject: string;
    body: string;
    sentCount: number;
    openedCount?: number;
    clickedCount?: number;
    bouncedCount?: number;
    status?: string;
    scheduledFor?: Date | null;
  }) {
    const log = await CommunicationLog.create({ channel: 'email', status: 'completed', ...params });
    if (params.templateKey) {
      await CommunicationTemplate.findOneAndUpdate(
        { key: params.templateKey },
        { $inc: { usedCount: 1 }, $set: { lastUsedAt: new Date() } }
      );
    }
    return log;
  }

  static async scheduleEmail(params: {
    templateKey?: string;
    audience: AudienceFilter;
    subject: string;
    body: string;
    scheduledFor: Date;
  }) {
    const log = await CommunicationLog.create({
      channel: 'email',
      status: 'scheduled',
      sentCount: 0,
      ...params,
    });
    if (params.templateKey) {
      await CommunicationTemplate.findOneAndUpdate(
        { key: params.templateKey },
        { $inc: { usedCount: 1 }, $set: { lastUsedAt: new Date() } }
      );
    }
    return log;
  }

  static async createTemplate(params: { key: string; name: string; subject: string; body?: string }) {
    const existing = await CommunicationTemplate.findOne({ key: params.key });
    if (existing) {
      throw new Error('Template key already exists');
    }
    return CommunicationTemplate.create(params);
  }

  static async updateTemplate(id: string, params: { name?: string; subject?: string; body?: string }) {
    return CommunicationTemplate.findByIdAndUpdate(id, { $set: params }, { new: true });
  }

  static async deleteTemplate(id: string) {
    return CommunicationTemplate.findByIdAndDelete(id);
  }
}
