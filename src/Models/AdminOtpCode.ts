import { Schema, model } from 'mongoose';
import { applyBaseSchemaOptions } from './base';

const AdminOtpCodeSchema = applyBaseSchemaOptions(
  new Schema(
    {
      code: { type: String, required: true, unique: true, index: true },
      userId: { type: Schema.Types.ObjectId, ref: 'AdminUser', required: true, index: true },
      expiresAt: { type: Date, required: true },
      used: { type: Boolean, default: false },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
  )
);

export default model('AdminOtpCode', AdminOtpCodeSchema);
