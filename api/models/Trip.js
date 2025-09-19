import mongoose from "mongoose";

const ItineraryPlaceSchema = new mongoose.Schema(
  {
    place: { type: mongoose.Schema.Types.ObjectId, ref: "Place", required: true },
    startTime: { type: String },
    endTime: { type: String },
    travelMinutesFromPrev: { type: Number, default: 0 },
    distanceKmFromPrev: { type: Number, default: 0 },
    entranceFee: { type: Number, default: 0 },
    notes: { type: String },
  },
  { _id: false }
);

const ItineraryDaySchema = new mongoose.Schema(
  {
    date: { type: Date },
    items: [ItineraryPlaceSchema],
    totalTravelMinutes: { type: Number, default: 0 },
    totalEntranceFees: { type: Number, default: 0 },
  },
  { _id: false }
);

const TripSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    startLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: undefined },
    },
    budget: {
      total: { type: Number, default: 0 },
      currency: { type: String, default: "NPR" },
    },
    preferences: {
      pace: { type: String, enum: ["relaxed", "standard", "packed"], default: "standard" },
      interests: [{ type: String }],
      dailyStartHour: { type: Number, default: 9 },
      dailyEndHour: { type: Number, default: 18 },
    },
    lockedPlaceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Place" }],
    itinerary: [ItineraryDaySchema],
    places: [{ type: mongoose.Schema.Types.ObjectId, ref: "Place" }],
    totals: {
      totalCost: { type: Number, default: 0 },
      totalEntranceFees: { type: Number, default: 0 },
      totalTravelMinutes: { type: Number, default: 0 },
      days: { type: Number, default: 0 },
    },
    isCompleted: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

TripSchema.index({ userId: 1, createdAt: -1 });
TripSchema.index({ "startLocation": "2dsphere" });

export default mongoose.model("Trip", TripSchema);
