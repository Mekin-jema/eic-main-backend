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

const renderEmailTemplate = (content: string) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ethiopian Investment Commission</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7fb;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:600px;max-width:92vw;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 12px 30px rgba(15,23,42,0.08);">
            <tr>
              <td style="background:#0f172a;padding:24px 32px;color:#ffffff;">
                <div style="font-size:18px;font-weight:700;letter-spacing:.5px;">Ethiopian Investment Commission</div>
                <div style="font-size:12px;opacity:0.8;margin-top:4px;">Invest Ethiopia Forum</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px;font-size:15px;line-height:1.7;color:#111827;">
                ${content}
              </td>
            </tr>
            <tr>
              <td style="background:#f1f5f9;padding:20px 32px;font-size:12px;color:#475569;text-align:center;">
                © 2026 Ethiopian Investment Commission. All rights reserved.<br />
                <a href="https://eic-frontend.vercel.app/privacy" style="color:#0f172a;text-decoration:none;">Privacy Policy</a> | 
                <a href="https://eic-frontend.vercel.app/terms" style="color:#0f172a;text-decoration:none;">Terms of Service</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const applyMergeTags = (content: string, recipient: { email?: string; firstName?: string; lastName?: string; fullName?: string; organization?: string }) => {
  const values: Record<string, string> = {
    firstName: recipient.firstName || '',
    lastName: recipient.lastName || '',
    fullName: recipient.fullName || `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim(),
    organization: recipient.organization || '',
    email: recipient.email || '',
    eventName: 'Invest Ethiopia Forum 2026',
    eventDate: 'May 12-13, 2026',
  };
  return content.replace(/\{\{\s*(firstName|lastName|fullName|organization|email|eventName|eventDate)\s*\}\}/g, (_, key) => values[key] || '');
};

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
        const personalizedBody = applyMergeTags(body, r);
        const htmlBody = renderEmailTemplate(personalizedBody);
        await transporter.sendMail({ from: 'noreply@powerethio.com', to: toEmail, subject, html: htmlBody });
        sent++;
      } catch (err: any) {
        const toEmail = String(r.email);
        errors.push({ email: toEmail, error: err?.message || 'send error' });
      }
    }

    await CommunicationsService.logEmailSend({ templateKey, audience, subject, body, sentCount: sent, bouncedCount: errors.length });

    return res.json({ success: true, data: { attempted: recipients.length, sent, errors } });
  }

  // Send Test Email: deliver a single email to a provided address
  static async sendTestEmail(req: Request, res: Response) {
    const { email, subject, body } = req.body || {};
    if (!email || !subject || !body) {
      return res.status(400).json({ success: false, message: 'email, subject and body are required' });
    }
    const htmlBody = renderEmailTemplate(body);
    await transporter.sendMail({ from: 'noreply@powerethio.com', to: String(email), subject, html: htmlBody });
    return res.json({ success: true, message: 'Test email sent' });
  }

  // Schedule Email: create a scheduled email log entry
  static async scheduleEmail(req: Request, res: Response) {
    const { templateKey, audience = 'all', subject, body, scheduledFor } = req.body || {};
    if (!subject || !body || !scheduledFor) {
      return res.status(400).json({ success: false, message: 'subject, body and scheduledFor are required' });
    }
    const scheduleDate = new Date(scheduledFor);
    if (Number.isNaN(scheduleDate.getTime())) {
      return res.status(400).json({ success: false, message: 'scheduledFor must be a valid date' });
    }

    const log = await CommunicationsService.scheduleEmail({
      templateKey,
      audience,
      subject,
      body,
      scheduledFor: scheduleDate,
    });

    return res.json({ success: true, data: { id: log.id, scheduledFor: log.scheduledFor } });
  }

  // Send Email to specific recipients by IDs
  static async sendSelectedRecipients(req: Request, res: Response) {
    const { templateKey, recipientIds, subject, body } = req.body || {};
    if (!Array.isArray(recipientIds) || recipientIds.length === 0) {
      return res.status(400).json({ success: false, message: 'recipientIds is required' });
    }
    if (!subject || !body) {
      return res.status(400).json({ success: false, message: 'subject and body are required' });
    }

    const recipients = await CommunicationsService.resolveRecipientsByIds(recipientIds);

    let sent = 0;
    const errors: Array<{ email: string; error: string }> = [];

    for (const r of recipients as any[]) {
      try {
        const toEmail = String(r.email);
        const personalizedBody = applyMergeTags(body, r);
        const htmlBody = renderEmailTemplate(personalizedBody);
        await transporter.sendMail({ from: 'noreply@powerethio.com', to: toEmail, subject, html: htmlBody });
        sent++;
      } catch (err: any) {
        const toEmail = String(r.email);
        errors.push({ email: toEmail, error: err?.message || 'send error' });
      }
    }

    await CommunicationsService.logEmailSend({
      templateKey,
      audience: 'custom',
      subject,
      body,
      sentCount: sent,
      bouncedCount: errors.length,
    });

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

  // Templates: create a new template
  static async createTemplate(req: Request, res: Response) {
    const { key, name, subject, body } = req.body || {};
    if (!key || !name || !subject) {
      return res.status(400).json({ success: false, message: 'key, name and subject are required' });
    }
    try {
      const tpl = await CommunicationsService.createTemplate({ key, name, subject, body });
      return res.json({ success: true, data: tpl });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err?.message || 'Failed to create template' });
    }
  }

  // Templates: update a template
  static async updateTemplate(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const { name, subject, body } = req.body || {};
    const tpl = await CommunicationsService.updateTemplate(id, { name, subject, body });
    if (!tpl) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    return res.json({ success: true, data: tpl });
  }

  // Templates: delete a template
  static async deleteTemplate(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const tpl = await CommunicationsService.deleteTemplate(id);
    if (!tpl) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    return res.json({ success: true, message: 'Template deleted' });
  }
}
