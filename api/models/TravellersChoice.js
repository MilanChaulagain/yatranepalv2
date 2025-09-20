import mongoose from 'mongoose';

const ChoiceItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String },
  description: { type: String },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  reviews: { type: Number, default: 0 },
  highlights: [{ type: String }],
  bestTime: { type: String },
  priceRange: { type: String },
  category: { type: String, enum: ['destination', 'experience', 'food', 'accommodation'], required: true },
  extra: { type: mongoose.Schema.Types.Mixed },
});

const TravellersChoiceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    items: [ChoiceItemSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('TravellersChoice', TravellersChoiceSchema);
