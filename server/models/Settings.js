import mongoose from 'mongoose';
const settingsSchema = new mongoose.Schema({
  singleton: { type: String, default: 'store', unique: true },
  brandName: { type: String, required: true, trim: true, maxlength: 120 },
  tagline: { type: String, default: '', trim: true, maxlength: 240 },
  whatsappNumber: { type: String, required: true, trim: true, maxlength: 32 },
  whatsappGreeting: { type: String, default: 'Hello!', trim: true, maxlength: 300 },
  instagramHandle: { type: String, default: '', trim: true, maxlength: 120 },
  location: { type: String, default: '', trim: true, maxlength: 300 },
  categories: { type: [String], default: ['Bags', 'Wallets', 'Waist Chains', 'Jewelry', 'Accessories'] }
}, { timestamps: true, versionKey: false });
settingsSchema.set('toJSON', { transform: (_doc, ret) => { delete ret._id; delete ret.singleton; return ret; } });
export const Settings = mongoose.model('Settings', settingsSchema);
