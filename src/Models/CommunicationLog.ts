import { Schema, model } from 'mongoose';
import { applyBaseSchemaOptions } from './base';

const CommunicationLogSchema = applyBaseSchemaOptions(
  new Schema(
    {
      templateKey: { type: String },
      channel: { type: String, required: true },
      audience: { type: String, required: true },
      subject: { type: String, required: true },
      body: { type: String, required: true },
      sentCount: { type: Number, required: true },
      openedCount: { type: Number },
      clickedCount: { type: Number },
      bouncedCount: { type: Number },
      status: { type: String, default: 'completed' },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
  )
);

export default model('CommunicationLog', CommunicationLogSchema);
