import { Router, type Router as ExpressRouter } from 'express';
import CommunicationsController from '../Controller/Communications.controller';
import { requireAdmin } from '../Middleware/requireAdmin';

const router: ExpressRouter = Router();

router.use(requireAdmin);

router.get('/templates', CommunicationsController.getTemplates);
router.get('/stats', CommunicationsController.getStats);
router.get('/recent', CommunicationsController.getRecentMessages);
router.post('/email/send', CommunicationsController.sendEmail);
router.get('/email/campaigns', CommunicationsController.getEmailCampaigns);
router.get('/sms/stats', CommunicationsController.getSmsStats);
router.get('/notifications/recent', CommunicationsController.getRecentNotifications);
router.get('/notifications/platform', CommunicationsController.getPlatformStats);

export default router;
