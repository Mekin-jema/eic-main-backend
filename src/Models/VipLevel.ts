import { Schema, model } from 'mongoose';
import { applyBaseSchemaOptions } from './base';

const VipLevelSchema = applyBaseSchemaOptions(
  new Schema(
    {
      level: { type: Number, required: true },
      name: { type: String, required: true },
      numOfSpaces: { type: Number, required: true },
      pricePerSpace: { type: Number, required: true },
      image: { type: Schema.Types.Mixed },
      description: { type: String, required: true },
    },
    { timestamps: true }
  )
);

export default model('VipLevel', VipLevelSchema);
