import { Schema, model } from 'mongoose';
import { applyBaseSchemaOptions } from './base';

const SmsLogSchema = applyBaseSchemaOptions(
  new Schema(
    {
      audience: { type: String, required: true },
      message: { type: String, required: true },
      sentCount: { type: Number, required: true },
      failedCount: { type: Number, default: 0 },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
  )
);

export default model('SmsLog', SmsLogSchema);
