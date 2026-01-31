import { Router } from 'express';
import * as FailedEmailController from '../Controller/FailedEmail.controller';

const router: Router = Router();

// Get all failed emails
router.get('/', FailedEmailController.getAllFailedEmails);

// Get failed emails by status
router.get('/by-status/:statusParam', FailedEmailController.getFailedEmailsByStatus);

// Get failed emails by email type
router.get('/by-type/:emailTypeParam', FailedEmailController.getFailedEmailsByType);

// Get retryable emails
router.get('/retryable', FailedEmailController.getRetryableEmails);

// Get failed email statistics
router.get('/stats', FailedEmailController.getFailedEmailStats);

// Update failed email status
router.patch('/:emailId/status', FailedEmailController.updateFailedEmailStatus);

// Mark email as retrying
router.patch('/:emailId/retrying', FailedEmailController.markEmailAsRetrying);

// Mark email as sent
router.patch('/:emailId/sent', FailedEmailController.markEmailAsSent);

// Retry failed email
router.post('/:emailId/retry', FailedEmailController.retryFailedEmail);

// Delete failed email
router.delete('/:emailId', FailedEmailController.deleteFailedEmail);

export default router;
