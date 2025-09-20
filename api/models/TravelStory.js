import mongoose from 'mongoose';

const TravelStorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    images: [{ type: String }],
    rating: { type: Number, min: 0, max: 5, default: 0 },
    tags: [{ type: String }],
    visitDate: { type: Date },
    durationDays: { type: Number, min: 0 },
    budgetRange: { type: String },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true, trim: true },
        createdAt: { type: Date, default: Date.now },
      }
    ],
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

TravelStorySchema.index({ destination: 1, createdAt: -1 });
// Text index limited to scalar string fields to avoid array issues
TravelStorySchema.index(
  { title: 'text', content: 'text' },
  { name: 'TextSearchIndex', weights: { title: 5, content: 3 } }
);
// Optional multikey index for filtering by tags
TravelStorySchema.index({ tags: 1 });

export default mongoose.model('TravelStory', TravelStorySchema);
