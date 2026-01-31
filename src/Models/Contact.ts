import { Schema, model } from 'mongoose';
import { applyBaseSchemaOptions } from './base';

const ContactSchema = applyBaseSchemaOptions(
  new Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      jobTitle: { type: String, required: true },
      companyName: { type: String, required: true },
      country: { type: String, required: true },
      message: { type: String, required: true },
      FixedlineNumber: { type: String },
    },
    { timestamps: true }
  )
);

export default model('Contact', ContactSchema);
