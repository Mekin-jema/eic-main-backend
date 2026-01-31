import type { Schema } from 'mongoose';

export function applyBaseSchemaOptions(schema: Schema) {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
      if (ret._id) {
        ret.id = ret._id.toString();
        delete ret._id;
      }
      return ret;
    },
  });

  schema.set('toObject', { virtuals: true });

  return schema;
}
