import { Schema, model } from 'mongoose';
import { applyBaseSchemaOptions } from './base';

const NotificationLogSchema = applyBaseSchemaOptions(
  new Schema(
    {
      title: { type: String, required: true },
      message: { type: String, required: true },
      audience: { type: String, required: true },
      sentCount: { type: Number, required: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
  )
);

export default model('NotificationLog', NotificationLogSchema);
