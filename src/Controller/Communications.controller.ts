import { Request, Response } from 'express';
import { CommunicationsService } from '../Services/CommunicationsService';
import nodemailer from 'nodemailer';

// Reuse transporter settings from emailService but minimal to avoid circular deps
const transporter = nodemailer.createTransport({
  host: 'mail.powerethio.com',
  port: 465,
  secure: true,
  auth: { user: 'noreply@powerethio.com', pass: 'YpirP1]KF+h0w7dW' },
  tls: { rejectUnauthorized: false },
});

export default class CommunicationsController {
  // Templates: list available communication templates
  static async getTemplates(req: Request, res: Response) {
    const templates = await CommunicationsService.getTemplates();
    return res.json({ success: true, data: templates });
  }

  // Stats: return aggregate communication performance metrics
  static async getStats(req: Request, res: Response) {
    const stats = await CommunicationsService.getStats();
    return res.json({ success: true, data: stats });
  }

  // Recent: fetch recent sent messages with optional limit
  static async getRecentMessages(req: Request, res: Response) {
    const limit = Number(req.query.limit ?? 10);
    const messages = await CommunicationsService.getRecentMessages(limit);
    return res.json({ success: true, data: messages });
  }

  // Send Email: deliver an email to the resolved audience and log result
  static async sendEmail(req: Request, res: Response) {
    const { templateKey, audience = 'all', subject, body } = req.body || {};
    if (!subject || !body) {
      return res.status(400).json({ success: false, message: 'subject and body are required' });
    }
    const recipients = await CommunicationsService.resolveAudience(audience);

    let sent = 0;
    const errors: Array<{ email: string; error: string }> = [];

    for (const r of recipients as any[]) {
      try {
        const toEmail = String(r.email);
        await transporter.sendMail({ from: 'noreply@powerethio.com', to: toEmail, subject, html: body });
        sent++;
      } catch (err: any) {
        const toEmail = String(r.email);
        errors.push({ email: toEmail, error: err?.message || 'send error' });
      }
    }

    await CommunicationsService.logEmailSend({ templateKey, audience, subject, body, sentCount: sent, bouncedCount: errors.length });

    return res.json({ success: true, data: { attempted: recipients.length, sent, errors } });
  }

  // Campaigns: list email campaign summaries
  static async getEmailCampaigns(req: Request, res: Response) {
    const campaigns = await CommunicationsService.getEmailCampaigns();
    return res.json({ success: true, data: campaigns });
  }

  // SMS Stats: return current SMS usage/delivery metrics
  static async getSmsStats(req: Request, res: Response) {
    const stats = await CommunicationsService.getSmsStats();
    return res.json({ success: true, data: stats });
  }

  // Notifications: list recent push/in-app notifications
  static async getRecentNotifications(req: Request, res: Response) {
    const limit = Number(req.query.limit ?? 10);
    const data = await CommunicationsService.getRecentNotifications(limit);
    return res.json({ success: true, data });
  }

  // Platform: show app platform user distribution
  static async getPlatformStats(req: Request, res: Response) {
    const data = await CommunicationsService.getPlatformStats();
    return res.json({ success: true, data });
  }
}
