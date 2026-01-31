import { Schema, model } from 'mongoose';
import { applyBaseSchemaOptions } from './base';

const CommunicationTemplateSchema = applyBaseSchemaOptions(
  new Schema(
    {
      key: { type: String, required: true, unique: true, index: true },
      name: { type: String, required: true },
      subject: { type: String, required: true },
      body: { type: String },
      usedCount: { type: Number, default: 0 },
      lastUsedAt: { type: Date },
    },
    { timestamps: true }
  )
);

export default model('CommunicationTemplate', CommunicationTemplateSchema);
