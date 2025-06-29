import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { User } from '@/types';

const UserSchema = new Schema<User>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
}, { timestamps: true });

// Create a virtual 'id' field that gets the string representation of '_id'
UserSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtuals are included in toJSON and toObject outputs
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });


export interface UserDocument extends Omit<User, 'id'>, Document {}

const UserModel = (models.User as Model<UserDocument>) || mongoose.model<UserDocument>('User', UserSchema);

export default UserModel;
