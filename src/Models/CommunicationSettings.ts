import { Schema, model } from 'mongoose';
import { applyBaseSchemaOptions } from './base';

const CommunicationSettingsSchema = applyBaseSchemaOptions(
  new Schema(
    {
      smsCreditsTotal: { type: Number, default: 5000 },
      smsCreditsUsed: { type: Number, default: 0 },
      unsubscribes: { type: Number, default: 0 },
      iosUsers: { type: Number, default: 0 },
      androidUsers: { type: Number, default: 0 },
      totalAppUsers: { type: Number, default: 0 },
    },
    { timestamps: { createdAt: false, updatedAt: true } }
  )
);

export default model('CommunicationSettings', CommunicationSettingsSchema);
