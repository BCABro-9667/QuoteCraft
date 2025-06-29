import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { Company } from '@/types';

// This interface includes userId which is used on the backend but not exposed to the client type.
interface ICompany extends Company {
  userId: mongoose.Types.ObjectId;
}

const CompanySchema = new Schema<ICompany>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  address: { type: String },
  location: { type: String },
  email: { type: String },
  phone: { type: String },
  contactPerson: { type: String },
  gstin: { type: String },
  remarks: { type: String },
});

// Create a virtual 'id' field that gets the string representation of '_id'
CompanySchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtuals are included in toJSON and toObject outputs
CompanySchema.set('toJSON', { virtuals: true });
CompanySchema.set('toObject', { virtuals: true });


export interface CompanyDocument extends Omit<ICompany, 'id'>, Document {}

const CompanyModel = (models.Company as Model<CompanyDocument>) || mongoose.model<CompanyDocument>('Company', CompanySchema);

export default CompanyModel;
