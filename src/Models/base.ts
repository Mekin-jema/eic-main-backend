import type { Schema, Document } from 'mongoose';


  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc: Document, ret: Record<string, any>) => {
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
