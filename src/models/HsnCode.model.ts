import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface IHsnCode extends Document {
  userId: mongoose.Types.ObjectId;
  code: string;
  id: string; // virtual
}

const HsnCodeSchema = new Schema<IHsnCode>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  code: { type: String, required: true },
});

// Add a compound index to prevent duplicate codes per user
HsnCodeSchema.index({ userId: 1, code: 1 }, { unique: true });

HsnCodeSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

HsnCodeSchema.set('toJSON', { virtuals: true });
HsnCodeSchema.set('toObject', { virtuals: true });

const HsnCodeModel = (models.HsnCode as Model<IHsnCode>) || mongoose.model<IHsnCode>('HsnCode', HsnCodeSchema);

export default HsnCodeModel;
