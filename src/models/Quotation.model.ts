import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { Quotation, Product } from '@/types';

// Backend-only interface for Quotation
interface IQuotation extends Quotation {
  userId: mongoose.Types.ObjectId;
}

const ProductSchema = new Schema<Product>({
    // `id` will be a virtual, `_id` is created automatically by mongoose
    srNo: { type: Number, required: true },
    name: { type: String, required: true },
    model: { type: String, required: true },
    hsn: { type: String, required: true },
    quantity: { type: Number, required: true },
    quantityType: { type: String, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
});

ProductSchema.virtual('id').get(function() { return this._id.toHexString(); });
ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

const QuotationSchema = new Schema<IQuotation>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  quotationNumber: { type: String, required: true },
  date: { type: String, required: true },
  companyId: { type: String, required: true }, // Keeping this as a string for simplicity
  products: [ProductSchema],
  grandTotal: { type: Number, required: true },
  termsAndConditions: { type: String },
  referencedBy: { type: String, required: true },
  createdBy: { type: String, required: true },
  progress: { type: String, required: true },
}, { timestamps: true });

QuotationSchema.virtual('id').get(function() { return this._id.toHexString(); });
QuotationSchema.set('toJSON', { virtuals: true });
QuotationSchema.set('toObject', { virtuals: true });


export interface QuotationDocument extends Omit<IQuotation, 'id'>, Document {}

const QuotationModel = (models.Quotation as Model<QuotationDocument>) || mongoose.model<QuotationDocument>('Quotation', QuotationSchema);

export default QuotationModel;
