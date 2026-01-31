import { Schema, model } from 'mongoose';
import { applyBaseSchemaOptions } from './base';

const FailedEmailSchema = applyBaseSchemaOptions(
  new Schema(
    {
      recipientEmail: { type: String, required: true },
      recipientName: { type: String },
      emailType: { type: String, required: true, enum: ['attendee', 'contact'] },
      subject: { type: String, required: true },
      htmlContent: { type: String, required: true },
      errorMessage: { type: String, required: true },
      retryCount: { type: Number, default: 0 },
      lastRetryAt: { type: Date },
      status: { type: String, default: 'failed', enum: ['failed', 'retrying', 'sent'] },
      originalData: { type: Schema.Types.Mixed, required: true },
    },
    { timestamps: true }
  )
);

export default model('FailedEmail', FailedEmailSchema);
