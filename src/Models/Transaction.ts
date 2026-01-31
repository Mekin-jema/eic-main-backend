import { Schema, model } from 'mongoose';
import { applyBaseSchemaOptions } from './base';

const TransactionSchema = applyBaseSchemaOptions(
  new Schema(
    {
      first_name: { type: String, required: true },
      last_name: { type: String },
      email: { type: String, required: true },
      currency: { type: String, required: true },
      amount: { type: Number, required: true },
      charge: { type: Number, required: true },
      mode: { type: String, required: true },
      type: { type: String, required: true },
      status: { type: String, required: true },
      reference: { type: String, required: true, index: true },
      created_at: { type: Date },
      updated_at: { type: Date },
      tx_ref: { type: String, index: true },
      payment_method: { type: String },
    },
    { timestamps: false }
  )
);

export default model('Transaction', TransactionSchema);
