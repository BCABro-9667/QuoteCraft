import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { UserProfile } from '@/types';

const UserProfileSchema = new Schema<UserProfile>({
  userId: { type: String, required: true, unique: true, index: true },
  companyName: { type: String, required: true },
  logoUrl: { type: String },
  email: { type: String },
  website: { type: String },
  phone: { type: String },
  mobile: { type: String },
  whatsapp: { type: String },
  address: { type: String },
  gstin: { type: String },
  quotationPrefix: { type: String, required: true },
  hsnCodes: { type: [String], default: [] },
});

UserProfileSchema.virtual('id').get(function() { return this._id.toHexString(); });
UserProfileSchema.set('toJSON', { virtuals: true });
UserProfileSchema.set('toObject', { virtuals: true });

export interface UserProfileDocument extends Omit<UserProfile, 'id'>, Document {}

const UserProfileModel = (models.UserProfile as Model<UserProfileDocument>) || mongoose.model<UserProfileDocument>('UserProfile', UserProfileSchema);

export default UserProfileModel;
