import mongoose from 'mongoose';

const specSchema = new mongoose.Schema({ label: { type: String, trim: true }, value: { type: String, trim: true } }, { _id: false });

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, trim: true, lowercase: true },
  name: { type: String, required: true, trim: true, maxlength: 160 },
  reference: { type: String, trim: true, maxlength: 80, default: '' },
  category: { type: String, required: true, trim: true, maxlength: 60 },
  price: { type: Number, required: true, min: 0 },
  compareAtPrice: { type: Number, min: 0, default: null },
  material: { type: String, trim: true, maxlength: 160, default: '' },
  shortDescription: { type: String, trim: true, maxlength: 500, default: '' },
  description: { type: String, trim: true, maxlength: 6000, default: '' },
  highlights: [{ type: String, trim: true, maxlength: 300 }],
  specs: [specSchema],
  sizes: [{ type: String, trim: true, maxlength: 40 }],
  images: [{ type: String, trim: true, maxlength: 2000 }],
  status: { type: String, enum: ['available', 'sold_out', 'hidden'], default: 'available' },
  isNew: { type: Boolean, default: false },
  isBestseller: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });

productSchema.index({ name: 'text', shortDescription: 'text', description: 'text' });
productSchema.set('toJSON', { transform: (_doc, ret) => { delete ret._id; return ret; } });
export const Product = mongoose.model('Product', productSchema);
