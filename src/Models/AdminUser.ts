import { Schema, model } from 'mongoose';
import { applyBaseSchemaOptions } from './base';

const AdminUserSchema = applyBaseSchemaOptions(
  new Schema(
    {
      email: { type: String, required: true, unique: true, index: true },
      passwordHash: { type: String, required: true },
      name: { type: String },
      role: { type: String, default: 'ADMIN' },
    },
    { timestamps: true }
  )
);

export default model('AdminUser', AdminUserSchema);
