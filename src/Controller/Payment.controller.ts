import crypto from 'crypto';
import catchAsyncError from '../Middleware/catchAsyncError';
import { TransactionService } from '../Services/TransactionService';

// Webhook: verify Chapa signature and record transaction
export const webhook = catchAsyncError(async (req, res, next) => {
    const secret = process.env.webhook_secret_key!;
    const { first_name, last_name, email, currency, amount, charge, mode, type, tx_ref, status, reference, payment_method, created_at, updated_at } = req.body;

    const hash = crypto.createHmac('sha256', secret).update(JSON.stringify(req.body)).digest('hex');

    if (hash == req.headers['x-chapa-signature']) {
        await TransactionService.create({
            first_name,
            last_name,
            email,
            currency,
            amount,
            charge,
            mode,
            type,
            status,
            reference,
            created_at,
            updated_at,
            tx_ref,
            payment_method
        });

        return res.sendStatus(200);
    }
});
