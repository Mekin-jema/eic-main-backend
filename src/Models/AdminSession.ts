import { Schema, model } from 'mongoose';
import { applyBaseSchemaOptions } from './base';

const AdminSessionSchema = applyBaseSchemaOptions(
  new Schema(
    {
      userId: { type: Schema.Types.ObjectId, ref: 'AdminUser', required: true, index: true },
      expiresAt: { type: Date, required: true },
      revokedAt: { type: Date },
      ipAddress: { type: String },
      userAgent: { type: String },
      sid: { type: String, required: true, unique: true, index: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
  )
);

export default model('AdminSession', AdminSessionSchema);
